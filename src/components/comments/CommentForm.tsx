/**
 * CommentForm - Comment creation form component
 * Handles comment creation with validation, error handling, and optimistic updates
 */

"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CommentDetail, CreateCommentRequest } from "@/types";
import { useCommentActions } from "./hooks/useCommentActions";
import { validateCommentContent, commentRateLimiter } from "@/lib/security";
import { announceToScreenReader } from "@/lib/accessibility";

interface CommentFormProps {
    photoId?: number;
    seriesId?: number;
    parentId?: number; // For replies
    placeholder?: string;
    onCommentCreated?: (comment: CommentDetail) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
    autoFocus?: boolean;
    className?: string;
}

/**
 * Form for creating new comments with validation and error handling
 */
export function CommentForm({
    photoId,
    seriesId,
    parentId,
    placeholder = "댓글을 입력하세요...",
    onCommentCreated,
    onError,
    onCancel,
    autoFocus = false,
    className = "",
}: CommentFormProps) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { createComment } = useCommentActions({
        onSuccess: (operation, result) => {
            if (operation === "create" && result) {
                setContent("");
                onCommentCreated?.(result);
                // Reset textarea height
                if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                }
            }
        },
        onError: (error) => {
            onError?.(error);
        },
    });

    // Auto-resize textarea with validation
    const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const newContent = e.target.value;
        setContent(newContent);

        // Clear previous validation errors
        if (validationErrors.length > 0) {
            setValidationErrors([]);
        }

        // Real-time validation
        const validation = validateCommentContent(newContent);
        if (!validation.isValid && newContent.trim().length > 0) {
            setValidationErrors(validation.errors);
        }

        // Auto-resize
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    };

    // Handle form submission with security checks
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() || !user) {
            return;
        }

        if (!photoId && !seriesId) {
            onError?.(new Error("photoId 또는 seriesId가 필요합니다."));
            return;
        }

        // Rate limiting check
        const userKey = `comment_${user.id}`;
        if (!commentRateLimiter.isAllowed(userKey)) {
            const remainingTime = commentRateLimiter.getResetTime(userKey);
            setIsRateLimited(true);
            announceToScreenReader(
                `댓글 작성 제한: ${Math.ceil(remainingTime / 1000)}초 후 다시 시도해주세요`
            );

            setTimeout(() => setIsRateLimited(false), remainingTime);
            return;
        }

        // Final validation
        const validation = validateCommentContent(content);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            announceToScreenReader(
                "댓글 작성 실패: " + validation.errors.join(", ")
            );
            return;
        }

        setIsSubmitting(true);
        setValidationErrors([]);

        try {
            const commentData: CreateCommentRequest = {
                content: validation.sanitized,
                photoId,
                seriesId,
                parentId,
            };

            await createComment(commentData);
            announceToScreenReader("댓글이 성공적으로 작성되었습니다");
        } catch (error) {
            onError?.(error as Error);
            announceToScreenReader("댓글 작성에 실패했습니다");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Submit on Ctrl+Enter or Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }

        // Cancel on Escape
        if (e.key === "Escape" && onCancel) {
            e.preventDefault();
            onCancel();
        }
    };

    if (!user) {
        return (
            <div className={`text-center py-4 ${className}`}>
                <p className="text-gray-500 text-sm">
                    댓글을 작성하려면 로그인이 필요합니다.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
            <div className="flex space-x-3">
                {/* User Avatar */}
                <div className="w-8 h-8 flex-shrink-0">
                    {user.profileImageUrl ? (
                        <img
                            src={user.profileImageUrl}
                            alt={user.username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                            {user.username[0]?.toUpperCase() || "?"}
                        </div>
                    )}
                </div>

                {/* Comment Input */}
                <div className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        disabled={isSubmitting || isRateLimited}
                        aria-label={parentId ? "답글 작성" : "댓글 작성"}
                        aria-describedby={
                            validationErrors.length > 0
                                ? "comment-errors"
                                : "comment-hints"
                        }
                        aria-invalid={validationErrors.length > 0}
                        className={`w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                            validationErrors.length > 0
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300"
                        } ${isRateLimited ? "border-yellow-300 bg-yellow-50" : ""}`}
                        style={{
                            minHeight: "40px",
                            maxHeight: "120px",
                        }}
                    />

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div
                            id="comment-errors"
                            className="mt-2"
                            role="alert"
                            aria-live="polite"
                        >
                            {validationErrors.map((error, index) => (
                                <p key={index} className="text-red-600 text-xs">
                                    {error}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Rate Limiting Warning */}
                    {isRateLimited && (
                        <div
                            className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800"
                            role="alert"
                        >
                            댓글 작성이 일시적으로 제한되었습니다. 잠시 후 다시
                            시도해주세요.
                        </div>
                    )}

                    {/* Character count and hints */}
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <div className="flex space-x-2">
                            <span>Ctrl+Enter로 제출</span>
                            {onCancel && <span>ESC로 취소</span>}
                        </div>
                        <span
                            className={
                                content.length > 500 ? "text-red-500" : ""
                            }
                        >
                            {content.length}/500
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pl-11">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        취소
                    </button>
                )}
                <button
                    type="submit"
                    disabled={
                        !content.trim() || content.length > 500 || isSubmitting
                    }
                    className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting
                        ? "작성 중..."
                        : parentId
                          ? "답글 작성"
                          : "댓글 작성"}
                </button>
            </div>
        </form>
    );
}

export default CommentForm;
