/**
 * Toast - Notification component for user feedback
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
    onClose?: () => void;
    className?: string;
}

/**
 * Toast notification component with auto-dismiss and animations
 */
export function Toast({
    message,
    type = "info",
    duration = 4000,
    onClose,
    className = "",
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300); // Animation duration
    }, [onClose]);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, handleClose]);

    if (!isVisible) return null;

    const typeStyles = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    const iconStyles = {
        success: "text-green-500",
        error: "text-red-500",
        warning: "text-yellow-500",
        info: "text-blue-500",
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "error":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "warning":
                return (
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "info":
            default:
                return (
                    <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
        }
    };

    return (
        <div
            className={`
                fixed top-4 right-4 z-50 max-w-sm w-full
                transform transition-all duration-300 ease-in-out
                ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
                ${className}
            `}
        >
            <div
                className={`
                flex items-start p-4 border rounded-lg shadow-lg
                ${typeStyles[type]}
            `}
            >
                <div className={`flex-shrink-0 ${iconStyles[type]}`}>
                    {getIcon()}
                </div>

                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>

                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={handleClose}
                        className={`
                            inline-flex rounded-md p-1.5 
                            hover:bg-black hover:bg-opacity-10
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            transition-colors duration-200
                            ${iconStyles[type]}
                        `}
                    >
                        <span className="sr-only">닫기</span>
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Toast manager hook
export function useToast() {
    const [toasts, setToasts] = useState<
        Array<{
            id: string;
            message: string;
            type: ToastProps["type"];
            duration?: number;
        }>
    >([]);

    const addToast = (
        message: string,
        type: ToastProps["type"] = "info",
        duration?: number
    ) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const ToastContainer = () => (
        <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );

    return {
        addToast,
        removeToast,
        toasts,
        ToastContainer,
    };
}

export default Toast;
