import { describe, it, expect } from 'vitest';
import { cn } from '../../../src/lib/utils';

describe('cn() — utilidad de clases Tailwind', () => {
  it('concatena clases simples', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('resuelve conflictos de Tailwind (tailwind-merge)', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('omite valores falsy', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c');
  });

  it('maneja clases condicionales', () => {
    const isError = true;
    expect(cn('base-class', isError && 'text-red-500')).toBe('base-class text-red-500');
  });

  it('retorna string vacío sin argumentos', () => {
    expect(cn()).toBe('');
  });

  it('soporta arrays de clases', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });
});
