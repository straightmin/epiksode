"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import PhotoGrid from "../../components/photos/PhotoGrid";
import { Search, Grid, List, Camera, User } from "lucide-react";
import { PhotoDetail, PublicUser, SearchParams } from "@/types";
import { apiClient, getErrorMessage } from '@/lib/api-client';

// 검색 파라미터를 사용하는 내부 컴포넌트
function SearchContent() {
    const { theme, isDark } = useThemeContext();
    const searchParams = useSearchParams();
    const query = searchParams?.get('q') || '';
    
    const [searchResults, setSearchResults] = useState<{
        photos: PhotoDetail[];
        users: PublicUser[];
        total: { photos: number; users: number; };
    }>({
        photos: [],
        users: [],
        total: { photos: 0, users: 0 }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'users'>('photos');
    const [sortBy, setSortBy] = useState<'relevance' | 'latest' | 'popular'>('relevance');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // 디바운싱을 위한 타이머 ID 저장
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // 검색 실행
    const performSearch = useCallback(async (searchQuery: string, sortOrder: 'relevance' | 'latest' | 'popular') => {
        if (!searchQuery.trim()) {
            setSearchResults({
                photos: [],
                users: [],
                total: { photos: 0, users: 0 }
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 백엔드 검색 API 호출
            const searchParams: SearchParams = {
                q: searchQuery.trim(),
                sortBy: sortOrder,
                page: 1,
                limit: 20
            };

            const response = await apiClient.search(searchParams);

            setSearchResults({
                photos: response.photos.data,
                users: response.users.data,
                total: {
                    photos: response.photos.pagination.total,
                    users: response.users.pagination.total
                }
            });
        } catch (error) {
            console.error('검색 실패:', error);
            setError(getErrorMessage(error));
            setSearchResults({
                photos: [],
                users: [],
                total: { photos: 0, users: 0 }
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // 실시간 검색 (디바운싱) - 검색어 변경 시 500ms 후 검색 실행
    useEffect(() => {
        // 이전 타이머 취소
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (!query.trim()) {
            setSearchResults({
                photos: [],
                users: [],
                total: { photos: 0, users: 0 }
            });
            return;
        }

        // 새 타이머 설정 (500ms 디바운싱)
        const timer = setTimeout(() => {
            performSearch(query, sortBy);
        }, 500);

        setDebounceTimer(timer);

        // 클린업 함수
        return () => {
            clearTimeout(timer);
        };
    }, [query, sortBy, performSearch, debounceTimer]);

    // 정렬 방식 변경 시 즉시 검색 실행
    const handleSortChange = useCallback((newSortBy: 'relevance' | 'latest' | 'popular') => {
        setSortBy(newSortBy);
        if (query.trim()) {
            // 디바운스 타이머 취소하고 즉시 검색
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            performSearch(query, newSortBy);
        }
    }, [query, debounceTimer, performSearch]);

    // 탭 데이터
    const tabs = [
        { key: 'photos' as const, label: '사진', icon: Camera, count: searchResults.total.photos },
        { key: 'users' as const, label: '사용자', icon: User, count: searchResults.total.users },
        { key: 'all' as const, label: '전체', icon: Search, count: searchResults.total.photos + searchResults.total.users },
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
            <div className="max-w-6xl mx-auto p-4">
                {/* Search Header */}
                <div className="mb-6">
                    <h1 
                        className="text-2xl font-display font-bold mb-4"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black,
                        }}
                    >
                        {query ? `"${query}" 검색 결과` : '검색'}
                    </h1>

                    {/* Search Stats */}
                    {query && (
                        <p 
                            className="text-sm mb-4"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.lightGray
                                    : theme.theme.colors.primary.darkGray,
                            }}
                        >
                            {loading 
                                ? '검색 중...' 
                                : `${searchResults.total.photos + searchResults.total.users}개의 결과를 찾았습니다`
                            }
                        </p>
                    )}

                    {/* Tabs */}
                    <div 
                        className="border-b mb-4"
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
                                        className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
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

                    {/* Filter & View Controls */}
                    {query && (
                        <div className="flex items-center justify-between mb-4">
                            {/* Sort Options */}
                            <div className="flex gap-2">
                                {(['relevance', 'latest', 'popular'] as const).map((sort) => (
                                    <button
                                        key={sort}
                                        onClick={() => handleSortChange(sort)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                            sortBy === sort ? 'active' : ''
                                        }`}
                                        style={{
                                            backgroundColor: sortBy === sort
                                                ? theme.theme.colors.primary.purple
                                                : isDark
                                                    ? theme.theme.colors.primary.darkGray
                                                    : theme.theme.colors.primary.lightGray,
                                            color: sortBy === sort
                                                ? theme.theme.colors.primary.white
                                                : isDark
                                                    ? theme.theme.colors.primary.white
                                                    : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        {sort === 'relevance' && '관련도순'}
                                        {sort === 'latest' && '최신순'}
                                        {sort === 'popular' && '인기순'}
                                    </button>
                                ))}
                            </div>

                            {/* View Mode */}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-colors ${
                                        viewMode === 'grid' ? 'active' : ''
                                    }`}
                                    style={{
                                        backgroundColor: viewMode === 'grid'
                                            ? theme.theme.colors.primary.purple
                                            : 'transparent',
                                        color: viewMode === 'grid'
                                            ? theme.theme.colors.primary.white
                                            : isDark
                                                ? theme.theme.colors.primary.lightGray
                                                : theme.theme.colors.primary.darkGray,
                                    }}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-colors ${
                                        viewMode === 'list' ? 'active' : ''
                                    }`}
                                    style={{
                                        backgroundColor: viewMode === 'list'
                                            ? theme.theme.colors.primary.purple
                                            : 'transparent',
                                        color: viewMode === 'list'
                                            ? theme.theme.colors.primary.white
                                            : isDark
                                                ? theme.theme.colors.primary.lightGray
                                                : theme.theme.colors.primary.darkGray,
                                    }}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search Content */}
                <div>
                    {!query ? (
                        // 검색어가 없을 때
                        <div className="text-center py-16">
                            <Search size={48} className="mx-auto mb-4 opacity-50" />
                            <p 
                                className="text-lg font-medium"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.lightGray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                사진이나 사용자를 검색해보세요
                            </p>
                        </div>
                    ) : loading ? (
                        // 로딩 상태
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2"
                                style={{ borderColor: theme.theme.colors.primary.purple }}
                            ></div>
                        </div>
                    ) : error ? (
                        // 에러 상태
                        <div className="text-center py-16">
                            <p className="text-red-500 mb-4">
                                {error || '검색 중 오류가 발생했습니다'}
                            </p>
                            <button 
                                onClick={() => performSearch(query, sortBy)}
                                className="px-4 py-2 rounded"
                                style={{ 
                                    backgroundColor: theme.theme.colors.primary.purple,
                                    color: theme.theme.colors.primary.white
                                }}
                            >
                                다시 시도
                            </button>
                        </div>
                    ) : activeTab === 'photos' ? (
                        // 사진 검색 결과
                        searchResults.photos.length > 0 ? (
                            <PhotoGrid photos={searchResults.photos} />
                        ) : (
                            <div className="text-center py-16">
                                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                                <p 
                                    className="text-lg font-medium"
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.lightGray
                                            : theme.theme.colors.primary.darkGray,
                                    }}
                                >
                                    &quot;{query}&quot;와 관련된 사진을 찾을 수 없습니다
                                </p>
                            </div>
                        )
                    ) : activeTab === 'users' ? (
                        // 사용자 검색 결과
                        searchResults.users.length > 0 ? (
                            <div className="grid gap-4">
                                {searchResults.users.map((user) => (
                                    <div 
                                        key={user.id}
                                        className="flex items-center gap-4 p-4 rounded-lg border transition-colors hover:shadow-md"
                                        style={{
                                            backgroundColor: isDark
                                                ? theme.theme.colors.background.dark
                                                : theme.theme.colors.primary.white,
                                            borderColor: isDark
                                                ? theme.theme.colors.primary.darkGray
                                                : theme.theme.colors.primary.lightGray,
                                        }}
                                    >
                                        <div 
                                            className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"
                                            style={{
                                                backgroundImage: user.profileImageUrl 
                                                    ? `url(${user.profileImageUrl})` 
                                                    : undefined,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        >
                                            {!user.profileImageUrl && (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User size={20} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 
                                                className="font-semibold"
                                                style={{
                                                    color: isDark
                                                        ? theme.theme.colors.primary.white
                                                        : theme.theme.colors.primary.black,
                                                }}
                                            >
                                                {user.username}
                                            </h3>
                                            {user.bio && (
                                                <p 
                                                    className="text-sm mt-1"
                                                    style={{
                                                        color: isDark
                                                            ? theme.theme.colors.primary.lightGray
                                                            : theme.theme.colors.primary.darkGray,
                                                    }}
                                                >
                                                    {user.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <User size={48} className="mx-auto mb-4 opacity-50" />
                                <p 
                                    className="text-lg font-medium"
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.lightGray
                                            : theme.theme.colors.primary.darkGray,
                                    }}
                                >
                                    &quot;{query}&quot;와 관련된 사용자를 찾을 수 없습니다
                                </p>
                            </div>
                        )
                    ) : (
                        // 전체 검색 결과 (사진 + 사용자)
                        <div className="space-y-8">
                            {searchResults.photos.length > 0 && (
                                <div>
                                    <h2 
                                        className="text-lg font-semibold mb-4"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        사진 ({searchResults.total.photos})
                                    </h2>
                                    <PhotoGrid photos={searchResults.photos} />
                                </div>
                            )}
                            
                            {searchResults.users.length > 0 && (
                                <div>
                                    <h2 
                                        className="text-lg font-semibold mb-4"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        사용자 ({searchResults.total.users})
                                    </h2>
                                    <div className="grid gap-4">
                                        {searchResults.users.map((user) => (
                                            <div 
                                                key={user.id}
                                                className="flex items-center gap-4 p-4 rounded-lg border transition-colors hover:shadow-md"
                                                style={{
                                                    backgroundColor: isDark
                                                        ? theme.theme.colors.background.dark
                                                        : theme.theme.colors.primary.white,
                                                    borderColor: isDark
                                                        ? theme.theme.colors.primary.darkGray
                                                        : theme.theme.colors.primary.lightGray,
                                                }}
                                            >
                                                <div 
                                                    className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"
                                                    style={{
                                                        backgroundImage: user.profileImageUrl 
                                                            ? `url(${user.profileImageUrl})` 
                                                            : undefined,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                    }}
                                                >
                                                    {!user.profileImageUrl && (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User size={20} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 
                                                        className="font-semibold"
                                                        style={{
                                                            color: isDark
                                                                ? theme.theme.colors.primary.white
                                                                : theme.theme.colors.primary.black,
                                                        }}
                                                    >
                                                        {user.username}
                                                    </h3>
                                                    {user.bio && (
                                                        <p 
                                                            className="text-sm mt-1"
                                                            style={{
                                                                color: isDark
                                                                    ? theme.theme.colors.primary.lightGray
                                                                    : theme.theme.colors.primary.darkGray,
                                                            }}
                                                        >
                                                            {user.bio}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {searchResults.photos.length === 0 && searchResults.users.length === 0 && (
                                <div className="text-center py-16">
                                    <Search size={48} className="mx-auto mb-4 opacity-50" />
                                    <p 
                                        className="text-lg font-medium"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.lightGray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        &quot;{query}&quot;와 관련된 결과를 찾을 수 없습니다
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 메인 컴포넌트 (Suspense 래퍼)
export default function SearchPage() {
    return (
        <Suspense 
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}