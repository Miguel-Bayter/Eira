import { MoodScoreOutOfRangeError } from '../errors';

export class MoodScore {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
    Object.freeze(this);
  }

  static create(value: number): MoodScore {
    if (!Number.isInteger(value) || value < 1 || value > 10) {
      throw new MoodScoreOutOfRangeError(value);
    }
    return new MoodScore(value);
  }

  isCrisis(): boolean {
    return this.value <= 3;
  }

  isLowMood(): boolean {
    return this.value <= 4;
  }

  isHighMood(): boolean {
    return this.value >= 8;
  }

  isNeutral(): boolean {
    return this.value >= 5 && this.value <= 7;
  }

  equals(other: MoodScore): boolean {
    return this.value === other.value;
  }

  getLabel(): string {
    if (this.value <= 2) return 'crisis';
    if (this.value <= 4) return 'bajo';
    if (this.value <= 6) return 'neutral';
    if (this.value <= 8) return 'bien';
    return 'excelente';
  }
}
