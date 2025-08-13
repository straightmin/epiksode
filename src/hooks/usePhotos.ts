/**
 * 사진 데이터 관리 훅
 *
 * 사진 목록 조회, 무한 스크롤, 좋아요 등의 기능을 제공하는 커스텀 훅
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { PhotoDetail } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

// =============================================================================
// 🎯 타입 정의
// =============================================================================

interface UsePhotosState {
    /** 사진 목록 */
    photos: PhotoDetail[];
    /** 로딩 상태 */
    loading: boolean;
    /** 초기 로딩 상태 */
    initialLoading: boolean;
    /** 더 불러올 사진이 있는지 여부 */
    hasMore: boolean;
    /** 에러 메시지 */
    error: string | null;
    /** 현재 페이지 */
    currentPage: number;
}

interface UsePhotosActions {
    /** 더 많은 사진 로드 */
    loadMore: () => Promise<void>;
    /** 새로고침 */
    refresh: () => Promise<void>;
    /** 좋아요 토글 */
    toggleLike: (photoId: number) => Promise<void>;
    /** 에러 클리어 */
    clearError: () => void;
}

interface UsePhotosOptions {
    /** 페이지당 사진 수 */
    limit?: number;
    /** 정렬 방식 */
    sortBy?: "latest" | "popular";
    /** 자동 로드 여부 */
    autoLoad?: boolean;
}

type UsePhotosReturn = UsePhotosState & UsePhotosActions;

// =============================================================================
// 🎣 커스텀 훅
// =============================================================================

export const usePhotos = (options: UsePhotosOptions = {}): UsePhotosReturn => {
    const { sortBy = "latest", autoLoad = true } = options;

    const { isAuthenticated } = useAuth();

    // 상태 관리
    const [photos, setPhotos] = useState<PhotoDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // 초기 로드 추적용 ref
    const hasInitialLoadedRef = useRef(false);

    // =============================================================================
    // 🔧 내부 헬퍼 함수들
    // =============================================================================

    /** 에러 처리 헬퍼 */
    const handleError = useCallback((error: unknown) => {
        console.error("Photos Hook Error:", error);
        const message = getErrorMessage(error);
        setError(message);
    }, []);

    // 로딩 중복 방지를 위한 ref
    const loadingRef = useRef(false);

    /** 사진 목록 로드 */
    const loadPhotos = useCallback(
        async (
            page: number = 1,
            append: boolean = false
        ): Promise<PhotoDetail[]> => {
            // 이미 로딩 중이면 중복 호출 방지
            if (loadingRef.current) {
                console.log("🚫 이미 로딩 중이므로 중복 호출 방지");
                return [];
            }

            try {
                loadingRef.current = true;
                setLoading(true);
                setError(null);

                const response = await apiClient.getPhotos({
                    sortBy, // 백엔드가 지원하는 파라미터만 전송
                });

                // API 클라이언트에서 이미 올바른 형식으로 반환됨
                const newPhotos = response as PhotoDetail[];
                const hasMorePhotos = false; // 백엔드에서 페이지네이션 미구현으로 false

                // 상태 업데이트 (중복 제거)
                if (append) {
                    setPhotos((prev) => {
                        // 기존 사진 ID들 추출
                        const existingIds = new Set(prev.map((p) => p.id));
                        // 새로운 사진만 필터링
                        const uniqueNewPhotos = newPhotos.filter(
                            (p) => !existingIds.has(p.id)
                        );
                        return [...prev, ...uniqueNewPhotos];
                    });
                } else {
                    setPhotos(newPhotos);
                }

                setHasMore(hasMorePhotos);
                setCurrentPage(page);

                return newPhotos;
            } catch (error) {
                handleError(error);
                return [];
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        },
        [sortBy, handleError]
    );

    // =============================================================================
    // 📤 공개 액션들
    // =============================================================================

    /** 더 많은 사진 로드 */
    const loadMore = useCallback(async (): Promise<void> => {
        if (loading || !hasMore) return;

        setLoading(true);
        await loadPhotos(currentPage + 1, true);
        setLoading(false);
    }, [loading, hasMore, currentPage, loadPhotos]);

    /** 새로고침 */
    const refresh = useCallback(async (): Promise<void> => {
        setInitialLoading(true);
        setCurrentPage(1);
        await loadPhotos(1, false);
        setInitialLoading(false);
    }, [loadPhotos]);

    /** 좋아요 토글 */
    const toggleLike = useCallback(
        async (photoId: number): Promise<void> => {
            if (!isAuthenticated) {
                setError("로그인이 필요합니다.");
                return;
            }

            // 낙관적 업데이트 (UI 먼저 업데이트)
            setPhotos((prev) =>
                prev.map((photo) =>
                    photo.id === photoId
                        ? {
                              ...photo,
                              isLikedByCurrentUser: !photo.isLikedByCurrentUser,
                              likesCount: photo.isLikedByCurrentUser
                                  ? photo.likesCount - 1
                                  : photo.likesCount + 1,
                          }
                        : photo
                )
            );

            try {
                // 실제 API 호출
                const response = await apiClient.toggleLike({ photoId });

                // 백엔드 응답에 따라 최종 상태 확정
                setPhotos((prev) =>
                    prev.map((photo) =>
                        photo.id === photoId
                            ? {
                                  ...photo,
                                  isLikedByCurrentUser: response.liked, // 백엔드 응답 기준으로 확정
                                  // likesCount는 백엔드에서 제공하지 않으므로 낙관적 업데이트 유지
                              }
                            : photo
                    )
                );
            } catch (error) {
                // API 실패 시 이전 상태로 되돌리기
                setPhotos((prev) =>
                    prev.map((photo) =>
                        photo.id === photoId
                            ? {
                                  ...photo,
                                  isLikedByCurrentUser:
                                      !photo.isLikedByCurrentUser,
                                  likesCount: photo.isLikedByCurrentUser
                                      ? photo.likesCount + 1
                                      : photo.likesCount - 1,
                              }
                            : photo
                    )
                );

                handleError(error);
            }
        },
        [isAuthenticated, handleError]
    );

    /** 에러 클리어 */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // =============================================================================
    // 🔄 초기화 및 생명주기
    // =============================================================================

    /** 초기 사진 로드 */
    useEffect(() => {
        if (autoLoad && !hasInitialLoadedRef.current && !initialLoading) {
            hasInitialLoadedRef.current = true;

            const loadInitialPhotos = async () => {
                try {
                    setInitialLoading(true);
                    await loadPhotos(1, false);
                } catch (error) {
                    console.error("초기 사진 로드 실패:", error);
                    hasInitialLoadedRef.current = false; // 실패 시 다시 시도 가능하게
                } finally {
                    setInitialLoading(false);
                }
            };

            loadInitialPhotos();
        }
        // loadPhotos를 의존성에서 제거하여 무한 루프 방지
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoLoad]);

    // =============================================================================
    // 🎯 반환값 (메모화)
    // =============================================================================

    return useMemo(
        () => ({
            // State
            photos,
            loading,
            initialLoading,
            hasMore,
            error,
            currentPage,

            // Actions
            loadMore,
            refresh,
            toggleLike,
            clearError,
        }),
        [
            photos,
            loading,
            initialLoading,
            hasMore,
            error,
            currentPage,
            loadMore,
            refresh,
            toggleLike,
            clearError,
        ]
    );
};
