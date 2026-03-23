import type { Request, Response, NextFunction } from 'express';
import type { RecordGameSessionUseCase } from '@application/use-cases/games/RecordGameSession.usecase';
import type { GameType } from '@domain/entities/GameSession';

export class GameController {
  constructor(private readonly recordSession: RecordGameSessionUseCase) {}

  complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as { gameType: GameType; durationSeconds: number };
      const result = await this.recordSession.execute({
        userId: req.userId,
        gameType: body.gameType,
        durationSeconds: body.durationSeconds,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}
