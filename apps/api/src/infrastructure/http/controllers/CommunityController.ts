import type { Request, Response, NextFunction } from 'express';
import type { CreateCommunityPostUseCase } from '@application/use-cases/community/CreateCommunityPost.usecase';
import type { GetCommunityFeedUseCase } from '@application/use-cases/community/GetCommunityFeed.usecase';

export class CommunityController {
  constructor(
    private readonly createPost: CreateCommunityPostUseCase,
    private readonly getFeed: GetCommunityFeedUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as { content: string };
      const result = await this.createPost.execute({
        userId: req.userId,
        content: body.content,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  feed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
      const rawLimit = Number(req.query.limit);
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 20;
      const result = await this.getFeed.execute({ cursor, limit });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
