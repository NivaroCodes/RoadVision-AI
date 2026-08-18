import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from '@/features/auth/storage';
import type { TokenPair } from '@/features/auth/types';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

interface RetriableRequest extends InternalAxiosRequestConfig {
  retried?: boolean;
}

let refreshRequest: Promise<string> | null = null;

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined;
    const refreshToken = getRefreshToken();
    const isAuthRequest = request?.url?.startsWith('/auth/') ?? false;

    if (error.response?.status !== 401 || !request || request.retried || !refreshToken || isAuthRequest) {
      return Promise.reject(error);
    }

    request.retried = true;
    refreshRequest ??= axios
      .post<TokenPair>(`${baseURL}/auth/refresh`, { refresh_token: refreshToken })
      .then(({ data }) => {
        storeTokens(data);
        return data.access_token;
      })
      .finally(() => {
        refreshRequest = null;
      });

    try {
      const token = await refreshRequest;
      request.headers.Authorization = `Bearer ${token}`;
      return apiClient(request);
    } catch (refreshError) {
      clearTokens();
      window.dispatchEvent(new Event('roadvision:session-expired'));
      return Promise.reject(refreshError);
    }
  },
);
