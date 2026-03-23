import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { communityController } from '../../../container';
import { createCommunityPostSchema } from '@eira/shared';

const router = Router();

const communityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'anon',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
});

router.use(authMiddleware);
router.use(communityLimiter);

router.post(
  '/',
  csrfProtection,
  validateBody(createCommunityPostSchema),
  communityController.create,
);
router.get('/', communityController.feed);

export { router as communityRoutes };
