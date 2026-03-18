import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '@domain/errors/DomainError';

const ERROR_STATUS_MAP: Record<string, number> = {
  USER_NOT_FOUND: 404,
  MOOD_SCORE_OUT_OF_RANGE: 400,
  DAILY_LIMIT_EXCEEDED: 429,
  INVALID_EMOTION: 400,
  INVALID_EMAIL: 400,
  CRISIS_DETECTED: 200,
  UNAUTHORIZED: 401,
  WELLNESS_SCORE_OUT_OF_RANGE: 400,
};

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
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

  // Error inesperado — no revelar detalles internos
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
}
