import z from "zod";

export const CONTAINERS = ["protected", "public", "temp"] as const;
export const CONTAINERS_SCHEMA = z.enum(CONTAINERS);
export type ContainerType = z.infer<typeof CONTAINERS_SCHEMA>;

export const FILE_CATEGORIES = [
  "DOCUMENT", // 로더가 별도로 필요한 파일들
  "SHEET",
  "IMAGE",
  "AUDIO",
  "VIDEO",
  "TEXT", // 바로 읽을 수 있는 파일들
  "OTHER", // 분류되지 않은 파일들
] as const;
export const FILE_CATEGORIES_SCHEMA = z.enum(FILE_CATEGORIES);
export type FileCategoryType = z.infer<typeof FILE_CATEGORIES_SCHEMA>;

export const FILE_INFO_SCHEMA = z.object({
  filename: z.string(),
  extension: z.string(),
  mimeType: z.string(),
  size: z.number(),
  originalName: z.string().nullable().optional(),
  category: FILE_CATEGORIES_SCHEMA,
});
export type FileInfo = z.infer<typeof FILE_INFO_SCHEMA>;

export const SUBJECTS_KEYS = [
  "chat_id",
  "storage_id",
  "group_id",
  "template_id",
  "chat_project_id",
] as const;

export const SUBJECTS_KEYS_SCHEMA = z.enum(SUBJECTS_KEYS);

export type SubjectsKeysType = z.infer<typeof SUBJECTS_KEYS_SCHEMA>;

const SUBJECT_SCHEMA = z
  .array(z.tuple([SUBJECTS_KEYS_SCHEMA, z.string()]))
  .transform(
    (arr): [SubjectsKeysType, string][] => arr as [SubjectsKeysType, string][],
  );

export const TARGET_SCHEMA = z.object({
  orgScope: z.string().describe("1 - 조직 범위"),
  spaceId: z.string().nullable().optional().describe("2 - 스페이스 범위"),
  userId: z.string().nullable().optional().describe("3 - 유저 범위"),
  subjects: SUBJECT_SCHEMA.nullable()
    .optional()
    .describe("4 - 주제 범위 - [[주제명, 주제id]]"),
  spaceMemberId: z
    .string()
    .nullable()
    .optional()
    .describe("5 - 스페이스 멤버 범위"),
  purpose: z
    .string()
    .nullable()
    .optional()
    .describe("6 - 용도 - CHAT, CONVERSATION, NOTE, etc. - 파일 이름에 포함됨"),
});
export type TargetType = z.infer<typeof TARGET_SCHEMA>;

export const prefixMap = {
  orgScope: "o",
  spaceId: "s",
  userId: "u",
  subjects: "sub",
  spaceMemberId: "sm",
  purpose: "p",
};
export const DIRECTORY_DELIMETER = "-";
export const FILE_NAME_DELIMETER = "_";

export const SUBJECT_KEY_PREFIX_REGEX = /^[a-z_]+$/;

export const FILE_SERVICE_REQUEST_SCHEMA = z.object({
  container: CONTAINERS_SCHEMA,
  file: FILE_INFO_SCHEMA,
  filePath: z.string(),
  subjects: SUBJECT_SCHEMA,
  purpose: z.string(),
});

export type FileServiceRequest = z.infer<typeof FILE_SERVICE_REQUEST_SCHEMA>;

export const DECODED_PAYLOAD_SCHEMA = z.object({
  sub: z.string(),
  rl: z.string().nullable().optional().describe("role"),
  t: z.string().nullable().optional().describe("token type"),
  si: z.string().nullable().optional().describe("module token의 spaceId"),
  spaceId: z.string().nullable().optional().describe("timely token의 spaceId"),
  spaceMemberId: z
    .string()
    .nullable()
    .optional()
    .describe("timely token의 spaceMemberId"),
  spaceRole: z
    .string()
    .nullable()
    .optional()
    .describe("timely token의 spaceRole"),
  oi: z
    .string()
    .nullable()
    .optional()
    .describe("module token의 organizationId"),
  sessionScoped: z
    .boolean()
    .nullable()
    .optional()
    .describe("timely gpt에만 있음"),
});
export type DecodedPayload = z.infer<typeof DECODED_PAYLOAD_SCHEMA>;

export const VERIFIED_USER_SCHEMA = z.object({
  orgScope: z.string(),
  userId: z.string(),
  spaceId: z.string(),
  spaceMemberId: z.string(),
  sessionScoped: z.boolean(),
  role: z.string(),
  spaceRole: z.string(),
  tokenType: z.enum(["MODULE", "TIMELY"]),
});
export type VerifiedUser = z.infer<typeof VERIFIED_USER_SCHEMA>;

export const PATH_TYPES = ["org/space/user", "org/space", "org/user"] as const;
export const PATH_TYPES_SCHEMA = z.enum(PATH_TYPES);
export type PathType = z.infer<typeof PATH_TYPES_SCHEMA>;
