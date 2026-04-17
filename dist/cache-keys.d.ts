/**
 * Redis 캐시 키 관리
 *
 * 모든 캐시 키는 이 파일에서 중앙 집중식으로 관리합니다.
 * 키 네이밍 컨벤션: {서버}:{도메인}:{동작}:{식별자}
 *
 * 각 키 함수에 .ttl 프로퍼티로 TTL(초) 접근 가능. null은 TTL 없음 또는 가변.
 */
export interface RedisClient {
    keys(pattern: string): Promise<string[]>;
    del(...keys: string[]): Promise<any>;
}
export declare const CacheKeys: {
    back: {
        space: {
            simpleList: (() => string) & {
                ttl: 3600;
                pattern: () => string;
                invalidate: (redis: RedisClient) => Promise<void>;
            };
            detail: ((id: string) => string) & {
                ttl: 300;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
            domain: ((domain: string) => string) & {
                ttl: null;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
            host: ((host: string) => string) & {
                ttl: null;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
            canCreate: ((userId: string) => string) & {
                ttl: 600;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
            lockUpdateAllSpaceMembersDefaultModel: ((id: string) => string) & {
                ttl: 600;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
            lockToggleMemberNickname: ((id: string) => string) & {
                ttl: 300;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
        };
        prompt: {
            view: ((userId: string, promptId: string) => string) & {
                ttl: 86400;
                pattern: (args_0?: string | undefined, args_1?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined, args_1?: string | undefined) => Promise<void>;
            };
        };
        bookmark: {
            groupView: ((userId: string, bookmarkId: string) => string) & {
                ttl: 86400;
                pattern: (args_0?: string | undefined, args_1?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined, args_1?: string | undefined) => Promise<void>;
            };
        };
        lock: {
            cron: ((jobName: string) => string) & {
                ttl: 600;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
        };
        auth: {
            apiKey: ((apiKey: string, spaceId: string) => string) & {
                ttl: 900;
                pattern: (args_0?: string | undefined, args_1?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined, args_1?: string | undefined) => Promise<void>;
            };
        };
        spaceMember: {
            status: ((spaceMemberId: string) => string) & {
                ttl: 120;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
            details: ((spaceMemberId: string) => string) & {
                ttl: 600;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
        };
        audit: {
            space: ((spaceId: string) => string) & {
                ttl: 600;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
            user: ((userId: string, spaceId?: string | undefined) => string) & {
                ttl: 600;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
        };
    };
    chat: {
        priceConfig: {
            byType: ((type: "USER" | "SPACE" | "GROUP" | "ORGANIZATION", id: string) => string) & {
                ttl: 60;
                pattern: (args_0?: "USER" | "SPACE" | "GROUP" | "ORGANIZATION" | undefined, args_1?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: "USER" | "SPACE" | "GROUP" | "ORGANIZATION" | undefined, args_1?: string | undefined) => Promise<void>;
            };
        };
        exchangeRate: {
            usdKrw: (() => string) & {
                ttl: 600;
                pattern: () => string;
                invalidate: (redis: RedisClient) => Promise<void>;
            };
        };
        models: {
            provider: (() => string) & {
                ttl: null;
                pattern: () => string;
                invalidate: (redis: RedisClient) => Promise<void>;
            };
            metadata: (() => string) & {
                ttl: null;
                pattern: () => string;
                invalidate: (redis: RedisClient) => Promise<void>;
            };
            pricing: (() => string) & {
                ttl: null;
                pattern: () => string;
                invalidate: (redis: RedisClient) => Promise<void>;
            };
        };
        model: {
            info: ((target: string) => string) & {
                ttl: null;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
        };
        memory: {
            session: ((chatId: string, keyname: string) => string) & {
                ttl: 900;
                pattern: (args_0?: string | undefined, args_1?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined, args_1?: string | undefined) => Promise<void>;
            };
        };
        idempotent: {
            key: ((key: string) => string) & {
                ttl: null;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
        };
        connector: {
            authConfigs: (() => string) & {
                ttl: null;
                pattern: () => string;
                invalidate: (redis: RedisClient) => Promise<void>;
            };
        };
        monthAggregator: {
            lock: ((lockName: string) => string) & {
                ttl: null;
                pattern: (args_0?: string | undefined) => string;
                invalidate: (redis: RedisClient, args_0?: string | undefined) => Promise<void>;
            };
        };
    };
};
//# sourceMappingURL=cache-keys.d.ts.map