/**
 * epiksode API 타입 정의
 * 
 * 백엔드 스키마와 완전히 동기화된 정확한 타입 정의
 * 기준: docs/collaboration/api_response_types.ts
 * 
 * ⚠️ 주의: 이 타입들은 실제 백엔드 API 응답과 정확히 일치합니다.
 */

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
  details?: Record<string, any>;
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
  id: number; // ⚠️ 정수형 ID (기존 string에서 변경)
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
  id: number;
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
export interface PhotoListResponse extends PaginatedResponse<PhotoDetail> {}

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
export interface CommentListResponse extends PaginatedResponse<CommentDetail> {}

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