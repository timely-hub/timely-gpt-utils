import { CacheKeys, CacheTTL } from "./cache-keys";

/**
 * CacheKeys에서 자동으로 타입 경로를 추출하는 헬퍼
 */
export class CacheKeyHelper {
  static keys = CacheKeys;
  static ttl = CacheTTL;
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
   * 캐시 키 패턴 생성
   * @param category 'space', 'prompt' 등
   * @returns Redis 패턴 문자열 (예: 'space:*')
   */
  static getCategoryPattern(category: string): string {
    return `${category}:*`;
  }

  /**
   * 특정 ID의 모든 캐시 패턴 생성
   * @param id 사용자 ID, 스페이스 ID 등
   * @returns Redis 패턴 배열
   */
  static getIdPatterns(id: string): string[] {
    return [`*:${id}`, `*:${id}:*`, `*:*:${id}`, `*:*:${id}:*`];
  }

  /**
   * 모든 카테고리 목록 반환
   * @returns ['space', 'prompt', 'bookmark', 'lock', 'auth', 'audit']
   */
  static getAllCategories(): string[] {
    return Object.keys(this.keys);
  }

  /**
   * 특정 카테고리의 모든 키 타입 반환
   * @param category 'space', 'prompt' 등
   * @returns ['detail', 'domain', 'host', 'canCreate']
   */
  static getCategoryKeyTypes(category: string): string[] {
    const categoryObj = (this.keys as any)[category];
    if (!categoryObj) {
      throw new Error(`Invalid category: ${category}`);
    }
    return Object.keys(categoryObj);
  }
}
