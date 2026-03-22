import { containsCrisisKeywords } from '@domain/services/CrisisSignalDetector';
import { ChatMessageEmptyError, ChatResponseEmptyError } from '@domain/errors';

export type ChatMessageRole = 'user' | 'assistant';
export type ChatCrisisSource = 'none' | 'user_message' | 'assistant_message' | 'both' | 'history';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: Date;
}

interface ChatConversationProps {
  id: string;
  userId: string;
  messages: ChatMessage[];
  hasCrisis: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatExchangeResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  crisisSource: Exclude<ChatCrisisSource, 'history'>;
}

export class ChatConversation {
  private constructor(private props: ChatConversationProps) {}

  static create(userId: string): ChatConversation {
    const now = new Date();
    return new ChatConversation({
      id: crypto.randomUUID(),
      userId,
      messages: [],
      hasCrisis: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: ChatConversationProps): ChatConversation {
    return new ChatConversation({
      ...props,
      messages: [...props.messages],
    });
  }

  appendExchange(userContent: string, assistantContent: string): ChatExchangeResult {
    const normalizedUserContent = userContent.trim();
    const normalizedAssistantContent = assistantContent.trim();

    if (normalizedUserContent.length === 0) {
      throw new ChatMessageEmptyError();
    }

    if (normalizedAssistantContent.length === 0) {
      throw new ChatResponseEmptyError();
    }

    const now = new Date();
    const userMessage = this.createMessage('user', normalizedUserContent, now);
    const assistantMessage = this.createMessage('assistant', normalizedAssistantContent, now);
    const userHasCrisis = containsCrisisKeywords(normalizedUserContent);
    const assistantHasCrisis = containsCrisisKeywords(normalizedAssistantContent);

    this.props.messages.push(userMessage, assistantMessage);
    this.props.hasCrisis = this.props.hasCrisis || userHasCrisis || assistantHasCrisis;
    this.props.updatedAt = now;

    return {
      userMessage,
      assistantMessage,
      crisisSource: ChatConversation.resolveCrisisSource(userHasCrisis, assistantHasCrisis),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get messages(): ChatMessage[] {
    return [...this.props.messages];
  }

  get hasCrisis(): boolean {
    return this.props.hasCrisis;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get userMessageCount(): number {
    return this.props.messages.filter((message) => message.role === 'user').length;
  }

  private createMessage(role: ChatMessageRole, content: string, createdAt: Date): ChatMessage {
    return {
      id: crypto.randomUUID(),
      role,
      content,
      createdAt,
    };
  }

  private static resolveCrisisSource(
    userHasCrisis: boolean,
    assistantHasCrisis: boolean,
  ): Exclude<ChatCrisisSource, 'history'> {
    if (userHasCrisis && assistantHasCrisis) return 'both';
    if (userHasCrisis) return 'user_message';
    if (assistantHasCrisis) return 'assistant_message';
    return 'none';
  }
}
