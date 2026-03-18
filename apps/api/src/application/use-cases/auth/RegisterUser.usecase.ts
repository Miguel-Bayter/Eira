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
    // 1. Check that the email is not already registered
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      // Return the existing user (idempotent — Supabase already verified)
      return {
        id: existing.id,
        email: existing.email.value,
        name: existing.name,
        wellnessScore: existing.wellnessScore,
        streakDays: existing.streakDays,
      };
    }

    // 2. Create the User entity
    const user = User.create({
      supabaseId: input.supabaseId,
      email: input.email,
      name: input.name,
    });

    // 3. Persist
    await this.userRepo.save(user);

    // 4. Send welcome email (fire-and-forget, do not block registration)
    this.emailService.sendWelcome(user.email.value, user.name).catch(() => {
      // Email errors must not fail the registration
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
