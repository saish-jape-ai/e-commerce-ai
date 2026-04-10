import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storageGetJson, storageSetJson } from '@/lib/storage';
import { platformApi } from '@/lib/platform/client';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
}

type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
};

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  signup: (input: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const SESSION_KEY = 'platform_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readSession = () => storageGetJson<StoredSession | null>(SESSION_KEY);
const writeSession = (session: StoredSession | null) => storageSetJson(SESSION_KEY, session);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = readSession();
    if (stored?.accessToken && stored?.user) setSession(stored);
    setIsReady(true);
  }, []);

  const signup = useCallback(async () => {
    throw new Error('Signup is not available. Please login with your Platform account.');
  }, []);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const email = input.email.trim();
    const password = input.password;
    if (!email || !email.includes('@')) throw new Error('Please enter a valid email');
    if (!password) throw new Error('Please enter your password');

    const res = await platformApi.login({ email, password });
    const expiresAt = new Date(Date.now() + res.expires_in * 1000).toISOString();

    const user: AuthUser = {
      id: res.user.id,
      firstName: res.user.first_name,
      lastName: res.user.last_name,
      name: `${res.user.first_name} ${res.user.last_name}`.trim(),
      email: res.user.email,
      phone: res.user.phone,
      status: res.user.status,
    };

    const next: StoredSession = {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      expiresAt,
      user,
    };

    writeSession(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    isAuthenticated: Boolean(session?.accessToken),
    isReady,
    signup,
    login,
    logout,
  }), [isReady, login, logout, session, signup]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

