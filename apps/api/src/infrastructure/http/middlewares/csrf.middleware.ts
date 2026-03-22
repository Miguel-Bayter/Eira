import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '@domain/errors';
import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, isAllowedOrigin } from '../security/httpSecurity';

function getRequestOrigin(req: Request): string | null {
  const originHeader = req.get('origin');
  if (originHeader) {
    return originHeader;
  }

  const refererHeader = req.get('referer');
  if (!refererHeader) {
    return null;
  }

  try {
    return new URL(refererHeader).origin;
  } catch {
    return null;
  }
}

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (req.authTransport === 'authorization') {
    next();
    return;
  }

  const origin = getRequestOrigin(req);
  if (!origin || !isAllowedOrigin(origin)) {
    next(new UnauthorizedError());
    return;
  }

  if (req.get(CSRF_HEADER_NAME) !== CSRF_HEADER_VALUE) {
    res.status(403).json({
      error: {
        code: 'CSRF_VALIDATION_FAILED',
        message: 'CSRF validation failed',
      },
    });
    return;
  }

  next();
}
