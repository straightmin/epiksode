# S3 이미지 프록시 프론트엔드 연동 가이드

## 📋 개요

백엔드에서 S3 이미지 프록시 시스템이 완료되었습니다. 이제 프론트엔드에서 새로운 API 엔드포인트를 사용하여 이미지를 표시할 수 있습니다.

**해결된 문제**: S3 버킷이 비공개로 설정되어 발생했던 403 Forbidden 오류  
**해결 방법**: 백엔드 프록시 엔드포인트를 통한 이미지 스트리밍

---

## 🚀 새로운 API 엔드포인트

### 원본 이미지 조회

```
GET /api/images/{photoId}
```

**파라미터**:

- `photoId` (integer): 사진 ID

**응답**:

- **200**: 이미지 바이너리 데이터 (JPEG/PNG)
- **400**: 유효하지 않은 사진 ID
- **404**: 이미지를 찾을 수 없음
- **500**: 서버 오류

**헤더**:

```
Content-Type: image/jpeg
Content-Length: [파일크기]
Cache-Control: public, max-age=86400  // 24시간 캐싱
Last-Modified: [수정시간]
```

### 썸네일 이미지 조회

```
GET /api/images/thumbnails/{photoId}
```

**파라미터**:

- `photoId` (integer): 사진 ID

**응답**: 원본 이미지와 동일

---

## 💻 프론트엔드 구현 방법

### 1. 기본 사용법

기존에 S3 직접 URL을 사용했다면, 이제 백엔드 프록시 URL을 사용합니다.

**기존 (문제 있음)**:

```jsx
<img src="https://bucket.s3.amazonaws.com/photos/1/image.jpg" />
```

**새로운 방식 (권장)**:

```jsx
<img src="http://localhost:3001/api/images/123" />
<img src="http://localhost:3001/api/images/thumbnails/123" />
```

### 2. React 컴포넌트 예시

```jsx
// PhotoImage.jsx
import React from "react";

const PhotoImage = ({
    photoId,
    thumbnail = false,
    alt = "",
    className = "",
}) => {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";
    const endpoint = thumbnail ? "thumbnails" : "";
    const imageUrl = `${baseUrl}/api/images/${endpoint ? endpoint + "/" : ""}${photoId}`;

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onError={(e) => {
                console.error(`이미지 로드 실패: ${imageUrl}`);
                e.target.src = "/images/placeholder.jpg"; // 기본 이미지
            }}
        />
    );
};

export default PhotoImage;
```

### 3. 사용 예시

```jsx
// 갤러리 컴포넌트에서
const PhotoGallery = ({ photos }) => {
    return (
        <div className="photo-gallery">
            {photos.map((photo) => (
                <div key={photo.id} className="photo-item">
                    {/* 썸네일 표시 */}
                    <PhotoImage
                        photoId={photo.id}
                        thumbnail={true}
                        alt={photo.title}
                        className="thumbnail"
                    />

                    {/* 클릭 시 원본 표시 */}
                    <PhotoImage
                        photoId={photo.id}
                        thumbnail={false}
                        alt={photo.title}
                        className="full-image"
                    />
                </div>
            ))}
        </div>
    );
};
```

---

## 🔧 환경 설정

### 환경 변수 추가

**.env.local** (프론트엔드):

```bash
REACT_APP_API_URL=http://localhost:3001
# 프로덕션에서는 실제 백엔드 URL로 변경
```

### API 클라이언트 설정

```javascript
// api/config.js
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
    // 기존 API들
    photos: `${API_BASE_URL}/api/photos`,
    auth: `${API_BASE_URL}/api/auth`,

    // 새로운 이미지 프록시 엔드포인트
    images: {
        original: (photoId) => `${API_BASE_URL}/api/images/${photoId}`,
        thumbnail: (photoId) =>
            `${API_BASE_URL}/api/images/thumbnails/${photoId}`,
    },
};
```

---

## 📱 반응형 이미지 구현

### srcSet을 활용한 반응형 이미지

```jsx
const ResponsiveImage = ({ photoId, alt, sizes }) => {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

    return (
        <img
            src={`${baseUrl}/api/images/${photoId}`}
            srcSet={`
        ${baseUrl}/api/images/thumbnails/${photoId} 300w,
        ${baseUrl}/api/images/${photoId} 1920w
      `}
            sizes={sizes || "(max-width: 768px) 300px, 1920px"}
            alt={alt}
            loading="lazy"
        />
    );
};
```

---

## 🚀 성능 최적화

### 1. 브라우저 캐싱 활용

- 이미지는 24시간 동안 브라우저에 캐시됩니다
- 동일한 이미지를 여러 번 요청해도 캐시에서 로드됩니다

### 2. Lazy Loading

```jsx
<img
    src={imageUrl}
    loading="lazy" // 브라우저 네이티브 지연 로딩
    alt={alt}
/>
```

### 3. 썸네일 우선 로딩

```jsx
const [imageLoaded, setImageLoaded] = useState(false);

return (
    <div className="image-container">
        {/* 썸네일을 먼저 표시 */}
        <img
            src={`${baseUrl}/api/images/thumbnails/${photoId}`}
            className={`thumbnail ${imageLoaded ? "hidden" : "visible"}`}
        />

        {/* 원본 이미지를 백그라운드에서 로드 */}
        <img
            src={`${baseUrl}/api/images/${photoId}`}
            className={`original ${imageLoaded ? "visible" : "hidden"}`}
            onLoad={() => setImageLoaded(true)}
        />
    </div>
);
```

---

## 🛠️ 마이그레이션 가이드

### 기존 코드에서 새 API로 마이그레이션

**1단계: URL 교체 함수 생성**

```javascript
// utils/imageUrl.js
export const getImageUrl = (photo, thumbnail = false) => {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

    // 새로운 사진 (photo.id 존재)
    if (photo.id) {
        const endpoint = thumbnail ? "thumbnails" : "";
        return `${baseUrl}/api/images/${endpoint ? endpoint + "/" : ""}${photo.id}`;
    }

    // 기존 사진 (S3 URL이 그대로 있는 경우) - 점진적 마이그레이션
    return thumbnail ? photo.thumbnailUrl : photo.imageUrl;
};
```

**2단계: 기존 컴포넌트 수정**

```jsx
// 기존
<img src={photo.imageUrl} />

// 수정 후
<img src={getImageUrl(photo)} />
<img src={getImageUrl(photo, true)} /> // 썸네일
```

---

## 🔍 디버깅 및 트러블슈팅

### 일반적인 문제들

**1. CORS 오류**

```
Access to fetch at 'http://localhost:3001/api/images/1' from origin 'http://localhost:3000' has been blocked by CORS policy
```

→ 백엔드 CORS 설정이 올바른지 확인 (이미 설정되어 있음)

**2. 404 Not Found**
→ photoId가 유효한지 확인
→ 백엔드 서버가 실행 중인지 확인

**3. 이미지 로딩 실패**

```jsx
<img
    src={imageUrl}
    onError={(e) => {
        console.error("이미지 로드 실패:", imageUrl);
        // 기본 이미지로 대체
        e.target.src = "/images/no-image.png";
    }}
/>
```

### 네트워크 디버깅

브라우저 개발자 도구 → Network 탭에서:

- HTTP 상태 코드 확인 (200이어야 정상)
- Response Headers에서 `Content-Type: image/jpeg` 확인
- `Cache-Control: public, max-age=86400` 확인

---

## 📊 성능 모니터링

### 주요 메트릭

- **이미지 로드 시간**: 평균 200-500ms 예상
- **캐시 히트율**: 24시간 캐시로 재방문 시 즉시 로딩
- **서버 부하**: 프록시 방식으로 백엔드 서버 처리량 증가

### 개선 예정 사항 (2-4주차)

- **Presigned URL 방식**으로 마이그레이션 → 50-150ms로 성능 개선
- **CDN 캐싱** 활용
- **Redis 캐싱** 도입

---

## 🤝 팀 협업

### 프론트엔드 팀에서 해야 할 작업

1. **환경 변수 설정** (.env.local에 REACT_APP_API_URL 추가)
2. **기존 이미지 URL 교체** (S3 직접 URL → 프록시 URL)
3. **에러 핸들링 추가** (404, 로딩 실패 대응)
4. **성능 최적화** (lazy loading, 썸네일 우선 로딩)

### 테스트 방법

```bash
# 백엔드 서버 실행
npm run dev

# 테스트 URL 브라우저에서 접속
http://localhost:3001/api/images/1
http://localhost:3001/api/images/thumbnails/1
```

---

## 📞 지원

구현 중 문제가 발생하면 백엔드 팀에 문의:

- 새로운 사진 업로드 시 프록시 URL 자동 생성됨
- 기존 사진은 점진적 마이그레이션 가능
- API 문서: `http://localhost:3001/api-docs` (개발 환경)

---

_작성일: 2025-08-10_  
_버전: 1.0 - S3 이미지 프록시 구현 완료_
