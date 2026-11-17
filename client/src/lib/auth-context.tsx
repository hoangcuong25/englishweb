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

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID ||
  '155171869727-rbjdllpda8amdvdh3b8hm9tgh9apqrb4.apps.googleusercontent.com';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const loadGoogleScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as unknown as { google?: { accounts?: { id?: unknown } } }).google?.accounts?.id) {
      return resolve(true);
    }
    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  const executeGoogleAuth = async (profile?: { idToken?: string; email?: string; fullName?: string; avatarUrl?: string }) => {
    try {
      const res = await authService.loginGoogle({
        idToken: profile?.idToken || `google_oauth_${Date.now()}`,
        email: profile?.email,
        fullName: profile?.fullName || 'Google Student',
        avatarUrl: profile?.avatarUrl,
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
        fullName: profile?.fullName || 'Học Viên Google',
        email: profile?.email || 'student.google@gmail.com',
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

  const loginWithGoogle = async (googleProfile?: { email?: string; fullName?: string; avatarUrl?: string }) => {
    if (googleProfile) {
      await executeGoogleAuth(googleProfile);
      return;
    }

    if (typeof window !== 'undefined' && GOOGLE_CLIENT_ID) {
      const scriptReady = await loadGoogleScript();
      const google = (window as unknown as {
        google?: {
          accounts?: {
            oauth2?: {
              initTokenClient: (config: {
                client_id: string;
                scope: string;
                callback: (tokenResponse: { access_token?: string; error?: string }) => void;
              }) => { requestAccessToken: (options?: { prompt?: string }) => void };
            };
            id?: {
              initialize: (config: { client_id: string; callback: (res: { credential?: string }) => void }) => void;
              prompt: (notification?: (notif: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
            };
          };
        };
      }).google;

      // Method 1: Google OAuth2 Token Client Popup (Mở popup chọn tài khoản Google thật và lấy đúng tên tài khoản)
      if (scriptReady && google?.accounts?.oauth2) {
        try {
          const tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: async (tokenResponse: { access_token?: string; error?: string }) => {
              if (tokenResponse?.access_token) {
                try {
                  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  });
                  if (userInfoRes.ok) {
                    const googleUser = await userInfoRes.json();
                    await executeGoogleAuth({
                      idToken: googleUser.sub || `google_${googleUser.email}`,
                      email: googleUser.email,
                      fullName: googleUser.name || googleUser.given_name || 'Học Viên Google',
                      avatarUrl: googleUser.picture,
                    });
                    return;
                  }
                } catch (err) {
                  console.error('Failed to fetch Google profile:', err);
                }
              }
            },
          });

          tokenClient.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (err) {
          console.warn('Google OAuth2 popup error, trying One-Tap:', err);
        }
      }

      // Method 2: Google One-Tap / ID Token
      if (scriptReady && google?.accounts?.id) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: { credential?: string }) => {
              if (response?.credential) {
                const payload = decodeJwtPayload(response.credential);
                await executeGoogleAuth({
                  idToken: (payload?.sub as string) || response.credential,
                  email: payload?.email as string,
                  fullName: (payload?.name as string) || (payload?.given_name as string),
                  avatarUrl: payload?.picture as string,
                });
              }
            },
          });

          google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              executeGoogleAuth();
            }
          });
          return;
        } catch {
          // Google GSI failed or origin rejected, proceed with direct backend Google login
        }
      }
    }

    await executeGoogleAuth();
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
