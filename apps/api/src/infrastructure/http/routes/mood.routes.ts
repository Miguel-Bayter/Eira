import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { moodContainer } from '../../../container';

const router = Router();

// Rate limit por IP para endpoints de mood (100 req/15 min)
const moodLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Demasiadas solicitudes' } },
});

const createMoodSchema = z.object({
  score: z.number().int().min(1).max(10),
  emotion: z.enum([
    'alegre', 'tranquilo', 'agradecido', 'esperanzador', 'motivado',
    'ansioso', 'triste', 'enojado', 'frustrado', 'cansado',
    'confundido', 'solitario', 'abrumado', 'asustado', 'neutral',
  ]),
  note: z.string().max(500).optional(),
});

router.use(authMiddleware);
router.use(moodLimiter);

router.post('/', validateBody(createMoodSchema), moodContainer.moodController.create);
router.get('/', moodContainer.moodController.getHistory);

export default router;
