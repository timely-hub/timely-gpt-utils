import { ulid } from "ulid";

const decodeJwt = (token: string): DecodedPayload | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof (globalThis as Record<string, unknown>)["atob"] === "function"
        ? (globalThis as unknown as { atob: (s: string) => string }).atob(
            base64,
          )
        : Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
};
import {
  VerifiedUser,
  DecodedPayload,
  ContainerType,
  TargetType,
  CONTAINERS,
  prefixMap,
  FILE_NAME_DELIMETER,
  DIRECTORY_DELIMETER,
  PathType,
  FileServiceRequest,
  FileInfo,
  SUBJECT_KEY_PREFIX_REGEX,
  FileCategoryType,
  SubjectsKeysType,
} from "./types";
import { classifyByExtension, classifyByFile } from "./file-classifier";

export const convertToken = (token: string): VerifiedUser => {
  const decoded = decodeJwt(token);
  if (!decoded) {
    throw new Error("Invalid token");
  }
  const verifiedUser: VerifiedUser = {
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
const validateSubjectKeys = (subjects: [SubjectsKeysType, string][]) => {
  for (const [key] of subjects) {
    if (!SUBJECT_KEY_PREFIX_REGEX.test(key)) {
      throw new Error(
        `Invalid subject key: "${key}". Only lowercase letters and underscores are allowed.`,
      );
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
export const combineFilePath = (
  container: ContainerType,
  target: TargetType,
  extension: `.${string}` | string,
): string => {
  if (!CONTAINERS.includes(container)) {
    throw new Error("Invalid container");
  }
  if (target.subjects) validateSubjectKeys(target.subjects);
  if (!extension.startsWith(".")) {
    extension = `.${extension}`;
  }
  if (!target.purpose) {
    target.purpose = "UNDEFINED";
  }
  const FILE_NAME_KEYS = new Set(["purpose"]);
  const paths = Object.entries(prefixMap)
    .map(([key, value]) => {
      let targetValue = target[key as keyof TargetType];
      if (targetValue) {
        const isFileNameKey = FILE_NAME_KEYS.has(key);
        let delimiter = isFileNameKey
          ? FILE_NAME_DELIMETER
          : DIRECTORY_DELIMETER;
        const lastSplit = isFileNameKey ? "_" : "/";

        if (Array.isArray(targetValue)) {
          if (targetValue.length === 0) {
            return "";
          }
          targetValue = targetValue
            .map(([name, id]) => `${value}_${name}${DIRECTORY_DELIMETER}${id}`)
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
  return `${container}/${paths}${ulid()}${extension}`;
};

/**
 * metaData를 이용하여 특정 폴더 경로를 반환함.
 * @param container - 컨테이너 타입
 * @param target - 타겟 타입
 * @returns 폴더 경로
 */
export const combineFolderPath = (
  container: ContainerType,
  target: Omit<TargetType, "purpose">,
): string => {
  if (!CONTAINERS.includes(container)) {
    throw new Error("Invalid container");
  }
  if (target.subjects) validateSubjectKeys(target.subjects);
  const FILE_NAME_KEYS = new Set(["purpose"]);
  const paths = Object.entries(prefixMap)
    .map(([key, value]) => {
      let targetValue = target[key as keyof Omit<TargetType, "purpose">];
      if (targetValue) {
        const isFileNameKey = FILE_NAME_KEYS.has(key);
        let delimiter = isFileNameKey
          ? FILE_NAME_DELIMETER
          : DIRECTORY_DELIMETER;
        const lastSplit = isFileNameKey ? "_" : "/";

        if (Array.isArray(targetValue)) {
          if (targetValue.length === 0) {
            return "";
          }
          targetValue = targetValue
            .map(([name, id]) => `${value}_${name}${DIRECTORY_DELIMETER}${id}`)
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

export const revertFilePath = (
  filePath: string,
): {
  container: ContainerType;
  target: TargetType;
  fileName: string;
  category: FileCategoryType;
} => {
  const parts = filePath.split("/");
  const container = parts[0] as ContainerType;
  const lastPart = parts[parts.length - 1];
  const middleParts = parts.slice(1, -1);

  const reversePrefixMap = Object.fromEntries(
    Object.entries(prefixMap).map(([key, prefix]) => [prefix, key]),
  ) as Record<string, keyof TargetType>;

  const target: Partial<TargetType> = {};

  for (const segment of middleParts) {
    if (segment.startsWith("sub_")) {
      // subjects: sub_name-id
      const rest = segment.slice(4);
      const atIdx = rest.indexOf(DIRECTORY_DELIMETER);
      if (atIdx !== -1) {
        target.subjects = [
          ...(target.subjects || []),
          [rest.slice(0, atIdx) as SubjectsKeysType, rest.slice(atIdx + 1)],
        ];
      }
    } else {
      // 일반 디렉토리 세그먼트: prefix@value
      const atIdx = segment.indexOf(DIRECTORY_DELIMETER);
      if (atIdx === -1) continue;
      const prefix = segment.slice(0, atIdx);
      const value = segment.slice(atIdx + 1);
      const key = reversePrefixMap[prefix];
      if (key) (target as any)[key] = value;
    }
  }

  // 마지막 세그먼트: "p_CHAT_01KMPFX22QG0BP6AM8VE1MM0CZ.txt"
  let fileName = lastPart;
  const firstUnderIdx = lastPart.indexOf(FILE_NAME_DELIMETER);
  if (firstUnderIdx !== -1) {
    const prefix = lastPart.slice(0, firstUnderIdx);
    const rest = lastPart.slice(firstUnderIdx + 1);
    const key = reversePrefixMap[prefix];
    if (key) {
      const lastUnderIdx = rest.lastIndexOf(FILE_NAME_DELIMETER);
      if (lastUnderIdx !== -1) {
        (target as any)[key] = rest.slice(0, lastUnderIdx);
        fileName = rest.slice(lastUnderIdx + 1);
      } else {
        (target as any)[key] = rest;
        fileName = "";
      }
    }
  }
  let category: FileCategoryType = "OTHER";
  if (fileName) {
    category = classifyByExtension(fileName.split(".").pop() || "");
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

export const buildUploadInfo = ({
  file,
  token,
  pathType,
  container = "protected",
  subjects = [], // [['chat', 'xxxx-id']]
  purpose = "CHAT",
}: {
  file: Pick<File, "name" | "type" | "size">;
  token: string;
  pathType: PathType;
  container?: "protected" | "public" | "temp";
  subjects?: [SubjectsKeysType, string][];
  purpose?: string;
}): FileServiceRequest => {
  validateSubjectKeys(subjects);
  const verifiedUser = convertToken(token);
  let filePath = "";
  let targetValues: TargetType = {
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
  filePath = combineFilePath(container, targetValues, extension);
  const lastPath = filePath.split("/").pop() || "";
  const category = classifyByFile(file);

  const fileInfo: FileInfo = {
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

export const getAllSubjectsFromTarget = (
  target: TargetType,
): Record<string, string> => {
  return (
    target.subjects?.reduce(
      (acc, [subjectName, subjectId]) => {
        acc[subjectName] = subjectId;
        return acc;
      },
      {} as Record<string, string>,
    ) || {}
  );
};

export const getSubjectByNameFromTarget = (
  target: TargetType,
  name: string,
): string | undefined => {
  return getAllSubjectsFromTarget(target)[name];
};

export const getSubjectByNameFromFilePath = (
  filePath: string,
  name: string,
): string | undefined => {
  const { target } = revertFilePath(filePath);
  return getSubjectByNameFromTarget(target, name);
};

export const getAllSubjectsFromFilePath = (
  filePath: string,
): Record<string, string> => {
  const { target } = revertFilePath(filePath);
  return getAllSubjectsFromTarget(target);
};

export const DOWNLOAD_FILE_API_PATH = "/api/download-file";
export const VIEW_FILE_API_PATH = "/api/view-file";

export const parseFileServerStringByFilename = (filename: string) => {
  return `${DOWNLOAD_FILE_API_PATH}?filename=${filename}`;
};
export const parseFileServerStringByFileId = (fileId: string) => {
  return `${DOWNLOAD_FILE_API_PATH}?fileId=${fileId}`;
};
export const parseFileServerString = (fileServerString: string) => {
  // presigned 된 url이거나 일반 url인 경우 그냥 통과
  if (fileServerString?.startsWith("http")) {
    return fileServerString;
  }
  // file-server: 프로토콜인 경우 파일 이름을 쿼리 파라미터로 추가
  if (fileServerString?.startsWith("file-server:")) {
    const fileString = fileServerString.split(":")[1];
    if (fileString.startsWith("p_")) {
      return parseFileServerStringByFilename(fileString);
    }
    if (fileString.startsWith("/")) {
      return parseFileServerStringByFileId(fileString);
    }
    return parseFileServerStringByFilename(fileString);
  }
  if (
    // 약속된 문자열 형식
    fileServerString?.startsWith("p_") &&
    fileServerString?.includes(".")
  ) {
    return parseFileServerStringByFilename(fileServerString);
  }
  if (
    // 약한 추론
    !fileServerString?.includes("/")
  ) {
    return parseFileServerStringByFileId(fileServerString);
  }
  // 그 밖의 경우는 그냥 통과
  return fileServerString;
};

export const isURL = (url: string): URL | null => {
  try {
    return new URL(url);
  } catch (error) {
    return null;
  }
};
export const parseFileUnknownPath = (
  unknownPath: string,
): { fileName: string; id: string } => {
  let fileName = "";
  let id = "";
  const url = isURL(unknownPath);
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
    const matches = pathname?.match(
      /^\/timely-file-khdgj\/files\/by\/(name|id)\/([^/]+)/,
    );
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
    } else {
      // 예시
      // https://tg7stg7storage.blob.core.windows.net/protected/o-timely-gpt/s-7320e3cb-c057-462f-bd12-cfc547084e78/u-af321dbe-d147-4b4a-bb5b-c5783bcd5be1/sub_chatid-test-12/sm-1/p_test_01KN6DBPTP2JQS2N5XPJC30DX9.png
      fileName = pathname?.split("/").pop() || "";
    }
  } else {
    if (unknownPath.startsWith("/")) {
      const fileNameArr = unknownPath.split("/").pop()?.split(".");
      if (
        fileNameArr &&
        fileNameArr.length > 1 &&
        unknownPath.startsWith("p_")
      ) {
        const lastFileName = unknownPath.split("/").pop();
        fileName = lastFileName || "";
      } else {
        const lastId = unknownPath.split("/").pop();
        id = lastId || "";
      }
    } else if (unknownPath.startsWith("p_")) {
      fileName = unknownPath;
    } else {
      id = unknownPath;
    }
  }
  return { fileName, id };
};
