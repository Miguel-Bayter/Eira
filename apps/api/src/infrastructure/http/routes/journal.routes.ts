import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { journalContainer } from '../../../container';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';

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

const createSchema = z.object({
  content: z.string().min(1, 'El contenido no puede estar vacío').max(5000, 'Máximo 5000 caracteres'),
});

router.use(authMiddleware);

router.post(
  '/',
  journalLimiter,
  validateBody(createSchema),
  journalContainer.journalController.create,
);

router.get(
  '/',
  journalLimiter,
  journalContainer.journalController.list,
);

router.post(
  '/:id/analyze',
  aiAnalysisLimiter,
  journalContainer.journalController.analyze,
);

export { router as journalRoutes };
