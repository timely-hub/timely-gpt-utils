"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_key_helper_1 = require("./cache-key-helper");
const spaceKey = cache_key_helper_1.CacheKeyHelper.keys.back.audit.space("1234");
const spaceTtl = cache_key_helper_1.CacheKeyHelper.keys.back.audit.space.ttl;
const haha = cache_key_helper_1.CacheKeyHelper.keys.back.audit.space.pattern();
console.log(spaceKey, spaceTtl, haha);
//# sourceMappingURL=tts.js.map