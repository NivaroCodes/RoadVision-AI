import type { TokenPair } from './types';

const ACCESS_TOKEN = 'roadvision_access_token';
const REFRESH_TOKEN = 'roadvision_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN);
}

export function storeTokens(tokens: TokenPair): void {
  localStorage.setItem(ACCESS_TOKEN, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN, tokens.refresh_token);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
}
