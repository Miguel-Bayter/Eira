import type { IAiService } from '@domain/services/IAiService';
import type { IChatRepository } from '@domain/repositories/IChatRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { ChatMessage } from '@domain/entities/ChatConversation';
import { ChatConversation } from '@domain/entities/ChatConversation';
import { containsCrisisKeywords } from '@domain/services/CrisisSignalDetector';
import { DailyLimitExceededError, UserNotFoundError } from '@domain/errors';
import type { ChatConversationDto, ChatMessageDto } from './GetChatConversation.usecase';

export interface SendChatMessageInput {
  userId: string;
  message: string;
  language?: string;
}

const MAX_DAILY_CHAT_MESSAGES = 50;

export class SendChatMessageUseCase {
  constructor(
    private readonly chatRepo: IChatRepository,
    private readonly userRepo: IUserRepository,
    private readonly aiService: IAiService,
  ) {}

  async execute(input: SendChatMessageInput): Promise<ChatConversationDto> {
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const todayCount = await this.chatRepo.countTodayMessagesByUser(user.id);
    if (todayCount >= MAX_DAILY_CHAT_MESSAGES) {
      throw new DailyLimitExceededError('chat messages', MAX_DAILY_CHAT_MESSAGES);
    }

    const latestConversation = await this.chatRepo.findLatestByUserId(user.id);
    const conversation = shouldStartNewConversation(latestConversation)
      ? ChatConversation.create(user.id)
      : latestConversation;

    const normalizedMessage = input.message.trim();
    const hasUserCrisisSignal = containsCrisisKeywords(normalizedMessage);
    const language = input.language ?? 'en';
    const aiResponse = normalizeAiResponse(
      await this.aiService.chat(
        [...conversation.messages.map((message) => ({ role: message.role, content: message.content })), { role: 'user', content: normalizedMessage }],
        buildSystemPrompt(language, hasUserCrisisSignal),
      ),
      language,
    );

    const exchange = conversation.appendExchange(normalizedMessage, aiResponse);
    await this.chatRepo.save(conversation);

    const nextDailyCount = todayCount + 1;

    return {
      conversationId: conversation.id,
      messages: conversation.messages.map(mapMessageToDto),
      crisis: {
        detected: exchange.crisisSource !== 'none',
        source: exchange.crisisSource,
      },
      dailyCount: nextDailyCount,
      remainingMessages: Math.max(0, MAX_DAILY_CHAT_MESSAGES - nextDailyCount),
    };
  }
}

function buildSystemPrompt(language: string, hasUserCrisisSignal: boolean): string {
  const wantsEnglish = language.startsWith('en');
  const crisisInstruction = wantsEnglish
    ? 'If the message suggests self-harm, suicide, or immediate danger, respond with warmth, grounding, and encourage reaching out to emergency or crisis resources right now. Do not provide harmful instructions. Keep the reply concise and supportive.'
    : 'Si el mensaje sugiere autolesion, suicidio o peligro inmediato, responde con calidez, ayuda a aterrizar la situacion y anima a buscar apoyo profesional o una linea de crisis ahora mismo. No des instrucciones peligrosas. Mantén la respuesta breve y de apoyo.';

  const baseInstruction = wantsEnglish
    ? 'You are Eira, a calm and caring mental wellness companion. Respond with empathy, practical next steps, and short paragraphs. Never diagnose. Never say you replace professional help. Avoid lists unless they add clarity.'
    : 'Eres Eira, una companera serena y cercana para el bienestar emocional. Responde con empatia, pasos practicos y parrafos cortos. Nunca diagnostiques. Nunca digas que reemplazas la ayuda profesional. Evita listas salvo que aporten claridad.';

  const languageInstruction = wantsEnglish ? 'Respond in English.' : 'Responde en espanol.';

  return [baseInstruction, languageInstruction, hasUserCrisisSignal ? crisisInstruction : null]
    .filter((value): value is string => value !== null)
    .join(' ');
}

function normalizeAiResponse(response: string, language: string): string {
  const normalized = response.trim();
  if (normalized.length > 0) return normalized;

  return language.startsWith('en')
    ? 'I am here with you. Take one slow breath, stay with what feels safe right now, and consider reaching out to someone you trust.'
    : 'Estoy aqui contigo. Toma una respiracion lenta, quedate con lo que te haga sentir a salvo ahora mismo y considera contactar a alguien de confianza.';
}

function shouldStartNewConversation(conversation: ChatConversation | null): conversation is null {
  if (!conversation) return true;

  const now = new Date();
  return !isSameCalendarDay(conversation.updatedAt, now);
}

function isSameCalendarDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function mapMessageToDto(message: ChatMessage): ChatMessageDto {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}
