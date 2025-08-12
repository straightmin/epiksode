/**
 * 확인 모달 컴포넌트
 * 
 * window.confirm 대신 사용하는 커스텀 확인 모달
 */

"use client";

import React from "react";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
    /** 모달 표시 여부 */
    isOpen: boolean;
    /** 제목 */
    title: string;
    /** 내용 메시지 */
    message: string;
    /** 확인 버튼 텍스트 */
    confirmText?: string;
    /** 취소 버튼 텍스트 */
    cancelText?: string;
    /** 확인 액션 타입 (기본: info, 위험한 액션: danger) */
    variant?: 'info' | 'danger';
    /** 확인 버튼 클릭 핸들러 */
    onConfirm: () => void;
    /** 취소 버튼 클릭 핸들러 */
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = "확인",
    cancelText = "취소",
    variant = 'info',
    onConfirm,
    onCancel
}) => {
    const { theme, isDark } = useThemeContext();

    if (!isOpen) return null;

    const isDangerVariant = variant === 'danger';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 백드롭 */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onCancel}
            />
            
            {/* 모달 */}
            <div
                className="relative w-full max-w-md mx-4 p-6 rounded-2xl shadow-xl"
                style={{
                    backgroundColor: isDark
                        ? theme.theme.colors.background.dark
                        : theme.theme.colors.background.main,
                }}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 rounded-full transition-all duration-200 hover:scale-110"
                    style={{
                        color: isDark
                            ? theme.theme.colors.primary.gray
                            : theme.theme.colors.primary.darkGray,
                    }}
                >
                    <X size={20} />
                </button>

                {/* 아이콘 영역 */}
                <div className="flex items-center justify-center mb-4">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                            backgroundColor: isDangerVariant
                                ? theme.theme.colors.accent.pink + '20'
                                : theme.theme.colors.primary.purpleVeryLight,
                        }}
                    >
                        <AlertTriangle
                            size={32}
                            style={{
                                color: isDangerVariant
                                    ? theme.theme.colors.accent.pink
                                    : theme.theme.colors.primary.purple,
                            }}
                        />
                    </div>
                </div>

                {/* 제목 */}
                <h3
                    className="text-xl font-bold text-center mb-2"
                    style={{
                        color: isDark
                            ? theme.theme.colors.primary.white
                            : theme.theme.colors.primary.black,
                    }}
                >
                    {title}
                </h3>

                {/* 메시지 */}
                <p
                    className="text-center mb-6 leading-relaxed"
                    style={{
                        color: isDark
                            ? theme.theme.colors.primary.gray
                            : theme.theme.colors.primary.darkGray,
                    }}
                >
                    {message}
                </p>

                {/* 버튼 영역 */}
                <div className="flex gap-3">
                    {/* 취소 버튼 */}
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 rounded-full font-medium border transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: isDark
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                            color: isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black,
                        }}
                    >
                        {cancelText}
                    </button>

                    {/* 확인 버튼 */}
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 rounded-full font-medium transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: isDangerVariant
                                ? theme.theme.colors.accent.pink
                                : theme.theme.colors.primary.purple,
                            color: theme.theme.colors.primary.white,
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * 확인 모달 훅
 * 
 * Promise 기반으로 확인/취소 결과를 반환하는 훅
 */
interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'info' | 'danger';
    resolver?: (result: boolean) => void;
}

export const useConfirmModal = () => {
    const [modalState, setModalState] = React.useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: ''
    });

    const confirm = React.useCallback((options: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        variant?: 'info' | 'danger';
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setModalState({
                ...options,
                isOpen: true,
                resolver: resolve
            });
        });
    }, []);

    const handleConfirm = React.useCallback(() => {
        modalState.resolver?.(true);
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, [modalState]);

    const handleCancel = React.useCallback(() => {
        modalState.resolver?.(false);
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, [modalState]);

    const modal = React.useMemo(() => (
        <ConfirmModal
            isOpen={modalState.isOpen}
            title={modalState.title}
            message={modalState.message}
            confirmText={modalState.confirmText}
            cancelText={modalState.cancelText}
            variant={modalState.variant}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    ), [modalState, handleConfirm, handleCancel]);

    return { confirm, modal };
};