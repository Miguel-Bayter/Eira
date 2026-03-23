import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '@domain/errors/DomainError';
import { logger } from '@infrastructure/logging/logger';

const ERROR_STATUS_MAP: Record<string, number> = {
  USER_NOT_FOUND: 404,
  INVALID_CREDENTIALS: 401,
  REGISTRATION_ERROR: 400,
  AUTH_PROVIDER_UNAVAILABLE: 503,
  MOOD_SCORE_OUT_OF_RANGE: 400,
  DAILY_LIMIT_EXCEEDED: 429,
  INVALID_EMOTION: 400,
  INVALID_EMAIL: 400,
  CRISIS_DETECTED: 200,
  UNAUTHORIZED: 401,
  WELLNESS_SCORE_OUT_OF_RANGE: 400,
  JOURNAL_NOT_FOUND: 404,
  JOURNAL_CONTENT_EMPTY: 400,
  JOURNAL_CONTENT_TOO_LONG: 400,
  CHAT_MESSAGE_EMPTY: 400,
  CHAT_RESPONSE_EMPTY: 400,
  AI_SERVICE_UNAVAILABLE: 503,
};

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof DomainError) {
    const status = ERROR_STATUS_MAP[err.code] ?? 400;
    res.status(status).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Log unexpected errors — strip query strings to avoid logging tokens/PII
  logger.error(
    {
      err,
      method: req.method,
      path: req.path.split('?')[0],
      userId: (req as Request & { userId?: string }).userId,
    },
    'Unhandled server error',
  );

  // Unexpected error — do not expose internal details
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}
