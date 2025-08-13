/**
 * CommentList - Main container for comment display and management
 * Handles comment fetching, pagination, and state management
 */

"use client";

import React from "react";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { useComments } from "./hooks/useComments";
import { useAuth } from "@/contexts/AuthContext";
import { CommentDetail } from "@/types";

interface CommentListProps {
    photoId?: number;
    seriesId?: number;
    initialComments?: CommentDetail[];
    className?: string;
}

/**
 * Comment list container component with pagination and real-time updates
 */
export function CommentList({
    photoId,
    seriesId,
    initialComments = [],
    className = "",
}: CommentListProps) {
    const { user } = useAuth();
    const {
        comments,
        loading,
        error,
        pagination,
        refreshComments,
        loadMoreComments,
        optimisticUpdate,
        rollbackUpdate,
    } = useComments({
        photoId,
        seriesId,
        initialComments,
    });

    // Loading state
    if (loading && comments.length === 0) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && comments.length === 0) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <div className="text-red-500 mb-4">
                    <svg
                        className="w-12 h-12 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <p className="text-gray-600 mb-4">
                    댓글을 불러오는데 실패했습니다
                </p>
                <button
                    onClick={refreshComments}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-6 px-2 sm:px-0 ${className}`}>
            {/* Comment Form - Show only for authenticated users */}
            {user && (photoId || seriesId) && (
                <CommentForm
                    photoId={photoId}
                    seriesId={seriesId}
                    onCommentCreated={(newComment) => {
                        optimisticUpdate("create", newComment);
                    }}
                    onError={(error) => {
                        console.error("Comment creation failed:", error);
                        // Could show toast notification here
                    }}
                />
            )}

            {/* Comments Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    댓글 {pagination?.total > 0 && `(${pagination.total})`}
                </h3>
                {comments.length > 0 && (
                    <button
                        onClick={refreshComments}
                        className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                        disabled={loading}
                    >
                        새로고침
                    </button>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg
                            className="w-12 h-12 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <p>첫 번째 댓글을 남겨보세요!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onUpdate={(updatedComment) => {
                                optimisticUpdate("update", updatedComment);
                            }}
                            onDelete={(commentId) => {
                                optimisticUpdate("delete", {
                                    id: commentId,
                                } as CommentDetail);
                            }}
                            onError={(error, operation, originalComment) => {
                                console.error(
                                    `Comment ${operation} failed:`,
                                    error
                                );
                                if (originalComment) {
                                    rollbackUpdate(originalComment);
                                }
                            }}
                        />
                    ))
                )}
            </div>

            {/* Load More Button */}
            {pagination && pagination.hasNext && (
                <div className="text-center pt-4">
                    <button
                        onClick={loadMoreComments}
                        disabled={loading}
                        className="px-6 py-2 text-sm text-purple-600 border border-purple-200 rounded-full hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "로딩 중..." : "더 보기"}
                    </button>
                </div>
            )}

            {/* Loading indicator for pagination */}
            {loading && comments.length > 0 && (
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}

export default CommentList;
