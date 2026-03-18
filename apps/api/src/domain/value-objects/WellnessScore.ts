import { WellnessScoreOutOfRangeError } from '../errors';

export class WellnessScore {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
    Object.freeze(this);
  }

  static create(value: number): WellnessScore {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new WellnessScoreOutOfRangeError(value);
    }
    return new WellnessScore(value);
  }

  static default(): WellnessScore {
    return new WellnessScore(50);
  }

  getLevel(): 'low' | 'medium' | 'good' | 'high' {
    if (this.value <= 25) return 'low';
    if (this.value <= 50) return 'medium';
    if (this.value <= 75) return 'good';
    return 'high';
  }

  applyBonus(points: number): WellnessScore {
    const newValue = Math.min(100, this.value + points);
    return new WellnessScore(newValue);
  }

  applyPenalty(points: number): WellnessScore {
    const newValue = Math.max(0, this.value - points);
    return new WellnessScore(newValue);
  }

  equals(other: WellnessScore): boolean {
    return this.value === other.value;
  }
}
