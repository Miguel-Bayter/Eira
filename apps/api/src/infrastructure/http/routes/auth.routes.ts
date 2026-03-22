import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateBody } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { csrfProtection } from '../middlewares/csrf.middleware';
import { authController } from '../../../container';
import { registerSchema, loginSchema } from '@eira/shared';

const router = Router();

// Strict rate limiting for auth routes (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Please try again in 15 minutes.' } },
});

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, csrfProtection, authController.logout);

export default router;
