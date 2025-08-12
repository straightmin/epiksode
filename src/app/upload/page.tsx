"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

interface UploadFile {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    title: string;
    description: string;
}

export default function UploadPage() {
    const { theme, isDark } = useThemeContext();
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // 인증 체크
    React.useEffect(() => {
        if (!isAuthenticated) {
            toast.error('사진을 업로드하려면 로그인해주세요.');
            router.push('/');
        }
    }, [isAuthenticated, router]);

    // 파일 업로드 처리
    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;

        const newFiles: UploadFile[] = [];
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const id = `file-${uploadFiles.length + newFiles.length}-${Math.random().toString(36).substring(7)}`;
                const preview = URL.createObjectURL(file);
                
                newFiles.push({
                    id,
                    file,
                    preview,
                    progress: 0,
                    status: 'uploading',
                    title: file.name.replace(/\.[^/.]+$/, ""), // 확장자 제거
                    description: '',
                });
            }
        });

        setUploadFiles(prev => [...prev, ...newFiles]);

        // 실제 업로드 시작
        newFiles.forEach(uploadFile => {
            uploadPhoto(uploadFile.id);
        });
    }, [uploadFiles.length]);

    // 실제 사진 업로드 함수
    const uploadPhoto = useCallback(async (fileId: string) => {
        const uploadFile = uploadFiles.find(f => f.id === fileId);
        if (!uploadFile) return;
        
        try {
            // FormData 생성
            const formData = new FormData();
            formData.append('photo', uploadFile.file);
            formData.append('title', uploadFile.title);
            if (uploadFile.description) {
                formData.append('description', uploadFile.description);
            }
            
            // 업로드 시작
            const response = await apiClient.uploadPhoto(formData, {
                onProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadFiles(prev => 
                            prev.map(file => 
                                file.id === fileId 
                                    ? { ...file, progress, status: progress >= 100 ? 'completed' : 'uploading' }
                                    : file
                            )
                        );
                    }
                }
            });
            
            // 업로드 완료
            setUploadFiles(prev => 
                prev.map(file => 
                    file.id === fileId 
                        ? { ...file, progress: 100, status: 'completed' }
                        : file
                )
            );
            
            console.log('업로드 성공:', response);
            
        } catch (error) {
            console.error('업로드 실패:', error);
            const errorMessage = getErrorMessage(error);
            
            // 에러 상태로 업데이트
            setUploadFiles(prev => 
                prev.map(file => 
                    file.id === fileId 
                        ? { ...file, status: 'error' }
                        : file
                )
            );
            
            toast.error(`${uploadFile.title} 업로드 실패: ${errorMessage}`);
        }
    }, [uploadFiles]);

    // 드래그 앤 드롭 핸들러
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    }, [handleFiles]);

    // 파일 선택 핸들러
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    }, [handleFiles]);

    // 파일 제거
    const removeFile = useCallback((fileId: string) => {
        setUploadFiles(prev => {
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove) {
                // 업로드 중인 파일인 경우 확인
                if (fileToRemove.status === 'uploading') {
                    if (!confirm('업로드가 진행 중입니다. 정말로 제거하시겠습니까?')) {
                        return prev; // 취소하면 기존 상태 유지
                    }
                }
                
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== fileId);
        });
    }, []);

    // 메타데이터 업데이트
    const updateFileMetadata = useCallback((fileId: string, field: 'title' | 'description', value: string) => {
        setUploadFiles(prev => 
            prev.map(file => 
                file.id === fileId ? { ...file, [field]: value } : file
            )
        );
    }, []);

    // 업로드 완료된 사진들을 확인하고 홈으로 이동
    const publishPhotos = useCallback(async () => {
        const completedFiles = uploadFiles.filter(file => file.status === 'completed');
        
        if (completedFiles.length === 0) {
            toast.error('업로드가 완료된 사진이 없습니다.');
            return;
        }
        
        try {
            setIsPublishing(true);
            
            // 모든 사진이 업로드 완료되었으니 홈으로 이동
            
            // 파일 미리보기 URL 정리
            completedFiles.forEach(file => {
                URL.revokeObjectURL(file.preview);
            });
            
            // 성공 메시지 표시
            toast.success(`${completedFiles.length}개의 사진이 성공적으로 업로드되었습니다!`);
            
            // 홈으로 이동
            router.push('/');
            
        } catch (error) {
            console.error('게시 오류:', error);
            toast.error('사진 게시 중 오류가 발생했습니다.');
        } finally {
            setIsPublishing(false);
        }
    }, [uploadFiles, router]);

    const completedCount = uploadFiles.filter(f => f.status === 'completed').length;
    const errorCount = uploadFiles.filter(f => f.status === 'error').length;
    const uploadingCount = uploadFiles.filter(f => f.status === 'uploading').length;

    // 인증되지 않은 사용자는 로딩 화면 표시
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div 
                    className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
                    style={{
                        borderColor: theme.theme.colors.primary.purple,
                        borderTopColor: "transparent",
                    }}
                />
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen p-4 lg:p-8"
            style={{
                backgroundColor: isDark
                    ? theme.theme.colors.background.dark
                    : theme.theme.colors.background.main,
            }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 
                        className="text-3xl font-display font-bold mb-2"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black,
                        }}
                    >
                        사진 업로드
                    </h1>
                    <p
                        className="text-sm"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.gray
                                : theme.theme.colors.primary.darkGray,
                        }}
                    >
                        특별한 순간을 담은 에픽소드를 공유해보세요
                    </p>
                </div>

                {/* Upload Area */}
                <div
                    className={`
                        border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all duration-300
                        ${isDragOver ? 'border-opacity-100 scale-[1.02]' : 'border-opacity-50'}
                    `}
                    style={{
                        borderColor: isDragOver 
                            ? theme.theme.colors.primary.purple 
                            : isDark 
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                        backgroundColor: isDragOver 
                            ? theme.theme.colors.primary.purpleVeryLight + '20' 
                            : 'transparent',
                    }}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="mb-4">
                        <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                            }}
                        >
                            <Upload
                                size={32}
                                style={{ color: theme.theme.colors.primary.purple }}
                            />
                        </div>
                        
                        <h3 
                            className="text-xl font-bold mb-2"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        >
                            Drag & Drop
                        </h3>
                        <p 
                            className="text-sm mb-4"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.gray
                                    : theme.theme.colors.primary.darkGray,
                            }}
                        >
                            사진을 여기로 끌어다 놓으세요
                        </p>
                        
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-3 rounded-full font-medium transition-all duration-300 hover:transform hover:scale-105"
                            style={{
                                backgroundColor: theme.theme.colors.primary.purple,
                                color: theme.theme.colors.primary.white,
                            }}
                        >
                            파일 선택하기
                        </button>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                    
                    <div 
                        className="text-xs"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.gray
                                : theme.theme.colors.primary.darkGray,
                        }}
                    >
                        JPG, PNG, GIF 파일 지원 • 최대 10MB
                    </div>
                </div>

                {/* Upload Progress & Files */}
                {uploadFiles.length > 0 && (
                    <div className="space-y-6">
                        {/* Progress Summary */}
                        <div 
                            className="p-4 rounded-lg border"
                            style={{
                                backgroundColor: isDark
                                    ? theme.theme.colors.background.dark
                                    : theme.theme.colors.background.main,
                                borderColor: isDark
                                    ? theme.theme.colors.primary.darkGray
                                    : theme.theme.colors.primary.purpleVeryLight,
                            }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span 
                                    className="font-medium"
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.white
                                            : theme.theme.colors.primary.black,
                                    }}
                                >
                                    업로드 진행상황
                                </span>
                                <div className="text-sm space-y-1">
                                    <div
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        완료: {completedCount} / {uploadFiles.length}
                                    </div>
                                    {uploadingCount > 0 && (
                                        <div
                                            style={{
                                                color: theme.theme.colors.primary.purple,
                                            }}
                                        >
                                            업로드 중: {uploadingCount}개
                                        </div>
                                    )}
                                    {errorCount > 0 && (
                                        <div
                                            style={{
                                                color: theme.theme.colors.accent.pink,
                                            }}
                                        >
                                            오류: {errorCount}개
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {completedCount === uploadFiles.length && uploadFiles.length > 0 && (
                                <button
                                    onClick={publishPhotos}
                                    disabled={isPublishing}
                                    className="w-full py-3 rounded-lg font-bold transition-all duration-300 hover:transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: theme.theme.colors.primary.purple,
                                        color: theme.theme.colors.primary.white,
                                    }}
                                >
                                    {isPublishing ? (
                                        <>
                                            <div 
                                                className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full"
                                                style={{
                                                    borderColor: 'currentColor',
                                                    borderTopColor: 'transparent',
                                                }}
                                            />
                                            홈으로 이동 중...
                                        </>
                                    ) : (
                                        `${completedCount}개 사진 완료 → 홈으로 이동`
                                    )}
                                </button>
                            )}
                        </div>

                        {/* File List */}
                        <div className="grid gap-4">
                            {uploadFiles.map((uploadFile) => (
                                <div
                                    key={uploadFile.id}
                                    className="flex items-start gap-4 p-4 rounded-lg border"
                                    style={{
                                        backgroundColor: isDark
                                            ? theme.theme.colors.background.dark
                                            : theme.theme.colors.background.main,
                                        borderColor: isDark
                                            ? theme.theme.colors.primary.darkGray
                                            : theme.theme.colors.primary.purpleVeryLight,
                                    }}
                                >
                                    {/* Image Preview */}
                                    <div className="relative flex-shrink-0">
                                        <Image
                                            src={uploadFile.preview}
                                            alt="Preview"
                                            width={80}
                                            height={80}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        
                                        {/* Status Icon */}
                                        <div className="absolute -top-1 -right-1">
                                            {uploadFile.status === 'completed' && (
                                                <CheckCircle
                                                    size={16}
                                                    style={{ color: theme.theme.colors.accent.green }}
                                                />
                                            )}
                                            {uploadFile.status === 'uploading' && (
                                                <div
                                                    className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full"
                                                    style={{
                                                        borderColor: theme.theme.colors.primary.purple,
                                                        borderTopColor: "transparent",
                                                    }}
                                                />
                                            )}
                                            {uploadFile.status === 'error' && (
                                                <AlertCircle
                                                    size={16}
                                                    style={{ color: theme.theme.colors.accent.pink }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* File Info & Progress */}
                                    <div className="flex-1 min-w-0">
                                        {/* Progress Bar */}
                                        {uploadFile.status === 'uploading' && (
                                            <div className="mb-2">
                                                <div 
                                                    className="h-1 rounded-full overflow-hidden"
                                                    style={{
                                                        backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                                                    }}
                                                >
                                                    <div
                                                        className="h-full transition-all duration-300"
                                                        style={{
                                                            width: `${uploadFile.progress}%`,
                                                            backgroundColor: theme.theme.colors.primary.purple,
                                                        }}
                                                    />
                                                </div>
                                                <div 
                                                    className="text-xs mt-1"
                                                    style={{
                                                        color: isDark
                                                            ? theme.theme.colors.primary.gray
                                                            : theme.theme.colors.primary.darkGray,
                                                    }}
                                                >
                                                    {Math.round(uploadFile.progress)}% 완료
                                                </div>
                                            </div>
                                        )}

                                        {/* Metadata Input */}
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="사진 제목"
                                                value={uploadFile.title}
                                                onChange={(e) => updateFileMetadata(uploadFile.id, 'title', e.target.value)}
                                                className="w-full px-3 py-2 rounded border text-sm"
                                                style={{
                                                    backgroundColor: isDark
                                                        ? theme.theme.colors.background.dark
                                                        : theme.theme.colors.background.main,
                                                    borderColor: isDark
                                                        ? theme.theme.colors.primary.darkGray
                                                        : theme.theme.colors.primary.purpleVeryLight,
                                                    color: isDark
                                                        ? theme.theme.colors.primary.white
                                                        : theme.theme.colors.primary.black,
                                                }}
                                            />
                                            <textarea
                                                placeholder="사진 설명 (선택사항)"
                                                value={uploadFile.description}
                                                onChange={(e) => updateFileMetadata(uploadFile.id, 'description', e.target.value)}
                                                className="w-full px-3 py-2 rounded border text-sm resize-none"
                                                rows={2}
                                                style={{
                                                    backgroundColor: isDark
                                                        ? theme.theme.colors.background.dark
                                                        : theme.theme.colors.background.main,
                                                    borderColor: isDark
                                                        ? theme.theme.colors.primary.darkGray
                                                        : theme.theme.colors.primary.purpleVeryLight,
                                                    color: isDark
                                                        ? theme.theme.colors.primary.white
                                                        : theme.theme.colors.primary.black,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFile(uploadFile.id)}
                                        className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}