/**
 * API 응답 타입 정의
 * 
 * 목적: 프론트엔드 TypeScript 인터페이스 생성용
 * 작성일: 2025년 8월 10일
 * 기준: 실제 Prisma 스키마 및 백엔드 구현
 * 
 * ⚠️  주의: 이 타입들은 실제 백엔드 API 응답과 정확히 일치합니다.
 * 프론트엔드에서 그대로 복사하여 사용하거나 참조용으로 활용하세요.
 */

// =============================================================================
// 🔧 공통 타입 정의
// =============================================================================

/** 공통 응답 래퍼 */
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

/** 기본 사용자 정보 */
export interface User extends Timestamps {
  id: number; // ⚠️ 정수형 ID (문자열 아님)
  email: string;
  username: string;
  bio: string | null;
  profileImageUrl: string | null;
  
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
  followersCount: number;
  followingCount: number;
  seriesCount: number;
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isFollowedByCurrentUser?: boolean;
  isFollowingCurrentUser?: boolean;
}

/** 회원가입 요청 */
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
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

/** 기본 사진 정보 */
export interface Photo extends Timestamps {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  viewCount: number;
  isPublic: boolean;
  deletedAt: string | null;
}

/** 사진 상세 정보 (작성자 포함) */
export interface PhotoDetail extends Photo {
  // 관계 데이터
  author: PublicUser;
  
  // 계산된 필드들
  likesCount: number;
  commentsCount: number;
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isLikedByCurrentUser?: boolean;
  isOwner?: boolean; // 현재 사용자가 작성자인지
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

/** 기본 댓글 정보 */
export interface Comment extends Timestamps {
  id: number;
  userId: number;
  content: string;
  
  // 다형성 필드들 (둘 중 하나만 값을 가짐)
  photoId: number | null;
  seriesId: number | null;
  
  // 대댓글
  parentId: number | null;
  
  deletedAt: string | null;
}

/** 댓글 상세 정보 (작성자 포함) */
export interface CommentDetail extends Comment {
  // 관계 데이터
  author: PublicUser;
  
  // 계산된 필드들
  likesCount: number;
  repliesCount: number;
  
  // 대댓글 목록 (옵션)
  replies?: CommentDetail[];
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isLikedByCurrentUser?: boolean;
  isOwner?: boolean;
}

/** 댓글 작성 요청 */
export interface CreateCommentRequest {
  content: string;
  photoId?: number;
  seriesId?: number;
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
  photoId?: number;
  seriesId?: number;
  commentId?: number;
}

/** 좋아요 토글 응답 */
export interface ToggleLikeResponse {
  isLiked: boolean;
  likesCount: number;
  message: string;
}

// =============================================================================
// 👥 팔로우 관련 타입
// =============================================================================

/** 팔로우 관계 */
export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}

/** 팔로우 토글 응답 */
export interface ToggleFollowResponse {
  isFollowing: boolean;
  followersCount: number;
  message: string;
}

/** 팔로워/팔로잉 목록 응답 */
export interface FollowListResponse extends PaginatedResponse<PublicUser> {}

// =============================================================================
// 📁 시리즈 관련 타입
// =============================================================================

/** 기본 시리즈 정보 */
export interface Series extends Timestamps {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  coverPhotoId: number | null;
  isPublic: boolean;
  deletedAt: string | null;
}

/** 시리즈 상세 정보 */
export interface SeriesDetail extends Series {
  // 관계 데이터
  author: PublicUser;
  coverPhoto: Photo | null;
  photos: PhotoDetail[]; // 순서대로 정렬됨
  
  // 계산된 필드들
  photosCount: number;
  likesCount: number;
  commentsCount: number;
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isLikedByCurrentUser?: boolean;
  isOwner?: boolean;
}

/** 시리즈 생성 요청 */
export interface CreateSeriesRequest {
  title: string;
  description?: string;
  photoIds: number[];
  coverPhotoId?: number;
  isPublic?: boolean;
}

/** 시리즈 목록 조회 응답 */
export interface SeriesListResponse extends PaginatedResponse<SeriesDetail> {}

// =============================================================================
// 🔖 컬렉션 관련 타입
// =============================================================================

/** 기본 컬렉션 정보 */
export interface Collection extends Timestamps {
  id: number;
  userId: number;
  title: string;
  description: string | null;
}

/** 컬렉션 상세 정보 */
export interface CollectionDetail extends Collection {
  // 관계 데이터
  owner: PublicUser;
  photos: PhotoDetail[];
  
  // 계산된 필드들
  photosCount: number;
  
  // 현재 사용자와의 관계 (로그인 시에만)
  isOwner?: boolean;
}

/** 컬렉션 생성 요청 */
export interface CreateCollectionRequest {
  title: string;
  description?: string;
}

/** 컬렉션에 사진 추가/제거 요청 */
export interface UpdateCollectionPhotosRequest {
  photoIds: number[];
}

/** 컬렉션 목록 조회 응답 */
export interface CollectionListResponse extends PaginatedResponse<CollectionDetail> {}

// =============================================================================
// 🔔 알림 관련 타입
// =============================================================================

/** 알림 이벤트 타입 */
export type NotificationEventType = 'NEW_LIKE' | 'NEW_COMMENT' | 'NEW_FOLLOW';

/** 기본 알림 정보 */
export interface Notification {
  id: number;
  userId: number; // 수신자
  actorId: number; // 알림 발생시킨 사용자
  eventType: NotificationEventType;
  isRead: boolean;
  createdAt: string;
  
  // 다형성 필드들
  photoId: number | null;
  seriesId: number | null;
  commentId: number | null;
  likeId: number | null;
  followId: number | null;
}

/** 알림 상세 정보 */
export interface NotificationDetail extends Notification {
  // 관계 데이터
  actor: PublicUser;
  photo?: Photo | null;
  series?: Series | null;
  comment?: Comment | null;
  
  // 메시지 (서버에서 생성)
  message: string;
  
  // 링크 URL (서버에서 생성)
  linkUrl?: string;
}

/** 알림 목록 조회 응답 */
export interface NotificationListResponse extends PaginatedResponse<NotificationDetail> {}

/** 알림 읽음 처리 요청 */
export interface MarkNotificationsReadRequest {
  notificationIds?: number[]; // 생략시 모든 알림 읽음 처리
}

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
  totalResults: number;
}

// =============================================================================
// 📊 통계 관련 타입
// =============================================================================

/** 사용자 대시보드 통계 */
export interface UserStats {
  photosCount: number;
  seriesCount: number;
  followersCount: number;
  followingCount: number;
  totalLikes: number; // 받은 좋아요 총합
  totalViews: number; // 사진 총 조회수
}

/** 사진 상세 통계 */
export interface PhotoStats {
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewHistory: Array<{
    date: string;
    views: number;
  }>;
}

// =============================================================================
// 🔧 쿼리 파라미터 타입들
// =============================================================================

/** 사진 목록 조회 파라미터 */
export interface PhotoQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'popular' | 'views';
  userId?: number; // 특정 사용자의 사진만
  tag?: string;
  isPublic?: boolean;
}

/** 댓글 목록 조회 파라미터 */
export interface CommentQueryParams {
  page?: number;
  limit?: number;
  photoId?: number;
  seriesId?: number;
  parentId?: number | 'null'; // 'null'이면 최상위 댓글만
}

/** 알림 목록 조회 파라미터 */
export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  eventType?: NotificationEventType;
}

// =============================================================================
// 🎯 사용 예시 (프론트엔드 참고용)
// =============================================================================

/**
 * 사용 예시:
 * 
 * // 1. API 클라이언트 타입 지정
 * const fetchPhotos = async (params?: PhotoQueryParams): Promise<PhotoListResponse> => {
 *   const response = await fetch('/api/photos?' + new URLSearchParams(params));
 *   return response.json();
 * };
 * 
 * // 2. 컴포넌트에서 타입 활용
 * const [photos, setPhotos] = useState<PhotoDetail[]>([]);
 * const [user, setUser] = useState<User | null>(null);
 * 
 * // 3. 폼 데이터 타입 지정
 * const handleSubmit = async (data: CreatePhotoRequest) => {
 *   const formData = new FormData();
 *   formData.append('title', data.title);
 *   formData.append('image', data.image);
 *   if (data.description) formData.append('description', data.description);
 *   // ...
 * };
 */

// =============================================================================
// 📝 중요 참고사항
// =============================================================================

/**
 * ⚠️  주의사항:
 * 
 * 1. ID는 모두 정수형 (number) 입니다
 * 2. 날짜는 ISO 8601 문자열 형식입니다
 * 3. 파일 업로드는 FormData를 사용합니다
 * 4. 다형성 관계에서는 관련 필드들 중 하나만 값을 가집니다
 * 5. 계산된 필드들(likesCount 등)은 실시간으로 계산됩니다
 * 6. 현재 사용자 관련 필드들은 인증된 요청에서만 포함됩니다
 * 7. 소프트 삭제된 항목들은 일반적으로 응답에 포함되지 않습니다
 * 
 * 🔄 업데이트:
 * 이 타입 정의는 백엔드 스키마 변경 시 함께 업데이트됩니다.
 */