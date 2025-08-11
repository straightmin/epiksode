"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import PhotoCard from "./PhotoCard";
import { PhotoDetail } from "@/types";

interface PhotoGridProps {
    photos: PhotoDetail[];
    onLike?: (photoId: number) => void;
    onPhotoClick?: (photoId: number) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    loading?: boolean;
    columns?: number;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
    photos,
    onLike,
    onPhotoClick,
    onLoadMore,
    hasMore = false,
    loading = false,
    columns,
}) => {
    const { theme, isDark } = useThemeContext();
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);
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

    // 컬럼 높이 초기화
    const initializeColumnHeights = useCallback((cols: number) => {
        return new Array(cols).fill(0);
    }, []);

    // 초기 컬럼 설정 (마운트 시 한 번만 실행)
    useEffect(() => {
        const initialColumns = calculateColumns();
        setColumnCount(initialColumns);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 빈 배열로 마운트 시 한 번만 실행

    // 리사이즈 핸들러 (별도 effect로 분리)
    useEffect(() => {
        const handleResize = () => {
            const newColumnCount = calculateColumns();
            if (newColumnCount !== columnCount) {
                setColumnCount(newColumnCount);
            }
        };

        window.addEventListener("resize", handleResize);
        // handleResize(); // 제거 - 무한루프의 원인

        return () => window.removeEventListener("resize", handleResize);
    }, [calculateColumns, columnCount]);

    // 무한 스크롤 처리
    useEffect(() => {
        if (!hasMore || loading || !onLoadMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, onLoadMore]);

    // 사진들을 컬럼별로 분배
    const distributePhotos = useCallback(() => {
        const columns: PhotoDetail[][] = Array.from({ length: columnCount }, () => []);
        const heights = initializeColumnHeights(columnCount);

        photos.forEach((photo) => {
            // 가장 높이가 낮은 컬럼 찾기
            const shortestColumnIndex = heights.indexOf(Math.min(...heights));
            columns[shortestColumnIndex].push(photo);
            
            // 예상 높이 증가 (실제 이미지 높이는 로드 후 계산됨)
            heights[shortestColumnIndex] += 300; // 평균 카드 높이 추정값
        });

        return columns;
    }, [photos, columnCount, initializeColumnHeights]);

    const photoColumns = distributePhotos();

    // 스켈레톤 높이 패턴 (일관성 있는 로딩 경험 제공)
    const SKELETON_HEIGHTS = [250, 300, 280, 320, 270, 290, 310, 260, 340, 230];
    
    // 로딩 스켈레톤 생성
    const generateLoadingCards = (count: number) => {
        return Array.from({ length: count }, (_, index) => (
            <div
                key={`skeleton-${index}`}
                className="animate-pulse rounded-lg mb-4"
                style={{
                    backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                    height: SKELETON_HEIGHTS[index % SKELETON_HEIGHTS.length], // 일관된 패턴 유지
                }}
            />
        ));
    };

    return (
        <div className="w-full">
            {/* Photo Grid Container */}
            <div
                ref={containerRef}
                className="grid gap-4 p-4"
                style={{
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                }}
            >
                {photoColumns.map((columnPhotos, columnIndex) => (
                    <div key={columnIndex} className="flex flex-col">
                        {columnPhotos.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                onLike={onLike}
                                onClick={onPhotoClick}
                            />
                        ))}
                        
                        {/* 로딩 중일 때 각 컬럼에 스켈레톤 카드 추가 */}
                        {loading && generateLoadingCards(2)}
                    </div>
                ))}
            </div>

            {/* 무한 스크롤 트리거 */}
            {hasMore && <div ref={observerRef} className="h-4" />}

            {/* 로딩 인디케이터 */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div
                        className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
                        style={{
                            borderColor: theme.theme.colors.primary.purple,
                            borderTopColor: "transparent",
                        }}
                    />
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
                    className="flex flex-col items-center justify-center py-12 text-center"
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

export default PhotoGrid;