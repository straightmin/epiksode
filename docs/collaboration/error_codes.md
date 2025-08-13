# 🚨 에러 코드 정의서 & 응답 형식

**대상**: 프론트엔드 개발팀  
**작성일**: 2025년 8월 10일  
**목적**: 일관된 에러 처리 및 사용자 경험 개선

---

## 📋 **표준 API 응답 형식**

### ✅ **성공 응답**

```typescript
interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

// 예시
{
  "success": true,
  "message": "사진을 성공적으로 조회했습니다.",
  "data": {
    "id": 1,
    "title": "산속의 아침",
    "imageUrl": "https://...",
    // ...
  }
}
```

### ❌ **에러 응답**

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: Record<string, any>;
  };
}

// 예시
{
  "success": false,
  "message": "이메일 또는 패스워드가 올바르지 않습니다.",
  "error": {
    "code": "AUTH_001",
    "details": {
      "field": "email",
      "attemptedValue": "wrong@example.com"
    }
  }
}
```

---

## 🔥 **HTTP 상태 코드 가이드**

| 상태 코드 | 의미                  | 사용 상황        | 프론트엔드 처리            |
| --------- | --------------------- | ---------------- | -------------------------- |
| **200**   | OK                    | 요청 성공        | 데이터 화면에 표시         |
| **201**   | Created               | 리소스 생성 성공 | 생성 완료 메시지 표시      |
| **400**   | Bad Request           | 요청 데이터 오류 | 폼 유효성 검증 메시지      |
| **401**   | Unauthorized          | 인증 실패        | 로그인 페이지로 리다이렉트 |
| **403**   | Forbidden             | 권한 없음        | 접근 거부 메시지 표시      |
| **404**   | Not Found             | 리소스 없음      | "찾을 수 없음" 페이지      |
| **409**   | Conflict              | 중복 데이터      | 중복 에러 메시지 표시      |
| **422**   | Unprocessable Entity  | 유효성 검증 실패 | 필드별 에러 메시지         |
| **429**   | Too Many Requests     | 요청 한도 초과   | 재시도 대기 메시지         |
| **500**   | Internal Server Error | 서버 오류        | 일반적인 오류 메시지       |

---

## 📍 **에러 코드 체계**

### 🏷️ **코드 명명 규칙**

```
{CATEGORY}_{NUMBER}

카테고리:
- AUTH: 인증/인가
- USER: 사용자 관리
- PHOTO: 사진 관리
- COMMENT: 댓글
- LIKE: 좋아요
- FOLLOW: 팔로우
- SERIES: 시리즈
- UPLOAD: 파일 업로드
- VALIDATION: 데이터 검증
- RATE_LIMIT: 요청 제한
- SERVER: 서버 오류
```

---

## 🔐 **인증 관련 에러 (AUTH_xxx)**

| 에러 코드  | HTTP | 메시지                                   | 상황                    | 프론트엔드 처리         |
| ---------- | ---- | ---------------------------------------- | ----------------------- | ----------------------- |
| `AUTH_001` | 401  | 이메일 또는 패스워드가 올바르지 않습니다 | 로그인 실패             | 폼 에러 표시            |
| `AUTH_002` | 401  | 토큰이 만료되었습니다                    | JWT 토큰 만료           | 토큰 갱신 또는 재로그인 |
| `AUTH_003` | 401  | 유효하지 않은 토큰입니다                 | 잘못된 JWT              | 토큰 삭제 후 재로그인   |
| `AUTH_004` | 401  | 토큰이 제공되지 않았습니다               | Authorization 헤더 누락 | 로그인 요청             |
| `AUTH_005` | 403  | 접근 권한이 없습니다                     | 리소스 접근 권한 없음   | 권한 없음 메시지        |
| `AUTH_006` | 403  | 본인만 수정/삭제할 수 있습니다           | 타인 리소스 수정 시도   | 권한 에러 안내          |

### 🛠️ **프론트엔드 처리 예시**

```typescript
const handleAuthError = (errorCode: string) => {
    switch (errorCode) {
        case "AUTH_001":
            setLoginError("이메일 또는 패스워드를 확인하세요");
            break;
        case "AUTH_002":
        case "AUTH_003":
            localStorage.removeItem("token");
            router.push("/login");
            break;
        case "AUTH_004":
            router.push("/login");
            break;
        case "AUTH_005":
        case "AUTH_006":
            showToast("접근 권한이 없습니다", "error");
            break;
    }
};
```

---

## 👤 **사용자 관련 에러 (USER_xxx)**

| 에러 코드  | HTTP | 메시지                        | 상황                    | 프론트엔드 처리         |
| ---------- | ---- | ----------------------------- | ----------------------- | ----------------------- |
| `USER_001` | 409  | 이미 사용 중인 이메일입니다   | 회원가입 시 이메일 중복 | 이메일 필드 에러 표시   |
| `USER_002` | 409  | 이미 사용 중인 사용자명입니다 | 사용자명 중복           | 사용자명 필드 에러 표시 |
| `USER_003` | 404  | 존재하지 않는 사용자입니다    | 잘못된 사용자 ID        | 404 페이지 표시         |
| `USER_004` | 400  | 비밀번호가 일치하지 않습니다  | 비밀번호 변경 시        | 비밀번호 필드 에러      |
| `USER_005` | 400  | 이미 탈퇴한 사용자입니다      | 삭제된 계정 접근        | 계정 상태 안내          |

---

## 📸 **사진 관련 에러 (PHOTO_xxx)**

| 에러 코드   | HTTP | 메시지                                | 상황             | 프론트엔드 처리          |
| ----------- | ---- | ------------------------------------- | ---------------- | ------------------------ |
| `PHOTO_001` | 404  | 존재하지 않는 사진입니다              | 잘못된 사진 ID   | 404 페이지 또는 목록으로 |
| `PHOTO_002` | 403  | 비공개 사진입니다                     | 비공개 사진 접근 | 접근 불가 메시지         |
| `PHOTO_003` | 400  | 사진 제목은 필수입니다                | 제목 누락        | 제목 필드 에러 표시      |
| `PHOTO_004` | 400  | 사진 제목이 너무 깁니다 (최대 255자)  | 제목 길이 초과   | 글자 수 제한 안내        |
| `PHOTO_005` | 400  | 사진 설명이 너무 깁니다 (최대 2000자) | 설명 길이 초과   | 글자 수 제한 안내        |

---

## 💬 **댓글 관련 에러 (COMMENT_xxx)**

| 에러 코드     | HTTP | 메시지                           | 상황            | 프론트엔드 처리       |
| ------------- | ---- | -------------------------------- | --------------- | --------------------- |
| `COMMENT_001` | 404  | 존재하지 않는 댓글입니다         | 잘못된 댓글 ID  | 댓글 목록 새로고침    |
| `COMMENT_002` | 400  | 댓글 내용을 입력하세요           | 빈 댓글 내용    | 댓글 입력 필드 포커스 |
| `COMMENT_003` | 400  | 댓글이 너무 깁니다 (최대 500자)  | 댓글 길이 초과  | 글자 수 제한 안내     |
| `COMMENT_004` | 400  | 사진 또는 시리즈 ID가 필요합니다 | target 누락     | 개발자 에러 로그      |
| `COMMENT_005` | 404  | 대댓글의 부모 댓글이 없습니다    | 잘못된 parentId | 일반 댓글로 전환      |

---

## ❤️ **좋아요 관련 에러 (LIKE_xxx)**

| 에러 코드  | HTTP | 메시지                          | 상황             | 프론트엔드 처리  |
| ---------- | ---- | ------------------------------- | ---------------- | ---------------- |
| `LIKE_001` | 400  | 좋아요 대상을 지정하세요        | target 누락      | 개발자 에러 로그 |
| `LIKE_002` | 404  | 좋아요 대상이 존재하지 않습니다 | 잘못된 대상 ID   | 페이지 새로고침  |
| `LIKE_003` | 409  | 이미 좋아요한 항목입니다        | 중복 좋아요 시도 | 상태 동기화      |

---

## 👥 **팔로우 관련 에러 (FOLLOW_xxx)**

| 에러 코드    | HTTP | 메시지                              | 상황             | 프론트엔드 처리      |
| ------------ | ---- | ----------------------------------- | ---------------- | -------------------- |
| `FOLLOW_001` | 400  | 자기 자신을 팔로우할 수 없습니다    | 본인 팔로우 시도 | 팔로우 버튼 비활성화 |
| `FOLLOW_002` | 404  | 팔로우할 사용자가 존재하지 않습니다 | 잘못된 사용자 ID | 사용자 목록 새로고침 |
| `FOLLOW_003` | 409  | 이미 팔로우 중입니다                | 중복 팔로우      | 상태 동기화          |

---

## 📁 **시리즈 관련 에러 (SERIES_xxx)**

| 에러 코드    | HTTP | 메시지                                  | 상황               | 프론트엔드 처리  |
| ------------ | ---- | --------------------------------------- | ------------------ | ---------------- |
| `SERIES_001` | 404  | 존재하지 않는 시리즈입니다              | 잘못된 시리즈 ID   | 404 페이지 표시  |
| `SERIES_002` | 400  | 시리즈 제목은 필수입니다                | 제목 누락          | 제목 필드 에러   |
| `SERIES_003` | 400  | 시리즈에는 최소 1장의 사진이 필요합니다 | 빈 시리즈          | 사진 선택 안내   |
| `SERIES_004` | 403  | 비공개 시리즈입니다                     | 비공개 시리즈 접근 | 접근 불가 메시지 |

---

## 📤 **파일 업로드 에러 (UPLOAD_xxx)**

| 에러 코드    | HTTP | 메시지                              | 상황             | 프론트엔드 처리  |
| ------------ | ---- | ----------------------------------- | ---------------- | ---------------- |
| `UPLOAD_001` | 400  | 파일을 선택해주세요                 | 파일 누락        | 파일 선택 요청   |
| `UPLOAD_002` | 400  | 지원하지 않는 파일 형식입니다       | 잘못된 파일 타입 | 지원 형식 안내   |
| `UPLOAD_003` | 400  | 파일 크기가 너무 큽니다 (최대 10MB) | 파일 크기 초과   | 크기 제한 안내   |
| `UPLOAD_004` | 500  | 파일 업로드에 실패했습니다          | S3 업로드 실패   | 재시도 버튼 표시 |
| `UPLOAD_005` | 500  | 이미지 처리에 실패했습니다          | Sharp 처리 실패  | 재시도 버튼 표시 |

### 📤 **파일 업로드 제한사항**

```typescript
const FileConstraints = {
    // 지원 이미지 형식
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],

    // 파일 크기 제한
    maxSize: 10 * 1024 * 1024, // 10MB

    // 이미지 해상도 제한
    maxWidth: 4000,
    maxHeight: 4000,

    // 썸네일 생성 사이즈
    thumbnailSize: { width: 300, height: 300 },
};
```

---

## ⚡ **요청 제한 에러 (RATE_LIMIT_xxx)**

| 에러 코드        | HTTP | 메시지                                        | 상황               | 프론트엔드 처리    |
| ---------------- | ---- | --------------------------------------------- | ------------------ | ------------------ |
| `RATE_LIMIT_001` | 429  | 요청이 너무 많습니다. 잠시 후 다시 시도하세요 | API 호출 한도 초과 | 재시도 타이머 표시 |
| `RATE_LIMIT_002` | 429  | 파일 업로드 한도를 초과했습니다               | 업로드 제한        | 일일 한도 안내     |
| `RATE_LIMIT_003` | 429  | 로그인 시도 횟수를 초과했습니다               | 로그인 제한        | 계정 잠금 안내     |

### ⚡ **Rate Limiting 정책**

```typescript
const RateLimits = {
    // 일반 API
    general: {
        windowMs: 15 * 60 * 1000, // 15분
        max: 100, // 15분당 100회
    },

    // 파일 업로드
    upload: {
        windowMs: 60 * 60 * 1000, // 1시간
        max: 50, // 1시간당 50개 파일
    },

    // 로그인 시도
    login: {
        windowMs: 15 * 60 * 1000, // 15분
        max: 5, // 15분당 5회 시도
    },
};
```

---

## 🔧 **유효성 검증 에러 (VALIDATION_xxx)**

| 에러 코드        | HTTP | 메시지                                 | 상황            | 프론트엔드 처리    |
| ---------------- | ---- | -------------------------------------- | --------------- | ------------------ |
| `VALIDATION_001` | 422  | 이메일 형식이 올바르지 않습니다        | 잘못된 이메일   | 이메일 필드 에러   |
| `VALIDATION_002` | 422  | 비밀번호는 8자 이상이어야 합니다       | 짧은 비밀번호   | 비밀번호 규칙 안내 |
| `VALIDATION_003` | 422  | 사용자명은 영문, 숫자, \_만 가능합니다 | 잘못된 사용자명 | 사용자명 규칙 안내 |
| `VALIDATION_004` | 422  | 필수 필드가 누락되었습니다             | 필수값 누락     | 누락 필드 강조     |

### 🔧 **필드별 유효성 규칙**

```typescript
const ValidationRules = {
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "올바른 이메일 형식을 입력하세요",
    },
    password: {
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        message: "8자 이상, 대소문자와 숫자를 포함해야 합니다",
    },
    username: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: "2-50자, 영문/숫자/언더스코어만 가능합니다",
    },
};
```

---

## 🖥️ **서버 에러 (SERVER_xxx)**

| 에러 코드    | HTTP | 메시지                                | 상황               | 프론트엔드 처리  |
| ------------ | ---- | ------------------------------------- | ------------------ | ---------------- |
| `SERVER_001` | 500  | 서버에 일시적인 문제가 발생했습니다   | 일반적인 서버 오류 | 재시도 버튼 표시 |
| `SERVER_002` | 500  | 데이터베이스 연결에 실패했습니다      | DB 연결 오류       | 서비스 점검 안내 |
| `SERVER_003` | 503  | 서비스가 일시적으로 이용 불가능합니다 | 서비스 점검 중     | 점검 안내 페이지 |

---

## 🛠️ **프론트엔드 에러 처리 베스트 프랙티스**

### 🎯 **통합 에러 핸들러**

```typescript
interface ApiError {
    success: false;
    message: string;
    error: {
        code: string;
        details?: Record<string, any>;
    };
}

class ErrorHandler {
    static handle(error: ApiError, context?: string) {
        const { code } = error.error;

        // 에러 카테고리별 처리
        if (code.startsWith("AUTH_")) {
            this.handleAuthError(code, error.message);
        } else if (code.startsWith("VALIDATION_")) {
            this.handleValidationError(code, error);
        } else if (code.startsWith("RATE_LIMIT_")) {
            this.handleRateLimitError(code, error.message);
        } else {
            this.handleGenericError(code, error.message);
        }

        // 에러 로깅 (개발 환경)
        if (process.env.NODE_ENV === "development") {
            console.group(`🚨 API Error: ${code}`);
            console.log("Message:", error.message);
            console.log("Context:", context);
            console.log("Details:", error.error.details);
            console.groupEnd();
        }
    }

    private static handleAuthError(code: string, message: string) {
        switch (code) {
            case "AUTH_002":
            case "AUTH_003":
                // 토큰 삭제 후 재로그인
                localStorage.removeItem("token");
                window.location.href = "/login";
                break;
            default:
                this.showToast(message, "error");
        }
    }

    private static handleValidationError(code: string, error: ApiError) {
        // 필드별 에러 표시
        const details = error.error.details;
        if (details?.field) {
            this.highlightField(details.field, error.message);
        } else {
            this.showToast(error.message, "error");
        }
    }

    private static showToast(
        message: string,
        type: "success" | "error" | "warning"
    ) {
        // Toast 라이브러리 사용
        toast[type](message);
    }

    private static highlightField(fieldName: string, message: string) {
        // 필드 에러 상태 업데이트
        const field = document.querySelector(`[name="${fieldName}"]`);
        field?.classList.add("error");
        // 에러 메시지 표시 로직
    }
}
```

### 🔄 **Retry 메커니즘**

```typescript
class ApiClient {
    private async requestWithRetry<T>(
        url: string,
        options: RequestInit,
        maxRetries = 3
    ): Promise<T> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, options);

                if (response.ok) {
                    return response.json();
                }

                const errorData: ApiError = await response.json();

                // 재시도 가능한 에러인지 확인
                if (this.shouldRetry(response.status, errorData.error.code)) {
                    if (attempt < maxRetries) {
                        await this.delay(1000 * attempt); // 지수 백오프
                        continue;
                    }
                }

                throw errorData;
            } catch (error) {
                if (attempt === maxRetries) throw error;
                await this.delay(1000 * attempt);
            }
        }

        throw new Error("Max retries exceeded");
    }

    private shouldRetry(status: number, errorCode: string): boolean {
        // 5xx 에러와 특정 에러 코드는 재시도
        return (
            status >= 500 ||
            ["RATE_LIMIT_001", "SERVER_001", "UPLOAD_004"].includes(errorCode)
        );
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
```

### 📱 **사용자 친화적 에러 메시지**

```typescript
const UserFriendlyMessages = {
    // 기술적 에러를 사용자 친화적으로 변환
    AUTH_002: "로그인이 만료되었습니다. 다시 로그인해주세요.",
    UPLOAD_003: "이미지 파일은 10MB 이하로 업로드해주세요.",
    RATE_LIMIT_001: "요청이 너무 많아요. 잠시만 기다려주세요.",
    SERVER_001: "일시적인 문제가 발생했습니다. 다시 시도해주세요.",

    // 기본 메시지
    default: "문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

const getDisplayMessage = (errorCode: string, originalMessage: string) => {
    return (
        UserFriendlyMessages[errorCode] ||
        originalMessage ||
        UserFriendlyMessages.default
    );
};
```

이 에러 처리 가이드를 활용하여 **일관되고 사용자 친화적인** 에러 처리 시스템을 구축하세요! 🚀
