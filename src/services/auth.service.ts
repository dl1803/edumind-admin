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
      // Giả lập mạng trễ 600ms
      const data = await authMock.login(payload);
      TokenStorage.setTokens(data.accessToken, data.refreshToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }
      return data;
    }
    const response = await apiClient.post<LoginResponse>('/api/auth/login', payload, {
      skipAuth: true,
    });
    const data = response.data;
    if (data.user.role !== 'admin') {
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

  // Làm mới Access Token bằng Refresh Token (Dùng Axios trần tránh vòng lặp 401)
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
    // Axios trần (raw instance) không gắn interceptor
    const response = await axios.post<any>(`${API_BASE_URL}/api/auth/refresh`, {
      refresh_token: currentRefreshToken,
    });
    const rawData = response.data;
    const accessToken = rawData.accessToken || rawData.access_token;
    const refreshToken = rawData.refreshToken || rawData.refresh_token;
    const data: RefreshResponse = { accessToken, refreshToken };
    TokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  // Đăng xuất hệ thống (Best-effort call API, luôn dọn dẹp Storage trong finally)
  async logout(): Promise<void> {
    try {
      if (isUseMock()) {
        await authMock.logout();
      } else {
        await apiClient.post('/api/auth/logout', {}, { skipAuth: false }).catch(() => {
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
