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
    } catch (primaryErr) {
      console.error('[AI] Primary (Groq) chat failed:', primaryErr);
      try {
        return await this.fallback.chat(messages, systemPrompt);
      } catch (fallbackErr) {
        console.error('[AI] Fallback (Gemini) chat failed:', fallbackErr);
        throw new AiServiceUnavailableError();
      }
    }
  }

  async analyze(text: string, prompt: string): Promise<string> {
    try {
      return await this.primary.analyze(text, prompt);
    } catch (primaryErr) {
      console.error('[AI] Primary (Groq) analyze failed:', primaryErr);
      try {
        return await this.fallback.analyze(text, prompt);
      } catch (fallbackErr) {
        console.error('[AI] Fallback (Gemini) analyze failed:', fallbackErr);
        throw new AiServiceUnavailableError();
      }
    }
  }

  async moderate(text: string): Promise<{ isApproved: boolean; reason?: string }> {
    try {
      return await this.primary.moderate(text);
    } catch (primaryErr) {
      console.error('[AI] Primary (Groq) moderate failed:', primaryErr);
      return this.fallback.moderate(text);
    }
  }
}

