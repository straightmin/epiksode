/**
 * 인증 컨텍스트
 * 
 * JWT 기반 사용자 인증 상태를 전역적으로 관리
 * 로그인, 로그아웃, 사용자 정보 등을 제공
 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient, ApiClientError, getErrorMessage } from '@/lib/api-client';
import { User, LoginRequest, RegisterRequest } from '@/types';

// =============================================================================
// 🔧 타입 정의
// =============================================================================

/** 인증 상태 */
interface AuthState {
    /** 현재 로그인된 사용자 정보 */
    user: User | null;
    /** 로그인 여부 */
    isAuthenticated: boolean;
    /** 인증 상태 로딩 중 여부 */
    isLoading: boolean;
    /** 에러 메시지 */
    error: string | null;
}

/** 인증 액션들 */
interface AuthActions {
    /** 로그인 */
    login: (credentials: LoginRequest) => Promise<boolean>;
    /** 회원가입 */
    register: (userData: RegisterRequest) => Promise<boolean>;
    /** 로그아웃 */
    logout: () => Promise<void>;
    /** 사용자 정보 새로고침 */
    refreshUser: () => Promise<void>;
    /** 에러 클리어 */
    clearError: () => void;
    /** 프로필 업데이트 */
    updateProfile: (updates: { username?: string; bio?: string; profileImageUrl?: string }) => Promise<boolean>;
}

/** 전체 컨텍스트 타입 */
type AuthContextType = AuthState & AuthActions;

// =============================================================================
// 🎯 컨텍스트 생성
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// 📦 Provider 컴포넌트
// =============================================================================

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // 상태 관리
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 계산된 값
    const isAuthenticated = !!user && apiClient.isAuthenticated();

    // =============================================================================
    // 🔧 내부 헬퍼 함수들
    // =============================================================================

    /** 에러 처리 헬퍼 */
    const handleError = useCallback((error: unknown) => {
        console.error('Auth Error:', error);
        const message = getErrorMessage(error);
        setError(message);
        
        // 인증 에러인 경우 사용자 정보 클리어
        if (error instanceof ApiClientError && error.isAuthError) {
            setUser(null);
            apiClient.clearToken();
        }
    }, []);

    /** 로딩 상태 관리 헬퍼 */
    const withLoading = useCallback(async <T,>(
        asyncFn: () => Promise<T>
    ): Promise<T | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await asyncFn();
            return result;
        } catch (error) {
            handleError(error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    // =============================================================================
    // 📤 공개 액션들
    // =============================================================================

    /** 로그인 */
    const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
        const result = await withLoading(async () => {
            const response = await apiClient.login(credentials);
            setUser(response.user);
            return response;
        });

        return !!result;
    }, [withLoading]);

    /** 회원가입 */
    const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
        const result = await withLoading(async () => {
            const response = await apiClient.register(userData);
            setUser(response.user);
            return response;
        });

        return !!result;
    }, [withLoading]);

    /** 로그아웃 */
    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        
        try {
            await apiClient.logout();
        } catch (error) {
            console.warn('Logout error (continuing anyway):', error);
        } finally {
            setUser(null);
            apiClient.clearToken();
            setError(null);
            setIsLoading(false);
        }
    }, []);

    /** 사용자 정보 새로고침 */
    const refreshUser = useCallback(async (): Promise<void> => {
        // 토큰이 없으면 사용자 정보 클리어
        if (!apiClient.isAuthenticated()) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        await withLoading(async () => {
            const currentUser = await apiClient.getCurrentUser();
            setUser(currentUser);
            return currentUser;
        });
    }, [withLoading]);

    /** 프로필 업데이트 */
    const updateProfile = useCallback(async (updates: {
        username?: string;
        bio?: string;
        profileImageUrl?: string;
    }): Promise<boolean> => {
        const result = await withLoading(async () => {
            const updatedUser = await apiClient.updateProfile(updates);
            setUser(updatedUser);
            return updatedUser;
        });

        return !!result;
    }, [withLoading]);

    /** 에러 클리어 */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // =============================================================================
    // 🔄 초기화 및 생명주기
    // =============================================================================

    /** 초기 인증 상태 확인 */
    useEffect(() => {
        const initializeAuth = async () => {
            // 토큰이 있으면 사용자 정보 로드
            if (apiClient.isAuthenticated()) {
                setIsLoading(true);
                setError(null);
                
                try {
                    const currentUser = await apiClient.getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    handleError(error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        initializeAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ← Empty dependency array - runs only once on mount

    /** 토큰 만료 감지 */
    useEffect(() => {
        const checkTokenExpiry = () => {
            if (user && !apiClient.isAuthenticated()) {
                console.log('Token expired, logging out...');
                setUser(null);
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
            }
        };

        // 1분마다 토큰 만료 확인
        const interval = setInterval(checkTokenExpiry, 60 * 1000);
        
        return () => clearInterval(interval);
    }, [user]);

    /** 네트워크 재연결 시 사용자 정보 새로고침 */
    useEffect(() => {
        const handleOnline = async () => {
            if (isAuthenticated && !isLoading && apiClient.isAuthenticated()) {
                console.log('Network reconnected, refreshing user...');
                setIsLoading(true);
                setError(null);
                
                try {
                    const currentUser = await apiClient.getCurrentUser();
                    setUser(currentUser);
                } catch (error) {
                    handleError(error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, isLoading]); // Removed refreshUser from dependencies

    // =============================================================================
    // 🎯 컨텍스트 값 구성
    // =============================================================================

    const contextValue: AuthContextType = {
        // State
        user,
        isAuthenticated,
        isLoading,
        error,
        
        // Actions
        login,
        register,
        logout,
        refreshUser,
        clearError,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// =============================================================================
// 🪝 커스텀 훅
// =============================================================================

/** 인증 컨텍스트 사용 훅 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};

/** 인증 필요 여부 확인 훅 */
export const useRequireAuth = (): AuthContextType => {
    const auth = useAuth();
    
    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            console.warn('Authentication required but user is not logged in');
            // 여기에 리다이렉트 로직 추가 가능
        }
    }, [auth.isLoading, auth.isAuthenticated]);
    
    return auth;
};

/** 사용자 정보만 반환하는 간단한 훅 */
export const useUser = (): User | null => {
    const { user } = useAuth();
    return user;
};

/** 로그인 여부만 반환하는 간단한 훅 */
export const useIsAuthenticated = (): boolean => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
};

// =============================================================================
// 🛡️ 고차 컴포넌트 (HOC)
// =============================================================================

/** 인증이 필요한 컴포넌트를 래핑하는 HOC */
export function withAuth<P extends object>(
    Component: React.ComponentType<P>
) {
    const AuthenticatedComponent = (props: P) => {
        const { isAuthenticated, isLoading, error } = useAuth();

        // 로딩 중
        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                </div>
            );
        }

        // 인증되지 않음
        if (!isAuthenticated) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
                        <p className="text-gray-600">이 페이지에 접근하려면 로그인해주세요.</p>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>
                </div>
            );
        }

        // 인증됨 - 컴포넌트 렌더링
        return <Component {...props} />;
    };

    AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
    
    return AuthenticatedComponent;
}

// =============================================================================
// 📤 기본 내보내기
// =============================================================================

export default AuthProvider;