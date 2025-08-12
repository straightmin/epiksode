# epiksode Frontend 개발 계획 요약

## 📋 프로젝트 개요

- **프로젝트명**: epiksode (Epic + Episode)
- **서비스 컨셉**: 사진 한 장에 이야기를 담아 공유하는 특별한(epic) 에피소드(episode) 플랫폼
- **기술 스택**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **개발 기간**: 8주
- **백엔드 연동**: 기존 Express.js + PostgreSQL + Prisma 백엔드와 완전 통합

## 🛠️ 기술 스택

### 핵심 기술

```json
{
    "framework": "Next.js 15 (App Router + Turbopack)",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "components": "shadcn/ui",
    "stateManagement": "Zustand",
    "httpClient": "Axios",
    "forms": "React Hook Form + Zod",
    "icons": "Lucide React"
}
```

### 이미지 최적화

- **Next.js Image**: 자동 WebP/AVIF 변환, lazy loading
- **ISR (Incremental Static Regeneration)**: 사진/시리즈 페이지 캐싱
- **CDN 통합**: AWS S3 + CloudFront 연동

## 🎨 UI/UX 설계

### 레이아웃 구조

```
Desktop (1280px+):
┌─────┬─────────────────────────────────────────────┐
│     │ [로고] [검색] [알림] [프로필]               │
│  S  ├─────────────────────────────────────────────┤
│  I  │ [사진] [시리즈] [트렌딩]    [업로드 버튼]   │
│  D  ├─────────────────────────────────────────────┤
│  E  │                                             │
│  B  │              콘텐츠 그리드                   │
│  A  │          (사진 또는 시리즈)                  │
│  R  │                                             │
└─────┴─────────────────────────────────────────────┘

Mobile (768px 이하):
┌─────────────────────────────────┐
│ [로고] [검색] [프로필]           │
├─────────────────────────────────┤
│ [사진] [시리즈] [트렌딩] [업로드] │
├─────────────────────────────────┤
│          콘텐츠 그리드           │
├─────────────────────────────────┤
│ [홈] [탐색] [업로드] [알림] [나] │
└─────────────────────────────────┘
```

### 사이드바 네비게이션 구성

- **메인**: 홈, 탐색, 트렌딩
- **콘텐츠**: 사진, 시리즈, 컬렉션
- **개인**: 내 사진, 내 시리즈, 좋아요, 북마크, 최근 본 사진
- **소셜**: 팔로잉, 알림
- **만들기**: 사진 업로드, 시리즈 만들기
- **설정**: 계정 설정

## 🔗 백엔드 API 연동

### 인증 시스템

```typescript
// JWT 토큰 자동 관리
Authorization: Bearer <token>
Accept-Language: ko|en|ja
```

### 주요 엔드포인트

- **인증**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **사진**: `/api/photos`, `/api/photos/:id`, `/api/photos/liked`
- **시리즈**: `/api/series`, `/api/series/:id`
- **사용자**: `/api/users/me/profile`, `/api/users/me/photos`
- **상호작용**: `/api/likes`, `/api/comments`

## 📱 핵심 기능 설계

### 1. 사진 관리

- **PhotoCard**: 개별 사진 표시 (호버 액션, 메타데이터)
- **PhotoGrid**: Masonry 레이아웃 (무한 스크롤)
- **PhotoModal**: 전체화면 뷰어 (키보드 네비게이션)
- **PhotoUpload**: 드래그&드롭 업로드 (진행률 표시)

### 2. 시리즈 관리

- **SeriesCard**: 시리즈 썸네일 (커버 이미지, 사진 개수)
- **SeriesViewer**: 슬라이드쇼 + 그리드 뷰 전환
- **SeriesEditor**: 시리즈 생성/편집 (사진 순서 관리)

### 3. 상호작용

- **좋아요**: 사진/시리즈/댓글 좋아요
- **북마크**: 컬렉션에 저장
- **댓글**: 중첩 댓글 시스템
- **팔로우**: 사용자 팔로우/언팔로우

## 🚀 8주 개발 로드맵

### Week 1: 프로젝트 설정

- [x] Next.js 15 + TypeScript 초기화
- [x] shadcn/ui 설정 및 기본 컴포넌트
- [x] 사이드바 및 레이아웃 구현
- [x] 라우팅 구조 설계

### Week 2: 사진 기능

- [ ] PhotoCard, PhotoGrid 구현
- [ ] 이미지 최적화 컴포넌트
- [ ] 반응형 Masonry 레이아웃
- [ ] 사진 모달 뷰어

### Week 3: 시리즈 기능

- [ ] SeriesCard, SeriesGrid 구현
- [ ] SeriesViewer (슬라이드쇼)
- [ ] 사진/시리즈 탭 분리
- [ ] 시리즈 편집 기능

### Week 4: 인증 & API

- [ ] 로그인/회원가입 페이지
- [ ] JWT 토큰 관리 (Zustand)
- [ ] API 클라이언트 설정
- [ ] 보호된 라우트

### Week 5: 업로드 & 상호작용

- [ ] 사진 업로드 (진행률)
- [ ] 시리즈 생성/편집
- [ ] 좋아요/북마크 기능
- [ ] 댓글 시스템

### Week 6: 고급 기능

- [ ] 사용자 프로필 페이지
- [ ] 컬렉션 관리
- [ ] 알림 시스템
- [ ] 검색 기능

### Week 7: 소셜 기능

- [ ] 팔로우/팔로잉
- [ ] 트렌딩 알고리즘
- [ ] 최근 본 항목
- [ ] 설정 페이지

### Week 8: 최적화 & 배포

- [ ] SEO 최적화
- [ ] 성능 최적화
- [ ] PWA 기능
- [ ] Vercel 배포

## 📦 설치 명령어

```bash
# 프로젝트 초기화
npx create-next-app@latest epiksode-frontend \
  --typescript --tailwind --eslint --app \
  --src-dir --turbopack --import-alias "@/*"

# shadcn/ui 설정
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog sheet
npx shadcn-ui@latest add badge avatar dropdown-menu tooltip
npx shadcn-ui@latest add tabs separator form label sidebar

# 의존성 설치
npm install zustand axios react-hook-form @hookform/resolvers zod
npm install lucide-react next-themes framer-motion
npm install sharp @vercel/speed-insights @vercel/analytics
```

## 🎯 핵심 특징

### 이미지 최적화

- 자동 WebP/AVIF 변환
- 다중 해상도 지원 (300px → 1920px)
- Lazy loading + blur placeholder
- CDN 캐싱 전략

### 성능 목표

- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **Bundle Size**: < 500KB 초기 로딩

### 접근성

- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환
- 고대비 모드 지원

## 🔧 개발 환경

### 필수 도구

- **Node.js**: 18+
- **npm**: 9+
- **VS Code**: TypeScript, Tailwind 확장

### 개발 명령어

```bash
npm run dev          # 개발 서버 (Turbopack)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run lint         # ESLint 검사
npm run type-check   # TypeScript 타입 검사
```

## 📈 성공 지표

### 기술 지표

- TypeScript 커버리지: 100%
- 테스트 커버리지: >80%
- Lighthouse 점수: >90
- Bundle 최적화: <500KB

### 사용성 지표

- 사진 업로드 완료율: >95%
- 시리즈 생성 성공률: >90%
- 모바일 사용성: 터치 친화적

---

**마지막 업데이트**: 2025-08-09
**담당자**: 종현
**백엔드 연동**: Express.js + PostgreSQL + Prisma
