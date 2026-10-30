import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/lib/constants';
import { TokenStorage } from '@/lib/token-storage';
import { authService } from './auth.service';

declare module 'axios' {
    export interface AxiosRequestConfig {
        _retry?: boolean;
        skipAuth?: boolean;
    }
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuth?: boolean;
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper: Phân tích thời gian hết hạn (exp claim) từ JWT Token
export function parseJwtExp(token: string): number | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }
        let jsonStr: string;
        if (typeof atob === 'function') {
            jsonStr = atob(base64);
        } else if (typeof Buffer !== 'undefined') {
            jsonStr = Buffer.from(base64, 'base64').toString('utf8');
        } else {
            return null;
        }
        const payload = JSON.parse(jsonStr);
        return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
        return null;
    }
}

// Kiểm tra token đã hết hạn hoặc sắp hết hạn (buffer trước 120 giây / 2 phút chống lệch clock skew)
export function isTokenExpired(token: string, bufferSeconds = 120): boolean {
    const exp = parseJwtExp(token);
    if (!exp) return false;
    return Date.now() >= (exp - bufferSeconds) * 1000;
}

// Singleton Promise để chống race-condition khi nhiều request đồng thời cần refresh token
let refreshPromise: Promise<string> | null = null;

export async function executeRefresh(): Promise<string> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const { accessToken: newAccessToken } = await authService.refresh();
            return newAccessToken;
        } catch (error) {
            TokenStorage.clearTokens();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw error;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// 1. Request Interceptor: Strict Admin Guard - Tự động đính kèm Token & Chủ động Refresh trước khi gửi
apiClient.interceptors.request.use(
    async (config: CustomAxiosRequestConfig) => {
        const isAuthEndpoint = config.url?.includes('auth/login') || config.url?.includes('auth/refresh');
        if (config.skipAuth || isAuthEndpoint) {
            return config;
        }

        let token = TokenStorage.getAccessToken();
        const refreshToken = TokenStorage.getRefreshToken();

        // Chủ động làm mới nếu token đã hết hạn hoặc sắp hết hạn (< 120s) để tránh bị rơi vào guest mode ở các public endpoint
        if (token && isTokenExpired(token, 120)) {
            if (refreshToken) {
                try {
                    token = await executeRefresh();
                } catch (err) {
                    return Promise.reject(err);
                }
            } else {
                TokenStorage.clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(new Error('Phiên đăng nhập đã hết hạn.'));
            }
        }

        // Web Admin không cho phép gửi request ẩn danh: nếu không có token, đá về login ngay
        if (!token) {
            TokenStorage.clearTokens();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return Promise.reject(new Error('Chưa đăng nhập quyền Quản trị viên.'));
        }

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Bắt 401 & Auto Refresh (phòng hờ token bị thu hồi trên server)
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Không refresh nếu chính request login hoặc refresh bị lỗi 401
        const isAuthEndpoint = originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            const refreshToken = TokenStorage.getRefreshToken();
            if (!refreshToken) {
                TokenStorage.clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                const newAccessToken = await executeRefresh();
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
