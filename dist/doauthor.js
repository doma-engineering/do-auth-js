/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
var DoAuthorBootstrapper;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/doauthor.js":
/*!*************************!*\
  !*** ./src/doauthor.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"main\": () => (/* binding */ main),\n/* harmony export */   \"observePeriodMsec\": () => (/* binding */ observePeriodMsec),\n/* harmony export */   \"observeMany\": () => (/* binding */ observeMany)\n/* harmony export */ });\nconst main = async () => {\n    window.sodium = {\n        onload: (sodium) => {\n            const maybePort = () => {\n                if (window.location.port) {\n                    return ':' + window.location.port\n                } else {\n                    return ''\n                }\n            };\n\n            window.doauthor = {\n                /* server: window.location.protocol + '//' + window.location.hostname + maybePort(), */\n                server: \"https://maja.doma.dev\",\n                saltSize: 16,\n                hashSize: 32,\n                keySize: 32,\n                defaultParams: {\n                    opsLimit: sodium.crypto_pwhash_OPSLIMIT_SENSITIVE,\n                    memLimit: 5 * sodium.crypto_pwhash_MEMLIMIT_MIN\n                },\n            };\n\n            window.doauthor.crypto = {};\n\n            window.doauthor.crypto.show = (bs) => {\n                return sodium.to_base64(bs, sodium.base64_variants[\"URLSAFE\"]);\n            }\n\n            window.doauthor.crypto.read = (s) => {\n                return sodium.from_base64(s, sodium.base64_variants[\"URLSAFE\"]);\n            }\n\n            window.doauthor.crypto.slipConfig = () => {\n                return {\n                    ops: doauthor.defaultParams.opsLimit,\n                    mem: doauthor.defaultParams.memLimit,\n                    saltSize: doauthor.saltSize\n                };\n            }\n\n            window.doauthor.crypto.mainKey = (pass) => {\n                const slipMaybe = localStorage.getItem(\"slip\");\n                if (slipMaybe) {\n                    return doauthor.crypto.mainKeyReproduce2(pass, JSON.parse(slipMaybe));\n                } else {\n                    let [mkey, slip] = doauthor.crypto.mainKeyInit2(pass, doauthor.crypto.slipConfig());\n                    localStorage.setItem(\"slip\", JSON.stringify(slip));\n                    return mkey;\n                }\n            }\n\n            window.doauthor.crypto.mainKeyInit2 = (pass, slipConfig) => {\n                const slip1 = { ...slipConfig, salt: doauthor.crypto.show(sodium.randombytes_buf(slipConfig.saltSize)) };\n                const mkey = doauthor.crypto.mainKeyReproduce2(pass, slip1);\n                return [mkey, slip1];\n            }\n\n            window.doauthor.crypto.mainKeyReproduce2 = (pass, slip) => {\n                let { ops, mem, salt } = slip;\n                const mkey = sodium.crypto_pwhash(\n                    doauthor.hashSize, // kinda hardcoded but ok\n                    pass,\n                    doauthor.crypto.read(salt),\n                    ops,\n                    mem,\n                    sodium.crypto_pwhash_ALG_DEFAULT\n                );\n                return mkey;\n            }\n\n            window.doauthor.crypto.deriveSigningKeypair = (mkey, n) => {\n                const mkd = sodium.crypto_kdf_derive_from_key(doauthor.keySize, n, \"signsign\", mkey);\n                let { publicKey, privateKey } = sodium.crypto_sign_seed_keypair(mkd);\n                doauthor.did.memorizePublicKey(doauthor.did.from_pk(publicKey), publicKey);\n                return { public: publicKey, secret: privateKey };\n            }\n\n            window.doauthor.crypto.sign = (msg, kp) => {\n                console.log(\"Signing\", msg, \"with\", kp)\n                return { public: kp.public, signature: sodium.crypto_sign_detached(msg, kp.secret) };\n            }\n\n            window.doauthor.crypto.verify = (msg, detached) => {\n                return sodium.crypto_sign_verify_detached(detached.signature, msg, detached.public);\n            }\n\n            window.doauthor.crypto.bland_hash = (msg) => {\n                return doauthor.crypto.show(sodium.crypto_generichash(doauthor.hashSize, msg));\n            }\n\n            window.doauthor.crypto.sign_map = (kp, the_map, overrides) => {\n                if (typeof (overrides) === 'undefined') {\n                    overrides = {};\n                }\n\n                const opts0 = {\n                    \"proofField\": \"proof\",\n                    \"signatureField\": \"signature\",\n                    \"keyField\": \"verificationMethod\",\n                    \"keyFieldConstructor\": (pk) => {\n                        const pk64 = doauthor.crypto.show(pk);\n                        const hash = doauthor.crypto.bland_hash(pk64);\n                        return \"did:doma:\" + hash;\n                    },\n                    \"ignore\": [\"id\"],\n                };\n\n                const opts = Object.assign({}, opts0, overrides);\n\n                var mut_the_map = { ...the_map };\n\n                opts[\"ignore\"].reduce((acc, x) => {\n                    delete mut_the_map[x];\n                })\n\n                const to_prove = { ...mut_the_map };\n\n                const canonical_claim = doauthor.crypto.canonicalise(to_prove);\n                const detached_signature = doauthor.crypto.sign(JSON.stringify(canonical_claim), kp);\n                const did = opts[\"keyFieldConstructor\"](kp[\"public\"]);\n                const issuer = did;\n                const proof_map = doauthor.proof.from_signature(issuer, detached_signature[\"signature\"]);\n                var res = { ...the_map };\n                res[opts[\"proofField\"]] = proof_map;\n                console.log(\"Signed\", JSON.stringify(canonical_claim));\n                return res;\n            }\n\n            window.doauthor.crypto.verify_map = (verifiable_map, overrides) => {\n                if (typeof (overrides) === 'undefined') {\n                    overrides = {};\n                }\n\n                console.log(\"Verifying\", verifiable_map, \"with overrides\", overrides);\n\n                const opts0 = {\n                    \"proofField\": \"proof\",\n                    \"signatureField\": \"signature\",\n                    \"keyExtractor\": (proof) => doauthor.did.fetchPublicKey(proof[\"verificationMethod\"]),\n                    \"ignore\": [\"id\"]\n                };\n\n                const opts = Object.assign({}, opts0, overrides);\n\n                var mut_verifiable_map = { ...verifiable_map };\n\n                const verifiable_canonical = doauthor.crypto.canonicalise(\n                    (() => {\n                        opts[\"ignore\"].concat(opts[\"proofField\"]).reduce((_acc, x) => { delete mut_verifiable_map[x]; })\n                        return { ...mut_verifiable_map };\n                    })()\n                );\n\n                var mut_proofs = [];\n\n                var zoom_proofs = verifiable_map[opts[\"proofField\"]];\n\n                if (Array.isArray(zoom_proofs)) {\n                    mut_proofs = [...zoom_proofs];\n                } else { // In this case, by standard, we have a single proof.\n                    mut_proofs = [zoom_proofs];\n                }\n\n                const proofs = [...mut_proofs];\n\n                return proofs.reduce(async (acc, proof) => {\n                    const pk = await opts[\"keyExtractor\"](proof);\n                    const sig = proof[opts[\"signatureField\"]];\n                    const reconstructed_detached_sig = {\n                        \"public\": doauthor.crypto.read(pk),\n                        \"signature\": doauthor.crypto.read(proof[opts[\"signatureField\"]]),\n                    };\n                    console.log(\"Sig is\", sig, \"ds\", reconstructed_detached_sig, \"msg\", JSON.stringify(verifiable_canonical));\n                    const is_valid = doauthor.crypto.verify(JSON.stringify(verifiable_canonical), reconstructed_detached_sig);\n                    return is_valid && acc;\n                }, true);\n            }\n\n            /*\n             * TODO:\n             * console.log's are left in to show what the author\n             * checked. They are NOT A SUFFICIENT EVIDENCE that this\n             * function does what it's supposed to do and proper\n             * invariant testing and audit are absolutely necessary to\n             * run it in production.\n             */\n            function _canonicalise(x) {\n                // console.log(\"Canonicalising \", x)\n                if (typeof (x) === \"string\" || typeof (x) === \"number\" || typeof (x) === \"bigint\") {\n                    // console.log(\"It's just a value\", x)\n                    return x;\n                } else if (typeof (x) === \"object\") {\n                    if (Array.isArray(x) === true) {\n                        return x.map(x => _canonicalise(x));\n                    } else {\n                        var ks = Object.keys(x);\n                        const x1 = { ...x };\n                        ks.sort();\n                        var y = new Array();\n                        for (let i = 0; i < ks.length; i++) {\n                            // console.log(\"Got object, working on adding **\", ks[i], \"**, the\", i, \"th element of\", ks)\n                            y.push([ks[i], _canonicalise(x1[ks[i]], y)]);\n                            // console.log(\"Accumulator so far:\", [...y])\n                        }\n                        return y;\n                    }\n                }\n            };\n\n            window.doauthor.crypto.canonicalise = _canonicalise;\n\n            window.doauthor.proof = {};\n\n            window.doauthor.proof.from_signature64 = (issuer, sig64) => {\n                return { \"verificationMethod\": issuer, \"signature\": sig64, \"timestamp\": doauthor.util.isoUtcNow() };\n            }\n\n            window.doauthor.proof.from_signature = (issuer, sig) => {\n                return doauthor.proof.from_signature64(issuer, doauthor.crypto.show(sig));\n            }\n\n            window.doauthor.credential = {};\n\n            window.doauthor.credential.proofless = (cred) => {\n                ctxs = cred['@context'];\n                let { type, issuer, issuanceDate, credentialSubject } = cred;\n                return { '@context': ctxs, type: type, issuer: issuer, issuanceDate: issuanceDate, credentialSubject: credentialSubject };\n            };\n\n            window.doauthor.credential.prooflessJSON = (cred) => {\n                return JSON.stringify(\n                    doauthor.crypto.canonicalise(\n                        doauthor.credential.proofless(cred)\n                    )\n                );\n            };\n\n            window.doauthor.credential.verify = (cred, pk) => {\n                return doauthor.crypto.verify(\n                    doauthor.credential.prooflessJSON(cred),\n                    {\n                        public: pk,\n                        signature: doauthor.crypto.read(cred.proof.signature)\n                    }\n                );\n            };\n\n            window.doauthor.credential.verify64 = (cred, pk) => {\n                return doauthor.credential.verify(cred, doauthor.crypto.read(pk));\n            };\n\n            window.doauthor.did = {};\n\n            window.doauthor.did.from_pk = (pk) => {\n                return doauthor.did.from_pk64(doauthor.crypto.show(pk));\n            }\n\n            window.doauthor.did.from_pk64 = (pk64) => {\n                return \"did:doma:\" + doauthor.crypto.bland_hash(pk64);\n            }\n\n            window.doauthor.did.recallPublicKey = (did_str) => {\n                return localStorage.getItem(\"pk|\" + did_str);\n            }\n\n            window.doauthor.did.fetchPublicKey = async (did_str) => {\n                var pk_by_did = doauthor.did.recallPublicKey(did_str);\n                if (pk_by_did === null) {\n                    const did_public_resp = await fetch(doauthor.server + \"/did/public/\" + did_str).then(resp => resp.json);\n                    pk_by_did = did_public_resp[\"public\"];\n                    doauthor.did.memorizePublicKey64(did_str, pk_by_did);\n                }\n                return pk_by_did;\n            }\n\n            window.doauthor.did.memorizePublicKey64 = (did_str, pk64) => {\n                console.log(\"Storing\", pk64, \"under\", did_str);\n                return localStorage.setItem(\"pk|\" + did_str, pk64);\n            }\n\n            window.doauthor.did.memorizePublicKey = (did_str, pk) => {\n                console.log(\"Memorizing PK\");\n                return doauthor.did.memorizePublicKey64(did_str, doauthor.crypto.show(pk));\n            }\n\n            window.doauthor.util = {};\n\n            window.doauthor.util.prettyPrint = (x) => JSON.stringify(x, null, 2);\n\n            window.doauthor.util.isoUtcNow = () => {\n                var date = new Date();\n                var isoDate = date.toISOString().slice(0, -5);\n                return isoDate + \"Z\";\n            }\n\n            window.__doauthorHasLoaded__ = true;\n        }\n    }\n    return new Promise(observeMany(() => [window.__doauthorHasLoaded__]));\n}\n\nconst observePeriodMsec = 30;\n\nconst observeMany = (varsF, timeLeft) => (resolveF, rejectF) => {\n    //console.log(\"tick\", varsF());\n    var timeLeft1 = undefined;\n    if (varsF().reduce((acc, v) => acc && v, true)) {\n        return resolveF(varsF());\n    }\n    if (typeof timeLeft !== 'undefined') {\n        if (timeLeft > 0) {\n            return rejectF(new Error(\"Observer timed out\"));\n        } else {\n            timeLeft1 = timeLeft - observePeriodMsec;\n        }\n    }\n    return setTimeout(\n        observeMany(varsF, timeLeft1).bind(undefined, resolveF, rejectF),\n        observePeriodMsec\n    );\n}\n\n\n//# sourceURL=webpack://DoAuthorBootstrapper/./src/doauthor.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/doauthor.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	DoAuthorBootstrapper = __webpack_exports__;
/******/ 	
/******/ })()
;