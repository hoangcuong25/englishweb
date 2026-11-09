'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, LoginPayload, RegisterPayload } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionTerminated: boolean;
  login: (data: LoginPayload) => Promise<void>;
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
      const userData = await authService.getMe();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleSessionTerminated = () => {
      setUser(null);
      setSessionTerminated(true);
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

  const login = async (credentials: LoginPayload) => {
    const res = await authService.login(credentials);
    const loggedUser = res.user || res.data?.user || res.data;
    setUser(loggedUser);
    setSessionTerminated(false);
    if (loggedUser?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const register = async (data: RegisterPayload) => {
    const res = await authService.register(data);
    const loggedUser = res.user || res.data?.user || res.data;
    setUser(loggedUser);
    setSessionTerminated(false);
    router.push('/student/dashboard');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
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
