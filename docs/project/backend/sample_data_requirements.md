# 📊 epiksode 백엔드 샘플데이터 생성 가이드

## 📋 **개요**

이 문서는 epiksode 프론트엔드 API 연동(Phase 3)을 위한 백엔드 샘플데이터 생성 요구사항을 정의합니다.

**목적**:

- 프론트엔드 API 연동 테스트를 위한 충분하고 다양한 샘플 데이터 제공
- 실제 사용 시나리오에 가까운 데이터 환경 구축
- 엣지 케이스 및 다양한 UI 상황 검증

---

## 🎯 **샘플데이터 우선순위**

### **Priority 1: 필수 데이터 (Phase 3 API 연동 필수)**

- 사용자 (Users)
- 사진 (Photos)
- 좋아요 (Likes)
- 댓글 (Comments)

### **Priority 2: 확장 데이터 (전체 기능 테스트)**

- 시리즈 (Series)
- 팔로우 관계 (Follows)
- 알림 (Notifications)
- 컬렉션 (Collections)

---

## 👥 **사용자 데이터 (Users)**

### **최소 요구사항**: 3-5명

### **샘플 사용자 프로필**:

```json
{
    "users": [
        {
            "id": "user-001",
            "email": "nature.photographer@example.com",
            "username": "nature_kim",
            "name": "김자연",
            "bio": "자연 속에서 찾는 소소한 일상의 아름다움을 담습니다. 📸🌿",
            "profileImageUrl": "https://images.unsplash.com/photo-1494790108755-2616b69a69a1?w=150&h=150&fit=crop&crop=face",
            "followers": 1240,
            "following": 156,
            "createdAt": "2024-01-15T00:00:00Z"
        },
        {
            "id": "user-002",
            "email": "city.explorer@example.com",
            "username": "city_park",
            "name": "박도시",
            "bio": "도시의 숨겨진 매력을 발견하고 기록하는 것을 좋아합니다. 🏙️✨",
            "profileImageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            "followers": 892,
            "following": 234,
            "createdAt": "2024-02-01T00:00:00Z"
        },
        {
            "id": "user-003",
            "email": "forest.walker@example.com",
            "username": "forest_lee",
            "name": "이숲길",
            "bio": "숲속 오솔길을 걸으며 만나는 순간들을 사진으로 남깁니다.",
            "profileImageUrl": null,
            "followers": 564,
            "following": 89,
            "createdAt": "2024-01-20T00:00:00Z"
        },
        {
            "id": "user-004",
            "email": "sea.dreamer@example.com",
            "username": "sea_choi",
            "name": "최바다",
            "bio": "바다와 하늘이 만나는 지점에서 영감을 얻습니다. 🌊☁️",
            "profileImageUrl": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            "followers": 1523,
            "following": 67,
            "createdAt": "2024-01-10T00:00:00Z"
        },
        {
            "id": "user-005",
            "email": "star.gazer@example.com",
            "username": "star_jung",
            "name": "정별빛",
            "bio": "밤하늘의 별빛처럼 반짝이는 순간들을 포착합니다. ⭐🌙",
            "profileImageUrl": null,
            "followers": 2156,
            "following": 143,
            "createdAt": "2024-01-05T00:00:00Z"
        }
    ]
}
```

---

## 🖼️ **사진 데이터 (Photos)**

### **최소 요구사항**: 15-20장

### **다양성 고려사항**:

- **사용자별 분산**: 각 사용자마다 3-5장
- **업로드 시기 분산**: 최근 ~ 3개월 전까지
- **좋아요 수 분산**: 0개 ~ 2000개
- **댓글 수 분산**: 0개 ~ 50개

### **샘플 사진 데이터**:

```json
{
    "photos": [
        {
            "id": "photo-001",
            "title": "산속의 아침",
            "description": "새벽 안개가 피어오르는 산속에서 맞이한 평화로운 아침의 순간입니다.",
            "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
            "photographerId": "user-001",
            "likes": 1247,
            "comments": 23,
            "createdAt": "2024-08-09T06:30:00Z"
        },
        {
            "id": "photo-002",
            "title": "도시의 야경",
            "description": "번화가 네온사인이 만들어내는 환상적인 밤의 풍경",
            "imageUrl": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1000&fit=crop",
            "photographerId": "user-002",
            "likes": 892,
            "comments": 41,
            "createdAt": "2024-08-08T22:15:00Z"
        },
        {
            "id": "photo-003",
            "title": "숲속의 오솔길",
            "description": "햇살이 스며드는 숲속 길을 따라 걸으며 찍은 사진",
            "imageUrl": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1400&fit=crop",
            "photographerId": "user-003",
            "likes": 564,
            "comments": 15,
            "createdAt": "2024-08-07T14:20:00Z"
        },
        {
            "id": "photo-004",
            "title": "바다와 구름",
            "description": "푸른 바다 위로 펼쳐진 구름의 장관",
            "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=900&fit=crop",
            "photographerId": "user-004",
            "likes": 1523,
            "comments": 67,
            "createdAt": "2024-08-06T16:45:00Z"
        },
        {
            "id": "photo-005",
            "title": "사막의 별",
            "description": "깊은 밤 사막에서 바라본 은하수의 장엄함",
            "imageUrl": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=1100&fit=crop",
            "photographerId": "user-005",
            "likes": 2156,
            "comments": 89,
            "createdAt": "2024-08-05T23:30:00Z"
        }
    ]
}
```

### **추가 사진 패턴**:

```json
// 각 사용자별로 2-3장씩 추가 사진 생성 패턴
{
    "패턴_1": "좋아요 많은 인기 사진 (1000+ likes)",
    "패턴_2": "댓글 많은 화제 사진 (30+ comments)",
    "패턴_3": "최근 업로드 사진 (1주일 이내)",
    "패턴_4": "좋아요 적은 사진 (< 100 likes)",
    "패턴_5": "댓글 없는 사진 (0 comments)"
}
```

---

## ❤️ **좋아요 데이터 (Likes)**

### **분산 전략**:

- **인기 사진**: 500-2000 좋아요
- **보통 사진**: 50-500 좋아요
- **새 사진**: 0-50 좋아요
- **사용자별 좋아요**: 각 사용자마다 5-10개 사진에 좋아요

### **샘플 좋아요 관계**:

```json
{
    "likes": [
        {
            "id": "like-001",
            "userId": "user-002",
            "photoId": "photo-001",
            "createdAt": "2024-08-09T08:15:00Z"
        },
        {
            "id": "like-002",
            "userId": "user-003",
            "photoId": "photo-001",
            "createdAt": "2024-08-09T09:22:00Z"
        },
        {
            "id": "like-003",
            "userId": "user-001",
            "photoId": "photo-002",
            "createdAt": "2024-08-08T23:45:00Z"
        }
    ]
}
```

---

## 💬 **댓글 데이터 (Comments)**

### **다양성 요구사항**:

- **일반 댓글**: 각 사진마다 0-15개
- **대댓글**: 일반 댓글의 30% 정도
- **댓글 길이**: 짧은 댓글 ~ 긴 댓글
- **시간 분산**: 사진 업로드 후 다양한 시점

### **샘플 댓글 데이터**:

```json
{
    "comments": [
        {
            "id": "comment-001",
            "photoId": "photo-001",
            "userId": "user-002",
            "content": "정말 아름다운 사진이네요! 어느 장소인가요?",
            "parentId": null,
            "likes": 5,
            "createdAt": "2024-08-09T10:30:00Z"
        },
        {
            "id": "comment-002",
            "photoId": "photo-001",
            "userId": "user-001",
            "content": "지리산 국립공원입니다! 새벽 5시경에 찍었어요.",
            "parentId": "comment-001",
            "likes": 2,
            "createdAt": "2024-08-09T10:45:00Z"
        },
        {
            "id": "comment-003",
            "photoId": "photo-001",
            "userId": "user-003",
            "content": "빛의 표현이 예술적입니다 👏",
            "parentId": null,
            "likes": 3,
            "createdAt": "2024-08-09T11:15:00Z"
        }
    ]
}
```

---

## 📁 **시리즈 데이터 (Series)**

### **최소 요구사항**: 2-3개 시리즈

### **시리즈 구성**:

- **사진 수**: 3-6장 per 시리즈
- **테마**: 여행, 일상, 자연 등
- **작성자**: 다양한 사용자

### **샘플 시리즈 데이터**:

```json
{
    "series": [
        {
            "id": "series-001",
            "title": "지리산 일출 여행",
            "description": "3박 4일 지리산 여행에서 만난 아름다운 일출들",
            "photographerId": "user-001",
            "photoIds": ["photo-001", "photo-006", "photo-007", "photo-008"],
            "likes": 234,
            "createdAt": "2024-08-09T18:00:00Z"
        },
        {
            "id": "series-002",
            "title": "서울 야경 컬렉션",
            "description": "밤이 되면 더욱 아름다워지는 서울의 모습들",
            "photographerId": "user-002",
            "photoIds": ["photo-002", "photo-009", "photo-010"],
            "likes": 156,
            "createdAt": "2024-08-08T20:30:00Z"
        }
    ]
}
```

---

## 👥 **팔로우 관계 (Follows)**

### **네트워크 구성**:

- **상호 팔로우**: 2-3쌍
- **일방향 팔로우**: 각 사용자별 2-4명
- **인기 사용자**: 더 많은 팔로워

### **샘플 팔로우 데이터**:

```json
{
    "follows": [
        {
            "id": "follow-001",
            "followerId": "user-002",
            "followingId": "user-001",
            "createdAt": "2024-07-15T00:00:00Z"
        },
        {
            "id": "follow-002",
            "followerId": "user-001",
            "followingId": "user-002",
            "createdAt": "2024-07-16T00:00:00Z"
        },
        {
            "id": "follow-003",
            "followerId": "user-003",
            "followingId": "user-001",
            "createdAt": "2024-07-20T00:00:00Z"
        }
    ]
}
```

---

## 🔔 **알림 데이터 (Notifications)**

### **알림 타입별 샘플**:

- **좋아요**: "김자연님이 회원님의 사진을 좋아합니다"
- **댓글**: "박도시님이 회원님의 사진에 댓글을 남겼습니다"
- **팔로우**: "이숲길님이 회원님을 팔로우하기 시작했습니다"

### **샘플 알림 데이터**:

```json
{
    "notifications": [
        {
            "id": "notif-001",
            "userId": "user-002",
            "type": "like",
            "message": "김자연님이 회원님의 사진을 좋아합니다",
            "fromUserId": "user-001",
            "relatedItemType": "photo",
            "relatedItemId": "photo-002",
            "isRead": false,
            "createdAt": "2024-08-09T15:30:00Z"
        }
    ]
}
```

---

## 🛠️ **데이터 생성 스크립트 가이드**

### **권장 생성 순서**:

1. **사용자 생성** (5명)
2. **사진 업로드** (15-20장, 사용자별 분산)
3. **좋아요 관계 생성** (사진별 다양한 수치)
4. **댓글 생성** (일반 댓글 + 대댓글)
5. **팔로우 관계 생성**
6. **시리즈 생성** (기존 사진들 묶기)
7. **알림 생성** (최근 활동 기반)

### **스크립트 예시 구조**:

```bash
# 백엔드 프로젝트 root에서 실행
npm run seed:users
npm run seed:photos
npm run seed:likes
npm run seed:comments
npm run seed:follows
npm run seed:series
npm run seed:notifications

# 또는 한 번에
npm run seed:all
```

---

## 📊 **데이터 검증 체크리스트**

### **API 응답 확인**:

- [ ] `GET /photos` - 15장 이상 사진 목록 반환
- [ ] `GET /photos/:id` - 댓글, 좋아요 수 포함 상세 정보
- [ ] `GET /users/me` - 사용자 정보 정상 반환
- [ ] `GET /users/me/likes` - 좋아요한 사진 목록 반환
- [ ] `GET /notifications` - 알림 목록 반환

### **데이터 품질 확인**:

- [ ] 모든 사진에 유효한 이미지 URL
- [ ] 사용자별 프로필 정보 완성도
- [ ] 댓글-대댓글 관계 정상 구성
- [ ] 좋아요 수와 실제 좋아요 관계 일치
- [ ] 팔로우 관계의 상호/일방향 다양성

---

## 🚀 **Phase 3 연동 준비도 확인**

### **필수 확인 사항**:

```bash
# API 서버 구동 확인
curl http://localhost:8000/api/photos

# 기본 데이터 존재 확인
curl http://localhost:8000/api/photos?page=1&limit=10

# 인증 API 확인
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nature.photographer@example.com","password":"password123"}'
```

### **샘플데이터 충분성 기준**:

- ✅ **최소**: 사용자 3명, 사진 10장, 좋아요/댓글 적당량
- 🎯 **권장**: 사용자 5명, 사진 20장, 다양한 상호작용 데이터
- 🚀 **이상적**: 사용자 8-10명, 사진 30-50장, 실제 서비스와 유사한 데이터량

---

**작성일**: 2025년 8월 10일  
**버전**: 1.0  
**담당**: 프론트엔드 개발팀  
**검토**: 백엔드 개발팀과 협업 필요
