import { describe, it, expect } from 'vitest';
import { MoodEntry } from '../../../src/domain/entities/MoodEntry';

describe('MoodEntry — Entity', () => {
  describe('create()', () => {
    it('crea una entrada de mood válida', () => {
      const entry = MoodEntry.create({
        userId: 'user-123',
        score: 7,
        emotion: 'tranquilo',
      });
      expect(entry.id).toBeDefined();
      expect(entry.score.value).toBe(7);
      expect(entry.emotion.value).toBe('tranquilo');
      expect(entry.isCrisis).toBe(false);
    });

    it('marca isCrisis=true para score ≤ 3', () => {
      const entry = MoodEntry.create({ userId: 'u', score: 2, emotion: 'triste' });
      expect(entry.isCrisis).toBe(true);
    });

    it('marca isCrisis=true si la nota contiene palabras clave', () => {
      const entry = MoodEntry.create({
        userId: 'u',
        score: 5,
        emotion: 'triste',
        note: 'Estoy pensando en el suicidio',
      });
      expect(entry.isCrisis).toBe(true);
    });

    it('nota null no activa crisis', () => {
      const entry = MoodEntry.create({ userId: 'u', score: 5, emotion: 'neutral' });
      expect(entry.isCrisis).toBe(false);
    });

    it('lanza error para score inválido', () => {
      expect(() =>
        MoodEntry.create({ userId: 'u', score: 0, emotion: 'neutral' }),
      ).toThrow();
    });

    it('lanza error para emoción inválida', () => {
      expect(() =>
        MoodEntry.create({ userId: 'u', score: 5, emotion: 'feliz' }),
      ).toThrow();
    });
  });
});
