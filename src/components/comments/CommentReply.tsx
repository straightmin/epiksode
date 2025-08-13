/**
 * CommentReply - Reply form component for nested comments
 * Specialized form for creating replies to existing comments
 */

"use client";

import React from "react";
import { CommentForm } from "./CommentForm";
import { CommentDetail } from "@/types";

interface CommentReplyProps {
    parentComment: CommentDetail;
    onSubmit: (content: string) => Promise<void>;
    onCancel: () => void;
    autoFocus?: boolean;
    className?: string;
}

/**
 * Reply form component for creating nested comment replies
 */
export function CommentReply({
    parentComment,
    onSubmit,
    onCancel,
    autoFocus = false,
    className = "",
}: CommentReplyProps) {
    const handleCommentCreated = async (comment: CommentDetail) => {
        await onSubmit(comment.content);
    };

    const handleError = (error: Error) => {
        console.error("Reply creation failed:", error);
        // Could show toast notification here
    };

    return (
        <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
            {/* Reply Context */}
            <div className="mb-3 pb-2 border-b border-gray-200">
                <p className="text-xs text-gray-500">
                    <span className="font-medium">
                        {parentComment.author.username}
                    </span>
                    님에게 답글
                </p>
                <p className="text-sm text-gray-600 mt-1 truncate">
                    &ldquo;
                    {parentComment.content.length > 50
                        ? `${parentComment.content.slice(0, 50)}...`
                        : parentComment.content}
                    &rdquo;
                </p>
            </div>

            {/* Reply Form */}
            <CommentForm
                photoId={parentComment.photoId ?? undefined}
                seriesId={parentComment.seriesId ?? undefined}
                parentId={parentComment.id}
                placeholder={`${parentComment.author.username}님에게 답글...`}
                onCommentCreated={handleCommentCreated}
                onError={handleError}
                onCancel={onCancel}
                autoFocus={autoFocus}
            />
        </div>
    );
}

export default CommentReply;
