import type { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findBySupabaseId(supabaseId: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
