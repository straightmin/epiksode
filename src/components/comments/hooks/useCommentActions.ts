/**
 * useCommentActions - Custom hook for comment CRUD operations
 * Handles comment creation, updates, deletion, and like toggling
 */

import { useState, useCallback } from "react";
import {
    CommentDetail,
    CreateCommentRequest,
    ToggleLikeRequest,
} from "@/types";
import { apiClient } from "@/lib/api-client";

interface UseCommentActionsOptions {
    onSuccess?: (operation: string, result?: CommentDetail) => void;
    onError?: (error: Error, operation?: string) => void;
}

interface UseCommentActionsReturn {
    loading: boolean;
    createComment: (data: CreateCommentRequest) => Promise<CommentDetail>;
    updateComment: (
        id: number,
        data: Partial<CommentDetail>
    ) => Promise<CommentDetail>;
    deleteComment: (id: number) => Promise<void>;
    toggleLike: (data: {
        commentId: number;
        photoId?: number | null;
        seriesId?: number | null;
    }) => Promise<CommentDetail>;
    createReply: (data: CreateCommentRequest) => Promise<CommentDetail>;
}

/**
 * Hook for performing comment-related actions with error handling and loading states
 */
export function useCommentActions({
    onSuccess,
    onError,
}: UseCommentActionsOptions = {}): UseCommentActionsReturn {
    const [loading, setLoading] = useState(false);

    // Generic action wrapper with error handling
    const executeAction = useCallback(
        async <T>(operation: string, action: () => Promise<T>): Promise<T> => {
            setLoading(true);

            try {
                const result = await action();
                onSuccess?.(operation, result as CommentDetail);
                return result;
            } catch (error) {
                console.error(`Comment ${operation} failed:`, error);
                onError?.(error as Error, operation);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [onSuccess, onError]
    );

    // Create a new comment
    const createComment = useCallback(
        async (data: CreateCommentRequest): Promise<CommentDetail> => {
            return executeAction("create", async () => {
                // Validate input
                if (!data.content.trim()) {
                    throw new Error("댓글 내용을 입력해주세요.");
                }

                if (data.content.length > 500) {
                    throw new Error("댓글은 500자를 초과할 수 없습니다.");
                }

                if (!data.photoId && !data.seriesId) {
                    throw new Error("photoId 또는 seriesId가 필요합니다.");
                }

                const comment = await apiClient.createComment(data);
                return comment;
            });
        },
        [executeAction]
    );

    // Update an existing comment (for future use)
    const updateComment = useCallback(
        async (
            _id: number,
            _data: Partial<CommentDetail>
        ): Promise<CommentDetail> => {
            return executeAction("update", async () => {
                // TODO: Implement comment update API when backend supports it
                throw new Error("댓글 수정 기능은 아직 지원되지 않습니다.");
            });
        },
        [executeAction]
    );

    // Delete a comment
    const deleteComment = useCallback(
        async (id: number): Promise<void> => {
            return executeAction("delete", async () => {
                await apiClient.deleteComment(id);
            });
        },
        [executeAction]
    );

    // Toggle like on a comment
    const toggleLike = useCallback(
        async (data: {
            commentId: number;
            photoId?: number | null;
            seriesId?: number | null;
        }): Promise<CommentDetail> => {
            return executeAction("like", async () => {
                const likeRequest: ToggleLikeRequest = {
                    commentId: data.commentId,
                };

                // Add context ID if available
                if (data.photoId) {
                    likeRequest.photoId = data.photoId;
                } else if (data.seriesId) {
                    likeRequest.seriesId = data.seriesId;
                }

                const response = await apiClient.toggleLike(likeRequest);

                // Since the like API doesn't return the updated comment,
                // we need to create a mock updated comment for optimistic updates
                // In a real app, you'd want the API to return the updated comment
                const mockUpdatedComment: CommentDetail = {
                    id: data.commentId,
                    userId: 0, // Will be filled by optimistic update logic
                    content: "", // Will be filled by optimistic update logic
                    photoId: data.photoId,
                    seriesId: data.seriesId,
                    parentId: null,
                    author: {
                        id: 0,
                        username: "",
                        bio: null,
                        profileImageUrl: null,
                        createdAt: "",
                    },
                    likesCount: response.liked ? 1 : 0, // This is approximate
                    repliesCount: 0,
                    replies: [],
                    isLikedByCurrentUser: response.liked,
                    isOwner: false,
                    createdAt: "",
                    updatedAt: "",
                    deletedAt: null,
                };

                return mockUpdatedComment;
            });
        },
        [executeAction]
    );

    // Create a reply to an existing comment
    const createReply = useCallback(
        async (data: CreateCommentRequest): Promise<CommentDetail> => {
            return executeAction("reply", async () => {
                // Validate reply data
                if (!data.parentId) {
                    throw new Error("부모 댓글 ID가 필요합니다.");
                }

                return createComment(data);
            });
        },
        [executeAction, createComment]
    );

    return {
        loading,
        createComment,
        updateComment,
        deleteComment,
        toggleLike,
        createReply,
    };
}

export default useCommentActions;
