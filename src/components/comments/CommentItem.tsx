/**
 * CommentItem - Individual comment display component
 * Handles comment display, interactions (like, reply, delete), and nested replies
 */

"use client";

import React, { useState, memo, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CommentDetail } from "@/types";
import { CommentReply } from "./CommentReply";
import { useAuth } from "@/contexts/AuthContext";
import { useCommentActions } from "./hooks/useCommentActions";
import { Avatar } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CommentItemProps {
    comment: CommentDetail;
    onUpdate?: (comment: CommentDetail) => void;
    onDelete?: (commentId: number) => void;
    onError?: (
        error: Error,
        operation: string,
        originalComment?: CommentDetail
    ) => void;
    level?: number; // For nested comment styling
    className?: string;
}

/**
 * Individual comment component with reply, like, and delete functionality
 * Memoized for performance optimization
 */
export const CommentItem = memo(function CommentItem({
    comment,
    onUpdate,
    onDelete,
    onError,
    level = 0,
    className = "",
}: CommentItemProps) {
    const { user } = useAuth();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { toggleLike, deleteComment, createReply, loading } =
        useCommentActions({
            onSuccess: (operation, result) => {
                if (operation === "like" && onUpdate) {
                    onUpdate(result);
                } else if (operation === "delete" && onDelete) {
                    onDelete(comment.id);
                }
            },
            onError,
        });

    // Format comment creation time - memoized for performance
    const timeAgo = useMemo(() => {
        return formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: ko,
        });
    }, [comment.createdAt]);

    // Handle comment deletion - memoized to prevent unnecessary re-renders
    const handleDelete = useCallback(async () => {
        if (!window.confirm("이 댓글을 삭제하시겠습니까?")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteComment(comment.id);
        } catch (error) {
            onError?.(error as Error, "delete", comment);
        } finally {
            setIsDeleting(false);
        }
    }, [comment.id, deleteComment, onError, comment]);

    // Handle like toggle - memoized to prevent unnecessary re-renders
    const handleLikeToggle = useCallback(async () => {
        try {
            await toggleLike({
                commentId: comment.id,
                photoId: comment.photoId,
                seriesId: comment.seriesId,
            });
        } catch (error) {
            onError?.(error as Error, "like", comment);
        }
    }, [
        toggleLike,
        comment.id,
        comment.photoId,
        comment.seriesId,
        onError,
        comment,
    ]);

    // Handle reply creation - memoized to prevent unnecessary re-renders
    const handleReplySubmit = useCallback(
        async (content: string) => {
            try {
                const newReply = await createReply({
                    content,
                    photoId: comment.photoId,
                    seriesId: comment.seriesId,
                    parentId: comment.id,
                });

                // Add reply to the comment
                const updatedComment = {
                    ...comment,
                    repliesCount: comment.repliesCount + 1,
                    replies: [...(comment.replies || []), newReply],
                };

                onUpdate?.(updatedComment);
                setShowReplyForm(false);
                setShowReplies(true);
            } catch (error) {
                onError?.(error as Error, "reply", comment);
            }
        },
        [createReply, comment, onUpdate, onError]
    );

    // Memoize permission checks to prevent unnecessary recalculations
    const { isOwner, canDelete, canReply } = useMemo(
        () => ({
            isOwner: user && comment.author.id === user.id,
            canDelete: user && comment.author.id === user.id,
            canReply: user && comment.photoId, // Only allow replies on photo comments for now
        }),
        [user, comment.author.id, comment.photoId]
    );

    return (
        <div
            className={`
            ${className} 
            ${level > 0 ? "ml-4 sm:ml-8 border-l-2 border-gray-100 pl-2 sm:pl-4" : ""}
            transform transition-all duration-200 ease-in-out
            hover:bg-gray-50 hover:bg-opacity-50 rounded-lg p-2 -m-2
        `}
        >
            <div className="flex space-x-3">
                {/* Avatar */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                    {comment.author.profileImageUrl ? (
                        <img
                            src={comment.author.profileImageUrl}
                            alt={comment.author.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                            {comment.author.username[0]?.toUpperCase() || "?"}
                        </div>
                    )}
                </Avatar>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                    {/* Author and Time */}
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                            {comment.author.username}
                        </span>
                        {isOwner && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                작성자
                            </span>
                        )}
                        <span className="text-gray-500 text-xs">{timeAgo}</span>
                    </div>

                    {/* Comment Text */}
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-2">
                        {comment.content}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-sm">
                        {/* Like Button */}
                        <button
                            onClick={handleLikeToggle}
                            disabled={!user || loading}
                            className={`flex items-center space-x-1 transition-all duration-200 transform ${
                                comment.isLikedByCurrentUser
                                    ? "text-red-600 hover:text-red-700 scale-105"
                                    : "text-gray-500 hover:text-red-600"
                            } ${!user ? "cursor-not-allowed opacity-50" : "hover:bg-red-50 px-2 py-1 rounded hover:scale-105"}`}
                        >
                            {loading && (
                                <LoadingSpinner
                                    size="sm"
                                    color="gray"
                                    className="mr-1"
                                />
                            )}
                            <svg
                                className={`w-4 h-4 transition-all duration-200 ${
                                    comment.isLikedByCurrentUser
                                        ? "fill-current animate-pulse"
                                        : "stroke-current"
                                } ${loading ? "opacity-50" : ""}`}
                                viewBox="0 0 24 24"
                                fill={
                                    comment.isLikedByCurrentUser
                                        ? "currentColor"
                                        : "none"
                                }
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span className="transition-all duration-200">
                                {comment.likesCount}
                            </span>
                        </button>

                        {/* Reply Button */}
                        {canReply && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                            >
                                답글
                            </button>
                        )}

                        {/* Delete Button */}
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "삭제 중..." : "삭제"}
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {showReplyForm && (
                        <div className="mt-3">
                            <CommentReply
                                parentComment={comment}
                                onSubmit={handleReplySubmit}
                                onCancel={() => setShowReplyForm(false)}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Replies Section */}
                    {comment.repliesCount > 0 && (
                        <div className="mt-3">
                            {!showReplies ? (
                                <button
                                    onClick={() => setShowReplies(true)}
                                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                                >
                                    답글 {comment.repliesCount}개 보기
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowReplies(false)}
                                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline mb-3"
                                    >
                                        답글 숨기기
                                    </button>
                                    <div className="space-y-3">
                                        {comment.replies?.map((reply) => (
                                            <CommentItem
                                                key={reply.id}
                                                comment={reply}
                                                onUpdate={onUpdate}
                                                onDelete={onDelete}
                                                onError={onError}
                                                level={level + 1}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default CommentItem;
