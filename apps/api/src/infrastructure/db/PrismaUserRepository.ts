import type { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { UserMapper } from './mappers/UserMapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.users.findUnique({ where: { id } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.users.findUnique({ where: { email } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findBySupabaseId(supabaseId: string): Promise<User | null> {
    const record = await this.prisma.users.findUnique({ where: { supabase_id: supabaseId } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPrisma(user);
    await this.prisma.users.upsert({
      where: { id: user.id },
      create: data,
      update: {
        wellness_score: data.wellness_score,
        streak_days: data.streak_days,
        last_mood_date: data.last_mood_date,
      },
    });
  }
}
