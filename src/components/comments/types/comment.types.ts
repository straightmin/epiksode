/**
 * Comment Component Types - Enhanced type definitions for comment system
 * Extends base types with component-specific interfaces and utilities
 */

import { CommentDetail, CreateCommentRequest, PaginationMeta } from "@/types";

// =============================================================================
// 🔄 Comment State Management Types
// =============================================================================

/** Comment loading states */
export type CommentLoadingState = "idle" | "loading" | "success" | "error";

/** Comment operation types for optimistic updates */
export type CommentOperation =
    | "create"
    | "update"
    | "delete"
    | "like"
    | "reply";

/** Comment error with operation context */
export interface CommentError {
    message: string;
    operation?: CommentOperation;
    code?: string;
    timestamp: number;
}

// =============================================================================
// 🎯 Comment Action Types
// =============================================================================

/** Like toggle data for comments */
export interface CommentLikeToggle {
    commentId: number;
    photoId?: number | null;
    seriesId?: number | null;
    isLiked?: boolean; // For optimistic updates
}

/** Reply creation data */
export interface CommentReplyData extends CreateCommentRequest {
    parentId: number;
    parentAuthor?: string;
}

/** Comment update data (for future use) */
export interface CommentUpdateData {
    id: number;
    content?: string;
    editedAt?: string;
}

// =============================================================================
// 📊 Comment List Management Types
// =============================================================================

/** Comment list configuration */
export interface CommentListConfig {
    photoId?: number;
    seriesId?: number;
    pageSize?: number;
    sortBy?: "newest" | "oldest" | "popular";
    showReplies?: boolean;
    enableOptimisticUpdates?: boolean;
}

/** Comment list state */
export interface CommentListState {
    comments: CommentDetail[];
    loading: CommentLoadingState;
    error: CommentError | null;
    pagination: PaginationMeta | null;
    hasMore: boolean;
    lastUpdated: number;
}

/** Comment list actions */
export type CommentListAction =
    | { type: "SET_LOADING"; payload: CommentLoadingState }
    | { type: "SET_COMMENTS"; payload: CommentDetail[] }
    | { type: "ADD_COMMENTS"; payload: CommentDetail[] }
    | { type: "ADD_COMMENT"; payload: CommentDetail }
    | { type: "UPDATE_COMMENT"; payload: CommentDetail }
    | { type: "DELETE_COMMENT"; payload: number }
    | { type: "SET_PAGINATION"; payload: PaginationMeta }
    | { type: "SET_ERROR"; payload: CommentError | null }
    | { type: "CLEAR_ERROR" };

// =============================================================================
// 🎨 Comment UI Component Types
// =============================================================================

/** Comment item display options */
export interface CommentItemOptions {
    showReplies?: boolean;
    showReplyForm?: boolean;
    showLikeCount?: boolean;
    showTimestamp?: boolean;
    maxReplyDepth?: number;
    enableKeyboardNavigation?: boolean;
}

/** Comment form validation */
export interface CommentFormValidation {
    content: {
        required: boolean;
        minLength: number;
        maxLength: number;
    };
    antiSpam: {
        enabled: boolean;
        minInterval: number; // seconds between submissions
    };
}

/** Comment form state */
export interface CommentFormState {
    content: string;
    isSubmitting: boolean;
    isValid: boolean;
    errors: string[];
    lastSubmission?: number;
}

// =============================================================================
// 🔧 Comment Utility Types
// =============================================================================

/** Comment tree node (for nested replies) */
export interface CommentTreeNode {
    comment: CommentDetail;
    children: CommentTreeNode[];
    depth: number;
    isExpanded?: boolean;
}

/** Comment filter options */
export interface CommentFilters {
    author?: string;
    hasReplies?: boolean;
    isLiked?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
}

/** Comment statistics */
export interface CommentStatistics {
    totalComments: number;
    totalReplies: number;
    totalLikes: number;
    topAuthors: Array<{
        username: string;
        count: number;
    }>;
    engagementRate: number;
}

// =============================================================================
// 📱 Comment Event Types
// =============================================================================

/** Comment interaction events */
export type CommentEvent =
    | { type: "comment_created"; comment: CommentDetail }
    | { type: "comment_updated"; comment: CommentDetail }
    | { type: "comment_deleted"; commentId: number }
    | { type: "comment_liked"; commentId: number; isLiked: boolean }
    | { type: "reply_created"; parentId: number; reply: CommentDetail }
    | { type: "comments_refreshed"; comments: CommentDetail[] };

/** Comment event handler */
export type CommentEventHandler = (event: CommentEvent) => void;

// =============================================================================
// 🛡️ Type Guards and Utilities
// =============================================================================

/** Check if comment has replies */
export function hasReplies(comment: CommentDetail): boolean {
    return (
        comment.repliesCount > 0 &&
        Array.isArray(comment.replies) &&
        comment.replies.length > 0
    );
}

/** Check if comment can be edited */
export function canEditComment(
    comment: CommentDetail,
    currentUserId?: number
): boolean {
    if (!currentUserId) return false;
    return comment.author.id === currentUserId && !comment.deletedAt;
}

/** Check if comment can be deleted */
export function canDeleteComment(
    comment: CommentDetail,
    currentUserId?: number
): boolean {
    if (!currentUserId) return false;
    return comment.author.id === currentUserId && !comment.deletedAt;
}

/** Check if user can reply to comment */
export function canReplyToComment(
    comment: CommentDetail,
    currentUserId?: number
): boolean {
    return !!currentUserId && !comment.deletedAt;
}

/** Build comment tree from flat list */
export function buildCommentTree(comments: CommentDetail[]): CommentTreeNode[] {
    const commentMap = new Map<number, CommentTreeNode>();
    const rootComments: CommentTreeNode[] = [];

    // First pass: create nodes
    comments.forEach((comment) => {
        commentMap.set(comment.id, {
            comment,
            children: [],
            depth: 0,
        });
    });

    // Second pass: build tree structure
    comments.forEach((comment) => {
        const node = commentMap.get(comment.id);
        if (!node) return;

        if (comment.parentId) {
            const parent = commentMap.get(comment.parentId);
            if (parent) {
                node.depth = parent.depth + 1;
                parent.children.push(node);
            } else {
                // Parent not found, treat as root
                rootComments.push(node);
            }
        } else {
            rootComments.push(node);
        }
    });

    return rootComments;
}

/** Flatten comment tree back to list */
export function flattenCommentTree(tree: CommentTreeNode[]): CommentDetail[] {
    const result: CommentDetail[] = [];

    function traverse(nodes: CommentTreeNode[]) {
        nodes.forEach((node) => {
            result.push(node.comment);
            if (node.children.length > 0) {
                traverse(node.children);
            }
        });
    }

    traverse(tree);
    return result;
}

/** Calculate comment engagement score */
export function calculateEngagementScore(comment: CommentDetail): number {
    const likes = comment.likesCount || 0;
    const replies = comment.repliesCount || 0;
    const ageInHours =
        (Date.now() - new Date(comment.createdAt).getTime()) / (1000 * 60 * 60);

    // Simple engagement score formula
    const score = (likes * 2 + replies * 3) / Math.max(1, ageInHours / 24);
    return Math.round(score * 100) / 100;
}

// =============================================================================
// 📋 Default Values and Constants
// =============================================================================

/** Default comment list configuration */
export const DEFAULT_COMMENT_CONFIG: CommentListConfig = {
    pageSize: 20,
    sortBy: "newest",
    showReplies: true,
    enableOptimisticUpdates: true,
};

/** Default comment form validation */
export const DEFAULT_FORM_VALIDATION: CommentFormValidation = {
    content: {
        required: true,
        minLength: 1,
        maxLength: 500,
    },
    antiSpam: {
        enabled: true,
        minInterval: 5,
    },
};

/** Default comment item options */
export const DEFAULT_ITEM_OPTIONS: CommentItemOptions = {
    showReplies: true,
    showReplyForm: false,
    showLikeCount: true,
    showTimestamp: true,
    maxReplyDepth: 3,
    enableKeyboardNavigation: true,
};

/** Comment operation timeout (for optimistic updates) */
export const COMMENT_OPERATION_TIMEOUT = 10000; // 10 seconds

/** Maximum reply nesting depth */
export const MAX_REPLY_DEPTH = 5;
