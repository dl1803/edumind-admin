import axios from 'axios';
import { apiClient } from '../api-client';
import { TokenStorage } from '@/lib/token-storage';

jest.mock('@/lib/token-storage', () => ({
    TokenStorage: {
        getAccessToken: jest.fn(),
        getRefreshToken: jest.fn(),
        setTokens: jest.fn(),
        clearTokens: jest.fn(),
        isLoggedIn: jest.fn(),
    },
}));
jest.mock('axios', () => {
    const actualAxios = jest.requireActual('axios');
    return {
        ...actualAxios,
        post: jest.fn(),
    };
});

describe('apiClient Interceptor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete (window as unknown as { location: unknown }).location;
        window.location = { href: '' } as unknown as Location;
    });

    it('gắn Bearer Token khi TokenStorage có access token', async () => {
        (TokenStorage.getAccessToken as jest.Mock).mockReturnValue('test_access_token');

        apiClient.defaults.adapter = jest.fn().mockImplementation((config) => {
            expect(config.headers.Authorization).toBe('Bearer test_access_token');
            return Promise.resolve({ data: 'ok', status: 200, headers: {}, config });
        });

        const res = await apiClient.get('/test');
        expect(res.data).toBe('ok');
    });

    it('tự động gọi refresh và retry khi gặp lỗi 401', async () => {
        let currentToken = 'old_token';
        (TokenStorage.getAccessToken as jest.Mock).mockImplementation(() => currentToken);
        (TokenStorage.getRefreshToken as jest.Mock).mockReturnValue('valid_refresh');
        (TokenStorage.setTokens as jest.Mock).mockImplementation((access) => {
            currentToken = access;
        });

        (axios.post as jest.Mock).mockResolvedValue({
            data: {
                access_token: 'new_token',
                refresh_token: 'new_refresh',
            },
        });

        let attempts = 0;
        apiClient.defaults.adapter = jest.fn().mockImplementation((config) => {
            attempts++;
            if (attempts === 1) {
                return Promise.reject({
                    response: { status: 401 },
                    config,
                });
            }
            expect(config.headers.Authorization).toBe('Bearer new_token');
            return Promise.resolve({ data: 'retried_success', status: 200, headers: {}, config });
        });

        const res = await apiClient.get('/protected-data');
        expect(res.data).toBe('retried_success');
        expect(TokenStorage.setTokens).toHaveBeenCalledWith('new_token', 'new_refresh');
    });

    it('xóa tokens và redirect về /login khi refresh thất bại', async () => {
        (TokenStorage.getAccessToken as jest.Mock).mockReturnValue('old_token');
        (TokenStorage.getRefreshToken as jest.Mock).mockReturnValue('bad_refresh');

        (axios.post as jest.Mock).mockRejectedValue(new Error('Refresh expired'));

        apiClient.defaults.adapter = jest.fn().mockImplementation((config) => {
            return Promise.reject({
                response: { status: 401 },
                config,
            });
        });

        await expect(apiClient.get('/protected-data')).rejects.toThrow();
        expect(TokenStorage.clearTokens).toHaveBeenCalled();
        expect(window.location.href).toBe('/login');
    });

    it('3 request 401 đồng thời -> auth/refresh chỉ gọi 1 lần và cả 3 đều resolve', async () => {
        let currentToken = 'old_token';
        (TokenStorage.getAccessToken as jest.Mock).mockImplementation(() => currentToken);
        (TokenStorage.getRefreshToken as jest.Mock).mockReturnValue('valid_refresh');
        (TokenStorage.setTokens as jest.Mock).mockImplementation((access) => {
            currentToken = access;
        });

        let refreshResolve: ((value: unknown) => void) | null = null;
        (axios.post as jest.Mock).mockImplementation(() => {
            return new Promise((resolve) => {
                refreshResolve = resolve;
            });
        });

        const retryCounts: Record<string, number> = { '/req1': 0, '/req2': 0, '/req3': 0 };

        apiClient.defaults.adapter = jest.fn().mockImplementation((config) => {
            const url = config.url as string;
            if (retryCounts[url] === 0) {
                retryCounts[url]++;
                return Promise.reject({
                    response: { status: 401 },
                    config,
                });
            }
            expect(config.headers.Authorization).toBe('Bearer new_token');
            return Promise.resolve({ data: `success_${url}`, status: 200, headers: {}, config });
        });

        // Gửi đồng thời 3 request
        const p1 = apiClient.get('/req1');
        const p2 = apiClient.get('/req2');
        const p3 = apiClient.get('/req3');

        // Chờ microtasks để cả 3 request nhận 401 và rơi vào refresh / failedQueue
        await new Promise((r) => setTimeout(r, 10));

        // Giải phóng refresh response
        if (refreshResolve) {
            (refreshResolve as (val: unknown) => void)({
                data: {
                    access_token: 'new_token',
                    refresh_token: 'new_refresh',
                },
            });
        }

        const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

        expect(r1.data).toBe('success_/req1');
        expect(r2.data).toBe('success_/req2');
        expect(r3.data).toBe('success_/req3');
        expect(axios.post).toHaveBeenCalledTimes(1);
    });
});

