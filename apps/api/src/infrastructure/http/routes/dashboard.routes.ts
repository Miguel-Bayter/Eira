import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middlewares/auth.middleware';
import { dashboardController } from '../../../container';

const router = Router();

const dashboardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'anon',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
});

router.use(authMiddleware);
router.use(dashboardLimiter);

router.get('/', dashboardController.getStats);

export { router as dashboardRoutes };
