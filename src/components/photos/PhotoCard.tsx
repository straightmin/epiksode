"use client";

import React, { useState } from "react";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { Heart, MessageCircle } from "lucide-react";
import { PhotoData } from "@/types";

interface PhotoCardProps {
    photo: PhotoData;
    onLike?: (photoId: string) => void;
    onClick?: (photoId: string) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
    photo,
    onLike,
    onClick,
}) => {
    const { theme, isDark } = useThemeContext();
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLike?.(photo.id);
    };


    const handleClick = () => {
        onClick?.(photo.id);
    };

    return (
        <div
            className="relative group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] mb-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            style={{
                backgroundColor: isDark
                    ? theme.theme.colors.background.dark
                    : theme.theme.colors.background.main,
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: isHovered
                    ? "0 8px 25px rgba(138, 92, 245, 0.15)"
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
        >
            {/* Image Container */}
            <div className="relative overflow-hidden">
                {/* Loading placeholder */}
                {!imageLoaded && (
                    <div
                        className="w-full aspect-[3/4] flex items-center justify-center animate-pulse"
                        style={{
                            backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                        }}
                    >
                        <div
                            className="text-sm font-medium"
                            style={{ color: theme.theme.colors.primary.purple }}
                        >
                            로딩 중...
                        </div>
                    </div>
                )}

                {/* Main Image */}
                <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className={`w-full h-auto object-cover transition-all duration-300 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                    } ${isHovered ? "scale-105" : "scale-100"}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                    style={{
                        minHeight: "200px",
                        maxHeight: "400px",
                    }}
                />


                {/* Hover Overlay with Actions */}
                <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {/* Top Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2">

                        <button
                            onClick={handleLike}
                            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                            style={{
                                backgroundColor: photo.isLiked
                                    ? theme.theme.colors.accent.pink
                                    : "rgba(255, 255, 255, 0.2)",
                                color: photo.isLiked
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.white,
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <Heart
                                size={16}
                                fill={photo.isLiked ? "currentColor" : "none"}
                            />
                        </button>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-1 truncate">
                            {photo.title}
                        </h3>
                        {photo.description && (
                            <p className="text-white/80 text-sm mb-2 line-clamp-2">
                                {photo.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {photo.photographer.avatar ? (
                                    <img
                                        src={photo.photographer.avatar}
                                        alt={photo.photographer.name}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{
                                            backgroundColor:
                                                theme.theme.colors.primary.purple,
                                            color: theme.theme.colors.primary.white,
                                        }}
                                    >
                                        {photo.photographer.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-white/90 text-sm font-medium">
                                    {photo.photographer.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Stats (Always visible) */}
            <div className="p-3">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Heart
                                size={14}
                                className={photo.isLiked ? "text-pink-500" : ""}
                                style={{
                                    color: photo.isLiked
                                        ? theme.theme.colors.accent.pink
                                        : isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                                fill={photo.isLiked ? "currentColor" : "none"}
                            />
                            <span
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.white
                                        : theme.theme.colors.primary.black,
                                }}
                            >
                                {photo.likes.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MessageCircle
                                size={14}
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            />
                            <span
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.white
                                        : theme.theme.colors.primary.black,
                                }}
                            >
                                {photo.comments}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoCard;