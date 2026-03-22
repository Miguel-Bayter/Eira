import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IEmailService } from '@domain/services/IEmailService';
import type { IAuthProvider } from '@domain/services/IAuthProvider';
import { User } from '@domain/entities/User';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  user: {
    id: string;
    email: string;
    name: string;
    wellnessScore: number;
    streakDays: number;
  };
  accessToken: string | null;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly authProvider: IAuthProvider,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const identity = await this.authProvider.register({
      email: input.email,
      password: input.password,
    });

    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      return {
        user: {
          id: existing.id,
          email: existing.email.value,
          name: existing.name,
          wellnessScore: existing.wellnessScore,
          streakDays: existing.streakDays,
        },
        accessToken: identity.accessToken,
      };
    }

    const user = User.create({
      supabaseId: identity.supabaseId,
      email: input.email,
      name: input.name,
    });

    await this.userRepo.save(user);

    this.emailService.sendWelcome(user.email.value, user.name).catch(() => {
    });

    return {
      user: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        wellnessScore: user.wellnessScore,
        streakDays: user.streakDays,
      },
      accessToken: identity.accessToken,
    };
  }
}
