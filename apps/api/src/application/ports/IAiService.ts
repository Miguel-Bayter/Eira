export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IAiService {
  chat(messages: AiMessage[], systemPrompt: string): Promise<string>;
  analyze(text: string, prompt: string): Promise<string>;
  moderate(text: string): Promise<{ isApproved: boolean; reason?: string }>;
}
