# filePathUtils

파일 서버와 연동되는 스토리지 경로 생성, 파싱, 파일 분류, 프론트 URL 변환을 담당하는 유틸리티 모음.

---

## 경로 구조

스토리지 경로는 다음 규칙으로 조립된다:

```
{container}/{orgScope}/{spaceId}/{userId}/{subjects}/{spaceMemberId}/p_{purpose}_{ulid}.{ext}
```

| 세그먼트         | 프리픽스          | 예시                          |
| ---------------- | ----------------- | ----------------------------- |
| container        | (없음)            | `protected`, `public`, `temp` |
| orgScope         | `o-`              | `o-timely-gpt`                |
| spaceId          | `s-`              | `s-7320e3cb-...`              |
| userId           | `u-`              | `u-af321dbe-...`              |
| subjects         | `sub_{name}-{id}` | `sub_chat_id-xxxx`            |
| spaceMemberId    | `sm-`             | `sm-1`                        |
| purpose (파일명) | `p_`              | `p_CHAT_01KMPFX...png`        |

subjects key는 소문자 + 언더스코어만 허용 (`chat_id`, `storage_id`, `group_id`, `template_id`).

---

## 토큰 파싱

### `convertToken(token: string): VerifiedUser`

JWT를 디코딩해 서비스 공통 유저 정보(`VerifiedUser`)로 변환.  
Module 토큰(`oi` 클레임 포함)과 TimelyGPT 토큰 양쪽을 지원한다.

```ts
const user = filePathUtils.convertToken(jwtToken);
// { orgScope, userId, spaceId, spaceMemberId, sessionScoped, role, spaceRole, tokenType }
```

---

## 스토리지 경로 생성

### `combineFilePath(container, target, extension): string`

메타데이터로 파일 스토리지 경로를 생성. 파일명에 ULID가 자동으로 삽입된다.

```ts
const path = filePathUtils.combineFilePath(
  "protected",
  {
    orgScope: "timely-gpt",
    spaceId: "space-123",
    userId: "user-456",
    purpose: "CHAT",
    subjects: [["chat_id", "chat-789"]],
  },
  ".png",
);
// "protected/o-timely-gpt/s-space-123/u-user-456/sub_chat_id-chat-789/p_CHAT_01KMPFX....png"
```

### `combineFolderPath(container, target): string`

특정 경로의 폴더 prefix만 반환. 파일 목록 조회나 일괄 삭제용 패턴을 만들 때 사용.

```ts
const folder = filePathUtils.combineFolderPath("protected", {
  orgScope: "timely-gpt",
  spaceId: "space-123",
});
// "protected/o-timely-gpt/s-space-123/"
```

### `buildUploadInfo({ file, token, pathType, container?, subjects?, purpose? }): FileServiceRequest`

토큰에서 유저 정보를 추출하고, pathType에 따라 경로 범위를 자동 결정해 업로드 메타데이터를 반환.  
파일 서버에 업로드 요청 전에 호출하는 진입점.

| pathType         | 포함되는 범위               |
| ---------------- | --------------------------- | -------------------------------------------- |
| `org/space/user` | orgScope + spaceId + userId | - 일반적인 경우에 사용, 스페이스 멤버 귀속   |
| `org/space`      | orgScope + spaceId          | - 스페이스 설정의 경우에 사용, 스페이스 귀속 |
| `org/user`       | orgScope + userId           | - 유저 설정의 경우에 사용, 유저 귀속         |

```ts
const uploadInfo = filePathUtils.buildUploadInfo({
  file: { name: "image.png", type: "image/png", size: 1024 },
  token: jwtToken,
  pathType: "org/space/user",
  subjects: [["chat_id", "chat-789"]],
  purpose: "CHAT",
});
// { container, file: FileInfo, filePath, subjects, purpose }
```

---

## 스토리지 경로 파싱

### `revertFilePath(filePath): { container, target, fileName, category }`

스토리지 경로를 역파싱해 원래의 메타데이터를 복원.

```ts
const result = filePathUtils.revertFilePath(
  "protected/o-timely-gpt/s-space-123/u-user-456/p_CHAT_01KMPFX....png",
);
// { container: "protected", target: { orgScope, spaceId, userId, purpose }, fileName: "01KMPFX....png", category: "IMAGE" }
```

### Subject 추출

```ts
// target에서 추출
filePathUtils.getAllSubjectsFromTarget(target); // Record<string, string>
filePathUtils.getSubjectByNameFromTarget(target, "chat_id"); // string | undefined

// 파일 경로에서 바로 추출
filePathUtils.getAllSubjectsFromFilePath(filePath);
filePathUtils.getSubjectByNameFromFilePath(filePath, "chat_id");
```

---

## 프론트 URL 변환

### `parseFileServerString(fileServerString: string): string`

다양한 형태의 파일 참조 문자열을 프론트에서 사용 가능한 API URL로 변환.

| 입력 형태               | 결과                                    |
| ----------------------- | --------------------------------------- |
| `http(s)://...`         | 그대로 통과                             |
| `file-server:p_xxx.png` | `/api/download-file?filename=p_xxx.png` |
| `file-server:/uuid`     | `/api/download-file?fileId=/uuid`       |
| `p_xxx.png`             | `/api/download-file?filename=p_xxx.png` |
| 기타 ID 형태            | `/api/download-file?fileId=...`         |

```ts
const url = filePathUtils.parseFileServerString(
  "file-server:p_CHAT_01KMPFX....png",
);
// "/api/download-file?filename=p_CHAT_01KMPFX....png"
```

### `parseFileUnknownPath(unknownPath): { fileName: string; id: string }`

출처가 불명확한 경로/URL에서 `fileName`(스토리지 파일명)과 `id`(DB fileId)를 추출.  
Azure Blob URL, 내부 파일 서버 URL, `file-server:` 프로토콜 등 모든 형태를 처리한다.

```ts
const { fileName, id } = filePathUtils.parseFileUnknownPath(
  "https://tg7stg7storage.blob.core.windows.net/protected/.../p_CHAT_xxx.png",
);
// { fileName: "p_CHAT_xxx.png", id: "" }
```

---

## 파일 카테고리 분류

파일을 `DOCUMENT | SHEET | IMAGE | AUDIO | VIDEO | TEXT | OTHER` 중 하나로 분류.

```ts
import {
  classifyByExtension,
  classifyByMime,
  classifyByFile,
} from "timely-gpt-utils";

classifyByExtension("pdf"); // "DOCUMENT"
classifyByExtension("xlsx"); // "SHEET"
classifyByMime("image/png"); // "IMAGE"
classifyByFile({ name: "data.csv", type: "text/csv" }); // "SHEET"
```

MIME과 확장자가 충돌할 경우 **확장자 우선**.  
CSV는 `text/*`이지만 SHEET로 분류되는 것처럼, 비즈니스 의미 기반으로 분류한다.
