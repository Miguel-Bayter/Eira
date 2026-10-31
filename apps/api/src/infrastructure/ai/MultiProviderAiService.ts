import type { IAiService, AiMessage } from '@domain/services/IAiService';
import { AiServiceUnavailableError } from '@domain/errors';
import { logger } from '../logging/logger';

export class MultiProviderAiService implements IAiService {
  constructor(
    private readonly primary: IAiService,   // Groq (fast)
    private readonly fallback: IAiService,  // Gemini
  ) {}

  async chat(messages: AiMessage[], systemPrompt: string): Promise<string> {
    try {
      return await this.primary.chat(messages, systemPrompt);
    } catch (primaryErr) {
      logger.error({ err: primaryErr }, '[AI] Primary (Groq) chat failed');
      try {
        return await this.fallback.chat(messages, systemPrompt);
      } catch (fallbackErr) {
        logger.error({ err: fallbackErr }, '[AI] Fallback (Gemini) chat failed');
        throw new AiServiceUnavailableError();
      }
    }
  }

  async analyze(text: string, prompt: string): Promise<string> {
    try {
      return await this.primary.analyze(text, prompt);
    } catch (primaryErr) {
      logger.error({ err: primaryErr }, '[AI] Primary (Groq) analyze failed');
      try {
        return await this.fallback.analyze(text, prompt);
      } catch (fallbackErr) {
        logger.error({ err: fallbackErr }, '[AI] Fallback (Gemini) analyze failed');
        throw new AiServiceUnavailableError();
      }
    }
  }

  async moderate(text: string): Promise<{ isApproved: boolean; reason?: string }> {
    try {
      return await this.primary.moderate(text);
    } catch (primaryErr) {
      logger.error({ err: primaryErr }, '[AI] Primary (Groq) moderate failed');
      return this.fallback.moderate(text);
    }
  }
}

