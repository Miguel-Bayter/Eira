import type { IAiService, AiMessage } from '@domain/services/IAiService';
import { AiServiceUnavailableError } from '@domain/errors';

export class MultiProviderAiService implements IAiService {
  constructor(
    private readonly primary: IAiService,   // Groq (fast)
    private readonly fallback: IAiService,  // Gemini
  ) {}

  async chat(messages: AiMessage[], systemPrompt: string): Promise<string> {
    try {
      return await this.primary.chat(messages, systemPrompt);
    } catch {
      try {
        return await this.fallback.chat(messages, systemPrompt);
      } catch {
        throw new AiServiceUnavailableError();
      }
    }
  }

  async analyze(text: string, prompt: string): Promise<string> {
    try {
      return await this.primary.analyze(text, prompt);
    } catch {
      try {
        return await this.fallback.analyze(text, prompt);
      } catch {
        throw new AiServiceUnavailableError();
      }
    }
  }

  async moderate(text: string): Promise<{ isApproved: boolean; reason?: string }> {
    try {
      return await this.primary.moderate(text);
    } catch {
      return this.fallback.moderate(text);
    }
  }
}
