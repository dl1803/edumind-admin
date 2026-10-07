export const APP_CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "EduMind Admin",
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  DEFAULT_PAGE_SIZE: 10,
};

export const API_BASE_URL = APP_CONFIG.API_BASE_URL;
export const APP_NAME = APP_CONFIG.APP_NAME;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "edumind_admin_access_token",
  REFRESH_TOKEN: "edumind_admin_refresh_token",
  USER_INFO: "edumind_admin_user",
};
