# 🛠️ 개발 환경 설정 가이드

**대상**: 프론트엔드 개발팀  
**작성일**: 2025년 8월 10일  
**목적**: 로컬 환경에서 백엔드 API 서버와 연동하여 개발 진행

---

## 🚀 **빠른 시작 (5분 설정)**

### 1️⃣ **사전 준비사항**
```bash
# 필수 설치 도구 확인
node --version    # v18+ 필요
npm --version     # v9+ 필요
docker --version  # Docker Desktop 필요
git --version     # Git 필요
```

### 2️⃣ **백엔드 저장소 클론**
```bash
# 백엔드 저장소 클론 (프론트엔드 개발자용)
git clone https://github.com/your-org/finger-snap-backend.git
cd finger-snap-backend

# 또는 ZIP 다운로드 후 압축 해제
```

### 3️⃣ **의존성 설치**
```bash
# Node.js 패키지 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate
```

### 4️⃣ **환경 변수 설정**
```bash
# .env 파일 생성 (Windows)
copy .env.example .env

# .env 파일 생성 (macOS/Linux)
cp .env.example .env
```

**.env 파일 내용** (이미 올바른 값으로 설정됨):
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_development_jwt_secret_key
JWT_EXPIRES_IN=7d

# 데이터베이스 (Docker 사용)
DATABASE_URL=postgresql://finger:snap@localhost:5432/fingersnap

# AWS S3 (개발용 더미 값 - 실제 업로드 시에만 필요)
AWS_ACCESS_KEY_ID=development_access_key
AWS_SECRET_ACCESS_KEY=development_secret_key
AWS_S3_BUCKET_NAME=development-bucket
AWS_REGION=us-east-1
```

### 5️⃣ **데이터베이스 실행 및 초기화**
```bash
# Docker로 PostgreSQL 실행
docker-compose up -d

# 데이터베이스 스키마 적용
npx prisma db push

# 샘플 데이터 생성 (필수!)
npm run seed
```

### 6️⃣ **백엔드 서버 실행**
```bash
# 개발 서버 실행 (hot reload)
npm run dev

# 서버 실행 확인
curl http://localhost:3000/api/photos
```

---

## 📡 **API 연동 설정**

### 🌐 **프론트엔드 → 백엔드 연결**

#### **Next.js 개발 서버 설정**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // 백엔드 서버
      },
    ]
  },
}

module.exports = nextConfig
```

#### **환경 변수 설정 (프론트엔드)**
```bash
# 프론트엔드 .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

#### **API 클라이언트 설정**
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export class ApiClient {
  private baseURL = API_BASE_URL;
  private token: string | null = null;

  constructor() {
    // 브라우저에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  // POST, PUT, DELETE 메서드들...
}

// 싱글톤 인스턴스
export const apiClient = new ApiClient();
```

---

## 🔧 **개발 도구 및 테스트**

### 📋 **API 테스트 도구**

#### **1. Thunder Client (VS Code 확장)**
```json
// thunder-tests/auth.json
{
  "name": "로그인 테스트",
  "method": "POST",
  "url": "http://localhost:3000/api/auth/login",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "email": "nature.photographer@example.com",
    "password": "nature123!"
  }
}
```

#### **2. cURL 명령어 모음**
```bash
# 로그인
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nature.photographer@example.com","password":"nature123!"}'

# 사진 목록 조회
curl http://localhost:3000/api/photos

# 인증이 필요한 API (토큰 필요)
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 좋아요 토글
curl -X POST http://localhost:3000/api/likes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"photoId":1}'
```

#### **3. 브라우저에서 직접 테스트**
```javascript
// 브라우저 콘솔에서 실행
const testAPI = async () => {
  try {
    // 로그인
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nature.photographer@example.com',
        password: 'nature123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('로그인:', loginData);
    
    // 토큰 저장
    localStorage.setItem('token', loginData.data.token);
    
    // 사진 목록 조회
    const photosResponse = await fetch('/api/photos');
    const photosData = await photosResponse.json();
    console.log('사진 목록:', photosData);
    
  } catch (error) {
    console.error('API 테스트 실패:', error);
  }
};

testAPI();
```

---

## 🐳 **Docker 환경 관리**

### 📦 **Docker 명령어**
```bash
# 컨테이너 상태 확인
docker-compose ps

# 데이터베이스 로그 확인
docker-compose logs db

# 데이터베이스 중지
docker-compose stop

# 데이터베이스 재시작
docker-compose restart

# 완전한 정리 (데이터 삭제됨)
docker-compose down -v
```

### 🗃️ **데이터베이스 관리**
```bash
# Prisma Studio로 데이터 확인 (GUI)
npx prisma studio
# → http://localhost:5555에서 브라우저로 확인

# 직접 PostgreSQL 접속
docker exec -it finger-snap-backend-db-1 psql -U finger -d fingersnap

# SQL 쿼리 예시
SELECT * FROM users;
SELECT * FROM photos LIMIT 5;
SELECT COUNT(*) FROM likes;
```

### 🔄 **데이터 리셋**
```bash
# 샘플 데이터 재생성 (기존 데이터 삭제됨)
npm run seed

# 스키마 변경 시 데이터베이스 리셋
npx prisma db push --force-reset
npm run seed
```

---

## 🛡️ **보안 및 CORS 설정**

### 🌐 **CORS 설정 (이미 구성됨)**
```typescript
// 백엔드에서 이미 설정된 CORS
const corsOptions = {
  origin: [
    'http://localhost:3001',  // Next.js 기본 포트
    'http://localhost:3000',  // 대체 포트
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 🔐 **개발 환경 JWT 설정**
```typescript
// JWT 토큰 디버깅 (브라우저 콘솔)
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT Payload:', payload);
  console.log('만료 시간:', new Date(payload.exp * 1000));
}
```

---

## 📁 **파일 구조 이해**

### 🏗️ **백엔드 프로젝트 구조**
```
finger-snap-backend/
├── src/
│   ├── controllers/     # 라우트 핸들러
│   ├── services/        # 비즈니스 로직
│   ├── middlewares/     # 미들웨어 (인증, 에러처리)
│   ├── routes/          # API 라우트 정의
│   ├── utils/           # 유틸리티 함수
│   └── server.ts        # 서버 진입점
├── prisma/
│   ├── schema.prisma    # 데이터베이스 스키마
│   └── seeds/           # 샘플 데이터 생성
├── docs/
│   └── collaboration/   # 프론트엔드 협업 문서
└── docker-compose.yml   # PostgreSQL 컨테이너
```

### 📝 **주요 설정 파일들**
```typescript
// src/server.ts - 서버 진입점
// src/middlewares/auth.middleware.ts - JWT 인증
// src/utils/response.ts - 표준 응답 형식
// prisma/schema.prisma - 데이터베이스 스키마
```

---

## 🚨 **일반적인 문제 해결**

### ❌ **포트 충돌 문제**
```bash
# 포트 3000이 사용 중인 경우
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows

# 또는 다른 포트 사용
PORT=3001 npm run dev
```

### ❌ **데이터베이스 연결 오류**
```bash
# Docker 컨테이너 상태 확인
docker-compose ps

# PostgreSQL 컨테이너 재시작
docker-compose restart db

# 연결 테스트
npx prisma db pull
```

### ❌ **CORS 에러**
```javascript
// 프론트엔드에서 API 호출 시 
// fetch 옵션에 credentials 추가
fetch('/api/endpoint', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### ❌ **JWT 토큰 문제**
```javascript
// 토큰 유효성 확인
const checkToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    if (payload.exp < now) {
      localStorage.removeItem('token');
      return false; // 토큰 만료
    }
    
    return true;
  } catch {
    localStorage.removeItem('token');
    return false; // 잘못된 토큰
  }
};
```

---

## ⚡ **성능 최적화 팁**

### 🚀 **개발 서버 최적화**
```bash
# 더 빠른 파일 감지를 위한 설정
# package.json의 dev 스크립트가 이미 최적화됨
npm run dev  # tsx watch 사용으로 빠른 hot reload
```

### 📊 **API 응답 최적화**
```typescript
// 페이지네이션으로 데이터 양 제한
const photos = await fetch('/api/photos?page=1&limit=10');

// 필요한 필드만 요청 (향후 구현 예정)
const users = await fetch('/api/users?fields=id,username,profileImageUrl');
```

### 🗄️ **데이터베이스 쿼리 최적화**
```sql
-- 이미 적용된 인덱스들
-- user_id, photo_id 등 자주 조회되는 컬럼에 인덱스 설정
-- 복합 인덱스: (user_id, created_at) 등
```

---

## 📋 **개발 체크리스트**

### ✅ **환경 설정 완료 확인**
- [ ] Node.js 18+ 설치됨
- [ ] Docker Desktop 실행 중
- [ ] 백엔드 저장소 클론됨
- [ ] `npm install` 완료
- [ ] `.env` 파일 설정됨
- [ ] `docker-compose up -d` 실행됨
- [ ] `npm run seed` 완료
- [ ] `npm run dev` 서버 실행 중

### ✅ **API 연동 테스트**
- [ ] `curl http://localhost:3000/api/photos` 응답 확인
- [ ] 로그인 API 테스트 성공
- [ ] JWT 토큰 발급 및 인증 확인
- [ ] CORS 설정 정상 작동
- [ ] 프론트엔드에서 API 호출 성공

### ✅ **개발 도구 설정**
- [ ] Thunder Client 또는 Postman 설정
- [ ] Prisma Studio 접근 가능 (localhost:5555)
- [ ] 브라우저 개발자 도구로 네트워크 확인
- [ ] 에러 로깅 및 디버깅 환경 준비

---

## 🤝 **프론트엔드팀 지원**

### 📞 **문제 발생 시 연락 방법**
1. **백엔드 API 응답 이상**: 에러 메시지와 함께 요청 내용 공유
2. **데이터베이스 관련**: 샘플 데이터 이슈나 스키마 문의
3. **인증/보안 관련**: JWT 토큰이나 권한 관련 문제
4. **환경 설정**: Docker나 서버 실행 관련 문제

### 📋 **공유해야 할 정보**
```bash
# 환경 정보
node --version
npm --version
docker --version

# 서버 상태
curl http://localhost:3000/api/photos
docker-compose ps

# 에러 로그
npm run dev  # 콘솔 출력 확인
docker-compose logs db  # DB 로그 확인
```

이 가이드를 따라하면 **5분 내에 백엔드 API 연동 환경**을 구축할 수 있습니다! 🚀