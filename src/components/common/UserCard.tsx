"use client";

import React from "react";
import { User } from "lucide-react";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import { PublicUser } from "@/types";

interface UserCardProps {
    user: PublicUser;
    onClick?: () => void;
    className?: string;
}

/**
 * 사용자 정보를 표시하는 재사용 가능한 카드 컴포넌트
 */
const UserCard: React.FC<UserCardProps> = ({ user, onClick, className = "" }) => {
    const { theme, isDark } = useThemeContext();

    return (
        <div 
            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className}`}
            style={{
                backgroundColor: isDark
                    ? theme.theme.colors.background.dark
                    : theme.theme.colors.primary.white,
                borderColor: isDark
                    ? theme.theme.colors.primary.darkGray
                    : theme.theme.colors.primary.lightGray,
            }}
            onClick={onClick}
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
    );
};

export default UserCard;