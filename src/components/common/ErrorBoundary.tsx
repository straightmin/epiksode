/**
 * ErrorBoundary 컴포넌트
 *
 * React 에러 바운더리를 활용한 이미지 로딩 에러 처리
 * S3 프록시 관련 에러 포함 전체 애플리케이션 에러 처리
 */

"use client";

import React, { Component, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface ErrorInfo {
    componentStack: string;
    errorBoundary?: string;
    errorBoundaryStack?: string;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetKeys?: Array<string | number>;
    resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    eventId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private resetTimeoutId: number | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // 에러가 발생하면 hasError 상태를 true로 변경
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const eventId = Math.random().toString(36).substring(7);

        this.setState({
            errorInfo,
            eventId,
        });

        // 부모 컴포넌트에 에러 전달
        this.props.onError?.(error, errorInfo);

        // 개발 환경에서 에러 로깅
        if (process.env.NODE_ENV === "development") {
            console.group("🚨 ErrorBoundary 에러 감지");
            console.error("Error:", error);
            console.error("Error Info:", errorInfo);
            console.error("Component Stack:", errorInfo.componentStack);
            console.groupEnd();
        }

        // 이미지 관련 에러 특별 처리
        if (this.isImageError(error)) {
            console.warn("이미지 로딩 에러 감지:", error.message);
        }
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        const { resetKeys, resetOnPropsChange } = this.props;
        const { hasError } = this.state;

        if (hasError && prevProps.resetKeys !== resetKeys) {
            if (
                resetKeys?.some(
                    (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
                )
            ) {
                this.resetErrorBoundary();
            }
        }

        if (
            hasError &&
            resetOnPropsChange &&
            prevProps.children !== this.props.children
        ) {
            this.resetErrorBoundary();
        }
    }

    componentWillUnmount() {
        if (this.resetTimeoutId) {
            clearTimeout(this.resetTimeoutId);
        }
    }

    isImageError = (error: Error): boolean => {
        const imageErrorKeywords = [
            "image",
            "img",
            "이미지",
            "load",
            "로드",
            "fetch",
            "proxy",
            "thumbnail",
            "s3",
            "403",
            "404",
            "500",
        ];

        const errorMessage = error.message.toLowerCase();
        return imageErrorKeywords.some((keyword) =>
            errorMessage.includes(keyword)
        );
    };

    resetErrorBoundary = () => {
        if (this.resetTimeoutId) {
            clearTimeout(this.resetTimeoutId);
        }

        this.resetTimeoutId = window.setTimeout(() => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                eventId: null,
            });
        }, 100);
    };

    render() {
        const { hasError, error } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            // 커스텀 fallback이 제공된 경우
            if (fallback) {
                return fallback;
            }

            // 이미지 관련 에러인 경우 간단한 UI
            if (error && this.isImageError(error)) {
                return (
                    <div className="flex flex-col items-center justify-center p-4 min-h-[200px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 text-center mb-3">
                            이미지를 불러올 수 없습니다
                        </p>
                        <button
                            onClick={this.resetErrorBoundary}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCcw size={14} />
                            다시 시도
                        </button>
                    </div>
                );
            }

            // 일반적인 에러 UI
            return (
                <div className="flex flex-col items-center justify-center p-8 min-h-[400px] bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        문제가 발생했습니다
                    </h2>
                    <p className="text-sm text-red-600 text-center mb-4 max-w-md">
                        예상치 못한 오류가 발생했습니다. 잠시 후 다시
                        시도해주세요.
                    </p>

                    {/* 개발 환경에서만 에러 상세 정보 표시 */}
                    {process.env.NODE_ENV === "development" && error && (
                        <details className="w-full max-w-2xl mb-4">
                            <summary className="cursor-pointer text-sm text-red-700 hover:text-red-900">
                                에러 상세 정보 (개발 모드)
                            </summary>
                            <div className="mt-2 p-3 bg-red-100 rounded text-xs font-mono text-red-800 overflow-auto">
                                <div className="mb-2">
                                    <strong>에러:</strong> {error.name}:{" "}
                                    {error.message}
                                </div>
                                {error.stack && (
                                    <div>
                                        <strong>스택 트레이스:</strong>
                                        <pre className="whitespace-pre-wrap">
                                            {error.stack}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </details>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={this.resetErrorBoundary}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <RefreshCcw size={16} />
                            다시 시도
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                            페이지 새로고침
                        </button>
                    </div>
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;

// =============================================================================
// 🎣 편의 훅과 HOC
// =============================================================================

/**
 * 이미지 전용 ErrorBoundary 래퍼
 */
export const ImageErrorBoundary: React.FC<{
    children: ReactNode;
    photoId?: number;
    onError?: (error: Error) => void;
}> = ({ children, photoId, onError }) => (
    <ErrorBoundary
        fallback={
            <div className="flex flex-col items-center justify-center p-4 min-h-[150px] bg-gray-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">
                    이미지를 불러올 수 없습니다
                </p>
                {photoId && (
                    <p className="text-xs text-gray-400 mt-1">
                        Photo ID: {photoId}
                    </p>
                )}
            </div>
        }
        resetKeys={photoId ? [photoId] : []}
        onError={(error) => {
            console.warn(`이미지 에러 (Photo ID: ${photoId}):`, error);
            onError?.(error);
        }}
    >
        {children}
    </ErrorBoundary>
);

/**
 * ErrorBoundary와 함께 컴포넌트를 감싸는 HOC
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}
