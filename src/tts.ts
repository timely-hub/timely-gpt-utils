import { CacheKeyHelper } from "./cache-key-helper";

const spaceKey = CacheKeyHelper.keys.back.audit.space("1234");
const spaceTtl = CacheKeyHelper.keys.back.audit.space.ttl;
const haha = CacheKeyHelper.keys.back.audit.space.pattern();
console.log(spaceKey, spaceTtl, haha);
