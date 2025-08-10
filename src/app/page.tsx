"use client";

import { useState, useCallback } from "react";
import { useThemeContext, DarkModeToggle } from "../../frontend-theme-system/components/ThemeProvider";
import PhotoGrid from "../components/photos/PhotoGrid";
import PhotoModal from "../components/photos/PhotoModal";

// 임시 목업 데이터
const mockPhotos = [
    {
        id: "1",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
        title: "산속의 아침",
        description: "새벽 안개가 피어오르는 산속에서 맞이한 평화로운 아침의 순간입니다.",
        photographer: { 
            id: "user1", 
            name: "김자연", 
            username: "nature_kim", 
            avatar: "", 
            isFollowing: false 
        },
        likes: 1247,
        comments: 23,
        views: 5432,
        isLiked: false,
        isBookmarked: false,
        isEpicMoment: true,
        tags: ["자연", "안개", "산", "아침"],
        location: "지리산 국립공원",
        camera: {
            make: "Canon",
            model: "EOS R5",
            lens: "RF 24-70mm f/2.8L",
            settings: {
                aperture: "f/8",
                shutterSpeed: "1/125s",
                iso: "ISO 400",
                focalLength: "35mm"
            }
        },
        createdAt: "2024-08-09T06:30:00Z",
    },
    {
        id: "2",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=500&fit=crop",
        title: "도시의 야경",
        description: "번화가 네온사인이 만들어내는 환상적인 밤의 풍경",
        photographer: { 
            id: "user2", 
            name: "박도시", 
            username: "city_park", 
            avatar: "", 
            isFollowing: true 
        },
        likes: 892,
        comments: 41,
        views: 2156,
        isLiked: true,
        isBookmarked: false,
        tags: ["도시", "야경", "네온", "밤"],
        location: "강남역 일대",
        camera: {
            make: "Sony",
            model: "α7R IV",
            lens: "FE 16-35mm f/2.8 GM",
            settings: {
                aperture: "f/2.8",
                shutterSpeed: "1/60s",
                iso: "ISO 1600",
                focalLength: "24mm"
            }
        },
        createdAt: "2024-08-08T22:15:00Z",
    },
    {
        id: "3",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=700&fit=crop",
        title: "숲속의 오솔길",
        description: "햇살이 스며드는 숲속 길을 따라 걸으며 찍은 사진",
        photographer: { 
            id: "user3", 
            name: "이숲길", 
            username: "forest_lee", 
            avatar: "", 
            isFollowing: false 
        },
        likes: 564,
        comments: 15,
        views: 1234,
        isLiked: false,
        isBookmarked: true,
        tags: ["숲", "산책로", "햇살", "자연"],
        location: "북한산 둘레길",
        camera: {
            make: "Nikon",
            model: "D850",
            lens: "AF-S 24-120mm f/4G",
            settings: {
                aperture: "f/5.6",
                shutterSpeed: "1/250s",
                iso: "ISO 200",
                focalLength: "50mm"
            }
        },
        createdAt: "2024-08-07T14:20:00Z",
    },
    {
        id: "4",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=450&fit=crop",
        title: "바다와 구름",
        description: "푸른 바다 위로 펼쳐진 구름의 장관",
        photographer: { 
            id: "user4", 
            name: "최바다", 
            username: "sea_choi", 
            avatar: "", 
            isFollowing: true 
        },
        likes: 1523,
        comments: 67,
        views: 3456,
        isLiked: true,
        isBookmarked: true,
        isEpicMoment: true,
        tags: ["바다", "구름", "풍경", "자연"],
        location: "제주도 우도",
        camera: {
            make: "Fujifilm",
            model: "X-T4",
            lens: "XF 16-80mm f/4",
            settings: {
                aperture: "f/8",
                shutterSpeed: "1/500s",
                iso: "ISO 100",
                focalLength: "28mm"
            }
        },
        createdAt: "2024-08-06T16:45:00Z",
    },
    {
        id: "5",
        imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=550&fit=crop",
        title: "사막의 별",
        description: "깊은 밤 사막에서 바라본 은하수의 장엄함",
        photographer: { 
            id: "user5", 
            name: "정별빛", 
            username: "star_jung", 
            avatar: "", 
            isFollowing: false 
        },
        likes: 2156,
        comments: 89,
        views: 4321,
        isLiked: false,
        isBookmarked: false,
        tags: ["별", "은하수", "사막", "밤하늘"],
        location: "몽골 고비사막",
        camera: {
            make: "Canon",
            model: "EOS Ra",
            lens: "RF 15-35mm f/2.8L",
            settings: {
                aperture: "f/2.8",
                shutterSpeed: "20s",
                iso: "ISO 3200",
                focalLength: "24mm"
            }
        },
        createdAt: "2024-08-05T23:30:00Z",
    },
    {
        id: "6",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=350&fit=crop",
        title: "꽃밭의 오후",
        description: "따스한 봄날 꽃밭에서 만난 작은 나비",
        photographer: { 
            id: "user6", 
            name: "한꽃님", 
            username: "flower_han", 
            avatar: "", 
            isFollowing: false 
        },
        likes: 734,
        comments: 28,
        views: 1567,
        isLiked: false,
        isBookmarked: false,
        tags: ["꽃", "나비", "봄", "매크로"],
        location: "경주 불국사 일원",
        camera: {
            make: "Olympus",
            model: "OM-D E-M1X",
            lens: "M.Zuiko 60mm f/2.8 Macro",
            settings: {
                aperture: "f/5.6",
                shutterSpeed: "1/320s",
                iso: "ISO 200",
                focalLength: "60mm"
            }
        },
        createdAt: "2024-08-04T13:15:00Z",
    },
];

export default function Home() {
    const { theme, isDark } = useThemeContext();
    const [photos, setPhotos] = useState(mockPhotos);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleFollow = useCallback((userId: string) => {
        setPhotos(prevPhotos =>
            prevPhotos.map(photo =>
                photo.photographer.id === userId
                    ? {
                        ...photo,
                        photographer: {
                            ...photo.photographer,
                            isFollowing: !photo.photographer.isFollowing,
                        },
                    }
                    : photo
            )
        );
    }, []);

    const handleLoadMore = useCallback(() => {
        if (loading) return;
        
        setLoading(true);
        // 실제 환경에서는 API 호출
        setTimeout(() => {
            // 더 많은 사진 추가 (실제로는 API에서 가져옴)
            const newPhotos = mockPhotos.slice(0, 3).map((photo, index) => ({
                ...photo,
                id: `${photo.id}-page${Math.floor(photos.length / 3)}-item${index}`,
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
                        onLike={handleLike}
                        onBookmark={handleBookmark}
                        onFollow={handleFollow}
                    />
                );
            })()}
        </div>
    );
}