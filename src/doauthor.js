export const main = async () => {
    window.sodium = {
        onload: (sodium) => {
            maybePort = () => {
                if (window.location.port) {
                    return ':' + window.location.port
                } else {
                    return ''
                }
            };

            window.doAuth = {
                server: window.location.protocol + '//' + window.location.hostname + maybePort(),
                saltSize: 16,
                hashSize: 32,
                keySize: 32,
                defaultParams: {
                    opsLimit: sodium.crypto_pwhash_OPSLIMIT_SENSITIVE,
                    memLimit: 5 * sodium.crypto_pwhash_MEMLIMIT_MIN
                },
            };

            window.doAuth.crypto = {};

            window.doAuth.crypto.show = (bs) => {
                return sodium.to_base64(bs, sodium.base64_variants["URLSAFE"]);
            }

            window.doAuth.crypto.read = (s) => {
                return sodium.from_base64(s, sodium.base64_variants["URLSAFE"]);
            }

            window.doAuth.crypto.mainKey = (pass) => {
                slipMaybe = localStorage.getItem("slip");
                dp = doAuth.defaultParams;
                if (slipMaybe) {
                    return doAuth.crypto.mainKeyReproduce2(pass, JSON.parse(slipMaybe));
                } else {
                    [mkey, slip] = doAuth.crypto.mainKeyInit2(pass, {
                        ops: dp.opsLimit,
                        mem: dp.memLimit,
                        saltSize: doAuth.saltSize,
                    });
                    localStorage.setItem("slip", JSON.stringify(slip));
                    return mkey;
                }
            }

            window.doAuth.crypto.mainKeyInit2 = (pass, slipConfig) => {
                slip1 = { ...slipConfig, salt: doAuth.crypto.show(sodium.randombytes_buf(slipConfig.saltSize)) };
                mkey = doAuth.crypto.mainKeyReproduce2(pass, slip1);
                return [mkey, slip1];
            }

            window.doAuth.crypto.mainKeyReproduce2 = (pass, slip) => {
                let { ops, mem, saltSize, salt } = slip;
                mkey = sodium.crypto_pwhash(
                    doAuth.hashSize, // kinda hardcoded but ok
                    pass,
                    doAuth.crypto.read(salt),
                    ops,
                    mem,
                    sodium.crypto_pwhash_ALG_DEFAULT
                );
                return mkey;
            }

            window.doAuth.crypto.deriveSigningKeypair = (mkey, n) => {
                mkd = sodium.crypto_kdf_derive_from_key(doAuth.keySize, n, "signsign", mkey);
                let { publicKey, privateKey } = sodium.crypto_sign_seed_keypair(mkd);
                return { public: publicKey, secret: privateKey };
            }

            window.doAuth.crypto.sign = (msg, kp) => {
                return { public: kp.public, signature: sodium.crypto_sign_detached(msg, kp.secret) };
            }

            window.doAuth.crypto.verify = (msg, detached) => {
                //console.log(detached.public, detached.signature)
                return sodium.crypto_sign_verify_detached(detached.signature, msg, detached.public);
            }

            window.doAuth.crypto.bland_hash = (msg) => {
                return doAuth.crypto.show(sodium.crypto_generichash(doAuth.hashSize, msg));
            }

            /*
             * TODO:
             * console.log's are left in to show what the author
             * checked. They are NOT A SUFFICIENT EVIDENCE that this
             * function does what it's supposed to do and proper
             * invariant testing and audit are absolutely necessary to
             * run it in production.
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

            window.doAuth.crypto.canonicalise = _canonicalise;

            window.doAuth.credential = {};

            window.doAuth.credential.proofless = (cred) => {
                ctxs = cred['@context'];
                let { type, issuer, issuanceDate, credentialSubject } = cred;
                return { '@context': ctxs, type: type, issuer: issuer, issuanceDate: issuanceDate, credentialSubject: credentialSubject };
            };

            window.doAuth.credential.prooflessJSON = (cred) => {
                return JSON.stringify(
                    doAuth.crypto.canonicalise(
                        doAuth.credential.proofless(cred)
                    )
                );
            };

            window.doAuth.credential.verify = (cred, pk) => {
                return doAuth.crypto.verify(
                    doAuth.credential.prooflessJSON(cred),
                    {
                        public: pk,
                        signature: doAuth.crypto.read(cred.proof.signature)
                    }
                );
            };

            window.doAuth.credential.verify64 = (cred, pk) => {
                return doAuth.credential.verify(cred, doAuth.crypto.read(pk));
            };

            window.__doAuthHasLoaded__ = true;
        }
    }
    return new Promise(observeMany(() => [window.__doAuthHasLoaded__]));
}

export const observePeriodMsec = 30;

export const observeMany = (varsF, timeout) => (resolveF, rejectF) => {
    if (varsF().reduce((acc, v) => acc && v, false)) {
        return resolveF(maybeVars);
    } else if (timeout && timeout > 0) {
        return rejectF(new Error("Observer timed out"));
    } else {
        setTimeout(
            observeMany.bind(this, varsF, resolveF, rejectF, timeLeft - observePeriodMsec),
            observePeriodMsec
        );
    }
}
