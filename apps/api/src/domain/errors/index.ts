import { DomainError } from './DomainError';

export { DomainError };

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super('USER_NOT_FOUND', `Usuario ${userId} no encontrado`);
  }
}

export class MoodScoreOutOfRangeError extends DomainError {
  constructor(score: number) {
    super('MOOD_SCORE_OUT_OF_RANGE', `Score ${score} debe estar entre 1 y 10`);
  }
}

export class DailyLimitExceededError extends DomainError {
  constructor(resource: string, limit: number) {
    super('DAILY_LIMIT_EXCEEDED', `Límite diario de ${limit} ${resource} alcanzado`);
  }
}

export class InvalidEmotionError extends DomainError {
  constructor(emotion: string) {
    super('INVALID_EMOTION', `Emoción "${emotion}" no es válida`);
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super('INVALID_EMAIL', `Email "${email}" no es válido`);
  }
}

export class CrisisDetectedError extends DomainError {
  constructor() {
    super('CRISIS_DETECTED', 'Se detectaron indicadores de crisis');
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super('UNAUTHORIZED', 'No autorizado');
  }
}

export class WellnessScoreOutOfRangeError extends DomainError {
  constructor(score: number) {
    super('WELLNESS_SCORE_OUT_OF_RANGE', `Wellness score ${score} debe estar entre 0 y 100`);
  }
}
