import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storageGetJson, storageSetJson } from '@/lib/storage';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signup: (input: { name: string; email: string; phone?: string; password: string }) => void;
  login: (input: { email: string; password: string }) => void;
  logout: () => void;
}

const USERS_KEY = 'stylora_users_v1';
const SESSION_KEY = 'stylora_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readUsers = () => {
  const users = storageGetJson<StoredUser[]>(USERS_KEY);
  return Array.isArray(users) ? users : [];
};

const writeUsers = (users: StoredUser[]) => storageSetJson(USERS_KEY, users);

const readSession = () => storageGetJson<{ userId: string } | null>(SESSION_KEY);
const writeSession = (session: { userId: string } | null) => storageSetJson(SESSION_KEY, session);

const makeId = () => {
  // Crypto isn't guaranteed in every environment; fallback is fine for demo.
  const rnd = Math.random().toString(16).slice(2);
  return `usr_${Date.now().toString(16)}_${rnd}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = readSession();
    if (!session?.userId) return;

    const users = readUsers();
    const found = users.find(u => u.id === session.userId);
    if (found) {
      const { password: _password, ...safeUser } = found;
      setUser(safeUser);
    } else {
      writeSession(null);
    }
  }, []);

  const signup = useCallback((input: { name: string; email: string; phone?: string; password: string }) => {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    const phone = input.phone?.trim();
    const password = input.password;

    if (!name) throw new Error('Please enter your name');
    if (!email || !email.includes('@')) throw new Error('Please enter a valid email');
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters');

    const users = readUsers();
    if (users.some(u => normalizeEmail(u.email) === email)) throw new Error('Email already registered. Please sign in.');

    const createdAt = new Date().toISOString();
    const newUser: StoredUser = {
      id: makeId(),
      name,
      email,
      phone: phone || undefined,
      password,
      createdAt,
    };

    writeUsers([newUser, ...users]);
    writeSession({ userId: newUser.id });

    const { password: _password, ...safeUser } = newUser;
    setUser(safeUser);
  }, []);

  const login = useCallback((input: { email: string; password: string }) => {
    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!email || !email.includes('@')) throw new Error('Please enter a valid email');
    if (!password) throw new Error('Please enter your password');

    const users = readUsers();
    const found = users.find(u => normalizeEmail(u.email) === email);
    if (!found) throw new Error('No account found with this email');
    if (found.password !== password) throw new Error('Incorrect password');

    writeSession({ userId: found.id });
    const { password: _password, ...safeUser } = found;
    setUser(safeUser);
  }, []);

  const logout = useCallback(() => {
    writeSession(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: Boolean(user),
    signup,
    login,
    logout,
  }), [login, logout, signup, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

