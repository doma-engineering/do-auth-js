export const main = async () => {
    window.sodium = {
        onload: (sodium) => {
            const maybePort = () => {
                if (window.location.port) {
                    return ':' + window.location.port
                } else {
                    return ''
                }
            };

            window.doauthor = {
                /* server: window.location.protocol + '//' + window.location.hostname + maybePort(), */
                server: "https://maja.doma.dev",
                saltSize: 16,
                hashSize: 32,
                keySize: 32,
                defaultParams: {
                    opsLimit: sodium.crypto_pwhash_OPSLIMIT_SENSITIVE,
                    memLimit: 5 * sodium.crypto_pwhash_MEMLIMIT_MIN
                },
            };

            window.doauthor.crypto = {};

            window.doauthor.crypto.show = (bs) => {
                return sodium.to_base64(bs, sodium.base64_variants["URLSAFE"]);
            }

            window.doauthor.crypto.read = (s) => {
                return sodium.from_base64(s, sodium.base64_variants["URLSAFE"]);
            }

            window.doauthor.crypto.slipConfig = () => {
                return {
                    ops: doauthor.defaultParams.opsLimit,
                    mem: doauthor.defaultParams.memLimit,
                    saltSize: doauthor.saltSize
                };
            }

            window.doauthor.crypto.mainKey = (pass) => {
                const slipMaybe = localStorage.getItem("slip");
                if (slipMaybe) {
                    return doauthor.crypto.mainKeyReproduce2(pass, JSON.parse(slipMaybe));
                } else {
                    let [mkey, slip] = doauthor.crypto.mainKeyInit2(pass, doauthor.crypto.slipConfig());
                    localStorage.setItem("slip", JSON.stringify(slip));
                    return mkey;
                }
            }

            window.doauthor.crypto.mainKeyInit2 = (pass, slipConfig) => {
                const slip1 = { ...slipConfig, salt: doauthor.crypto.show(sodium.randombytes_buf(slipConfig.saltSize)) };
                const mkey = doauthor.crypto.mainKeyReproduce2(pass, slip1);
                return [mkey, slip1];
            }

            window.doauthor.crypto.mainKeyReproduce2 = (pass, slip) => {
                let { ops, mem, salt } = slip;
                const mkey = sodium.crypto_pwhash(
                    doauthor.hashSize, // kinda hardcoded but ok
                    pass,
                    doauthor.crypto.read(salt),
                    ops,
                    mem,
                    sodium.crypto_pwhash_ALG_DEFAULT
                );
                return mkey;
            }

            window.doauthor.crypto.deriveSigningKeypair = (mkey, n) => {
                const mkd = sodium.crypto_kdf_derive_from_key(doauthor.keySize, n, "signsign", mkey);
                let { publicKey, privateKey } = sodium.crypto_sign_seed_keypair(mkd);
                doauthor.did.memorisePublicKey(publicKey);
                return { public: publicKey, secret: privateKey };
            }

            window.doauthor.crypto.sign = (msg, kp) => {
                return { public: kp.public, signature: sodium.crypto_sign_detached(msg, kp.secret) };
            }

            window.doauthor.crypto.verify = (msg, detached) => {
                return sodium.crypto_sign_verify_detached(detached.signature, msg, detached.public);
            }

            window.doauthor.crypto.bland_hash = (msg) => {
                return doauthor.crypto.show(sodium.crypto_generichash(doauthor.hashSize, msg));
            }

            window.doauthor.crypto.sign_map = (kp, the_map, overrides) => {
                if (typeof (overrides) === 'undefined') {
                    overrides = {};
                }

                const opts0 = {
                    "proofField": "proof",
                    "signatureField": "signature",
                    "keyField": "verificationMethod",
                    "keyFieldConstructor": (pk) => {
                        const pk64 = doauthor.crypto.show(pk);
                        /* const hash = doauthor.crypto.bland_hash(pk64);
                        return "did:doma:" + hash; */
                        return pk64;
                    },
                    "ignore": ["id"],
                };

                const opts = Object.assign({}, opts0, overrides);

                var mut_the_map = { ...the_map };

                opts["ignore"].reduce((acc, x) => {
                    delete mut_the_map[x];
                })

                const to_prove = { ...mut_the_map };

                const canonical_claim = doauthor.crypto.canonicalise(to_prove);
                const detached_signature = doauthor.crypto.sign(JSON.stringify(canonical_claim), kp);
                const did = opts["keyFieldConstructor"](kp["public"]);
                const issuer = did;
                const proof_map = doauthor.proof.from_signature(issuer, detached_signature["signature"]);
                var res = { ...the_map };
                res[opts["proofField"]] = proof_map;
                return res;
            }

            window.doauthor.crypto.verify_map = (verifiable_map, overrides) => {
                if (typeof (overrides) === 'undefined') {
                    overrides = {};
                }


                const opts0 = {
                    "proofField": "proof",
                    "signatureField": "signature",
                    "keyExtractor": (proof) => doauthor.did.fetchPublicKey(proof["verificationMethod"]),
                    "ignore": ["id"]
                };

                const opts = Object.assign({}, opts0, overrides);

                var mut_verifiable_map = { ...verifiable_map };

                const verifiable_canonical = doauthor.crypto.canonicalise(
                    (() => {
                        opts["ignore"].concat(opts["proofField"]).reduce((_acc, x) => { delete mut_verifiable_map[x]; })
                        return { ...mut_verifiable_map };
                    })()
                );

                var mut_proofs = [];

                var zoom_proofs = verifiable_map[opts["proofField"]];

                if (Array.isArray(zoom_proofs)) {
                    mut_proofs = [...zoom_proofs];
                } else { // In this case, by standard, we have a single proof.
                    mut_proofs = [zoom_proofs];
                }

                const proofs = [...mut_proofs];

                return proofs.reduce(async (acc, proof) => {
                    const pk = await opts["keyExtractor"](proof);
                    const sig = proof[opts["signatureField"]];
                    const reconstructed_detached_sig = {
                        "public": doauthor.crypto.read(pk),
                        "signature": doauthor.crypto.read(proof[opts["signatureField"]]),
                    };
                    const is_valid = doauthor.crypto.verify(JSON.stringify(verifiable_canonical), reconstructed_detached_sig);
                    return is_valid && acc;
                }, true);
            }

            /*
             * TODO:
             * console.log's are left in to show what the author
             * checked. They are NOT A SUFFICIENT EVIDENCE that this
             * function does what it's supposed to do and proper
             * invariant testing and audit are absolutely necessary to
             * run it in production.
             *
             * UPDATE (Aug 18th, 2021):
             * With more test coverage for simple cases, we have more evidence
             * that canonicalise works as intended, but we still need to attack
             * this function with as messed up test cases as possible and
             * compare it with reference implementation.
             */
            function _canonicalise(x) {
                // console.log("Canonicalising ", x)
                if (typeof (x) === "string" || typeof (x) === "number" || typeof (x) === "bigint") {
                    // console.log("It's just a value", x)
                    return x;
                } else if (typeof (x) === "object") {
                    if (Array.isArray(x) === true) {
                        return x.map(x => _canonicalise(x));
                    } else {
                        var ks = Object.keys(x);
                        const x1 = { ...x };
                        ks.sort();
                        var y = new Array();
                        for (let i = 0; i < ks.length; i++) {
                            // console.log("Got object, working on adding **", ks[i], "**, the", i, "th element of", ks)
                            y.push([ks[i], _canonicalise(x1[ks[i]], y)]);
                            // console.log("Accumulator so far:", [...y])
                        }
                        return y;
                    }
                }
            };

            window.doauthor.crypto.canonicalise = _canonicalise;

            window.doauthor.proof = {};

            window.doauthor.proof.from_signature64 = (issuer, sig64) => {
                return { "verificationMethod": issuer, "signature": sig64, "timestamp": doauthor.util.isoUtcNow() };
            }

            window.doauthor.proof.from_signature = (issuer, sig) => {
                return doauthor.proof.from_signature64(issuer, doauthor.crypto.show(sig));
            }

            window.doauthor.credential = {};

            window.doauthor.credential.from_claim = (kp, claim, misc) => {
                const tau0 = doauthor.util.isoUtcNow();
                const did = doauthor.did.from_pk(kp["public"]);
                const issuer = did;
                var cred_so_far = {
                    "@context": [],
                    "type": [],
                    "issuer": issuer,
                    "issuanceDate": tau0,
                    "credentialSubject": claim,
                }
                if (typeof (misc) === 'object') {
                    ["effectiveDate", "validFrom", "validUntil"].map((x) => {
                        if (!(x in cred_so_far) && (x in misc)) {
                            cred_so_far[x] = misc[x];
                        }
                    });
                    ["issuanceDate"].map((x) => {
                        if (x in misc) {
                            cred_so_far[x] = misc[x];
                        }
                    })
                }
                return doauthor.crypto.sign_map(kp, cred_so_far);
            }

            window.doauthor.credential.present_credential = (kp, cred, misc) => {
                var presentation_claim_so_far = {
                    "verifiableCredential": cred,
                    "issuer": doauthor.did.from_pk(kp["public"])
                };
                if (typeof misc === 'object') {
                    ["id", "holder", "credentialSubject"].map((x) => {
                        if (!(x in presentation_claim_so_far) && (x in misc)) {
                            presentation_claim_so_far[x] = misc[x];
                        }
                    });
                    ["issuanceDate"].map((x) => {
                        if (x in misc) {
                            presentation_claim_so_far[x] = misc[x];
                        }
                    });
                }
                return doauthor.crypto.sign_map(kp, presentation_claim_so_far);
            }

            window.doauthor.credential.proofless = (cred) => {
                ctxs = cred['@context'];
                let { type, issuer, issuanceDate, credentialSubject } = cred;
                return { '@context': ctxs, type: type, issuer: issuer, issuanceDate: issuanceDate, credentialSubject: credentialSubject };
            };

            window.doauthor.credential.prooflessJSON = (cred) => {
                return JSON.stringify(
                    doauthor.crypto.canonicalise(
                        doauthor.credential.proofless(cred)
                    )
                );
            };

            window.doauthor.credential.verify = (cred, pk) => {
                return doauthor.crypto.verify(
                    doauthor.credential.prooflessJSON(cred),
                    {
                        public: pk,
                        signature: doauthor.crypto.read(cred.proof.signature)
                    }
                );
            };

            window.doauthor.credential.verify64 = (cred, pk) => {
                return doauthor.credential.verify(cred, doauthor.crypto.read(pk));
            };

            window.doauthor.did = {};

            window.doauthor.did.from_pk = (pk) => {
                return doauthor.did.from_pk64(doauthor.crypto.show(pk));
            }

            window.doauthor.did.from_pk64 = (pk64) => {
                /* return "did:doma:" + doauthor.crypto.bland_hash(pk64); */
                return pk64;
            }

            window.doauthor.did.recallPublicKey = (did_str) => {
                return localStorage.getItem("pk|" + did_str);
            }

            window.doauthor.did.fetchPublicKey = async (did_str) => {
                var pk_by_did = doauthor.did.recallPublicKey(did_str);
                if (pk_by_did === null) {
                    const did_public_resp = await fetch(doauthor.server + "/did/public/" + did_str).then(resp => resp.json);
                    pk_by_did = did_public_resp["public"];
                    doauthor.did.memorisePublicKey64(pk_by_did);
                }
                return pk_by_did;
            }

            window.doauthor.did.memorisePublicKey64 = (pk64) => {
                return localStorage.setItem("pk|" + doauthor.did.from_pk64(pk64), pk64);
            }

            window.doauthor.did.memorisePublicKey = (pk) => {
                return doauthor.did.memorisePublicKey64(doauthor.crypto.show(pk));
            }

            window.doauthor.util = {};

            window.doauthor.util.prettyPrint = (x) => JSON.stringify(x, null, 2);

            window.doauthor.util.isoUtcNowOld = () => {
                var date = new Date();
                var isoDate = date.toISOString().slice(0, -5);
                return isoDate + "Z";
            }

            window.doauthor.util.isoUtcNow = () => {
                return (new Date()).toISOString();
            }

            window.__doauthorHasLoaded__ = true;
        }
    }
    return new Promise(observeMany(() => [window.__doauthorHasLoaded__]));
}

export const observePeriodMsec = 30;

export const observeMany = (varsF, timeLeft) => (resolveF, rejectF) => {
    //console.log("tick", varsF());
    var timeLeft1 = undefined;
    if (varsF().reduce((acc, v) => acc && v, true)) {
        return resolveF(varsF());
    }
    if (typeof timeLeft !== 'undefined') {
        if (timeLeft > 0) {
            return rejectF(new Error("Observer timed out"));
        } else {
            timeLeft1 = timeLeft - observePeriodMsec;
        }
    }
    return setTimeout(
        observeMany(varsF, timeLeft1).bind(this, resolveF, rejectF),
        observePeriodMsec
    );
}
