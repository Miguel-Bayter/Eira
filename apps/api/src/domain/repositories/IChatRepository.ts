import type { ChatConversation } from '@domain/entities/ChatConversation';

export interface IChatRepository {
  save(conversation: ChatConversation): Promise<void>;
  findLatestByUserId(userId: string): Promise<ChatConversation | null>;
  countTodayMessagesByUser(userId: string): Promise<number>;
}
