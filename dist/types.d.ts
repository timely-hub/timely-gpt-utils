import z from "zod";
export declare const CONTAINERS: readonly ["protected", "public", "temp"];
export declare const CONTAINERS_SCHEMA: z.ZodEnum<{
    protected: "protected";
    public: "public";
    temp: "temp";
}>;
export type ContainerType = z.infer<typeof CONTAINERS_SCHEMA>;
export declare const FILE_CATEGORIES: readonly ["DOCUMENT", "SHEET", "IMAGE", "AUDIO", "VIDEO", "TEXT", "OTHER"];
export declare const FILE_CATEGORIES_SCHEMA: z.ZodEnum<{
    DOCUMENT: "DOCUMENT";
    SHEET: "SHEET";
    IMAGE: "IMAGE";
    AUDIO: "AUDIO";
    VIDEO: "VIDEO";
    TEXT: "TEXT";
    OTHER: "OTHER";
}>;
export type FileCategoryType = z.infer<typeof FILE_CATEGORIES_SCHEMA>;
export declare const FILE_INFO_SCHEMA: z.ZodObject<{
    filename: z.ZodString;
    extension: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    originalName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    category: z.ZodEnum<{
        DOCUMENT: "DOCUMENT";
        SHEET: "SHEET";
        IMAGE: "IMAGE";
        AUDIO: "AUDIO";
        VIDEO: "VIDEO";
        TEXT: "TEXT";
        OTHER: "OTHER";
    }>;
}, z.core.$strip>;
export type FileInfo = z.infer<typeof FILE_INFO_SCHEMA>;
export declare const SUBJECTS_KEYS: readonly ["chat_id", "storage_id", "group_id", "template_id"];
export declare const SUBJECTS_KEYS_SCHEMA: z.ZodEnum<{
    chat_id: "chat_id";
    storage_id: "storage_id";
    group_id: "group_id";
    template_id: "template_id";
}>;
export type SubjectsKeysType = z.infer<typeof SUBJECTS_KEYS_SCHEMA>;
export declare const TARGET_SCHEMA: z.ZodObject<{
    orgScope: z.ZodString;
    spaceId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    userId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    subjects: z.ZodOptional<z.ZodNullable<z.ZodPipe<z.ZodArray<z.ZodTuple<[z.ZodEnum<{
        chat_id: "chat_id";
        storage_id: "storage_id";
        group_id: "group_id";
        template_id: "template_id";
    }>, z.ZodString], null>>, z.ZodTransform<["chat_id" | "storage_id" | "group_id" | "template_id", string][], ["chat_id" | "storage_id" | "group_id" | "template_id", string][]>>>>;
    spaceMemberId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    purpose: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type TargetType = z.infer<typeof TARGET_SCHEMA>;
export declare const prefixMap: {
    orgScope: string;
    spaceId: string;
    userId: string;
    subjects: string;
    spaceMemberId: string;
    purpose: string;
};
export declare const DIRECTORY_DELIMETER = "-";
export declare const FILE_NAME_DELIMETER = "_";
export declare const SUBJECT_KEY_PREFIX_REGEX: RegExp;
export declare const FILE_SERVICE_REQUEST_SCHEMA: z.ZodObject<{
    container: z.ZodEnum<{
        protected: "protected";
        public: "public";
        temp: "temp";
    }>;
    file: z.ZodObject<{
        filename: z.ZodString;
        extension: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        originalName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        category: z.ZodEnum<{
            DOCUMENT: "DOCUMENT";
            SHEET: "SHEET";
            IMAGE: "IMAGE";
            AUDIO: "AUDIO";
            VIDEO: "VIDEO";
            TEXT: "TEXT";
            OTHER: "OTHER";
        }>;
    }, z.core.$strip>;
    filePath: z.ZodString;
    subjects: z.ZodPipe<z.ZodArray<z.ZodTuple<[z.ZodEnum<{
        chat_id: "chat_id";
        storage_id: "storage_id";
        group_id: "group_id";
        template_id: "template_id";
    }>, z.ZodString], null>>, z.ZodTransform<["chat_id" | "storage_id" | "group_id" | "template_id", string][], ["chat_id" | "storage_id" | "group_id" | "template_id", string][]>>;
    purpose: z.ZodString;
}, z.core.$strip>;
export type FileServiceRequest = z.infer<typeof FILE_SERVICE_REQUEST_SCHEMA>;
export declare const DECODED_PAYLOAD_SCHEMA: z.ZodObject<{
    sub: z.ZodString;
    rl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    t: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    si: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    spaceId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    spaceMemberId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    spaceRole: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    oi: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sessionScoped: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, z.core.$strip>;
export type DecodedPayload = z.infer<typeof DECODED_PAYLOAD_SCHEMA>;
export declare const VERIFIED_USER_SCHEMA: z.ZodObject<{
    orgScope: z.ZodString;
    userId: z.ZodString;
    spaceId: z.ZodString;
    spaceMemberId: z.ZodString;
    sessionScoped: z.ZodBoolean;
    role: z.ZodString;
    spaceRole: z.ZodString;
    tokenType: z.ZodEnum<{
        MODULE: "MODULE";
        TIMELY: "TIMELY";
    }>;
}, z.core.$strip>;
export type VerifiedUser = z.infer<typeof VERIFIED_USER_SCHEMA>;
export declare const PATH_TYPES: readonly ["org/space/user", "org/space", "org/user"];
export declare const PATH_TYPES_SCHEMA: z.ZodEnum<{
    "org/space/user": "org/space/user";
    "org/space": "org/space";
    "org/user": "org/user";
}>;
export type PathType = z.infer<typeof PATH_TYPES_SCHEMA>;
//# sourceMappingURL=types.d.ts.map