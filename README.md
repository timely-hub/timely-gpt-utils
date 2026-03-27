# timely-gpt-utils

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
"timely-gpt-utils": "git+ssh://git@github.com:timely-hub/timely-gpt-utils.git#main"
"timely-gpt-utils": "git+ssh://git@github.com:timely-hub/timely-gpt-utils.git#v1.0.0"
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
