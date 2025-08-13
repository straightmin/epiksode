# 🚀 epiksode 프론트엔드 API 연동 워크플로우

**작성일**: 2025년 8월 10일  
**현재 상태**: Phase 3 API 연동 준비 완료  
**브랜치**: `feature/frontend-backend-sync-phase1-3`  
**목표**: 백엔드와의 완전한 API 연동 및 실동 가능한 서비스 구축

---

## 📊 **현재 상황 분석**

### ✅ **준비 완료된 요소들**

1. **API 샘플 데이터** → `docs/api/api_samples/` (로그인, 사진 목록, 댓글 등)
2. **백엔드 협업 문서** → `docs/collaboration/` (스키마, 타입, 에러 코드)
3. **UI 컴포넌트 시스템** → `src/components/` (PhotoCard, PhotoGrid, 레이아웃 등)
4. **페이지 라우팅 구조** → `src/app/` (메인, 프로필, 검색, 업로드)
5. **테마 시스템** → `frontend-theme-system/` (완전 구축 완료)

### ⚠️ **수정 필요한 요소들**

1. **타입 불일치** → 현재 `src/types/index.ts`가 백엔드 실제 스키마와 다름
2. **API 클라이언트** → HTTP 클라이언트 및 에러 처리 시스템 미구현
3. **인증 시스템** → JWT 토큰 관리 및 상태 관리 미구현
4. **실데이터 연동** → 목업 데이터에서 실제 API 호출로 전환 필요

---

## 🎯 **Phase 3: API 연동 워크플로우**

### **Week 1: 기반 시스템 구축** (Priority: Critical)

#### **Day 1-2: 타입 시스템 동기화**

```typescript
// 🔄 현재 작업: 타입 정의 완전 교체
// 📁 대상 파일: src/types/index.ts
// 📋 작업 내용: docs/collaboration/api_response_types.ts 기반으로 재정의

작업 순서:
1. 기존 타입 백업 및 제거
2. 백엔드 제공 정확한 타입 적용
3. 모든 컴포넌트 타입 에러 수정
4. 타입 안전성 검증
```

**예상 작업량**: 6-8시간  
**차단 요소**: 없음 (백엔드 타입 문서 준비 완료)

#### **Day 3: API 클라이언트 시스템 구축**

```typescript
// 🔄 현재 작업: HTTP 클라이언트 + 에러 처리 시스템
// 📁 생성 파일: src/lib/api-client.ts, src/lib/auth.ts
// 📋 기능: 토큰 관리, 에러 처리, API 요청 래퍼

핵심 기능:
- JWT 토큰 자동 관리 (저장/갱신/만료 처리)
- 통합 에러 처리 (docs/collaboration/error_codes.md 기반)
- API 요청 래퍼 함수들 (photos, users, auth 등)
- 인터셉터 (요청/응답 전후 처리)
```

**예상 작업량**: 4-6시간  
**참고 문서**: `docs/collaboration/error_codes.md`, `docs/collaboration/authentication_guide.md`

#### **Day 4: 인증 시스템 구현**

```typescript
// 🔄 현재 작업: React Context 기반 인증 상태 관리
// 📁 생성 파일: src/contexts/AuthContext.tsx, src/hooks/useAuth.ts
// 📋 기능: 로그인/로그아웃, 토큰 관리, 사용자 상태 전역 관리

주요 기능:
- AuthContext Provider 구현
- 로그인/회원가입 상태 관리
- 보호된 라우트 처리
- 토큰 만료 시 자동 갱신 또는 로그아웃
```

**예상 작업량**: 4-5시간  
**의존성**: API 클라이언트 완료 후

#### **Day 5: 기본 API 연동 (사진 목록 조회)**

```typescript
// 🔄 현재 작업: PhotoGrid 컴포넌트 실제 API 연동
// 📁 수정 파일: src/components/photos/PhotoGrid.tsx
// 📋 기능: 무한 스크롤 + 실제 백엔드 데이터

핵심 작업:
- 목업 데이터 제거
- 실제 GET /api/photos 호출
- 무한 스크롤 구현 (커서 or 페이지 기반)
- 로딩 상태 및 에러 처리
```

**예상 작업량**: 3-4시간  
**테스트**: `docs/api/api_samples/photos/photo_list.json`으로 검증

---

### **Week 2: 핵심 기능 연동** (Priority: High)

#### **Day 6-7: 사용자 인터랙션 (좋아요/댓글)**

```typescript
// 🔄 현재 작업: 좋아요, 댓글 기능 실제 API 연동
// 📁 수정 파일: PhotoCard, PhotoModal 컴포넌트
// 📋 API: POST /api/likes, GET /api/comments, POST /api/comments

주요 기능:
- 좋아요 토글 (즉시 UI 업데이트 + API 호출)
- 댓글 목록 조회 및 작성
- 대댓글 지원
- 실시간 업데이트 (옵션)
```

**예상 작업량**: 6-8시간  
**참고 문서**: `docs/api/api_samples/interactions/`

#### **Day 8-9: 사진 업로드 시스템**

```typescript
// 🔄 현재 작업: 파일 업로드 + 진행률 표시
// 📁 수정 파일: src/app/upload/page.tsx
// 📋 API: POST /api/photos (multipart/form-data)

핵심 기능:
- 드래그 앤 드롭 업로드
- 업로드 진행률 표시
- 이미지 미리보기
- 메타데이터 입력 (제목, 설명)
- 업로드 성공 후 리다이렉트
```

**예상 작업량**: 6-8시간  
**참고 문서**: `docs/collaboration/development_setup.md` (파일 업로드 스펙)

#### **Day 10: 프로필 시스템**

```typescript
// 🔄 현재 작업: 사용자 프로필 조회 및 수정
// 📁 수정 파일: src/app/profile/page.tsx
// 📋 API: GET /api/users/me, PUT /api/users/me/profile

주요 기능:
- 현재 사용자 정보 표시
- 프로필 이미지/정보 수정
- 내가 업로드한 사진 목록
- 팔로워/팔로잉 관계
```

**예상 작업량**: 4-5시간

---

### **Week 3: 고급 기능 구현** (Priority: Medium)

#### **Day 11-12: 시리즈 기능**

```typescript
// 🔄 현재 작업: 시리즈 생성/조회 기능
// 📁 수정 파일: src/app/series/create/page.tsx
// 📋 API: POST /api/series, GET /api/series/:id

주요 기능:
- 시리즈 생성 (여러 사진 선택)
- 시리즈 상세 뷰어
- 사진 순서 변경
- 시리즈 메타데이터 관리
```

#### **Day 13: 검색 시스템**

```typescript
// 🔄 현재 작업: 통합 검색 (사진/사용자)
// 📁 수정 파일: src/app/search/page.tsx
// 📋 API: GET /api/search?q=&type=

주요 기능:
- 실시간 검색 (디바운싱)
- 필터링 (사진/사용자/시리즈)
- 정렬 옵션 (최신순/인기순)
- 검색 결과 무한 스크롤
```

#### **Day 14: 알림 시스템**

```typescript
// 🔄 현재 작업: 알림 목록 및 읽음 처리
// 📁 추가 파일: src/components/notifications/
// 📋 API: GET /api/notifications, PATCH /api/notifications/:id/read

주요 기능:
- 알림 목록 표시
- 읽음/안읽음 상태 관리
- 알림 타입별 UI 차별화
- 실시간 알림 (WebSocket or Polling)
```

---

### **Week 4: 최적화 및 마무리** (Priority: Low)

#### **Day 15-16: 성능 최적화**

- **이미지 레이지 로딩** (Intersection Observer)
- **컴포넌트 메모이제이션** (React.memo, useMemo)
- **번들 최적화** (Code Splitting, Dynamic Import)
- **API 응답 캐싱** (React Query 검토)

#### **Day 17: 에러 처리 개선**

- **글로벌 에러 바운더리**
- **토스트 알림 시스템**
- **네트워크 오류 재시도 로직**
- **사용자 친화적 에러 메시지**

#### **Day 18: 테스트 및 품질 보증**

- **E2E 테스트** (주요 사용자 플로우)
- **접근성 검증** (WCAG 2.1 AA)
- **브라우저 호환성** 테스트
- **모바일 반응형** 최종 검증

---

## ⚡ **즉시 실행 작업 (Today)**

### **Step 1: 타입 시스템 동기화 시작**

```bash
# 1. 현재 타입 백업
cp src/types/index.ts src/types/index.ts.backup

# 2. 새로운 정확한 타입 적용
# → docs/collaboration/api_response_types.ts 내용을 기반으로 재작성

# 3. 타입 에러 확인
npm run dev  # 타입 에러들을 확인하고 하나씩 수정
```

### **Step 2: API 클라이언트 기초 구조 생성**

```typescript
// src/lib/api-client.ts 파일 생성
// → docs/collaboration/error_codes.md 기반 에러 처리
// → JWT 토큰 관리 시스템 포함
```

### **Step 3: 인증 Context 준비**

```typescript
// src/contexts/AuthContext.tsx 파일 생성
// → 로그인/로그아웃 상태 관리
// → 토큰 저장/갱신 로직
```

---

## 🎯 **성공 지표 (KPIs)**

### **Week 1 목표**

- [ ] 타입 에러 0개 (완전 동기화)
- [ ] API 클라이언트 기본 구조 완성
- [ ] 인증 시스템 구현 완료
- [ ] 사진 목록 실제 API 연동 성공

### **Week 2 목표**

- [ ] 좋아요/댓글 기능 완전 동작
- [ ] 사진 업로드 성공률 95% 이상
- [ ] 프로필 시스템 완전 동작

### **Week 3 목표**

- [ ] 시리즈 생성/조회 기능 완성
- [ ] 검색 시스템 응답 속도 < 500ms
- [ ] 알림 시스템 실시간 동작

### **Week 4 목표**

- [ ] 페이지 로드 속도 < 3초
- [ ] 모바일 완전 호환성
- [ ] 접근성 AA 등급 달성

---

## 🚨 **리스크 및 대응 방안**

### **High Risk**

1. **타입 불일치로 인한 런타임 에러**  
   → 점진적 타입 적용 + 철저한 테스트

2. **API 응답 지연 또는 에러**  
   → 재시도 로직 + 사용자 친화적 에러 메시지

### **Medium Risk**

3. **이미지 업로드 용량 문제**  
   → 프론트엔드 압축 + 진행률 표시

4. **무한 스크롤 성능 문제**  
   → 가상화 스크롤 + 메모이제이션

### **Low Risk**

5. **브라우저 호환성 문제**  
   → Progressive Enhancement 적용

---

## 🤝 **협업 체크포인트**

### **백엔드팀과의 소통**

- **Week 1 종료 시**: API 연동 상태 점검 및 이슈 공유
- **Week 2 중간**: 성능 및 사용자 경험 피드백
- **Week 3 완료**: 최종 통합 테스트 및 버그 수정
- **Week 4**: 배포 준비 및 모니터링 설정

### **일일 체크리스트**

- [ ] 당일 목표 달성률 확인
- [ ] 차단 요소 식별 및 해결책 모색
- [ ] 코드 품질 검토 (ESLint, TypeScript)
- [ ] 다음날 작업 우선순위 정리

---

**🚀 준비 완료! 백엔드 협업 문서와 샘플 데이터가 모두 준비되어 있어서 즉시 API 연동 작업을 시작할 수 있습니다!**
