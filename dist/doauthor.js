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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"main\": () => (/* binding */ main),\n/* harmony export */   \"observePeriodMsec\": () => (/* binding */ observePeriodMsec),\n/* harmony export */   \"observeMany\": () => (/* binding */ observeMany)\n/* harmony export */ });\nconst main = async () => {\n    window.sodium = {\n        onload: (sodium) => {\n            const maybePort = () => {\n                if (window.location.port) {\n                    return ':' + window.location.port\n                } else {\n                    return ''\n                }\n            };\n\n            window.doauthor = {\n                server: window.location.protocol + '//' + window.location.hostname + maybePort(),\n                saltSize: 16,\n                hashSize: 32,\n                keySize: 32,\n                defaultParams: {\n                    opsLimit: sodium.crypto_pwhash_OPSLIMIT_SENSITIVE,\n                    memLimit: 5 * sodium.crypto_pwhash_MEMLIMIT_MIN\n                },\n            };\n\n            window.doauthor.crypto = {};\n\n            window.doauthor.crypto.show = (bs) => {\n                return sodium.to_base64(bs, sodium.base64_variants[\"URLSAFE\"]);\n            }\n\n            window.doauthor.crypto.read = (s) => {\n                return sodium.from_base64(s, sodium.base64_variants[\"URLSAFE\"]);\n            }\n\n            window.doauthor.crypto.slipConfig = () => {\n                return {\n                    ops: doauthor.defaultParams.opsLimit,\n                    mem: doauthor.defaultParams.memLimit,\n                    saltSize: doauthor.saltSize\n                };\n            }\n\n            window.doauthor.crypto.mainKey = (pass) => {\n                const slipMaybe = localStorage.getItem(\"slip\");\n                if (slipMaybe) {\n                    return doauthor.crypto.mainKeyReproduce2(pass, JSON.parse(slipMaybe));\n                } else {\n                    let [mkey, slip] = doauthor.crypto.mainKeyInit2(pass, doauthor.crypto.slipConfig());\n                    localStorage.setItem(\"slip\", JSON.stringify(slip));\n                    return mkey;\n                }\n            }\n\n            window.doauthor.crypto.mainKeyInit2 = (pass, slipConfig) => {\n                const slip1 = { ...slipConfig, salt: doauthor.crypto.show(sodium.randombytes_buf(slipConfig.saltSize)) };\n                const mkey = doauthor.crypto.mainKeyReproduce2(pass, slip1);\n                return [mkey, slip1];\n            }\n\n            window.doauthor.crypto.mainKeyReproduce2 = (pass, slip) => {\n                let { ops, mem, salt } = slip;\n                const mkey = sodium.crypto_pwhash(\n                    doauthor.hashSize, // kinda hardcoded but ok\n                    pass,\n                    doauthor.crypto.read(salt),\n                    ops,\n                    mem,\n                    sodium.crypto_pwhash_ALG_DEFAULT\n                );\n                return mkey;\n            }\n\n            window.doauthor.crypto.deriveSigningKeypair = (mkey, n) => {\n                const mkd = sodium.crypto_kdf_derive_from_key(doauthor.keySize, n, \"signsign\", mkey);\n                let { publicKey, privateKey } = sodium.crypto_sign_seed_keypair(mkd);\n                return { public: publicKey, secret: privateKey };\n            }\n\n            window.doauthor.crypto.sign = (msg, kp) => {\n                return { public: kp.public, signature: sodium.crypto_sign_detached(msg, kp.secret) };\n            }\n\n            window.doauthor.crypto.verify = (msg, detached) => {\n                return sodium.crypto_sign_verify_detached(detached.signature, msg, detached.public);\n            }\n\n            window.doauthor.crypto.bland_hash = (msg) => {\n                return doauthor.crypto.show(sodium.crypto_generichash(doauthor.hashSize, msg));\n            }\n\n            /*\n             * TODO:\n             * console.log's are left in to show what the author\n             * checked. They are NOT A SUFFICIENT EVIDENCE that this\n             * function does what it's supposed to do and proper\n             * invariant testing and audit are absolutely necessary to\n             * run it in production.\n             */\n            function _canonicalise(x) {\n                // console.log(\"Canonicalising \", x)\n                if (typeof (x) === \"string\" || typeof (x) === \"number\" || typeof (x) === \"bigint\") {\n                    // console.log(\"It's just a value\", x)\n                    return x;\n                } else if (typeof (x) === \"object\") {\n                    if (Array.isArray(x) === true) {\n                        return x.map(x => _canonicalise(x));\n                    } else {\n                        var ks = Object.keys(x);\n                        const x1 = { ...x };\n                        ks.sort();\n                        var y = new Array();\n                        for (let i = 0; i < ks.length; i++) {\n                            // console.log(\"Got object, working on adding **\", ks[i], \"**, the\", i, \"th element of\", ks)\n                            y.push([ks[i], _canonicalise(x1[ks[i]], y)]);\n                            // console.log(\"Accumulator so far:\", [...y])\n                        }\n                        return y;\n                    }\n                }\n            };\n\n            window.doauthor.crypto.canonicalise = _canonicalise;\n\n            window.doauthor.credential = {};\n\n            window.doauthor.credential.proofless = (cred) => {\n                ctxs = cred['@context'];\n                let { type, issuer, issuanceDate, credentialSubject } = cred;\n                return { '@context': ctxs, type: type, issuer: issuer, issuanceDate: issuanceDate, credentialSubject: credentialSubject };\n            };\n\n            window.doauthor.credential.prooflessJSON = (cred) => {\n                return JSON.stringify(\n                    doauthor.crypto.canonicalise(\n                        doauthor.credential.proofless(cred)\n                    )\n                );\n            };\n\n            window.doauthor.credential.verify = (cred, pk) => {\n                return doauthor.crypto.verify(\n                    doauthor.credential.prooflessJSON(cred),\n                    {\n                        public: pk,\n                        signature: doauthor.crypto.read(cred.proof.signature)\n                    }\n                );\n            };\n\n            window.doauthor.credential.verify64 = (cred, pk) => {\n                return doauthor.credential.verify(cred, doauthor.crypto.read(pk));\n            };\n\n            window.doauthor.util = {};\n\n            window.doauthor.util.prettyPrint = (x) => JSON.stringify(x, null, 2);\n\n            window.__doauthorHasLoaded__ = true;\n        }\n    }\n    return new Promise(observeMany(() => [window.__doauthorHasLoaded__]));\n}\n\nconst observePeriodMsec = 30;\n\nconst observeMany = (varsF, timeLeft) => (resolveF, rejectF) => {\n    //console.log(\"tick\", varsF());\n    var timeLeft1 = undefined;\n    if (varsF().reduce((acc, v) => acc && v, true)) {\n        return resolveF(varsF());\n    }\n    if (typeof timeLeft !== 'undefined') {\n        if (timeLeft > 0) {\n            return rejectF(new Error(\"Observer timed out\"));\n        } else {\n            timeLeft1 = timeLeft - observePeriodMsec;\n        }\n    }\n    return setTimeout(\n        observeMany(varsF, timeLeft1).bind(undefined, resolveF, rejectF),\n        observePeriodMsec\n    );\n}\n\n\n//# sourceURL=webpack://DoAuthorBootstrapper/./src/doauthor.js?");

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