/**
 * useComments - Custom hook for comment data management
 * Handles comment fetching, pagination, and optimistic updates
 */

import { useState, useEffect, useCallback } from 'react';
import { CommentDetail, PaginationMeta } from '@/types';
import { apiClient } from '@/lib/api-client';

interface UseCommentsOptions {
    photoId?: number;
    seriesId?: number;
    initialComments?: CommentDetail[];
    pageSize?: number;
}

interface UseCommentsReturn {
    comments: CommentDetail[];
    loading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
    refreshComments: () => Promise<void>;
    loadMoreComments: () => Promise<void>;
    optimisticUpdate: (operation: 'create' | 'update' | 'delete', comment: CommentDetail) => void;
    rollbackUpdate: (originalComment: CommentDetail) => void;
}

/**
 * Hook for managing comment data with pagination and optimistic updates
 */
export function useComments({
    photoId,
    seriesId,
    initialComments = [],
    pageSize = 20
}: UseCommentsOptions): UseCommentsReturn {
    const [comments, setComments] = useState<CommentDetail[]>(initialComments);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);

    // Fetch comments from API
    const fetchComments = useCallback(async (page: number = 1, append: boolean = false) => {
        if (!photoId && !seriesId) return;

        setLoading(true);
        setError(null);

        try {
            let response;
            
            if (photoId) {
                response = await apiClient.getComments(photoId, {
                    page,
                    limit: pageSize
                });
            } else if (seriesId) {
                // TODO: Implement series comments when backend API is available
                response = { data: [], pagination: null };
            } else {
                throw new Error('photoId or seriesId is required');
            }

            if (append && response.data) {
                setComments(prev => [...prev, ...response.data]);
            } else {
                setComments(response.data);
            }
            
            setPagination(response.pagination || null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    }, [photoId, seriesId, pageSize]);

    // Initial load
    useEffect(() => {
        if (initialComments.length === 0) {
            fetchComments();
        }
    }, [fetchComments, initialComments.length]);

    // Refresh comments (reload from page 1)
    const refreshComments = useCallback(async () => {
        await fetchComments(1, false);
    }, [fetchComments]);

    // Load more comments (next page)
    const loadMoreComments = useCallback(async () => {
        if (!pagination?.hasNext || loading) return;
        
        const nextPage = (pagination.page || 1) + 1;
        await fetchComments(nextPage, true);
    }, [fetchComments, pagination, loading]);

    // Optimistic update for immediate UI feedback
    const optimisticUpdate = useCallback((
        operation: 'create' | 'update' | 'delete',
        comment: CommentDetail
    ) => {
        setComments(prev => {
            switch (operation) {
                case 'create':
                    return [comment, ...prev];
                    
                case 'update':
                    return prev.map(c => c.id === comment.id ? { ...c, ...comment } : c);
                    
                case 'delete':
                    return prev.filter(c => c.id !== comment.id);
                    
                default:
                    return prev;
            }
        });

        // Update pagination total count for create/delete operations
        if (operation === 'create' && pagination) {
            setPagination(prev => prev ? {
                ...prev,
                total: prev.total + 1
            } : null);
        } else if (operation === 'delete' && pagination) {
            setPagination(prev => prev ? {
                ...prev,
                total: Math.max(0, prev.total - 1)
            } : null);
        }
    }, [pagination]);

    // Rollback optimistic update in case of error
    const rollbackUpdate = useCallback((originalComment: CommentDetail) => {
        setComments(prev => {
            const existingIndex = prev.findIndex(c => c.id === originalComment.id);
            
            if (existingIndex >= 0) {
                // Comment exists, restore original
                const newComments = [...prev];
                newComments[existingIndex] = originalComment;
                return newComments;
            } else {
                // Comment was deleted, restore it
                return [originalComment, ...prev];
            }
        });
    }, []);

    return {
        comments,
        loading,
        error,
        pagination,
        refreshComments,
        loadMoreComments,
        optimisticUpdate,
        rollbackUpdate
    };
}

export default useComments;