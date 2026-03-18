import { describe, it, expect } from 'vitest';
import { User } from '../../../src/domain/entities/User';

describe('User — Entity', () => {
  describe('create()', () => {
    it('crea un usuario con valores por defecto correctos', () => {
      const user = User.create({
        supabaseId: 'supabase-123',
        email: 'test@example.com',
        name: 'Ana García',
      });

      expect(user.id).toBeDefined();
      expect(user.email.value).toBe('test@example.com');
      expect(user.name).toBe('Ana García');
      expect(user.wellnessScore).toBe(50);
      expect(user.streakDays).toBe(0);
      expect(user.lastMoodDate).toBeNull();
    });

    it('normaliza el nombre con trim()', () => {
      const user = User.create({
        supabaseId: 'sb-123',
        email: 'a@b.com',
        name: '  Juan  ',
      });
      expect(user.name).toBe('Juan');
    });

    it('genera un ID único por cada usuario', () => {
      const u1 = User.create({ supabaseId: 'sb-1', email: 'a@b.com', name: 'A' });
      const u2 = User.create({ supabaseId: 'sb-2', email: 'c@d.com', name: 'B' });
      expect(u1.id).not.toBe(u2.id);
    });
  });

  describe('incrementStreakForToday()', () => {
    it('establece racha a 1 la primera vez', () => {
      const user = User.create({ supabaseId: 'sb', email: 'a@b.com', name: 'A' });
      user.incrementStreakForToday();
      expect(user.streakDays).toBe(1);
      expect(user.lastMoodDate).not.toBeNull();
    });

    it('no incrementa si ya se llamó hoy', () => {
      const user = User.create({ supabaseId: 'sb', email: 'a@b.com', name: 'A' });
      user.incrementStreakForToday();
      user.incrementStreakForToday();
      expect(user.streakDays).toBe(1);
    });
  });

  describe('applyHighMoodBonus()', () => {
    it('incrementa wellnessScore en 5 puntos', () => {
      const user = User.create({ supabaseId: 'sb', email: 'a@b.com', name: 'A' });
      user.applyHighMoodBonus();
      expect(user.wellnessScore).toBe(55);
    });

    it('no supera 100', () => {
      const user = User.reconstruct({
        id: 'id',
        supabaseId: 'sb',
        email: 'a@b.com',
        name: 'A',
        wellnessScore: 98,
        streakDays: 0,
        lastMoodDate: null,
        createdAt: new Date(),
      });
      user.applyHighMoodBonus();
      expect(user.wellnessScore).toBe(100);
    });
  });

  describe('applyLowMoodPenalty()', () => {
    it('reduce wellnessScore en 3 puntos', () => {
      const user = User.create({ supabaseId: 'sb', email: 'a@b.com', name: 'A' });
      user.applyLowMoodPenalty();
      expect(user.wellnessScore).toBe(47);
    });

    it('no baja de 0', () => {
      const user = User.reconstruct({
        id: 'id',
        supabaseId: 'sb',
        email: 'a@b.com',
        name: 'A',
        wellnessScore: 2,
        streakDays: 0,
        lastMoodDate: null,
        createdAt: new Date(),
      });
      user.applyLowMoodPenalty();
      expect(user.wellnessScore).toBe(0);
    });
  });

  describe('applyGameBonus()', () => {
    it('aplica puntos de juego', () => {
      const user = User.create({ supabaseId: 'sb', email: 'a@b.com', name: 'A' });
      user.applyGameBonus(10);
      expect(user.wellnessScore).toBe(60);
    });
  });
});
