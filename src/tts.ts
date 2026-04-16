import { CacheKeyHelper } from "./cache-key-helper";

const spaceKey = CacheKeyHelper.keys.back.audit.space("1234");
const spaceTtl = CacheKeyHelper.keys.back.audit.space.ttl;
console.log(spaceKey, spaceTtl);
