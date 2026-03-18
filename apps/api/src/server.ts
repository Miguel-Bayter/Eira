import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import authRoutes from './infrastructure/http/routes/auth.routes';
import moodRoutes from './infrastructure/http/routes/mood.routes';
import { journalRoutes } from './infrastructure/http/routes/journal.routes';
import { errorHandlerMiddleware } from './infrastructure/http/middlewares/errorHandler.middleware';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino(
  isDev
    ? { level: 'debug', transport: { target: 'pino-pretty', options: { colorize: true } } }
    : { level: 'info' },
);

export const app = express();

// ═══ SEGURIDAD — Headers HTTP ═══
app.use(helmet());
app.disable('x-powered-by');

// ═══ CORS ═══
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origen no permitido: ${origin}`));
      }
    },
    credentials: true,
  }),
);

// ═══ RATE LIMITING GLOBAL ═══
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Demasiadas solicitudes, intenta más tarde' } },
});
app.use(globalLimiter);

// ═══ PARSERS ═══
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ═══ HEALTH CHECK ═══
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eira-api', timestamp: new Date().toISOString() });
});

// ═══ RUTAS ═══
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/journal', journalRoutes);

// ═══ ERROR HANDLER GLOBAL ═══
app.use(errorHandlerMiddleware);

// Solo iniciar el servidor si se ejecuta directamente (no en tests)
if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT) || 3001;
  const server = app.listen(PORT, () => {
    logger.info(`🌿 Eira API corriendo en http://localhost:${PORT}`);
    logger.info(`   Health: http://localhost:${PORT}/api/health`);
  });
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Puerto ${PORT} ocupado. Ejecuta: taskkill /F /IM node.exe`);
      process.exit(1);
    }
    throw err;
  });
}
