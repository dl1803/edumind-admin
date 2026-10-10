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
  role: 'admin' | 'student' | 'instructor';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
