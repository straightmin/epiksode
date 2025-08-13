/**
 * Analytics and monitoring utilities for comment system
 * Tracks user interactions, performance metrics, and system health
 */

// =============================================================================
// 📊 Event Tracking
// =============================================================================

export interface AnalyticsEvent {
    name: string;
    properties: Record<string, unknown>;
    userId?: number;
    sessionId: string;
    timestamp: number;
    context?: {
        url: string;
        userAgent: string;
        viewport: { width: number; height: number };
        referrer?: string;
    };
}

class AnalyticsTracker {
    private events: AnalyticsEvent[] = [];
    private sessionId: string;
    private userId?: number;

    constructor() {
        this.sessionId = this.generateSessionId();
        this.setupAutoTracking();
    }

    private generateSessionId(): string {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private getContext() {
        return {
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            referrer: document.referrer,
        };
    }

    setUserId(userId: number): void {
        this.userId = userId;
    }

    track(eventName: string, properties: Record<string, unknown> = {}): void {
        const event: AnalyticsEvent = {
            name: eventName,
            properties,
            userId: this.userId,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            context: this.getContext(),
        };

        this.events.push(event);

        // Send to analytics service in production
        if (process.env.NODE_ENV === "production") {
            this.sendToAnalytics(event);
        } else {
            console.log("Analytics Event:", event);
        }
    }

    private async sendToAnalytics(event: AnalyticsEvent): Promise<void> {
        try {
            // Replace with actual analytics service endpoint
            await fetch("/api/analytics", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(event),
            });
        } catch (error) {
            console.warn("Failed to send analytics event:", error);
        }
    }

    private setupAutoTracking(): void {
        // Track page views
        window.addEventListener("beforeunload", () => {
            const sessionDuration =
                Date.now() - parseInt(this.sessionId.split("-")[1]);
            this.track("session_end", { duration: sessionDuration });
        });

        // Track errors
        window.addEventListener("error", (event) => {
            this.track("javascript_error", {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
            });
        });

        // Track unhandled promise rejections
        window.addEventListener("unhandledrejection", (event) => {
            this.track("unhandled_rejection", {
                reason: event.reason?.toString(),
                stack: event.reason?.stack,
            });
        });
    }

    getEvents(): AnalyticsEvent[] {
        return [...this.events];
    }

    clearEvents(): void {
        this.events = [];
    }
}

// Global analytics instance
export const analytics = new AnalyticsTracker();

// =============================================================================
// 💬 Comment Analytics
// =============================================================================

export class CommentAnalytics {
    static trackCommentView(
        commentId: number,
        photoId?: number,
        seriesId?: number
    ): void {
        analytics.track("comment_viewed", {
            commentId,
            photoId,
            seriesId,
            viewType: photoId ? "photo" : "series",
        });
    }

    static trackCommentCreate(
        commentId: number,
        photoId?: number,
        seriesId?: number,
        isReply: boolean = false
    ): void {
        analytics.track("comment_created", {
            commentId,
            photoId,
            seriesId,
            isReply,
            contentType: photoId ? "photo" : "series",
        });
    }

    static trackCommentLike(commentId: number, isLiked: boolean): void {
        analytics.track("comment_like_toggle", {
            commentId,
            action: isLiked ? "like" : "unlike",
        });
    }

    static trackCommentDelete(commentId: number): void {
        analytics.track("comment_deleted", {
            commentId,
        });
    }

    static trackCommentError(
        error: string,
        operation: string,
        commentId?: number
    ): void {
        analytics.track("comment_error", {
            error,
            operation,
            commentId,
        });
    }

    static trackCommentListLoad(
        photoId?: number,
        seriesId?: number,
        count: number = 0,
        loadTime: number = 0
    ): void {
        analytics.track("comment_list_loaded", {
            photoId,
            seriesId,
            commentCount: count,
            loadTimeMs: loadTime,
        });
    }

    static trackCommentFormInteraction(
        action: "focus" | "blur" | "submit" | "cancel",
        contentLength: number = 0
    ): void {
        analytics.track("comment_form_interaction", {
            action,
            contentLength,
        });
    }
}

// =============================================================================
// 📈 Performance Monitoring
// =============================================================================

export class PerformanceMonitor {
    private static metrics: Map<string, number[]> = new Map();
    private static observers: Map<string, PerformanceObserver> = new Map();

    static startMeasurement(name: string): () => void {
        const start = performance.now();

        return () => {
            const duration = performance.now() - start;
            this.recordMetric(name, duration);

            // Track in analytics
            analytics.track("performance_measurement", {
                metricName: name,
                duration,
                category: "performance",
            });
        };
    }

    static recordMetric(name: string, value: number): void {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const values = this.metrics.get(name)!;
        values.push(value);

        // Keep only last 100 measurements
        if (values.length > 100) {
            values.shift();
        }
    }

    static getMetrics(): Record<
        string,
        { avg: number; min: number; max: number; count: number }
    > {
        const result: Record<
            string,
            { avg: number; min: number; max: number; count: number }
        > = {};

        this.metrics.forEach((values, name) => {
            if (values.length > 0) {
                result[name] = {
                    avg:
                        values.reduce((sum, val) => sum + val, 0) /
                        values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    count: values.length,
                };
            }
        });

        return result;
    }

    static trackWebVitals(): void {
        // Core Web Vitals tracking
        if ("PerformanceObserver" in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lcp = entries[entries.length - 1];

                analytics.track("web_vital_lcp", {
                    value: lcp.startTime,
                    threshold:
                        lcp.startTime > 2500
                            ? "poor"
                            : lcp.startTime > 1000
                              ? "needs_improvement"
                              : "good",
                });
            });
            lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    analytics.track("web_vital_fid", {
                        value: entry.processingStart - entry.startTime,
                        threshold:
                            entry.processingStart - entry.startTime > 300
                                ? "poor"
                                : entry.processingStart - entry.startTime > 100
                                  ? "needs_improvement"
                                  : "good",
                    });
                });
            });
            fidObserver.observe({ entryTypes: ["first-input"] });

            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                let clsValue = 0;

                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });

                analytics.track("web_vital_cls", {
                    value: clsValue,
                    threshold:
                        clsValue > 0.25
                            ? "poor"
                            : clsValue > 0.1
                              ? "needs_improvement"
                              : "good",
                });
            });
            clsObserver.observe({ entryTypes: ["layout-shift"] });
        }
    }

    static trackResourceTiming(): void {
        if ("PerformanceObserver" in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();

                entries.forEach((entry) => {
                    if (entry.name.includes("api/")) {
                        analytics.track("api_performance", {
                            url: entry.name,
                            duration: entry.responseEnd - entry.requestStart,
                            size: (entry as PerformanceResourceTiming)
                                .transferSize,
                        });
                    }
                });
            });

            observer.observe({ entryTypes: ["resource"] });
        }
    }

    static cleanup(): void {
        this.observers.forEach((observer) => observer.disconnect());
        this.observers.clear();
        this.metrics.clear();
    }
}

// =============================================================================
// 🚨 Error Tracking
// =============================================================================

export class ErrorTracker {
    private static errors: Array<{
        message: string;
        stack?: string;
        timestamp: number;
        userId?: number;
        context: Record<string, unknown>;
    }> = [];

    static trackError(
        error: Error,
        context: Record<string, unknown> = {}
    ): void {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            userId: analytics["userId"],
            context: {
                ...context,
                userAgent: navigator.userAgent,
                url: window.location.href,
            },
        };

        this.errors.push(errorInfo);

        // Track in analytics
        analytics.track("application_error", {
            error: error.message,
            stack: error.stack,
            ...context,
        });

        // Log to console in development
        if (process.env.NODE_ENV === "development") {
            console.error("Tracked Error:", errorInfo);
        }
    }

    static trackCommentError(
        operation: string,
        error: Error,
        commentId?: number
    ): void {
        this.trackError(error, {
            operation,
            commentId,
            component: "comment_system",
        });
    }

    static getErrors(): typeof ErrorTracker.errors {
        return [...this.errors];
    }

    static clearErrors(): void {
        this.errors = [];
    }
}

// =============================================================================
// 📱 User Behavior Analytics
// =============================================================================

export class UserBehaviorAnalytics {
    private static scrollDepth = 0;
    private static timeOnPage = Date.now();

    static trackUserEngagement(): void {
        // Track scroll depth
        const updateScrollDepth = () => {
            const scrollPercent = Math.round(
                (window.scrollY /
                    (document.body.scrollHeight - window.innerHeight)) *
                    100
            );

            if (scrollPercent > this.scrollDepth) {
                this.scrollDepth = scrollPercent;

                // Track milestones
                if (scrollPercent >= 25 && scrollPercent < 50) {
                    analytics.track("scroll_depth", { depth: 25 });
                } else if (scrollPercent >= 50 && scrollPercent < 75) {
                    analytics.track("scroll_depth", { depth: 50 });
                } else if (scrollPercent >= 75 && scrollPercent < 100) {
                    analytics.track("scroll_depth", { depth: 75 });
                } else if (scrollPercent >= 100) {
                    analytics.track("scroll_depth", { depth: 100 });
                }
            }
        };

        window.addEventListener("scroll", updateScrollDepth, { passive: true });

        // Track time on page
        setInterval(() => {
            const timeSpent = Date.now() - this.timeOnPage;
            analytics.track("time_on_page", {
                duration: timeSpent,
                milestone: this.getTimeMilestone(timeSpent),
            });
        }, 30000); // Every 30 seconds
    }

    private static getTimeMilestone(duration: number): string {
        const minutes = duration / (1000 * 60);

        if (minutes < 1) return "0-1min";
        if (minutes < 5) return "1-5min";
        if (minutes < 15) return "5-15min";
        if (minutes < 30) return "15-30min";
        return "30min+";
    }

    static trackCommentInteraction(
        action: string,
        commentId: number,
        duration?: number
    ): void {
        analytics.track("comment_interaction", {
            action,
            commentId,
            duration,
            category: "engagement",
        });
    }
}

// =============================================================================
// 🎯 A/B Testing Framework
// =============================================================================

export class ABTestFramework {
    private static activeTests: Map<
        string,
        { variant: string; enrolled: boolean }
    > = new Map();

    static enrollInTest(testName: string, variants: string[]): string {
        // Simple hash-based assignment for consistent user experience
        const userId = analytics["userId"] || this.getAnonymousId();
        const hash = this.simpleHash(testName + userId);
        const variant = variants[hash % variants.length];

        this.activeTests.set(testName, { variant, enrolled: true });

        analytics.track("ab_test_enrollment", {
            testName,
            variant,
            userId,
        });

        return variant;
    }

    static getVariant(testName: string): string | null {
        const test = this.activeTests.get(testName);
        return test?.enrolled ? test.variant : null;
    }

    static trackConversion(
        testName: string,
        conversionType: string,
        value?: number
    ): void {
        const test = this.activeTests.get(testName);
        if (test?.enrolled) {
            analytics.track("ab_test_conversion", {
                testName,
                variant: test.variant,
                conversionType,
                value,
            });
        }
    }

    private static getAnonymousId(): string {
        let id = localStorage.getItem("anonymous_id");
        if (!id) {
            id =
                "anon-" +
                Date.now() +
                "-" +
                Math.random().toString(36).substr(2, 9);
            localStorage.setItem("anonymous_id", id);
        }
        return id;
    }

    private static simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
}

// =============================================================================
// 🎛️ Analytics Dashboard Data
// =============================================================================

export class AnalyticsDashboard {
    static getCommentMetrics(): {
        totalComments: number;
        commentsToday: number;
        avgCommentsPerPhoto: number;
        topCommenters: Array<{ userId: number; count: number }>;
    } {
        const events = analytics.getEvents();
        const commentEvents = events.filter((e) =>
            e.name.startsWith("comment_")
        );

        const today = new Date().setHours(0, 0, 0, 0);
        const commentsToday = commentEvents.filter(
            (e) => e.timestamp >= today
        ).length;

        // This would normally come from backend analytics
        return {
            totalComments: commentEvents.filter(
                (e) => e.name === "comment_created"
            ).length,
            commentsToday,
            avgCommentsPerPhoto: 0, // Would calculate from actual data
            topCommenters: [], // Would get from backend
        };
    }

    static getPerformanceMetrics(): {
        averageLoadTime: number;
        errorRate: number;
        webVitals: { lcp: number; fid: number; cls: number };
    } {
        const performanceMetrics = PerformanceMonitor.getMetrics();
        const errors = ErrorTracker.getErrors();
        const totalEvents = analytics.getEvents().length;

        return {
            averageLoadTime: performanceMetrics.comment_list_load?.avg || 0,
            errorRate:
                totalEvents > 0 ? (errors.length / totalEvents) * 100 : 0,
            webVitals: {
                lcp: 0, // Would get from actual measurements
                fid: 0,
                cls: 0,
            },
        };
    }

    static getUserEngagementMetrics(): {
        averageTimeOnPage: number;
        scrollDepth: number;
        interactionRate: number;
    } {
        const events = analytics.getEvents();
        const timeEvents = events.filter((e) => e.name === "time_on_page");
        const interactionEvents = events.filter(
            (e) => e.name === "comment_interaction"
        );

        const avgTime =
            timeEvents.length > 0
                ? timeEvents.reduce(
                      (sum, e) => sum + (e.properties.duration as number),
                      0
                  ) / timeEvents.length
                : 0;

        return {
            averageTimeOnPage: avgTime,
            scrollDepth: 0, // Would calculate from scroll events
            interactionRate:
                (interactionEvents.length / Math.max(events.length, 1)) * 100,
        };
    }
}

// Initialize analytics
if (typeof window !== "undefined") {
    PerformanceMonitor.trackWebVitals();
    PerformanceMonitor.trackResourceTiming();
    UserBehaviorAnalytics.trackUserEngagement();
}

export default analytics;
