import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'eira_token';
export const CSRF_HEADER_NAME = 'x-eira-csrf';
export const CSRF_HEADER_VALUE = '1';

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
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
