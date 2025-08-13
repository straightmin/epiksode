/**
 * epiksode API 클라이언트
 *
 * 백엔드와의 모든 HTTP 통신을 담당하는 중앙집중식 API 클라이언트
 * JWT 토큰 관리, 에러 처리, 요청/응답 인터셉터 포함
 */

import {
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
    SearchParams,
    SearchResponse,
} from "@/types";

// Import enhanced API response types (PR #3 Fix)
import {
    CommentApiResponse,
    CommentCreateResponse,
    extractResponseData,
    extractPaginatedData,
} from "@/types/api";

// =============================================================================
// 🔧 API 클라이언트 설정
// =============================================================================

/** API 기본 설정 */
const API_CONFIG = {
    baseUrl:
        process.env.NODE_ENV === "production"
            ? "/api"
            : "http://localhost:3001/api", // 개발 환경에서는 백엔드 서버 포트 사용
    timeout: 30000, // 30초
    retryAttempts: 1, // 재시도 횟수를 1로 줄여서 404 에러 시 빠르게 폴백
    retryDelay: 1000, // 1초
} as const;

// 디버깅: 실제 설정값 확인
console.log("🔧 API_CONFIG 디버깅:", {
    NODE_ENV: process.env.NODE_ENV,
    baseUrl: API_CONFIG.baseUrl,
    fullConfig: API_CONFIG,
});

/** 토큰 저장소 키 */
const TOKEN_STORAGE_KEY = "epiksode_auth_token";
const TOKEN_EXPIRES_KEY = "epiksode_auth_expires";

// =============================================================================
// 🚨 에러 처리 클래스 및 인터페이스
// =============================================================================

/** API 에러 응답 인터페이스 */
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    timestamp?: string;
}

/** API 에러 클래스 */
export class ApiClientError extends Error {
    constructor(
        public code: string,
        public statusCode: number,
        message: string,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = "ApiClientError";
    }

    /** 인증 에러인지 확인 */
    get isAuthError(): boolean {
        return this.statusCode === 401 || this.code.startsWith("AUTH_");
    }

    /** 네트워크 에러인지 확인 */
    get isNetworkError(): boolean {
        return this.statusCode === 0 || this.code === "NETWORK_ERROR";
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
        if (typeof window === "undefined") return;

        try {
            this.token = localStorage.getItem(TOKEN_STORAGE_KEY);
            const expires = localStorage.getItem(TOKEN_EXPIRES_KEY);
            if (expires) {
                const parsed = parseInt(expires, 10);
                this.expiresAt = isNaN(parsed) ? null : parsed;
            } else {
                this.expiresAt = null;
            }
        } catch (error) {
            console.warn("토큰 로드 실패:", error);
        }
    }

    /** localStorage에 토큰 저장 */
    private saveToStorage(): void {
        // 서버사이드 렌더링 환경에서는 localStorage를 사용할 수 없음
        if (typeof window === "undefined") return;

        try {
            if (this.token && this.expiresAt) {
                localStorage.setItem(TOKEN_STORAGE_KEY, this.token);
                localStorage.setItem(
                    TOKEN_EXPIRES_KEY,
                    this.expiresAt.toString()
                );
            } else {
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(TOKEN_EXPIRES_KEY);
            }
        } catch (error) {
            console.warn("토큰 저장 실패:", error);
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
        const token = this.getToken();
        if (!token) return false;

        try {
            // JWT 토큰 구조 검증 (간단한 형식 체크)
            const parts = token.split(".");
            return parts.length === 3;
        } catch {
            return false;
        }
    }
}

// =============================================================================
// 🌐 HTTP 클라이언트 클래스
// =============================================================================

export class ApiClient {
    private tokenManager = new TokenManager();

    constructor(private config = API_CONFIG) {}

    /**
     * AbortController를 사용한 타임아웃 구현
     */
    private createAbortSignal(timeout: number): AbortSignal {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller.signal;
    }

    /**
     * 타임아웃을 적용한 fetch 실행
     */
    private async fetchWithTimeout(
        url: string,
        options: RequestInit,
        timeout: number = this.config.timeout
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === "AbortError") {
                throw new Error("Request timeout");
            }
            throw error;
        }
    }

    /**
     * 재시도 가능한 에러인지 판단
     */
    private isRetryableHttpError(status: number): boolean {
        // 5xx 서버 에러나 429 (Too Many Requests)는 재시도 가능
        return status >= 500 || status === 429;
    }

    /** HTTP 요청 실행 */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.config.baseUrl}${endpoint}`;

        // 기본 헤더 설정
        const headers = new Headers({
            "Content-Type": "application/json",
            ...options.headers,
        });

        // 인증 토큰 추가
        const token = this.tokenManager.getToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        // 요청 옵션 구성
        const requestOptions: RequestInit = {
            ...options,
            headers,
            credentials: "include", // CORS credentials 포함
        };

        let lastError: Error;
        const maxAttempts = this.config.retryAttempts + 1; // 초기 시도 포함

        // 재시도 로직
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                console.log(`🚀 Fetch 시도 ${attempt + 1}/${maxAttempts}:`, {
                    url,
                    method: requestOptions.method,
                });

                // 타임아웃이 적용된 fetch 사용
                const response = await this.fetchWithTimeout(
                    url,
                    requestOptions,
                    this.config.timeout
                );

                console.log(`✅ Fetch 응답 받음:`, {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok,
                });

                // 재시도 가능한 HTTP 에러인 경우
                if (
                    !response.ok &&
                    this.isRetryableHttpError(response.status) &&
                    attempt < maxAttempts - 1
                ) {
                    const delay = this.config.retryDelay * Math.pow(2, attempt);
                    console.log(
                        `⚠️ HTTP ${response.status} 에러, ${delay}ms 후 재시도...`
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }

                return await this.handleResponse<T>(response);
            } catch (error) {
                lastError = error as Error;
                console.error(
                    `❌ Fetch 에러 (시도 ${attempt + 1}/${maxAttempts}):`,
                    {
                        error: error,
                        message:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        name: error instanceof Error ? error.name : "Unknown",
                    }
                );

                // 마지막 시도가 아니고 재시도 가능한 에러인 경우
                if (attempt < maxAttempts - 1) {
                    // 네트워크 에러나 타임아웃은 재시도
                    if (
                        lastError.message === "Request timeout" ||
                        lastError.name === "TypeError" ||
                        lastError.name === "NetworkError"
                    ) {
                        const delay =
                            this.config.retryDelay * Math.pow(2, attempt);
                        console.log(`⏳ ${delay}ms 후 재시도...`);
                        await new Promise((resolve) =>
                            setTimeout(resolve, delay)
                        );
                        continue;
                    }
                }
            }
        }

        throw this.createNetworkError(lastError!);
    }

    /** 응답 처리 */
    private async handleResponse<T>(response: Response): Promise<T> {
        let responseData: unknown;

        try {
            // Content-Type 확인
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
                console.log("📨 응답 데이터 파싱 성공:", responseData);
            } else {
                // JSON이 아닌 응답 처리
                const text = await response.text();
                console.warn("⚠️ 비JSON 응답:", { contentType, text });
                throw new ApiClientError(
                    "INVALID_CONTENT_TYPE",
                    response.status,
                    "JSON 형식의 응답이 아닙니다."
                );
            }
        } catch (error) {
            console.error("❌ JSON 파싱 실패:", error);
            throw new ApiClientError(
                "PARSE_ERROR",
                response.status,
                "응답 데이터를 파싱할 수 없습니다.",
                {
                    originalError:
                        error instanceof Error ? error.message : String(error),
                }
            );
        }

        // 응답이 성공 상태인 경우
        if (response.ok) {
            // 백엔드가 ApiResponse 래퍼 형식을 사용하는 경우
            if (
                responseData &&
                typeof responseData === "object" &&
                "success" in responseData
            ) {
                console.log("📦 래퍼 형식 응답 감지:", responseData);
                if (responseData.success) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return (responseData as any).data as T;
                }
                // success: false인 경우는 에러로 처리 (아래로)
            } else {
                // 백엔드가 직접 데이터를 반환하는 경우 (현재 상황)
                console.log("📋 직접 데이터 형식 응답 감지:", responseData);
                return responseData as T;
            }
        }

        // 에러 응답 처리
        console.error("❌ API 에러 응답:", {
            status: response.status,
            data: responseData,
        });

        const errorResponse = responseData as ApiErrorResponse | { error?: { code: string; message: string }; message?: string };
        const apiError = errorResponse?.error || {
            code: "UNKNOWN_ERROR",
            message: ("message" in errorResponse ? errorResponse.message : undefined) || "알 수 없는 오류가 발생했습니다.",
        };

        // 인증 에러 시 토큰 클리어
        if (response.status === 401) {
            this.tokenManager.clearToken();
        }

        throw new ApiClientError(
            apiError.code,
            response.status,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (responseData as any)?.message || apiError.message,
            undefined // details not available in this error response format
        );
    }

    /** 네트워크 에러 생성 */
    private createNetworkError(originalError: Error): ApiClientError {
        // 타임아웃 에러
        if (
            originalError.message === "Request timeout" ||
            originalError.name === "AbortError"
        ) {
            return new ApiClientError(
                "TIMEOUT_ERROR",
                0,
                "요청 시간이 초과되었습니다. 인터넷 연결을 확인해주세요."
            );
        }

        // TypeError는 보통 네트워크 연결 문제
        if (originalError.name === "TypeError") {
            return new ApiClientError(
                "NETWORK_ERROR",
                0,
                "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.",
                { originalError: originalError.message }
            );
        }

        // CORS 에러
        if (originalError.message.includes("CORS")) {
            return new ApiClientError(
                "CORS_ERROR",
                0,
                "CORS 정책으로 인해 요청이 차단되었습니다.",
                { originalError: originalError.message }
            );
        }

        return new ApiClientError(
            "NETWORK_ERROR",
            0,
            "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.",
            { originalError: originalError.message }
        );
    }

    /** GET 요청 */
    private async get<T>(
        endpoint: string,
        params?: Record<string, unknown>
    ): Promise<T> {
        let searchParams = "";
        if (params) {
            const urlParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    urlParams.append(key, String(value));
                }
            });
            searchParams = urlParams.toString();
        }
        const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;

        return this.request<T>(url, {
            method: "GET",
        });
    }

    /** POST 요청 */
    private async post<T>(
        endpoint: string,
        data?: unknown,
        isFormData = false
    ): Promise<T> {
        const options: RequestInit = {
            method: "POST",
        };

        if (data) {
            if (isFormData) {
                options.body = data as BodyInit; // FormData는 그대로 전송
                // FormData는 Content-Type을 자동 설정하므로 헤더에서 제거
                options.headers = {};
            } else {
                options.body = JSON.stringify(data);
            }
        }

        return this.request<T>(endpoint, options);
    }

    /** PUT 요청 */
    private async put<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /** DELETE 요청 */
    private async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: "DELETE",
        });
    }

    /** PATCH 요청 */
    private async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // =============================================================================
    // 🔐 인증 API
    // =============================================================================

    /** 로그인 */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await this.post<LoginResponse>(
            "/auth/login",
            credentials
        );

        // 토큰 저장
        this.tokenManager.setToken(response.token, response.expiresIn);

        return response;
    }

    /** 회원가입 */
    async register(userData: RegisterRequest): Promise<LoginResponse> {
        const response = await this.post<LoginResponse>(
            "/auth/register",
            userData
        );

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
        return this.get<User>("/users/me");
    }

    /** 내 프로필 조회 */
    async getMyProfile(): Promise<User> {
        return this.get<User>("/users/me");
    }

    /** 다른 사용자 프로필 조회 */
    async getUserProfile(userId: number): Promise<User> {
        return this.get<User>(`/users/${userId}`);
    }

    /** 사용자의 사진 목록 조회 */
    async getUserPhotos(userId: number): Promise<PhotoDetail[]> {
        const response = await this.get<unknown[]>(`/users/${userId}/photos`);

        // S3 URL을 프록시 URL로 변환하는 함수 (getPhotos와 동일한 로직)
        const convertToProxyUrl = (
            url: string,
            photoId: number,
            isThumbnail: boolean = false
        ) => {
            if (url.includes("/api/images/")) {
                return url;
            }

            const baseUrl = API_CONFIG.baseUrl.replace("/api", "");
            const endpoint = isThumbnail
                ? "/api/images/thumbnails/"
                : "/api/images/";
            return `${baseUrl}${endpoint}${photoId}`;
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedPhotos = (response as any[]).map((photo) => ({
            id: photo.id,
            title: photo.title || "제목 없음",
            description: photo.description || null,
            imageUrl: convertToProxyUrl(photo.imageUrl || "", photo.id),
            thumbnailUrl: convertToProxyUrl(
                photo.thumbnailUrl || photo.imageUrl || "",
                photo.id,
                true
            ),
            author: {
                id: photo.author?.id || photo.userId,
                username: photo.author?.username || "unknown",
                bio: photo.author?.bio || null,
                profileImageUrl: photo.author?.profileImageUrl || null,
                createdAt: photo.author?.createdAt || photo.createdAt,
            },
            userId: photo.userId,
            viewCount: photo.viewCount || 0,
            isPublic: photo.isPublic !== false,
            deletedAt: photo.deletedAt || null,
            likesCount: photo.likesCount || 0,
            commentsCount: photo.commentsCount || 0,
            isLikedByCurrentUser: photo.isLikedByCurrentUser || false,
            isOwner: photo.isOwner || false,
            createdAt: photo.createdAt,
            updatedAt: photo.updatedAt || photo.createdAt,
        }));

        return mappedPhotos;
    }

    /** 프로필 수정 */
    async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
        return this.put<User>("/users/me/profile", profileData);
    }

    // =============================================================================
    // 📸 사진 API
    // =============================================================================

    /** 사진 목록 조회 */
    async getPhotos(params?: {
        sortBy?: "latest" | "popular";
        // page, limit은 백엔드에서 아직 구현되지 않음
    }): Promise<PhotoDetail[] | PhotoListResponse> {
        const response = await this.get<unknown[]>("/photos", params);

        // S3 URL을 프록시 URL로 변환하는 함수
        const convertToProxyUrl = (
            url: string,
            photoId: number,
            isThumbnail: boolean = false
        ) => {
            // 이미 프록시 URL인 경우 그대로 반환
            if (url.includes("/api/images/")) {
                return url;
            }

            // S3 URL인 경우 프록시 URL로 변환
            const s3Domains = process.env.NEXT_PUBLIC_S3_DOMAINS?.split(',') || ['.s3.', 'amazonaws.com'];
            const isS3Url = s3Domains.some(domain => url.includes(domain));
            
            if (isS3Url) {
                const baseUrl = this.config.baseUrl.replace("/api", ""); // http://localhost:3001
                return isThumbnail
                    ? `${baseUrl}/api/images/thumbnails/${photoId}`
                    : `${baseUrl}/api/images/${photoId}`;
            }

            // 기타 URL은 그대로 반환
            return url;
        };

        // 백엔드 응답을 프론트엔드 타입에 맞게 매핑
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedPhotos: PhotoDetail[] = response.map((photo: any) => ({
            ...photo,
            // 이미지 URL을 프록시 URL로 변환
            imageUrl: convertToProxyUrl(photo.imageUrl, photo.id, false),
            thumbnailUrl: convertToProxyUrl(photo.thumbnailUrl, photo.id, true),
            // author 필드 매핑 (백엔드에서 부족한 필드들 기본값 설정)
            author: {
                id: photo.author?.id,
                username: photo.author?.username,
                bio: photo.author?.bio || null,
                profileImageUrl: photo.author?.profileImageUrl || null,
                createdAt: photo.author?.createdAt || photo.createdAt,
            },
            // commentsCount 기본값 설정 (백엔드에서 미제공시)
            commentsCount: photo.commentsCount || photo._count?.comments || 0,
            // 현재 사용자 관련 필드 기본값
            isLikedByCurrentUser: photo.isLikedByCurrentUser || false,
            isOwner: photo.isOwner || false,
        }));

        // console.log('📋 매핑된 사진 URL 확인:', mappedPhotos.slice(0, 3).map(p => ({
        //     id: p.id,
        //     imageUrl: p.imageUrl,
        //     thumbnailUrl: p.thumbnailUrl
        // })));
        return mappedPhotos;
    }

    /** 사진 상세 조회 */
    async getPhoto(photoId: number): Promise<PhotoDetail> {
        return this.get<PhotoDetail>(`/photos/${photoId}`);
    }

    /** 사진 업로드 */
    async uploadPhoto(
        photoData: CreatePhotoRequest
    ): Promise<CreatePhotoResponse> {
        const formData = new FormData();
        formData.append("title", photoData.title);
        if (photoData.description) {
            formData.append("description", photoData.description);
        }
        formData.append("image", photoData.image);

        return this.post<CreatePhotoResponse>("/photos", formData, true);
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
        return this.post<ToggleLikeResponse>("/likes", request);
    }

    /** 내가 좋아요한 사진 목록 */
    async getLikedPhotos(params?: {
        page?: number;
        limit?: number;
    }): Promise<PhotoListResponse> {
        return this.get<PhotoListResponse>("/users/me/likes", params);
    }

    // =============================================================================
    // 💬 댓글 API
    // =============================================================================

    /** 댓글 목록 조회 - Enhanced with PR #3 fix */
    async getComments(
        photoId: number,
        params?: {
            page?: number;
            limit?: number;
        }
    ): Promise<CommentListResponse> {
        try {
            const response = await this.get<CommentApiResponse>(
                `/photos/${photoId}/comments`,
                params
            );

            // ✅ PR #3 Fix: Extract data from response.data.data instead of response.comments
            const paginatedData = extractPaginatedData<CommentDetail>(response);

            return {
                data: paginatedData.data,
                pagination: paginatedData.pagination,
            };
        } catch (error) {
            console.error("Error fetching comments:", error);

            // Return empty result with proper error handling
            return {
                data: [],
                pagination: {
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                },
            };
        }
    }

    /** 댓글 작성 - Enhanced with PR #3 fix and error handling */
    async createComment(
        commentData: CreateCommentRequest
    ): Promise<CommentDetail> {
        try {
            let response: CommentCreateResponse;

            // Backend spec-compliant route usage
            if (commentData.photoId) {
                response = await this.post<CommentCreateResponse>(
                    `/photos/${commentData.photoId}/comments`,
                    {
                        content: commentData.content,
                        parentId: commentData.parentId,
                    }
                );
            } else if (commentData.seriesId) {
                response = await this.post<CommentCreateResponse>(
                    `/series/${commentData.seriesId}/comments`,
                    {
                        content: commentData.content,
                        parentId: commentData.parentId,
                    }
                );
            } else {
                throw new ApiClientError(
                    "INVALID_COMMENT_DATA",
                    400,
                    "photoId 또는 seriesId가 필요합니다."
                );
            }

            // ✅ Extract comment data with proper error handling
            return extractResponseData<CommentDetail>(response);
        } catch (error) {
            console.error("Error creating comment:", error);

            // Re-throw with enhanced error information
            if (error instanceof ApiClientError) {
                throw error;
            }

            throw new ApiClientError(
                "COMMENT_CREATE_FAILED",
                500,
                "댓글 작성에 실패했습니다. 다시 시도해주세요.",
                {
                    originalError:
                        error instanceof Error ? error.message : String(error),
                }
            );
        }
    }

    /** 댓글 삭제 - Enhanced with error handling and rollback support */
    async deleteComment(commentId: number): Promise<void> {
        try {
            await this.delete<void>(`/comments/${commentId}`);
        } catch (error) {
            console.error("Error deleting comment:", error);

            // Enhanced error handling for different scenarios
            if (error instanceof ApiClientError) {
                if (error.statusCode === 404) {
                    throw new ApiClientError(
                        "COMMENT_NOT_FOUND",
                        404,
                        "삭제하려는 댓글을 찾을 수 없습니다."
                    );
                } else if (error.statusCode === 403) {
                    throw new ApiClientError(
                        "COMMENT_DELETE_FORBIDDEN",
                        403,
                        "이 댓글을 삭제할 권한이 없습니다."
                    );
                }
                throw error;
            }

            throw new ApiClientError(
                "COMMENT_DELETE_FAILED",
                500,
                "댓글 삭제에 실패했습니다. 다시 시도해주세요.",
                {
                    originalError:
                        error instanceof Error ? error.message : String(error),
                }
            );
        }
    }

    // =============================================================================
    // 🔍 검색 API
    // =============================================================================

    /** 통합 검색 */
    async search(params: SearchParams): Promise<SearchResponse> {
        return this.get<SearchResponse>(
            "/search",
            params as unknown as Record<string, unknown>
        );
    }

    // =============================================================================
    // 🖼️ 이미지 프록시 API
    // =============================================================================

    /** 이미지 프록시 URL 생성 */
    getImageUrl(photoId: number, thumbnail = false): string {
        const endpoint = thumbnail ? "thumbnails" : "";
        return `${this.config.baseUrl}/images/${endpoint ? endpoint + "/" : ""}${photoId}`;
    }

    /** 썸네일 이미지 URL 생성 */
    getThumbnailUrl(photoId: number): string {
        return this.getImageUrl(photoId, true);
    }

    /** 이미지 메타데이터 조회 (HEAD 요청) */
    async getImageMetadata(
        photoId: number,
        thumbnail = false
    ): Promise<{
        contentType?: string;
        contentLength?: number;
        lastModified?: string;
        etag?: string;
    }> {
        const endpoint = thumbnail ? "thumbnails" : "";
        const url = `/images/${endpoint ? endpoint + "/" : ""}${photoId}`;

        try {
            const response = await fetch(`${this.config.baseUrl}${url}`, {
                method: "HEAD",
                headers: {
                    Authorization: this.tokenManager.getToken()
                        ? `Bearer ${this.tokenManager.getToken()}`
                        : "",
                },
            });

            if (!response.ok) {
                throw new ApiClientError(
                    "IMAGE_METADATA_ERROR",
                    response.status,
                    "이미지 메타데이터를 가져올 수 없습니다."
                );
            }

            return {
                contentType: response.headers.get("content-type") || undefined,
                contentLength: (() => {
                    const length = response.headers.get("content-length");
                    if (!length) return undefined;
                    const parsed = parseInt(length, 10);
                    return isNaN(parsed) ? undefined : parsed;
                })(),
                lastModified:
                    response.headers.get("last-modified") || undefined,
                etag: response.headers.get("etag") || undefined,
            };
        } catch (error) {
            if (error instanceof ApiClientError) {
                throw error;
            }
            throw new ApiClientError(
                "NETWORK_ERROR",
                0,
                "이미지 메타데이터 조회 중 네트워크 오류가 발생했습니다."
            );
        }
    }

    /** 이미지 존재 여부 확인 */
    async checkImageExists(
        photoId: number,
        thumbnail = false
    ): Promise<boolean> {
        try {
            await this.getImageMetadata(photoId, thumbnail);
            return true;
        } catch {
            return false;
        }
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

    return "알 수 없는 오류가 발생했습니다.";
}

/** 네트워크 연결 상태 확인 */
export function isOnline(): boolean {
    // 서버사이드에서는 true 반환
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
}

/** 에러 유형 분류 */
export function getErrorType(
    error: unknown
): "network" | "auth" | "server" | "client" | "unknown" {
    if (error instanceof ApiClientError) {
        if (error.isNetworkError) return "network";
        if (error.isAuthError) return "auth";
        if (error.isServerError) return "server";
        if (error.isClientError) return "client";
    }
    return "unknown";
}

/** 에러에 따른 재시도 가능 여부 */
export function isRetryableError(error: unknown): boolean {
    if (error instanceof ApiClientError) {
        // 네트워크 에러와 일부 서버 에러는 재시도 가능
        return (
            error.isNetworkError ||
            (error.isServerError && error.statusCode >= 500)
        );
    }
    return false;
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

            // 재시도 불가능한 에러는 즉시 throw
            if (!isRetryableError(error)) {
                throw error;
            }

            if (i < maxRetries - 1) {
                // 지수 백오프 + 지터 추가
                const backoffDelay = delay * Math.pow(2, i);
                const jitter = Math.random() * 1000;
                await new Promise((resolve) =>
                    setTimeout(resolve, backoffDelay + jitter)
                );
            }
        }
    }

    throw lastError!;
}
