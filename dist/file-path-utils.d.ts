import { VerifiedUser, ContainerType, TargetType, PathType, FileServiceRequest, FileCategoryType, SubjectsKeysType } from "./types";
export declare const convertToken: (token: string) => VerifiedUser;
/**
 * metaData를 이용하여 특정 파일 경로를 반환함.
 * @param container - 컨테이너 타입
 * @param target - 타겟 타입
 * @param extension - 파일 확장자
 * @returns 파일 경로
 */
export declare const combineFilePath: (container: ContainerType, target: TargetType, extension: `.${string}` | string) => string;
/**
 * metaData를 이용하여 특정 폴더 경로를 반환함.
 * @param container - 컨테이너 타입
 * @param target - 타겟 타입
 * @returns 폴더 경로
 */
export declare const combineFolderPath: (container: ContainerType, target: Omit<TargetType, "purpose">) => string;
export declare const revertFilePath: (filePath: string) => {
    container: ContainerType;
    target: TargetType;
    fileName: string;
    category: FileCategoryType;
};
export declare const buildUploadInfo: ({ file, token, pathType, container, subjects, purpose, }: {
    file: Pick<File, "name" | "type" | "size">;
    token: string;
    pathType: PathType;
    container?: "protected" | "public" | "temp";
    subjects?: [SubjectsKeysType, string][];
    purpose?: string;
}) => FileServiceRequest;
export declare const getAllSubjectsFromTarget: (target: TargetType) => Record<string, string>;
export declare const getSubjectByNameFromTarget: (target: TargetType, name: string) => string | undefined;
export declare const getSubjectByNameFromFilePath: (filePath: string, name: string) => string | undefined;
export declare const getAllSubjectsFromFilePath: (filePath: string) => Record<string, string>;
export declare const DOWNLOAD_FILE_API_PATH = "/api/download-file";
export declare const VIEW_FILE_API_PATH = "/api/view-file";
export declare const parseFileServerStringByFilename: (filename: string) => string;
export declare const parseFileServerStringByFileId: (fileId: string) => string;
export declare const parseFileServerString: (fileServerString: string) => string;
export declare const isURL: (url: string) => URL | null;
export declare const parseFileUnknownPath: (unknownPath: string) => {
    fileName: string;
    id: string;
};
//# sourceMappingURL=file-path-utils.d.ts.map