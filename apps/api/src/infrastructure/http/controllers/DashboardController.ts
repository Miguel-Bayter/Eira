import type { Request, Response, NextFunction } from 'express';
import type { GetDashboardStatsUseCase } from '@application/use-cases/dashboard/GetDashboardStats.usecase';

export class DashboardController {
  constructor(private readonly getDashboardStats: GetDashboardStatsUseCase) {}

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.getDashboardStats.execute(req.userId);
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  };
}
