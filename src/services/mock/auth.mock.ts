import { LoginPayload, LoginResponse, RefreshResponse } from '@/types/auth.types';

export const authMock = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    // Giả lập độ trễ mạng thực tế 600ms
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Tài khoản Admin kiểm thử chuẩn hóa
    if (
      (payload.email === 'admin@edumind.edu.vn' || payload.email === 'admin@edumind.com') &&
      (payload.password === 'Admin@1234' || payload.password === 'Admin1234@')
    ) {
      return {
        accessToken: `mock_admin_jwt_${Date.now()}`,
        refreshToken: `mock_admin_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 86400,
        user: {
          id: 'adm-001',
          fullName: 'Trần Quản Trị',
          email: payload.email,
          avatarUrl: null,
          role: 'admin',
        },
      };
    }

    // Tài khoản không có quyền Admin (403 Forbidden)
    if (payload.email === 'user@edumind.edu.vn' || payload.email === 'student@edumind.com') {
      const error: any = new Error('Tài khoản không có quyền truy cập hệ thống Quản trị viên.');
      error.response = {
        status: 403,
        data: {
          error: {
            code: 'FORBIDDEN',
            message: 'Tài khoản không có quyền quản trị viên.',
          },
        },
      };
      throw error;
    }

    // Sai thông tin đăng nhập (401 Unauthorized)
    const error: any = new Error('Email hoặc mật khẩu không chính xác.');
    error.response = {
      status: 401,
      data: {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email hoặc mật khẩu không chính xác.',
        },
      },
    };
    throw error;
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!refreshToken || refreshToken.includes('invalid')) {
      const error: any = new Error('Phiên đăng nhập đã hết hạn.');
      error.response = { status: 401, data: { error: { code: 'TOKEN_EXPIRED', message: 'Refresh token không hợp lệ' } } };
      throw error;
    }

    return {
      accessToken: `mock_refreshed_jwt_${Date.now()}`,
      refreshToken: `mock_refreshed_refresh_${Date.now()}`,
    };
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
  },
};
