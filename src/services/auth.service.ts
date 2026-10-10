import { apiClient } from './api-client';
import { TokenStorage } from '@/lib/token-storage';
import { LoginPayload, LoginResponse, AuthUser } from '@/types/auth.types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'; // Mặc định bật mock khi dev

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    if (USE_MOCK) {
      // Giả lập mạng trễ 600ms
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Kiểm tra tài khoản test admin
      if (payload.email === 'admin@edumind.edu.vn' && payload.password === 'Admin@1234') {
        const mockResponse: LoginResponse = {
          accessToken: 'mock_admin_jwt_token_' + Date.now(),
          refreshToken: 'mock_admin_refresh_token_' + Date.now(),
          tokenType: 'Bearer',
          expiresIn: 86400,
          user: {
            id: 'adm-001',
            fullName: 'Quản Trị Viên EduMind',
            email: payload.email,
            avatarUrl: null,
            role: 'admin',
          },
        };

        // Lưu cookie cho middleware & Axios
        TokenStorage.setTokens(mockResponse.accessToken, mockResponse.refreshToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_user', JSON.stringify(mockResponse.user));
        }

        return mockResponse;
      }

      // Tài khoản không có quyền admin
      if (payload.email === 'user@edumind.edu.vn') {
        const error = new Error('Tài khoản không có quyền truy cập hệ thống Quản trị viên.') as any;
        error.response = { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Tài khoản không có quyền admin.' } } };
        throw error;
      }

      // Mặc định sai thông tin
      const error = new Error('Email hoặc mật khẩu không chính xác.') as any;
      error.response = { status: 401, data: { error: { code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không chính xác.' } } };
      throw error;
    }

    // Khi gọi API BE thật
    const response = await apiClient.post<LoginResponse>('/api/auth/login', payload, {
      skipAuth: true,
    });

    const data = response.data;
    if (data.user.role !== 'admin') {
      throw new Error('Tài khoản không có quyền truy cập quản trị.');
    }

    TokenStorage.setTokens(data.accessToken, data.refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_user', JSON.stringify(data.user));
    }

    return data;
  },

  logout(): void {
    TokenStorage.clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
