import type { Request, Response, NextFunction } from 'express';
import type { CreateMoodEntryUseCase } from '@application/use-cases/mood/CreateMoodEntry.usecase';
import type { GetMoodHistoryUseCase } from '@application/use-cases/mood/GetMoodHistory.usecase';

export class MoodController {
  constructor(
    private readonly createMoodEntry: CreateMoodEntryUseCase,
    private readonly getMoodHistory: GetMoodHistoryUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as { score: number; emotion: string; note?: string };
      const result = await this.createMoodEntry.execute({
        userId: req.userId,
        score: body.score,
        emotion: body.emotion,
        ...(body.note !== undefined && { note: body.note }),
      });

      // If crisis, return 200 with special flag
      const status = result.isCrisis ? 200 : 201;
      res.status(status).json(result);
    } catch (err) {
      next(err);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawLimit = Number(req.query.limit);
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 30;
      const result = await this.getMoodHistory.execute({
        userId: req.userId,
        limit,
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
