"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATH_TYPES_SCHEMA = exports.PATH_TYPES = exports.VERIFIED_USER_SCHEMA = exports.DECODED_PAYLOAD_SCHEMA = exports.FILE_SERVICE_REQUEST_SCHEMA = exports.SUBJECT_KEY_PREFIX_REGEX = exports.FILE_NAME_DELIMETER = exports.DIRECTORY_DELIMETER = exports.prefixMap = exports.TARGET_SCHEMA = exports.SUBJECTS_KEYS_SCHEMA = exports.SUBJECTS_KEYS = exports.FILE_INFO_SCHEMA = exports.FILE_CATEGORIES_SCHEMA = exports.FILE_CATEGORIES = exports.CONTAINERS_SCHEMA = exports.CONTAINERS = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CONTAINERS = ["protected", "public", "temp"];
exports.CONTAINERS_SCHEMA = zod_1.default.enum(exports.CONTAINERS);
exports.FILE_CATEGORIES = [
    "DOCUMENT", // 로더가 별도로 필요한 파일들
    "SHEET",
    "IMAGE",
    "AUDIO",
    "VIDEO",
    "TEXT", // 바로 읽을 수 있는 파일들
    "OTHER", // 분류되지 않은 파일들
];
exports.FILE_CATEGORIES_SCHEMA = zod_1.default.enum(exports.FILE_CATEGORIES);
exports.FILE_INFO_SCHEMA = zod_1.default.object({
    filename: zod_1.default.string(),
    extension: zod_1.default.string(),
    mimeType: zod_1.default.string(),
    size: zod_1.default.number(),
    originalName: zod_1.default.string().nullable().optional(),
    category: exports.FILE_CATEGORIES_SCHEMA,
});
exports.SUBJECTS_KEYS = [
    "chat_id",
    "storage_id",
    "group_id",
    "template_id",
];
exports.SUBJECTS_KEYS_SCHEMA = zod_1.default.enum(exports.SUBJECTS_KEYS);
const SUBJECT_SCHEMA = zod_1.default
    .array(zod_1.default.tuple([exports.SUBJECTS_KEYS_SCHEMA, zod_1.default.string()]))
    .transform((arr) => arr);
exports.TARGET_SCHEMA = zod_1.default.object({
    orgScope: zod_1.default.string().describe("1 - 조직 범위"),
    spaceId: zod_1.default.string().nullable().optional().describe("2 - 스페이스 범위"),
    userId: zod_1.default.string().nullable().optional().describe("3 - 유저 범위"),
    subjects: SUBJECT_SCHEMA.nullable()
        .optional()
        .describe("4 - 주제 범위 - [[주제명, 주제id]]"),
    spaceMemberId: zod_1.default
        .string()
        .nullable()
        .optional()
        .describe("5 - 스페이스 멤버 범위"),
    purpose: zod_1.default
        .string()
        .nullable()
        .optional()
        .describe("6 - 용도 - CHAT, CONVERSATION, NOTE, etc. - 파일 이름에 포함됨"),
});
exports.prefixMap = {
    orgScope: "o",
    spaceId: "s",
    userId: "u",
    subjects: "sub",
    spaceMemberId: "sm",
    purpose: "p",
};
exports.DIRECTORY_DELIMETER = "-";
exports.FILE_NAME_DELIMETER = "_";
exports.SUBJECT_KEY_PREFIX_REGEX = /^[a-z_]+$/;
exports.FILE_SERVICE_REQUEST_SCHEMA = zod_1.default.object({
    container: exports.CONTAINERS_SCHEMA,
    file: exports.FILE_INFO_SCHEMA,
    filePath: zod_1.default.string(),
    subjects: SUBJECT_SCHEMA,
    purpose: zod_1.default.string(),
});
exports.DECODED_PAYLOAD_SCHEMA = zod_1.default.object({
    sub: zod_1.default.string(),
    rl: zod_1.default.string().nullable().optional().describe("role"),
    t: zod_1.default.string().nullable().optional().describe("token type"),
    si: zod_1.default.string().nullable().optional().describe("module token의 spaceId"),
    spaceId: zod_1.default.string().nullable().optional().describe("timely token의 spaceId"),
    spaceMemberId: zod_1.default
        .string()
        .nullable()
        .optional()
        .describe("timely token의 spaceMemberId"),
    spaceRole: zod_1.default
        .string()
        .nullable()
        .optional()
        .describe("timely token의 spaceRole"),
    oi: zod_1.default
        .string()
        .nullable()
        .optional()
        .describe("module token의 organizationId"),
    sessionScoped: zod_1.default
        .boolean()
        .nullable()
        .optional()
        .describe("timely gpt에만 있음"),
});
exports.VERIFIED_USER_SCHEMA = zod_1.default.object({
    orgScope: zod_1.default.string(),
    userId: zod_1.default.string(),
    spaceId: zod_1.default.string(),
    spaceMemberId: zod_1.default.string(),
    sessionScoped: zod_1.default.boolean(),
    role: zod_1.default.string(),
    spaceRole: zod_1.default.string(),
    tokenType: zod_1.default.enum(["MODULE", "TIMELY"]),
});
exports.PATH_TYPES = ["org/space/user", "org/space", "org/user"];
exports.PATH_TYPES_SCHEMA = zod_1.default.enum(exports.PATH_TYPES);
//# sourceMappingURL=types.js.map