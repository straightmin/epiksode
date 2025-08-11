"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { Camera, Calendar, Heart, Bookmark, UserPlus, UserMinus, Settings } from "lucide-react";
import PhotoGrid from "../../components/photos/PhotoGrid";
import { PhotoDetail, User } from '@/types';
import { apiClient, getErrorMessage } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

function ProfileContent() {
    const { theme, isDark } = useThemeContext();
    const { isAuthenticated, user: currentUser } = useAuth();
    const searchParams = useSearchParams();
    const userId = searchParams?.get('id');
    
    // 상태 관리
    const [activeTab, setActiveTab] = useState<'photos' | 'series' | 'liked'>('photos');
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [userPhotos, setUserPhotos] = useState<PhotoDetail[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 현재 사용자의 프로필인지 확인
    const isOwnProfile = !userId || (currentUser && currentUser.id === parseInt(userId));

    // 프로필 데이터 로드
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                setLoading(true);
                setError(null);

                let profileData: User;
                
                if (isOwnProfile && currentUser) {
                    // 본인 프로필인 경우
                    profileData = currentUser;
                    setUserProfile(profileData);
                    
                    // 본인 사진 목록 로드
                    const photos = await apiClient.getUserPhotos(currentUser.id);
                    setUserPhotos(photos);
                } else if (userId) {
                    // 다른 사용자 프로필인 경우
                    const userIdNumber = parseInt(userId);
                    profileData = await apiClient.getUserProfile(userIdNumber);
                    setUserProfile(profileData);
                    
                    // 해당 사용자 사진 목록 로드
                    const photos = await apiClient.getUserPhotos(userIdNumber);
                    setUserPhotos(photos);
                } else {
                    // 로그인이 필요한 경우
                    throw new Error('로그인이 필요합니다.');
                }
            } catch (error) {
                console.error('프로필 로드 실패:', error);
                setError(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, [userId, isOwnProfile, currentUser]);

    // 팔로우 토글
    const handleFollow = async () => {
        if (!isAuthenticated || !userProfile || isOwnProfile) return;
        
        try {
            // TODO: API 구현 대기
            console.log('팔로우 토글:', userProfile.id);
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('팔로우 실패:', error);
        }
    };

    // 탭 설정
    const tabs = [
        { 
            key: 'photos' as const, 
            label: '사진', 
            icon: Camera, 
            count: userPhotos.length 
        },
        { 
            key: 'series' as const, 
            label: '시리즈', 
            icon: Bookmark, 
            count: 0 // TODO: 시리즈 개수 API 구현 시 수정
        },
        { 
            key: 'liked' as const, 
            label: '좋아요', 
            icon: Heart, 
            count: 0 // TODO: 좋아요한 사진 개수 API 구현 시 수정
        },
    ];

    // 로딩 상태
    if (loading) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundColor: isDark
                        ? theme.theme.colors.background.dark
                        : theme.theme.colors.background.main,
                }}
            >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: theme.theme.colors.primary.purple }}
                ></div>
            </div>
        );
    }

    // 에러 상태
    if (error || !userProfile) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundColor: isDark
                        ? theme.theme.colors.background.dark
                        : theme.theme.colors.background.main,
                }}
            >
                <div className="text-center">
                    <p className="text-red-500 mb-4">
                        {error || '사용자를 찾을 수 없습니다.'}
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className="px-4 py-2 rounded"
                        style={{ 
                            backgroundColor: theme.theme.colors.primary.purple,
                            color: theme.theme.colors.primary.white
                        }}
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

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
                            {userProfile.username?.charAt(0).toUpperCase() || '?'}
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
                                    {userProfile.username}
                                </h1>
                                
                                {/* Follow/Settings Button */}
                                {isOwnProfile ? (
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors"
                                        style={{
                                            backgroundColor: theme.theme.colors.primary.gray,
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        <Settings size={16} />
                                        설정
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFollow}
                                        className="flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors"
                                        style={{
                                            backgroundColor: isFollowing 
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.purple,
                                            color: isFollowing 
                                                ? (isDark ? theme.theme.colors.primary.white : theme.theme.colors.primary.black)
                                                : theme.theme.colors.primary.white,
                                        }}
                                    >
                                        {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                        {isFollowing ? '팔로잉' : '팔로우'}
                                    </button>
                                )}
                            </div>

                            <p 
                                className="text-lg mb-4"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.lightGray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                @{userProfile.username}
                            </p>

                            {userProfile.bio && (
                                <p 
                                    className="mb-4"
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.white
                                            : theme.theme.colors.primary.black,
                                    }}
                                >
                                    {userProfile.bio}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-sm mb-4">
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>
                                        {new Date(userProfile.createdAt).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long'
                                        })} 가입
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-6">
                                <div className="text-center">
                                    <div 
                                        className="text-xl font-bold"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        {userPhotos.length}
                                    </div>
                                    <div 
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.lightGray
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
                                        0
                                    </div>
                                    <div 
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.lightGray
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
                                        0
                                    </div>
                                    <div 
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.lightGray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        팔로잉
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div 
                    className="border-b mb-6"
                    style={{
                        borderColor: isDark
                            ? theme.theme.colors.primary.darkGray
                            : theme.theme.colors.primary.purpleVeryLight,
                    }}
                >
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.key
                                            ? 'border-current'
                                            : 'border-transparent'
                                    }`}
                                    style={{
                                        color: activeTab === tab.key
                                            ? theme.theme.colors.primary.purple
                                            : isDark
                                                ? theme.theme.colors.primary.lightGray
                                                : theme.theme.colors.primary.darkGray,
                                        borderColor: activeTab === tab.key
                                            ? theme.theme.colors.primary.purple
                                            : 'transparent',
                                    }}
                                >
                                    <Icon size={16} />
                                    {tab.label} ({tab.count})
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'photos' && (
                        userPhotos.length > 0 ? (
                            <PhotoGrid photos={userPhotos} />
                        ) : (
                            <div className="text-center py-12">
                                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                                <p 
                                    className="text-lg font-medium"
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.lightGray
                                            : theme.theme.colors.primary.darkGray,
                                    }}
                                >
                                    아직 사진이 없습니다
                                </p>
                            </div>
                        )
                    )}
                    
                    {activeTab === 'series' && (
                        <div className="text-center py-12">
                            <Bookmark size={48} className="mx-auto mb-4 opacity-50" />
                            <p 
                                className="text-lg font-medium"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.lightGray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                아직 시리즈가 없습니다
                            </p>
                        </div>
                    )}
                    
                    {activeTab === 'liked' && (
                        <div className="text-center py-12">
                            <Heart size={48} className="mx-auto mb-4 opacity-50" />
                            <p 
                                className="text-lg font-medium"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.lightGray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                아직 좋아요한 사진이 없습니다
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { theme, isDark } = useThemeContext();
    
    return (
        <Suspense fallback={
            <div 
                className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundColor: isDark
                        ? theme.theme.colors.background.dark
                        : theme.theme.colors.background.main,
                }}
            >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: theme.theme.colors.primary.purple }}
                ></div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}