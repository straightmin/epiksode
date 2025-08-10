/**
 * epiksode 애플리케이션 중앙 타입 정의
 * 모든 공유 인터페이스와 타입을 이 파일에서 관리합니다.
 */

/**
 * 사진 데이터 인터페이스
 */
export interface PhotoData {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    photographer: {
        id: string;
        name: string;
        username: string;
        avatar: string;
        isFollowing: boolean;
    };
    likes: number;
    comments: number;
    views: number;
    isLiked: boolean;
    isBookmarked: boolean;
    isEpicMoment?: boolean;
    camera?: string | {
        make?: string;
        model?: string;
        lens?: string;
        settings?: {
            aperture?: string;
            shutterSpeed?: string;
            iso?: string;
            focalLength?: string;
        };
    };
    location?: string;
    tags?: string[];
    createdAt: string;
}

/**
 * 댓글 데이터 인터페이스
 */
export interface Comment {
    id: string;
    user: {
        name: string;
        username: string;
        avatar: string;
    };
    content: string;
    createdAt: string;
    likes: number;
    isLiked: boolean;
    isReply?: boolean;
    parentId?: string;
    replies?: Comment[];
}

/**
 * 시리즈 사진 인터페이스
 */
export interface SeriesPhoto {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    order: number;
}

/**
 * 시리즈 데이터 인터페이스
 */
export interface SeriesData {
    id: string;
    title: string;
    description: string;
    photos: SeriesPhoto[];
    photographer: {
        id: string;
        name: string;
        username: string;
        avatar: string;
    };
    likes: number;
    views: number;
    isLiked: boolean;
    isBookmarked: boolean;
    createdAt: string;
}

/**
 * 업로드 파일 인터페이스
 */
export interface UploadFile {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

/**
 * 사용자 프로필 인터페이스
 */
export interface UserProfile {
    id: string;
    name: string;
    username: string;
    avatar: string;
    bio?: string;
    location?: string;
    website?: string;
    followers: number;
    following: number;
    isFollowing?: boolean;
    photos?: PhotoData[];
    series?: SeriesData[];
}

/**
 * 검색 필터 인터페이스
 */
export interface SearchFilters {
    query?: string;
    tags?: string[];
    category?: 'all' | 'photos' | 'series' | 'users';
    sortBy?: 'latest' | 'popular' | 'trending';
    timeRange?: 'all' | 'today' | 'week' | 'month' | 'year';
}

/**
 * 알림 데이터 인터페이스
 */
export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    message: string;
    from: {
        id: string;
        name: string;
        username: string;
        avatar: string;
    };
    relatedItem?: {
        type: 'photo' | 'series' | 'comment';
        id: string;
        preview?: string;
    };
    isRead: boolean;
    createdAt: string;
}