import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAiService, AiMessage } from '@domain/services/IAiService';

export class GeminiAiAdapter implements IAiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async chat(messages: AiMessage[], systemPrompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage?.content ?? '');
    return result.response.text();
  }

  async analyze(text: string, prompt: string): Promise<string> {
    // Use systemInstruction to separate prompt from user content (prevents prompt injection)
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: prompt,
    });
    const result = await model.generateContent(text);
    return result.response.text();
  }

  async moderate(text: string): Promise<{ isApproved: boolean; reason?: string }> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `You are a content moderator for a mental wellness app.
Analyze if the text is appropriate for an emotional support community.
Respond ONLY with JSON: {"isApproved": true/false, "reason": "reason if rejected"}`,
    });
    const result = await model.generateContent(text);
    const responseText = result.response.text().trim();
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
