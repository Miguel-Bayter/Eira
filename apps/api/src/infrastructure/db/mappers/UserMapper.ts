import type { users as PrismaUser } from '@prisma/client';
import { User } from '@domain/entities/User';

export class UserMapper {
  static toDomain(record: PrismaUser): User {
    return User.reconstruct({
      id: record.id,
      supabaseId: record.supabase_id,
      email: record.email,
      name: record.name,
      wellnessScore: record.wellness_score,
      streakDays: record.streak_days,
      lastMoodDate: record.last_mood_date,
      createdAt: record.created_at,
    });
  }

  static toPrisma(user: User): Omit<PrismaUser, 'updated_at'> {
    return {
      id: user.id,
      supabase_id: user.supabaseId,
      email: user.email.value,
      name: user.name,
      wellness_score: user.wellnessScore,
      streak_days: user.streakDays,
      last_mood_date: user.lastMoodDate,
      created_at: user.createdAt,
    };
  }
}
