export type UserRole = 'admin' | 'student' | 'instructor';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
}

export type LoginRequest = LoginPayload;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshRequest {
  refreshToken: string;
}


export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
