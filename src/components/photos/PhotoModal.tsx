"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useThemeContext } from "../../../frontend-theme-system/components/ThemeProvider";
import PhotoImage from "../images/PhotoImage";
import Image from "next/image";
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
import { PhotoDetail, CommentDetail } from "@/types";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface PhotoModalProps {
    photo: PhotoDetail;
    isOpen: boolean;
    onClose: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
    onLike?: (photoId: number) => void;
    onFollow?: (userId: number) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = memo(({
    photo,
    isOpen,
    onClose,
    onNext,
    onPrevious,
    hasNext = false,
    hasPrevious = false,
    onLike,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFollow: _onFollow,
}) => {
    const { theme, isDark } = useThemeContext();
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<'comments' | 'info'>('comments');
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [comments, setComments] = useState<CommentDetail[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [commentSubmitting, setCommentSubmitting] = useState(false);

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

    // 댓글 로드
    const loadComments = useCallback(async () => {
        if (!photo?.id) return;
        
        try {
            setCommentsLoading(true);
            setCommentsError(null);
            
            const response = await apiClient.getComments(photo.id);
            // API 응답이 CommentListResponse 형태라고 가정
            const commentsData = Array.isArray(response) ? response : response.comments || [];
            setComments(commentsData);
        } catch (error) {
            console.error('댓글 로드 실패:', error);
            const errorMessage = getErrorMessage(error);
            setCommentsError(errorMessage);
            toast.error(`댓글을 불러올 수 없습니다: ${errorMessage}`);
        } finally {
            setCommentsLoading(false);
        }
    }, [photo?.id]);

    // 모달이 열리고 사진이 변경될 때 댓글 로드
    useEffect(() => {
        if (isOpen && photo?.id) {
            loadComments();
        }
    }, [isOpen, photo?.id, loadComments]);

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

    const handleAddComment = useCallback(async () => {
        if (!newComment.trim() || commentSubmitting) return;
        
        if (!isAuthenticated) {
            toast.error('댓글을 작성하려면 로그인해주세요.');
            return;
        }

        try {
            setCommentSubmitting(true);
            
            const commentData = {
                content: newComment,
                photoId: photo.id,
                parentId: replyingTo,
                seriesId: undefined
            };

            // 실제 API 호출
            const newCommentResponse = await apiClient.createComment(commentData);
            
            if (replyingTo) {
                // 답글인 경우 - 해당 댓글의 replies 배열에 추가
                setComments(prev =>
                    prev.map(comment =>
                        comment.id === replyingTo
                            ? {
                                ...comment,
                                replies: [...(comment.replies || []), newCommentResponse],
                                repliesCount: (comment.repliesCount || 0) + 1,
                            }
                            : comment
                    )
                );
            } else {
                // 새 댓글인 경우 - 댓글 목록 상단에 추가
                setComments(prev => [newCommentResponse, ...prev]);
            }
            
            setNewComment("");
            setReplyingTo(null);
            toast.success('댓글이 추가되었습니다.');
            
        } catch (error) {
            console.error('댓글 추가 실패:', error);
            const errorMessage = getErrorMessage(error);
            toast.error(`댓글 추가 실패: ${errorMessage}`);
        } finally {
            setCommentSubmitting(false);
        }
    }, [newComment, replyingTo, photo.id, isAuthenticated, commentSubmitting]);

    // 댓글 좋아요 핸들러 (TODO: 댓글 좋아요 API가 구현되면 연동)
    const handleCommentLike = useCallback(async (commentId: number, isReply: boolean = false, parentId?: number) => {
        if (!isAuthenticated) {
            toast.error('좋아요를 누르려면 로그인해주세요.');
            return;
        }

        // 낙관적 업데이트 (UI 먼저 업데이트)
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
                                        isLikedByCurrentUser: !reply.isLikedByCurrentUser,
                                        likesCount: reply.isLikedByCurrentUser ? reply.likesCount - 1 : reply.likesCount + 1,
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
                            isLikedByCurrentUser: !comment.isLikedByCurrentUser,
                            likesCount: comment.isLikedByCurrentUser ? comment.likesCount - 1 : comment.likesCount + 1,
                        }
                        : comment
                )
            );
        }
        
        // TODO: 댓글 좋아요 API가 구현되면 여기에 실제 API 호출 추가
        // try {
        //     await apiClient.toggleCommentLike({ commentId });
        // } catch (error) {
        //     // API 실패 시 이전 상태로 되돌리기
        //     console.error('댓글 좋아요 실패:', error);
        //     toast.error('좋아요 처리 중 오류가 발생했습니다.');
        // }
    }, [isAuthenticated]);

    // 답글 작성 시작
    const handleStartReply = useCallback((commentId: number) => {
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
                    <PhotoImage
                        photoId={photo.id}
                        src={photo.imageUrl}
                        alt={photo.title}
                        fill
                        objectFit="contain"
                        priority
                        showPlaceholder
                        onError={(error: Error) => {
                            console.error('PhotoModal: 이미지 로딩 실패', error);
                        }}
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
                                    fill={photo.isLikedByCurrentUser ? "currentColor" : "none"}
                                    className={photo.isLikedByCurrentUser ? "text-red-500" : ""}
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
                                {photo.author.profileImageUrl ? (
                                    <Image
                                        src={photo.author.profileImageUrl}
                                        alt={photo.author.username}
                                        width={48}
                                        height={48}
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
                                        {photo.author.username.charAt(0).toUpperCase()}
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
                                        {photo.author.username}
                                    </h3>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: isDark
                                                ? theme.theme.colors.primary.gray
                                                : theme.theme.colors.primary.darkGray,
                                        }}
                                    >
                                        @{photo.author.username}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* 팔로우 버튼 - 백엔드 API 확장 필요 */}
                                {/* <button
                                    onClick={() => onFollow?.(photo.author.id)}
                                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                                    style={{
                                        backgroundColor: theme.theme.colors.primary.purple,
                                        color: theme.theme.colors.primary.white,
                                        border: `1px solid ${theme.theme.colors.primary.purple}`,
                                    }}
                                >
                                    팔로우
                                </button> */}
                                
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
                                    color: photo.isLikedByCurrentUser
                                        ? theme.theme.colors.accent.pink
                                        : isDark
                                        ? theme.theme.colors.primary.gray
                                        : theme.theme.colors.primary.darkGray,
                                }}
                            >
                                <Heart size={14} fill={photo.isLikedByCurrentUser ? "currentColor" : "none"} />
                                {photo.likesCount.toLocaleString()}
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
                                {photo.commentsCount}
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
                                {photo.viewCount}
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
                                <div className="flex-1 overflow-y-auto p-4">
                                    {commentsLoading ? (
                                        // 로딩 상태
                                        <div className="flex items-center justify-center py-8">
                                            <div 
                                                className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full"
                                                style={{
                                                    borderColor: theme.theme.colors.primary.purple,
                                                    borderTopColor: "transparent",
                                                }}
                                            />
                                            <span 
                                                className="ml-2 text-sm"
                                                style={{
                                                    color: isDark
                                                        ? theme.theme.colors.primary.gray
                                                        : theme.theme.colors.primary.darkGray,
                                                }}
                                            >
                                                댓글을 불러오는 중...
                                            </span>
                                        </div>
                                    ) : commentsError ? (
                                        // 에러 상태
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <p 
                                                className="text-sm text-center mb-4"
                                                style={{ color: theme.theme.colors.accent.pink }}
                                            >
                                                댓글을 불러올 수 없습니다
                                            </p>
                                            <button 
                                                onClick={loadComments}
                                                className="px-4 py-2 rounded text-sm font-medium"
                                                style={{ 
                                                    backgroundColor: theme.theme.colors.primary.purple,
                                                    color: theme.theme.colors.primary.white
                                                }}
                                            >
                                                다시 시도
                                            </button>
                                        </div>
                                    ) : comments.length === 0 ? (
                                        // 댓글 없음
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <MessageCircle 
                                                size={48} 
                                                className="mb-4 opacity-50"
                                                style={{
                                                    color: isDark
                                                        ? theme.theme.colors.primary.gray
                                                        : theme.theme.colors.primary.darkGray,
                                                }}
                                            />
                                            <p 
                                                className="text-sm text-center"
                                                style={{
                                                    color: isDark
                                                        ? theme.theme.colors.primary.gray
                                                        : theme.theme.colors.primary.darkGray,
                                                }}
                                            >
                                                아직 댓글이 없습니다<br/>
                                                첫 번째 댓글을 남겨보세요!
                                            </p>
                                        </div>
                                    ) : (
                                        // 댓글 목록
                                        <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="space-y-3">
                                            {/* Main Comment */}
                                            <div className="flex items-start gap-3">
                                                {comment.author.profileImageUrl ? (
                                                    <Image
                                                        src={comment.author.profileImageUrl}
                                                        alt={comment.author.username}
                                                        width={32}
                                                        height={32}
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
                                                        {comment.author.username.charAt(0).toUpperCase()}
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
                                                            {comment.author.username}
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
                                                                color: comment.isLikedByCurrentUser
                                                                    ? theme.theme.colors.accent.pink
                                                                    : isDark
                                                                    ? theme.theme.colors.primary.gray
                                                                    : theme.theme.colors.primary.darkGray,
                                                            }}
                                                        >
                                                            <Heart size={12} fill={comment.isLikedByCurrentUser ? "currentColor" : "none"} />
                                                            {comment.likesCount > 0 && comment.likesCount}
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
                                                            {reply.author.profileImageUrl ? (
                                                                <Image
                                                                    src={reply.author.profileImageUrl}
                                                                    alt={reply.author.username}
                                                                    width={24}
                                                                    height={24}
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
                                                                    {reply.author.username.charAt(0).toUpperCase()}
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
                                                                        {reply.author.username}
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
                                                                        color: reply.isLikedByCurrentUser
                                                                            ? theme.theme.colors.accent.pink
                                                                            : isDark
                                                                            ? theme.theme.colors.primary.gray
                                                                            : theme.theme.colors.primary.darkGray,
                                                                    }}
                                                                >
                                                                    <Heart size={10} fill={reply.isLikedByCurrentUser ? "currentColor" : "none"} />
                                                                    {reply.likesCount > 0 && reply.likesCount}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                        </div>
                                    )}

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
                                            disabled={!newComment.trim() || commentSubmitting}
                                            className="p-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center"
                                            style={{
                                                backgroundColor: replyingTo 
                                                    ? theme.theme.colors.accent.pink
                                                    : theme.theme.colors.primary.purple,
                                                color: theme.theme.colors.primary.white,
                                                minWidth: '40px', // 고정 너비로 로딩 중 레이아웃 방지
                                            }}
                                        >
                                            {commentSubmitting ? (
                                                <div 
                                                    className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full"
                                                    style={{
                                                        borderColor: 'currentColor',
                                                        borderTopColor: 'transparent',
                                                    }}
                                                />
                                            ) : (
                                                <Send size={16} />
                                            )}
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
});

PhotoModal.displayName = 'PhotoModal';

export default PhotoModal;