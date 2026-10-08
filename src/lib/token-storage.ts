/**
 * Quản lý đọc/ghi token xác thực thông qua Cookie trình duyệt
 */


function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}


export const TokenStorage = {
  getAccessToken(): string | null {
    return getCookie('access_token');
  },

  getRefreshToken(): string | null {
    return getCookie('refresh_token');
  },

  setTokens(accessToken: string, refreshToken: string): void {
    setCookie('access_token', accessToken, 1);     // 1 ngày
    setCookie('refresh_token', refreshToken, 30);  // 30 ngày
  },

  clearTokens(): void {
    removeCookie('access_token');
    removeCookie('refresh_token');
  },

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  },
};
