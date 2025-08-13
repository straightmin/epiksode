/**
 * API Response Types - Enhanced with PR #3 Feedback
 *
 * This file defines specific API response types based on actual backend responses
 * to fix the `response.comments` vs `response.data` issue identified in PR #3
 */

import { CommentDetail, PaginationMeta } from "./index";

// =============================================================================
// 📝 Comments API Response Types (PR #3 Fix)
// =============================================================================

/** Comment List API Response Structure - Based on actual backend response */
export interface CommentApiResponse {
    success: boolean;
    message: string;
    data: {
        data: CommentDetail[]; // ✅ Fixed: response.data.data instead of response.comments
        pagination: PaginationMeta;
    };
}

/** Single Comment Creation Response */
export interface CommentCreateResponse {
    success: boolean;
    message: string;
    data: CommentDetail;
}

/** Comment Deletion Response */
export interface CommentDeleteResponse {
    success: boolean;
    message: string;
}

// =============================================================================
// 🔧 Generic API Response Wrapper Types
// =============================================================================

/** Generic paginated response wrapper */
export interface PaginatedApiResponse<T> {
    success: boolean;
    message: string;
    data: {
        data: T[];
        pagination: PaginationMeta;
    };
}

/** Generic single item response wrapper */
export interface SingleItemApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/** Generic operation response (for create/update/delete) */
export interface OperationApiResponse {
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
}

// =============================================================================
// 🛡️ Type Guards for API Responses
// =============================================================================

/** Type guard for comment API response */
export function isCommentApiResponse(
    value: unknown
): value is CommentApiResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as CommentApiResponse).success === "boolean" &&
        typeof (value as CommentApiResponse).message === "string" &&
        typeof (value as CommentApiResponse).data === "object" &&
        (value as CommentApiResponse).data !== null &&
        Array.isArray((value as CommentApiResponse).data.data)
    );
}

/** Type guard for paginated response */
export function isPaginatedApiResponse<T>(
    value: unknown
): value is PaginatedApiResponse<T> {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof (value as PaginatedApiResponse<T>).success === "boolean" &&
        typeof (value as PaginatedApiResponse<T>).data === "object" &&
        (value as PaginatedApiResponse<T>).data !== null &&
        Array.isArray((value as PaginatedApiResponse<T>).data.data) &&
        typeof (value as PaginatedApiResponse<T>).data.pagination === "object"
    );
}

// =============================================================================
// 📤 Photo API Response Types
// =============================================================================

import { PhotoDetail } from "./index";

/** Photo List API Response */
export interface PhotoApiResponse {
    success: boolean;
    message: string;
    data: {
        data: PhotoDetail[];
        pagination: PaginationMeta;
    };
}

// =============================================================================
// 🔐 Auth API Response Types
// =============================================================================

import { LoginResponse, User } from "./index";

/** Login API Response */
export interface LoginApiResponse {
    success: boolean;
    message: string;
    data: LoginResponse;
}

/** User Profile API Response */
export interface UserApiResponse {
    success: boolean;
    message: string;
    data: User;
}

// =============================================================================
// ❤️ Like API Response Types
// =============================================================================

import { ToggleLikeResponse } from "./index";

/** Like Toggle API Response */
export interface LikeApiResponse {
    success: boolean;
    message: string;
    data: ToggleLikeResponse;
}

// =============================================================================
// 🔧 Response Processing Utilities
// =============================================================================

/** Extract data from API response with proper error handling */
export function extractResponseData<T>(response: unknown): T {
    if (!response || typeof response !== "object") {
        throw new Error("Invalid API response format");
    }

    const apiResponse = response as {
        success?: boolean;
        data?: T;
        message?: string;
    };

    if (!apiResponse.success) {
        throw new Error(apiResponse.message || "API request failed");
    }

    if (!apiResponse.data) {
        throw new Error("No data in API response");
    }

    return apiResponse.data;
}

/** Extract paginated data with fallback to empty array */
export function extractPaginatedData<T>(response: unknown): {
    data: T[];
    pagination: PaginationMeta;
} {
    try {
        const extracted = extractResponseData<{
            data: T[];
            pagination: PaginationMeta;
        }>(response);
        return {
            data: extracted.data || [],
            pagination: extracted.pagination || {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            },
        };
    } catch (error) {
        console.warn(
            "Failed to extract paginated data, returning empty result:",
            error
        );
        return {
            data: [],
            pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            },
        };
    }
}

/** Extract comment list with proper fallback handling (PR #3 Fix) */
export function extractCommentList(response: unknown): CommentDetail[] {
    try {
        if (isPaginatedApiResponse<CommentDetail>(response)) {
            return response.data.data || [];
        }

        // Legacy support for direct array responses
        if (Array.isArray(response)) {
            return response as CommentDetail[];
        }

        // Fallback to empty array
        console.warn("Unexpected comment response format, using empty array");
        return [];
    } catch (error) {
        console.error("Error extracting comment list:", error);
        return [];
    }
}
