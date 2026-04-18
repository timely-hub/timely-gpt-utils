# CacheKeyHelper / CacheKeys

MSA 서비스 간 Redis 캐시를 일관성 있게 공유하기 위한 캐시 키 중앙 관리 시스템.  
모든 캐시 키는 `CacheKeys`에서 정의되며, `defineKey`로 TTL 타입 추론 + 패턴 생성 + invalidate를 한 번에 제공한다.

---

## 키 네이밍 컨벤션

```
{server}:{domain}:{action}:{identifier}
```

예시: `back:space:detail:space-123`, `chat:price_config:SPACE:space-123`

---

## defineKey

`CacheKeys`의 각 키는 `defineKey(fn, ttl)`로 정의된다.

```ts
defineKey(
  (spaceId: string) => `back:audit:space:${spaceId}`,
  600  // TTL(초). null이면 만료 없음
)
```

반환된 함수에는 세 가지 프로퍼티가 붙는다:

| 프로퍼티 | 설명 |
|---|---|
| `.ttl` | TTL 값. `number`이면 setex용, `null`이면 만료 없는 set용 |
| `.pattern(...args?)` | 인자를 생략하면 `*`로 대체해 Redis 검색 패턴 반환 |
| `.invalidate(redis, ...args?)` | 패턴에 `*`가 포함되면 `keys`+`del`, 아니면 바로 `del` |

### TTL 분기 예시

```ts
const key = CacheKeys.back.space.detail;

if (key.ttl !== null) {
  await redis.setex(key(spaceId), key.ttl, value); // key.ttl: number
} else {
  await redis.set(key(spaceId), value);            // key.ttl: null
}
```

TTL이 `null`로 정의된 키는 `.ttl`의 타입이 `null`로, `number`로 정의된 키는 `number`로 추론된다.

---

## CacheKeys 구조

### back (백엔드 서버)

| 키 | TTL | 설명 |
|---|---|---|
| `back.space.simpleList` | 3600s | 스페이스 목록 |
| `back.space.detail(id)` | 300s | 스페이스 상세 |
| `back.space.domain(domain)` | 무제한 | 도메인→스페이스 매핑 |
| `back.space.host(host)` | 무제한 | 호스트→스페이스 매핑 |
| `back.space.canCreate(userId)` | 600s | 스페이스 생성 가능 여부 |
| `back.space.lockUpdateAllSpaceMembersDefaultModel(id)` | 600s | 분산 락 |
| `back.space.lockToggleMemberNickname(id)` | 300s | 분산 락 |
| `back.prompt.view(userId, promptId)` | 86400s | 프롬프트 조회 기록 |
| `back.bookmark.groupView(userId, bookmarkId)` | 86400s | 북마크 조회 기록 |
| `back.lock.cron(jobName)` | 600s | Cron 분산 락 |
| `back.auth.apiKey(apiKey, spaceId)` | 900s | API 키 인증 |
| `back.spaceMember.status(spaceMemberId)` | 120s | 멤버 상태 |
| `back.spaceMember.details(spaceMemberId)` | 600s | 멤버 상세 |
| `back.spaceMember.usage(spaceMemberId)` | 600s | 멤버 사용량 |
| `back.audit.space(spaceId)` | 600s | 스페이스 감사 로그 |
| `back.audit.user(userId, spaceId?)` | 600s | 유저 감사 로그 |

### chat (채팅 서버)

| 키 | TTL | 설명 |
|---|---|---|
| `chat.priceConfig.byType(type, id)` | 60s | 가격 정책 |
| `chat.exchangeRate.usdKrw` | 600s | USD/KRW 환율 |
| `chat.models.provider` | 무제한 | LLM 프로바이더 정보 |
| `chat.models.metadata` | 무제한 | LLM 모델 메타데이터 |
| `chat.models.pricing` | 무제한 | LLM 모델 가격 |
| `chat.model.info(target)` | 무제한 | LLM 모델 개별 정보 |
| `chat.memory.session(chatId, keyname)` | 900s | 채팅 세션 메모리 |
| `chat.idempotent.key(key)` | 가변 | 스트리밍 멱등성 키 |
| `chat.connector.authConfigs` | 무제한 | MCP 커넥터 인증 설정 |
| `chat.monthAggregator.lock(lockName)` | 무제한 | 월 집계 분산 락 |

---

## 기본 사용

### 키 생성 및 set

```ts
import { CacheKeys } from "timely-gpt-utils";

const key = CacheKeys.back.space.detail("space-123");
// "back:space:detail:space-123"

const { ttl } = CacheKeys.back.space.detail;
// ttl: number (300)
```

### 패턴으로 검색

```ts
// 특정 스페이스의 detail 키 패턴
CacheKeys.back.space.detail.pattern("space-123");
// "back:space:detail:space-123"

// 모든 space detail 패턴
CacheKeys.back.space.detail.pattern();
// "back:space:detail:*"
```

### invalidate

```ts
// 특정 스페이스 detail 캐시 삭제
await CacheKeys.back.space.detail.invalidate(redis, "space-123");

// 모든 space detail 캐시 삭제 (keys + del)
await CacheKeys.back.space.detail.invalidate(redis);

// 감사 로그 - 특정 유저의 특정 스페이스만 삭제
await CacheKeys.back.audit.user.invalidate(redis, "user-456", "space-123");

// 감사 로그 - 특정 유저 전체 삭제
await CacheKeys.back.audit.user.invalidate(redis, "user-456");
```

`invalidate`가 받는 redis 인터페이스는 `keys(pattern)`과 `del(...keys)`만 있으면 된다:

```ts
interface RedisClient {
  keys(pattern: string): Promise<string[]>;
  del(...keys: string[]): Promise<any>;
}
```

---

## CacheKeyHelper 정적 메서드

`CacheKeyHelper`는 `CacheKeys`를 프로그래매틱하게 탐색할 때 사용한다.

### `getAllKeyPaths(): string[]`

모든 키의 점 표기 경로 목록을 반환.

```ts
CacheKeyHelper.getAllKeyPaths();
// ["back.space.simpleList", "back.space.detail", ..., "chat.monthAggregator.lock"]
```

### `getKeyFunction(path: string): Function`

경로 문자열로 키 생성 함수를 가져온다.

```ts
const fn = CacheKeyHelper.getKeyFunction("back.audit.space");
fn("space-123"); // "back:audit:space:space-123"
```

### `getCategoryPattern(server, category?): string`

서버/카테고리 단위의 Redis 와일드카드 패턴.

```ts
CacheKeyHelper.getCategoryPattern("back");            // "back:*"
CacheKeyHelper.getCategoryPattern("chat", "priceConfig"); // "chat:priceConfig:*"
```

### `getIdPatterns(id: string): string[]`

특정 ID가 포함된 모든 가능한 위치의 패턴을 반환. 유저/스페이스 탈퇴 시 관련 캐시 전체 무효화에 사용.

```ts
CacheKeyHelper.getIdPatterns("user-456");
// ["back:*:user-456", "back:*:user-456:*", ..., "chat:*:*:*:user-456:*"]
```

### `getAllCategories(server): string[]`

서버의 카테고리 목록.

```ts
CacheKeyHelper.getAllCategories("back");
// ["space", "prompt", "bookmark", "lock", "auth", "spaceMember", "audit"]
```

### `getCategoryKeyTypes(server, category): string[]`

특정 카테고리의 키 타입 목록.

```ts
CacheKeyHelper.getCategoryKeyTypes("back", "space");
// ["simpleList", "detail", "domain", "host", "canCreate", ...]
```

---

## 새 캐시 키 추가

`src/cache-keys.ts`의 `CacheKeys` 객체에 `defineKey`로 추가.

```ts
export const CacheKeys = {
  back: {
    something: {
      // TTL 있는 키
      detail: defineKey(
        (id: string) => `back:something:detail:${id}`,
        300,
      ),
      // TTL 없는 키 (영구 저장)
      config: defineKey(
        () => `back:something:config`,
        null,
      ),
    },
  },
};
```
