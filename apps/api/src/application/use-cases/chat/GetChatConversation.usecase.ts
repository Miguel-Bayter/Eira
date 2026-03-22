import type { IChatRepository } from '@domain/repositories/IChatRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { ChatCrisisSource, ChatMessage } from '@domain/entities/ChatConversation';
import { UserNotFoundError } from '@domain/errors';

export interface GetChatConversationInput {
  userId: string;
}

export interface ChatMessageDto {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatConversationDto {
  conversationId: string | null;
  messages: ChatMessageDto[];
  crisis: {
    detected: boolean;
    source: ChatCrisisSource;
  };
  dailyCount: number;
  remainingMessages: number;
}

const MAX_DAILY_CHAT_MESSAGES = 50;

export class GetChatConversationUseCase {
  constructor(
    private readonly chatRepo: IChatRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: GetChatConversationInput): Promise<ChatConversationDto> {
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const [conversation, dailyCount] = await Promise.all([
      this.chatRepo.findLatestByUserId(user.id),
      this.chatRepo.countTodayMessagesByUser(user.id),
    ]);

    return {
      conversationId: conversation?.id ?? null,
      messages: conversation ? conversation.messages.map(mapMessageToDto) : [],
      crisis: {
        detected: conversation?.hasCrisis ?? false,
        source: conversation?.hasCrisis ? 'history' : 'none',
      },
      dailyCount,
      remainingMessages: Math.max(0, MAX_DAILY_CHAT_MESSAGES - dailyCount),
    };
  }
}

function mapMessageToDto(message: ChatMessage): ChatMessageDto {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}
