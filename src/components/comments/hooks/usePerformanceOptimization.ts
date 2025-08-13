/**
 * usePerformanceOptimization - Performance optimization utilities for comments
 */

import { useCallback, useMemo, useRef, useEffect } from "react";
import { CommentDetail } from "@/types";

interface UsePerformanceOptimizationOptions {
    enableVirtualization?: boolean;
    debounceDelay?: number;
    throttleInterval?: number;
}

/**
 * Hook providing performance optimization utilities
 */
export function usePerformanceOptimization({
    enableVirtualization = false,
    debounceDelay = 300,
    throttleInterval = 100,
}: UsePerformanceOptimizationOptions = {}) {
    // Refs for debounce and throttle
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();
    const throttleLastCallRef = useRef<number>(0);
    const throttleTimeoutRef = useRef<NodeJS.Timeout>();

    // Debounce function
    const debounce = useCallback(
        <T extends (...args: unknown[]) => void>(
            func: T,
            delay: number = debounceDelay
        ) => {
            return ((...args: Parameters<T>) => {
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                }

                debounceTimeoutRef.current = setTimeout(() => {
                    func(...args);
                }, delay);
            }) as T;
        },
        [debounceDelay]
    );

    // Throttle function
    const throttle = useCallback(
        <T extends (...args: unknown[]) => void>(
            func: T,
            interval: number = throttleInterval
        ) => {
            return ((...args: Parameters<T>) => {
                const now = Date.now();
                const timeSinceLastCall = now - throttleLastCallRef.current;

                if (timeSinceLastCall >= interval) {
                    throttleLastCallRef.current = now;
                    func(...args);
                } else {
                    if (throttleTimeoutRef.current) {
                        clearTimeout(throttleTimeoutRef.current);
                    }

                    throttleTimeoutRef.current = setTimeout(() => {
                        throttleLastCallRef.current = Date.now();
                        func(...args);
                    }, interval - timeSinceLastCall);
                }
            }) as T;
        },
        [throttleInterval]
    );

    // Memoized comment list optimization
    const optimizeCommentList = useCallback((comments: CommentDetail[]) => {
        // Sort by creation date for better rendering performance
        const sortedComments = [...comments].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

        // Group comments by parent for efficient rendering
        const groupedComments = sortedComments.reduce(
            (acc, comment) => {
                const key = comment.parentId || "root";
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(comment);
                return acc;
            },
            {} as Record<string, CommentDetail[]>
        );

        return {
            sorted: sortedComments,
            grouped: groupedComments,
            rootComments: groupedComments.root || [],
            totalCount: comments.length,
        };
    }, []);

    // Intersection Observer refs and state
    const observerRef = useRef<IntersectionObserver>();
    const elementsRef = useRef<Set<Element>>(new Set());

    // Create intersection observer
    const createIntersectionObserver = useCallback(
        (
            callback: IntersectionObserverCallback,
            options: IntersectionObserverInit = {}
        ) => {
            if (!window.IntersectionObserver) return null;

            const observer = new IntersectionObserver(callback, {
                root: null,
                rootMargin: "50px",
                threshold: 0.1,
                ...options,
            });

            observerRef.current = observer;

            // Observe all previously added elements
            elementsRef.current.forEach((element) => {
                observer.observe(element);
            });

            return observer;
        },
        []
    );

    const observe = useCallback((element: Element) => {
        if (!element || !observerRef.current) return;

        elementsRef.current.add(element);
        observerRef.current.observe(element);
    }, []);

    const unobserve = useCallback((element: Element) => {
        if (!element || !observerRef.current) return;

        elementsRef.current.delete(element);
        observerRef.current.unobserve(element);
    }, []);

    // Cleanup observer on unmount
    useEffect(() => {
        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    // Virtual scrolling calculation
    const calculateVirtualScrolling = useCallback(
        (
            items: CommentDetail[],
            itemHeight: number = 100,
            containerHeight: number = 400
        ) => {
            if (!enableVirtualization || items.length < 20) {
                return {
                    virtualItems: items,
                    startIndex: 0,
                    endIndex: items.length - 1,
                    totalHeight: items.length * itemHeight,
                };
            }

            const visibleCount = Math.ceil(containerHeight / itemHeight);
            const buffer = Math.floor(visibleCount / 2);

            return {
                virtualItems: items.slice(0, visibleCount + buffer),
                startIndex: 0,
                endIndex: visibleCount + buffer - 1,
                totalHeight: items.length * itemHeight,
                visibleCount,
                buffer,
            };
        },
        [enableVirtualization]
    );

    // Memory usage optimization
    const cleanupUnusedData = useCallback(() => {
        // Force garbage collection of unused objects
        if (window.gc && process.env.NODE_ENV === "development") {
            window.gc();
        }
    }, []);

    // Performance monitoring
    const measurePerformance = useCallback((name: string, fn: () => void) => {
        if (process.env.NODE_ENV === "development") {
            const start = performance.now();
            fn();
            const end = performance.now();
            console.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);
        } else {
            fn();
        }
    }, []);

    // Batch DOM updates
    const batchUpdates = useCallback((updates: (() => void)[]) => {
        // Use requestAnimationFrame to batch DOM updates
        requestAnimationFrame(() => {
            updates.forEach((update) => update());
        });
    }, []);

    return {
        debounce,
        throttle,
        optimizeCommentList,
        createIntersectionObserver,
        observe,
        unobserve,
        calculateVirtualScrolling,
        cleanupUnusedData,
        measurePerformance,
        batchUpdates,
    };
}

// Performance monitoring utilities
export class PerformanceMonitor {
    private static metrics: Map<string, number[]> = new Map();

    static startTimer(label: string): () => void {
        const start = performance.now();

        return () => {
            const duration = performance.now() - start;

            if (!this.metrics.has(label)) {
                this.metrics.set(label, []);
            }

            this.metrics.get(label)!.push(duration);

            if (process.env.NODE_ENV === "development") {
                console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
            }
        };
    }

    static getAverageTime(label: string): number {
        const times = this.metrics.get(label) || [];
        if (times.length === 0) return 0;

        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    static getMetrics(): Record<
        string,
        { average: number; count: number; latest: number }
    > {
        const result: Record<
            string,
            { average: number; count: number; latest: number }
        > = {};

        this.metrics.forEach((times, label) => {
            result[label] = {
                average: this.getAverageTime(label),
                count: times.length,
                latest: times[times.length - 1] || 0,
            };
        });

        return result;
    }

    static reset(label?: string): void {
        if (label) {
            this.metrics.delete(label);
        } else {
            this.metrics.clear();
        }
    }
}

export default usePerformanceOptimization;
