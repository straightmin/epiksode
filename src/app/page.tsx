"use client";

import { useThemeContext, DarkModeToggle } from "../../frontend-theme-system/components/ThemeProvider";

export default function Home() {
    const { theme, isDark } = useThemeContext();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 lg:p-12 animate-fade-in">
            {/* Header with Dark Mode Toggle */}
            <header className="absolute top-8 right-8">
                <DarkModeToggle />
            </header>

            {/* Hero Section */}
            <main className="flex flex-col items-center text-center max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 
                        className="font-display text-6xl md:text-7xl font-bold mb-6"
                        style={{
                            background: theme.theme.colors.background.gradient,
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        epiksode
                    </h1>
                    <p
                        className="text-xl md:text-2xl mb-8 leading-relaxed"
                        style={{
                            color: isDark
                                ? theme.theme.colors.primary.white
                                : theme.theme.colors.primary.black,
                            opacity: 0.8,
                        }}
                    >
                        사진 한 장에 담긴 에픽한 에피소드를 전 세계와 나누고,
                        <br />
                        감동적인 스토리를 발견하세요.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    <button
                        className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:transform hover:translateY(-2px) hover:shadow-lg"
                        style={{
                            backgroundColor: theme.theme.colors.primary.purple,
                            color: theme.theme.colors.primary.white,
                            border: `2px solid ${theme.theme.colors.primary.purple}`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                theme.theme.colors.primary.purpleDark;
                            e.currentTarget.style.boxShadow =
                                "0 8px 20px rgba(138, 92, 245, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                theme.theme.colors.primary.purple;
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        무료로 시작하기
                    </button>

                    <button
                        className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:transform hover:translateY(-1px)"
                        style={{
                            backgroundColor: "transparent",
                            color: theme.theme.colors.primary.purple,
                            border: `2px solid ${theme.theme.colors.primary.purple}`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                theme.theme.colors.primary.purpleVeryLight;
                            e.currentTarget.style.borderColor =
                                theme.theme.colors.primary.purpleDark;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor =
                                theme.theme.colors.primary.purple;
                        }}
                    >
                        둘러보기
                    </button>
                </div>

                {/* MVP Feature Highlights */}
                <div className="grid md:grid-cols-3 gap-8 w-full max-w-3xl">
                    <div 
                        className="text-center p-6 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:transform hover:translateY(-2px)"
                        style={{
                            backgroundColor: isDark 
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.8)",
                            borderColor: isDark
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                            boxShadow: "0 4px 20px rgba(138, 92, 245, 0.1)"
                        }}
                    >
                        <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor:
                                    theme.theme.colors.accent.pink + "20",
                            }}
                        >
                            <span
                                className="text-2xl font-bold"
                                style={{ color: theme.theme.colors.accent.pink }}
                            >
                                📸
                            </span>
                        </div>
                        <h3 
                            className="font-display text-xl font-bold mb-2"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        >
                            사진 업로드
                        </h3>
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                                opacity: 0.8,
                            }}
                        >
                            간단한 드래그 & 드롭으로 사진을 업로드하고 이야기를
                            공유하세요.
                        </p>
                    </div>

                    <div 
                        className="text-center p-6 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:transform hover:translateY(-2px)"
                        style={{
                            backgroundColor: isDark 
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.8)",
                            borderColor: isDark
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                            boxShadow: "0 4px 20px rgba(138, 92, 245, 0.1)"
                        }}
                    >
                        <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor:
                                    theme.theme.colors.accent.cyan + "20",
                            }}
                        >
                            <span
                                className="text-2xl font-bold"
                                style={{ color: theme.theme.colors.accent.cyan }}
                            >
                                📖
                            </span>
                        </div>
                        <h3 
                            className="font-display text-xl font-bold mb-2"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        >
                            시리즈 만들기
                        </h3>
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                                opacity: 0.8,
                            }}
                        >
                            연관된 사진들을 시리즈로 묶어 하나의 완성된
                            스토리를 만들어보세요.
                        </p>
                    </div>

                    <div 
                        className="text-center p-6 rounded-lg backdrop-blur-sm border transition-all duration-300 hover:transform hover:translateY(-2px)"
                        style={{
                            backgroundColor: isDark 
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(255, 255, 255, 0.8)",
                            borderColor: isDark
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                            boxShadow: "0 4px 20px rgba(138, 92, 245, 0.1)"
                        }}
                    >
                        <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor:
                                    theme.theme.colors.accent.yellow + "20",
                            }}
                        >
                            <span
                                className="text-2xl font-bold"
                                style={{
                                    color: theme.theme.colors.accent.yellow,
                                }}
                            >
                                💬
                            </span>
                        </div>
                        <h3 
                            className="font-display text-xl font-bold mb-2"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        >
                            소셜 기능
                        </h3>
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                                opacity: 0.8,
                            }}
                        >
                            좋아요, 댓글, 북마크로 다른 사용자들과
                            소통하고 공감하세요.
                        </p>
                    </div>
                </div>
            </main>

            {/* Status Badge */}
            <div
                className="fixed bottom-8 left-8 px-4 py-2 rounded-full text-sm font-medium"
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