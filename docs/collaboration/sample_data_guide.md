# 🎭 샘플데이터 가이드 & 테스트 계정

**대상**: 프론트엔드 개발팀  
**작성일**: 2025년 8월 10일  
**목적**: Phase 3 API 연동 테스트 및 개발용 샘플 데이터 활용 가이드

---

## 🚀 **빠른 시작**

### 백엔드 서버 실행

```bash
# 1. 데이터베이스 시작 (Docker)
docker-compose up -d

# 2. 샘플데이터 생성 (자동으로 기존 데이터 정리 후 재생성)
npm run seed

# 3. 백엔드 서버 실행
npm run dev
```

### 서버 상태 확인

```bash
# API 응답 테스트
curl http://localhost:3000/api/photos

# 샘플데이터 검증 실행
npm run seed:verify
```

---

## 🎭 **테스트 계정 정보**

### 📱 **즉시 사용 가능한 계정들**

| 사용자명       | 이메일                          | 패스워드     | 특성             | 사진 수 | 팔로워 |
| -------------- | ------------------------------- | ------------ | ---------------- | ------- | ------ |
| **nature_kim** | nature.photographer@example.com | `nature123!` | 자연 사진 전문가 | 4장     | 4명    |
| **city_park**  | city.explorer@example.com       | `city123!`   | 도시 야경 전문가 | 4장     | 2명    |
| **forest_lee** | forest.walker@example.com       | `forest123!` | 숲길 산책 전문가 | 4장     | 1명    |
| **sea_choi**   | sea.dreamer@example.com         | `sea123!`    | 바다 풍경 전문가 | 4장     | 3명    |
| **star_jung**  | star.gazer@example.com          | `star123!`   | ⭐ 인기 사용자   | 4장     | 5명    |

### 🔑 **로그인 테스트 예시**

```bash
# 로그인 API 테스트
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nature.photographer@example.com",
    "password": "nature123!"
  }'

# 응답 예시:
{
  "success": true,
  "data": {
    "user": { "id": 1, "username": "nature_kim", ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800
  }
}
```

### 🎯 **JWT 토큰 사용**

```bash
# 인증이 필요한 API 호출
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 **생성된 샘플 데이터 현황**

### 🔢 **데이터 통계**

- 👥 **사용자**: 5명 (한국어 프로필)
- 📸 **사진**: 20장 (테마별 분산)
- ❤️ **좋아요**: ~80개 (실제 관계 레코드)
- 💬 **댓글**: ~300개 (대댓글 30% 포함)
- 👥 **팔로우**: 15개 관계 (상호/일방향)
- 📁 **시리즈**: 3개 (테마별 사진 묶음)
- 🔖 **컬렉션**: 5개 (북마크 모음)
- 🔔 **알림**: ~260개 (자동 트리거)

### 📸 **사진 데이터 특징**

#### **nature_kim의 사진들**

1. **"산속의 아침"** - 조회수: 1,247회, 인기 사진
2. **"지리산 일출"** - 조회수: 856회
3. **"숲속 햇살"** - 조회수: 423회
4. **"새벽 안개"** - 조회수: 234회

#### **star_jung의 사진들** (가장 인기 사용자)

1. **"사막의 별"** - 조회수: 2,156회 (최고 인기)
2. **"달빛 아래"** - 조회수: 1,324회
3. **"새벽별과 지평선"** - 조회수: 887회
4. **"은하수 여행"** - 조회수: 643회

### 💬 **댓글 시스템**

- **일반 댓글**: 한국어 자연스러운 반응 (`"와 대박! 🔥"`, `"정말 아름다운 사진이네요!"`)
- **대댓글**: 작성자가 팬들에게 답글 (`"감사합니다! 지리산 국립공원입니다 😊"`)
- **참여도 분산**: 인기 사진일수록 많은 댓글

### 👥 **팔로우 네트워크**

- **상호 팔로우**: nature_kim ↔ city_park, forest_lee ↔ sea_choi
- **인기 중심**: 모든 사용자가 star_jung을 팔로우
- **자연스러운 관계**: 비슷한 취향끼리 팔로우

---

## 🧪 **API 테스트 시나리오**

### 🎯 **시나리오 1: 기본 사진 피드**

```javascript
// 1. 사진 목록 조회 (최신순)
GET /api/photos?sortBy=latest&page=1&limit=10

// 2. 특정 사진 상세 보기
GET /api/photos/1

// 3. 사진 좋아요 토글 (인증 필요)
POST /api/likes
{
  "photoId": 1
}
```

### 🎯 **시나리오 2: 사용자 프로필**

```javascript
// 1. 사용자 프로필 조회
GET /api/users/1

// 2. 사용자의 사진들 조회
GET /api/photos?userId=1

// 3. 팔로우 토글 (인증 필요)
POST /api/follows
{
  "followingId": 1
}
```

### 🎯 **시나리오 3: 댓글 시스템**

```javascript
// 1. 사진의 댓글들 조회
GET /api/comments?photoId=1

// 2. 댓글 작성 (인증 필요)
POST /api/comments
{
  "photoId": 1,
  "content": "정말 멋진 사진이네요!"
}

// 3. 대댓글 작성 (인증 필요)
POST /api/comments
{
  "parentId": 1,
  "content": "저도 그렇게 생각해요!"
}
```

### 🎯 **시나리오 4: 시리즈 조회**

```javascript
// 1. 시리즈 목록 조회
GET /api/series

// 2. 특정 시리즈 상세 (사진들 포함)
GET /api/series/1

// 3. 시리즈 좋아요 토글
POST /api/likes
{
  "seriesId": 1
}
```

---

## 🎨 **실제 이미지 URL들**

### 📷 **Unsplash 고품질 이미지 사용**

모든 사진은 실제 Unsplash 이미지를 사용하여 **실제 서비스와 동일한 환경**에서 테스트 가능합니다.

```javascript
// 예시 이미지 URL들
const sampleImages = {
    "산속의 아침":
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
    "도시의 야경":
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1000&fit=crop",
    "사막의 별":
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=1100&fit=crop",
    // ... 더 많은 이미지들
};

// 썸네일 URL (자동 생성)
const thumbnailUrl = imageUrl.replace(/w=\d+&h=\d+/, "w=300&h=300");
```

### 🖼️ **이미지 로딩 테스트**

- **원본 이미지**: 800px 너비, 다양한 높이
- **썸네일**: 300x300px 정사각형 크롭
- **로딩 속도**: 평균 1-2초 (네트워크 상태에 따라)

---

## 📱 **프론트엔드 연동 체크리스트**

### ✅ **Phase 3-1: 기본 기능 테스트**

- [ ] 로그인/로그아웃 정상 작동
- [ ] JWT 토큰 저장 및 자동 헤더 추가
- [ ] 사진 목록 조회 및 무한 스크롤
- [ ] 사진 상세보기 모달
- [ ] 좋아요 버튼 토글 (실시간 카운트)
- [ ] 댓글 목록 표시

### ✅ **Phase 3-2: 사용자 인터랙션**

- [ ] 사용자 프로필 페이지
- [ ] 팔로우/언팔로우 기능
- [ ] 댓글 작성 및 대댓글
- [ ] 알림 목록 표시
- [ ] 검색 기능 (사진/사용자)

### ✅ **Phase 3-3: 고급 기능**

- [ ] 시리즈 목록 및 상세
- [ ] 컬렉션 기능
- [ ] 사진 업로드 (파일 처리)
- [ ] 프로필 수정
- [ ] 에러 처리 및 로딩 상태

---

## 🚨 **일반적인 문제 해결**

### ❌ **CORS 에러**

```javascript
// 개발 환경에서 CORS 설정 확인
// 백엔드에서 프론트엔드 도메인 허용 필요
Access-Control-Allow-Origin: http://localhost:3001
```

### ❌ **인증 토큰 만료**

```javascript
// 401 에러 발생 시 토큰 갱신 필요
if (response.status === 401) {
    // 로그인 페이지로 리다이렉트 또는 토큰 갱신
    localStorage.removeItem("token");
    window.location.href = "/login";
}
```

### ❌ **이미지 로딩 실패**

```javascript
// Unsplash URL 접근 제한 시 대체 이미지 사용
const handleImageError = (e) => {
    e.target.src = "/images/placeholder.jpg";
};
```

### ❌ **페이지네이션 이슈**

```javascript
// 올바른 페이지네이션 파라미터 확인
const fetchPhotos = async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "latest",
    });

    const response = await fetch(`/api/photos?${params}`);
    return response.json();
};
```

---

## 🔄 **데이터 리셋 방법**

### 🗑️ **샘플데이터 재생성**

```bash
# 기존 데이터 완전 삭제 후 새로운 샘플데이터 생성
npm run seed

# 특정 테이블만 재생성 (고급)
npm run seed:users
npm run seed:photos
```

### 📊 **데이터 상태 확인**

```bash
# 모든 데이터 검증
npm run seed:verify

# 개별 API 응답 확인
curl http://localhost:3000/api/photos | jq '.'
curl http://localhost:3000/api/users/1 | jq '.'
```

---

## 💡 **개발 팁**

### 🎯 **효율적인 테스트 방법**

1. **고정된 테스트 계정 사용**: `nature_kim` 계정으로 일관된 테스트
2. **다양한 데이터 패턴 활용**: 인기 사진(`star_jung`)과 일반 사진 비교
3. **실제 사용자 시나리오**: 팔로우 → 좋아요 → 댓글 순서로 테스트
4. **에러 상황 시뮬레이션**: 없는 ID로 API 호출하여 404 에러 테스트

### 🔧 **디버깅 유틸리티**

```javascript
// API 응답 로깅 헬퍼
const logApiResponse = (endpoint, response) => {
    console.group(`📡 API: ${endpoint}`);
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.groupEnd();
};

// 사용자 인증 상태 확인
const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    console.log("🔐 Auth Token:", token ? "Present" : "Missing");
    return !!token;
};
```

이 샘플 데이터를 활용하여 **실제 서비스와 동일한 환경**에서 프론트엔드를 개발하세요! 🚀
