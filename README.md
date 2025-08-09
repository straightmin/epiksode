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

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Express.js + PostgreSQL + Prisma
- **Build Tool**: Turbopack (개발 환경)
- **Code Quality**: ESLint + Prettier

---

## 🏗️ 프로젝트 구조

```
epiksode/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   └── layout/            # 레이아웃 컴포넌트
│   └── ...
├── frontend-theme-system/      # 테마 시스템
├── docs/                      # 프로젝트 문서
├── .editorconfig              # 에디터 설정
├── .prettierrc                # 코드 포매팅
└── .vscode/settings.json      # VS Code 설정
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

- **브랜치 전략**: `develop`에서 피처 브랜치 분기
- **커밋 단위**: 기능 단위로 구분
- **커밋 메시지**: 한글로 작성

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

### 1주차 ✅ (완료)

- [x] 개발 환경 설정
- [x] 기본 레이아웃 구조
- [x] 프로젝트 구조 확립

### 2주차 (진행 예정)

- [ ] 테마 시스템 구현
- [ ] 사진 업로드 기능
- [ ] 기본 UI 컴포넌트

### 3-4주차

- [ ] 시리즈 관리 기능
- [ ] API 통합
- [ ] 사용자 인증

### 5-6주차

- [ ] 소셜 기능 (좋아요, 댓글)
- [ ] 팔로우 시스템
- [ ] 검색 기능

### 7-8주차

- [ ] 성능 최적화
- [ ] 반응형 완성
- [ ] 배포 준비

---

## 🔗 주요 리소스

### 개발 문서

- [프론트엔드 개발 계획](docs/FRONTEND_DEVELOPMENT_PLAN.md)
- [테마 시스템 가이드](frontend-theme-system/)

### 외부 리소스

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
