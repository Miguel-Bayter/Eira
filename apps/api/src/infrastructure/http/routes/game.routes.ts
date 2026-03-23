import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { gameController } from '../../../container';

const router = Router();

const gameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'anon',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
});

const recordGameSessionSchema = z.object({
  gameType: z.enum(['breathing', 'bubble_pop', 'zen_garden', 'coloring']),
  durationSeconds: z.number().int().min(1).max(3600),
});

router.use(authMiddleware);
router.use(gameLimiter);

router.post(
  '/complete',
  csrfProtection,
  validateBody(recordGameSessionSchema),
  gameController.complete,
);

export { router as gameRoutes };
