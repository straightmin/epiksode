"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import PhotoCard from "./PhotoCard";
import { PhotoData } from "@/types";

interface VirtualizedPhotoGridProps {
    photos: PhotoData[];
    onLike?: (photoId: string) => void;
    onPhotoClick?: (photoId: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    loading?: boolean;
    columns?: number;
    itemHeight?: number;
    overscan?: number;
}

const VirtualizedPhotoGrid: React.FC<VirtualizedPhotoGridProps> = ({
    photos,
    onLike,
    onPhotoClick,
    onLoadMore,
    hasMore = false,
    loading = false,
    columns,
    itemHeight = 300,
    overscan = 5,
}) => {
    const { theme, isDark } = useThemeContext();
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [columnCount, setColumnCount] = useState(columns || 3);

    // 반응형 컬럼 수 계산
    const calculateColumns = useCallback(() => {
        if (columns) return columns;
        if (!containerRef.current) return 3;
        
        const width = containerRef.current.offsetWidth;
        if (width < 640) return 1; // mobile
        if (width < 768) return 2; // tablet
        if (width < 1024) return 3; // desktop small
        if (width < 1280) return 4; // desktop medium
        return 5; // desktop large
    }, [columns]);

    // 리사이즈 핸들러
    useEffect(() => {
        const handleResize = () => {
            const newColumnCount = calculateColumns();
            if (newColumnCount !== columnCount) {
                setColumnCount(newColumnCount);
            }

            if (containerRef.current) {
                setContainerHeight(containerRef.current.clientHeight);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, [calculateColumns, columnCount]);

    // 스크롤 핸들러
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    // 무한 스크롤
    useEffect(() => {
        if (!hasMore || loading || !onLoadMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, onLoadMore]);

    // 사진들을 컬럼별로 분배 (균등 분배 알고리즘)
    const photoColumns = useMemo(() => {
        const columns: PhotoData[][] = Array.from({ length: columnCount }, () => []);
        const columnHeights = new Array(columnCount).fill(0);

        photos.forEach((photo) => {
            // 가장 높이가 낮은 컬럼 찾기
            const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
            columns[shortestColumnIndex].push(photo);
            
            // 예상 높이 증가 (실제로는 이미지 비율에 따라 다름)
            columnHeights[shortestColumnIndex] += itemHeight + 16; // gap 포함
        });

        return columns;
    }, [photos, columnCount, itemHeight]);

    // 가상화 계산
    const virtualizedData = useMemo(() => {
        const startIndex = Math.max(0, Math.floor(scrollTop / (itemHeight + 16)) - overscan);
        const endIndex = Math.min(
            Math.max(...photoColumns.map(col => col.length)),
            Math.ceil((scrollTop + containerHeight) / (itemHeight + 16)) + overscan
        );

        return {
            startIndex,
            endIndex,
            totalHeight: Math.max(...photoColumns.map(col => col.length)) * (itemHeight + 16),
        };
    }, [scrollTop, containerHeight, itemHeight, overscan, photoColumns]);

    // Performance optimization: 메모이제이션된 렌더링
    const renderPhotoColumn = useCallback((columnPhotos: PhotoData[], columnIndex: number) => {
        const { startIndex, endIndex } = virtualizedData;
        
        return (
            <div key={columnIndex} className="flex flex-col gap-4">
                {/* 상단 여백 */}
                {startIndex > 0 && (
                    <div style={{ height: startIndex * (itemHeight + 16) }} />
                )}
                
                {columnPhotos.slice(startIndex, endIndex + 1).map((photo) => (
                    <div
                        key={photo.id}
                        style={{ minHeight: itemHeight }}
                        className="transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <PhotoCard
                            photo={photo}
                            onLike={onLike}
                            onClick={onPhotoClick}
                        />
                    </div>
                ))}
                
                {/* 하단 여백 */}
                {endIndex < columnPhotos.length - 1 && (
                    <div style={{ 
                        height: (columnPhotos.length - endIndex - 1) * (itemHeight + 16) 
                    }} />
                )}
            </div>
        );
    }, [virtualizedData, itemHeight, onLike, onPhotoClick]);

    // 스켈레톤 높이 패턴 (일관성 있는 로딩 경험 제공)
    const SKELETON_HEIGHTS = useMemo(() => [
        itemHeight - 30, 
        itemHeight, 
        itemHeight - 50, 
        itemHeight + 20, 
        itemHeight - 40
    ], [itemHeight]);
    
    // 스켈레톤 로딩 카드 생성 (성능 최적화)
    const skeletonCards = useMemo(() => {
        if (!loading) return null;
        
        return Array.from({ length: columnCount }, (_, columnIndex) => (
            <div key={`skeleton-col-${columnIndex}`} className="flex flex-col gap-4">
                {Array.from({ length: 2 }, (_, cardIndex) => (
                    <div
                        key={`skeleton-${columnIndex}-${cardIndex}`}
                        className="animate-pulse rounded-lg"
                        style={{
                            backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                            height: SKELETON_HEIGHTS[(columnIndex + cardIndex) % SKELETON_HEIGHTS.length],
                        }}
                    />
                ))}
            </div>
        ));
    }, [loading, columnCount, theme.theme.colors.primary.purpleVeryLight, SKELETON_HEIGHTS]);

    return (
        <div className="w-full h-full">
            {/* Photo Grid Container */}
            <div
                ref={containerRef}
                className="h-full overflow-y-auto"
                onScroll={handleScroll}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.theme.colors.primary.purple} transparent`,
                }}
            >
                <div
                    className="grid gap-4 p-4"
                    style={{
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        minHeight: virtualizedData.totalHeight,
                    }}
                >
                    {photoColumns.map((columnPhotos, columnIndex) => 
                        renderPhotoColumn(columnPhotos, columnIndex)
                    )}
                </div>

                {/* 스켈레톤 로딩 */}
                {loading && (
                    <div
                        className="grid gap-4 px-4 pb-4"
                        style={{
                            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        }}
                    >
                        {skeletonCards}
                    </div>
                )}

                {/* 무한 스크롤 트리거 */}
                {hasMore && <div ref={observerRef} className="h-4" />}
            </div>

            {/* 로딩 인디케이터 */}
            {loading && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
                        style={{
                            backgroundColor: isDark
                                ? theme.theme.colors.background.dark
                                : theme.theme.colors.background.main,
                            border: `1px solid ${
                                isDark
                                    ? theme.theme.colors.primary.darkGray
                                    : theme.theme.colors.primary.purpleVeryLight
                            }`,
                        }}
                    >
                        <div
                            className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full"
                            style={{
                                borderColor: theme.theme.colors.primary.purple,
                                borderTopColor: "transparent",
                            }}
                        />
                        <span
                            className="text-sm font-medium"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        >
                            로딩 중...
                        </span>
                    </div>
                </div>
            )}

            {/* 더 이상 로드할 사진이 없을 때 */}
            {!hasMore && photos.length > 0 && !loading && (
                <div className="text-center py-8">
                    <p
                        className="text-sm"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.gray
                                : theme.theme.colors.primary.darkGray,
                        }}
                    >
                        모든 사진을 확인했습니다
                    </p>
                </div>
            )}

            {/* 사진이 없을 때 */}
            {photos.length === 0 && !loading && (
                <div
                    className="flex flex-col items-center justify-center py-12 text-center h-full"
                    style={{
                        color: isDark
                            ? theme.theme.colors.primary.gray
                            : theme.theme.colors.primary.darkGray,
                    }}
                >
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{
                            backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                        }}
                    >
                        <span
                            className="text-2xl"
                            style={{ color: theme.theme.colors.primary.purple }}
                        >
                            📸
                        </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">아직 사진이 없습니다</h3>
                    <p className="text-sm">
                        첫 번째 에픽소드를 공유해보세요!
                    </p>
                </div>
            )}
        </div>
    );
};

export default VirtualizedPhotoGrid;