import { describe, it, expect } from 'vitest';
import { AnonymousAlias } from '../../../src/domain/value-objects/AnonymousAlias';

describe('AnonymousAlias — Value Object', () => {
  describe('generate()', () => {
    it('returns an AnonymousAlias with a non-empty string value', () => {
      const alias = AnonymousAlias.generate();
      expect(alias.value).toBeTruthy();
      expect(alias.value.length).toBeGreaterThan(0);
    });

    it('produces a value in the format "Noun adjective" (capitalized noun)', () => {
      // Run multiple times to reduce randomness risk
      for (let i = 0; i < 10; i++) {
        const alias = AnonymousAlias.generate();
        // First character should be uppercase (capitalized noun)
        expect(alias.value[0]).toBe(alias.value[0]?.toUpperCase());
        // Value should contain a space separating noun and adjective
        expect(alias.value).toContain(' ');
      }
    });

    it('generates different aliases across calls (probabilistic)', () => {
      const aliases = new Set<string>();
      for (let i = 0; i < 20; i++) {
        aliases.add(AnonymousAlias.generate().value);
      }
      // With 10 nouns × 10 adjectives = 100 combinations, expect more than 1 unique across 20 calls
      expect(aliases.size).toBeGreaterThan(1);
    });

    it('returns a frozen (immutable) object', () => {
      const alias = AnonymousAlias.generate();
      expect(Object.isFrozen(alias)).toBe(true);
    });
  });

  describe('fromString()', () => {
    it('creates an alias from a valid non-empty string', () => {
      const alias = AnonymousAlias.fromString('Luna serena');
      expect(alias.value).toBe('Luna serena');
    });

    it('trims surrounding whitespace', () => {
      const alias = AnonymousAlias.fromString('  Montaña valiente  ');
      expect(alias.value).toBe('Montaña valiente');
    });

    it('falls back to generate() when given an empty string', () => {
      const alias = AnonymousAlias.fromString('');
      expect(alias.value.length).toBeGreaterThan(0);
    });

    it('falls back to generate() when given a whitespace-only string', () => {
      const alias = AnonymousAlias.fromString('   ');
      expect(alias.value.length).toBeGreaterThan(0);
    });

    it('returns a frozen (immutable) object', () => {
      const alias = AnonymousAlias.fromString('Río tranquilo');
      expect(Object.isFrozen(alias)).toBe(true);
    });
  });

  describe('equals()', () => {
    it('returns true for two aliases with the same value', () => {
      const a = AnonymousAlias.fromString('Flor pacífica');
      const b = AnonymousAlias.fromString('Flor pacífica');
      expect(a.equals(b)).toBe(true);
    });

    it('returns false for two aliases with different values', () => {
      const a = AnonymousAlias.fromString('Estrella luminosa');
      const b = AnonymousAlias.fromString('Nube gentil');
      expect(a.equals(b)).toBe(false);
    });

    it('is reflexive — alias equals itself', () => {
      const alias = AnonymousAlias.fromString('Aurora fuerte');
      expect(alias.equals(alias)).toBe(true);
    });
  });
});
