/**
 * PhotoImage 컴포넌트
 * 
 * S3 이미지 프록시 시스템을 사용하는 재사용 가능한 이미지 컴포넌트
 * 에러 처리, lazy loading, 반응형 이미지 지원
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { getImageUrl, getResponsiveSrcSet, getDefaultSizes, getPlaceholderImageUrl, getErrorImageUrl, debugImageUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

// =============================================================================
// 🎨 타입 정의
// =============================================================================

interface PhotoImageProps {
    /** 사진 ID (필수) */
    photoId?: number;
    
    /** 직접 이미지 URL (우선순위) */
    src?: string;
    
    /** 썸네일 여부 (기본: false) */
    thumbnail?: boolean;
    
    /** 대체 텍스트 */
    alt: string;
    
    /** CSS 클래스명 */
    className?: string;
    
    /** 이미지 너비 (Next.js Image용) */
    width?: number;
    
    /** 이미지 높이 (Next.js Image용) */
    height?: number;
    
    /** fill 모드 사용 여부 (부모 컨테이너 크기에 맞춤) */
    fill?: boolean;
    
    /** object-fit 스타일 */
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    
    /** 반응형 이미지 사용 여부 */
    responsive?: boolean;
    
    /** 커스텀 sizes 속성 */
    sizes?: string;
    
    /** Lazy loading 사용 여부 (기본: true) */
    lazy?: boolean;
    
    /** 우선순위 이미지 (LCP 최적화용) */
    priority?: boolean;
    
    /** 로딩 완료 시 콜백 */
    onLoad?: () => void;
    
    /** 에러 발생 시 콜백 */
    onError?: (error: Error) => void;
    
    /** 클릭 이벤트 핸들러 */
    onClick?: () => void;
    
    /** 플레이스홀더 표시 여부 */
    showPlaceholder?: boolean;
    
    /** 커스텀 플레이스홀더 URL */
    placeholderUrl?: string;
    
    /** 점진적 로딩 (썸네일 → 원본) */
    progressiveLoading?: boolean;
}

// =============================================================================
// 📸 PhotoImage 컴포넌트
// =============================================================================

const PhotoImage: React.FC<PhotoImageProps> = ({
    photoId,
    src,
    thumbnail = false,
    alt,
    className,
    width,
    height,
    fill = false,
    objectFit = 'cover',
    responsive = false,
    sizes,
    lazy = true,
    priority = false,
    onLoad,
    onError,
    onClick,
    showPlaceholder = true,
    placeholderUrl,
    progressiveLoading = false
}) => {
    // =============================================================================
    // 🔧 상태 관리
    // =============================================================================
    
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [progressiveState, setProgressiveState] = useState<'thumbnail' | 'original' | 'complete'>('thumbnail');
    const imgRef = useRef<HTMLImageElement>(null);

    // =============================================================================
    // 🖼️ URL 생성
    // =============================================================================
    
    // 🔧 메모화된 URL 생성 (무한루프 방지)
    const imageUrl = useMemo(() => {
        return src || (photoId ? getImageUrl(photoId, thumbnail) : '');
    }, [src, photoId, thumbnail]);
    
    const thumbnailUrl = useMemo(() => {
        return progressiveLoading && photoId ? getImageUrl(photoId, true) : undefined;
    }, [progressiveLoading, photoId]);
    
    // 반응형 이미지 설정 (필요시에만 계산)
    const responsiveConfig = useMemo(() => {
        if (!responsive) return null;
        
        const thumbnailUrl = src;
        const originalUrl = photoId ? getImageUrl(photoId, false) : src;
        const srcSet = getResponsiveSrcSet(thumbnailUrl, originalUrl);
        const imageSizes = sizes || getDefaultSizes();
        
        return { srcSet, imageSizes };
    }, [responsive, src, photoId, sizes]);
    
    // 플레이스홀더 URL (메모화)
    const placeholderSrc = useMemo(() => {
        return placeholderUrl || getPlaceholderImageUrl();
    }, [placeholderUrl]);
    
    const errorSrc = useMemo(() => {
        return getErrorImageUrl();
    }, []);

    // =============================================================================
    // 🎯 이벤트 핸들러
    // =============================================================================
    
    const handleLoad = useCallback(() => {
        setIsLoaded(true);
        setHasError(false);
        
        if (progressiveLoading && progressiveState === 'thumbnail') {
            setProgressiveState('original');
        } else if (progressiveLoading && progressiveState === 'original') {
            setProgressiveState('complete');
        }
        
        debugImageUrl('이미지 로드 성공', { photoId, thumbnail, url: imageUrl });
        onLoad?.();
    }, [onLoad, progressiveLoading, progressiveState, photoId, thumbnail, imageUrl]);

    const handleError = useCallback(() => {
        setHasError(true);
        setIsLoaded(false);
        
        const error = new Error(`이미지 로드 실패: photoId=${photoId}, thumbnail=${thumbnail}`);
        debugImageUrl('이미지 로드 실패', { photoId, thumbnail, url: imageUrl, error });
        onError?.(error);
    }, [onError, photoId, thumbnail, imageUrl]);

    const handleClick = useCallback(() => {
        if (onClick && !hasError) {
            onClick();
        }
    }, [onClick, hasError]);

    // =============================================================================
    // 🔄 점진적 로딩 효과
    // =============================================================================
    
    // URL 변경 시 상태 리셋
    useEffect(() => {
        setIsLoaded(false);
        setHasError(false);
        setProgressiveState('thumbnail');
    }, [imageUrl]);
    
    useEffect(() => {
        if (!progressiveLoading || !thumbnailUrl || progressiveState !== 'thumbnail') return;
        
        // 썸네일 먼저 로드
        const img = new window.Image();
        img.onload = () => {
            // 상태 업데이트 시 현재 상태 확인하여 불필요한 업데이트 방지
            setProgressiveState(prev => prev === 'thumbnail' ? 'original' : prev);
        };
        img.onerror = () => setHasError(true);
        img.src = thumbnailUrl;
    }, [progressiveLoading, thumbnailUrl, progressiveState]);

    // =============================================================================
    // 🎨 스타일 계산
    // =============================================================================
    
    const imageClasses = cn(
        'transition-opacity duration-300',
        {
            'opacity-0': !isLoaded && !showPlaceholder,
            'opacity-100': isLoaded || showPlaceholder,
            'cursor-pointer': !!onClick && !hasError,
            'cursor-not-allowed': hasError,
        },
        className
    );

    const containerClasses = cn(
        'relative overflow-hidden',
        {
            'bg-gray-100': showPlaceholder,
            // fill 속성 사용 시 aspect ratio 및 최소 높이 보장  
            'aspect-square min-h-[200px]': fill && !width && !height,
        }
    );

    // =============================================================================
    // 🖼️ 렌더링 로직
    // =============================================================================
    
    // 에러 상태
    if (hasError && showPlaceholder) {
        return (
            <div className={containerClasses} onClick={handleClick}>
                <Image
                    src={errorSrc}
                    alt="이미지를 불러올 수 없습니다"
                    width={width}
                    height={height}
                    fill={fill}
                    className={cn(imageClasses, 'object-contain opacity-50')}
                />
            </div>
        );
    }

    // 유효하지 않은 URL
    if (!imageUrl) {
        if (showPlaceholder) {
            return (
                <div className={containerClasses} onClick={handleClick}>
                    <Image
                        src={placeholderSrc}
                        alt="이미지 없음"
                        width={width}
                        height={height}
                        fill={fill}
                        className={cn(imageClasses, 'object-contain')}
                    />
                </div>
            );
        }
        return null;
    }

    // =============================================================================
    // 🚀 점진적 로딩 렌더링
    // =============================================================================
    
    if (progressiveLoading) {
        return (
            <div className={containerClasses} onClick={handleClick}>
                {/* 썸네일 (빠른 로딩) */}
                {progressiveState === 'thumbnail' && (
                    <Image
                        src={thumbnailUrl!}
                        alt={alt}
                        width={width}
                        height={height}
                        fill={fill}
                        className={cn(imageClasses, 'blur-sm')}
                        style={{ objectFit }}
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                )}
                
                {/* 원본 이미지 (고화질) */}
                {(progressiveState === 'original' || progressiveState === 'complete') && (
                    <Image
                        src={imageUrl}
                        alt={alt}
                        width={width}
                        height={height}
                        fill={fill}
                        sizes={fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
                        className={cn(imageClasses, {
                            'blur-sm': progressiveState === 'original',
                            'blur-0': progressiveState === 'complete',
                        })}
                        style={{ objectFit }}
                        loading={lazy && !priority ? 'lazy' : 'eager'}
                        priority={priority}
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                )}
            </div>
        );
    }

    // =============================================================================
    // 🎯 기본 렌더링
    // =============================================================================
    
    return (
        <div className={containerClasses} onClick={handleClick}>
            <Image
                ref={imgRef}
                src={imageUrl}
                alt={alt}
                width={width}
                height={height}
                fill={fill}
                sizes={responsiveConfig?.imageSizes || (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
                className={imageClasses}
                style={{ objectFit }}
                loading={lazy && !priority ? 'lazy' : 'eager'}
                priority={priority}
                onLoad={handleLoad}
                onError={handleError}
                placeholder="blur"
                blurDataURL={placeholderSrc}
                {...(responsiveConfig?.srcSet && { srcSet: responsiveConfig.srcSet })}
            />
        </div>
    );
};

export default PhotoImage;

// =============================================================================
// 📤 편의 컴포넌트 내보내기
// =============================================================================

/**
 * 썸네일 전용 PhotoImage 컴포넌트
 * src prop이 있으면 직접 URL 사용, 없으면 프록시 사용
 */
export const PhotoThumbnail: React.FC<Omit<PhotoImageProps, 'thumbnail'>> = (props) => {
    // src prop이 있으면 직접 URL 사용, 없으면 프록시 사용
    const shouldUseProxy = !props.src && !!props.photoId;
    return (
        <PhotoImage {...props} thumbnail={shouldUseProxy} />
    );
};

/**
 * 반응형 PhotoImage 컴포넌트
 */
export const ResponsivePhotoImage: React.FC<Omit<PhotoImageProps, 'responsive'>> = (props) => (
    <PhotoImage {...props} responsive={true} />
);

/**
 * 점진적 로딩 PhotoImage 컴포넌트
 */
export const ProgressivePhotoImage: React.FC<Omit<PhotoImageProps, 'progressiveLoading'>> = (props) => (
    <PhotoImage {...props} progressiveLoading={true} />
);