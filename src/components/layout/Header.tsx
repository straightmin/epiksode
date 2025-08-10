"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { Search, Bell, Settings } from "lucide-react";

const Header: React.FC = () => {
    const { theme, isDark } = useThemeContext();
    const [searchQuery, setSearchQuery] = useState("");

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
                <div className="flex-1 max-w-md mx-4">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.gray
                                    : theme.theme.colors.primary.darkGray,
                            }}
                        />
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2"
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
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor =
                                    theme.theme.colors.primary.purple;
                                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.theme.colors.primary.purpleVeryLight}`;
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = isDark
                                    ? theme.theme.colors.primary.darkGray
                                    : theme.theme.colors.primary.purpleVeryLight;
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        />
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