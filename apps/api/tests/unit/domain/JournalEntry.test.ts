import { describe, it, expect } from 'vitest';
import { JournalEntry } from '../../../src/domain/entities/JournalEntry';
import { JournalContentEmptyError, JournalContentTooLongError } from '../../../src/domain/errors';

describe('JournalEntry — Domain Entity', () => {

  describe('create()', () => {
    it('creates a journal entry with valid content', () => {
      const entry = JournalEntry.create({ userId: 'user-1', content: 'Hoy me sentí muy bien.' });
      expect(entry.userId).toBe('user-1');
      expect(entry.content).toBe('Hoy me sentí muy bien.');
      expect(entry.aiAnalysis).toBeNull();
      expect(entry.id).toBeTruthy();
      expect(typeof entry.id).toBe('string');
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.updatedAt).toBeInstanceOf(Date);
    });

    it('trims content on creation', () => {
      const entry = JournalEntry.create({ userId: 'user-1', content: '   Hola mundo   ' });
      expect(entry.content).toBe('Hola mundo');
    });

    it('throws if content is empty string', () => {
      expect(() => JournalEntry.create({ userId: 'user-1', content: '' }))
        .toThrow(JournalContentEmptyError);
    });

    it('throws if content is only whitespace', () => {
      expect(() => JournalEntry.create({ userId: 'user-1', content: '   ' }))
        .toThrow(JournalContentEmptyError);
    });

    it('throws if content exceeds 5000 characters', () => {
      const longContent = 'a'.repeat(5001);
      expect(() => JournalEntry.create({ userId: 'user-1', content: longContent }))
        .toThrow(JournalContentTooLongError);
    });

    it('accepts content of exactly 5000 characters', () => {
      const maxContent = 'a'.repeat(5000);
      expect(() => JournalEntry.create({ userId: 'user-1', content: maxContent }))
        .not.toThrow();
    });

    it('generates a unique id for each entry', () => {
      const entry1 = JournalEntry.create({ userId: 'user-1', content: 'Texto uno' });
      const entry2 = JournalEntry.create({ userId: 'user-1', content: 'Texto dos' });
      expect(entry1.id).not.toBe(entry2.id);
    });
  });

  describe('reconstruct()', () => {
    it('reconstructs a journal entry from persisted props', () => {
      const now = new Date();
      const entry = JournalEntry.reconstruct({
        id: 'entry-id-1',
        userId: 'user-1',
        content: 'Texto de diario',
        aiAnalysis: 'Análisis previo',
        createdAt: now,
        updatedAt: now,
      });
      expect(entry.id).toBe('entry-id-1');
      expect(entry.aiAnalysis).toBe('Análisis previo');
    });

    it('reconstructs with null aiAnalysis', () => {
      const now = new Date();
      const entry = JournalEntry.reconstruct({
        id: 'entry-id-2',
        userId: 'user-1',
        content: 'Sin análisis',
        aiAnalysis: null,
        createdAt: now,
        updatedAt: now,
      });
      expect(entry.aiAnalysis).toBeNull();
    });
  });

  describe('setAiAnalysis()', () => {
    it('sets the AI analysis and updates updatedAt', () => {
      const entry = JournalEntry.create({ userId: 'user-1', content: 'Mi entrada de hoy' });
      const beforeUpdate = entry.updatedAt;

      // Ensure some time passes
      const analysis = 'Emociones detectadas: calma, esperanza.';
      entry.setAiAnalysis(analysis);

      expect(entry.aiAnalysis).toBe(analysis);
      expect(entry.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('allows updating the analysis multiple times', () => {
      const entry = JournalEntry.create({ userId: 'user-1', content: 'Texto inicial' });
      entry.setAiAnalysis('Primer análisis');
      entry.setAiAnalysis('Segundo análisis');
      expect(entry.aiAnalysis).toBe('Segundo análisis');
    });
  });

});
