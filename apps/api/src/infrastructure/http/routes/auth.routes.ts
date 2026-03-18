import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateBody } from '../middlewares/validation.middleware';
import { authContainer } from '../../../container';
import { z } from 'zod';

const router = Router();

// Strict rate limiting for auth routes (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Please try again in 15 minutes.' } },
});

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', authLimiter, validateBody(registerSchema), authContainer.authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authContainer.authController.login);

export default router;
