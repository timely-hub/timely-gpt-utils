# @timely-hub/timely-gpt-utils

version: 0.0.13  
updated: 2026.04.16

Timely GPT 프로젝트에서 공통으로 사용하는 유틸리티 패키지입니다.

---

## 설치 (GitHub Packages)

### 1단계 — `.npmrc` 파일 설정

설치하는 프로젝트의 **루트에** `.npmrc` 파일을 생성합니다.

```
@timely-hub:registry=https://npm.pkg.github.com
```

### 2단계 — 패키지 설치

```bash
npm install @timely-hub/timely-gpt-utils
# 또는
pnpm add @timely-hub/timely-gpt-utils
```

> CI/CD 환경(GitHub Actions 등)에서는 `secrets.GITHUB_TOKEN`을 `NODE_AUTH_TOKEN`으로 전달하면 됩니다.

---

## 사용법

```ts
import { filePathUtils } from "@timely-hub/timely-gpt-utils";

const result = filePathUtils.buildUploadInfo({
  file, // File
  token,
  pathType: "org/space/user", // "org/space/user" | "org/space" | "org/user"
  container: "protected", // "protected" | "public" | "temp"
  subjects: [["group_id", "01KMPFX22QG0BP6AM8VE1MM0CZ"]], // optional
  purpose: "LABS_AI", // optional, 파일명에 기록
});

// filePath 복원
const { container, target, fileName } = filePathUtils.revertFilePath(
  result.filePath,
);
```

---

## 주요 API

### `filePathUtils`

| 함수                                            | 설명                                                        |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `buildUploadInfo(options)`                      | 파일 업로드에 필요한 경로 및 메타정보 생성                  |
| `revertFilePath(filePath)`                      | 파일 경로를 파싱해 원본 target 객체 복원                    |
| `convertToken(token)`                           | JWT 토큰을 파싱해 사용자 정보 추출                          |
| `combineFilePath(container, target, extension)` | target 객체를 파일 경로 문자열로 변환                       |
| `combineFolderPath(container, target)`          | target 객체를 폴더 경로 문자열로 변환                       |
| `getSubjectByNameFromFilePath(filePath, name)`  | 파일 경로에서 특정 subject ID 추출                          |
| `getAllSubjectsFromFilePath(filePath)`          | 파일 경로에서 전체 subject 맵 추출                          |
| `parseFileServerString(str)`                    | file-server: 프로토콜 및 다양한 경로 형식을 API 경로로 변환 |
| `parseFileUnknownPath(str)`                     | 알 수 없는 경로에서 fileName 또는 id 추출                   |

### Types & Schemas

| export             | 설명                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| `ContainerType`    | `"protected" \| "public" \| "temp"`                                           |
| `FileCategoryType` | `"DOCUMENT" \| "SHEET" \| "IMAGE" \| "AUDIO" \| "VIDEO" \| "TEXT" \| "OTHER"` |
| `FileInfo`         | 파일 메타정보 타입                                                            |
| `TargetType`       | 파일 경로 구성에 사용되는 타겟 객체 타입                                      |
| `VerifiedUser`     | JWT에서 추출한 사용자 정보 타입                                               |
| `DecodedPayload`   | JWT payload 타입                                                              |
| `FILE_INFO_SCHEMA` | Zod 스키마                                                                    |
| `TARGET_SCHEMA`    | Zod 스키마                                                                    |

### `CacheKeys`

Redis 캐시 키. `back` (백엔드 서버) / `chat` (챗 서버) 로 구분되며, 각 키 함수에 `.ttl` 프로퍼티로 TTL(초) 접근 가능. `null`은 TTL 없음 또는 가변.

```ts
import { CacheKeys } from "@timely-hub/timely-gpt-utils";

// 키 생성
CacheKeys.back.space.detail("space-id"); // "back:space:detail:space-id"
CacheKeys.chat.priceConfig.byType("SPACE", "id"); // "chat:price_config:SPACE:id"

// TTL 조회
CacheKeys.back.space.detail.ttl; // 300
CacheKeys.chat.model.info.ttl;   // null
```

### `CacheKeyHelper`

```ts
import { CacheKeyHelper } from "@timely-hub/timely-gpt-utils";

CacheKeyHelper.getAllKeyPaths(); // ['back.space.simpleList', 'back.space.detail', ..., 'chat.priceConfig.byType', ...]
CacheKeyHelper.getAllCategories("back"); // ['space', 'prompt', 'bookmark', ...]
CacheKeyHelper.getAllCategories("chat"); // ['priceConfig', 'exchangeRate', 'model', ...]
CacheKeyHelper.getCategoryPattern("back", "space"); // "back:space:*"
CacheKeyHelper.getCategoryPattern("chat");          // "chat:*"
CacheKeyHelper.getCategoryKeyTypes("back", "space"); // ['simpleList', 'detail', ...]
CacheKeyHelper.getIdPatterns("123"); // ['back:*:123', 'back:*:123:*', ..., 'chat:*:*:*:123:*']
```

### `classifyByExtension` / `classifyByMime` / `classifyByFile`

```ts
import {
  classifyByExtension,
  classifyByMime,
} from "@timely-hub/timely-gpt-utils";

classifyByExtension("pdf"); // "DOCUMENT"
classifyByMime("image/png"); // "IMAGE"
```

---

## 개발

```bash
pnpm build
```

빌드 결과물은 `dist/`에 생성됩니다.

---

## 배포

태그를 푸시하면 GitHub Actions가 자동으로 GitHub Packages에 배포합니다.

1. `package.json`의 `version` 올리기
2. 변경사항 커밋
3. 태그 생성 및 푸시 (스크립트 사용):
4. 태그는 반드시 `package.json` version 수정 커밋 이후에 생성해야 합니다.

```bash
./release.sh
```

> 태그는 반드시 `package.json` version 수정 커밋 이후에 생성해야 합니다.

---

## process

### upload

1. frontend 에서 `buildUploadInfo()` 실행
2. 결과값을 파일서버의 presigned upload API 요청 body로 사용
3. 받은 presigned url로 파일을 업로드(PUT)

### download

단일파일: file id를 이용하여 파일서버 API를 통해 presigned url 수령

폴더(delete와 동일한 타입):

```typescript
type ContainerType;
Omit<TargetType, "purpose">;
```

### delete

특정 경로의 파일들을 삭제할 경우:

```typescript
type ContainerType;
Omit<TargetType, "purpose">;
```

특정 파일만 삭제할 경우:

```typescript
type ContainerType;
type TargetType;
extension: string; // .txt, .png 등
```
