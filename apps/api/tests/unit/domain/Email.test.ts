import { describe, it, expect } from 'vitest';
import { Email } from '../../../src/domain/value-objects/Email';
import { InvalidEmailError } from '../../../src/domain/errors';

describe('Email — Value Object', () => {
  describe('create()', () => {
    it('crea un Email válido', () => {
      const email = Email.create('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('normaliza el email a minúsculas', () => {
      const email = Email.create('Test@EXAMPLE.COM');
      expect(email.value).toBe('test@example.com');
    });

    it('elimina espacios del email', () => {
      const email = Email.create('  test@example.com  ');
      expect(email.value).toBe('test@example.com');
    });

    it('lanza InvalidEmailError para email sin @', () => {
      expect(() => Email.create('notanemail')).toThrow(InvalidEmailError);
    });

    it('lanza InvalidEmailError para email vacío', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailError);
    });

    it('lanza InvalidEmailError para email con doble @', () => {
      expect(() => Email.create('a@@b.com')).toThrow(InvalidEmailError);
    });

    it('lanza InvalidEmailError para email mayor a 254 caracteres', () => {
      const longEmail = 'a'.repeat(250) + '@b.com';
      expect(() => Email.create(longEmail)).toThrow(InvalidEmailError);
    });
  });

  describe('getDomain()', () => {
    it('retorna el dominio del email', () => {
      const email = Email.create('user@gmail.com');
      expect(email.getDomain()).toBe('gmail.com');
    });
  });

  describe('equals()', () => {
    it('retorna true para emails iguales', () => {
      expect(Email.create('a@b.com').equals(Email.create('a@b.com'))).toBe(true);
    });
    it('retorna false para emails diferentes', () => {
      expect(Email.create('a@b.com').equals(Email.create('c@b.com'))).toBe(false);
    });
    it('case insensitive — mismo email diferente caso es igual', () => {
      expect(Email.create('TEST@B.COM').equals(Email.create('test@b.com'))).toBe(true);
    });
  });
});
