"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubjectsFromFilePath = exports.getSubjectByNameFromFilePath = exports.getSubjectByNameFromTarget = exports.getAllSubjectsFromTarget = exports.buildUploadInfo = exports.revertFilePath = exports.combineFolderPath = exports.combineFilePath = exports.convertToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const ulid_1 = require("ulid");
const types_1 = require("./types");
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
            // subjects: sub_name@id
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
            const secondUnderIdx = rest.indexOf(types_1.FILE_NAME_DELIMETER);
            if (secondUnderIdx !== -1) {
                target[key] = rest.slice(0, secondUnderIdx);
                fileName = rest.slice(secondUnderIdx + 1);
            }
            else {
                target[key] = rest;
                fileName = "";
            }
        }
    }
    return {
        container,
        target: {
            ...target,
            orgScope: target.orgScope || "timely-gpt",
        },
        fileName,
    };
};
exports.revertFilePath = revertFilePath;
const buildUploadInfo = ({ file, token, pathType, container = "protected", subjects = [], // [['chat', 'xxxx-id']]
purpose = "CHAT", }) => {
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
    const fileInfo = {
        filename: lastPath,
        extension: file.name.split(".").pop() || "",
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        originalName: file.name,
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
//# sourceMappingURL=file-path-utils.js.map