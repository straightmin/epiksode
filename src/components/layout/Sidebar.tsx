"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { Home, Search, Upload, Settings, Menu, X } from "lucide-react";

// 네비게이션 메뉴 아이템 타입 정의
interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number;
    isActive?: boolean;
}

// 네비게이션 메뉴 구성
interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

const Sidebar: React.FC = () => {
    const { theme, isDark } = useThemeContext();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // MVP용 실제 구현된 네비게이션 메뉴
    const navigationSections: NavigationSection[] = [
        {
            title: "메인",
            items: [
                {
                    name: "홈",
                    href: "/",
                    icon: Home,
                },
                {
                    name: "검색",
                    href: "/search",
                    icon: Search,
                },
            ],
        },
        {
            title: "만들기",
            items: [
                {
                    name: "업로드",
                    href: "/upload",
                    icon: Upload,
                },
            ],
        },
    ];

    // 활성 상태 확인
    const isActiveLink = (href: string): boolean => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };

    // 네비게이션 아이템 렌더링
    const renderNavigationItem = (item: NavigationItem) => {
        const isActive = isActiveLink(item.href);
        const IconComponent = item.icon;

        return (
            <Link
                key={item.name}
                href={item.href}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-300 group relative
                    hover:transform hover:translateX(2px)
                    ${isActive ? "font-semibold" : "font-normal"}
                `}
                style={{
                    backgroundColor: isActive
                        ? theme.theme.colors.primary.purpleVeryLight
                        : "transparent",
                    color: isActive
                        ? theme.theme.colors.primary.purple
                        : isDark
                          ? theme.theme.colors.primary.white
                          : theme.theme.colors.primary.black,
                }}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                            theme.theme.colors.primary.purpleVeryLight;
                        e.currentTarget.style.color =
                            theme.theme.colors.primary.purple;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = isDark
                            ? theme.theme.colors.primary.white
                            : theme.theme.colors.primary.black;
                    }
                }}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <IconComponent size={20} className="flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                    <div
                        className="px-2 py-1 rounded-full text-xs font-bold ml-auto"
                        style={{
                            backgroundColor: theme.theme.colors.accent.pink,
                            color: theme.theme.colors.primary.white,
                        }}
                    >
                        {item.badge}
                    </div>
                )}
                {isActive && (
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                        style={{
                            backgroundColor: theme.theme.colors.primary.purple,
                        }}
                    />
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg"
                style={{
                    backgroundColor: theme.theme.colors.primary.purple,
                    color: theme.theme.colors.primary.white,
                }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="메뉴 열기/닫기"
            >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 h-full w-64 z-40
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:z-0
                    ${
                        isMobileMenuOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }
                `}
                style={{
                    backgroundColor: isDark
                        ? theme.theme.colors.background.dark
                        : theme.theme.colors.background.main,
                    borderRight: `1px solid ${
                        isDark
                            ? theme.theme.colors.primary.darkGray
                            : theme.theme.colors.primary.purpleVeryLight
                    }`,
                }}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div
                        className="p-6 border-b border-opacity-20"
                        style={{
                            borderColor: isDark
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                        }}
                    >
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                                style={{
                                    background:
                                        theme.theme.colors.background.gradient,
                                    color: theme.theme.colors.primary.white,
                                }}
                            >
                                E
                            </div>
                            <h1 className="text-gradient font-display text-2xl font-bold">
                                epiksode
                            </h1>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                        {navigationSections.map((section) => (
                            <div key={section.title}>
                                <h3
                                    className="text-xs font-bold uppercase tracking-wider mb-3 px-4"
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.gray
                                            : theme.theme.colors.primary
                                                  .darkGray,
                                    }}
                                >
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.items.map(renderNavigationItem)}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Settings */}
                    <div
                        className="p-4 border-t border-opacity-20"
                        style={{
                            borderColor: isDark
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                        }}
                    >
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:transform hover:translateX(2px)"
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
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                                e.currentTarget.style.color = isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black;
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Settings size={20} className="flex-shrink-0" />
                            <span>설정</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-2"
                style={{
                    backgroundColor: isDark
                        ? theme.theme.colors.background.dark
                        : theme.theme.colors.background.main,
                    borderTop: `1px solid ${
                        isDark
                            ? theme.theme.colors.primary.darkGray
                            : theme.theme.colors.primary.purpleVeryLight
                    }`,
                }}
            >
                <div className="flex justify-around items-center">
                    {[
                        { name: "홈", href: "/", icon: Home },
                        { name: "검색", href: "/search", icon: Search },
                        { name: "업로드", href: "/upload", icon: Upload },
                        { name: "프로필", href: "/profile", icon: Settings },
                    ].map((item) => {
                        const isActive = isActiveLink(item.href);
                        const IconComponent = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300"
                                style={{
                                    color: isActive
                                        ? theme.theme.colors.primary.purple
                                        : isDark
                                          ? theme.theme.colors.primary.white
                                          : theme.theme.colors.primary.black,
                                }}
                            >
                                <IconComponent size={20} />
                                <span className="text-xs font-medium">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
