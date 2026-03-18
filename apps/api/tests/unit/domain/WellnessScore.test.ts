import { describe, it, expect } from 'vitest';
import { WellnessScore } from '../../../src/domain/value-objects/WellnessScore';
import { WellnessScoreOutOfRangeError } from '../../../src/domain/errors';

describe('WellnessScore — Value Object', () => {
  describe('create()', () => {
    it('crea un WellnessScore con valor 0', () => {
      expect(WellnessScore.create(0).value).toBe(0);
    });
    it('crea un WellnessScore con valor 100', () => {
      expect(WellnessScore.create(100).value).toBe(100);
    });
    it('crea un WellnessScore con valor 50', () => {
      expect(WellnessScore.create(50).value).toBe(50);
    });
    it('lanza error para valor -1', () => {
      expect(() => WellnessScore.create(-1)).toThrow(WellnessScoreOutOfRangeError);
    });
    it('lanza error para valor 101', () => {
      expect(() => WellnessScore.create(101)).toThrow(WellnessScoreOutOfRangeError);
    });
  });

  describe('default()', () => {
    it('retorna 50 como valor por defecto', () => {
      expect(WellnessScore.default().value).toBe(50);
    });
  });

  describe('getLevel()', () => {
    it('retorna "low" para 0-25', () => expect(WellnessScore.create(25).getLevel()).toBe('low'));
    it('retorna "medium" para 26-50', () => expect(WellnessScore.create(50).getLevel()).toBe('medium'));
    it('retorna "good" para 51-75', () => expect(WellnessScore.create(75).getLevel()).toBe('good'));
    it('retorna "high" para 76-100', () => expect(WellnessScore.create(100).getLevel()).toBe('high'));
  });

  describe('applyBonus() / applyPenalty()', () => {
    it('aplica bonus sin superar 100', () => {
      expect(WellnessScore.create(95).applyBonus(10).value).toBe(100);
    });
    it('aplica penalidad sin bajar de 0', () => {
      expect(WellnessScore.create(5).applyPenalty(10).value).toBe(0);
    });
    it('aplica bonus normal', () => {
      expect(WellnessScore.create(50).applyBonus(10).value).toBe(60);
    });
  });
});
