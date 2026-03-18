import type { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';

export interface GetOrCreateUserInput {
  supabaseId: string;
  email: string;
  name: string;
}

export interface GetOrCreateUserOutput {
  id: string;
  email: string;
  name: string;
  wellnessScore: number;
  streakDays: number;
}

export class GetOrCreateUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: GetOrCreateUserInput): Promise<GetOrCreateUserOutput> {
    let user = await this.userRepo.findBySupabaseId(input.supabaseId);

    if (!user) {
      user = User.create({
        supabaseId: input.supabaseId,
        email: input.email,
        name: input.name,
      });
      await this.userRepo.save(user);
    }

    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      wellnessScore: user.wellnessScore,
      streakDays: user.streakDays,
    };
  }
}
