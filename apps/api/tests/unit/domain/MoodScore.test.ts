import { describe, it, expect } from 'vitest';
import { MoodScore } from '../../../src/domain/value-objects/MoodScore';
import { MoodScoreOutOfRangeError } from '../../../src/domain/errors';

describe('MoodScore — Value Object', () => {
  describe('create()', () => {
    it('creates a valid MoodScore with value 1', () => {
      const score = MoodScore.create(1);
      expect(score.value).toBe(1);
    });

    it('creates a valid MoodScore with value 10', () => {
      const score = MoodScore.create(10);
      expect(score.value).toBe(10);
    });

    it('creates a valid MoodScore with value 5', () => {
      const score = MoodScore.create(5);
      expect(score.value).toBe(5);
    });

    it('throws MoodScoreOutOfRangeError for value 0', () => {
      expect(() => MoodScore.create(0)).toThrow(MoodScoreOutOfRangeError);
    });

    it('throws MoodScoreOutOfRangeError for value 11', () => {
      expect(() => MoodScore.create(11)).toThrow(MoodScoreOutOfRangeError);
    });

    it('throws MoodScoreOutOfRangeError for negative value', () => {
      expect(() => MoodScore.create(-1)).toThrow(MoodScoreOutOfRangeError);
    });

    it('throws MoodScoreOutOfRangeError for non-integer value', () => {
      expect(() => MoodScore.create(5.5)).toThrow(MoodScoreOutOfRangeError);
    });
  });

  describe('isCrisis()', () => {
    it('returns true for score 1', () => expect(MoodScore.create(1).isCrisis()).toBe(true));
    it('returns true for score 2', () => expect(MoodScore.create(2).isCrisis()).toBe(true));
    it('returns true for score 3', () => expect(MoodScore.create(3).isCrisis()).toBe(true));
    it('returns false for score 4', () => expect(MoodScore.create(4).isCrisis()).toBe(false));
    it('returns false for score 10', () => expect(MoodScore.create(10).isCrisis()).toBe(false));
  });

  describe('isHighMood()', () => {
    it('returns true for score 8', () => expect(MoodScore.create(8).isHighMood()).toBe(true));
    it('returns true for score 10', () => expect(MoodScore.create(10).isHighMood()).toBe(true));
    it('returns false for score 7', () => expect(MoodScore.create(7).isHighMood()).toBe(false));
  });

  describe('getLabel()', () => {
    it('returns "crisis" for score 1', () => expect(MoodScore.create(1).getLabel()).toBe('crisis'));
    it('returns "crisis" for score 2', () => expect(MoodScore.create(2).getLabel()).toBe('crisis'));
    it('returns "low" for score 3', () => expect(MoodScore.create(3).getLabel()).toBe('low'));
    it('returns "low" for score 4', () => expect(MoodScore.create(4).getLabel()).toBe('low'));
    it('returns "neutral" for score 5', () => expect(MoodScore.create(5).getLabel()).toBe('neutral'));
    it('returns "good" for score 8', () => expect(MoodScore.create(8).getLabel()).toBe('good'));
    it('returns "excellent" for score 10', () => expect(MoodScore.create(10).getLabel()).toBe('excellent'));
  });

  describe('equals()', () => {
    it('returns true for two equal scores', () => {
      expect(MoodScore.create(5).equals(MoodScore.create(5))).toBe(true);
    });
    it('returns false for different scores', () => {
      expect(MoodScore.create(5).equals(MoodScore.create(6))).toBe(false);
    });
  });

  describe('immutability', () => {
    it('the object is frozen (immutable)', () => {
      const score = MoodScore.create(5);
      expect(Object.isFrozen(score)).toBe(true);
    });
  });
});
