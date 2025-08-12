/**
 * epiksode API 타입 정의
 * 
 * 백엔드 스키마와 완전히 동기화된 정확한 타입 정의
 * 기준: docs/collaboration/api_response_types.ts
 * 
 * ⚠️ 주의: 이 타입들은 실제 백엔드 API 응답과 정확히 일치합니다.
 */

// =============================================================================
// 🛠️ 유틸리티 타입
// =============================================================================

/** ID 타입 정의 - Branded Type으로 타입 안전성 강화 */
export type ID = number & { readonly __brand: unique symbol };

/** 
 * ID 생성 함수 - 양수 정수만 허용
 * @throws {Error} 양수 정수가 아닌 경우 에러 발생
 */
export function createID(value: number): ID {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`Invalid ID: ${value}. ID must be a positive integer.`);
    }
    return value as ID;
}

/**
 * 문자열을 ID로 파싱
 * @throws {Error} 유효하지 않은 ID 문자열인 경우 에러 발생
 */
export function parseID(value: string): ID {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Invalid ID string: "${value}". Cannot parse to number.`);
    }
    return createID(parsed);
}

/**
 * 안전한 ID 파싱 (에러 대신 null 반환)
 */
export function safeParseID(value: string | number | null | undefined): ID | null {
    if (value === null || value === undefined) {
        return null;
    }
    
    try {
        if (typeof value === 'number') {
            return createID(value);
        }
        if (typeof value === 'string') {
            return parseID(value);
        }
    } catch {
        return null;
    }
    
    return null;
}

/** 선택적 필드를 가진 타입 생성 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** 필수 필드를 가진 타입 생성 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/** 깊은 부분 타입 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** API 상태 */
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

/** 정렬 방향 */
export type SortOrder = 'asc' | 'desc';

/** 컨텐츠 정렬 기준 */
export type SortBy = 'latest' | 'popular' | 'oldest';

// =============================================================================
// 🔧 공통 타입 정의
// =============================================================================

/** 공통 API 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
}

/** 에러 응답 구조 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** 페이지네이션 메타데이터 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** 기본 타임스탬프 필드 */
export interface Timestamps {
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

// =============================================================================
// 👥 사용자 관련 타입
// =============================================================================

/** 기본 사용자 정보 (백엔드 User 엔티티) */
export interface User extends Timestamps {
  id: ID; // ⚠️ 정수형 ID (기존 string에서 변경)
  email: string;
  username: string;
  bio: string | null;
  profileImageUrl: string | null; // ⚠️ avatar에서 변경
  
  // 알림 설정
  notifyLikes: boolean;
  notifyComments: boolean;
  notifyFollows: boolean;
  notifySeries: boolean;
  
  // 소프트 삭제
  deletedAt: string | null;
}

/** 공개용 사용자 정보 (패스워드 해시 제외) */
export interface PublicUser {
  id: ID;
  username: string;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
}

/** 사용자 프로필 (통계 포함) */
export interface UserProfile extends PublicUser {
  // 계산된 필드들
  photosCount: number;
  followersCount: number; // ⚠️ followers에서 변경
  followingCount: number; // ⚠️ following에서 변경
  seriesCount: number;
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isFollowedByCurrentUser?: boolean; // ⚠️ isFollowing에서 변경
  isFollowingCurrentUser?: boolean;
}

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 회원가입 요청 */
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

/** 로그인 응답 */
export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number; // 초 단위
}

/** 프로필 수정 요청 */
export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  profileImageUrl?: string;
}

// =============================================================================
// 📸 사진 관련 타입
// =============================================================================

/** 기본 사진 정보 (백엔드 Photo 엔티티) */
export interface Photo extends Timestamps {
  id: number; // ⚠️ string에서 number로 변경
  userId: number; // ⚠️ photographerId에서 변경
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string; // ⚠️ 새로 추가된 필드
  viewCount: number; // ⚠️ 새로 추가된 필드
  isPublic: boolean; // ⚠️ 새로 추가된 필드
  deletedAt: string | null;
}

/** 사진 상세 정보 (작성자 포함) - 실제 API 응답 */
export interface PhotoDetail extends Photo {
  // 관계 데이터
  author: PublicUser; // ⚠️ photographer에서 변경
  
  // 계산된 필드들
  likesCount: number; // ⚠️ likes에서 변경
  commentsCount: number; // ⚠️ comments에서 변경
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isLikedByCurrentUser?: boolean; // ⚠️ isLiked에서 변경
  isOwner?: boolean; // ⚠️ 새로 추가된 필드
}

/** 사진 목록 조회 응답 */
export type PhotoListResponse = PaginatedResponse<PhotoDetail>;

/** 사진 업로드 요청 */
export interface CreatePhotoRequest {
  title: string;
  description?: string;
  image: File; // FormData로 전송
}

/** 사진 업로드 응답 */
export interface CreatePhotoResponse {
  photo: PhotoDetail;
  message: string;
}

// =============================================================================
// 💬 댓글 관련 타입
// =============================================================================

/** 기본 댓글 정보 (백엔드 Comment 엔티티) */
export interface Comment extends Timestamps {
  id: number; // ⚠️ string에서 number로 변경
  userId: number; // ⚠️ 새로 추가된 필드
  content: string;
  
  // 다형성 필드들 (둘 중 하나만 값을 가짐)
  photoId: number | null;
  seriesId: number | null;
  
  // 대댓글
  parentId: number | null; // ⚠️ string에서 number로 변경
  
  deletedAt: string | null;
}

/** 댓글 상세 정보 (작성자 포함) - 실제 API 응답 */
export interface CommentDetail extends Comment {
  // 관계 데이터
  author: PublicUser; // ⚠️ user에서 변경
  
  // 계산된 필드들
  likesCount: number; // ⚠️ likes에서 변경
  repliesCount: number; // ⚠️ 새로 추가된 필드
  
  // 대댓글 목록 (옵션)
  replies?: CommentDetail[];
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isLikedByCurrentUser?: boolean; // ⚠️ isLiked에서 변경
  isOwner?: boolean; // ⚠️ 새로 추가된 필드
}

/** 댓글 작성 요청 */
export interface CreateCommentRequest {
  content: string;
  photoId?: number; // ⚠️ string에서 number로 변경
  seriesId?: number; // ⚠️ string에서 number로 변경
  parentId?: number; // 대댓글인 경우
}

/** 댓글 목록 조회 응답 */
export type CommentListResponse = PaginatedResponse<CommentDetail>;

// =============================================================================
// ❤️ 좋아요 관련 타입
// =============================================================================

/** 기본 좋아요 정보 */
export interface Like {
  id: number;
  userId: number;
  createdAt: string;
  
  // 다형성 필드들 (셋 중 하나만 값을 가짐)
  photoId: number | null;
  seriesId: number | null;
  commentId: number | null;
}

/** 좋아요 토글 요청 */
export interface ToggleLikeRequest {
  photoId?: number; // ⚠️ string에서 number로 변경
  seriesId?: number;
  commentId?: number;
}

/** 좋아요 토글 응답 */
export interface ToggleLikeResponse {
  liked: boolean; // 백엔드는 isLiked가 아닌 liked 필드 사용
  message: string;
  // likesCount는 백엔드에서 제공하지 않음 - 프론트엔드에서 별도 계산 필요
}

// =============================================================================
// 📁 시리즈 관련 타입
// =============================================================================

/** 기본 시리즈 정보 */
export interface Series extends Timestamps {
  id: number; // ⚠️ string에서 number로 변경
  userId: number; // ⚠️ photographerId에서 변경
  title: string;
  description: string | null;
  deletedAt: string | null;
}

/** 시리즈 상세 정보 (사진들 포함) */
export interface SeriesDetail extends Series {
  // 관계 데이터
  author: PublicUser; // ⚠️ photographer에서 변경
  photos: PhotoDetail[]; // ⚠️ SeriesPhoto[]에서 변경
  
  // 계산된 필드들
  likesCount: number; // ⚠️ likes에서 변경
  commentsCount: number;
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isLikedByCurrentUser?: boolean; // ⚠️ isLiked에서 변경
  isOwner?: boolean;
}

/** 시리즈 생성 요청 */
export interface CreateSeriesRequest {
  title: string;
  description?: string;
  photoIds: number[]; // ⚠️ string[]에서 number[]로 변경
}

// =============================================================================
// 🔍 검색 관련 타입
// =============================================================================

/** 검색 필터 */
export interface SearchFilters {
  query?: string;
  category?: 'all' | 'photos' | 'series' | 'users';
  sortBy?: 'latest' | 'popular' | 'trending';
  timeRange?: 'all' | 'today' | 'week' | 'month' | 'year';
}

// =============================================================================
// 🔔 알림 관련 타입
// =============================================================================

/** 알림 데이터 */
export interface Notification extends Timestamps {
  id: number; // ⚠️ string에서 number로 변경
  userId: number;
  type: 'like' | 'comment' | 'follow' | 'mention';
  message: string;
  fromUserId: number; // ⚠️ from 객체에서 변경
  
  // 다형성 필드들
  relatedItemType?: 'photo' | 'series' | 'comment';
  relatedItemId?: number; // ⚠️ string에서 number로 변경
  
  isRead: boolean;
  deletedAt: string | null;
}

/** 알림 상세 정보 (관계 데이터 포함) */
export interface NotificationDetail extends Notification {
  from: PublicUser; // 알림을 발생시킨 사용자
  relatedItem?: {
    type: 'photo' | 'series' | 'comment';
    id: number;
    preview?: string; // 사진인 경우 썸네일 URL
    title?: string;   // 제목 (사진/시리즈)
  };
}

// =============================================================================
// 📤 업로드 관련 타입 (프론트엔드 전용)
// =============================================================================

/** 업로드 파일 상태 관리 */
export interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// =============================================================================
// 🔄 기존 호환성을 위한 타입 별칭 (단계적 마이그레이션)
// =============================================================================

/** @deprecated PhotoData 대신 PhotoDetail 사용 */
export type PhotoData = PhotoDetail;

/** @deprecated SeriesData 대신 SeriesDetail 사용 */
export type SeriesData = SeriesDetail;

// =============================================================================
// 🛡️ 타입 가드 함수들
// =============================================================================

/** User 타입 가드 */
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as User).id === 'number' &&
    typeof (value as User).email === 'string' &&
    typeof (value as User).username === 'string'
  );
}

/** PhotoDetail 타입 가드 */
export function isPhotoDetail(value: unknown): value is PhotoDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PhotoDetail).id === 'number' &&
    typeof (value as PhotoDetail).title === 'string' &&
    typeof (value as PhotoDetail).imageUrl === 'string' &&
    typeof (value as PhotoDetail).createdAt === 'string'
  );
}

/** CommentDetail 타입 가드 */
export function isCommentDetail(value: unknown): value is CommentDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CommentDetail).id === 'number' &&
    typeof (value as CommentDetail).content === 'string' &&
    isUser((value as CommentDetail).author)
  );
}

/** ApiError 타입 가드 */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ApiError).code === 'string' &&
    typeof (value as ApiError).message === 'string'
  );
}

// =============================================================================
// 🔧 유틸리티 함수들
// =============================================================================

/** 
 * 안전한 ID 변환 (legacy 호환용)
 * @deprecated safeParseID 사용 권장
 */
export function toID(value: unknown): ID | null {
  return safeParseID(value as string | number | null | undefined);
}

/** 객체가 비어있는지 확인 */
export function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

/** 두 객체의 얕은 비교 */
export function shallowEqual(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}

/** 날짜 문자열 유효성 검사 */
export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('T');
}

/** API 응답에서 데이터 추출 */
export function extractData<T>(response: ApiResponse<T>): T | null {
  if (response.success && response.data) {
    return response.data;
  }
  return null;
}

/** 페이지네이션 초기값 생성 */
export function createInitialPagination(): PaginationMeta {
  return {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };
}

// =============================================================================
// 🎨 상수 정의
// =============================================================================

/** 기본 페이지네이션 설정 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
} as const;

/** 지원되는 이미지 타입 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/** 최대 파일 크기 (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// =============================================================================
// 🔍 검색 관련 타입
// =============================================================================

/** 검색 쿼리 파라미터 */
export interface SearchParams {
    q: string; // 검색어
    type?: 'photos' | 'users' | 'series'; // 기본값: 전체
    sortBy?: 'relevance' | 'latest' | 'popular'; // 기본값: relevance
    page?: number;
    limit?: number;
}

/** 통합 검색 응답 */
export interface SearchResponse {
    photos: PaginatedResponse<PhotoDetail>;
    users: PaginatedResponse<PublicUser>;
    series: PaginatedResponse<SeriesDetail>;
}



// =============================================================================
// 🚫 에러 관련 타입
// =============================================================================

/** API 에러 코드 */
export const API_ERROR_CODES = {
  // 인증 관련
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // 권한 관련
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // 리소스 관련
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  
  // 유효성 검사
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // 네트워크
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 서버
  SERVER_ERROR: 'SERVER_ERROR',
} as const;