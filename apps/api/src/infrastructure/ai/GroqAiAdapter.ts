import Groq from 'groq-sdk';
import type { IAiService, AiMessage } from '@application/ports/IAiService';

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
        { role: 'user', content: `Texto a analizar:\n${text}` },
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
          content: `Eres un moderador de contenido para una app de bienestar mental.
Analiza si el texto es apropiado para una comunidad de apoyo emocional.
Responde SOLO con JSON: {"isApproved": true/false, "reason": "motivo si fue rechazado"}`,
        },
        { role: 'user', content: text },
      ],
    });
    const responseText = (response.choices[0]?.message?.content ?? '{}').trim();
    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as { isApproved: boolean; reason?: string };
  }
}
