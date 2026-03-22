import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginUserUseCase } from '../../../src/application/use-cases/auth/LoginUser.usecase';
import type { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import type { IAuthProvider } from '../../../src/domain/services/IAuthProvider';

const mockUserRepository: IUserRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findBySupabaseId: vi.fn(),
  save: vi.fn(),
};

const mockAuthProvider: IAuthProvider = {
  register: vi.fn(),
  login: vi.fn(),
  getUserByAccessToken: vi.fn(),
};

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthProvider.login = vi.fn().mockResolvedValue({
      supabaseId: 'supabase-user-id',
      email: 'ana@example.com',
      name: 'Ana',
      accessToken: 'login-token',
    });
    useCase = new LoginUserUseCase(mockUserRepository, mockAuthProvider);
  });

  it('returns the existing internal user when one already exists', async () => {
    mockUserRepository.findBySupabaseId = vi.fn().mockResolvedValue({
      id: 'internal-user-id',
      email: { value: 'ana@example.com' },
      name: 'Ana',
      wellnessScore: 55,
      streakDays: 3,
    });

    const result = await useCase.execute({
      email: 'ana@example.com',
      password: 'Password123',
    });

    expect(result.user).toEqual({
      id: 'internal-user-id',
      email: 'ana@example.com',
      name: 'Ana',
      wellnessScore: 55,
      streakDays: 3,
    });
    expect(result.token).toBe('login-token');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('bootstraps the internal user when auth succeeds but the local record is missing', async () => {
    mockUserRepository.findBySupabaseId = vi.fn().mockResolvedValue(null);
    mockUserRepository.save = vi.fn().mockResolvedValue(undefined);

    const result = await useCase.execute({
      email: 'ana@example.com',
      password: 'Password123',
    });

    expect(result.user.email).toBe('ana@example.com');
    expect(result.user.name).toBe('Ana');
    expect(result.token).toBe('login-token');
    expect(mockUserRepository.save).toHaveBeenCalledOnce();
  });
});
