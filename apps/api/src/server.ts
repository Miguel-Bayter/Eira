import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './infrastructure/http/routes/auth.routes';
import moodRoutes from './infrastructure/http/routes/mood.routes';
import { journalRoutes } from './infrastructure/http/routes/journal.routes';
import { chatRoutes } from './infrastructure/http/routes/chat.routes';
import { dashboardRoutes } from './infrastructure/http/routes/dashboard.routes';
import { communityRoutes } from './infrastructure/http/routes/community.routes';
import { gameRoutes } from './infrastructure/http/routes/game.routes';
import { errorHandlerMiddleware } from './infrastructure/http/middlewares/errorHandler.middleware';
import { logger } from './infrastructure/logging/logger';
import { allowedOrigins } from './infrastructure/http/security/httpSecurity';

export const app = express();

// Trust proxy (required for rate-limiting and IP detection behind reverse proxy)
app.set('trust proxy', 1);

// Security — HTTP headers with explicit CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'https://generativelanguage.googleapis.com',
          'https://api.groq.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://rsms.me'],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
app.disable('x-powered-by');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin not allowed: ${origin}`));
      }
    },
    credentials: true,
  }),
);

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' },
  },
});
app.use(globalLimiter);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser — required for httpOnly cookie auth
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eira-api', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/games', gameRoutes);

// Global error handler
app.use(errorHandlerMiddleware);

// Only start the server when running directly (not in tests)
if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT) || 3001;
  const server = app.listen(PORT, () => {
    logger.info(`🌿 Eira API running at http://localhost:${PORT}`);
    logger.info(`   Health: http://localhost:${PORT}/api/health`);
  });
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} in use. Run: taskkill /F /IM node.exe`);
      process.exit(1);
    }
    throw err;
  });
}
