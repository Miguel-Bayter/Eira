import type { Prisma, chat_conversations as PrismaChatConversation } from '@prisma/client';
import { ChatConversation } from '@domain/entities/ChatConversation';
import type { ChatMessage } from '@domain/entities/ChatConversation';

type PersistedChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export class ChatConversationMapper {
  static toDomain(record: PrismaChatConversation): ChatConversation {
    const messages = Array.isArray(record.messages)
      ? record.messages.flatMap((value) => {
          const parsed = parsePersistedMessage(value);
          return parsed ? [parsed] : [];
        })
      : [];

    return ChatConversation.reconstruct({
      id: record.id,
      userId: record.user_id,
      messages,
      hasCrisis: record.has_crisis,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }

  static toPrisma(conversation: ChatConversation): Omit<PrismaChatConversation, 'messages'> & { messages: Prisma.InputJsonValue } {
    return {
      id: conversation.id,
      user_id: conversation.userId,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })),
      has_crisis: conversation.hasCrisis,
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt,
    };
  }

  static countPersistedUserMessages(value: Prisma.JsonValue): number {
    if (!Array.isArray(value)) return 0;

    return value.reduce<number>((count, entry) => {
      const message = parsePersistedMessage(entry);
      return message?.role === 'user' ? count + 1 : count;
    }, 0);
  }
}

function parsePersistedMessage(value: Prisma.JsonValue): ChatMessage | null {
  if (!isPersistedChatMessage(value)) return null;

  return {
    id: value.id,
    role: value.role,
    content: value.content,
    createdAt: new Date(value.createdAt),
  };
}

function isPersistedChatMessage(value: Prisma.JsonValue): value is PersistedChatMessage {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  return typeof value.id === 'string'
    && (value.role === 'user' || value.role === 'assistant')
    && typeof value.content === 'string'
    && typeof value.createdAt === 'string';
}
