import axios from 'axios';
import type { MessageInstance } from 'antd/es/message/interface';

type ApiErrorBody = {
  message?: string;
  success?: boolean;
};

export function getApiErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

export function isRateLimitError(error: unknown): boolean {
  return getApiErrorStatus(error) === 429;
}

export function isServiceBusyError(error: unknown): boolean {
  const status = getApiErrorStatus(error);
  if (status === 503) {
    const msg = getApiErrorBodyMessage(error).toLowerCase();
    return msg.includes('busy') || msg.includes('high demand') || msg.includes('try again');
  }
  return false;
}

export function isTooManyRequestsError(error: unknown): boolean {
  return isRateLimitError(error) || isServiceBusyError(error);
}

function getApiErrorBodyMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    return data?.message || '';
  }
  return '';
}

export function getRateLimitMessage(error: unknown): string {
  const serverMsg = getApiErrorBodyMessage(error);

  if (serverMsg) {
    return serverMsg;
  }

  if (axios.isAxiosError(error)) {
    const retryAfter = error.response?.headers['retry-after'];
    if (retryAfter) {
      return `Too many requests. Please try again in ${retryAfter} seconds.`;
    }
  }

  return 'Too many requests. Please wait a few minutes and try again.';
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isTooManyRequestsError(error)) {
    if (isServiceBusyError(error)) {
      return (
        getApiErrorBodyMessage(error) ||
        'Our AI service is busy right now. Please wait a few minutes and try again.'
      );
    }
    return getRateLimitMessage(error);
  }

  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

/** Show warning for rate limits / busy service, error otherwise. */
export function notifyApiError(
  messageApi: MessageInstance,
  error: unknown,
  fallback: string
): void {
  const text = getErrorMessage(error, fallback);
  if (isTooManyRequestsError(error)) {
    messageApi.warning({ content: text, duration: 8, key: 'too-many-requests' });
    return;
  }
  messageApi.error(text);
}
