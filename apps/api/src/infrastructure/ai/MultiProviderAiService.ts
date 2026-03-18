import type { IAiService, AiMessage } from '@application/ports/IAiService';

export class MultiProviderAiService implements IAiService {
  constructor(
    private readonly primary: IAiService,   // Groq (fast)
    private readonly fallback: IAiService,  // Gemini
  ) {}

  async chat(messages: AiMessage[], systemPrompt: string): Promise<string> {
    try {
      return await this.primary.chat(messages, systemPrompt);
    } catch {
      return this.fallback.chat(messages, systemPrompt);
    }
  }

  async analyze(text: string, prompt: string): Promise<string> {
    try {
      return await this.primary.analyze(text, prompt);
    } catch {
      return this.fallback.analyze(text, prompt);
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
