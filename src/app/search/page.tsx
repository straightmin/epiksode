"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import PhotoGrid from "../../components/photos/PhotoGrid";
import { Search, Grid, List, Camera, User } from "lucide-react";
import { PhotoDetail } from "@/types";
import { getErrorMessage } from '@/lib/api-client';
import { usePhotos } from '@/hooks/usePhotos';

// 검색 파라미터를 사용하는 내부 컴포넌트
function SearchContent() {
    const { theme, isDark } = useThemeContext();
    const searchParams = useSearchParams();
    const query = searchParams?.get('q') || '';
    
    const [searchResults, setSearchResults] = useState<PhotoDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'users'>('photos');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'relevant'>('relevant');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // 전체 사진 목록 가져오기 (검색 기능이 백엔드에 없으므로 클라이언트에서 필터링)
    const { photos: allPhotos, loading: photosLoading, error: photosError } = usePhotos({
        sortBy: sortBy === 'recent' ? 'latest' : 'popular',
        autoLoad: true
    });

    // 검색 실행
    const performSearch = useCallback(async () => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 백엔드에 검색 API가 없으므로 클라이언트에서 필터링
            const filteredResults = allPhotos.filter(photo => {
                const titleMatch = photo.title.toLowerCase().includes(query.toLowerCase());
                const descriptionMatch = photo.description?.toLowerCase().includes(query.toLowerCase());
                const authorMatch = photo.author?.username?.toLowerCase().includes(query.toLowerCase());
                
                return titleMatch || descriptionMatch || authorMatch;
            });

            setSearchResults(filteredResults);
        } catch (error) {
            console.error('검색 실패:', error);
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [query, allPhotos]);

    // 검색어 변경 시 검색 실행
    useEffect(() => {
        if (query && allPhotos.length > 0) {
            performSearch();
        } else if (!query) {
            setSearchResults([]);
        }
    }, [query, performSearch, allPhotos]);

    // 탭 데이터
    const tabs = [
        { key: 'photos' as const, label: '사진', icon: Camera, count: searchResults.length },
        { key: 'users' as const, label: '사용자', icon: User, count: 0 }, // TODO: 사용자 검색 기능 구현 시 수정
        { key: 'all' as const, label: '전체', icon: Search, count: searchResults.length },
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
                                : `${searchResults.length}개의 결과를 찾았습니다`
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
                                {(['relevant', 'recent', 'popular'] as const).map((sort) => (
                                    <button
                                        key={sort}
                                        onClick={() => setSortBy(sort)}
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
                                        {sort === 'relevant' && '관련도순'}
                                        {sort === 'recent' && '최신순'}
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
                    ) : loading || photosLoading ? (
                        // 로딩 상태
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2"
                                style={{ borderColor: theme.theme.colors.primary.purple }}
                            ></div>
                        </div>
                    ) : error || photosError ? (
                        // 에러 상태
                        <div className="text-center py-16">
                            <p className="text-red-500 mb-4">
                                {error || photosError || '검색 중 오류가 발생했습니다'}
                            </p>
                            <button 
                                onClick={performSearch}
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
                        searchResults.length > 0 ? (
                            <PhotoGrid photos={searchResults} />
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
                        // 사용자 검색 결과 (미구현)
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
                                사용자 검색 기능은 준비 중입니다
                            </p>
                        </div>
                    ) : (
                        // 전체 검색 결과
                        searchResults.length > 0 ? (
                            <PhotoGrid photos={searchResults} />
                        ) : (
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
                        )
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