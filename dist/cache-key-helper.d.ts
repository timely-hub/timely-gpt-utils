/**
 * CacheKeys에서 자동으로 타입 경로를 추출하는 헬퍼
 */
export declare class CacheKeyHelper {
    static keys: {
        back: {
            space: {
                simpleList: (() => string) & {
                    ttl: 3600;
                    pattern: () => string;
                    invalidate: (redis: import("./cache-keys").RedisClient) => Promise<void>;
                };
                detail: ((id: string) => string) & {
                    ttl: 300;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
                domain: ((domain: string) => string) & {
                    ttl: null;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
                host: ((host: string) => string) & {
                    ttl: null;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
                canCreate: ((userId: string) => string) & {
                    ttl: 600;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
                lockUpdateAllSpaceMembersDefaultModel: ((id: string) => string) & {
                    ttl: 600;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
                lockToggleMemberNickname: ((id: string) => string) & {
                    ttl: 300;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
            };
            prompt: {
                view: ((userId: string, promptId: string) => string) & {
                    ttl: 86400;
                    pattern: (args_0?: string | undefined, args_1?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined, args_1?: string | undefined) => Promise<void>;
                };
            };
            bookmark: {
                groupView: ((userId: string, bookmarkId: string) => string) & {
                    ttl: 86400;
                    pattern: (args_0?: string | undefined, args_1?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined, args_1?: string | undefined) => Promise<void>;
                };
            };
            lock: {
                cron: ((jobName: string) => string) & {
                    ttl: 600;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
            };
            auth: {
                apiKey: ((apiKey: string, spaceId: string) => string) & {
                    ttl: 900;
                    pattern: (args_0?: string | undefined, args_1?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined, args_1?: string | undefined) => Promise<void>;
                };
            };
            spaceMember: {
                status: ((spaceMemberId: string) => string) & {
                    ttl: 120;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
                details: ((spaceMemberId: string) => string) & {
                    ttl: 600;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
            };
            audit: {
                space: ((spaceId: string) => string) & {
                    ttl: 600;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
                user: ((userId: string, spaceId?: string | undefined) => string) & {
                    ttl: 600;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
            };
        };
        chat: {
            priceConfig: {
                byType: ((type: "USER" | "SPACE" | "GROUP" | "ORGANIZATION", id: string) => string) & {
                    ttl: 60;
                    pattern: (args_0?: "USER" | "SPACE" | "GROUP" | "ORGANIZATION" | undefined, args_1?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: "USER" | "SPACE" | "GROUP" | "ORGANIZATION" | undefined, args_1?: string | undefined) => Promise<void>;
                };
            };
            exchangeRate: {
                usdKrw: (() => string) & {
                    ttl: 600;
                    pattern: () => string;
                    invalidate: (redis: import("./cache-keys").RedisClient) => Promise<void>;
                };
            };
            models: {
                provider: (() => string) & {
                    ttl: null;
                    pattern: () => string;
                    invalidate: (redis: import("./cache-keys").RedisClient) => Promise<void>;
                };
                metadata: (() => string) & {
                    ttl: null;
                    pattern: () => string;
                    invalidate: (redis: import("./cache-keys").RedisClient) => Promise<void>;
                };
                pricing: (() => string) & {
                    ttl: null;
                    pattern: () => string;
                    invalidate: (redis: import("./cache-keys").RedisClient) => Promise<void>;
                };
            };
            model: {
                info: ((target: string) => string) & {
                    ttl: null;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
            };
            memory: {
                session: ((chatId: string, keyname: string) => string) & {
                    ttl: 900;
                    pattern: (args_0?: string | undefined, args_1?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined, args_1?: string | undefined) => Promise<void>;
                };
            };
            idempotent: {
                key: ((key: string) => string) & {
                    ttl: null;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
            };
            connector: {
                authConfigs: (() => string) & {
                    ttl: null;
                    pattern: () => string;
                    invalidate: (redis: import("./cache-keys").RedisClient) => Promise<void>;
                };
            };
            monthAggregator: {
                lock: ((lockName: string) => string) & {
                    ttl: null;
                    pattern: (args_0?: string | undefined) => string;
                    invalidate: (redis: import("./cache-keys").RedisClient, args_0?: string | undefined) => Promise<void>;
                };
            };
        };
    };
    /**
     * CacheKeys의 모든 경로를 추출
     * @returns ['space.detail', 'space.domain', 'space.host', ...]
     */
    static getAllKeyPaths(): string[];
    /**
     * 경로로 캐시 키 생성 함수 가져오기
     * @param path 'space.detail' 형태의 경로
     * @returns 캐시 키 생성 함수
     */
    static getKeyFunction(path: string): Function;
    /**
     * 서버 도메인 패턴 생성
     * @param server 'back' | 'chat'
     * @param category 'space', 'prompt' 등 (선택)
     * @returns Redis 패턴 문자열 (예: 'back:*', 'back:space:*')
     */
    static getCategoryPattern(server: "back" | "chat", category?: string): string;
    /**
     * 특정 ID의 모든 캐시 패턴 생성
     * @param id 사용자 ID, 스페이스 ID 등
     * @returns Redis 패턴 배열
     */
    static getIdPatterns(id: string): string[];
    /**
     * 모든 카테고리 목록 반환
     * @param server 'back' | 'chat'
     * @returns back: ['space', 'prompt', ...] / chat: ['priceConfig', 'exchangeRate', ...]
     */
    static getAllCategories(server: "back" | "chat"): string[];
    /**
     * 특정 카테고리의 모든 키 타입 반환
     * @param server 'back' | 'chat'
     * @param category back: 'space' | 'prompt' 등 / chat: 'priceConfig' | 'exchangeRate' 등
     * @returns ['detail', 'domain', 'host', 'canCreate']
     */
    static getCategoryKeyTypes(server: "back" | "chat", category: string): string[];
}
//# sourceMappingURL=cache-key-helper.d.ts.map