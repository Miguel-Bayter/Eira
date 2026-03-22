export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
export const CSRF_HEADER_NAME = 'x-eira-csrf';
export const CSRF_HEADER_VALUE = '1';

export function createJsonHeaders(options?: { includeCsrf?: boolean }): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.includeCsrf) {
    headers[CSRF_HEADER_NAME] = CSRF_HEADER_VALUE;
  }

  return headers;
}
