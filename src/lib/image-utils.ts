/**
 * 이미지 URL 유틸리티 함수들
 *
 * S3 이미지 프록시 시스템을 위한 URL 생성 및 관리 함수
 * 기존 S3 직접 URL에서 백엔드 프록시 URL로 마이그레이션 지원
 */

import { PhotoDetail, Photo } from "@/types";

// =============================================================================
// 🔧 환경 설정
// =============================================================================

/** API 기본 URL */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** 이미지 프록시 기본 URL */
const IMAGE_BASE_URL =
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL || `${API_BASE_URL}/api/images`;

/** 디버깅 모드 */
const DEBUG_MODE = false; // process.env.NEXT_PUBLIC_DEBUG === "true";

// =============================================================================
// 🖼️ 이미지 URL 생성 함수
// =============================================================================

/**
 * 사진 ID로 프록시 이미지 URL 생성
 * @param photoId 사진 ID
 * @param thumbnail 썸네일 여부 (기본: false)
 * @returns 프록시 이미지 URL
 */
export function getImageUrl(photoId: number, thumbnail = false): string {
    if (!photoId || photoId <= 0) {
        if (DEBUG_MODE) {
            console.warn(`getImageUrl: 유효하지 않은 photoId: ${photoId}`);
        }
        return getPlaceholderImageUrl();
    }

    try {
        // URL 객체를 사용하여 안전하게 URL 생성 (double-slash 방지)
        const baseUrl = new URL(IMAGE_BASE_URL);
        const pathSegments = thumbnail 
            ? ['thumbnails', photoId.toString()]
            : [photoId.toString()];
        
        baseUrl.pathname = baseUrl.pathname.replace(/\/$/, '') + '/' + pathSegments.join('/');
        const url = baseUrl.toString();

        if (DEBUG_MODE) {
            console.log(
                `getImageUrl: photoId=${photoId}, thumbnail=${thumbnail} → ${url}`
            );
        }

        return url;
    } catch (error) {
        // URL 생성 실패 시 기존 방식으로 폴백
        console.warn('URL 생성 실패, 기존 방식 사용:', error);
        const endpoint = thumbnail ? "thumbnails" : "";
        return `${IMAGE_BASE_URL}/${endpoint ? endpoint + "/" : ""}${photoId}`;
    }
}

/**
 * 사진 객체로부터 이미지 URL 생성 (호환성 함수)
 * @param photo 사진 객체 (PhotoDetail 또는 Photo)
 * @param thumbnail 썸네일 여부
 * @returns 이미지 URL
 */
export function getPhotoImageUrl(
    photo: PhotoDetail | Photo,
    thumbnail = false
): string {
    // 새로운 방식: photoId 기반
    if (photo.id) {
        return getImageUrl(photo.id, thumbnail);
    }

    // 기존 방식 (점진적 마이그레이션 지원): 직접 URL
    const directUrl = thumbnail ? photo.thumbnailUrl : photo.imageUrl;
    if (directUrl) {
        if (DEBUG_MODE) {
            console.log(`getPhotoImageUrl: 기존 URL 사용 → ${directUrl}`);
        }
        return directUrl;
    }

    // 폴백: 플레이스홀더
    return getPlaceholderImageUrl();
}

/**
 * 반응형 srcSet 생성 (직접 URL 기반)
 * @param thumbnailUrl 썸네일 URL
 * @param originalUrl 원본 이미지 URL
 * @returns srcSet 문자열
 */
export function getResponsiveSrcSet(
    thumbnailUrl?: string,
    originalUrl?: string
): string {
    if (!thumbnailUrl && !originalUrl) {
        return "";
    }

    const srcSetParts: string[] = [];

    if (thumbnailUrl) {
        srcSetParts.push(`${thumbnailUrl} 300w`);
    }

    if (originalUrl && originalUrl !== thumbnailUrl) {
        srcSetParts.push(`${originalUrl} 1920w`);
    }

    return srcSetParts.join(", ");
}

/**
 * 기본 sizes 속성값 생성
 * @param breakpoints 커스텀 브레이크포인트 (옵션)
 * @returns sizes 문자열
 */
export function getDefaultSizes(breakpoints?: string): string {
    return (
        breakpoints ||
        "(max-width: 640px) 300px, (max-width: 1024px) 600px, 1920px"
    );
}

// =============================================================================
// 🔄 마이그레이션 헬퍼 함수
// =============================================================================

/**
 * S3 URL인지 확인
 * @param url 확인할 URL
 * @returns S3 URL 여부
 */
export function isS3Url(url: string): boolean {
    if (!url) return false;
    
    const s3Domains = process.env.NEXT_PUBLIC_S3_DOMAINS?.split(',') || ['.s3.', 'amazonaws.com'];
    return s3Domains.some(domain => url.includes(domain));
}

/**
 * 프록시 URL인지 확인
 * @param url 확인할 URL
 * @returns 프록시 URL 여부
 */
export function isProxyUrl(url: string): boolean {
    return url?.includes("/api/images/") || false;
}

/**
 * 기존 URL을 프록시 URL로 변환 (마이그레이션용)
 * @param photo 사진 객체
 * @param thumbnail 썸네일 여부
 * @returns 변환된 URL
 */
export function migrateToProxyUrl(
    photo: PhotoDetail | Photo,
    thumbnail = false
): string {
    const currentUrl = thumbnail ? photo.thumbnailUrl : photo.imageUrl;

    // 이미 프록시 URL인 경우
    if (isProxyUrl(currentUrl)) {
        return currentUrl;
    }

    // S3 URL인 경우 프록시로 변환
    if (isS3Url(currentUrl) && photo.id) {
        if (DEBUG_MODE) {
            console.log(`migrateToProxyUrl: S3 URL → 프록시 URL 변환`);
        }
        return getImageUrl(photo.id, thumbnail);
    }

    // 기존 URL 유지
    return currentUrl || getPlaceholderImageUrl();
}

// =============================================================================
// 🎨 플레이스홀더 및 폴백
// =============================================================================

/**
 * 플레이스홀더 이미지 URL 반환
 * @param width 이미지 너비 (기본: 300)
 * @param height 이미지 높이 (기본: 200)
 * @returns 플레이스홀더 URL
 */
export function getPlaceholderImageUrl(): string {
    // 로컬 플레이스홀더 이미지 사용
    const localPlaceholder = "/images/placeholder.svg";

    return localPlaceholder; // public/images/placeholder.svg 파일 사용
}

/**
 * 에러 시 대체 이미지 URL
 * @returns 에러 대체 이미지 URL
 */
export function getErrorImageUrl(): string {
    return "/images/error-image.svg"; // public/images/error-image.svg 파일 사용
}

// =============================================================================
// 🔍 이미지 URL 검증 및 디버깅
// =============================================================================

/**
 * 이미지 URL 유효성 검사
 * @param url 검증할 URL
 * @returns 유효성 결과
 */
export function validateImageUrl(url: string): boolean {
    if (!url || typeof url !== "string") {
        return false;
    }

    try {
        new URL(url);
        return true;
    } catch {
        // 상대 경로 URL인 경우
        return (
            url.startsWith("/") || url.startsWith("./") || url.startsWith("../")
        );
    }
}

/**
 * 이미지 로드 테스트
 * @param url 테스트할 URL
 * @returns Promise<boolean> 로드 성공 여부
 */
export function testImageLoad(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);

        img.src = url;

        // 10초 타임아웃
        setTimeout(() => resolve(false), 10000);
    });
}

/**
 * 디버깅 정보 출력
 * @param context 컨텍스트 정보
 * @param data 디버깅 데이터
 */
export function debugImageUrl(context: string, data: unknown): void {
    if (DEBUG_MODE) {
        console.group(`[ImageUtils] ${context}`);
        console.log(data);
        console.groupEnd();
    }
}

// =============================================================================
// 🚀 성능 최적화 함수
// =============================================================================

/**
 * 이미지 preload (미리 로딩)
 * @param urls 미리 로드할 URL 배열
 */
export function preloadImages(urls: string[]): void {
    urls.forEach((url) => {
        if (validateImageUrl(url)) {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = url;
            document.head.appendChild(link);
        }
    });
}

/**
 * Intersection Observer를 사용한 lazy loading 설정
 * @param callback 이미지가 보일 때 실행될 콜백
 * @returns IntersectionObserver 인스턴스
 */
export function createImageObserver(
    callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver {
    return new IntersectionObserver(
        (entries) => {
            entries.forEach(callback);
        },
        {
            rootMargin: "50px",
            threshold: 0.1,
        }
    );
}
