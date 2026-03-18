import { InvalidEmailError } from '../errors';

export class Email {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(value: string): Email {
    if (!value || typeof value !== 'string') {
      throw new InvalidEmailError(String(value));
    }
    const normalized = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw new InvalidEmailError(value);
    }
    if (normalized.length > 254) {
      throw new InvalidEmailError(value);
    }
    return new Email(normalized);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  getDomain(): string {
    return this.value.split('@')[1] ?? '';
  }
}
