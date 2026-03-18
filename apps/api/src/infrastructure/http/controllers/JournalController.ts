import type { Request, Response, NextFunction } from 'express';
import type { CreateJournalEntryUseCase } from '@application/use-cases/journal/CreateJournalEntry.usecase';
import type { AnalyzeJournalEntryUseCase } from '@application/use-cases/journal/AnalyzeJournalEntry.usecase';
import type { GetJournalHistoryUseCase } from '@application/use-cases/journal/GetJournalHistory.usecase';

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
      const result = await this.analyzeJournalEntryUseCase.execute({
        userId: req.userId,
        entryId: req.params.id!,
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
