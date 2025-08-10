"use client";

import { useState, useCallback } from "react";
import { useThemeContext, DarkModeToggle } from "../../frontend-theme-system/components/ThemeProvider";
import PhotoGrid from "../components/photos/PhotoGrid";
import PhotoModal from "../components/photos/PhotoModal";
import { usePhotos } from "../hooks/usePhotos";

export default function Home() {
    const { theme, isDark } = useThemeContext();
    
    // 사진 데이터 관리 훅
    const { 
        photos, 
        loading, 
        initialLoading, 
        hasMore, 
        error, 
        loadMore,
        toggleLike,
        clearError 
    } = usePhotos({
        limit: 10,
        sortBy: 'latest'
    });
    
    const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePhotoClick = useCallback((photoId: number) => {
        setSelectedPhotoId(photoId);
        setIsModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setSelectedPhotoId(null);
    }, []);

    const handleModalNext = useCallback(() => {
        if (!selectedPhotoId) return;
        const currentIndex = photos.findIndex(p => p.id === selectedPhotoId);
        const nextIndex = (currentIndex + 1) % photos.length;
        setSelectedPhotoId(photos[nextIndex].id);
    }, [selectedPhotoId, photos]);

    const handleModalPrevious = useCallback(() => {
        if (!selectedPhotoId) return;
        const currentIndex = photos.findIndex(p => p.id === selectedPhotoId);
        const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
        setSelectedPhotoId(photos[prevIndex].id);
    }, [selectedPhotoId, photos]);

    const handleFollow = useCallback((userId: number) => {
        // TODO: 팔로우 기능 구현 예정
        console.log('Follow user:', userId);
    }, []);

    return (
        <div 
            className="min-h-screen"
            style={{
                backgroundColor: isDark
                    ? theme.theme.colors.background.dark
                    : theme.theme.colors.background.main,
            }}
        >
            {/* Dark Mode Toggle (floating) */}
            <div className="fixed top-20 right-4 z-40 lg:top-24 lg:right-8">
                <DarkModeToggle />
            </div>

            {/* Main Feed Content */}
            <div className="max-w-screen-xl mx-auto">
                {error && (
                    <div className="m-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span>{error}</span>
                            <button 
                                onClick={clearError}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
                
                {initialLoading || (photos.length === 0 && loading) ? (
                    <div className="flex justify-center py-12">
                        <div 
                            className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
                            style={{
                                borderColor: theme.theme.colors.primary.purple,
                                borderTopColor: "transparent",
                            }}
                        />
                    </div>
                ) : (
                    <PhotoGrid
                        photos={photos}
                        onLike={toggleLike}
                        onPhotoClick={handlePhotoClick}
                        onLoadMore={loadMore}
                        hasMore={hasMore}
                        loading={loading}
                    />
                )}
            </div>

            {/* Status Badge */}
            <div
                className="fixed bottom-4 left-4 px-3 py-2 rounded-full text-xs font-medium lg:bottom-8 lg:left-8 lg:text-sm"
                style={{
                    backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                    color: theme.theme.colors.primary.purple,
                }}
            >
                개발 중 🚧
            </div>

            {/* Photo Modal */}
            {selectedPhotoId && (() => {
                const selectedPhoto = photos.find(p => p.id === selectedPhotoId);
                
                // 사진을 찾지 못한 경우 안전하게 처리
                if (!selectedPhoto) {
                    console.warn(`Photo with id ${selectedPhotoId} not found`);
                    return null;
                }
                
                const currentIndex = photos.findIndex(p => p.id === selectedPhotoId);
                
                return (
                    <PhotoModal
                        photo={selectedPhoto}
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        onNext={handleModalNext}
                        onPrevious={handleModalPrevious}
                        hasNext={currentIndex < photos.length - 1}
                        hasPrevious={currentIndex > 0}
                        onLike={toggleLike}
                        onFollow={handleFollow}
                    />
                );
            })()}
        </div>
    );
}