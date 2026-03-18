import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAiService, AiMessage } from '@application/ports/IAiService';

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
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(`${prompt}\n\nTexto a analizar:\n${text}`);
    return result.response.text();
  }

  async moderate(text: string): Promise<{ isApproved: boolean; reason?: string }> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const promptText = `Eres un moderador de contenido para una app de bienestar mental.
Analiza si este texto es apropiado para una comunidad de apoyo emocional.
Responde SOLO con JSON: {"isApproved": true/false, "reason": "motivo si fue rechazado"}

Texto: ${text}`;
    const result = await model.generateContent(promptText);
    const responseText = result.response.text().trim();
    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as { isApproved: boolean; reason?: string };
  }
}
