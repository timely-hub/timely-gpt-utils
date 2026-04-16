import { CacheKeys } from "./cache-keys";

/**
 * CacheKeys에서 자동으로 타입 경로를 추출하는 헬퍼
 */
export class CacheKeyHelper {
  static keys = CacheKeys;
  /**
   * CacheKeys의 모든 경로를 추출
   * @returns ['space.detail', 'space.domain', 'space.host', ...]
   */
  static getAllKeyPaths(): string[] {
    const paths: string[] = [];

    const traverse = (obj: any, prefix: string = "") => {
      for (const key in obj) {
        if (typeof obj[key] === "function") {
          const path = prefix ? `${prefix}.${key}` : key;
          paths.push(path);
        } else if (typeof obj[key] === "object") {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          traverse(obj[key], newPrefix);
        }
      }
    };

    traverse(this.keys);
    return paths;
  }

  /**
   * 경로로 캐시 키 생성 함수 가져오기
   * @param path 'space.detail' 형태의 경로
   * @returns 캐시 키 생성 함수
   */
  static getKeyFunction(path: string): Function {
    const parts = path.split(".");
    let current: any = this.keys;

    for (const part of parts) {
      current = current[part];
      if (!current) {
        throw new Error(`Invalid cache key path: ${path}`);
      }
    }

    if (typeof current !== "function") {
      throw new Error(`Path ${path} is not a function`);
    }

    return current;
  }

  /**
   * 서버 도메인 패턴 생성
   * @param server 'back' | 'chat'
   * @param category 'space', 'prompt' 등 (선택)
   * @returns Redis 패턴 문자열 (예: 'back:*', 'back:space:*')
   */
  static getCategoryPattern(server: "back" | "chat", category?: string): string {
    return category ? `${server}:${category}:*` : `${server}:*`;
  }

  /**
   * 특정 ID의 모든 캐시 패턴 생성
   * @param id 사용자 ID, 스페이스 ID 등
   * @returns Redis 패턴 배열
   */
  static getIdPatterns(id: string): string[] {
    const servers = ["back", "chat"];
    const depths = [
      `*:${id}`,
      `*:${id}:*`,
      `*:*:${id}`,
      `*:*:${id}:*`,
      `*:*:*:${id}`,
      `*:*:*:${id}:*`,
    ];
    return servers.flatMap((server) => depths.map((d) => `${server}:${d}`));
  }

  /**
   * 모든 카테고리 목록 반환
   * @param server 'back' | 'chat'
   * @returns back: ['space', 'prompt', ...] / chat: ['priceConfig', 'exchangeRate', ...]
   */
  static getAllCategories(server: "back" | "chat"): string[] {
    return Object.keys(this.keys[server]);
  }

  /**
   * 특정 카테고리의 모든 키 타입 반환
   * @param server 'back' | 'chat'
   * @param category back: 'space' | 'prompt' 등 / chat: 'priceConfig' | 'exchangeRate' 등
   * @returns ['detail', 'domain', 'host', 'canCreate']
   */
  static getCategoryKeyTypes(server: "back" | "chat", category: string): string[] {
    const categoryObj = (this.keys[server] as any)[category];
    if (!categoryObj) {
      throw new Error(`Invalid category: ${server}.${category}`);
    }
    return Object.keys(categoryObj);
  }
}
