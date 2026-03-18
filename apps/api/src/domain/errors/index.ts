import { DomainError } from './DomainError';

export { DomainError };

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super('USER_NOT_FOUND', `User ${userId} not found`);
  }
}

export class MoodScoreOutOfRangeError extends DomainError {
  constructor(score: number) {
    super('MOOD_SCORE_OUT_OF_RANGE', `Score ${score} must be between 1 and 10`);
  }
}

export class DailyLimitExceededError extends DomainError {
  constructor(resource: string, limit: number) {
    super('DAILY_LIMIT_EXCEEDED', `Daily limit of ${limit} ${resource} exceeded`);
  }
}

export class InvalidEmotionError extends DomainError {
  constructor(emotion: string) {
    super('INVALID_EMOTION', `Emotion "${emotion}" is not valid`);
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super('INVALID_EMAIL', `Email "${email}" is not valid`);
  }
}

export class CrisisDetectedError extends DomainError {
  constructor() {
    super('CRISIS_DETECTED', 'Crisis indicators detected');
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super('UNAUTHORIZED', 'Unauthorized');
  }
}

export class WellnessScoreOutOfRangeError extends DomainError {
  constructor(score: number) {
    super('WELLNESS_SCORE_OUT_OF_RANGE', `Wellness score ${score} must be between 0 and 100`);
  }
}

export class JournalNotFoundError extends DomainError {
  constructor(id: string) {
    super('JOURNAL_NOT_FOUND', `Journal entry ${id} not found`);
  }
}
