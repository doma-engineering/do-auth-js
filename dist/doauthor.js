var DoAuthor;(()=>{"use strict";var o={d:(r,t)=>{for(var e in t)o.o(t,e)&&!o.o(r,e)&&Object.defineProperty(r,e,{enumerable:!0,get:t[e]})},o:(o,r)=>Object.prototype.hasOwnProperty.call(o,r),r:o=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(o,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(o,"__esModule",{value:!0})}},r={};o.r(r),o.d(r,{require:()=>t,observePeriodMsec:()=>i,observeMany:()=>a});const t=async()=>window.hasOwnProperty("__doauthorHasLoaded__")?"Welcome to DoAuth":(await a((()=>window.hasOwnProperty("sodium")&&window.sodium.hasOwnProperty("SODIUM_LIBRARY_VERSION_MAJOR")?[!0]:[void 0]),5e3),e(),window.__doauthorHasLoaded__=!0,"Sodium has loaded!"),e=()=>{window.doauthor={server:"https://maja.doma.dev",saltSize:16,hashSize:32,keySize:32,defaultParams:{opsLimit:sodium.crypto_pwhash_OPSLIMIT_SENSITIVE,memLimit:5*sodium.crypto_pwhash_MEMLIMIT_MIN}},window.doauthor.crypto={},window.doauthor.crypto.show=o=>sodium.to_base64(o,sodium.base64_variants.URLSAFE),window.doauthor.crypto.read=o=>sodium.from_base64(o,sodium.base64_variants.URLSAFE),window.doauthor.crypto.slipConfig=()=>({ops:doauthor.defaultParams.opsLimit,mem:doauthor.defaultParams.memLimit,saltSize:doauthor.saltSize}),window.doauthor.crypto.mainKey=o=>{const r=localStorage.getItem("slip");if(r)return doauthor.crypto.mainKeyReproduce2(o,JSON.parse(r));{let[r,t]=doauthor.crypto.mainKeyInit2(o,doauthor.crypto.slipConfig());return localStorage.setItem("slip",JSON.stringify(t)),r}},window.doauthor.crypto.mainKeyInit2=(o,r)=>{const t={...r,salt:doauthor.crypto.show(sodium.randombytes_buf(r.saltSize))};return[doauthor.crypto.mainKeyReproduce2(o,t),t]},window.doauthor.crypto.mainKeyReproduce2=(o,r)=>{let{ops:t,mem:e,salt:i}=r;return sodium.crypto_pwhash(doauthor.hashSize,o,doauthor.crypto.read(i),t,e,sodium.crypto_pwhash_ALG_DEFAULT)},window.doauthor.crypto.deriveSigningKeypair=(o,r)=>{const t=sodium.crypto_kdf_derive_from_key(doauthor.keySize,r,"signsign",o);let{publicKey:e,privateKey:i}=sodium.crypto_sign_seed_keypair(t);return doauthor.did.memorisePublicKey(e),{public:e,secret:i}},window.doauthor.crypto.sign=(o,r)=>({public:r.public,signature:sodium.crypto_sign_detached(o,r.secret)}),window.doauthor.crypto.verify=(o,r)=>sodium.crypto_sign_verify_detached(r.signature,o,r.public),window.doauthor.crypto.bland_hash=o=>doauthor.crypto.show(sodium.crypto_generichash(doauthor.hashSize,o)),window.doauthor.crypto.sign_map=(o,r,t)=>{void 0===t&&(t={});const e={proofField:"proof",signatureField:"signature",keyField:"verificationMethod",keyFieldConstructor:o=>doauthor.crypto.show(o),ignore:["id"]},i=Object.assign({},e,t);var a={...r};i.ignore.reduce(((o,r)=>{delete a[r]}));const d={...a},u=doauthor.crypto.canonicalise(d),n=doauthor.crypto.sign(JSON.stringify(u),o),s=i.keyFieldConstructor(o.public),c=doauthor.proof.from_signature(s,n.signature);var p={...r};return p[i.proofField]=c,p},window.doauthor.crypto.verify_map=(o,r)=>{void 0===r&&(r={});const t={proofField:"proof",signatureField:"signature",keyExtractor:o=>doauthor.did.fetchPublicKey(o.verificationMethod),ignore:["id"]},e=Object.assign({},t,r);var i={...o};const a=doauthor.crypto.canonicalise((e.ignore.concat(e.proofField).reduce(((o,r)=>{delete i[r]})),{...i}));var d,u=o[e.proofField];return d=Array.isArray(u)?[...u]:[u],[...d].reduce((async(o,r)=>{const t=await e.keyExtractor(r),i=(r[e.signatureField],{public:doauthor.crypto.read(t),signature:doauthor.crypto.read(r[e.signatureField])});return doauthor.crypto.verify(JSON.stringify(a),i)&&o}),!0)},window.doauthor.crypto.canonicalise=function o(r){if("string"==typeof r||"number"==typeof r||"bigint"==typeof r)return r;if("object"==typeof r){if(!0===Array.isArray(r))return r.map((r=>o(r)));{var t=Object.keys(r);const i={...r};t.sort();var e=new Array;for(let r=0;r<t.length;r++)e.push([t[r],o(i[t[r]])]);return e}}},window.doauthor.proof={},window.doauthor.proof.from_signature64=(o,r)=>({verificationMethod:o,signature:r,timestamp:doauthor.util.isoUtcNow()}),window.doauthor.proof.from_signature=(o,r)=>doauthor.proof.from_signature64(o,doauthor.crypto.show(r)),window.doauthor.credential={},window.doauthor.credential.from_claim=(o,r,t)=>{const e=doauthor.util.isoUtcNow();var i={"@context":[],type:[],issuer:doauthor.did.from_pk(o.public),issuanceDate:e,credentialSubject:r};return"object"==typeof t&&(["effectiveDate","validFrom","validUntil"].map((o=>{!(o in i)&&o in t&&(i[o]=t[o])})),["issuanceDate"].map((o=>{o in t&&(i[o]=t[o])}))),doauthor.crypto.sign_map(o,i)},window.doauthor.credential.present_credential=(o,r,t)=>{var e={verifiableCredential:r,issuer:doauthor.did.from_pk(o.public)};return"object"==typeof t&&(["id","holder","credentialSubject"].map((o=>{!(o in e)&&o in t&&(e[o]=t[o])})),["issuanceDate"].map((o=>{o in t&&(e[o]=t[o])}))),doauthor.crypto.sign_map(o,e)},window.doauthor.credential.proofless=o=>{ctxs=o["@context"];let{type:r,issuer:t,issuanceDate:e,credentialSubject:i}=o;return{"@context":ctxs,type:r,issuer:t,issuanceDate:e,credentialSubject:i}},window.doauthor.credential.prooflessJSON=o=>JSON.stringify(doauthor.crypto.canonicalise(doauthor.credential.proofless(o))),window.doauthor.credential.verify=(o,r)=>doauthor.crypto.verify(doauthor.credential.prooflessJSON(o),{public:r,signature:doauthor.crypto.read(o.proof.signature)}),window.doauthor.credential.verify64=(o,r)=>doauthor.credential.verify(o,doauthor.crypto.read(r)),window.doauthor.did={},window.doauthor.did.from_pk=o=>doauthor.did.from_pk64(doauthor.crypto.show(o)),window.doauthor.did.from_pk64=o=>o,window.doauthor.did.recallPublicKey=o=>localStorage.getItem("pk|"+o),window.doauthor.did.fetchPublicKey=async o=>{var r=doauthor.did.recallPublicKey(o);return null===r&&(r=(await fetch(doauthor.server+"/did/public/"+o).then((o=>o.json))).public,doauthor.did.memorisePublicKey64(r)),r},window.doauthor.did.memorisePublicKey64=o=>localStorage.setItem("pk|"+doauthor.did.from_pk64(o),o),window.doauthor.did.memorisePublicKey=o=>doauthor.did.memorisePublicKey64(doauthor.crypto.show(o)),window.doauthor.util={},window.doauthor.util.prettyPrint=o=>JSON.stringify(o,null,2),window.doauthor.util.isoUtcNowOld=()=>(new Date).toISOString().slice(0,-5)+"Z",window.doauthor.util.isoUtcNow=()=>(new Date).toISOString(),window.__doauthorHasLoaded__=!0},i=30,a=async(o,r)=>{var t=void 0;if(o().reduce(((o,r)=>o&&r),!0))return o();if(void 0!==r){if(r<0)throw new Error("Observer timed out");t=r-i}return await new Promise((o=>{setTimeout(o,i)})),await a(o,t)};DoAuthor=r})();