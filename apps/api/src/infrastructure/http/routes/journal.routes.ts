import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { journalController } from '../../../container';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { createJournalEntrySchema } from '@eira/shared';

const router = Router();

// Rate limiter for AI analysis: max 10 per day per user
const aiAnalysisLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'anon',
  message: { error: { code: 'DAILY_LIMIT_EXCEEDED', message: 'Límite de 10 análisis IA por día alcanzado' } },
});

// General journal rate limiter
const journalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'anon',
});

router.use(authMiddleware);

router.post(
  '/',
  journalLimiter,
  csrfProtection,
  validateBody(createJournalEntrySchema),
  journalController.create,
);

router.get(
  '/',
  journalLimiter,
  journalController.list,
);

router.post(
  '/:id/analyze',
  aiAnalysisLimiter,
  csrfProtection,
  journalController.analyze,
);

export { router as journalRoutes };
