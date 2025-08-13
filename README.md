# 🎬 epiksode

**에픽소드** - 사진으로 이야기를 나누는 플랫폼

"에픽한 에피소드"를 통해 당신만의 특별한 순간들을 사진으로 공유하세요.

---

## 🚀 프로젝트 개요

### 서비스 컨셉

- **Photo Storytelling**: 사진과 이야기가 결합된 콘텐츠 플랫폼
- **Epic + Episode**: 일상의 특별한 순간들을 에픽한 에피소드로 변환
- **소셜 기능**: 좋아요, 북마크, 댓글, 팔로우 시스템

### 기술 스택

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + 커스텀 테마 시스템
- **Backend**: Express.js + PostgreSQL + Prisma + JWT 인증
- **Storage**: AWS S3 + 이미지 프록시 시스템
- **Build Tool**: Turbopack (개발 환경)
- **Code Quality**: ESLint + Prettier + 엄격한 TypeScript

### 현재 구현 상태

✅ **완료된 핵심 기능**

- 백엔드 API 완전 연동 (목업 데이터 제거)
- JWT 기반 사용자 인증 (로그인/회원가입)
- S3 이미지 업로드 & 프록시 시스템 (URL 생성 로직 개선)
- 반응형 사진 갤러리 (무한 스크롤)
- 사용자 프로필 페이지
- 다크/라이트 모드 테마 시스템
- 코드 품질 개선 (TypeScript 타입 안전성, ESLint 무경고)

🚧 **개발 진행률**: **약 65% 완료** (8주 계획 중 4주차 + 품질 개선)

---

## 🏗️ 프로젝트 구조

```
epiksode/
├── src/
│   ├── app/                    # Next.js App Router (페이지)
│   ├── components/
│   │   ├── layout/            # 레이아웃 (Header, Sidebar)
│   │   ├── photos/            # 사진 관련 (PhotoGrid, PhotoModal)
│   │   ├── images/            # 이미지 처리 (PhotoImage)
│   │   ├── common/            # 공통 컴포넌트 (ErrorBoundary)
│   │   └── ui/                # 기본 UI 컴포넌트
│   ├── contexts/              # React 컨텍스트 (AuthContext)
│   ├── hooks/                 # 커스텀 훅
│   ├── lib/                   # 유틸리티 (API 클라이언트)
│   └── types/                 # TypeScript 타입 정의
├── frontend-theme-system/      # 커스텀 테마 시스템
├── docs/                      # 개발 문서 및 API 가이드
├── public/images/             # 정적 이미지 자원
├── .editorconfig              # 에디터 설정
├── .prettierrc                # 코드 포매팅
├── .vscode/settings.json      # VS Code 설정
└── CLAUDE.md                  # 개발 가이드
```

---

## 🛠️ 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 3. 빌드 및 실행

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint
```

---

## 📐 개발 가이드

### 코딩 컨벤션

- **들여쓰기**: 스페이스 4칸
- **네이밍**: 카멜케이스 (변수, 함수)
- **주석**: 중요 기능 위주 (9:1 비율)
- **포매팅**: Prettier 자동 적용

### Git 워크플로우

- **브랜치 전략**: Git Flow 기반 릴리즈 브랜치 전략 (v0.2.0부터 적용)
- **메인 브랜치**: `main` (프로덕션), `develop` (개발)
- **피처 브랜치**: `feature/기능명`에서 개발 후 `develop`으로 머지
- **릴리즈 브랜치**: `release/v{버전}`으로 릴리즈 준비
- **커밋 메시지**: 한글로 작성, 기능 단위로 구분

### 개발 환경

- **VS Code**: 워크스페이스 설정 자동 적용
- **자동 포매팅**: 저장 시 자동 실행
- **ESLint**: 코드 품질 검사 자동화

---

## 🎨 테마 시스템

### 브랜드 컬러

```css
/* 메인 브랜드 컬러 */
--primary-purple: rgb(138, 92, 245) /* 메인 브랜드 */
    --primary-purple-dark: rgb(109, 73, 194) /* 호버/액티브 */
    --epic: rgb(236, 72, 153) /* "Epic" 모멘트 (핑크) */
    --episode: rgb(138, 92, 245) /* "Episode" 스토리 (퍼플) */
    --story: rgb(34, 211, 238) /* 내러티브 플로우 (시안) */;
```

### 반응형 브레이크포인트

- **Mobile**: 640px 이하
- **Tablet**: 768px 이하
- **Desktop**: 1024px 이상
- **Wide**: 1280px 이상

---

## 📋 개발 로드맵

### 1-2주차 ✅ (완료)

- [x] 개발 환경 설정 (ESLint, Prettier, TypeScript)
- [x] 기본 레이아웃 구조 (Header, Sidebar, MainLayout)
- [x] 프로젝트 구조 확립 (App Router, 컴포넌트 구조)
- [x] 테마 시스템 구현 (커스텀 테마, 다크 모드)
- [x] 기본 UI 컴포넌트 (Button, Card, Dialog 등)

### 3-4주차 ✅ (완료)

- [x] **백엔드 API 완전 연동**
- [x] **JWT 인증 시스템** (로그인, 회원가입, 인증 상태 관리)
- [x] **S3 이미지 프록시 시스템** (썸네일, 원본 이미지)
- [x] **사진 업로드 기능** (드래그 앤 드롭, 진행률 표시)
- [x] **사진 표시 시스템** (PhotoGrid, PhotoModal, 무한스크롤)
- [x] **프로필 페이지** (사용자 정보, 사진 갤러리)
- [x] **반응형 디자인** (모바일, 태블릿, 데스크톱)

### 5-6주차 (진행 예정)

- [x] **소셜 기능** (좋아요, 댓글, 북마크)
- [x] **팔로우 시스템** (팔로우/언팔로우, 팔로잉 피드)
- [x] **검색 기능** (사진 검색, 사용자 검색, 태그 검색)
- [x] **시리즈 관리** (시리즈 생성, 편집, 슬라이드쇼)

### 7-8주차 (계획)

- [ ] **성능 최적화** (이미지 최적화, 코드 분할, 캐싱)
- [ ] **고급 기능** (알림 시스템, 컬렉션)
- [ ] **배포 준비** (프로덕션 빌드, CI/CD, 모니터링)

---

## 🔗 주요 리소스

### 📚 개발 문서

- [**CLAUDE.md**](CLAUDE.md) - 개발자 필수 가이드 (API, 인증, 환경설정)
- [프론트엔드 개발 계획](docs/project/frontend/FRONTEND_DEVELOPMENT_PLAN.md)
- [API 문서](docs/api/api_documentation.md) - 백엔드 API 명세
- [인증 가이드](docs/collaboration/authentication_guide.md) - JWT 인증 시스템
- [개발 환경 설정](docs/collaboration/development_setup.md) - 로컬 개발 가이드
- [릴리즈 브랜치 전략](docs/collaboration/release_branch_strategy.md) - Git Flow 기반 브랜치 관리

### 🎨 디자인 시스템

- [테마 시스템](frontend-theme-system/) - 커스텀 테마 및 디자인 컴포넌트

### 🌐 외부 리소스

- [Next.js 15 문서](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## 📞 문의

프로젝트 관련 문의사항이나 제안이 있으시면 이슈를 통해 연락해 주세요.

---

<div align="center">

**🎬 epiksode** - _당신의 순간을 에픽하게_

</div>
