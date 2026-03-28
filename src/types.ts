export const CONTAINERS = ["protected", "public", "temp"] as const;
export type ContainerType = (typeof CONTAINERS)[number];

export type TargetType = {
  orgScope: string; // 1 - 조직 범위
  spaceId?: string; // 2 - 스페이스 범위
  userId?: string; // 3 - 유저 범위
  subjects?: [string, string][]; // 4 - 주제 범위 - [[주제명, 주제id]]
  spaceMemberId?: string; // 5 - 스페이스 멤버 범위
  purpose?: string; // 6 - 용도 - CHAT, CONVERSATION, NOTE, etc. - 파일 이름에 포함됨
};

export const prefixMap = {
  orgScope: "o",
  spaceId: "s",
  userId: "u",
  subjects: "sub",
  spaceMemberId: "sm",
  purpose: "p",
};
export const DIRECTORY_DELIMETER = "@";
export const FILE_NAME_DELIMETER = "_";

export type FileServiceRequest = {
  container: ContainerType;
  file: FileInfo;
  filePath: string;
  subjects: [string, string][];
  purpose: string;
};
export type DecodedPayload = {
  sub: string; // user_id
  rl?: string; // role
  t?: string; // token type
  si?: string; // module token의 spaceId
  spaceId?: string; // timely token의 spaceId
  spaceMemberId?: string; // timely token의 spaceMemberId
  spaceRole?: string; // timely token의 spaceRole
  oi?: string; // module token의 organizationId
  sessionScoped?: boolean;
};

export type VerifiedUser = {
  orgScope: string;
  userId: string;
  spaceId: string;
  spaceMemberId: string;
  sessionScoped: boolean;
  role: string;
  spaceRole: string;
  tokenType: "MODULE" | "TIMELY";
};

export const PATH_TYPES = ["org/space/user", "org/space", "org/user"] as const;
export type PathType = (typeof PATH_TYPES)[number];

export type FileInfo = {
  filename: string;
  extension: string;
  mimeType: string;
  size: number;
  originalName?: string;
};
