import type { PrismaClient } from '@prisma/client';
import type { IChatRepository } from '@domain/repositories/IChatRepository';
import type { ChatConversation } from '@domain/entities/ChatConversation';
import { ChatConversationMapper } from './mappers/ChatConversationMapper';

export class PrismaChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(conversation: ChatConversation): Promise<void> {
    const data = ChatConversationMapper.toPrisma(conversation);
    await this.prisma.chat_conversations.upsert({
      where: { id: data.id },
      update: {
        messages: data.messages,
        has_crisis: data.has_crisis,
        updated_at: data.updated_at,
      },
      create: data,
    });
  }

  async findLatestByUserId(userId: string): Promise<ChatConversation | null> {
    const row = await this.prisma.chat_conversations.findFirst({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
    });

    return row ? ChatConversationMapper.toDomain(row) : null;
  }

  async countTodayMessagesByUser(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const rows = await this.prisma.chat_conversations.findMany({
      where: {
        user_id: userId,
        updated_at: { gte: startOfDay, lt: endOfDay },
      },
      select: { messages: true },
    });

    return rows.reduce(
      (total, row) => total + ChatConversationMapper.countPersistedUserMessages(row.messages),
      0,
    );
  }
}
