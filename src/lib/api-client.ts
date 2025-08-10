/**
 * epiksode API 클라이언트
 * 
 * 백엔드와의 모든 HTTP 통신을 담당하는 중앙집중식 API 클라이언트
 * JWT 토큰 관리, 에러 처리, 요청/응답 인터셉터 포함
 */

import { 
    ApiResponse, 
    ApiError,
    LoginRequest, 
    LoginResponse, 
    RegisterRequest,
    PhotoListResponse,
    PhotoDetail,
    CreatePhotoRequest,
    CreatePhotoResponse,
    ToggleLikeRequest,
    ToggleLikeResponse,
    CommentListResponse,
    CreateCommentRequest,
    CommentDetail,
    User,
    UpdateProfileRequest,
    UserProfile,
    PaginatedResponse
} from '@/types';

// =============================================================================
// 🔧 API 클라이언트 설정
// =============================================================================

/** API 기본 설정 */
const API_CONFIG = {
    baseUrl: process.env.NODE_ENV === 'production' 
        ? '/api' 
        : 'http://localhost:3001/api', // 개발 환경에서는 백엔드 서버 포트 사용
    timeout: 30000, // 30초
    retryAttempts: 1, // 재시도 횟수를 1로 줄여서 404 에러 시 빠르게 폴백
    retryDelay: 1000, // 1초
} as const;

// 디버깅: 실제 설정값 확인
console.log('🔧 API_CONFIG 디버깅:', {
    NODE_ENV: process.env.NODE_ENV,
    baseUrl: API_CONFIG.baseUrl,
    fullConfig: API_CONFIG
});

/** 토큰 저장소 키 */
const TOKEN_STORAGE_KEY = 'epiksode_auth_token';
const TOKEN_EXPIRES_KEY = 'epiksode_auth_expires';

// =============================================================================
// 🚨 에러 처리 클래스
// =============================================================================

/** API 에러 클래스 */
export class ApiClientError extends Error {
    constructor(
        public code: string,
        public statusCode: number,
        message: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'ApiClientError';
    }

    /** 인증 에러인지 확인 */
    get isAuthError(): boolean {
        return this.statusCode === 401 || this.code.startsWith('AUTH_');
    }

    /** 네트워크 에러인지 확인 */
    get isNetworkError(): boolean {
        return this.statusCode === 0 || this.code === 'NETWORK_ERROR';
    }

    /** 서버 에러인지 확인 */
    get isServerError(): boolean {
        return this.statusCode >= 500;
    }

    /** 클라이언트 에러인지 확인 */
    get isClientError(): boolean {
        return this.statusCode >= 400 && this.statusCode < 500;
    }
}

// =============================================================================
// 🔐 토큰 관리
// =============================================================================

/** JWT 토큰 관리 클래스 */
class TokenManager {
    private token: string | null = null;
    private expiresAt: number | null = null;

    constructor() {
        this.loadFromStorage();
    }

    /** localStorage에서 토큰 로드 */
    private loadFromStorage(): void {
        // 서버사이드 렌더링 환경에서는 localStorage를 사용할 수 없음
        if (typeof window === 'undefined') return;
        
        try {
            this.token = localStorage.getItem(TOKEN_STORAGE_KEY);
            const expires = localStorage.getItem(TOKEN_EXPIRES_KEY);
            this.expiresAt = expires ? parseInt(expires, 10) : null;
        } catch (error) {
            console.warn('토큰 로드 실패:', error);
        }
    }

    /** localStorage에 토큰 저장 */
    private saveToStorage(): void {
        // 서버사이드 렌더링 환경에서는 localStorage를 사용할 수 없음
        if (typeof window === 'undefined') return;
        
        try {
            if (this.token && this.expiresAt) {
                localStorage.setItem(TOKEN_STORAGE_KEY, this.token);
                localStorage.setItem(TOKEN_EXPIRES_KEY, this.expiresAt.toString());
            } else {
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(TOKEN_EXPIRES_KEY);
            }
        } catch (error) {
            console.warn('토큰 저장 실패:', error);
        }
    }

    /** 토큰 설정 */
    setToken(token: string, expiresIn: number): void {
        this.token = token;
        this.expiresAt = Date.now() + expiresIn * 1000;
        this.saveToStorage();
    }

    /** 토큰 가져오기 */
    getToken(): string | null {
        if (!this.token || !this.expiresAt) return null;
        
        // 토큰 만료 확인 (5분 여유)
        if (Date.now() > this.expiresAt - 5 * 60 * 1000) {
            this.clearToken();
            return null;
        }

        return this.token;
    }

    /** 토큰 삭제 */
    clearToken(): void {
        this.token = null;
        this.expiresAt = null;
        this.saveToStorage();
    }

    /** 토큰 유효성 확인 */
    isValid(): boolean {
        return this.getToken() !== null;
    }
}

// =============================================================================
// 🌐 HTTP 클라이언트 클래스
// =============================================================================

export class ApiClient {
    private tokenManager = new TokenManager();

    constructor(private config = API_CONFIG) {}

    /** HTTP 요청 실행 */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;
        
        // 기본 헤더 설정
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...options.headers,
        });

        // 인증 토큰 추가
        const token = this.tokenManager.getToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        // 요청 옵션 구성
        const requestOptions: RequestInit = {
            ...options,
            headers,
            credentials: 'include', // CORS credentials 포함
            // AbortSignal.timeout은 브라우저 호환성 문제로 제거
            // signal: AbortSignal.timeout(this.config.timeout),
        };

        let lastError: Error;

        // 재시도 로직
        for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
            try {
                console.log(`🚀 Fetch 시도 ${attempt + 1}:`, { url, method: requestOptions.method });
                const response = await fetch(url, requestOptions);
                console.log(`✅ Fetch 응답 받음:`, { 
                    status: response.status, 
                    statusText: response.statusText,
                    ok: response.ok,
                    headers: Object.fromEntries(response.headers.entries())
                });
                return await this.handleResponse<T>(response);
            } catch (error) {
                lastError = error as Error;
                console.error(`❌ Fetch 에러 (시도 ${attempt + 1}):`, {
                    error: error,
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
                
                // 마지막 시도가 아니면 재시도
                if (attempt < this.config.retryAttempts - 1) {
                    // 지수 백오프로 딜레이
                    const delay = this.config.retryDelay * Math.pow(2, attempt);
                    console.log(`⏳ ${delay}ms 후 재시도...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }
        }

        throw this.createNetworkError(lastError!);
    }

    /** 응답 처리 */
    private async handleResponse<T>(response: Response): Promise<T> {
        let responseData: any;

        try {
            responseData = await response.json();
            console.log('📨 응답 데이터 파싱 성공:', responseData);
        } catch (error) {
            console.error('❌ JSON 파싱 실패:', error);
            throw new ApiClientError(
                'PARSE_ERROR',
                response.status,
                '응답 데이터를 파싱할 수 없습니다.'
            );
        }

        // 응답이 성공 상태인 경우
        if (response.ok) {
            // 백엔드가 ApiResponse 래퍼 형식을 사용하는 경우
            if (responseData && typeof responseData === 'object' && 'success' in responseData) {
                console.log('📦 래퍼 형식 응답 감지:', responseData);
                if (responseData.success) {
                    return responseData.data as T;
                }
                // success: false인 경우는 에러로 처리 (아래로)
            } else {
                // 백엔드가 직접 데이터를 반환하는 경우 (현재 상황)
                console.log('📋 직접 데이터 형식 응답 감지:', responseData);
                return responseData as T;
            }
        }

        // 에러 응답 처리
        console.error('❌ API 에러 응답:', { status: response.status, data: responseData });
        
        const apiError = responseData?.error || {
            code: 'UNKNOWN_ERROR',
            message: responseData?.message || '알 수 없는 오류가 발생했습니다.',
        };

        // 인증 에러 시 토큰 클리어
        if (response.status === 401) {
            this.tokenManager.clearToken();
        }

        throw new ApiClientError(
            apiError.code,
            response.status,
            responseData?.message || apiError.message,
            apiError.details
        );
    }

    /** 네트워크 에러 생성 */
    private createNetworkError(originalError: Error): ApiClientError {
        if (originalError.name === 'AbortError') {
            return new ApiClientError(
                'TIMEOUT_ERROR',
                0,
                '요청 시간이 초과되었습니다. 인터넷 연결을 확인해주세요.'
            );
        }

        return new ApiClientError(
            'NETWORK_ERROR',
            0,
            '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
            { originalError: originalError.message }
        );
    }

    /** GET 요청 */
    private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const searchParams = params ? new URLSearchParams(params).toString() : '';
        const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
        
        return this.request<T>(url, {
            method: 'GET',
        });
    }

    /** POST 요청 */
    private async post<T>(
        endpoint: string, 
        data?: any,
        isFormData = false
    ): Promise<T> {
        const options: RequestInit = {
            method: 'POST',
        };

        if (data) {
            if (isFormData) {
                options.body = data; // FormData는 그대로 전송
                // FormData는 Content-Type을 자동 설정하므로 헤더에서 제거
                options.headers = {};
            } else {
                options.body = JSON.stringify(data);
            }
        }

        return this.request<T>(endpoint, options);
    }

    /** PUT 요청 */
    private async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /** DELETE 요청 */
    private async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }

    /** PATCH 요청 */
    private async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // =============================================================================
    // 🔐 인증 API
    // =============================================================================

    /** 로그인 */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await this.post<LoginResponse>('/auth/login', credentials);
        
        // 토큰 저장
        this.tokenManager.setToken(response.token, response.expiresIn);
        
        return response;
    }

    /** 회원가입 */
    async register(userData: RegisterRequest): Promise<LoginResponse> {
        const response = await this.post<LoginResponse>('/auth/register', userData);
        
        // 토큰 저장
        this.tokenManager.setToken(response.token, response.expiresIn);
        
        return response;
    }

    /** 로그아웃 */
    async logout(): Promise<void> {
        this.tokenManager.clearToken();
        // 서버 측 로그아웃이 필요한 경우 여기에 추가
    }

    /** 현재 사용자 정보 조회 */
    async getCurrentUser(): Promise<User> {
        return this.get<User>('/users/me');
    }

    /** 프로필 수정 */
    async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
        return this.put<User>('/users/me/profile', profileData);
    }

    // =============================================================================
    // 📸 사진 API
    // =============================================================================

    /** 사진 목록 조회 */
    async getPhotos(params?: {
        sortBy?: 'latest' | 'popular';
        // page, limit은 백엔드에서 아직 구현되지 않음
    }): Promise<PhotoDetail[] | PhotoListResponse> {
        return this.get<PhotoDetail[] | PhotoListResponse>('/photos', params);
    }

    /** 사진 상세 조회 */
    async getPhoto(photoId: number): Promise<PhotoDetail> {
        return this.get<PhotoDetail>(`/photos/${photoId}`);
    }

    /** 사진 업로드 */
    async uploadPhoto(photoData: CreatePhotoRequest): Promise<CreatePhotoResponse> {
        const formData = new FormData();
        formData.append('title', photoData.title);
        if (photoData.description) {
            formData.append('description', photoData.description);
        }
        formData.append('image', photoData.image);

        return this.post<CreatePhotoResponse>('/photos', formData, true);
    }

    /** 사진 삭제 */
    async deletePhoto(photoId: number): Promise<void> {
        return this.delete<void>(`/photos/${photoId}`);
    }

    // =============================================================================
    // ❤️ 좋아요 API
    // =============================================================================

    /** 좋아요 토글 */
    async toggleLike(request: ToggleLikeRequest): Promise<ToggleLikeResponse> {
        return this.post<ToggleLikeResponse>('/likes', request);
    }

    /** 내가 좋아요한 사진 목록 */
    async getLikedPhotos(params?: {
        page?: number;
        limit?: number;
    }): Promise<PhotoListResponse> {
        return this.get<PhotoListResponse>('/users/me/likes', params);
    }

    // =============================================================================
    // 💬 댓글 API
    // =============================================================================

    /** 댓글 목록 조회 */
    async getComments(photoId: number, params?: {
        page?: number;
        limit?: number;
    }): Promise<CommentListResponse> {
        return this.get<CommentListResponse>(`/photos/${photoId}/comments`, params);
    }

    /** 댓글 작성 */
    async createComment(commentData: CreateCommentRequest): Promise<CommentDetail> {
        // 백엔드 스펙에 맞는 경로 사용
        if (commentData.photoId) {
            return this.post<CommentDetail>(`/photos/${commentData.photoId}/comments`, {
                content: commentData.content,
                parentId: commentData.parentId
            });
        } else if (commentData.seriesId) {
            return this.post<CommentDetail>(`/series/${commentData.seriesId}/comments`, {
                content: commentData.content,
                parentId: commentData.parentId
            });
        } else {
            throw new ApiClientError('INVALID_COMMENT_DATA', 400, 'photoId 또는 seriesId가 필요합니다.');
        }
    }

    /** 댓글 삭제 */
    async deleteComment(commentId: number): Promise<void> {
        return this.delete<void>(`/comments/${commentId}`);
    }

    // =============================================================================
    // 🔧 유틸리티
    // =============================================================================

    /** 현재 로그인 상태 확인 */
    isAuthenticated(): boolean {
        return this.tokenManager.isValid();
    }

    /** 수동 토큰 설정 (테스트용) */
    setToken(token: string, expiresIn: number): void {
        this.tokenManager.setToken(token, expiresIn);
    }

    /** 토큰 클리어 (강제 로그아웃) */
    clearToken(): void {
        this.tokenManager.clearToken();
    }
}

// =============================================================================
// 📤 싱글톤 인스턴스 내보내기
// =============================================================================

/** 전역 API 클라이언트 인스턴스 */
export const apiClient = new ApiClient();

// =============================================================================
// 🎯 편의 함수들
// =============================================================================

/** API 에러 메시지 사용자 친화적으로 변환 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiClientError) {
        return error.message;
    }
    
    if (error instanceof Error) {
        return error.message;
    }
    
    return '알 수 없는 오류가 발생했습니다.';
}

/** 네트워크 연결 상태 확인 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/** API 요청 재시도 헬퍼 */
export async function retryApiCall<T>(
    apiCall: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error as Error;
            
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }

    throw lastError!;
}