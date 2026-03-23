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

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid credentials');
  }
}

export class RegistrationFailedError extends DomainError {
  constructor() {
    super('REGISTRATION_ERROR', 'Could not complete registration. Please try again.');
  }
}

export class AuthProviderUnavailableError extends DomainError {
  constructor() {
    super('AUTH_PROVIDER_UNAVAILABLE', 'Authentication provider is temporarily unavailable');
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

export class JournalContentEmptyError extends DomainError {
  constructor() {
    super('JOURNAL_CONTENT_EMPTY', 'Journal content cannot be empty');
  }
}

export class JournalContentTooLongError extends DomainError {
  constructor(limit: number) {
    super('JOURNAL_CONTENT_TOO_LONG', `Journal content exceeds the ${limit} character limit`);
  }
}

export class ChatMessageEmptyError extends DomainError {
  constructor() {
    super('CHAT_MESSAGE_EMPTY', 'Chat message cannot be empty');
  }
}

export class ChatResponseEmptyError extends DomainError {
  constructor() {
    super('CHAT_RESPONSE_EMPTY', 'AI response cannot be empty');
  }
}

export class AiServiceUnavailableError extends DomainError {
  constructor() {
    super('AI_SERVICE_UNAVAILABLE', 'AI service is temporarily unavailable');
  }
}

export class CommunityContentTooShortError extends DomainError {
  constructor(min: number) {
    super('COMMUNITY_CONTENT_TOO_SHORT', `Post must be at least ${min} characters`);
  }
}

export class CommunityContentTooLongError extends DomainError {
  constructor(max: number) {
    super('COMMUNITY_CONTENT_TOO_LONG', `Post must be ${max} characters or fewer`);
  }
}
