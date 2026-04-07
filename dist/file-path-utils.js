"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFileUnknownPath = exports.isURL = exports.parseFileServerString = exports.parseFileServerStringByFileId = exports.parseFileServerStringByFilename = exports.VIEW_FILE_API_PATH = exports.DOWNLOAD_FILE_API_PATH = exports.getAllSubjectsFromFilePath = exports.getSubjectByNameFromFilePath = exports.getSubjectByNameFromTarget = exports.getAllSubjectsFromTarget = exports.buildUploadInfo = exports.revertFilePath = exports.combineFolderPath = exports.combineFilePath = exports.convertToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const ulid_1 = require("ulid");
const types_1 = require("./types");
const file_classifier_1 = require("./file-classifier");
const convertToken = (token) => {
    const decoded = (0, jsonwebtoken_1.decode)(token);
    if (!decoded) {
        throw new Error("Invalid token");
    }
    const verifiedUser = {
        orgScope: decoded.oi || "timely-gpt", // 모듈은 oi 있음, timelygpt는 없음
        userId: decoded.sub, // 모듈은 id가 하나이며 sub에 있고, timelygpt는 user.id, user.spaceMemberId가 있다
        spaceId: decoded.si || decoded.spaceId || "", // 모듈은 si 있음, timelygpt는 spaceId 있음
        spaceMemberId: decoded.spaceMemberId || decoded.sub || "", // 모듈은 spaceMemberId 없음, sub는 모듈
        sessionScoped: decoded.sessionScoped || false, // timely gpt에만 있음
        role: decoded.rl || "",
        spaceRole: decoded.spaceRole || decoded.rl || "",
        tokenType: decoded.oi ? "MODULE" : "TIMELY",
    };
    return verifiedUser;
};
exports.convertToken = convertToken;
const validateSubjectKeys = (subjects) => {
    for (const [key] of subjects) {
        if (!types_1.SUBJECT_KEY_PREFIX_REGEX.test(key)) {
            throw new Error(`Invalid subject key: "${key}". Only lowercase letters and underscores are allowed.`);
        }
    }
};
/**
 * metaData를 이용하여 특정 파일 경로를 반환함.
 * @param container - 컨테이너 타입
 * @param target - 타겟 타입
 * @param extension - 파일 확장자
 * @returns 파일 경로
 */
const combineFilePath = (container, target, extension) => {
    if (!types_1.CONTAINERS.includes(container)) {
        throw new Error("Invalid container");
    }
    if (target.subjects)
        validateSubjectKeys(target.subjects);
    if (!extension.startsWith(".")) {
        extension = `.${extension}`;
    }
    if (!target.purpose) {
        target.purpose = "UNDEFINED";
    }
    const FILE_NAME_KEYS = new Set(["purpose"]);
    const paths = Object.entries(types_1.prefixMap)
        .map(([key, value]) => {
        let targetValue = target[key];
        if (targetValue) {
            const isFileNameKey = FILE_NAME_KEYS.has(key);
            let delimiter = isFileNameKey
                ? types_1.FILE_NAME_DELIMETER
                : types_1.DIRECTORY_DELIMETER;
            const lastSplit = isFileNameKey ? "_" : "/";
            if (Array.isArray(targetValue)) {
                if (targetValue.length === 0) {
                    return "";
                }
                targetValue = targetValue
                    .map(([name, id]) => `${value}_${name}${types_1.DIRECTORY_DELIMETER}${id}`)
                    .join("/");
                value = "";
                delimiter = "";
            }
            return `${value}${delimiter}${targetValue}${lastSplit}`;
        }
        return "";
    })
        .filter(Boolean)
        .join("");
    return `${container}/${paths}${(0, ulid_1.ulid)()}${extension}`;
};
exports.combineFilePath = combineFilePath;
/**
 * metaData를 이용하여 특정 폴더 경로를 반환함.
 * @param container - 컨테이너 타입
 * @param target - 타겟 타입
 * @returns 폴더 경로
 */
const combineFolderPath = (container, target) => {
    if (!types_1.CONTAINERS.includes(container)) {
        throw new Error("Invalid container");
    }
    if (target.subjects)
        validateSubjectKeys(target.subjects);
    const FILE_NAME_KEYS = new Set(["purpose"]);
    const paths = Object.entries(types_1.prefixMap)
        .map(([key, value]) => {
        let targetValue = target[key];
        if (targetValue) {
            const isFileNameKey = FILE_NAME_KEYS.has(key);
            let delimiter = isFileNameKey
                ? types_1.FILE_NAME_DELIMETER
                : types_1.DIRECTORY_DELIMETER;
            const lastSplit = isFileNameKey ? "_" : "/";
            if (Array.isArray(targetValue)) {
                if (targetValue.length === 0) {
                    return "";
                }
                targetValue = targetValue
                    .map(([name, id]) => `${value}_${name}${types_1.DIRECTORY_DELIMETER}${id}`)
                    .join("/");
                value = "";
                delimiter = "";
            }
            return `${value}${delimiter}${targetValue}${lastSplit}`;
        }
        return "";
    })
        .filter(Boolean)
        .join("");
    return `${container}/${paths}`;
};
exports.combineFolderPath = combineFolderPath;
const revertFilePath = (filePath) => {
    const parts = filePath.split("/");
    const container = parts[0];
    const lastPart = parts[parts.length - 1];
    const middleParts = parts.slice(1, -1);
    const reversePrefixMap = Object.fromEntries(Object.entries(types_1.prefixMap).map(([key, prefix]) => [prefix, key]));
    const target = {};
    for (const segment of middleParts) {
        if (segment.startsWith("sub_")) {
            // subjects: sub_name-id
            const rest = segment.slice(4);
            const atIdx = rest.indexOf(types_1.DIRECTORY_DELIMETER);
            if (atIdx !== -1) {
                target.subjects = [
                    ...(target.subjects || []),
                    [rest.slice(0, atIdx), rest.slice(atIdx + 1)],
                ];
            }
        }
        else {
            // 일반 디렉토리 세그먼트: prefix@value
            const atIdx = segment.indexOf(types_1.DIRECTORY_DELIMETER);
            if (atIdx === -1)
                continue;
            const prefix = segment.slice(0, atIdx);
            const value = segment.slice(atIdx + 1);
            const key = reversePrefixMap[prefix];
            if (key)
                target[key] = value;
        }
    }
    // 마지막 세그먼트: "p_CHAT_01KMPFX22QG0BP6AM8VE1MM0CZ.txt"
    let fileName = lastPart;
    const firstUnderIdx = lastPart.indexOf(types_1.FILE_NAME_DELIMETER);
    if (firstUnderIdx !== -1) {
        const prefix = lastPart.slice(0, firstUnderIdx);
        const rest = lastPart.slice(firstUnderIdx + 1);
        const key = reversePrefixMap[prefix];
        if (key) {
            const lastUnderIdx = rest.lastIndexOf(types_1.FILE_NAME_DELIMETER);
            if (lastUnderIdx !== -1) {
                target[key] = rest.slice(0, lastUnderIdx);
                fileName = rest.slice(lastUnderIdx + 1);
            }
            else {
                target[key] = rest;
                fileName = "";
            }
        }
    }
    let category = "OTHER";
    if (fileName) {
        category = (0, file_classifier_1.classifyByExtension)(fileName.split(".").pop() || "");
    }
    return {
        container,
        target: {
            ...target,
            orgScope: target.orgScope || "timely-gpt",
        },
        fileName,
        category,
    };
};
exports.revertFilePath = revertFilePath;
const buildUploadInfo = ({ file, token, pathType, container = "protected", subjects = [], // [['chat', 'xxxx-id']]
purpose = "CHAT", }) => {
    validateSubjectKeys(subjects);
    const verifiedUser = (0, exports.convertToken)(token);
    let filePath = "";
    let targetValues = {
        orgScope: verifiedUser.orgScope,
        spaceMemberId: verifiedUser.spaceMemberId,
        purpose: purpose,
        subjects: subjects,
    };
    switch (pathType) {
        case "org/space/user":
            targetValues.spaceId = verifiedUser.spaceId;
            targetValues.userId = verifiedUser.userId;
            break;
        case "org/space":
            targetValues.spaceId = verifiedUser.spaceId;
            break;
        case "org/user":
            targetValues.userId = verifiedUser.userId;
            break;
        default:
            throw new Error("Invalid path type");
    }
    const extension = file.name.split(".").pop() || "";
    filePath = (0, exports.combineFilePath)(container, targetValues, extension);
    const lastPath = filePath.split("/").pop() || "";
    const category = (0, file_classifier_1.classifyByFile)(file);
    const fileInfo = {
        filename: lastPath,
        extension: file.name.split(".").pop() || "",
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        originalName: file.name,
        category,
    };
    return {
        container,
        file: fileInfo,
        filePath,
        subjects,
        purpose,
    };
};
exports.buildUploadInfo = buildUploadInfo;
const getAllSubjectsFromTarget = (target) => {
    return (target.subjects?.reduce((acc, [subjectName, subjectId]) => {
        acc[subjectName] = subjectId;
        return acc;
    }, {}) || {});
};
exports.getAllSubjectsFromTarget = getAllSubjectsFromTarget;
const getSubjectByNameFromTarget = (target, name) => {
    return (0, exports.getAllSubjectsFromTarget)(target)[name];
};
exports.getSubjectByNameFromTarget = getSubjectByNameFromTarget;
const getSubjectByNameFromFilePath = (filePath, name) => {
    const { target } = (0, exports.revertFilePath)(filePath);
    return (0, exports.getSubjectByNameFromTarget)(target, name);
};
exports.getSubjectByNameFromFilePath = getSubjectByNameFromFilePath;
const getAllSubjectsFromFilePath = (filePath) => {
    const { target } = (0, exports.revertFilePath)(filePath);
    return (0, exports.getAllSubjectsFromTarget)(target);
};
exports.getAllSubjectsFromFilePath = getAllSubjectsFromFilePath;
exports.DOWNLOAD_FILE_API_PATH = "/api/download-file";
exports.VIEW_FILE_API_PATH = "/api/view-file";
const parseFileServerStringByFilename = (filename) => {
    return `${exports.DOWNLOAD_FILE_API_PATH}?filename=${filename}`;
};
exports.parseFileServerStringByFilename = parseFileServerStringByFilename;
const parseFileServerStringByFileId = (fileId) => {
    return `${exports.DOWNLOAD_FILE_API_PATH}?fileId=${fileId}`;
};
exports.parseFileServerStringByFileId = parseFileServerStringByFileId;
const parseFileServerString = (fileServerString) => {
    // presigned 된 url이거나 일반 url인 경우 그냥 통과
    if (fileServerString?.startsWith("http")) {
        return fileServerString;
    }
    // file-server: 프로토콜인 경우 파일 이름을 쿼리 파라미터로 추가
    if (fileServerString?.startsWith("file-server:")) {
        const fileString = fileServerString.split(":")[1];
        if (fileString.startsWith("p_")) {
            return (0, exports.parseFileServerStringByFilename)(fileString);
        }
        if (fileString.startsWith("/")) {
            return (0, exports.parseFileServerStringByFileId)(fileString);
        }
        return (0, exports.parseFileServerStringByFilename)(fileString);
    }
    if (
    // 약속된 문자열 형식
    fileServerString?.startsWith("p_") &&
        fileServerString?.includes(".")) {
        return (0, exports.parseFileServerStringByFilename)(fileServerString);
    }
    if (
    // 약한 추론
    !fileServerString?.includes("/")) {
        return (0, exports.parseFileServerStringByFileId)(fileServerString);
    }
    // 그 밖의 경우는 그냥 통과
    return fileServerString;
};
exports.parseFileServerString = parseFileServerString;
const isURL = (url) => {
    try {
        return new URL(url);
    }
    catch (error) {
        return null;
    }
};
exports.isURL = isURL;
const parseFileUnknownPath = (unknownPath) => {
    let fileName = "";
    let id = "";
    const url = (0, exports.isURL)(unknownPath);
    const searchParams = url?.searchParams;
    const pathname = url?.pathname;
    const filename = searchParams?.get("filename");
    const fileId = searchParams?.get("fileId");
    if (filename) {
        fileName = filename;
        return { fileName, id };
    }
    if (fileId) {
        id = fileId;
        return { fileName, id };
    }
    if (url) {
        const matches = pathname?.match(/^\/timely-file-khdgj\/files\/by\/(name|id)\/([^/]+)/);
        if (matches) {
            // 예시
            // http://localhost:3500/timely-file-khdgj/files/by/name/p_test_01KN6DBPTP2JQS2N5XPJC30DX9.png
            // http://localhost:3500/timely-file-khdgj/files/by/id/ae2b8ff8-cbbf-4f4b-9246-8952920dad04
            const type = matches[1];
            const value = matches[2];
            if (type === "name") {
                fileName = value;
            }
            if (type === "id") {
                id = value;
            }
        }
        else {
            // 예시
            // https://tg7stg7storage.blob.core.windows.net/protected/o-timely-gpt/s-7320e3cb-c057-462f-bd12-cfc547084e78/u-af321dbe-d147-4b4a-bb5b-c5783bcd5be1/sub_chatid-test-12/sm-1/p_test_01KN6DBPTP2JQS2N5XPJC30DX9.png
            fileName = pathname?.split("/").pop() || "";
        }
    }
    else {
        if (unknownPath.startsWith("/")) {
            const fileNameArr = unknownPath.split("/").pop()?.split(".");
            if (fileNameArr &&
                fileNameArr.length > 1 &&
                unknownPath.startsWith("p_")) {
                const lastFileName = unknownPath.split("/").pop();
                fileName = lastFileName || "";
            }
            else {
                const lastId = unknownPath.split("/").pop();
                id = lastId || "";
            }
        }
        else if (unknownPath.startsWith("p_")) {
            fileName = unknownPath;
        }
        else {
            id = unknownPath;
        }
    }
    return { fileName, id };
};
exports.parseFileUnknownPath = parseFileUnknownPath;
//# sourceMappingURL=file-path-utils.js.map