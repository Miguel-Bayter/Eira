import { InvalidEmotionError } from '../errors';

export const VALID_EMOTIONS = [
  'alegre', 'tranquilo', 'agradecido', 'esperanzador', 'motivado',
  'ansioso', 'triste', 'enojado', 'frustrado', 'cansado',
  'confundido', 'solitario', 'abrumado', 'asustado', 'neutral',
] as const;

export type EmotionValue = typeof VALID_EMOTIONS[number];

export class Emotion {
  readonly value: EmotionValue;

  private constructor(value: EmotionValue) {
    this.value = value;
    Object.freeze(this);
  }

  static create(value: string): Emotion {
    const normalized = value.trim().toLowerCase() as EmotionValue;
    if (!VALID_EMOTIONS.includes(normalized)) {
      throw new InvalidEmotionError(value);
    }
    return new Emotion(normalized);
  }

  isNegative(): boolean {
    return ['ansioso', 'triste', 'enojado', 'frustrado', 'cansado',
      'confundido', 'solitario', 'abrumado', 'asustado'].includes(this.value);
  }

  isPositive(): boolean {
    return ['alegre', 'tranquilo', 'agradecido', 'esperanzador', 'motivado'].includes(this.value);
  }

  equals(other: Emotion): boolean {
    return this.value === other.value;
  }
}
