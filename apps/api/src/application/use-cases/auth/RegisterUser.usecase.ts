import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IEmailService } from '../../ports/IEmailService';
import { User } from '@domain/entities/User';

export interface RegisterUserInput {
  name: string;
  email: string;
  supabaseId: string;
}

export interface RegisterUserOutput {
  id: string;
  email: string;
  name: string;
  wellnessScore: number;
  streakDays: number;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // 1. Verificar que el email no esté registrado
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      // Retornamos el usuario existente (idempotente — Supabase ya verificó)
      return {
        id: existing.id,
        email: existing.email.value,
        name: existing.name,
        wellnessScore: existing.wellnessScore,
        streakDays: existing.streakDays,
      };
    }

    // 2. Crear la entidad User
    const user = User.create({
      supabaseId: input.supabaseId,
      email: input.email,
      name: input.name,
    });

    // 3. Persistir
    await this.userRepo.save(user);

    // 4. Enviar email de bienvenida (fire-and-forget, no bloquear el registro)
    this.emailService.sendWelcome(user.email.value, user.name).catch(() => {
      // El error de email no debe fallar el registro
    });

    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      wellnessScore: user.wellnessScore,
      streakDays: user.streakDays,
    };
  }
}
