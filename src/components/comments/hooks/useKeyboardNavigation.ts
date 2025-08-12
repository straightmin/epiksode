/**
 * useKeyboardNavigation - Enhanced keyboard navigation for comment system
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
    enabled?: boolean;
    onEscape?: () => void;
    onEnter?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onTab?: () => void;
    onShiftTab?: () => void;
}

/**
 * Hook for handling keyboard navigation in comment system
 */
export function useKeyboardNavigation({
    enabled = true,
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onTab,
    onShiftTab
}: UseKeyboardNavigationOptions) {
    const elementRef = useRef<HTMLElement>(null);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                onEscape?.();
                break;

            case 'Enter':
                if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    onEnter?.();
                }
                break;

            case 'ArrowUp':
                if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    onArrowUp?.();
                }
                break;

            case 'ArrowDown':
                if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    onArrowDown?.();
                }
                break;

            case 'Tab':
                if (event.shiftKey) {
                    onShiftTab?.();
                } else {
                    onTab?.();
                }
                break;

            default:
                break;
        }
    }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onTab, onShiftTab]);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !enabled) return;

        element.addEventListener('keydown', handleKeyDown);
        return () => element.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, enabled]);

    return { elementRef };
}

/**
 * Hook for managing focus within comment list
 */
export function useCommentFocus() {
    const focusComment = useCallback((commentId: number) => {
        const element = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (element instanceof HTMLElement) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const focusNextComment = useCallback((currentId: number) => {
        const comments = Array.from(document.querySelectorAll('[data-comment-id]'));
        const currentIndex = comments.findIndex(el => el.getAttribute('data-comment-id') === currentId.toString());
        
        if (currentIndex >= 0 && currentIndex < comments.length - 1) {
            const nextComment = comments[currentIndex + 1] as HTMLElement;
            nextComment.focus();
            nextComment.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const focusPreviousComment = useCallback((currentId: number) => {
        const comments = Array.from(document.querySelectorAll('[data-comment-id]'));
        const currentIndex = comments.findIndex(el => el.getAttribute('data-comment-id') === currentId.toString());
        
        if (currentIndex > 0) {
            const previousComment = comments[currentIndex - 1] as HTMLElement;
            previousComment.focus();
            previousComment.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const focusCommentForm = useCallback(() => {
        const textarea = document.querySelector('textarea[placeholder*="댓글"]') as HTMLTextAreaElement;
        if (textarea) {
            textarea.focus();
            textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    return {
        focusComment,
        focusNextComment,
        focusPreviousComment,
        focusCommentForm
    };
}

export default useKeyboardNavigation;