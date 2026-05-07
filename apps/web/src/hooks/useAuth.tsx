'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchCurrentUser, loginRequest, logoutRequest } from '@/lib/auth';
import { getToken } from '@/lib/auth-storage';
import type { AuthUser, LoginPayload } from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: (signal?: AbortSignal) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const me = await fetchCurrentUser(signal);
      if (signal?.aborted) return;
      setUser(me);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      await refresh(controller.signal);
      if (!controller.signal.aborted) setIsLoading(false);
    })();
    return () => {
      controller.abort();
    };
  }, [refresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await loginRequest(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      refresh,
    }),
    [user, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
