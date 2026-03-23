import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'eira_token';
export const CSRF_HEADER_NAME = 'x-eira-csrf';
export const CSRF_HEADER_VALUE = '1';

// SameSite=None is required in production because the frontend (Vercel) and API (Render)
// are on different domains. SameSite=None + Secure allows cross-origin cookies over HTTPS.
// CSRF protection is maintained via the x-eira-csrf custom header requirement.
export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

export function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.includes(origin);
}
