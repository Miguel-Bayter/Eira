import { describe, expect, it } from 'vitest';
import { ChatConversation } from '../../../src/domain/entities/ChatConversation';
import { ChatMessageEmptyError, ChatResponseEmptyError } from '../../../src/domain/errors';

describe('ChatConversation', () => {
  it('throws a typed error when the user message is empty', () => {
    const conversation = ChatConversation.create('user-1');

    expect(() => conversation.appendExchange('   ', 'Hello')).toThrow(ChatMessageEmptyError);
  });

  it('throws a typed error when the AI response is empty', () => {
    const conversation = ChatConversation.create('user-1');

    expect(() => conversation.appendExchange('Hello', '   ')).toThrow(ChatResponseEmptyError);
  });
});
