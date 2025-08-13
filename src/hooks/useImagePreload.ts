/**
 * useImagePreload 훅
 *
 * 이미지 프리로딩과 성능 최적화를 위한 React 훅
 * S3 프록시 이미지의 효율적 로딩 관리
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getImageUrl, testImageLoad } from "@/lib/image-utils";

// =============================================================================
// 🎯 타입 정의
// =============================================================================

interface PreloadOptions {
    /** 프리로드할 이미지 개수 제한 */
    maxPreload?: number;
    /** 프리로드 우선순위 (높을수록 먼저 로드) */
    priority?: number;
    /** 썸네일 프리로드 여부 */
    includeThumbnails?: boolean;
    /** 지연 시간 (ms) */
    delay?: number;
}

interface ImagePreloadState {
    loading: boolean;
    loaded: Set<number>;
    failed: Set<number>;
    preloading: Set<number>;
}

interface ImageLoadResult {
    photoId: number;
    success: boolean;
    thumbnail: boolean;
    loadTime: number;
}

// =============================================================================
// 🖼️ useImagePreload 훅
// =============================================================================

export function useImagePreload(
    photoIds: number[],
    options: PreloadOptions = {}
) {
    const {
        maxPreload = 10,
        priority = 1,
        includeThumbnails = true,
        delay = 100,
    } = options;

    const [state, setState] = useState<ImagePreloadState>({
        loading: false,
        loaded: new Set(),
        failed: new Set(),
        preloading: new Set(),
    });

    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 이미지 프리로드 실행
    const preloadImage = useCallback(
        async (
            photoId: number,
            thumbnail = false,
            signal?: AbortSignal
        ): Promise<ImageLoadResult> => {
            const startTime = Date.now();

            try {
                // 이미지 URL 생성
                const imageUrl = getImageUrl(photoId, thumbnail);

                // 이미지 로드 테스트
                const success = await testImageLoad(imageUrl);

                if (signal?.aborted) {
                    throw new Error("Preload aborted");
                }

                const loadTime = Date.now() - startTime;

                return {
                    photoId,
                    success,
                    thumbnail,
                    loadTime,
                };
            } catch {
                return {
                    photoId,
                    success: false,
                    thumbnail,
                    loadTime: Date.now() - startTime,
                };
            }
        },
        []
    );

    // 배치 프리로드 처리
    const processBatch = useCallback(
        async (batchIds: number[], signal?: AbortSignal) => {
            const tasks: Promise<ImageLoadResult>[] = [];

            for (const photoId of batchIds) {
                if (signal?.aborted) break;

                // 썸네일 프리로드
                if (includeThumbnails) {
                    tasks.push(preloadImage(photoId, true, signal));
                }

                // 원본 이미지 프리로드
                tasks.push(preloadImage(photoId, false, signal));

                // 지연 시간 적용
                if (delay > 0) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }

            try {
                const results = await Promise.allSettled(tasks);

                setState((prev) => {
                    const newLoaded = new Set(prev.loaded);
                    const newFailed = new Set(prev.failed);
                    const newPreloading = new Set(prev.preloading);

                    results.forEach((result) => {
                        if (result.status === "fulfilled") {
                            const { photoId, success } = result.value;

                            newPreloading.delete(photoId);

                            if (success) {
                                newLoaded.add(photoId);
                                newFailed.delete(photoId);
                            } else {
                                newFailed.add(photoId);
                            }
                        }
                    });

                    return {
                        ...prev,
                        loaded: newLoaded,
                        failed: newFailed,
                        preloading: newPreloading,
                        loading: newPreloading.size > 0,
                    };
                });
            } catch (error) {
                console.warn("배치 프리로드 처리 중 오류:", error);
            }
        },
        [preloadImage, includeThumbnails, delay]
    );

    // 프리로드 시작
    const startPreload = useCallback(
        async (ids: number[]) => {
            // 기존 작업 중단
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            setState((prev) => ({
                ...prev,
                loading: true,
                preloading: new Set(ids.slice(0, maxPreload)),
            }));

            try {
                // 우선순위와 제한된 수량으로 정렬
                const sortedIds = ids
                    .slice(0, maxPreload)
                    .sort((a, b) => priority * (b - a)); // 높은 ID가 더 최근 이미지라고 가정

                // 배치 단위로 처리 (동시에 너무 많은 요청 방지)
                const batchSize = Math.min(3, sortedIds.length);
                for (let i = 0; i < sortedIds.length; i += batchSize) {
                    if (signal.aborted) break;

                    const batch = sortedIds.slice(i, i + batchSize);
                    await processBatch(batch, signal);

                    // 배치 간 짧은 휴식
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
            } catch (error) {
                console.warn("프리로드 중 오류:", error);
            } finally {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    preloading: new Set(),
                }));
            }
        },
        [maxPreload, priority, processBatch]
    );

    // photoIds 변경 시 프리로드 시작
    useEffect(() => {
        if (photoIds.length === 0) return;

        // 지연 실행으로 불필요한 재시작 방지
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            startPreload(photoIds);
        }, 100);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [photoIds, startPreload]);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // 수동 재시도
    const retry = useCallback(
        (photoId?: number) => {
            if (photoId) {
                setState((prev) => {
                    const newFailed = new Set(prev.failed);
                    newFailed.delete(photoId);
                    return { ...prev, failed: newFailed };
                });
                startPreload([photoId]);
            } else {
                setState((prev) => ({
                    ...prev,
                    loaded: new Set(),
                    failed: new Set(),
                    preloading: new Set(),
                }));
                startPreload(photoIds);
            }
        },
        [startPreload, photoIds]
    );

    // 개별 이미지 로드 상태 확인
    const isLoaded = useCallback(
        (photoId: number) => {
            return state.loaded.has(photoId);
        },
        [state.loaded]
    );

    const isFailed = useCallback(
        (photoId: number) => {
            return state.failed.has(photoId);
        },
        [state.failed]
    );

    const isPreloading = useCallback(
        (photoId: number) => {
            return state.preloading.has(photoId);
        },
        [state.preloading]
    );

    return {
        // 상태
        loading: state.loading,
        loadedCount: state.loaded.size,
        failedCount: state.failed.size,
        preloadingCount: state.preloading.size,

        // 개별 확인
        isLoaded,
        isFailed,
        isPreloading,

        // 액션
        retry,

        // 통계
        progress:
            photoIds.length > 0
                ? state.loaded.size / Math.min(photoIds.length, maxPreload)
                : 0,

        // 상세 정보 (개발/디버깅용)
        debug: {
            loaded: Array.from(state.loaded),
            failed: Array.from(state.failed),
            preloading: Array.from(state.preloading),
        },
    };
}

// =============================================================================
// 📊 성능 모니터링 훅
// =============================================================================

export function useImageLoadPerformance() {
    const [metrics, setMetrics] = useState({
        totalLoads: 0,
        successfulLoads: 0,
        averageLoadTime: 0,
        cacheHitRate: 0,
    });

    const recordLoad = useCallback((result: ImageLoadResult) => {
        setMetrics((prev) => {
            const newTotalLoads = prev.totalLoads + 1;
            const newSuccessfulLoads = result.success
                ? prev.successfulLoads + 1
                : prev.successfulLoads;
            const newAverageLoadTime =
                (prev.averageLoadTime * prev.totalLoads + result.loadTime) /
                newTotalLoads;

            return {
                totalLoads: newTotalLoads,
                successfulLoads: newSuccessfulLoads,
                averageLoadTime: Math.round(newAverageLoadTime),
                cacheHitRate: prev.cacheHitRate, // 캐시 히트율은 향후 구현 예정
            };
        });
    }, []);

    const reset = useCallback(() => {
        setMetrics({
            totalLoads: 0,
            successfulLoads: 0,
            averageLoadTime: 0,
            cacheHitRate: 0,
        });
    }, []);

    return {
        metrics,
        recordLoad,
        reset,
        successRate:
            metrics.totalLoads > 0
                ? metrics.successfulLoads / metrics.totalLoads
                : 0,
    };
}

// =============================================================================
// 🎣 편의 훅
// =============================================================================

/**
 * 단일 이미지 프리로드를 위한 간단한 훅
 */
export function useSingleImagePreload(
    photoId: number | null,
    thumbnail = false
) {
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!photoId) return;

        setLoading(true);
        setError(null);

        const imageUrl = getImageUrl(photoId, thumbnail);

        testImageLoad(imageUrl)
            .then((success) => {
                setLoaded(success);
                if (!success) {
                    setError("이미지 로드 실패");
                }
            })
            .catch((err) => {
                setError(err.message);
                setLoaded(false);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [photoId, thumbnail]);

    return { loaded, loading, error };
}
