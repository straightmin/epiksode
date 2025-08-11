# 🔐 인증 시스템 가이드

**대상**: 프론트엔드 개발팀  
**작성일**: 2025년 8월 10일  
**목적**: JWT 인증 시스템 이해 및 프론트엔드 구현 가이드

---

## 🎯 **JWT 토큰 구조 및 사용법**

### 🔑 **JWT 토큰 구조**
```typescript
// JWT 토큰 예시
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibmF0dXJlLnBob3RvZ3JhcGhlckBleGFtcGxlLmNvbSIsImlhdCI6MTcyMzI4NDAwMCwiZXhwIjoxNzIzODg4ODAwfQ.signature"

// 토큰 구성요소
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"userId":1,"email":"nature.photographer@example.com","iat":1723284000,"exp":1723888800}
// Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### 📋 **JWT Payload 정보**
```typescript
interface JWTPayload {
  userId: number;        // 사용자 ID
  email: string;         // 이메일 주소
  iat: number;          // 발급 시각 (Unix timestamp)
  exp: number;          // 만료 시각 (Unix timestamp)
}

// 토큰 디코딩 예시
const decodeToken = (token: string): JWTPayload => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload;
};
```

### ⏰ **토큰 만료 시간**
- **기본 만료 시간**: 7일 (604,800초)
- **개발 환경**: JWT_EXPIRES_IN=7d
- **프로덕션 환경**: 보안상 더 짧은 시간 권장

---

## 🚀 **인증 API 엔드포인트**

### 📝 **회원가입 API**
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

interface RegisterResponse {
  success: true;
  message: "회원가입이 완료되었습니다.";
  data: {
    user: User;
    token: string;
    expiresIn: number;
  }
}

// 사용 예시
const register = async (data: RegisterRequest) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### 🔓 **로그인 API**
```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: true;
  message: "로그인되었습니다.";
  data: {
    user: User;
    token: string;
    expiresIn: number;
  }
}

// 실제 테스트 계정
const testLogin = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'nature.photographer@example.com',
      password: 'nature123!'
    })
  });
  
  const result = await response.json();
  if (result.success) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  
  return result;
};
```

### 👤 **현재 사용자 정보 API**
```typescript
// GET /api/users/me (인증 필요)
interface CurrentUserResponse {
  success: true;
  message: "사용자 정보를 조회했습니다.";
  data: UserProfile; // 통계 포함된 사용자 정보
}

// 사용 예시
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## 🛡️ **프론트엔드 인증 구현 가이드**

### 🔧 **AuthContext 구현**
```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });

  // 초기 토큰 로딩
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // 토큰 만료 확인
        if (payload.exp * 1000 > Date.now()) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        } else {
          // 만료된 토큰 정리
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('토큰 파싱 오류:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const result = await response.json();
      
      if (result.success) {
        const { user, token } = result.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 🔒 **Protected Route 컴포넌트**
```typescript
// components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
```

### 📡 **API 클라이언트 구현**
```typescript
// lib/apiClient.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        // 인증 에러 처리
        if (response.status === 401) {
          this.handleAuthError();
        }
        throw new ApiError(result.error?.code || 'API_ERROR', result.message);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('NETWORK_ERROR', '네트워크 오류가 발생했습니다.');
    }
  }

  private handleAuthError() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // HTTP 메소드들
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 파일 업로드용
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      throw new ApiError(result.error?.code || 'UPLOAD_ERROR', result.message);
    }

    return result;
  }
}

export const apiClient = new ApiClient();
```

---

## 🛡️ **보안 가이드라인**

### 🔒 **토큰 저장 보안**
```typescript
// ❌ 잘못된 방법: XSS 공격에 취약
// document.cookie에 토큰 저장하면 HttpOnly가 아닌 이상 스크립트로 접근 가능

// ✅ 권장 방법: localStorage 사용 (HTTPS 환경에서)
const secureTokenStorage = {
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
  
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// 🔐 더 보안이 강화된 방법 (실제 프로덕션에서 고려)
const secureStorage = {
  // HttpOnly 쿠키 + CSRF 토큰 조합
  // 또는 secure, sameSite 쿠키 옵션 활용
};
```

### ⏰ **자동 토큰 갱신 (Refresh Token)**
```typescript
// 현재 백엔드는 단순 JWT 구조
// 프로덕션에서는 Refresh Token 패턴 고려
interface TokenRefreshSystem {
  accessToken: string;   // 짧은 만료시간 (15분)
  refreshToken: string;  // 긴 만료시간 (7일)
}

// 토큰 자동 갱신 로직 예시
const useTokenRefresh = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;

    // 만료 5분 전에 갱신 시도
    if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
      refreshToken();
    }

    const timer = setTimeout(() => {
      refreshToken();
    }, Math.max(timeUntilExpiry - 5 * 60 * 1000, 0));

    return () => clearTimeout(timer);
  }, []);
};
```

### 🚨 **XSS 및 CSRF 방어**
```typescript
// XSS 방어
const sanitizeInput = (input: string): string => {
  // HTML 엔티티 이스케이핑
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// 사용자 입력 검증
const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },
  
  password: (password: string): boolean => {
    // 최소 8자, 대소문자, 숫자 포함
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  },
  
  username: (username: string): boolean => {
    // 2-50자, 영문, 숫자, 언더스코어만
    const usernameRegex = /^[a-zA-Z0-9_]{2,50}$/;
    return usernameRegex.test(username);
  }
};
```

---

## 🔍 **디버깅 및 테스트 도구**

### 🛠️ **JWT 토큰 디버깅**
```typescript
// JWT 토큰 검사 도구
const debugJWT = {
  // 토큰 유효성 검사
  validate: (token: string): boolean => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      
      return payload.exp > now;
    } catch {
      return false;
    }
  },
  
  // 토큰 정보 추출
  decode: (token: string) => {
    try {
      const header = JSON.parse(atob(token.split('.')[0]));
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      return {
        header,
        payload,
        isExpired: payload.exp * 1000 < Date.now(),
        expiresAt: new Date(payload.exp * 1000).toLocaleString(),
        issuedAt: new Date(payload.iat * 1000).toLocaleString()
      };
    } catch (error) {
      return { error: 'Invalid token format' };
    }
  },
  
  // 남은 시간 계산
  timeRemaining: (token: string): string => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const remainingMs = (payload.exp * 1000) - Date.now();
      
      if (remainingMs <= 0) return '만료됨';
      
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}시간 ${minutes}분 남음`;
    } catch {
      return '오류';
    }
  }
};

// 브라우저 콘솔에서 사용
// debugJWT.decode(localStorage.getItem('token'))
```

### 🧪 **인증 테스트 시나리오**
```typescript
// 인증 테스트 헬퍼
const authTesting = {
  // 로그인 테스트
  testLogin: async () => {
    const accounts = [
      { email: 'nature.photographer@example.com', password: 'nature123!' },
      { email: 'city.explorer@example.com', password: 'city123!' },
      { email: 'star.gazer@example.com', password: 'star123!' }
    ];
    
    for (const account of accounts) {
      console.log(`테스트 계정: ${account.email}`);
      try {
        const result = await apiClient.post('/auth/login', account);
        console.log('✅ 로그인 성공:', result.data.user.username);
      } catch (error) {
        console.log('❌ 로그인 실패:', error.message);
      }
    }
  },
  
  // 보호된 엔드포인트 테스트
  testProtectedEndpoints: async () => {
    const endpoints = [
      '/users/me',
      '/photos?limit=5',
      '/notifications?limit=5'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const result = await apiClient.get(endpoint);
        console.log(`✅ ${endpoint}:`, result);
      } catch (error) {
        console.log(`❌ ${endpoint}:`, error.message);
      }
    }
  }
};
```

---

## 📋 **인증 시스템 체크리스트**

### ✅ **구현 완료 확인**
- [ ] JWT 토큰 저장 및 관리 시스템
- [ ] AuthContext와 useAuth 훅
- [ ] 자동 로그인 (페이지 새로고침 시)
- [ ] 토큰 만료 감지 및 로그아웃
- [ ] API 요청에 자동 토큰 첨부
- [ ] 401 에러 시 자동 로그아웃
- [ ] Protected Route 컴포넌트
- [ ] 로그인/회원가입 폼 구현

### ✅ **보안 검증**
- [ ] XSS 공격 방어 (입력값 검증)
- [ ] CSRF 토큰 구현 (필요시)
- [ ] HTTPS 강제 (프로덕션)
- [ ] 패스워드 규칙 검증
- [ ] 토큰 만료 시간 적절성
- [ ] 민감 정보 콘솔 로그 제거

### ✅ **사용자 경험**
- [ ] 로그인 상태 유지 (새로고침 후에도)
- [ ] 로딩 상태 표시
- [ ] 친화적인 에러 메시지
- [ ] 자동 리다이렉션 (로그인 후 원래 페이지로)
- [ ] 로그아웃 확인 대화상자

이 가이드를 참고하여 **안전하고 사용자 친화적인** 인증 시스템을 구현하세요! 🔐