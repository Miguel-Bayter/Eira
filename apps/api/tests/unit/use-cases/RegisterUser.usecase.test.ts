import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserUseCase } from '../../../src/application/use-cases/auth/RegisterUser.usecase';
import type { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import type { IEmailService } from '../../../src/domain/services/IEmailService';
import type { IAuthProvider } from '../../../src/domain/services/IAuthProvider';

// Mocks de los puertos
const mockUserRepo: IUserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findBySupabaseId: vi.fn(),
  save: vi.fn(),
};

const mockEmailService: IEmailService = {
  sendWelcome: vi.fn().mockResolvedValue(undefined),
};

const mockAuthProvider: IAuthProvider = {
  register: vi.fn(),
  login: vi.fn(),
  getUserByAccessToken: vi.fn(),
};

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo.findByEmail = vi.fn().mockResolvedValue(null);
    mockUserRepo.save = vi.fn().mockResolvedValue(undefined);
    mockAuthProvider.register = vi.fn().mockResolvedValue({
      supabaseId: 'supabase-123',
      email: 'ana@example.com',
      name: 'Ana Garcia',
      accessToken: 'register-token',
    });
    useCase = new RegisterUserUseCase(mockUserRepo, mockEmailService, mockAuthProvider);
  });

  describe('Registro exitoso', () => {
    it('crea un usuario nuevo y retorna el DTO correcto', async () => {
      const result = await useCase.execute({
        name: 'Ana García',
        email: 'ana@example.com',
        password: 'Password123',
      });

      expect(result.user.email).toBe('ana@example.com');
      expect(result.user.name).toBe('Ana García');
      expect(result.user.wellnessScore).toBe(50);
      expect(result.user.streakDays).toBe(0);
      expect(result.user.id).toBeDefined();
      expect(result.accessToken).toBe('register-token');
    });

    it('guarda el usuario en el repositorio', async () => {
      await useCase.execute({
        name: 'Test',
        email: 'test@x.com',
        password: 'Password123',
      });
      expect(mockUserRepo.save).toHaveBeenCalledOnce();
    });

    it('intenta enviar email de bienvenida', async () => {
      await useCase.execute({
        name: 'Test',
        email: 'test@x.com',
        password: 'Password123',
      });
      // Email is sent asynchronously (fire-and-forget)
      // Wait for it to be called
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockEmailService.sendWelcome).toHaveBeenCalled();
    });
  });

  describe('Usuario ya existe', () => {
    it('retorna el usuario existente sin crear uno nuevo', async () => {
      const existingUser = {
        id: 'existing-id',
        email: { value: 'existing@x.com' },
        name: 'Existing User',
        wellnessScore: 75,
        streakDays: 5,
      };
      mockUserRepo.findByEmail = vi.fn().mockResolvedValue(existingUser);

      const result = await useCase.execute({
        name: 'New Name',
        email: 'existing@x.com',
        password: 'Password123',
      });

      expect(result.user.id).toBe('existing-id');
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });
});
