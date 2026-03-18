import type { IJournalRepository } from '@domain/repositories/IJournalRepository';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IAiService } from '@application/ports/IAiService';
import { UserNotFoundError, JournalNotFoundError, DailyLimitExceededError } from '@domain/errors';

export interface AnalyzeJournalEntryInput {
  userId: string; // Supabase Auth UUID
  entryId: string;
}

export interface AnalyzeJournalEntryOutput {
  id: string;
  aiAnalysis: string;
  updatedAt: string;
}

const JOURNAL_ANALYSIS_PROMPT = `Eres Eira, una figura cálida y maternal que acompaña a las personas en su bienestar emocional.
Hablas como alguien que genuinamente se preocupa, con ternura, paciencia y sin juzgar — como una mamá sabia que escucha con el corazón.

Lee la siguiente entrada de diario y ofrece 2 o 3 consejos prácticos que la persona pueda aplicar hoy o esta semana.
Los consejos deben nacer directamente de lo que escribió — nada genérico.

Empieza con una frase corta de validación o reconocimiento hacia lo que siente (sin nombrar diagnósticos).
Luego da los consejos con viñetas (•), en tono suave y alentador.
Cierra con una frase breve de ánimo, como lo haría alguien que cree en esa persona.

No diagnostiques. No uses lenguaje clínico. No menciones que eres una IA.
Recuerda que no reemplazas a un profesional de salud mental — si es necesario mencionarlo, hazlo con delicadeza.
Responde en español.`;

export class AnalyzeJournalEntryUseCase {
  constructor(
    private readonly journalRepo: IJournalRepository,
    private readonly userRepo: IUserRepository,
    private readonly aiService: IAiService,
  ) {}

  async execute(input: AnalyzeJournalEntryInput): Promise<AnalyzeJournalEntryOutput> {
    const user = await this.userRepo.findBySupabaseId(input.userId);
    if (!user) throw new UserNotFoundError(input.userId);

    const entry = await this.journalRepo.findById(input.entryId);
    if (!entry) throw new JournalNotFoundError(input.entryId);

    // Verify the entry belongs to this user
    if (entry.userId !== user.id) throw new JournalNotFoundError(input.entryId);

    // Rate limit: max 10 AI analyses per day
    const todayCount = await this.journalRepo.countTodayAnalysesByUser(user.id);
    if (todayCount >= 10) throw new DailyLimitExceededError('análisis IA', 10);

    const analysis = await this.aiService.analyze(entry.content, JOURNAL_ANALYSIS_PROMPT);
    entry.setAiAnalysis(analysis);
    await this.journalRepo.save(entry);

    return {
      id: entry.id,
      aiAnalysis: analysis,
      updatedAt: entry.updatedAt.toISOString(),
    };
  }
}
