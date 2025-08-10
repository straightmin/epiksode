"use client";

import React, { useState } from "react";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { Camera, MapPin, Calendar, Heart, Bookmark } from "lucide-react";
import PhotoGrid from "../../components/photos/PhotoGrid";

// 임시 사용자 데이터
const mockUser = {
    id: "user1",
    name: "사용자 이름",
    username: "username",
    bio: "짧은 소개글을 여기에 작성합니다.",
    location: "서울, 한국",
    joinedDate: "2024년 1월",
    stats: {
        photos: 42,
        followers: 1240,
        following: 156,
        likes: 5600,
    },
    avatar: "",
};

// 임시 사진 데이터
const mockUserPhotos = [
    {
        id: "p1",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
        title: "산속의 아침",
        photographer: { name: mockUser.name, avatar: "" },
        likes: 234,
        comments: 12,
        isLiked: true,
        isBookmarked: false,
    },
    {
        id: "p2",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=500&fit=crop",
        title: "도시의 야경",
        photographer: { name: mockUser.name, avatar: "" },
        likes: 156,
        comments: 8,
        isLiked: false,
        isBookmarked: true,
    },
];

export default function ProfilePage() {
    const { theme, isDark } = useThemeContext();
    const [activeTab, setActiveTab] = useState<'photos' | 'series' | 'liked' | 'bookmarked'>('photos');
    const [isFollowing, setIsFollowing] = useState(false);

    const tabs = [
        { key: 'photos' as const, label: '사진', icon: Camera, count: mockUser.stats.photos },
        { key: 'series' as const, label: '시리즈', icon: Bookmark, count: 3 },
        { key: 'liked' as const, label: '좋아요', icon: Heart, count: 89 },
        { key: 'bookmarked' as const, label: '북마크', icon: Bookmark, count: 24 },
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
            <div className="max-w-4xl mx-auto p-4 lg:p-8">
                {/* Profile Header */}
                <div 
                    className="p-6 lg:p-8 rounded-lg mb-6 border"
                    style={{
                        backgroundColor: isDark
                            ? theme.theme.colors.background.dark
                            : theme.theme.colors.background.main,
                        borderColor: isDark
                            ? theme.theme.colors.primary.darkGray
                            : theme.theme.colors.primary.purpleVeryLight,
                    }}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0"
                            style={{
                                backgroundColor: theme.theme.colors.primary.purple,
                                color: theme.theme.colors.primary.white,
                            }}
                        >
                            {mockUser.name.charAt(0).toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <h1 
                                    className="text-2xl font-display font-bold"
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.white
                                            : theme.theme.colors.primary.black,
                                    }}
                                >
                                    {mockUser.name}
                                </h1>
                                <button
                                    onClick={() => setIsFollowing(!isFollowing)}
                                    className="px-4 py-2 rounded-full font-medium transition-all duration-300"
                                    style={{
                                        backgroundColor: isFollowing 
                                            ? 'transparent' 
                                            : theme.theme.colors.primary.purple,
                                        color: isFollowing 
                                            ? theme.theme.colors.primary.purple 
                                            : theme.theme.colors.primary.white,
                                        border: `2px solid ${theme.theme.colors.primary.purple}`,
                                    }}
                                >
                                    {isFollowing ? '팔로잉' : '팔로우'}
                                </button>
                            </div>

                            <p 
                                className="text-sm mb-4"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                @{mockUser.username}
                            </p>

                            <p 
                                className="mb-4"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.white
                                        : theme.theme.colors.primary.black,
                                }}
                            >
                                {mockUser.bio}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    <span>{mockUser.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>{mockUser.joinedDate} 가입</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6">
                                <div className="text-center">
                                    <div 
                                        className="text-xl font-bold"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        {mockUser.stats.photos}
                                    </div>
                                    <div 
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        사진
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div 
                                        className="text-xl font-bold"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        {mockUser.stats.followers.toLocaleString()}
                                    </div>
                                    <div 
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        팔로워
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div 
                                        className="text-xl font-bold"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        {mockUser.stats.following}
                                    </div>
                                    <div 
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        팔로잉
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div 
                                        className="text-xl font-bold"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        {mockUser.stats.likes.toLocaleString()}
                                    </div>
                                    <div 
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        좋아요
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div 
                    className="flex overflow-x-auto mb-6 border-b"
                    style={{
                        borderColor: isDark
                            ? theme.theme.colors.primary.darkGray
                            : theme.theme.colors.primary.purpleVeryLight,
                    }}
                >
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap
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
                                <IconComponent size={16} />
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

                {/* Tab Content */}
                <div>
                    {activeTab === 'photos' && (
                        <PhotoGrid
                            photos={mockUserPhotos}
                            hasMore={false}
                            loading={false}
                        />
                    )}
                    
                    {activeTab !== 'photos' && (
                        <div className="text-center py-12">
                            <div 
                                className="text-sm"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                {activeTab === 'series' && '아직 시리즈가 없습니다'}
                                {activeTab === 'liked' && '좋아요한 사진이 없습니다'}
                                {activeTab === 'bookmarked' && '북마크한 사진이 없습니다'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}