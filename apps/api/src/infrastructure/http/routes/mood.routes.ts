import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { moodController } from '../../../container';
import { createMoodSchema } from '@eira/shared';

const router = Router();

// Rate limit por userId (no por IP) — 10 req/15 min por usuario autenticado
const moodLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'anon',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Demasiadas solicitudes' } },
});

router.use(authMiddleware);
router.use(moodLimiter);

router.post('/', csrfProtection, validateBody(createMoodSchema), moodController.create);
router.get('/', moodController.getHistory);

export default router;
