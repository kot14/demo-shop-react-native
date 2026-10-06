import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import * as authApi from '@/api/auth';
import { ensureAccess } from '@/api/client';
import { getRefreshToken } from '@/auth/tokenStorage';

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const refresh = await getRefreshToken();
        if (!refresh) {
          if (!cancelled) setIsAuthenticated(false);
          return;
        }
        const token = await ensureAccess();
        if (!cancelled) setIsAuthenticated(!!token);
      } catch {
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(email: string, password: string) {
    await authApi.login(email, password);
    setIsAuthenticated(true);
  }

  async function signUp(email: string, password: string, fullName: string) {
    await authApi.register(email, password, fullName);
    await authApi.login(email, password);
    setIsAuthenticated(true);
  }

  async function signOut() {
    try {
      await authApi.logout();
    } finally {
      setIsAuthenticated(false);
    }
  }

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
