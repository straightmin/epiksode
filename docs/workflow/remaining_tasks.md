# 🚀 epiksode 남은 개발 작업 목록

> **작성일**: 2025-08-12  
> **현재 상태**: Phase 1 완료, Phase 2 진행 중  
> **전체 진행률**: ~75% 완료

## 📊 현재 완료 상태

### ✅ **완료된 기능들**
1. **댓글 시스템 백엔드 연동** - `feature/comment-system-api-integration` 브랜치
   - PhotoModal에서 실제 API 호출 (getComments, createComment)
   - 답글 작성 및 중첩 댓글 지원
   - 댓글 로딩 상태 및 에러 처리
   - 인증 상태에 따른 댓글 작성 권한 제어
   - 낙관적 업데이트로 UX 개선

2. **사진 업로드 기능 실제 API 연동** - `feature/photo-upload-api-integration` 브랜치
   - 실제 uploadPhoto API 호출로 변경
   - FormData 기반 multipart 파일 업로드
   - 실시간 업로드 진행률 표시
   - 인증 상태 확인 및 보안 처리
   - 업로드 완료 후 홈페이지 자동 이동

3. **기존 완료 기능들**
   - 기본 프로젝트 구조 (Next.js 15 + TypeScript)
   - 테마 시스템 구축 (`frontend-theme-system/`)
   - API 클라이언트 시스템 (JWT 토큰 관리)
   - 인증 시스템 (AuthContext + useAuth)
   - 사진 표시 시스템 (PhotoGrid, PhotoCard, PhotoModal)
   - S3 이미지 프록시 연동
   - 좋아요 시스템 (사진 좋아요)

---

## 🎯 우선순위 남은 작업

### **Phase 2: 소셜 기능 완성** (우선순위: 높음)

#### **1. 검색 기능 백엔드 연동** 
**브랜치**: `feature/search-api-integration` (생성 필요)  
**파일**: `src/app/search/page.tsx`  
**현재 상태**: 완전한 검색 UI 구현, 클라이언트 필터링만 동작  

**작업 내용**:
- [ ] 클라이언트 필터링을 백엔드 검색 API로 변경
- [ ] 실시간 검색 (디바운싱) 구현
- [ ] 필터링 및 정렬 백엔드 연동
- [ ] 검색 결과 무한 스크롤
- [ ] 사용자 검색 기능 추가 (현재 "준비 중" 상태)

**예상 작업 시간**: 4-6시간

#### **2. 시리즈 기능 백엔드 연동**
**브랜치**: `feature/series-api-integration` (생성 필요)  
**파일**: `src/app/series/create/page.tsx`  
**현재 상태**: 완전한 UI 구현, 시뮬레이션 저장만 동작  

**작업 내용**:
- [ ] 시리즈 생성 API 연동
- [ ] 시리즈 목록 조회 API 연동
- [ ] 시리즈 상세 뷰어 구현
- [ ] 시리즈 편집 기능 구현
- [ ] 시리즈 삭제 기능
- [ ] 사진 순서 변경 백엔드 연동

**예상 작업 시간**: 6-8시간

#### **3. 팔로우 시스템 구현**
**브랜치**: `feature/follow-system` (생성 필요)  
**파일**: PhotoModal, 프로필 페이지들  
**현재 상태**: API 클라이언트에 기초 구조만 존재  

**작업 내용**:
- [ ] 팔로우/언팔로우 API 연동
- [ ] PhotoModal에 팔로우 버튼 추가
- [ ] 프로필 페이지 팔로워/팔로잉 수 표시
- [ ] 팔로잉 피드 기능 구현 (선택사항)
- [ ] 팔로우 추천 시스템 (선택사항)

**예상 작업 시간**: 4-5시간

---

### **Phase 3: 고급 기능 및 최적화** (우선순위: 중간)

#### **4. 댓글 좋아요 시스템**
**브랜치**: 기존 `feature/comment-system-api-integration`에 추가  
**현재 상태**: UI는 완성, TODO 주석으로 표시됨  

**작업 내용**:
- [ ] 댓글 좋아요 API 연동 (백엔드 준비 시)
- [ ] 답글 좋아요 API 연동
- [ ] 에러 처리 및 낙관적 업데이트 완성

**예상 작업 시간**: 2-3시간

#### **5. 알림 시스템**
**브랜치**: `feature/notification-system` (생성 필요)  
**현재 상태**: 미구현  

**작업 내용**:
- [ ] 알림 컴포넌트 UI 구현
- [ ] 알림 목록 API 연동
- [ ] 읽음/안읽음 상태 관리
- [ ] 실시간 알림 (WebSocket 또는 폴링)
- [ ] 알림 설정 페이지

**예상 작업 시간**: 8-10시간

#### **6. 북마크 시스템**
**브랜치**: `feature/bookmark-system` (생성 필요)  
**현재 상태**: 미구현  

**작업 내용**:
- [ ] 북마크 API 연동
- [ ] PhotoCard/PhotoModal에 북마크 버튼 추가
- [ ] 북마크한 사진 목록 페이지
- [ ] 북마크 컬렉션 기능 (선택사항)

**예상 작업 시간**: 4-6시간

---

## 🔧 기술적 개선 작업 (우선순위: 낮음)

### **7. 성능 최적화**
- [ ] 이미지 레이지 로딩 개선
- [ ] 무한 스크롤 성능 최적화
- [ ] React.memo 및 useMemo 적용 확대
- [ ] 번들 사이즈 최적화
- [ ] Core Web Vitals 개선

### **8. 사용자 경험 개선**
- [ ] 다크 모드 개선
- [ ] 모바일 반응형 개선
- [ ] 키보드 접근성 개선
- [ ] 로딩 스켈레톤 UI 추가

---

## 📋 다음 세션 작업 권장사항

### **즉시 시작 가능한 작업** (추천 순서)

1. **검색 기능 백엔드 연동** - 가장 사용자에게 눈에 띄는 기능
2. **시리즈 기능 백엔드 연동** - 핵심 기능 완성
3. **팔로우 시스템** - 소셜 기능 완성

### **작업 시작 명령어**
```bash
# develop 브랜치로 이동
git checkout develop

# 새 기능 브랜치 생성 (예: 검색 기능)
git checkout -b feature/search-api-integration

# 작업 진행...
# 완료 후 커밋
git add .
git commit -m "feat: 검색 기능 백엔드 API 연동 완료"
```

---

## 🏗️ 프로젝트 아키텍처 참고

### **주요 파일 위치**
- **API 클라이언트**: `src/lib/api-client.ts`
- **인증 시스템**: `src/contexts/AuthContext.tsx`
- **타입 정의**: `src/types/index.ts`
- **테마 시스템**: `frontend-theme-system/`

### **중요 개발 명령어**
```bash
npm run dev          # 개발 서버 (Turbopack)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
npm run format       # Prettier 포매팅
```

### **환경 변수**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

---

## 🎯 성공 지표

### **완료 기준**
- [ ] 모든 UI 기능이 실제 API와 연동
- [ ] 에러 처리 및 로딩 상태 완비
- [ ] 인증/권한 체크 완료
- [ ] 반응형 디자인 완성
- [ ] 성능 최적화 (Core Web Vitals)

### **품질 체크리스트**
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음
- [ ] 빌드 성공
- [ ] 모든 브라우저에서 동작 확인

---

## 📝 참고 문서

- **프로젝트 개요**: `CLAUDE.md`
- **API 문서**: `docs/api/api_documentation.md`
- **백엔드 연동 가이드**: `docs/FRONTEND_INTEGRATION_GUIDE.md`
- **개발 계획**: `docs/FRONTEND_DEVELOPMENT_PLAN.md`

---

*마지막 업데이트: 2025-08-12 - 댓글 시스템 및 사진 업로드 API 연동 완료*