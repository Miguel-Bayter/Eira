import { describe, it, expect } from 'vitest';
import { MoodScore } from '../../../src/domain/value-objects/MoodScore';
import { MoodScoreOutOfRangeError } from '../../../src/domain/errors';

describe('MoodScore — Value Object', () => {
  describe('create()', () => {
    it('crea un MoodScore válido con valor 1', () => {
      const score = MoodScore.create(1);
      expect(score.value).toBe(1);
    });

    it('crea un MoodScore válido con valor 10', () => {
      const score = MoodScore.create(10);
      expect(score.value).toBe(10);
    });

    it('crea un MoodScore válido con valor 5', () => {
      const score = MoodScore.create(5);
      expect(score.value).toBe(5);
    });

    it('lanza MoodScoreOutOfRangeError si el valor es 0', () => {
      expect(() => MoodScore.create(0)).toThrow(MoodScoreOutOfRangeError);
    });

    it('lanza MoodScoreOutOfRangeError si el valor es 11', () => {
      expect(() => MoodScore.create(11)).toThrow(MoodScoreOutOfRangeError);
    });

    it('lanza MoodScoreOutOfRangeError si el valor es negativo', () => {
      expect(() => MoodScore.create(-1)).toThrow(MoodScoreOutOfRangeError);
    });

    it('lanza MoodScoreOutOfRangeError si el valor no es entero', () => {
      expect(() => MoodScore.create(5.5)).toThrow(MoodScoreOutOfRangeError);
    });
  });

  describe('isCrisis()', () => {
    it('retorna true para score 1', () => expect(MoodScore.create(1).isCrisis()).toBe(true));
    it('retorna true para score 2', () => expect(MoodScore.create(2).isCrisis()).toBe(true));
    it('retorna true para score 3', () => expect(MoodScore.create(3).isCrisis()).toBe(true));
    it('retorna false para score 4', () => expect(MoodScore.create(4).isCrisis()).toBe(false));
    it('retorna false para score 10', () => expect(MoodScore.create(10).isCrisis()).toBe(false));
  });

  describe('isHighMood()', () => {
    it('retorna true para score 8', () => expect(MoodScore.create(8).isHighMood()).toBe(true));
    it('retorna true para score 10', () => expect(MoodScore.create(10).isHighMood()).toBe(true));
    it('retorna false para score 7', () => expect(MoodScore.create(7).isHighMood()).toBe(false));
  });

  describe('getLabel()', () => {
    it('retorna "crisis" para score 1', () => expect(MoodScore.create(1).getLabel()).toBe('crisis'));
    it('retorna "crisis" para score 2', () => expect(MoodScore.create(2).getLabel()).toBe('crisis'));
    it('retorna "bajo" para score 3', () => expect(MoodScore.create(3).getLabel()).toBe('bajo'));
    it('retorna "bajo" para score 4', () => expect(MoodScore.create(4).getLabel()).toBe('bajo'));
    it('retorna "neutral" para score 5', () => expect(MoodScore.create(5).getLabel()).toBe('neutral'));
    it('retorna "bien" para score 8', () => expect(MoodScore.create(8).getLabel()).toBe('bien'));
    it('retorna "excelente" para score 10', () => expect(MoodScore.create(10).getLabel()).toBe('excelente'));
  });

  describe('equals()', () => {
    it('retorna true para dos scores iguales', () => {
      expect(MoodScore.create(5).equals(MoodScore.create(5))).toBe(true);
    });
    it('retorna false para scores diferentes', () => {
      expect(MoodScore.create(5).equals(MoodScore.create(6))).toBe(false);
    });
  });

  describe('inmutabilidad', () => {
    it('el objeto es frozen (inmutable)', () => {
      const score = MoodScore.create(5);
      expect(Object.isFrozen(score)).toBe(true);
    });
  });
});
