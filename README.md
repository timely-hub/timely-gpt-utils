# timely-gpt-utils

version: 0.0.4
updated: 2026.03.29 06:50

Timely GPT 프로젝트에서 공통으로 사용하는 유틸리티 패키지입니다.

## 설치

`package.json`의 `dependencies`에 직접 GitHub 레포를 지정합니다.

```json
{
  "dependencies": {
    "timely-gpt-utils": "git+ssh://git@github.com:timely-hub/timely-gpt-utils.git"
  }
}
```

그 후 설치:

```bash
npm install
```

### 특정 브랜치 또는 태그 지정

```json
"timely-gpt-utils": "git+ssh://git@github.com:timely-hub/timely-gpt-utils.git#master"
"timely-gpt-utils": "git+ssh://git@github.com:timely-hub/timely-gpt-utils.git#v0.0.1"
```

## 사용법

```ts
import { filePathUtils } from "timely-gpt-utils";

const result = filePathUtils.generateFilePath({
  file, // File
  token,
  pathType: "org/space/user", // org/space/user, org/user, org/space
  container: "protected", // 'protected', 'public', 'temp'
  subjects: [["group", "01KMPFX22QG0BP6AM8VE1MM0CZ"]], // optional
  purpose: "LABS_AI", // optional, 파일명에 기록
});

// filePath 복원
const { container, target, fileName } = filePathUtils.revertFilePath(
  result.filePath,
);
```

## 주요 API

### `filePathUtils`

| 함수                                           | 설명                                       |
| ---------------------------------------------- | ------------------------------------------ |
| `generateFilePath(options)`                    | 파일 업로드에 필요한 경로 및 메타정보 생성 |
| `revertFilePath(filePath)`                     | 파일 경로를 파싱해 원본 target 객체 복원   |
| `convertToken(token)`                          | JWT 토큰을 파싱해 사용자 정보 추출         |
| `convertTarget(container, target, extension)`  | target 객체를 파일 경로 문자열로 변환      |
| `getSubjectByNameFromFilePath(filePath, name)` | 파일 경로에서 특정 subject ID 추출         |
| `getAllSubjectsFromFilePath(filePath)`         | 파일 경로에서 전체 subject 맵 추출         |

## 개발

```bash
# 빌드
npm run build
```

빌드 결과물은 `dist/`에 생성됩니다. 레포 설치 시 `prepare` 스크립트가 자동으로 실행됩니다.

## process

### upload

1. frontend 에서 buildUploadInfo() 실행

2. 실행하여 나온 결과값을 파일서버의 get presigned upload API의 request body로 사용

3. 받은 presigned url로 파일을 업로드(PUT)

### download

단일파일: file id를 이용하여 파일서버의 API를 통해 presigned url을 받아야 함

폴더(delete와 비슷함):

```typescript
type ContainerType;
Omit<TargetType, "purpose">;
```

### delete

특정 경로의 파일들을 삭제할 경우, 다음 값을 파일서버에 요청하기 전에 준비해야함

```typescript
type ContainerType;
Omit<TargetType, "purpose">;
```

특정 파일만 삭제할 경우, 다음 값을 파일서버에 요청하기 전에 준비해야함

```typescript
type ContainerType;
type TargetType;
extension: string; # .txt, .png 등
```
