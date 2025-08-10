"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { Search, Bell, Settings, X, Hash, User } from "lucide-react";

interface SearchSuggestion {
    id: string;
    type: 'user' | 'tag' | 'location';
    text: string;
    subtitle?: string;
    image?: string;
}

const Header: React.FC = () => {
    const { theme, isDark } = useThemeContext();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // 임시 검색 제안 데이터
    const mockSuggestions: SearchSuggestion[] = [
        { id: "1", type: "user", text: "김자연", subtitle: "@nature_kim", image: "" },
        { id: "2", type: "user", text: "박도시", subtitle: "@city_park", image: "" },
        { id: "3", type: "tag", text: "자연", subtitle: "1,234개 사진" },
        { id: "4", type: "tag", text: "도시", subtitle: "2,156개 사진" },
        { id: "5", type: "location", text: "지리산 국립공원", subtitle: "위치" },
        { id: "6", type: "location", text: "제주도", subtitle: "위치" },
    ];

    // 검색 제안 필터링
    const filterSuggestions = useCallback((query: string) => {
        if (!query.trim()) {
            setSearchSuggestions([]);
            return;
        }

        const filtered = mockSuggestions.filter(suggestion =>
            suggestion.text.toLowerCase().includes(query.toLowerCase()) ||
            (suggestion.subtitle && suggestion.subtitle.toLowerCase().includes(query.toLowerCase()))
        );

        setSearchSuggestions(filtered.slice(0, 6)); // 최대 6개 제한
    }, []);

    // 검색어 변경 핸들러
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        filterSuggestions(value);
    }, [filterSuggestions]);

    // 검색 실행
    const handleSearch = useCallback((query?: string) => {
        const searchTerm = query || searchQuery;
        if (!searchTerm.trim()) return;

        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        setIsSearchFocused(false);
        setSearchSuggestions([]);
    }, [searchQuery, router]);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
                setSearchSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header
            className="sticky top-0 z-50 px-4 sm:px-6 py-3 border-b backdrop-blur-sm"
            style={{
                backgroundColor: isDark
                    ? `${theme.theme.colors.background.dark}f0`
                    : `${theme.theme.colors.background.main}f0`,
                borderColor: isDark
                    ? theme.theme.colors.primary.darkGray
                    : theme.theme.colors.primary.purpleVeryLight,
            }}
        >
            <div className="max-w-full mx-auto flex items-center justify-between gap-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 flex-shrink-0"
                >
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                            background: theme.theme.colors.background.gradient,
                            color: theme.theme.colors.primary.white,
                        }}
                    >
                        E
                    </div>
                    <span className="text-gradient font-display text-xl font-bold hidden sm:block">
                        epiksode
                    </span>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-md mx-4" ref={searchRef}>
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.gray
                                    : theme.theme.colors.primary.darkGray,
                            }}
                        />
                        
                        <input
                            type="text"
                            placeholder="사진, 사용자, 태그 검색..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                setIsSearchFocused(true);
                                filterSuggestions(searchQuery);
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            className="w-full pl-10 pr-10 py-2 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: isDark
                                    ? theme.theme.colors.background.dark
                                    : theme.theme.colors.background.main,
                                borderColor: isSearchFocused
                                    ? theme.theme.colors.primary.purple
                                    : isDark
                                    ? theme.theme.colors.primary.darkGray
                                    : theme.theme.colors.primary.purpleVeryLight,
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                                boxShadow: isSearchFocused
                                    ? `0 0 0 2px ${theme.theme.colors.primary.purpleVeryLight}`
                                    : 'none',
                            }}
                        />

                        {/* Clear Button */}
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchSuggestions([]);
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-gray-100"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}

                        {/* Search Suggestions Dropdown */}
                        {isSearchFocused && searchSuggestions.length > 0 && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg z-50 max-h-80 overflow-y-auto"
                                style={{
                                    backgroundColor: isDark
                                        ? theme.theme.colors.background.dark
                                        : theme.theme.colors.background.main,
                                    borderColor: isDark
                                        ? theme.theme.colors.primary.darkGray
                                        : theme.theme.colors.primary.purpleVeryLight,
                                }}
                            >
                                {searchSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => handleSearch(suggestion.text)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-opacity-50 first:rounded-t-lg last:rounded-b-lg"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 
                                                theme.theme.colors.primary.purpleVeryLight + '30';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        {/* Icon */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{
                                                backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                                                color: theme.theme.colors.primary.purple,
                                            }}
                                        >
                                            {suggestion.type === 'user' && <User size={16} />}
                                            {suggestion.type === 'tag' && <Hash size={16} />}
                                            {suggestion.type === 'location' && <Search size={16} />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div
                                                className="font-medium"
                                                style={{
                                                    color: isDark
                                                        ? theme.theme.colors.primary.white
                                                        : theme.theme.colors.primary.black,
                                                }}
                                            >
                                                {suggestion.text}
                                            </div>
                                            {suggestion.subtitle && (
                                                <div
                                                    className="text-sm"
                                                    style={{
                                                        color: isDark
                                                            ? theme.theme.colors.primary.gray
                                                            : theme.theme.colors.primary.darkGray,
                                                    }}
                                                >
                                                    {suggestion.subtitle}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Notifications */}
                    <Link
                        href="/notifications"
                        className="p-2 rounded-full transition-all duration-300 hover:transform hover:scale-105 relative"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                theme.theme.colors.primary.purpleVeryLight;
                            e.currentTarget.style.color =
                                theme.theme.colors.primary.purple;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black;
                        }}
                    >
                        <Bell size={20} />
                        {/* Notification Badge */}
                        <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                                backgroundColor: theme.theme.colors.accent.pink,
                                color: theme.theme.colors.primary.white,
                            }}
                        >
                            3
                        </div>
                    </Link>

                    {/* Settings */}
                    <Link
                        href="/settings"
                        className="p-2 rounded-full transition-all duration-300 hover:transform hover:scale-105 hidden sm:block"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                theme.theme.colors.primary.purpleVeryLight;
                            e.currentTarget.style.color =
                                theme.theme.colors.primary.purple;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black;
                        }}
                    >
                        <Settings size={20} />
                    </Link>

                    {/* Profile */}
                    <Link
                        href="/profile"
                        className="p-1 rounded-full transition-all duration-300 hover:transform hover:scale-105"
                        style={{
                            border: `2px solid ${theme.theme.colors.primary.purple}`,
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                            style={{
                                backgroundColor: theme.theme.colors.primary.purple,
                                color: theme.theme.colors.primary.white,
                            }}
                        >
                            U
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;