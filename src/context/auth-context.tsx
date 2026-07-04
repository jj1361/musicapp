'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import useSWR from 'swr';
import { User } from '@/types';

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 401 || res.status === 404) {
      return null;
    }
    throw new Error('Failed to load auth state');
  }
  return res.json();
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: unknown;
  mutate: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  mutate: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    mutate(null, false);
    window.location.href = '/login';
  }, [mutate]);

  return (
    <AuthContext.Provider
      value={{
        user: data?.user || null,
        loading: isLoading,
        error,
        mutate: () => mutate(),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
