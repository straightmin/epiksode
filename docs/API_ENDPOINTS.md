# S3 이미지 프록시 API 엔드포인트

## 개요
S3 비공개 버킷의 이미지에 안전하게 접근할 수 있는 프록시 엔드포인트입니다.

---

## 엔드포인트 목록

### 1. 원본 이미지 조회

**엔드포인트**: `GET /api/images/{photoId}`

**파라미터**:
- `photoId` (path, integer, required): 사진 ID

**요청 예시**:
```http
GET /api/images/123 HTTP/1.1
Host: localhost:3001
```

**응답**:

**200 OK** - 성공
```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 245760
Cache-Control: public, max-age=86400
Last-Modified: Sat, 10 Aug 2025 15:30:00 GMT

[이미지 바이너리 데이터]
```

**400 Bad Request** - 잘못된 사진 ID
```json
{
  "message": "유효하지 않은 사진 ID입니다."
}
```

**404 Not Found** - 이미지를 찾을 수 없음
```json
{
  "message": "이미지를 찾을 수 없습니다."
}
```

**500 Internal Server Error** - 서버 오류
```json
{
  "message": "이미지 데이터를 읽을 수 없습니다."
}
```

---

### 2. 썸네일 이미지 조회

**엔드포인트**: `GET /api/images/thumbnails/{photoId}`

**파라미터**:
- `photoId` (path, integer, required): 사진 ID

**요청 예시**:
```http
GET /api/images/thumbnails/123 HTTP/1.1
Host: localhost:3001
```

**응답**: 원본 이미지와 동일한 형식

---

## 응답 헤더 설명

| 헤더 | 설명 | 값 |
|------|------|-----|
| `Content-Type` | 이미지 MIME 타입 | `image/jpeg`, `image/png` |
| `Content-Length` | 이미지 파일 크기 | 바이트 단위 |
| `Cache-Control` | 브라우저 캐싱 설정 | `public, max-age=86400` (24시간) |
| `Last-Modified` | 파일 최종 수정 시간 | HTTP 날짜 형식 |

---

## 클라이언트 구현 가이드

### JavaScript/Fetch API
```javascript
async function getImage(photoId, thumbnail = false) {
  const endpoint = thumbnail ? 'thumbnails' : '';
  const url = `http://localhost:3001/api/images/${endpoint ? endpoint + '/' : ''}${photoId}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.blob(); // 이미지 Blob 반환
  } catch (error) {
    console.error('이미지 로드 실패:', error);
    throw error;
  }
}
```

### React 컴포넌트
```jsx
const ImageComponent = ({ photoId, thumbnail = false }) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const endpoint = thumbnail ? 'thumbnails/' : '';
  const imageUrl = `${baseUrl}/api/images/${endpoint}${photoId}`;

  return (
    <img 
      src={imageUrl}
      onError={(e) => {
        e.target.src = '/images/placeholder.jpg';
      }}
    />
  );
};
```

---

## 성능 특징

### 캐싱
- **브라우저 캐시**: 24시간 (`max-age=86400`)
- **조건부 요청**: `Last-Modified` 헤더로 304 Not Modified 지원
- **공개 캐시**: CDN 및 프록시에서 캐시 가능

### 성능 지표
- **평균 응답 시간**: 200-500ms
- **처리량**: 동시 요청 처리 가능
- **대역폭**: 서버 대역폭 2배 사용 (S3 → 서버 → 클라이언트)

---

## 보안

### 접근 제어
- S3 버킷은 비공개 상태 유지
- 백엔드 서버를 통해서만 접근 가능
- 직접 S3 URL 접근 시 403 Forbidden

### CORS 설정
백엔드에서 다음 origin 허용:
- `http://localhost:3000` (개발환경)
- `http://127.0.0.1:3000` (개발환경)

---

## 에러 처리

### 클라이언트 측 에러 처리
```javascript
const handleImageError = (error, photoId) => {
  switch (error.status) {
    case 400:
      console.error(`잘못된 사진 ID: ${photoId}`);
      break;
    case 404:
      console.error(`사진을 찾을 수 없음: ${photoId}`);
      break;
    case 500:
      console.error('서버 내부 오류');
      break;
    default:
      console.error('알 수 없는 오류:', error);
  }
};
```

### 재시도 로직
```javascript
async function getImageWithRetry(photoId, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await getImage(photoId);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // 지수 백오프
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

---

## 테스트

### 수동 테스트
```bash
# 원본 이미지
curl -I http://localhost:3001/api/images/1

# 썸네일
curl -I http://localhost:3001/api/images/thumbnails/1

# 응답 헤더 확인
HTTP/1.1 200 OK
Content-Type: image/jpeg
Cache-Control: public, max-age=86400
```

### 자동화 테스트 (Jest)
```javascript
describe('Image Proxy API', () => {
  test('원본 이미지 조회', async () => {
    const response = await fetch('http://localhost:3001/api/images/1');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/image\//);
  });

  test('썸네일 이미지 조회', async () => {
    const response = await fetch('http://localhost:3001/api/images/thumbnails/1');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=86400');
  });

  test('존재하지 않는 사진 ID', async () => {
    const response = await fetch('http://localhost:3001/api/images/99999');
    expect(response.status).toBe(404);
  });
});
```

---

## 마이그레이션 로드맵

### Phase 1 (현재): 프록시 시스템
- ✅ 백엔드 프록시 구현 완료
- 🔄 프론트엔드 URL 교체 (진행 중)
- 📅 1주차 목표

### Phase 2 (예정): Presigned URL
- 📅 2-3주차: Presigned URL 시스템 구현
- 📈 성능 개선: 200-500ms → 50-150ms
- 🏗️ Redis 캐싱 도입

### Phase 3 (예정): 최적화
- 📅 4주차: CDN 연동
- 🌐 글로벌 캐싱
- 📊 모니터링 시스템

---

*API 버전: 1.0*  
*최종 수정: 2025-08-10*