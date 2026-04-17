/**
 * Redis 캐시 키 관리
 *
 * 모든 캐시 키는 이 파일에서 중앙 집중식으로 관리합니다.
 * 키 네이밍 컨벤션: {서버}:{도메인}:{동작}:{식별자}
 *
 * 각 키 함수에 .ttl 프로퍼티로 TTL(초) 접근 가능. null은 TTL 없음 또는 가변.
 */

type OptionalTuple<T extends unknown[]> = T extends [infer Head, ...infer Rest]
  ? [Head?, ...OptionalTuple<Rest>]
  : [];

export interface RedisClient {
  keys(pattern: string): Promise<string[]>;
  del(...keys: string[]): Promise<any>;
}

function defineKey<TArgs extends any[], TTL extends number | null>(
  fn: (...args: TArgs) => string,
  ttl: TTL,
): ((...args: TArgs) => string) & {
  ttl: TTL;
  pattern: (...args: OptionalTuple<TArgs>) => string;
  invalidate: (
    redis: RedisClient,
    ...args: OptionalTuple<TArgs>
  ) => Promise<void>;
} {
  const pattern = (...args: any[]): string => {
    const length = Math.max(fn.length, args.length);
    const finalArgs = Array.from({ length }, (_, i) =>
      args[i] === undefined ? "*" : args[i],
    );
    return fn(...(finalArgs as unknown as TArgs));
  };
  const invalidate = async (
    redis: RedisClient,
    ...args: any[]
  ): Promise<void> => {
    const p = pattern(...args);
    if (p.includes("*")) {
      const keys = await redis.keys(p);
      if (keys.length) await redis.del(...keys);
    } else {
      await redis.del(p);
    }
  };
  return Object.assign(fn, { ttl, pattern, invalidate });
}

export const CacheKeys = {
  // === Back Server 관련 ===
  back: {
    // === Space 관련 ===
    space: {
      simpleList: defineKey(() => `back:space:simple_list`, 3600),
      detail: defineKey((id: string) => `back:space:detail:${id}`, 300),
      domain: defineKey(
        (domain: string) => `back:space:domain:${domain}`,
        null,
      ),
      host: defineKey((host: string) => `back:space:host:${host}`, null),
      canCreate: defineKey(
        (userId: string) => `back:space:can_create:${userId}`,
        600,
      ),
      lockUpdateAllSpaceMembersDefaultModel: defineKey(
        (id: string) =>
          `back:space:lock_update_all_space_members_default_model:${id}`,
        600,
      ),
      lockToggleMemberNickname: defineKey(
        (id: string) => `back:space:lock_toggle_member_nickname:${id}`,
        300,
      ),
    },

    // === Prompt 관련 ===
    prompt: {
      view: defineKey(
        (userId: string, promptId: string) =>
          `back:prompt_view:${userId}:${promptId}`,
        86400,
      ),
    },

    // === Bookmark 관련 ===
    bookmark: {
      groupView: defineKey(
        (userId: string, bookmarkId: string) =>
          `back:space_group_bookmark_view:${userId}:${bookmarkId}`,
        86400,
      ),
    },

    // === Cron Lock ===
    lock: {
      cron: defineKey((jobName: string) => `back:lock:cron:${jobName}`, 600),
    },

    // === Auth 관련 ===
    auth: {
      apiKey: defineKey(
        (apiKey: string, spaceId: string) =>
          `back:auth:api_key:${spaceId}:${apiKey}`,
        900,
      ),
    },

    // === SpaceMember 관련 ===
    spaceMember: {
      status: defineKey(
        (spaceMemberId: string) => `back:space-member:status:${spaceMemberId}`,
        120,
      ),
      details: defineKey(
        (spaceMemberId: string) => `back:space-member:details:${spaceMemberId}`,
        600,
      ),
      usage: defineKey(
        (spaceMemberId: string) => `back:space-member:usage:${spaceMemberId}`,
        600,
      ),
    },

    // === Audit 관련 ===
    audit: {
      space: defineKey((spaceId: string) => `back:audit:space:${spaceId}`, 600),
      user: defineKey(
        (userId: string, spaceId?: string) =>
          spaceId
            ? `back:audit:user:${userId}:${spaceId}`
            : `back:audit:user:${userId}`,
        600,
      ),
    },
  },

  // === Chat Server 관련 ===
  chat: {
    // auth.guard.ts - 스페이스별 가격 규정
    priceConfig: {
      byType: defineKey(
        (type: "USER" | "SPACE" | "GROUP" | "ORGANIZATION", id: string) =>
          `chat:price_config:${type}:${id}`,
        60,
      ),
    },
    // exchange-rate.service.ts - 환율 정보
    exchangeRate: {
      usdKrw: defineKey(() => `chat:exchange_rate:usd_krw`, 600),
    },
    models: {
      provider: defineKey(() => `chat:models:provider`, null),
      metadata: defineKey(() => `chat:models:metadata`, null),
      pricing: defineKey(() => `chat:models:pricing`, null),
    },
    // ai-model.service.ts - LLM 모델 정보 (TTL 없음)
    model: {
      info: defineKey((target: string) => `chat:models:info:${target}`, null),
    },
    // memory-manager.service.ts - chat 세션 내 기억 메모리
    memory: {
      session: defineKey(
        (chatId: string, keyname: string) => `chat:memory:${chatId}:${keyname}`,
        900,
      ),
    },
    // idempotency.service.ts - LLM streaming 요청 멱등성 키 (가변 TTL)
    idempotent: {
      key: defineKey((key: string) => `chat:idempotent:${key}`, null),
    },
    // connector.service.ts (주석처리) - MCP 툴 정보 (TTL 없음)
    connector: {
      authConfigs: defineKey(() => `chat:connector:auth_configs`, null),
    },
    // month-aggregator.scheduler.ts - 집계 동작 중 lock (TTL 없음)
    monthAggregator: {
      lock: defineKey(
        (lockName: string) => `chat:month-aggregator:${lockName}`,
        null,
      ),
    },
  },
};
