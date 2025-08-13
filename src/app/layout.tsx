import type { Metadata } from "next";
import { Outfit, Gloock } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../../frontend-theme-system/components/ThemeProvider";
import MainLayout from "../components/layout/MainLayout";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const outfitFont = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
    display: "swap",
});

const gloockFont = Gloock({
    variable: "--font-gloock",
    subsets: ["latin"],
    weight: ["400"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "epiksode - 특별한 순간의 이야기를 공유하세요",
    description:
        "사진 한 장에 담긴 에픽한 에피소드를 전 세계와 나누고, 감동적인 스토리를 발견하세요. epiksode에서 당신만의 특별한 순간을 공유해보세요.",
    keywords: [
        "사진 공유",
        "스토리텔링",
        "에피소드",
        "사진 이야기",
        "창작 플랫폼",
        "포토 스토리",
    ],
    authors: [{ name: "epiksode Team" }],
    creator: "epiksode",
    publisher: "epiksode",
    openGraph: {
        type: "website",
        locale: "ko_KR",
        url: "https://epiksode.com",
        siteName: "epiksode",
        title: "epiksode - 특별한 순간의 이야기를 공유하세요",
        description:
            "사진 한 장에 담긴 에픽한 에피소드를 전 세계와 나누고, 감동적인 스토리를 발견하세요.",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "epiksode - 특별한 순간의 이야기",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@epiksode",
        creator: "@epiksode",
        title: "epiksode - 특별한 순간의 이야기를 공유하세요",
        description:
            "사진 한 장에 담긴 에픽한 에피소드를 전 세계와 나누고, 감동적인 스토리를 발견하세요.",
        images: ["/og-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body
                className={`${
                    outfitFont.variable
                } ${gloockFont.variable} font-outfit antialiased`}
            >
                <ThemeProvider defaultDark={false} storageKey="epiksode-theme">
                    <AuthProvider>
                        <MainLayout>{children}</MainLayout>
                    </AuthProvider>
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: "#363636",
                                color: "#fff",
                                borderRadius: "8px",
                                padding: "16px",
                            },
                            success: {
                                iconTheme: {
                                    primary: "#10b981",
                                    secondary: "#fff",
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: "#ef4444",
                                    secondary: "#fff",
                                },
                            },
                        }}
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}
