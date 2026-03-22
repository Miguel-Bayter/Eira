import type { Request, Response, NextFunction } from 'express';
import type { CreateJournalEntryUseCase } from '@application/use-cases/journal/CreateJournalEntry.usecase';
import type { AnalyzeJournalEntryUseCase } from '@application/use-cases/journal/AnalyzeJournalEntry.usecase';
import type { GetJournalHistoryUseCase } from '@application/use-cases/journal/GetJournalHistory.usecase';

/** Extract the primary BCP-47 language tag from an Accept-Language header value. */
function parseAcceptLanguage(header: string | undefined): string | undefined {
  if (!header) return undefined;
  // Accept-Language: es-CO,es;q=0.9,en;q=0.8  → 'es'
  const primary = header.split(',')[0]?.split(';')[0]?.trim();
  return primary ?? undefined;
}

export class JournalController {
  constructor(
    private readonly createJournalEntryUseCase: CreateJournalEntryUseCase,
    private readonly analyzeJournalEntryUseCase: AnalyzeJournalEntryUseCase,
    private readonly getJournalHistoryUseCase: GetJournalHistoryUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createJournalEntryUseCase.execute({
        userId: req.userId,
        content: req.body.content as string,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  analyze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const language = parseAcceptLanguage(req.headers['accept-language']);
      const result = await this.analyzeJournalEntryUseCase.execute({
        userId: req.userId,
        entryId: req.params.id!,
        ...(language !== undefined && { language }),
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getJournalHistoryUseCase.execute({
        userId: req.userId,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
