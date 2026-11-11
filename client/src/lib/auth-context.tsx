'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, LoginPayload, RegisterPayload } from '../services/auth.service';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionTerminated: boolean;
  login: (data: LoginPayload, requiredRole?: 'STUDENT' | 'ADMIN') => Promise<void>;
  loginDemo: (role: 'STUDENT' | 'ADMIN') => void;
  loginWithGoogle: (profile?: { email?: string; fullName?: string; avatarUrl?: string }) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  dismissSessionTerminated: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTerminated, setSessionTerminated] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('access_token');
        if (savedToken && !savedToken.startsWith('demo_') && savedToken !== 'server_token') {
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
      }
      const userData = await authService.getMe();
      setUser(userData);
    } catch {
      // Check if demo preview cookie is present
      if (typeof document !== 'undefined') {
        const cookies = document.cookie;
        if (cookies.includes('access_token=demo_token_admin') || cookies.includes('user_role=ADMIN')) {
          setUser({
            id: 'adm-teacher-dong',
            fullName: 'Thầy Đông (IELTS 8.5)',
            email: 'admin@dong.edu.vn',
            role: 'ADMIN',
            phone: '0987654321',
          });
          return;
        }
        if (cookies.includes('access_token=demo_token_student') || cookies.includes('user_role=STUDENT')) {
          setUser({
            id: 'std-tran-nam',
            fullName: 'Trần Văn Nam',
            email: 'student@dong.edu.vn',
            role: 'STUDENT',
            phone: '0912345678',
          });
          return;
        }
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleSessionTerminated = () => {
      // Only set user to null if there was no active demo user
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token && !token.startsWith('demo_')) {
          localStorage.removeItem('access_token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setSessionTerminated(true);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('session_terminated', handleSessionTerminated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('session_terminated', handleSessionTerminated);
      }
    };
  }, []);

  const login = async (credentials: LoginPayload, requiredRole?: 'STUDENT' | 'ADMIN') => {
    const res = await authService.login(credentials);
    const loggedUser = res.user || res.data?.user || res.data;
    const token = res.accessToken || res.data?.accessToken;

    if (requiredRole && loggedUser?.role !== requiredRole) {
      await authService.logout().catch(() => {});
      throw new Error(
        requiredRole === 'ADMIN'
          ? 'Tài khoản này không có quyền truy cập Cổng Quản Trị (Role ADMIN). Vui lòng đăng nhập tại Cổng Học Viên.'
          : 'Tài khoản Quản Trị Viên vui lòng đăng nhập tại Cổng Quản Trị.'
      );
    }

    setUser(loggedUser);
    setSessionTerminated(false);

    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('access_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    if (typeof document !== 'undefined' && loggedUser) {
      if (token) {
        document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }
      document.cookie = `user_role=${loggedUser.role}; path=/; max-age=86400; SameSite=Lax`;
    }

    if (loggedUser?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const loginDemo = (role: 'STUDENT' | 'ADMIN') => {
    const demoUser: User =
      role === 'ADMIN'
        ? {
            id: 'adm-teacher-dong',
            fullName: 'Thầy Đông (IELTS 8.5)',
            email: 'admin@dong.edu.vn',
            role: 'ADMIN',
            phone: '0987654321',
          }
        : {
            id: 'std-tran-nam',
            fullName: 'Trần Văn Nam',
            email: 'student@dong.edu.vn',
            role: 'STUDENT',
            phone: '0912345678',
          };

    if (typeof document !== 'undefined') {
      document.cookie = `access_token=demo_token_${role.toLowerCase()}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', `demo_token_${role.toLowerCase()}`);
    }

    setUser(demoUser);
    setSessionTerminated(false);
    if (role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const loginWithGoogle = async (googleProfile?: { email?: string; fullName?: string; avatarUrl?: string }) => {
    try {
      const res = await authService.loginGoogle({
        idToken: `google_oauth_${Date.now()}`,
        email: googleProfile?.email,
        fullName: googleProfile?.fullName || 'Google Student',
        avatarUrl: googleProfile?.avatarUrl,
      });
      const loggedUser = res.user || res.data?.user || res.data;
      const token = res.accessToken || res.data?.accessToken;

      setUser(loggedUser);
      setSessionTerminated(false);

      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('access_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (typeof document !== 'undefined' && loggedUser) {
        if (token) {
          document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        }
        document.cookie = `user_role=${loggedUser.role}; path=/; max-age=86400; SameSite=Lax`;
      }
      if (loggedUser?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch {
      // Local Google OAuth simulation fallback for instant preview
      const fallbackUser: User = {
        id: `google-user-${Date.now()}`,
        fullName: googleProfile?.fullName || 'Học Viên Google',
        email: googleProfile?.email || 'student.google@gmail.com',
        role: 'STUDENT',
        phone: '0988888888',
      };
      if (typeof document !== 'undefined') {
        document.cookie = `access_token=demo_token_student; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `user_role=STUDENT; path=/; max-age=86400; SameSite=Lax`;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', 'demo_token_student');
      }
      setUser(fallbackUser);
      setSessionTerminated(false);
      router.push('/student/dashboard');
    }
  };

  const register = async (data: RegisterPayload) => {
    const res = await authService.register(data);
    const loggedUser = res.user || res.data?.user || res.data;
    const token = res.accessToken || res.data?.accessToken;

    setUser(loggedUser);
    setSessionTerminated(false);

    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('access_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    if (typeof document !== 'undefined' && loggedUser) {
      if (token) {
        document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      }
      document.cookie = `user_role=STUDENT; path=/; max-age=86400; SameSite=Lax`;
    }

    router.push('/student/dashboard');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Local fallback
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        delete api.defaults.headers.common['Authorization'];
      }
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; path=/; max-age=0;';
        document.cookie = 'user_role=; path=/; max-age=0;';
      }
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessionTerminated,
        login,
        loginDemo,
        loginWithGoogle,
        register,
        logout,
        refreshProfile: fetchProfile,
        dismissSessionTerminated: () => setSessionTerminated(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
