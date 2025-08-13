/**
 * Security utilities for comment system
 * Provides input sanitization, XSS prevention, and content validation
 */

// =============================================================================
// 🛡️ Input Sanitization
// =============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") {
        return "";
    }

    return (
        input
            // Remove HTML tags
            .replace(/<[^>]*>/g, "")
            // Escape special characters
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;")
            // Remove script-related content
            .replace(/javascript:/gi, "")
            .replace(/on\w+\s*=/gi, "")
            // Trim whitespace
            .trim()
    );
}

/**
 * Sanitize comment content with preservation of line breaks
 */
export function sanitizeCommentContent(content: string): string {
    if (!content || typeof content !== "string") {
        return "";
    }

    // First sanitize basic input
    let sanitized = sanitizeInput(content);

    // Preserve line breaks but limit consecutive line breaks
    sanitized = sanitized
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\n{3,}/g, "\n\n");

    return sanitized;
}

// =============================================================================
// 🔍 Content Validation
// =============================================================================

/**
 * Validate comment content
 */
export function validateCommentContent(content: string): {
    isValid: boolean;
    errors: string[];
    sanitized: string;
} {
    const errors: string[] = [];
    const sanitized = sanitizeCommentContent(content);

    // Check if empty after sanitization
    if (!sanitized.trim()) {
        errors.push("Comment content cannot be empty");
    }

    // Check length limits
    if (sanitized.length > 500) {
        errors.push("Comment cannot exceed 500 characters");
    }

    if (sanitized.length < 1) {
        errors.push("Comment must be at least 1 character long");
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        /data:\s*text\/html/i,
        /vbscript:/i,
        /livescript:/i,
        /mocha:/i,
        /charset\s*=/i,
        /document\.(cookie|write|domain)/i,
        /window\.(location|open)/i,
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
            errors.push("Content contains potentially unsafe elements");
            break;
        }
    }

    // Check for excessive repetition (spam detection)
    const repetitionPattern = /(.{3,}?)\1{4,}/;
    if (repetitionPattern.test(sanitized)) {
        errors.push(
            "Content appears to be spam (excessive repetition detected)"
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized,
    };
}

/**
 * Validate user input for potential security threats
 */
export function validateUserInput(
    input: string,
    type: "comment" | "username" | "email" = "comment"
): {
    isValid: boolean;
    errors: string[];
    sanitized: string;
} {
    switch (type) {
        case "comment":
            return validateCommentContent(input);

        case "username":
            return validateUsername(input);

        case "email":
            return validateEmail(input);

        default:
            return validateCommentContent(input);
    }
}

/**
 * Validate username
 */
function validateUsername(username: string): {
    isValid: boolean;
    errors: string[];
    sanitized: string;
} {
    const errors: string[] = [];
    const sanitized = sanitizeInput(username);

    if (!sanitized.trim()) {
        errors.push("Username cannot be empty");
    }

    if (sanitized.length < 3) {
        errors.push("Username must be at least 3 characters long");
    }

    if (sanitized.length > 20) {
        errors.push("Username cannot exceed 20 characters");
    }

    // Only allow alphanumeric characters, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
        errors.push(
            "Username can only contain letters, numbers, underscores, and hyphens"
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized,
    };
}

/**
 * Validate email address
 */
function validateEmail(email: string): {
    isValid: boolean;
    errors: string[];
    sanitized: string;
} {
    const errors: string[] = [];
    const sanitized = sanitizeInput(email).toLowerCase();

    if (!sanitized.trim()) {
        errors.push("Email cannot be empty");
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(sanitized)) {
        errors.push("Invalid email format");
    }

    // Check for maximum length
    if (sanitized.length > 254) {
        errors.push("Email address is too long");
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized,
    };
}

// =============================================================================
// 🚫 Rate Limiting
// =============================================================================

class RateLimiter {
    private attempts: Map<string, { count: number; resetTime: number }> =
        new Map();
    private maxAttempts: number;
    private windowMs: number;

    constructor(maxAttempts: number = 5, windowMs: number = 60000) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }

    /**
     * Check if action is allowed for the given key
     */
    isAllowed(key: string): boolean {
        const now = Date.now();
        const record = this.attempts.get(key);

        if (!record || now > record.resetTime) {
            // Reset or create new record
            this.attempts.set(key, {
                count: 1,
                resetTime: now + this.windowMs,
            });
            return true;
        }

        if (record.count < this.maxAttempts) {
            record.count++;
            return true;
        }

        return false;
    }

    /**
     * Get remaining attempts for a key
     */
    getRemainingAttempts(key: string): number {
        const record = this.attempts.get(key);
        if (!record || Date.now() > record.resetTime) {
            return this.maxAttempts;
        }
        return Math.max(0, this.maxAttempts - record.count);
    }

    /**
     * Get time until reset (in milliseconds)
     */
    getResetTime(key: string): number {
        const record = this.attempts.get(key);
        if (!record || Date.now() > record.resetTime) {
            return 0;
        }
        return Math.max(0, record.resetTime - Date.now());
    }

    /**
     * Reset attempts for a key
     */
    reset(key: string): void {
        this.attempts.delete(key);
    }

    /**
     * Clear all attempts
     */
    clearAll(): void {
        this.attempts.clear();
    }
}

// Global rate limiters for different actions
export const commentRateLimiter = new RateLimiter(10, 60000); // 10 comments per minute
export const likeRateLimiter = new RateLimiter(50, 60000); // 50 likes per minute
export const replyRateLimiter = new RateLimiter(20, 60000); // 20 replies per minute

// =============================================================================
// 🔐 CSRF Protection
// =============================================================================

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
        ""
    );
}

/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken(token: string): void {
    if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("csrf_token", token);
    }
}

/**
 * Get stored CSRF token
 */
export function getCSRFToken(): string | null {
    if (typeof window !== "undefined" && window.sessionStorage) {
        return sessionStorage.getItem("csrf_token");
    }
    return null;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
    const storedToken = getCSRFToken();
    return storedToken === token && token.length === 64;
}

// =============================================================================
// 🛡️ Content Security Policy Helpers
// =============================================================================

/**
 * Check if URL is safe (prevent open redirects)
 */
export function isSafeURL(url: string): boolean {
    if (!url || typeof url !== "string") {
        return false;
    }

    try {
        const parsedUrl = new URL(url);

        // Only allow HTTP and HTTPS protocols
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return false;
        }

        // Block potentially dangerous domains
        const dangerousDomains = [
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            "10.",
            "172.16.",
            "192.168.",
        ];

        for (const domain of dangerousDomains) {
            if (parsedUrl.hostname.startsWith(domain)) {
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitize URL for safe use
 */
export function sanitizeURL(url: string): string {
    if (!isSafeURL(url)) {
        return "#";
    }
    return url;
}

// =============================================================================
// 📊 Security Monitoring
// =============================================================================

export class SecurityMonitor {
    private static violations: Array<{
        type: string;
        description: string;
        timestamp: number;
        userAgent?: string;
        ip?: string;
    }> = [];

    static logViolation(
        type: string,
        description: string,
        metadata?: Record<string, unknown>
    ): void {
        this.violations.push({
            type,
            description,
            timestamp: Date.now(),
            userAgent:
                typeof navigator !== "undefined"
                    ? navigator.userAgent
                    : undefined,
            ...metadata,
        });

        // In production, send to security monitoring service
        if (process.env.NODE_ENV === "production") {
            console.warn("Security violation:", {
                type,
                description,
                metadata,
            });
        } else {
            console.log("Security violation (dev):", {
                type,
                description,
                metadata,
            });
        }
    }

    static getViolations(): typeof SecurityMonitor.violations {
        return [...this.violations];
    }

    static clearViolations(): void {
        this.violations = [];
    }
}

// =============================================================================
// 🚨 Security Utilities
// =============================================================================

/**
 * Detect potential security threats in content
 */
export function detectSecurityThreats(content: string): string[] {
    const threats: string[] = [];

    // XSS patterns
    const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<form/i,
        /expression\s*\(/i,
        /url\s*\(/i,
        /@import/i,
    ];

    for (const pattern of xssPatterns) {
        if (pattern.test(content)) {
            threats.push("Potential XSS attempt detected");
            break;
        }
    }

    // SQL injection patterns
    const sqlPatterns = [
        /union\s+select/i,
        /drop\s+table/i,
        /insert\s+into/i,
        /delete\s+from/i,
        /update\s+set/i,
        /exec\s*\(/i,
        /sp_\w+/i,
    ];

    for (const pattern of sqlPatterns) {
        if (pattern.test(content)) {
            threats.push("Potential SQL injection attempt detected");
            break;
        }
    }

    return threats;
}

/**
 * Get security headers for API requests
 */
export function getSecurityHeaders(): Record<string, string> {
    return {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    };
}
