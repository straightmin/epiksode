# 📋 API 샘플 응답 모음

**대상**: 프론트엔드 개발팀  
**목적**: 실제 API 응답 구조 참조용
**업데이트**: 2025년 8월 10일

---

## 📁 **파일 구성**

### 🔐 **인증 관련**
- `auth/login_success.json` - 로그인 성공 응답
- `auth/login_error.json` - 로그인 실패 응답
- `auth/register_success.json` - 회원가입 성공 응답
- `auth/token_expired.json` - 토큰 만료 에러

### 📸 **사진 관련**
- `photos/photo_list.json` - 사진 목록 조회
- `photos/photo_detail.json` - 사진 상세 조회
- `photos/photo_upload_success.json` - 사진 업로드 성공
- `photos/photo_not_found.json` - 사진 없음 에러

### 👥 **사용자 관련**
- `users/user_profile.json` - 사용자 프로필
- `users/current_user.json` - 현재 로그인 사용자
- `users/followers_list.json` - 팔로워 목록

### 💬 **댓글/좋아요 관련**
- `interactions/comments_list.json` - 댓글 목록
- `interactions/like_toggle.json` - 좋아요 토글 응답
- `interactions/comment_create.json` - 댓글 생성 응답

### 🔔 **알림 관련**
- `notifications/notification_list.json` - 알림 목록
- `notifications/mark_read.json` - 읽음 처리 응답

---

## 🛠️ **사용법**

### TypeScript 타입 가드
```typescript
// 응답 타입 검증용
import sampleResponse from './api_samples/photos/photo_detail.json';

const validatePhotoResponse = (data: any): data is PhotoDetail => {
  return (
    typeof data.id === 'number' &&
    typeof data.title === 'string' &&
    typeof data.author === 'object'
  );
};
```

### 목업 데이터 활용
```typescript
// 개발 중 목업 데이터 사용
import mockPhotoList from './api_samples/photos/photo_list.json';

const useMockAPI = process.env.NODE_ENV === 'development';

const fetchPhotos = async () => {
  if (useMockAPI) {
    return new Promise(resolve => 
      setTimeout(() => resolve(mockPhotoList), 500)
    );
  }
  return apiClient.get('/photos');
};
```

이 샘플 파일들을 참고하여 **정확한 타입 정의**와 **에러 처리**를 구현하세요! 🚀