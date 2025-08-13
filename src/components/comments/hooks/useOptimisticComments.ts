/**
 * useOptimisticComments - Hook for optimistic comment updates
 * Provides optimistic UI updates with rollback capability for better UX
 */

import { useState, useCallback, useRef } from "react";
import { CommentDetail } from "@/types";

interface OptimisticOperation {
    id: string;
    type: "create" | "update" | "delete" | "like";
    originalState: CommentDetail[];
    timestamp: number;
}

interface UseOptimisticCommentsOptions {
    initialComments?: CommentDetail[];
    rollbackTimeout?: number; // Auto-rollback timeout in ms
}

interface UseOptimisticCommentsReturn {
    comments: CommentDetail[];
    setComments: (comments: CommentDetail[]) => void;
    applyOptimisticUpdate: (
        type: "create" | "update" | "delete" | "like",
        comment: CommentDetail,
        updateFn?: (prev: CommentDetail[]) => CommentDetail[]
    ) => string; // Returns operation ID
    rollbackOperation: (operationId: string) => void;
    rollbackAll: () => void;
    confirmOperation: (operationId: string) => void;
    getPendingOperations: () => OptimisticOperation[];
}

/**
 * Hook for managing optimistic updates with rollback capability
 */
export function useOptimisticComments({
    initialComments = [],
    rollbackTimeout = 10000, // 10 seconds default
}: UseOptimisticCommentsOptions = {}): UseOptimisticCommentsReturn {
    const [comments, setComments] = useState<CommentDetail[]>(initialComments);
    const pendingOperations = useRef<Map<string, OptimisticOperation>>(
        new Map()
    );
    const rollbackTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Generate unique operation ID
    const generateOperationId = useCallback(() => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    // Clear rollback timer
    const clearRollbackTimer = useCallback((operationId: string) => {
        const timer = rollbackTimers.current.get(operationId);
        if (timer) {
            clearTimeout(timer);
            rollbackTimers.current.delete(operationId);
        }
    }, []);

    // Apply optimistic update
    const applyOptimisticUpdate = useCallback(
        (
            type: "create" | "update" | "delete" | "like",
            comment: CommentDetail,
            updateFn?: (prev: CommentDetail[]) => CommentDetail[]
        ): string => {
            const operationId = generateOperationId();

            setComments((prev) => {
                // Store original state for potential rollback
                const operation: OptimisticOperation = {
                    id: operationId,
                    type,
                    originalState: [...prev],
                    timestamp: Date.now(),
                };
                pendingOperations.current.set(operationId, operation);

                // Apply custom update function if provided
                if (updateFn) {
                    return updateFn(prev);
                }

                // Default update logic based on operation type
                switch (type) {
                    case "create":
                        return [comment, ...prev];

                    case "update":
                        return prev.map((c) =>
                            c.id === comment.id ? { ...c, ...comment } : c
                        );

                    case "delete":
                        return prev.filter((c) => c.id !== comment.id);

                    case "like":
                        return prev.map((c) =>
                            c.id === comment.id
                                ? {
                                      ...c,
                                      isLikedByCurrentUser:
                                          comment.isLikedByCurrentUser,
                                      likesCount: comment.likesCount,
                                  }
                                : c
                        );

                    default:
                        return prev;
                }
            });

            // Set auto-rollback timer
            const rollbackTimer = setTimeout(() => {
                console.warn(
                    `Auto-rolling back operation ${operationId} after timeout`
                );
                rollbackOperation(operationId);
            }, rollbackTimeout);

            rollbackTimers.current.set(operationId, rollbackTimer);

            return operationId;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [generateOperationId, rollbackTimeout]
    );

    // Rollback specific operation
    const rollbackOperation = useCallback(
        (operationId: string) => {
            const operation = pendingOperations.current.get(operationId);
            if (!operation) {
                console.warn(`No operation found with ID: ${operationId}`);
                return;
            }

            // Restore original state
            setComments(operation.originalState);

            // Clean up
            pendingOperations.current.delete(operationId);
            clearRollbackTimer(operationId);

            console.log(
                `Rolled back ${operation.type} operation:`,
                operationId
            );
        },
        [clearRollbackTimer]
    );

    // Rollback all pending operations
    const rollbackAll = useCallback(() => {
        const operations = Array.from(pendingOperations.current.values());

        // Find the earliest operation and restore to that state
        const earliestOperation = operations.reduce((earliest, current) =>
            current.timestamp < earliest.timestamp ? current : earliest
        );

        if (earliestOperation) {
            setComments(earliestOperation.originalState);
        }

        // Clear all operations and timers
        pendingOperations.current.clear();
        rollbackTimers.current.forEach((timer) => clearTimeout(timer));
        rollbackTimers.current.clear();

        console.log(`Rolled back ${operations.length} operations`);
    }, []);

    // Confirm operation (remove from pending)
    const confirmOperation = useCallback(
        (operationId: string) => {
            const operation = pendingOperations.current.get(operationId);
            if (operation) {
                pendingOperations.current.delete(operationId);
                clearRollbackTimer(operationId);
                console.log(
                    `Confirmed ${operation.type} operation:`,
                    operationId
                );
            }
        },
        [clearRollbackTimer]
    );

    // Get all pending operations
    const getPendingOperations = useCallback((): OptimisticOperation[] => {
        return Array.from(pendingOperations.current.values());
    }, []);

    return {
        comments,
        setComments,
        applyOptimisticUpdate,
        rollbackOperation,
        rollbackAll,
        confirmOperation,
        getPendingOperations,
    };
}

export default useOptimisticComments;
