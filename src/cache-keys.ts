/**
 * Redis 캐시 키 관리
 *
 * 모든 캐시 키는 이 파일에서 중앙 집중식으로 관리합니다.
 * 키 네이밍 컨벤션: {도메인}:{동작}:{식별자}
 */

export const CacheKeys = {
  // === Space 관련 ===
  space: {
    simpleList: () => `space:simple_list`,
    detail: (id: string) => `space:detail:${id}`,
    domain: (domain: string) => `space:domain:${domain}`,
    host: (host: string) => `space:host:${host}`,
    canCreate: (userId: string) => `space:can_create:${userId}`,
    lockUpdateAllSpaceMembersDefaultModel: (id: string) =>
      `space:lock_update_all_space_members_default_model:${id}`,
    lockToggleMemberNickname: (id: string) =>
      `space:lock_toggle_member_nickname:${id}`,
  },

  // === Prompt 관련 ===
  prompt: {
    view: (userId: string, promptId: string) =>
      `prompt_view:${userId}:${promptId}`,
  },

  // === Bookmark 관련 ===
  bookmark: {
    groupView: (userId: string, bookmarkId: string) =>
      `space_group_bookmark_view:${userId}:${bookmarkId}`,
  },

  // === Cron Lock ===
  lock: {
    cron: (jobName: string) => `lock:cron:${jobName}`,
  },

  // === Auth 관련 ===
  auth: {
    apiKey: (apiKey: string, spaceId: string) =>
      `auth:api_key:${spaceId}:${apiKey}`,
  },

  // === SpaceMember 관련 ===
  spaceMember: {
    status: (spaceMemberId: string) => `space-member:status:${spaceMemberId}`,
    details: (spaceMemberId: string) => `space-member:details:${spaceMemberId}`,
  },

  // === Audit 관련 ===
  audit: {
    space: (spaceId: string) => `audit:space:${spaceId}`,
    user: (userId: string, spaceId?: string) =>
      spaceId ? `audit:user:${userId}:${spaceId}` : `audit:user:${userId}`,
  },
} as const;

/**
 * 캐시 TTL (초 단위)
 */
export const CacheTTL = {
  SPACE_SIMPLE_LIST: 3600, // 1시간
  SPACE_DETAIL: 300, // 5분
  PROMPT_VIEW: 86400, // 24시간
  BOOKMARK_VIEW: 86400, // 24시간
  CRON_LOCK: 600, // 10분
  SPACE_CAN_CREATE: 600, // 10분
  API_KEY_AUTH: 900, // 15분
  AUDIT_SPACE: 600, // 10분 - Audit 로그용 Space 정보 캐싱
  AUDIT_USER: 600, // 10분 - Audit 로그용 User 정보 캐싱
  LOCK_UPDATE_ALL_SPACE_MEMBER_DEFAULT_MODEL: 600, // 10분 - 모든 스페이스 멤버 기본 모델 업데이트 상태값 저장
  LOCK_TOGGLE_MEMBER_NICKNAME: 300, // 5분 - 멤버 닉네임 표시 토글 중복 실행 방지
  SPACE_MEMBER_STATUS: 120, // 2분 - 멤버 활성화 상태 캐싱
  SPACE_MEMBER_DETAILS: 600, // 10분 - 멤버 상세 정보 캐싱 - 로그 기록을 위해 사용, 업데이트시 무효화 필요
} as const;
