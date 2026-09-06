import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthApi } from '../api/endpoints';
import type { LoginResponse, Role } from '../types';

interface AuthState {
  token: string | null;
  userId: number | null;
  name: string | null;
  email: string | null;
  role: Role | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadInitialState(): AuthState {
  const raw = localStorage.getItem('keystone_user');
  const token = localStorage.getItem('keystone_token');
  if (raw && token) {
    const user = JSON.parse(raw);
    return { token, ...user };
  }
  return { token: null, userId: null, name: null, email: null, role: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadInitialState);

  const login = useCallback(async (email: string, password: string) => {
    const res: LoginResponse = await AuthApi.login(email, password);
    localStorage.setItem('keystone_token', res.token);
    localStorage.setItem(
      'keystone_user',
      JSON.stringify({ userId: res.userId, name: res.name, email: res.email, role: res.role })
    );
    setState({ token: res.token, userId: res.userId, name: res.name, email: res.email, role: res.role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('keystone_token');
    localStorage.removeItem('keystone_user');
    setState({ token: null, userId: null, name: null, email: null, role: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAuthenticated: !!state.token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
