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

// Trạng thái quản lý race condition refresh token
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

// 1. Request Interceptor: Tự động đính kèm Bearer Token
apiClient.interceptors.request.use(
    (config: CustomAxiosRequestConfig) => {
        if (config.skipAuth) {
            return config;
        }

        const token = TokenStorage.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Bắt 401 & Auto Refresh
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
            if (isRefreshing) {
                // Đẩy vào hàng đợi nếu luồng khác đang refresh
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = TokenStorage.getRefreshToken();
            if (!refreshToken) {
                TokenStorage.clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                 // Gọi qua authService.refresh() tập trung
                const { accessToken: newAccessToken } = await authService.refresh();
                processQueue(null, newAccessToken);
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                TokenStorage.clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
