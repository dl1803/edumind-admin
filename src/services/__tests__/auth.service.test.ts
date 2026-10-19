import { authService } from '../auth.service';
import { TokenStorage } from '@/lib/token-storage';
import { apiClient } from '../api-client';
import axios from 'axios';

jest.mock('@/lib/token-storage', () => ({
  TokenStorage: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    isLoggedIn: jest.fn(),
  },
}));

jest.mock('../api-client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    post: jest.fn(),
  };
});

describe('AuthService (Admin)', () => {
  const originalEnv = process.env.NEXT_PUBLIC_USE_MOCK;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    process.env.NEXT_PUBLIC_USE_MOCK = 'false';
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_USE_MOCK = originalEnv;
  });

  describe('login', () => {
    it('đăng nhập thành công và lưu tokens khi credentials hợp lệ và role là admin', async () => {
      const mockLoginResponse = {
        data: {
          access_token: 'jwt_admin_access_token',
          refresh_token: 'jwt_admin_refresh_token',
          token_type: 'Bearer',
          expires_in: 86400,
          user: {
            id: 'adm-001',
            full_name: 'Admin User',
            email: 'admin@edumind.edu.vn',
            avatar_url: null,
            role: 'admin' as const,
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockLoginResponse);

      const payload = {
        email: 'admin@edumind.edu.vn',
        password: 'AdminPassword@123',
      };

      const result = await authService.login(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', payload, {
        skipAuth: true,
      });
      expect(TokenStorage.setTokens).toHaveBeenCalledWith('jwt_admin_access_token', 'jwt_admin_refresh_token');
      expect(localStorage.getItem('admin_user')).toContain('Admin User');
      expect(result.user.role).toBe('admin');
      expect(result.accessToken).toBe('jwt_admin_access_token');
      expect(result.user.fullName).toBe('Admin User');
    });

    it('ném lỗi FORBIDDEN khi user không có role admin', async () => {
      const mockNonAdminResponse = {
        data: {
          access_token: 'jwt_student_token',
          refresh_token: 'jwt_student_refresh',
          token_type: 'Bearer',
          expires_in: 86400,
          user: {
            id: 'stu-001',
            full_name: 'Student User',
            email: 'student@edumind.edu.vn',
            avatar_url: null,
            role: 'student' as const,
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockNonAdminResponse);

      await expect(
        authService.login({
          email: 'student@edumind.edu.vn',
          password: 'StudentPass@123',
        })
      ).rejects.toThrow('Tài khoản không có quyền truy cập quản trị.');

      expect(TokenStorage.setTokens).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('ném lỗi khi không có refresh token trong storage', async () => {
      (TokenStorage.getRefreshToken as jest.Mock).mockReturnValue(null);

      await expect(authService.refresh()).rejects.toThrow('Không tìm thấy refresh token trong bộ nhớ.');
    });

    it('gọi API refresh và lưu tokens mới khi có refresh token', async () => {
      (TokenStorage.getRefreshToken as jest.Mock).mockReturnValue('valid_refresh_token');

      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
        },
      });

      const result = await authService.refresh();

      expect(result.accessToken).toBe('new_access_token');
      expect(result.refreshToken).toBe('new_refresh_token');
      expect(TokenStorage.setTokens).toHaveBeenCalledWith('new_access_token', 'new_refresh_token');
    });
  });

  describe('logout', () => {
    it('xóa tokens và localStorage khi đăng xuất', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: { message: 'Logged out' } });
      localStorage.setItem('admin_user', JSON.stringify({ id: 'adm-001' }));

      await authService.logout();

      expect(TokenStorage.clearTokens).toHaveBeenCalled();
      expect(localStorage.getItem('admin_user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('trả về user từ localStorage nếu tồn tại dữ liệu hợp lệ', () => {
      const mockUser = {
        id: 'adm-001',
        fullName: 'Admin User',
        email: 'admin@edumind.edu.vn',
        role: 'admin',
      };
      localStorage.setItem('admin_user', JSON.stringify(mockUser));

      const user = authService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('trả về null khi localStorage rỗng hoặc JSON không hợp lệ', () => {
      localStorage.removeItem('admin_user');
      expect(authService.getCurrentUser()).toBeNull();

      localStorage.setItem('admin_user', 'invalid-json');
      expect(authService.getCurrentUser()).toBeNull();
    });
  });
});
