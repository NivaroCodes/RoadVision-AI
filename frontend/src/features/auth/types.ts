export type UserRole = 'admin' | 'road_service' | 'resident';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Credentials {
  email: string;
  password: string;
}
