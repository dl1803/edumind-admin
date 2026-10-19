import axios from 'axios';
import { apiClient } from './api-client';
import { authMock } from './mock/auth.mock';
import { TokenStorage } from '@/lib/token-storage';
import { LoginPayload, LoginResponse, AuthUser, RefreshResponse }
  from '@/types/auth.types';
import { API_BASE_URL } from '@/lib/constants';

const isUseMock = () => process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    if (isUseMock()) {
      const data = await authMock.login(payload);
      TokenStorage.setTokens(data.accessToken, data.refreshToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }
      return data;
    }
    const response = await apiClient.post<any>('/auth/login', payload, {
      skipAuth: true,
    });
    const res = response.data;
    const user = res.user;

    const data: LoginResponse = {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      tokenType: res.token_type || 'Bearer',
      expiresIn: res.expires_in,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        role: user.role,
      },
    };

    if (data.user.role?.toLowerCase() !== 'admin') {
      const error: any = new Error('Tài khoản không có quyền truy cập quản trị.');
      error.response = { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Không có quyền truy cập.' } } };
      throw error;
    }

    TokenStorage.setTokens(data.accessToken, data.refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_user', JSON.stringify(data.user));
    }

    return data;
  },

  async refresh(): Promise<RefreshResponse> {
    const currentRefreshToken = TokenStorage.getRefreshToken();
    if (!currentRefreshToken) {
      throw new Error('Không tìm thấy refresh token trong bộ nhớ.');
    }
    if (isUseMock()) {
      const data = await authMock.refresh(currentRefreshToken);
      TokenStorage.setTokens(data.accessToken, data.refreshToken);
      return data;
    }
    const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, '');
    const refreshUrl = cleanBaseUrl.endsWith('/api')
      ? `${cleanBaseUrl}/auth/refresh`
      : `${cleanBaseUrl}/api/auth/refresh`;

    const response = await axios.post<any>(refreshUrl, {
      refresh_token: currentRefreshToken,
    });
    const rawData = response.data;
    const data: RefreshResponse = {
      accessToken: rawData.access_token,
      refreshToken: rawData.refresh_token,
    };
    TokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  // Đăng xuất hệ thống (Best-effort call API, luôn dọn dẹp Storage trong finally)
  async logout(): Promise<void> {
    try {
      if (isUseMock()) {
        await authMock.logout();
      } else {
        await apiClient.post('/auth/logout', {}, { skipAuth: false }).catch(() => {
          // Bỏ qua lỗi mạng khi logout để luôn giải phóng client
        });
      }
    } finally {
      TokenStorage.clearTokens();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_user');
      }
    }
  },

  //Lấy thông tin người dùng hiện tại từ localStorage (nếu có)
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('admin_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};
