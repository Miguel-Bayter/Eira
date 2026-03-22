import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { chatController } from '../../../container';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { sendChatMessageSchema } from '@eira/shared';

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'anon',
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many chat requests' } },
});

const dailyMessageLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? 'anon',
  message: { error: { code: 'DAILY_LIMIT_EXCEEDED', message: 'Daily limit of 50 chat messages reached' } },
});

router.use(authMiddleware);
router.use(chatLimiter);

router.get('/', chatController.getConversation);
router.post('/', dailyMessageLimiter, csrfProtection, validateBody(sendChatMessageSchema), chatController.sendMessage);

export { router as chatRoutes };
