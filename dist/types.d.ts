export declare const CONTAINERS: readonly ["protected", "public", "temp"];
export type ContainerType = (typeof CONTAINERS)[number];
export type TargetType = {
    orgScope: string;
    spaceId?: string;
    userId?: string;
    subjects?: [string, string][];
    spaceMemberId?: string;
    purpose?: string;
};
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
export type FileServiceRequest = {
    container: ContainerType;
    file: FileInfo;
    filePath: string;
    subjects: [string, string][];
    purpose: string;
};
export type DecodedPayload = {
    sub: string;
    rl?: string;
    t?: string;
    si?: string;
    spaceId?: string;
    spaceMemberId?: string;
    spaceRole?: string;
    oi?: string;
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
export declare const PATH_TYPES: readonly ["org/space/user", "org/space", "org/user"];
export type PathType = (typeof PATH_TYPES)[number];
export type FileInfo = {
    filename: string;
    extension: string;
    mimeType: string;
    size: number;
    originalName?: string;
};
//# sourceMappingURL=types.d.ts.map