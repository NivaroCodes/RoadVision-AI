import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiClient } from '@/api/client';
import { clearTokens, getAccessToken, storeTokens } from './storage';
import type { AuthUser, Credentials, TokenPair } from './types';

import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await apiClient.get<AuthUser>('/auth/me');
      setUser(data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
    const expire = () => setUser(null);
    window.addEventListener('roadvision:session-expired', expire);
    return () => window.removeEventListener('roadvision:session-expired', expire);
  }, [loadUser]);

  const login = useCallback(async (credentials: Credentials) => {
    const { data: tokens } = await apiClient.post<TokenPair>('/auth/login', credentials);
    storeTokens(tokens);
    const { data: currentUser } = await apiClient.get<AuthUser>('/auth/me');
    setUser(currentUser);
  }, []);

  const register = useCallback(async (credentials: Credentials) => {
    await apiClient.post<AuthUser>('/auth/register', credentials);
    await login(credentials);
  }, [login]);

  const logout = useCallback(() => {
    const accessToken = getAccessToken();
    clearTokens();
    setUser(null);
    if (accessToken) {
      void apiClient.post('/auth/logout', undefined, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => undefined);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
