import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Next.js Image 컴포넌트용 외부 도메인 설정
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "3001",
                pathname: "/api/images/**",
            },
            {
                protocol: "https",
                hostname: "api.epiksode.com",
                pathname: "/api/images/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            // S3 버킷 도메인 (실제 업로드된 이미지)
            {
                protocol: "https",
                hostname:
                    "finger-snap-backend-photos-immi-2025.s3.ap-northeast-2.amazonaws.com",
                pathname: "/**",
            },
            // 개발 환경용 추가 호스트
            {
                protocol: "http",
                hostname: "127.0.0.1",
                port: "3001",
                pathname: "/api/images/**",
            },
        ],
    },

    // Next.js 15 최적화 설정
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },
};

export default nextConfig;
