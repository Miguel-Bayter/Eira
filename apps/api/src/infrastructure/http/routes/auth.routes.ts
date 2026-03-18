import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateBody } from '../middlewares/validation.middleware';
import { authContainer } from '../../../container';
import { z } from 'zod';

const router = Router();

// Rate limiting estricto para auth (previene brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máx 10 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Demasiados intentos. Intenta en 15 minutos.' } },
});

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[0-9]/, 'Debe contener número'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', authLimiter, validateBody(registerSchema), authContainer.authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authContainer.authController.login);

export default router;
