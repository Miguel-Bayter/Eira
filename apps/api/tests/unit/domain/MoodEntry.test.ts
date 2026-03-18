import { describe, it, expect } from 'vitest';
import { MoodEntry } from '../../../src/domain/entities/MoodEntry';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_EMOTIONS = [
  'alegre', 'tranquilo', 'agradecido', 'esperanzador', 'motivado',
  'ansioso', 'triste', 'enojado', 'frustrado', 'cansado',
  'confundido', 'solitario', 'abrumado', 'asustado', 'neutral',
] as const;

function makeEntry(overrides: {
  userId?: string;
  score?: number;
  emotion?: string;
  note?: string;
}) {
  return MoodEntry.create({
    userId: overrides.userId ?? 'user-123',
    score: overrides.score ?? 7,
    emotion: overrides.emotion ?? 'tranquilo',
    ...(overrides.note !== undefined && { note: overrides.note }),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MoodEntry — Entity', () => {

  // ─── create() ─────────────────────────────────────────────────────────────

  describe('create() — happy path', () => {
    it('creates a valid entry with correct values', () => {
      const entry = makeEntry({ score: 7, emotion: 'tranquilo' });

      expect(entry.id).toBeDefined();
      expect(entry.userId).toBe('user-123');
      expect(entry.score.value).toBe(7);
      expect(entry.emotion.value).toBe('tranquilo');
      expect(entry.isCrisis).toBe(false);
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.note).toBeNull();
    });

    it('sets createdAt to a Date instance', () => {
      const before = new Date();
      const entry = makeEntry({});
      const after = new Date();

      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('sets the correct userId', () => {
      const entry = makeEntry({ userId: 'user-abc-456' });
      expect(entry.userId).toBe('user-abc-456');
    });

    it('generates unique ids for different entries', () => {
      const e1 = makeEntry({});
      const e2 = makeEntry({});
      expect(e1.id).not.toBe(e2.id);
    });

    it('stores an optional note when provided', () => {
      const entry = makeEntry({ score: 6, emotion: 'neutral', note: 'Un dia normal' });
      expect(entry.note).toBe('Un dia normal');
    });

    it('stores null note when no note is provided', () => {
      const entry = makeEntry({ score: 6, emotion: 'neutral' });
      expect(entry.note).toBeNull();
    });
  });

  // ─── isCrisis via score ───────────────────────────────────────────────────

  describe('isCrisis via score thresholds', () => {
    it('score 1 (minimum) → isCrisis=true', () => {
      const entry = makeEntry({ score: 1, emotion: 'triste' });
      expect(entry.isCrisis).toBe(true);
    });

    it('score 2 → isCrisis=true', () => {
      const entry = makeEntry({ score: 2, emotion: 'triste' });
      expect(entry.isCrisis).toBe(true);
    });

    it('score 3 (boundary) → isCrisis=true', () => {
      const entry = makeEntry({ score: 3, emotion: 'ansioso' });
      expect(entry.isCrisis).toBe(true);
    });

    it('score 4 (boundary above) → isCrisis=false', () => {
      const entry = makeEntry({ score: 4, emotion: 'cansado' });
      expect(entry.isCrisis).toBe(false);
    });

    it('score 5 (mid-range) → isCrisis=false', () => {
      const entry = makeEntry({ score: 5, emotion: 'neutral' });
      expect(entry.isCrisis).toBe(false);
    });

    it('score 10 (maximum) → isCrisis=false', () => {
      const entry = makeEntry({ score: 10, emotion: 'alegre' });
      expect(entry.isCrisis).toBe(false);
    });
  });

  // ─── isCrisis via note keywords ───────────────────────────────────────────

  describe('isCrisis via crisis keywords in note', () => {
    it('note with "suicidio" → isCrisis=true even with high score', () => {
      const entry = makeEntry({ score: 8, emotion: 'alegre', note: 'Estoy pensando en el suicidio' });
      expect(entry.isCrisis).toBe(true);
    });

    it('note with "morir" → isCrisis=true', () => {
      const entry = makeEntry({ score: 6, emotion: 'triste', note: 'No quiero morir pero me siento mal' });
      expect(entry.isCrisis).toBe(true);
    });

    it('note with "hacerme daño" → isCrisis=true', () => {
      const entry = makeEntry({ score: 7, emotion: 'ansioso', note: 'Tengo ganas de hacerme daño' });
      expect(entry.isCrisis).toBe(true);
    });

    it('note with "no quiero vivir" → isCrisis=true', () => {
      const entry = makeEntry({ score: 9, emotion: 'neutral', note: 'Siento que no quiero vivir así' });
      expect(entry.isCrisis).toBe(true);
    });

    it('note with "acabar con todo" → isCrisis=true', () => {
      const entry = makeEntry({ score: 5, emotion: 'confundido', note: 'Quiero acabar con todo' });
      expect(entry.isCrisis).toBe(true);
    });

    it('note with "matarme" → isCrisis=true', () => {
      const entry = makeEntry({ score: 6, emotion: 'triste', note: 'Pienso en matarme' });
      expect(entry.isCrisis).toBe(true);
    });

    it('note with "quitarme la vida" → isCrisis=true', () => {
      const entry = makeEntry({ score: 7, emotion: 'solitario', note: 'Quiero quitarme la vida' });
      expect(entry.isCrisis).toBe(true);
    });

    it('note with "no tiene sentido vivir" → isCrisis=true', () => {
      const entry = makeEntry({ score: 8, emotion: 'abrumado', note: 'No tiene sentido vivir de esta manera' });
      expect(entry.isCrisis).toBe(true);
    });

    it('keyword match is case-insensitive (SUICIDIO) → isCrisis=true', () => {
      const entry = makeEntry({ score: 9, emotion: 'alegre', note: 'Pensamientos de SUICIDIO' });
      expect(entry.isCrisis).toBe(true);
    });

    it('keyword match is case-insensitive (MoRiR) → isCrisis=true', () => {
      const entry = makeEntry({ score: 7, emotion: 'tranquilo', note: 'Quisiera MoRiR' });
      expect(entry.isCrisis).toBe(true);
    });

    it('null note does not trigger crisis (isCrisis based on score alone)', () => {
      const entry = makeEntry({ score: 5, emotion: 'neutral' });
      expect(entry.isCrisis).toBe(false);
    });

    it('empty string note does not trigger crisis', () => {
      const entry = makeEntry({ score: 5, emotion: 'neutral', note: '' });
      expect(entry.isCrisis).toBe(false);
    });

    it('note without crisis keywords does not trigger crisis', () => {
      const entry = makeEntry({ score: 6, emotion: 'tranquilo', note: 'Hoy me siento bien, fue un buen dia' });
      expect(entry.isCrisis).toBe(false);
    });
  });

  // ─── reconstruct() ────────────────────────────────────────────────────────

  describe('reconstruct() — preserves all props', () => {
    it('preserves id, userId, score, emotion, note, isCrisis and createdAt', () => {
      const fixedDate = new Date('2025-06-01T10:00:00Z');
      const entry = MoodEntry.reconstruct({
        id: 'fixed-id-123',
        userId: 'user-xyz',
        score: 7,
        emotion: 'alegre',
        note: 'Una buena nota',
        isCrisis: false,
        createdAt: fixedDate,
      });

      expect(entry.id).toBe('fixed-id-123');
      expect(entry.userId).toBe('user-xyz');
      expect(entry.score.value).toBe(7);
      expect(entry.emotion.value).toBe('alegre');
      expect(entry.note).toBe('Una buena nota');
      expect(entry.isCrisis).toBe(false);
      expect(entry.createdAt).toBe(fixedDate);
    });

    it('preserves isCrisis=true even when score is not in crisis range (score=5)', () => {
      const entry = MoodEntry.reconstruct({
        id: 'entry-999',
        userId: 'user-1',
        score: 5,
        emotion: 'neutral',
        note: null,
        isCrisis: true,
        createdAt: new Date(),
      });

      expect(entry.isCrisis).toBe(true);
      expect(entry.score.value).toBe(5);
    });

    it('preserves null note', () => {
      const entry = MoodEntry.reconstruct({
        id: 'entry-1',
        userId: 'user-1',
        score: 6,
        emotion: 'motivado',
        note: null,
        isCrisis: false,
        createdAt: new Date(),
      });

      expect(entry.note).toBeNull();
    });
  });

  // ─── Validation errors ────────────────────────────────────────────────────

  describe('create() — validation errors', () => {
    it('throws when score is 0 (below minimum)', () => {
      expect(() => makeEntry({ score: 0 })).toThrow();
    });

    it('throws when score is 11 (above maximum)', () => {
      expect(() => makeEntry({ score: 11 })).toThrow();
    });

    it('throws when score is a non-integer (e.g. 4.5)', () => {
      expect(() => makeEntry({ score: 4.5 })).toThrow();
    });

    it('throws when emotion is not in the valid list ("feliz")', () => {
      expect(() => makeEntry({ emotion: 'feliz' })).toThrow();
    });

    it('throws when emotion is an empty string', () => {
      expect(() => makeEntry({ emotion: '' })).toThrow();
    });
  });

  // ─── All 15 valid emotions ─────────────────────────────────────────────────

  describe('create() — all 15 valid emotions succeed', () => {
    VALID_EMOTIONS.forEach((emotion) => {
      it(`emotion "${emotion}" creates entry without error`, () => {
        expect(() => makeEntry({ score: 5, emotion })).not.toThrow();
      });
    });
  });

});
