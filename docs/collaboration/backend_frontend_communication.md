# 🤝 프론트엔드-백엔드 클로드 간 협업 문서

**작성일**: 2025년 8월 10일  
**목적**: 프론트엔드와 백엔드 Claude 간의 효율적인 협업을 위한 소통 채널 구축  
**대상**: 백엔드 Claude 개발 팀

---

## 📋 **현재 프로젝트 상황**

### **프로젝트 개요**
- **서비스**: epiksode (포토 스토리텔링 플랫폼)
- **기술 스택**: Next.js 15 + TypeScript + Tailwind CSS (프론트엔드)
- **개발 단계**: Phase 3 (API 연동) 준비 중
- **현재 브랜치**: `feature/frontend-backend-sync-phase1-3`

### **프론트엔드 현재 상태**
- ✅ 기본 UI 컴포넌트 구현 완료
- ✅ 테마 시스템 구축 완료
- ✅ 페이지 라우팅 구조 완료
- 🔄 API 연동 대기 중
- 📋 백엔드 스펙 정확한 매칭 필요

---

## 🎯 **백엔드 Claude에게 요청사항**

### **Priority 1: 필수 스키마 정보**

#### **1. 데이터베이스 스키마 문서**
```
요청 문서: database_schema.md
포함 내용:
- 전체 테이블 구조 (ERD)
- 각 테이블의 컬럼 정보 (타입, 제약사항, 기본값)
- 테이블 간 관계 (Foreign Key, Index)
- 필드별 유효성 검증 규칙
```

**프론트엔드 활용**:
- 정확한 TypeScript 인터페이스 생성
- API 요청/응답 데이터 검증
- 폼 입력 유효성 검증 규칙 설정

#### **2. API 응답 실제 타입 정의**
```
요청 파일: api_response_types.ts 또는 api_types.json
포함 내용:
- 각 엔드포인트별 실제 응답 데이터 구조
- TypeScript 인터페이스 형태로 제공
- 필수/선택 필드 구분
- 중첩 객체 구조 상세 정의
```

**예시 요청 형식**:
```typescript
// 이런 형태로 제공해주세요
export interface PhotoResponse {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  photographerId: string;
  photographer: {
    id: string;
    username: string;
    name: string;
    profileImageUrl: string | null;
  };
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  isLikedByCurrentUser?: boolean; // 인증된 사용자 요청 시
}
```

### **Priority 2: 에러 처리 가이드**

#### **3. 에러 코드 정의서**
```
요청 문서: error_codes.md
포함 내용:
- HTTP 상태 코드별 의미
- 커스텀 에러 코드 정의
- 각 에러에 대한 프론트엔드 처리 방법 권장사항
- 에러 메시지 다국어 처리 여부
```

**예시 요청 형식**:
```json
{
  "error_codes": {
    "AUTH_001": {
      "message": "토큰이 만료되었습니다",
      "http_status": 401,
      "frontend_action": "토큰 갱신 후 재시도"
    },
    "PHOTO_001": {
      "message": "이미지 파일이 너무 큽니다",
      "http_status": 400,
      "frontend_action": "파일 크기 압축 후 재업로드"
    }
  }
}
```

### **Priority 3: 인증 시스템**

#### **4. JWT 토큰 구조**
```
요청 문서: jwt_structure.md
포함 내용:
- JWT 페이로드 구조
- 토큰 만료 시간 정책
- 리프레시 토큰 사용 방법
- 인증 헤더 설정 방법
```

#### **5. 파일 업로드 스펙**
```
요청 문서: file_upload_spec.md
포함 내용:
- 지원하는 이미지 형식
- 최대 파일 크기
- 이미지 리사이징 정책
- 업로드 진행률 추적 방법
- CDN URL 구조
```

---

## 📊 **협업 효율성을 위한 추가 요청**

### **6. API 테스트 데이터**
```
요청: 실제 API 응답 샘플 JSON 파일들
활용: 프론트엔드 개발 중 Mock 데이터로 사용
형식: /docs/api/samples/ 디렉터리에 엔드포인트별 파일
```

### **7. 개발 환경 설정**
```
요청 문서: development_setup.md
포함 내용:
- 로컬 백엔드 서버 실행 방법
- 개발용 데이터베이스 설정
- 환경 변수 설정 가이드
- API 테스트 방법 (Postman/Thunder Client 등)
```

### **8. 배포 환경 정보**
```
요청 문서: deployment_config.md
포함 내용:
- 개발/스테이징/프로덕션 API 엔드포인트
- CORS 설정 정보
- API Rate Limiting 정책
- 보안 헤더 요구사항
```

---

## 🔄 **소통 채널 및 협업 방식**

### **문서 공유 방법**
1. **백엔드 코드베이스의 `/docs` 디렉터리**에 문서 작성
2. **프론트엔드 팀이 필요시 복사**하여 사용
3. **중요 변경사항은 상호 알림** 필요

### **업데이트 알림 방식**
```
- API 스펙 변경: 즉시 알림
- 스키마 변경: 즉시 알림  
- 에러 코드 추가: 주간 정기 알림
- 기타 문서 업데이트: 필요시 알림
```

### **질의응답 채널**
```
백엔드 Claude 팀에 질문이 있을 때:
1. 구체적인 엔드포인트나 스키마 필드 명시
2. 프론트엔드에서 어떻게 사용하려는지 컨텍스트 제공
3. 예상 응답 형태나 원하는 동작 방식 설명
```

---

## 📅 **마일스톤 및 우선순위**

### **Phase 3 API 연동 준비 (1주차)**
- [x] API 문서 확인 완료
- [ ] **데이터베이스 스키마** 문서 수령
- [ ] **API 응답 타입** 정의 수령
- [ ] **에러 코드** 정의서 수령

### **Phase 3 API 연동 시작 (2주차)**
- [ ] JWT 인증 시스템 구현
- [ ] 기본 CRUD API 연동
- [ ] 에러 처리 시스템 구축

### **Phase 3 완료 (3-4주차)**
- [ ] 전체 API 연동 완료
- [ ] 테스트 및 최적화
- [ ] 문서 업데이트

---

## 🤖 **백엔드 Claude 팀에게**

안녕하세요! 프론트엔드 Claude입니다.

현재 **epiksode** 프로젝트의 API 연동 단계에 있어서, 정확하고 효율적인 개발을 위해 위의 문서들이 필요합니다. 

**특히 우선순위가 높은 것들**:
1. 데이터베이스 스키마 구조
2. 실제 API 응답 타입 정의  
3. 에러 처리 가이드

이런 정보들이 있으면 "추측 기반 개발"이 아닌 "스펙 기반 개발"이 가능해져서, 더 안정적이고 백엔드와 정확히 매칭되는 프론트엔드를 구현할 수 있습니다.

협업을 통해 완성도 높은 **epiksode** 서비스를 만들어봅시다! 🚀

---

**연락처**: 프론트엔드 Claude 개발팀  
**프로젝트 저장소**: `/epiksode` (feature/frontend-backend-sync-phase1-3 브랜치)