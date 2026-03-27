import { decode } from "jsonwebtoken";
import { ulid } from "ulid";

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

type FileInfo = {
  filename: string;
  extension: string;
  mimeType: string;
  size: number;
  originalName?: string;
};

export const convertToken = (token: string): VerifiedUser => {
  const decoded = decode(token) as DecodedPayload | null;
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

export const CONTAINERS = ["protected", "public", "temp"] as const;
export type ContainerType = (typeof CONTAINERS)[number];

export type TargetType = {
  orgScope: string; // 1 - 조직 범위
  spaceId?: string; // 2 - 스페이스 범위
  userId?: string; // 3 - 유저 범위
  subjects?: [string, string][]; // 4 - 주제 범위 - [[주제명, 주제id]]
  spaceMemberId?: string; // 5.1 - 스페이스 멤버 범위 - 파일 이름에 포함됨
  purpose?: string; // 5.2 - 용도 - CHAT, CONVERSATION, NOTE, etc. - 파일 이름에 포함됨
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

export const convertTarget = (
  container: ContainerType,
  target: TargetType,
  extension: `.${string}` | string,
): string => {
  if (!CONTAINERS.includes(container)) {
    throw new Error("Invalid container");
  }
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

export const revertFilePath = (
  filePath: string,
): { container: ContainerType; target: TargetType; fileName: string } => {
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
      // subjects: sub_name@id
      const rest = segment.slice(4);
      const atIdx = rest.indexOf(DIRECTORY_DELIMETER);
      if (atIdx !== -1) {
        target.subjects = [
          ...(target.subjects || []),
          [rest.slice(0, atIdx), rest.slice(atIdx + 1)],
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
      const secondUnderIdx = rest.indexOf(FILE_NAME_DELIMETER);
      if (secondUnderIdx !== -1) {
        (target as any)[key] = rest.slice(0, secondUnderIdx);
        fileName = rest.slice(secondUnderIdx + 1);
      } else {
        (target as any)[key] = rest;
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

export const buildUploadInfo = ({
  file,
  token,
  pathType,
  container = "protected",
  subjects = [], // [['chat', 'xxxx-id']]
  purpose = "CHAT",
}: {
  file: File;
  token: string;
  pathType: PathType;
  container?: "protected" | "public" | "temp";
  subjects?: [string, string][];
  purpose?: string;
}): FileServiceRequest => {
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
  filePath = convertTarget(container, targetValues, extension);
  const lastPath = filePath.split("/").pop() || "";

  const fileInfo: FileInfo = {
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
