"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import PhotoGrid from "../../components/photos/PhotoGrid";
import { Search, Grid, List } from "lucide-react";
import { PhotoDetail } from "@/types";
// import { apiClient } from '@/lib/api-client';

// 임시 검색 결과 데이터
const mockSearchResults = {
    "자연": [
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
            isLiked: false,
            createdAt: "2024-08-09T06:30:00Z",
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
            isLiked: false,
            createdAt: "2024-08-07T14:20:00Z",
        },
    ],
    "도시": [
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
            isLiked: true,
            createdAt: "2024-08-08T22:15:00Z",
        },
    ],
};

// 검색 파라미터를 사용하는 내부 컴포넌트
function SearchContent() {
    const { theme, isDark } = useThemeContext();
    const searchParams = useSearchParams();
    const query = searchParams?.get('q') || '';
    
    const [searchResults, setSearchResults] = useState<PhotoDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'users'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'relevant'>('relevant');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // 검색 실행
    useEffect(() => {
        if (!query) {
            setSearchResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        
        // 검색 API는 추후 구현 예정
        setTimeout(() => {
            setSearchResults([]); // 빈 결과 반환
            setLoading(false);
        }, 500);
    }, [query]);

    // 좋아요 핸들러
    const handleLike = useCallback((photoId: number) => {
        setSearchResults(prevResults =>
            prevResults.map(photo =>
                photo.id === photoId
                    ? {
                        ...photo,
                        isLikedByCurrentUser: !photo.isLikedByCurrentUser,
                        likesCount: photo.isLikedByCurrentUser ? photo.likesCount - 1 : photo.likesCount + 1,
                    }
                    : photo
            )
        );
    }, []);

    // 북마크 핸들러

    // 사진 클릭 핸들러
    const handlePhotoClick = useCallback((photoId: number) => {
        console.log("Photo clicked:", photoId);
        // 모달 열기 또는 상세 페이지로 이동
    }, []);

    const tabs = [
        { key: 'all' as const, label: '전체', count: searchResults.length },
        { key: 'photos' as const, label: '사진', count: searchResults.length },
        { key: 'users' as const, label: '사용자', count: 0 },
    ];

    return (
        <div 
            className="min-h-screen"
            style={{
                backgroundColor: isDark
                    ? theme.theme.colors.background.dark
                    : theme.theme.colors.background.main,
            }}
        >
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Search Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Search
                            size={24}
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        />
                        <h1
                            className="text-2xl font-display font-bold"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        >
&ldquo;{query}&rdquo; 검색 결과
                        </h1>
                    </div>

                    {searchResults.length > 0 && (
                        <p
                            className="text-sm mb-4"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.gray
                                    : theme.theme.colors.primary.darkGray,
                            }}
                        >
                            {searchResults.length.toLocaleString()}개의 결과를 찾았습니다
                        </p>
                    )}
                </div>

                {/* Search Filters */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    {/* Tabs */}
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 font-medium whitespace-nowrap
                                        transition-all duration-300 border-b-2
                                        ${isActive ? 'border-opacity-100' : 'border-opacity-0 hover:border-opacity-50'}
                                    `}
                                    style={{
                                        color: isActive
                                            ? theme.theme.colors.primary.purple
                                            : isDark
                                            ? theme.theme.colors.primary.gray
                                            : theme.theme.colors.primary.darkGray,
                                        borderColor: theme.theme.colors.primary.purple,
                                    }}
                                >
                                    <span>{tab.label}</span>
                                    <span 
                                        className="px-2 py-1 rounded-full text-xs"
                                        style={{
                                            backgroundColor: isActive
                                                ? theme.theme.colors.primary.purpleVeryLight
                                                : 'transparent',
                                            color: isActive
                                                ? theme.theme.colors.primary.purple
                                                : 'inherit',
                                        }}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'relevant')}
                            className="px-3 py-2 border rounded-lg text-sm"
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
                        >
                            <option value="relevant">관련순</option>
                            <option value="recent">최신순</option>
                            <option value="popular">인기순</option>
                        </select>

                        {/* View Mode */}
                        <div className="flex items-center border rounded-lg overflow-hidden"
                            style={{
                                borderColor: isDark
                                    ? theme.theme.colors.primary.darkGray
                                    : theme.theme.colors.primary.purpleVeryLight,
                            }}
                        >
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 transition-colors ${
                                    viewMode === 'grid' ? 'bg-opacity-100' : 'bg-opacity-0'
                                }`}
                                style={{
                                    backgroundColor: viewMode === 'grid'
                                        ? theme.theme.colors.primary.purpleVeryLight
                                        : 'transparent',
                                    color: viewMode === 'grid'
                                        ? theme.theme.colors.primary.purple
                                        : isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 transition-colors ${
                                    viewMode === 'list' ? 'bg-opacity-100' : 'bg-opacity-0'
                                }`}
                                style={{
                                    backgroundColor: viewMode === 'list'
                                        ? theme.theme.colors.primary.purpleVeryLight
                                        : 'transparent',
                                    color: viewMode === 'list'
                                        ? theme.theme.colors.primary.purple
                                        : isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Results */}
                <div>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="flex items-center gap-2">
                                <div
                                    className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full"
                                    style={{
                                        borderColor: theme.theme.colors.primary.purple,
                                        borderTopColor: "transparent",
                                    }}
                                />
                                <span
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.white
                                            : theme.theme.colors.primary.black,
                                    }}
                                >
                                    검색 중...
                                </span>
                            </div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <PhotoGrid
                            photos={searchResults}
                            onLike={handleLike}
                            onPhotoClick={handlePhotoClick}
                            hasMore={false}
                            loading={false}
                        />
                    ) : query ? (
                        <div
                            className="flex flex-col items-center justify-center py-12 text-center"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.gray
                                    : theme.theme.colors.primary.darkGray,
                            }}
                        >
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                style={{
                                    backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                                }}
                            >
                                <Search
                                    size={32}
                                    style={{ color: theme.theme.colors.primary.purple }}
                                />
                            </div>
                            <h3 className="text-lg font-bold mb-2">검색 결과가 없습니다</h3>
                            <p className="text-sm mb-4">
&ldquo;{query}&rdquo;에 대한 검색 결과를 찾을 수 없습니다.
                            </p>
                            <div className="text-sm">
                                <p>다른 키워드로 검색해보거나</p>
                                <p>철자를 확인해 주세요.</p>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center justify-center py-12 text-center"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.gray
                                    : theme.theme.colors.primary.darkGray,
                            }}
                        >
                            <h3 className="text-lg font-bold mb-2">검색어를 입력해주세요</h3>
                            <p className="text-sm">
                                사진, 사용자, 태그를 검색할 수 있습니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 로딩 컴포넌트
function SearchLoading() {
    const { theme, isDark } = useThemeContext();
    
    return (
        <div 
            className="min-h-screen flex items-center justify-center"
            style={{
                backgroundColor: isDark
                    ? theme.theme.colors.background.dark
                    : theme.theme.colors.background.main,
            }}
        >
            <div className="flex items-center gap-2">
                <div
                    className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full"
                    style={{
                        borderColor: theme.theme.colors.primary.purple,
                        borderTopColor: "transparent",
                    }}
                />
                <span
                    style={{
                        color: isDark
                            ? theme.theme.colors.primary.white
                            : theme.theme.colors.primary.black,
                    }}
                >
                    검색 페이지를 불러오는 중...
                </span>
            </div>
        </div>
    );
}

// 메인 컴포넌트 (Suspense 경계 제공)
export default function SearchPage() {
    return (
        <Suspense fallback={<SearchLoading />}>
            <SearchContent />
        </Suspense>
    );
}