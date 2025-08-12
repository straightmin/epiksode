# 🔍 epiksode 프론트엔드-백엔드 불일치 종합 분석 보고서

## 📋 분석 개요

**분석 일시**: 2025년 8월 10일  
**분석 범위**: 전체 프론트엔드 코드베이스 vs 백엔드 API 스펙  
**분석 깊이**: --ultrathink (최대 심도 분석)  
**분석 목적**: 백엔드에서 지원하지 않는 엉뚱한 기능이나 불일치 사항 탐지

---

## 🚨 **CRITICAL - 즉시 해결 필요**

### 1. 북마크 기능 - 전체적 구현 vs API 부재

**심각도**: 🔴 CRITICAL  
**영향 범위**: 전체 애플리케이션

#### 현재 상황
```typescript
// 프론트엔드: 북마크 기능이 광범위하게 구현됨
interface PhotoData {
    isBookmarked: boolean;  // ❌ 백엔드 미지원
}

// 구현된 컴포넌트들
- PhotoCard.tsx: 북마크 버튼 구현
- PhotoModal.tsx: 북마크 토글 (키보드 'B' 단축키)
- Sidebar.tsx: "/bookmarks" 페이지 링크
- ProfilePage: "bookmarked" 탭 (24개 북마크 표시)
```

**API 문서에서 누락**:
- 북마크 토글 API 없음
- 북마크한 사진 목록 API 없음
- 컬렉션 API는 있지만 개별 북마크와는 다른 개념

**사용자 영향도**: 높음 - 클릭 시 작동하지 않는 기능으로 혼란 야기

---

### 2. 네비게이션 페이지 - 존재하지 않는 페이지들

**심각도**: 🔴 CRITICAL  
**영향 범위**: 전체 네비게이션 시스템

#### 미구현 페이지 목록
```typescript
// Sidebar.tsx에 정의되어 있지만 실제 페이지 없음
const nonExistentPages = [
    "/explore",        // 탐색 페이지
    "/trending",       // 트렌딩 페이지  
    "/photos",         // 사진 목록 페이지
    "/series",         // 시리즈 목록 페이지
    "/liked",          // 좋아요한 사진 페이지
    "/bookmarks",      // 북마크 페이지 ❌ API도 없음
    "/notifications"   // 알림 페이지 (API는 있음)
];
```

**문제점**:
- 사이드바 클릭 시 404 에러 발생
- 사용자 경험 저하
- MVP 범위와 실제 구현의 괴리

---

## ⚠️ **HIGH - 높은 우선순위**

### 3. PhotoData 인터페이스 - 백엔드 미지원 필드들

**심각도**: 🟡 HIGH  
**영향 범위**: 데이터 모델 전반

#### 백엔드에서 지원하지 않는 필드들
```typescript
export interface PhotoData {
    // ✅ 백엔드 지원 필드들
    id: string;           // ✅
    title: string;        // ✅
    description: string;  // ✅
    likes: number;        // ✅
    comments: number;     // ✅
    isLiked: boolean;     // ✅
    photographer: {...};  // ✅
    createdAt: string;    // ✅
    
    // ❌ 백엔드 미지원 필드들
    views: number;                // 조회수 - API 미지원
    isBookmarked: boolean;        // 북마크 상태 - API 미지원  
    isEpicMoment?: boolean;       // 에픽 순간 - API 미지원
    location?: string;            // 위치 정보 - API 불명확
    camera?: string | {...};     // 카메라 정보 - API 미지원
}
```

#### 상세 분석

**조회수 (views) 필드**:
- 현재 모든 목업 데이터에 하드코딩
- PhotoModal에서 표시되지만 실제 카운팅 불가
- 사용자에게 부정확한 정보 제공

**에픽 순간 (isEpicMoment) 필드**:
- PhotoModal에서 별 아이콘으로 표시
- 브랜드 색상 `epic: "rgb(236, 72, 153)"` 정의되어 있음
- 백엔드에서 이 개념을 지원하지 않음

**카메라 정보 (camera) 필드**:
```typescript
// 복잡한 카메라 메타데이터 구조
camera: {
    make: "Canon",
    model: "EOS R5", 
    lens: "RF 24-70mm f/2.8L",
    settings: {
        aperture: "f/8",
        shutterSpeed: "1/125s", 
        iso: "ISO 400",
        focalLength: "35mm"
    }
}
```
- PhotoModal에서 세부 정보 표시
- 백엔드 API에서 지원하지 않는 메타데이터

---

### 4. 검색 기능 - 제한적 백엔드 지원

**심각도**: 🟡 HIGH  
**영향 범위**: 검색 페이지

#### 현재 구현 vs API 스펙
```typescript
// 프론트엔드 검색 필터
interface SearchFilters {
    query?: string;           // ✅ 지원 가능
    category?: 'all' | 'photos' | 'users';  // ❌ users 검색 API 없음
    sortBy?: 'latest' | 'popular' | 'trending'; // ⚠️ trending 미지원
    timeRange?: 'all' | 'today' | 'week' | 'month' | 'year'; // ❌ 미지원
}
```

**백엔드 사진 검색 API**:
- `GET /photos?sortBy=latest|popular&page=num`
- 기본적인 정렬만 지원
- 시간 범위 필터링 없음
- 사용자 검색 API 없음

---

## 🟢 **MEDIUM - 중간 우선순위**

### 5. 프로필 페이지 - 부분적 기능 구현

**심각도**: 🟡 MEDIUM  
**영향 범위**: 사용자 프로필

#### 탭 기능 분석
```typescript
const tabs = [
    { key: 'photos', label: '사진' },     // ✅ 지원 가능
    { key: 'series', label: '시리즈' },   // ✅ 백엔드 API 있음
    { key: 'liked', label: '좋아요' },    // ✅ /users/me/likes API 있음
    { key: 'bookmarked', label: '북마크' } // ❌ API 없음
];
```

**문제점**:
- 좋아요 탭: API는 있지만 실제 연동 안 됨
- 북마크 탭: API 자체가 없음
- 시리즈 탭: API는 있지만 실제 시리즈 목록 표시 안 됨

### 6. 시리즈 생성 페이지 - 불완전한 구현

**심각도**: 🟡 MEDIUM  
**영향 범위**: 시리즈 기능

#### 현재 문제점
```typescript
// 시리즈 생성 API는 백엔드에서 지원
// POST /series: title, description, photoIds ✅

// 하지만 프론트엔드 구현 문제들
const issues = [
    "사진 추가하기 버튼이 작동하지 않음",
    "기존 업로드된 사진 선택 기능 없음", 
    "하드코딩된 목업 사진만 사용",
    "실제 API 호출 없이 console.log만 수행"
];
```

### 7. 업로드 페이지 - API 연동 부재

**심각도**: 🟡 MEDIUM  
**영향 범위**: 사진 업로드

#### 백엔드 스펙과의 일치도
```typescript
// 백엔드 API: POST /photos
// Body: title, description, image (multipart/form-data)

// 프론트엔드 구현
interface UploadFile {
    title: string;      // ✅ 일치
    description: string; // ✅ 일치
    file: File;         // ✅ 일치 (image)
    
    // 프론트엔드만의 추가 필드들
    preview: string;    // 로컬 preview용
    progress: number;   // 업로드 진행률
    status: 'uploading' | 'completed' | 'error'; // 상태 관리
}
```

**현재 상태**: 시뮬레이션만 수행, 실제 서버 업로드 안 됨

---

## 🔵 **LOW - 낮은 우선순위**

### 8. 댓글 시스템 - 기능적 일치

**심각도**: 🟢 LOW  
**영향 범위**: 댓글 기능

#### 백엔드 vs 프론트엔드
```typescript
// 백엔드 댓글 API
// POST /comments: photoId|seriesId, content
// POST /comments: parentId, content (대댓글)

// 프론트엔드 구현
// PhotoModal에서 댓글/대댓글 기능 구현
// 목업 데이터로만 동작, API 연동 필요
```

**평가**: 구조적으로는 일치하지만 API 연동만 필요

---

## 📊 **전체 통계 및 영향도 분석**

### 불일치 항목 통계
```
🔴 CRITICAL: 2개 (북마크 시스템, 네비게이션 페이지)
🟡 HIGH: 2개 (PhotoData 미지원 필드, 검색 기능)
🟡 MEDIUM: 3개 (프로필 탭, 시리즈 생성, 업로드 페이지)  
🟢 LOW: 1개 (댓글 시스템)
───────────────────────────────────
총 8개 카테고리, 15개 세부 이슈
```

### 코드 영향 범위
```typescript
// 영향받는 파일 수
const affectedFiles = {
    components: 8,      // PhotoCard, PhotoModal, PhotoGrid 등
    pages: 6,          // 홈, 검색, 프로필, 업로드, 시리즈 등
    types: 1,          // PhotoData, SearchFilters 인터페이스
    layouts: 2         // Sidebar, MainLayout
};

// 총 코드라인 영향도: ~1,200 라인
```

---

## 🎯 **권장 해결 방안**

### Phase 1: 즉시 조치 (1-2일)

#### 1. 북마크 기능 제거 또는 컬렉션으로 대체
```typescript
// Option A: 북마크 기능 완전 제거
- PhotoData에서 isBookmarked 제거
- 모든 컴포넌트에서 북마크 버튼 제거
- Sidebar에서 북마크 링크 제거

// Option B: 컬렉션 API 활용한 북마크 대체
- 사용자별 "내 북마크" 컬렉션 자동 생성
- 북마크 → 컬렉션 추가 로직으로 변경
- API: POST /collections/:id/photos
```

#### 2. 존재하지 않는 페이지 링크 수정
```typescript
// Sidebar.tsx 수정
const validPages = [
    { name: "홈", href: "/" },           // ✅ 존재
    { name: "검색", href: "/search" },   // ✅ 존재  
    { name: "업로드", href: "/upload" }, // ✅ 존재
    { name: "프로필", href: "/profile" } // ✅ 존재
];

// 제거할 링크들
const removeLinks = [
    "/explore", "/trending", "/photos", 
    "/series", "/liked", "/bookmarks"
];
```

### Phase 2: 데이터 모델 정리 (2-3일)

#### 3. PhotoData 인터페이스 백엔드 스펙 맞춤
```typescript
export interface PhotoData {
    // ✅ 백엔드 지원 필드만 유지
    id: string;
    title: string;
    description: string;
    photographer: UserInfo;
    likes: number;
    comments: number;
    isLiked: boolean;
    createdAt: string;
    
    // ❌ 제거할 필드들
    // views: number;           → 제거
    // isBookmarked: boolean;   → 제거 (Phase 1에서 처리)
    // isEpicMoment?: boolean;  → 제거 또는 백엔드 추가 필요
    // camera?: CameraInfo;     → 제거 또는 백엔드 추가 필요
    // location?: string;       → 백엔드 명세 확인 후 결정
}
```

#### 4. 목업 데이터 백엔드 스펙 동기화
```typescript
// 모든 목업 데이터에서 미지원 필드 제거
const mockPhotos = mockPhotos.map(photo => ({
    ...photo,
    // views: 삭제
    // isEpicMoment: 삭제
    // camera: 삭제
    // isBookmarked: 삭제
}));
```

### Phase 3: API 연동 구현 (1주)

#### 5. 실제 API 호출 구현
```typescript
// 우선순위 순서
1. 사진 목록 조회 (GET /photos)
2. 좋아요 토글 (POST /likes) 
3. 사진 업로드 (POST /photos)
4. 댓글 시스템 (POST /comments)
5. 시리즈 생성 (POST /series)
```

### Phase 4: 추가 기능 백엔드 요청 (선택사항)

#### 6. 비즈니스 가치 높은 기능들 백엔드 추가 요청
```typescript
const valuableFeatures = [
    {
        feature: "isEpicMoment",
        value: "브랜드 차별화, 특별한 순간 강조",
        complexity: "낮음",
        recommend: true
    },
    {
        feature: "views 카운팅",
        value: "사용자 참여도 측정, 인기 콘텐츠 식별", 
        complexity: "중간",
        recommend: true
    },
    {
        feature: "camera 메타데이터",
        value: "전문 사진작가 어필, EXIF 정보 표시",
        complexity: "높음", 
        recommend: false // MVP 이후
    }
];
```

---

## 🔚 **결론 및 권장 사항**

### 종합 평가
현재 epiksode 프론트엔드는 백엔드 API 스펙을 상당히 초과하는 기능들을 구현하고 있습니다. 이는 **"MVP 스코프 오버런"** 문제로, 사용자에게 혼란을 주고 개발 리소스를 분산시키고 있습니다.

### 최종 권장 사항

1. **🚨 즉시 실행**: 북마크 기능 제거, 존재하지 않는 페이지 링크 수정
2. **📋 단기 계획**: PhotoData 인터페이스 정리, 목업 데이터 동기화  
3. **⚡ 중기 계획**: 우선순위 API 연동 구현
4. **🔮 장기 계획**: 비즈니스 가치 높은 기능들의 백엔드 추가

### 예상 효과
- **사용자 혼란 해소**: 작동하지 않는 기능 제거로 UX 개선
- **개발 집중도 향상**: MVP 핵심 기능에 리소스 집중
- **코드 품질 개선**: 백엔드와 일치하는 일관된 데이터 모델
- **배포 안정성 확보**: API 의존성 명확화로 런타임 오류 방지

이 보고서를 바탕으로 **단계별 실행 계획**을 수립하여 프론트엔드-백엔드 일관성을 확보하시기를 권장합니다.

---

**작성자**: Claude Code Analysis (--ultrathink)  
**검토 일정**: Phase 1 완료 후 재검토  
**다음 액션**: Phase 1 즉시 조치 항목부터 착수