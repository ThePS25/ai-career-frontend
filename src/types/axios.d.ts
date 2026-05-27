import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipRateLimitToast?: boolean;
  }
}
