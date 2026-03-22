import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IAuthProvider } from '@domain/services/IAuthProvider';
import { User } from '@domain/entities/User';

const DEFAULT_USER_NAME = 'Eira User';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: {
    id: string;
    email: string;
    name: string;
    wellnessScore: number;
    streakDays: number;
  };
  token: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authProvider: IAuthProvider,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const authSession = await this.authProvider.login({
      email: input.email,
      password: input.password,
    });

    let user = await this.userRepository.findBySupabaseId(authSession.supabaseId);
    if (!user) {
      user = User.create({
        supabaseId: authSession.supabaseId,
        email: authSession.email,
        name: authSession.name ?? DEFAULT_USER_NAME,
      });
      await this.userRepository.save(user);
    }

    return {
      user: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        wellnessScore: user.wellnessScore,
        streakDays: user.streakDays,
      },
      token: authSession.accessToken,
    };
  }
}
