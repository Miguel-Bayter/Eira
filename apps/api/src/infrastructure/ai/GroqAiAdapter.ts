import Groq from 'groq-sdk';
import type { IAiService, AiMessage } from '@domain/services/IAiService';

export class GroqAiAdapter implements IAiService {
  private groq: Groq;

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  async chat(messages: AiMessage[], systemPrompt: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async analyze(text: string, prompt: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async moderate(text: string): Promise<{ isApproved: boolean; reason?: string }> {
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a content moderator for a mental wellness app.
Analyze if the text is appropriate for an emotional support community.
Respond ONLY with JSON: {"isApproved": true/false, "reason": "reason if rejected"}`,
        },
        { role: 'user', content: text },
      ],
    });
    const responseText = (response.choices[0]?.message?.content ?? '{}').trim();
    return this.parseModerationResponse(responseText);
  }

  private parseModerationResponse(text: string): { isApproved: boolean; reason?: string } {
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned) as unknown;
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'isApproved' in parsed &&
        typeof (parsed as Record<string, unknown>).isApproved === 'boolean'
      ) {
        const reason = typeof (parsed as Record<string, unknown>).reason === 'string'
          ? String((parsed as Record<string, unknown>).reason)
          : undefined;
        const result: { isApproved: boolean; reason?: string } = {
          isApproved: (parsed as Record<string, unknown>).isApproved as boolean,
        };
        if (reason !== undefined) result.reason = reason;
        return result;
      }
      return { isApproved: false, reason: 'Invalid AI response format' };
    } catch {
      return { isApproved: false, reason: 'Failed to parse AI response' };
    }
  }
}
