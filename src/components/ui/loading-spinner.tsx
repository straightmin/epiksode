/**
 * LoadingSpinner - Reusable loading indicator with multiple variants
 */

'use client';

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'dots' | 'pulse' | 'bars';
    className?: string;
    color?: 'purple' | 'gray' | 'white';
}

/**
 * Animated loading spinner with multiple variants and sizes
 */
export function LoadingSpinner({ 
    size = 'md', 
    variant = 'default',
    className = '',
    color = 'purple'
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6', 
        lg: 'w-8 h-8'
    };

    const colorClasses = {
        purple: 'text-purple-600',
        gray: 'text-gray-400',
        white: 'text-white'
    };

    if (variant === 'dots') {
        return (
            <div className={`flex space-x-1 ${className}`}>
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`${sizeClasses[size]} bg-current rounded-full animate-bounce opacity-75`}
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.6s'
                        }}
                    />
                ))}
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
                <div className="w-full h-full bg-current rounded-full animate-pulse opacity-75" />
            </div>
        );
    }

    if (variant === 'bars') {
        return (
            <div className={`flex items-end space-x-1 ${className}`}>
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`w-1 bg-current rounded-full animate-pulse`}
                        style={{
                            height: `${12 + i * 2}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '1.2s'
                        }}
                    />
                ))}
            </div>
        );
    }

    // Default spinning circle
    return (
        <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
            <svg 
                className="animate-spin w-full h-full" 
                fill="none" 
                viewBox="0 0 24 24"
            >
                <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                />
                <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
}

export default LoadingSpinner;