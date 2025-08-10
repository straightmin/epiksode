"use client";

import { useState, useCallback } from "react";
import { useThemeContext, DarkModeToggle } from "../../frontend-theme-system/components/ThemeProvider";
import PhotoGrid from "../components/photos/PhotoGrid";

// 임시 목업 데이터
const mockPhotos = [
    {
        id: "1",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
        title: "산속의 아침",
        description: "새벽 안개가 피어오르는 산속에서 맞이한 평화로운 아침의 순간입니다.",
        photographer: { name: "김자연", avatar: "" },
        likes: 1247,
        comments: 23,
        isLiked: false,
        isBookmarked: false,
        isEpicMoment: true,
    },
    {
        id: "2",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=500&fit=crop",
        title: "도시의 야경",
        description: "번화가 네온사인이 만들어내는 환상적인 밤의 풍경",
        photographer: { name: "박도시", avatar: "" },
        likes: 892,
        comments: 41,
        isLiked: true,
        isBookmarked: false,
    },
    {
        id: "3",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=700&fit=crop",
        title: "숲속의 오솔길",
        description: "햇살이 스며드는 숲속 길을 따라 걸으며 찍은 사진",
        photographer: { name: "이숲길", avatar: "" },
        likes: 564,
        comments: 15,
        isLiked: false,
        isBookmarked: true,
    },
    {
        id: "4",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=450&fit=crop",
        title: "바다와 구름",
        description: "푸른 바다 위로 펼쳐진 구름의 장관",
        photographer: { name: "최바다", avatar: "" },
        likes: 1523,
        comments: 67,
        isLiked: true,
        isBookmarked: true,
        isEpicMoment: true,
    },
    {
        id: "5",
        imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=550&fit=crop",
        title: "사막의 별",
        description: "깊은 밤 사막에서 바라본 은하수의 장엄함",
        photographer: { name: "정별빛", avatar: "" },
        likes: 2156,
        comments: 89,
        isLiked: false,
        isBookmarked: false,
    },
    {
        id: "6",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=350&fit=crop",
        title: "꽃밭의 오후",
        description: "따스한 봄날 꽃밭에서 만난 작은 나비",
        photographer: { name: "한꽃님", avatar: "" },
        likes: 734,
        comments: 28,
        isLiked: false,
        isBookmarked: false,
    },
];

export default function Home() {
    const { theme, isDark } = useThemeContext();
    const [photos, setPhotos] = useState(mockPhotos);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleLike = useCallback((photoId: string) => {
        setPhotos(prevPhotos =>
            prevPhotos.map(photo =>
                photo.id === photoId
                    ? {
                        ...photo,
                        isLiked: !photo.isLiked,
                        likes: photo.isLiked ? photo.likes - 1 : photo.likes + 1,
                    }
                    : photo
            )
        );
    }, []);

    const handleBookmark = useCallback((photoId: string) => {
        setPhotos(prevPhotos =>
            prevPhotos.map(photo =>
                photo.id === photoId
                    ? { ...photo, isBookmarked: !photo.isBookmarked }
                    : photo
            )
        );
    }, []);

    const handlePhotoClick = useCallback((photoId: string) => {
        console.log("Photo clicked:", photoId);
        // 향후 사진 상세보기 모달 구현
    }, []);

    const handleLoadMore = useCallback(() => {
        if (loading) return;
        
        setLoading(true);
        // 실제 환경에서는 API 호출
        setTimeout(() => {
            // 더 많은 사진 추가 (실제로는 API에서 가져옴)
            const newPhotos = mockPhotos.slice(0, 3).map((photo, index) => ({
                ...photo,
                id: `${photo.id}-${Date.now()}-${index}`,
            }));
            
            setPhotos(prev => [...prev, ...newPhotos]);
            setLoading(false);
            
            // 예시로 3번 로드 후 더 이상 로드할 사진이 없다고 가정
            if (photos.length > 15) {
                setHasMore(false);
            }
        }, 1000);
    }, [loading, photos.length]);

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
                <PhotoGrid
                    photos={photos}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onPhotoClick={handlePhotoClick}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    loading={loading}
                />
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
        </div>
    );
}