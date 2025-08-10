"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import {
    X,
    Heart,
    Share2,
    Download,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Send,
    MoreHorizontal,
    Flag,
    Eye,
} from "lucide-react";
import { PhotoData, Comment } from "@/types";

interface PhotoModalProps {
    photo: PhotoData;
    isOpen: boolean;
    onClose: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
    onLike?: (photoId: string) => void;
    onFollow?: (userId: string) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
    photo,
    isOpen,
    onClose,
    onNext,
    onPrevious,
    hasNext = false,
    hasPrevious = false,
    onLike,
    onFollow,
}) => {
    const { theme, isDark } = useThemeContext();
    const [activeTab, setActiveTab] = useState<'comments' | 'info'>('comments');
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([
        {
            id: "1",
            user: { name: "김자연", username: "nature_kim", avatar: "" },
            content: "정말 아름다운 사진이네요! 어느 장소인가요?",
            createdAt: "2024-08-10T10:30:00Z",
            likes: 5,
            isLiked: false,
            replies: [
                {
                    id: "1-1",
                    user: { name: "현재 사용자", username: "current_user", avatar: "" },
                    content: "지리산 국립공원입니다! 새벽 5시경에 찍었어요.",
                    createdAt: "2024-08-10T10:45:00Z",
                    likes: 2,
                    isLiked: false,
                    isReply: true,
                    parentId: "1",
                },
            ],
        },
        {
            id: "2",
            user: { name: "박사진", username: "photo_park", avatar: "" },
            content: "빛의 표현이 예술적입니다 👏",
            createdAt: "2024-08-10T11:15:00Z",
            likes: 3,
            isLiked: true,
            replies: [],
        },
    ]);
    const [isImageLoading, setIsImageLoading] = useState(true);

    // 키보드 네비게이션
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    if (hasPrevious && onPrevious) {
                        onPrevious();
                    }
                    break;
                case 'ArrowRight':
                    if (hasNext && onNext) {
                        onNext();
                    }
                    break;
                case 'l':
                case 'L':
                    if (onLike) {
                        onLike(photo.id);
                    }
                    break;
                case 'b':
                case 'B':
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, hasNext, hasPrevious, onNext, onPrevious, onClose, onLike, photo.id]);

    // 모달 오픈 시 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleAddComment = useCallback(() => {
        if (!newComment.trim()) return;

        if (replyingTo) {
            // 답글 추가
            const reply: Comment = {
                id: `reply-${replyingTo}-${comments.length}-${Math.random().toString(36).substring(7)}`,
                user: {
                    name: "현재 사용자",
                    username: "current_user",
                    avatar: "",
                },
                content: newComment,
                createdAt: new Date().toISOString(),
                likes: 0,
                isLiked: false,
                isReply: true,
                parentId: replyingTo,
            };

            setComments(prev =>
                prev.map(comment =>
                    comment.id === replyingTo
                        ? {
                            ...comment,
                            replies: [...(comment.replies || []), reply], // 시간순 정렬 (새 답글을 뒤에 추가)
                        }
                        : comment
                )
            );
            setReplyingTo(null);
        } else {
            // 새 댓글 추가
            const comment: Comment = {
                id: `comment-${comments.length}-${Math.random().toString(36).substring(7)}`,
                user: {
                    name: "현재 사용자",
                    username: "current_user",
                    avatar: "",
                },
                content: newComment,
                createdAt: new Date().toISOString(),
                likes: 0,
                isLiked: false,
                replies: [],
            };

            setComments(prev => [comment, ...prev]);
        }
        
        setNewComment("");
    }, [newComment, replyingTo]);

    // 댓글 좋아요 핸들러
    const handleCommentLike = useCallback((commentId: string, isReply: boolean = false, parentId?: string) => {
        if (isReply && parentId) {
            // 답글 좋아요
            setComments(prev =>
                prev.map(comment =>
                    comment.id === parentId
                        ? {
                            ...comment,
                            replies: comment.replies?.map(reply =>
                                reply.id === commentId
                                    ? {
                                        ...reply,
                                        isLiked: !reply.isLiked,
                                        likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                                    }
                                    : reply
                            ),
                        }
                        : comment
                )
            );
        } else {
            // 일반 댓글 좋아요
            setComments(prev =>
                prev.map(comment =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            isLiked: !comment.isLiked,
                            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                        }
                        : comment
                )
            );
        }
    }, []);

    // 답글 작성 시작
    const handleStartReply = useCallback((commentId: string) => {
        setReplyingTo(commentId);
        setNewComment("");
    }, []);

    // 답글 취소
    const handleCancelReply = useCallback(() => {
        setReplyingTo(null);
        setNewComment("");
    }, []);

    // 총 댓글 수 계산 (답글 포함)
    const totalCommentsCount = useMemo(() => {
        return comments.reduce((total, comment) => {
            return total + 1 + (comment.replies?.length || 0);
        }, 0);
    }, [comments]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return "방금 전";
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return date.toLocaleDateString('ko-KR');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-3 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                aria-label="닫기"
            >
                <X size={24} />
            </button>

            {/* Navigation Arrows */}
            {hasPrevious && onPrevious && (
                <button
                    onClick={onPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                    aria-label="이전 사진"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {hasNext && onNext && (
                <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                    aria-label="다음 사진"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Modal Content */}
            <div className="w-full h-full max-w-7xl mx-auto grid lg:grid-cols-3 gap-0">
                {/* Image Section */}
                <div className="lg:col-span-2 relative flex items-center justify-center bg-black">
                    {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div
                                className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
                                style={{
                                    borderColor: theme.theme.colors.primary.white,
                                    borderTopColor: "transparent",
                                }}
                            />
                        </div>
                    )}
                    
                    <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                            isImageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => setIsImageLoading(false)}
                    />


                    {/* Image Actions Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        </div>
                        
                        <div className="flex items-center gap-2">
                            
                            <button
                                onClick={() => onLike?.(photo.id)}
                                className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200"
                            >
                                <Heart
                                    size={20}
                                    fill={photo.isLiked ? "currentColor" : "none"}
                                    className={photo.isLiked ? "text-red-500" : ""}
                                />
                            </button>
                            
                            <button className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200">
                                <Share2 size={20} />
                            </button>
                            
                            <button className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div
                    className="flex flex-col h-full"
                    style={{
                        backgroundColor: isDark
                            ? theme.theme.colors.background.dark
                            : theme.theme.colors.background.main,
                    }}
                >
                    {/* Photo Header */}
                    <div className="p-4 border-b"
                        style={{
                            borderColor: isDark
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                        }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {photo.photographer.avatar ? (
                                    <img
                                        src={photo.photographer.avatar}
                                        alt={photo.photographer.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                                        style={{
                                            backgroundColor: theme.theme.colors.primary.purple,
                                            color: theme.theme.colors.primary.white,
                                        }}
                                    >
                                        {photo.photographer.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                
                                <div>
                                    <h3
                                        className="font-bold"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.white
                                                : theme.theme.colors.primary.black,
                                        }}
                                    >
                                        {photo.photographer.name}
                                    </h3>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        @{photo.photographer.username}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onFollow?.(photo.photographer.id)}
                                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                                    style={{
                                        backgroundColor: photo.photographer.isFollowing
                                            ? 'transparent'
                                            : theme.theme.colors.primary.purple,
                                        color: photo.photographer.isFollowing
                                            ? theme.theme.colors.primary.purple
                                            : theme.theme.colors.primary.white,
                                        border: `1px solid ${theme.theme.colors.primary.purple}`,
                                    }}
                                >
                                    {photo.photographer.isFollowing ? '팔로잉' : '팔로우'}
                                </button>
                                
                                <button
                                    className="p-2 rounded-full transition-colors"
                                    style={{
                                        color: isDark
                                            ? theme.theme.colors.primary.gray
                                            : theme.theme.colors.primary.darkGray,
                                    }}
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        </div>

                        <h2
                            className="text-lg font-bold mb-2"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.white
                                    : theme.theme.colors.primary.black,
                            }}
                        >
                            {photo.title}
                        </h2>

                        {photo.description && (
                            <p
                                className="text-sm mb-3"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.white
                                        : theme.theme.colors.primary.black,
                                }}
                            >
                                {photo.description}
                            </p>
                        )}

                        <div className="flex items-center gap-4 text-sm mb-3">
                            <span
                                className="flex items-center gap-1"
                                style={{
                                    color: photo.isLiked
                                        ? theme.theme.colors.accent.pink
                                        : isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                <Heart size={14} fill={photo.isLiked ? "currentColor" : "none"} />
                                {photo.likes.toLocaleString()}
                            </span>
                            
                            <span
                                className="flex items-center gap-1"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                <MessageCircle size={14} />
                                {photo.comments}
                            </span>
                            
                            <span
                                className="flex items-center gap-1"
                                style={{
                                    color: isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                <Eye size={14} />
0
                            </span>
                        </div>

                        <p
                            className="text-xs"
                            style={{
                                color: isDark
                                    ? theme.theme.colors.primary.gray
                                    : theme.theme.colors.primary.darkGray,
                            }}
                        >
                            {formatDate(photo.createdAt)}
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div
                        className="flex border-b"
                        style={{
                            borderColor: isDark
                                ? theme.theme.colors.primary.darkGray
                                : theme.theme.colors.primary.purpleVeryLight,
                        }}
                    >
                        {[
                            { key: 'comments' as const, label: '댓글', count: totalCommentsCount },
                            { key: 'info' as const, label: '정보', count: null },
                        ].map((tab) => {
                            const isActive = activeTab === tab.key;
                            
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 border-b-2 ${
                                        isActive ? 'border-opacity-100' : 'border-opacity-0'
                                    }`}
                                    style={{
                                        color: isActive
                                            ? theme.theme.colors.primary.purple
                                            : isDark
                                            ? theme.theme.colors.primary.gray
                                            : theme.theme.colors.primary.darkGray,
                                        borderColor: theme.theme.colors.primary.purple,
                                    }}
                                >
                                    {tab.label} {tab.count !== null && `(${tab.count})`}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'comments' && (
                            <div className="h-full flex flex-col">
                                {/* Comments List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="space-y-3">
                                            {/* Main Comment */}
                                            <div className="flex items-start gap-3">
                                                {comment.user.avatar ? (
                                                    <img
                                                        src={comment.user.avatar}
                                                        alt={comment.user.name}
                                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                        style={{
                                                            backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                                                            color: theme.theme.colors.primary.purple,
                                                        }}
                                                    >
                                                        {comment.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                            className="text-sm font-medium"
                                                            style={{
                                                                color: isDark
                                                                    ? theme.theme.colors.primary.white
                                                                    : theme.theme.colors.primary.black,
                                                            }}
                                                        >
                                                            {comment.user.name}
                                                        </span>
                                                        <span
                                                            className="text-xs"
                                                            style={{
                                                                color: isDark
                                                                    ? theme.theme.colors.primary.gray
                                                                    : theme.theme.colors.primary.darkGray,
                                                            }}
                                                        >
                                                            {formatDate(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    
                                                    <p
                                                        className="text-sm mb-2"
                                                        style={{
                                                            color: isDark
                                                                ? theme.theme.colors.primary.white
                                                                : theme.theme.colors.primary.black,
                                                        }}
                                                    >
                                                        {comment.content}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => handleCommentLike(comment.id)}
                                                            className="flex items-center gap-1 text-xs transition-colors hover:scale-105"
                                                            style={{
                                                                color: comment.isLiked
                                                                    ? theme.theme.colors.accent.pink
                                                                    : isDark
                                                                    ? theme.theme.colors.primary.gray
                                                                    : theme.theme.colors.primary.darkGray,
                                                            }}
                                                        >
                                                            <Heart size={12} fill={comment.isLiked ? "currentColor" : "none"} />
                                                            {comment.likes > 0 && comment.likes}
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => handleStartReply(comment.id)}
                                                            className="text-xs transition-colors hover:scale-105"
                                                            style={{
                                                                color: replyingTo === comment.id
                                                                    ? theme.theme.colors.primary.purple
                                                                    : isDark
                                                                    ? theme.theme.colors.primary.gray
                                                                    : theme.theme.colors.primary.darkGray,
                                                            }}
                                                        >
                                                            답글
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="ml-11 space-y-3">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="flex items-start gap-3">
                                                            {reply.user.avatar ? (
                                                                <img
                                                                    src={reply.user.avatar}
                                                                    alt={reply.user.name}
                                                                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                                    style={{
                                                                        backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                                                                        color: theme.theme.colors.primary.purple,
                                                                    }}
                                                                >
                                                                    {reply.user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span
                                                                        className="text-xs font-medium"
                                                                        style={{
                                                                            color: isDark
                                                                                ? theme.theme.colors.primary.white
                                                                                : theme.theme.colors.primary.black,
                                                                        }}
                                                                    >
                                                                        {reply.user.name}
                                                                    </span>
                                                                    <span
                                                                        className="text-xs"
                                                                        style={{
                                                                            color: isDark
                                                                                ? theme.theme.colors.primary.gray
                                                                                : theme.theme.colors.primary.darkGray,
                                                                        }}
                                                                    >
                                                                        {formatDate(reply.createdAt)}
                                                                    </span>
                                                                </div>
                                                                
                                                                <p
                                                                    className="text-xs mb-1"
                                                                    style={{
                                                                        color: isDark
                                                                            ? theme.theme.colors.primary.white
                                                                            : theme.theme.colors.primary.black,
                                                                    }}
                                                                >
                                                                    {reply.content}
                                                                </p>
                                                                
                                                                <button
                                                                    onClick={() => handleCommentLike(reply.id, true, comment.id)}
                                                                    className="flex items-center gap-1 text-xs transition-colors hover:scale-105"
                                                                    style={{
                                                                        color: reply.isLiked
                                                                            ? theme.theme.colors.accent.pink
                                                                            : isDark
                                                                            ? theme.theme.colors.primary.gray
                                                                            : theme.theme.colors.primary.darkGray,
                                                                    }}
                                                                >
                                                                    <Heart size={10} fill={reply.isLiked ? "currentColor" : "none"} />
                                                                    {reply.likes > 0 && reply.likes}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Comment Input */}
                                <div
                                    className="p-4 border-t"
                                    style={{
                                        borderColor: isDark
                                            ? theme.theme.colors.primary.darkGray
                                            : theme.theme.colors.primary.purpleVeryLight,
                                    }}
                                >
                                    {/* Reply Context */}
                                    {replyingTo && (
                                        <div className="mb-3 flex items-center gap-2 text-sm">
                                            <span
                                                style={{
                                                    color: isDark
                                                        ? theme.theme.colors.primary.gray
                                                        : theme.theme.colors.primary.darkGray,
                                                }}
                                            >
                                                답글 작성 중...
                                            </span>
                                            <button
                                                onClick={handleCancelReply}
                                                className="text-xs px-2 py-1 rounded transition-colors"
                                                style={{
                                                    backgroundColor: theme.theme.colors.primary.purpleVeryLight,
                                                    color: theme.theme.colors.primary.purple,
                                                }}
                                            >
                                                취소
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-end gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder={replyingTo ? "답글을 작성하세요..." : "댓글을 작성하세요..."}
                                            className="flex-1 px-3 py-2 border rounded-lg resize-none text-sm"
                                            style={{
                                                backgroundColor: isDark
                                                    ? theme.theme.colors.background.dark
                                                    : theme.theme.colors.background.main,
                                                borderColor: replyingTo 
                                                    ? theme.theme.colors.primary.purple
                                                    : isDark
                                                    ? theme.theme.colors.primary.darkGray
                                                    : theme.theme.colors.primary.purpleVeryLight,
                                                color: isDark
                                                    ? theme.theme.colors.primary.white
                                                    : theme.theme.colors.primary.black,
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddComment();
                                                }
                                                if (e.key === 'Escape') {
                                                    handleCancelReply();
                                                }
                                            }}
                                            autoFocus={!!replyingTo}
                                        />
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                            className="p-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                            style={{
                                                backgroundColor: replyingTo 
                                                    ? theme.theme.colors.accent.pink
                                                    : theme.theme.colors.primary.purple,
                                                color: theme.theme.colors.primary.white,
                                            }}
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="p-4 space-y-4 overflow-y-auto h-full">

                                {/* Report Button */}
                                <button
                                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
                                >
                                    <Flag size={16} />
                                    신고하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoModal;