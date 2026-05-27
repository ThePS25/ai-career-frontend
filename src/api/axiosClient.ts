import axios from 'axios';
import { message } from 'antd';
import { getErrorMessage, isTooManyRequestsError } from '@/utils/errors';

const TOKEN_KEY = 'aicareer_token';
const USER_KEY = 'aicareer_user';

const DEV_API_BASE = 'http://localhost:5000/api';

function resolveBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  if (import.meta.env.PROD) {
    console.error('VITE_API_BASE_URL is not set. API requests will fail in production.');
  }

  return DEV_API_BASE;
}

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const clearSession = (): void => {
  clearStoredToken();
  localStorage.removeItem(USER_KEY);
};

const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      clearSession();
      const isAuthPage = window.location.pathname.startsWith('/auth');
      if (!isAuthPage) {
        const returnTo = encodeURIComponent(
          window.location.pathname + window.location.search + window.location.hash
        );
        window.location.href = `/auth?session=expired&returnTo=${returnTo}`;
      }
    }

    if (isTooManyRequestsError(error) && error.config?.skipRateLimitToast !== true) {
      message.warning({
        content: getErrorMessage(error, 'Too many requests. Please try again later.'),
        duration: 8,
        key: 'too-many-requests',
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
