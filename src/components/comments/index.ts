/**
 * Comments Module - Centralized exports for comment system
 * Enhanced comment system with optimistic updates, error handling, and TypeScript safety
 */

// =============================================================================
// 🧩 Component Exports
// =============================================================================

export { CommentList, default as CommentListDefault } from './CommentList';
export { CommentItem, default as CommentItemDefault } from './CommentItem';
export { CommentForm, default as CommentFormDefault } from './CommentForm';
export { CommentReply, default as CommentReplyDefault } from './CommentReply';

// =============================================================================
// 🎣 Hook Exports
// =============================================================================

export { useComments, default as useCommentsDefault } from './hooks/useComments';
export { useCommentActions, default as useCommentActionsDefault } from './hooks/useCommentActions';
export { useOptimisticComments, default as useOptimisticCommentsDefault } from './hooks/useOptimisticComments';

// =============================================================================
// 🏷️ Type Exports
// =============================================================================

export type {
    // State management types
    CommentLoadingState,
    CommentOperation,
    CommentError,
    
    // Action types
    CommentLikeToggle,
    CommentReplyData,
    CommentUpdateData,
    
    // List management types
    CommentListConfig,
    CommentListState,
    CommentListAction,
    
    // UI component types
    CommentItemOptions,
    CommentFormValidation,
    CommentFormState,
    
    // Utility types
    CommentTreeNode,
    CommentFilters,
    CommentStatistics,
    
    // Event types
    CommentEvent,
    CommentEventHandler
} from './types/comment.types';

// =============================================================================
// 🔧 Utility Function Exports
// =============================================================================

export {
    hasReplies,
    canEditComment,
    canDeleteComment,
    canReplyToComment,
    buildCommentTree,
    flattenCommentTree,
    calculateEngagementScore
} from './types/comment.types';

// =============================================================================
// 📋 Constant Exports
// =============================================================================

export {
    DEFAULT_COMMENT_CONFIG,
    DEFAULT_FORM_VALIDATION,
    DEFAULT_ITEM_OPTIONS,
    COMMENT_OPERATION_TIMEOUT,
    MAX_REPLY_DEPTH
} from './types/comment.types';

// =============================================================================
// 🚀 Quick Start Exports (Convenience)
// =============================================================================

/** 
 * All-in-one comment system for photo pages
 * Usage: <PhotoComments photoId={123} />
 */
export { CommentList as PhotoComments };

/** 
 * All-in-one comment system for series pages
 * Usage: <SeriesComments seriesId={456} />
 */
export { CommentList as SeriesComments };

/**
 * Standalone comment form
 * Usage: <StandaloneCommentForm photoId={123} onSubmit={handleSubmit} />
 */
export { CommentForm as StandaloneCommentForm };