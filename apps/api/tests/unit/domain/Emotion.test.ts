import { describe, it, expect } from 'vitest';
import { Emotion, VALID_EMOTIONS } from '../../../src/domain/value-objects/Emotion';
import { InvalidEmotionError } from '../../../src/domain/errors';

describe('Emotion — Value Object', () => {
  describe('create()', () => {
    it('crea una emoción válida "alegre"', () => {
      const emotion = Emotion.create('alegre');
      expect(emotion.value).toBe('alegre');
    });

    it('normaliza la emoción a minúsculas', () => {
      const emotion = Emotion.create('TRANQUILO');
      expect(emotion.value).toBe('tranquilo');
    });

    it('lanza InvalidEmotionError para emoción inválida', () => {
      expect(() => Emotion.create('feliz')).toThrow(InvalidEmotionError);
    });

    it('lanza InvalidEmotionError para string vacío', () => {
      expect(() => Emotion.create('')).toThrow(InvalidEmotionError);
    });

    it('acepta todas las emociones válidas', () => {
      for (const emotion of VALID_EMOTIONS) {
        expect(() => Emotion.create(emotion)).not.toThrow();
      }
    });
  });

  describe('isNegative()', () => {
    it('retorna true para "ansioso"', () => expect(Emotion.create('ansioso').isNegative()).toBe(true));
    it('retorna true para "triste"', () => expect(Emotion.create('triste').isNegative()).toBe(true));
    it('retorna false para "alegre"', () => expect(Emotion.create('alegre').isNegative()).toBe(false));
    it('retorna false para "neutral"', () => expect(Emotion.create('neutral').isNegative()).toBe(false));
  });

  describe('isPositive()', () => {
    it('retorna true para "alegre"', () => expect(Emotion.create('alegre').isPositive()).toBe(true));
    it('retorna true para "agradecido"', () => expect(Emotion.create('agradecido').isPositive()).toBe(true));
    it('retorna false para "ansioso"', () => expect(Emotion.create('ansioso').isPositive()).toBe(false));
    it('retorna false para "neutral"', () => expect(Emotion.create('neutral').isPositive()).toBe(false));
  });

  describe('equals()', () => {
    it('retorna true para emociones iguales', () => {
      expect(Emotion.create('alegre').equals(Emotion.create('alegre'))).toBe(true);
    });
    it('retorna false para emociones diferentes', () => {
      expect(Emotion.create('alegre').equals(Emotion.create('triste'))).toBe(false);
    });
  });
});
