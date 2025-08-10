/**
 * 사진 데이터 관리 훅
 * 
 * 사진 목록 조회, 무한 스크롤, 좋아요 등의 기능을 제공하는 커스텀 훅
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiClientError, getErrorMessage } from '@/lib/api-client';
import { PhotoDetail, PhotoListResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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
    sortBy?: 'latest' | 'popular';
    /** 자동 로드 여부 */
    autoLoad?: boolean;
}

type UsePhotosReturn = UsePhotosState & UsePhotosActions;

// =============================================================================
// 🎣 커스텀 훅
// =============================================================================

export const usePhotos = (options: UsePhotosOptions = {}): UsePhotosReturn => {
    const { 
        limit = 10, 
        sortBy = 'latest', 
        autoLoad = true 
    } = options;

    const { isAuthenticated } = useAuth();

    // 상태 관리
    const [photos, setPhotos] = useState<PhotoDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // =============================================================================
    // 🔧 내부 헬퍼 함수들
    // =============================================================================

    /** 에러 처리 헬퍼 */
    const handleError = useCallback((error: unknown) => {
        console.error('Photos Hook Error:', error);
        const message = getErrorMessage(error);
        setError(message);
    }, []);

    /** 사진 목록 로드 */
    const loadPhotos = useCallback(async (
        page: number = 1, 
        append: boolean = false
    ): Promise<PhotoDetail[]> => {
        try {
            setError(null);
            
            // 실제 API 호출
            try {
                console.log('🔍 API 호출 시작:', { sortBy });
                const response = await apiClient.getPhotos({
                    sortBy, // 백엔드가 지원하는 파라미터만 전송
                    // page, limit은 백엔드에서 아직 구현되지 않음
                });
                console.log('✅ API 응답 성공:', response);

                // API 클라이언트에서 이미 올바른 형식으로 반환됨
                const newPhotos = response as PhotoDetail[];
                const hasMorePhotos = newPhotos.length >= limit; // 임시: 페이지네이션 미구현

                // 상태 업데이트
                if (append) {
                    setPhotos(prev => [...prev, ...newPhotos]);
                } else {
                    setPhotos(newPhotos);
                }

                setHasMore(hasMorePhotos);
                setCurrentPage(page);

                return newPhotos;
            } catch (apiError) {
                // API 에러가 발생하면 목업 데이터로 폴백
                console.error('❌ API 호출 실패:', apiError);
                if (page === 1) {
                    console.info('백엔드 API 연결 대기 중... 목업 데이터를 사용합니다.');
                }
                // API 에러가 발생하면 목업 데이터로 폴백
                // 목업 데이터를 인라인으로 처리
                const mockPhotos: PhotoDetail[] = [
                    {
                        id: 1,
                        userId: 1,
                        title: "산속의 아침",
                        description: "지리산 국립공원의 수력 폭포에서 바라본 산속의 아름다운 아침 풍경입니다.",
                        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
                        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
                        viewCount: 1247,
                        isPublic: true,
                        createdAt: "2024-02-15T06:30:00.000Z",
                        updatedAt: "2024-02-15T06:30:00.000Z",
                        deletedAt: null,
                        author: {
                            id: 1,
                            username: "nature_kim",
                            bio: "자연의 아름다움을 담는 사진가입니다.",
                            profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                            createdAt: "2024-01-15T09:30:00.000Z"
                        },
                        likesCount: 42,
                        commentsCount: 8,
                        isLikedByCurrentUser: false,
                        isOwner: false
                    },
                    {
                        id: 2,
                        userId: 5,
                        title: "사막의 별",
                        description: "사하라 사막에서 바라본 은하수와 별들의 화려한 화상입니다.",
                        imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=1100&fit=crop",
                        thumbnailUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=300&fit=crop",
                        viewCount: 2156,
                        isPublic: true,
                        createdAt: "2024-03-20T22:45:00.000Z",
                        updatedAt: "2024-03-20T22:45:00.000Z",
                        deletedAt: null,
                        author: {
                            id: 5,
                            username: "star_jung",
                            bio: "밤하늘의 아름다움을 찾아다니는 여행자입니다.",
                            profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                            createdAt: "2024-01-20T14:20:00.000Z"
                        },
                        likesCount: 89,
                        commentsCount: 23,
                        isLikedByCurrentUser: true,
                        isOwner: false
                    },
                    {
                        id: 3,
                        userId: 2,
                        title: "도시의 야경",
                        description: "번화가 네온사인이 만들어내는 환상적인 밤의 풍경",
                        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1000&fit=crop",
                        thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
                        viewCount: 892,
                        isPublic: true,
                        createdAt: "2024-08-08T22:15:00.000Z",
                        updatedAt: "2024-08-08T22:15:00.000Z",
                        deletedAt: null,
                        author: {
                            id: 2,
                            username: "city_park",
                            bio: "도시의 숨겨진 매력을 발견하고 기록하는 것을 좋아합니다.",
                            profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                            createdAt: "2024-02-01T00:00:00.000Z"
                        },
                        likesCount: 156,
                        commentsCount: 41,
                        isLikedByCurrentUser: false,
                        isOwner: false
                    }
                ];

                // 페이지네이션 시뮬레이션
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const pagePhotos = mockPhotos.slice(startIndex, endIndex);

                // 상태 업데이트
                if (append) {
                    setPhotos(prev => [...prev, ...pagePhotos]);
                } else {
                    setPhotos(pagePhotos);
                }

                setHasMore(page < 2); // 2페이지까지만 있다고 가정
                setCurrentPage(page);

                return pagePhotos;
            }
        } catch (error) {
            handleError(error);
            return [];
        }
    }, [limit, sortBy, handleError]);

    /** 목업 데이터 로드 (API 서버가 준비되지 않은 경우) */
    const loadMockPhotos = useCallback((
        page: number = 1, 
        append: boolean = false
    ): PhotoDetail[] => {
        // docs/api/api_samples/photos/photo_list.json 기반 목업 데이터
        const mockPhotos: PhotoDetail[] = [
            {
                id: 1,
                userId: 1,
                title: "산속의 아침",
                description: "지리산 국립공원의 수력 폭포에서 바라본 산속의 아름다운 아침 풍경입니다.",
                imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
                viewCount: 1247,
                isPublic: true,
                createdAt: "2024-02-15T06:30:00.000Z",
                updatedAt: "2024-02-15T06:30:00.000Z",
                deletedAt: null,
                author: {
                    id: 1,
                    username: "nature_kim",
                    bio: "자연의 아름다움을 담는 사진가입니다. 산과 숲, 강과 바다의 순간을 기록합니다.",
                    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                    createdAt: "2024-01-15T09:30:00.000Z"
                },
                likesCount: 42,
                commentsCount: 8,
                isLikedByCurrentUser: false,
                isOwner: false
            },
            {
                id: 17,
                userId: 5,
                title: "사막의 별",
                description: "사하라 사막에서 바라본 은하수와 별들의 화려한 화상입니다.",
                imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=1100&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=300&fit=crop",
                viewCount: 2156,
                isPublic: true,
                createdAt: "2024-03-20T22:45:00.000Z",
                updatedAt: "2024-03-20T22:45:00.000Z",
                deletedAt: null,
                author: {
                    id: 5,
                    username: "star_jung",
                    bio: "밤하늘의 아름다움을 찾아다니는 여행자입니다. 달과 별, 그리고 우주를 사랑합니다.",
                    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                    createdAt: "2024-01-20T14:20:00.000Z"
                },
                likesCount: 89,
                commentsCount: 23,
                isLikedByCurrentUser: true,
                isOwner: false
            },
            {
                id: 25,
                userId: 2,
                title: "도시의 야경",
                description: "번화가 네온사인이 만들어내는 환상적인 밤의 풍경",
                imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1000&fit=crop",
                thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop",
                viewCount: 892,
                isPublic: true,
                createdAt: "2024-08-08T22:15:00.000Z",
                updatedAt: "2024-08-08T22:15:00.000Z",
                deletedAt: null,
                author: {
                    id: 2,
                    username: "city_park",
                    bio: "도시의 숨겨진 매력을 발견하고 기록하는 것을 좋아합니다. 🏙️✨",
                    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                    createdAt: "2024-02-01T00:00:00.000Z"
                },
                likesCount: 156,
                commentsCount: 41,
                isLikedByCurrentUser: false,
                isOwner: false
            }
        ];

        // 페이지네이션 시뮬레이션
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const pagePhotos = mockPhotos.slice(startIndex, endIndex);

        // 페이지별로 ID를 조정하여 중복 방지
        const adjustedPhotos = pagePhotos.map((photo, index) => ({
            ...photo,
            id: photo.id + (page - 1) * limit,
        }));

        // 상태 업데이트
        if (append) {
            setPhotos(prev => [...prev, ...adjustedPhotos]);
        } else {
            setPhotos(adjustedPhotos);
        }

        // 3페이지까지만 데이터가 있다고 가정
        setHasMore(page < 3);
        setCurrentPage(page);

        return adjustedPhotos;
    }, [limit]);

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
    const toggleLike = useCallback(async (photoId: number): Promise<void> => {
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return;
        }

        // 낙관적 업데이트 (UI 먼저 업데이트)
        setPhotos(prev =>
            prev.map(photo =>
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
            setPhotos(prev =>
                prev.map(photo =>
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
            setPhotos(prev =>
                prev.map(photo =>
                    photo.id === photoId
                        ? {
                            ...photo,
                            isLikedByCurrentUser: !photo.isLikedByCurrentUser,
                            likesCount: photo.isLikedByCurrentUser 
                                ? photo.likesCount + 1 
                                : photo.likesCount - 1,
                        }
                        : photo
                )
            );

            handleError(error);
        }
    }, [isAuthenticated, handleError]);

    /** 에러 클리어 */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // =============================================================================
    // 🔄 초기화 및 생명주기
    // =============================================================================

    /** 초기 사진 로드 */
    useEffect(() => {
        if (autoLoad && photos.length === 0 && !initialLoading) {
            const loadInitialPhotos = async () => {
                try {
                    setInitialLoading(true);
                    await loadPhotos(1, false);
                } catch (error) {
                    console.error('초기 사진 로드 실패:', error);
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
    // 🎯 반환값
    // =============================================================================

    return {
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
    };
};