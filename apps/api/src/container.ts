// container.ts — Composition Root
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './infrastructure/db/PrismaUserRepository';
import { PrismaMoodRepository } from './infrastructure/db/PrismaMoodRepository';
import { PrismaJournalRepository } from './infrastructure/db/PrismaJournalRepository';
import { ResendEmailService } from './infrastructure/email/ResendEmailService';
import { GeminiAiAdapter } from './infrastructure/ai/GeminiAiAdapter';
import { GroqAiAdapter } from './infrastructure/ai/GroqAiAdapter';
import { MultiProviderAiService } from './infrastructure/ai/MultiProviderAiService';
import { RegisterUserUseCase } from './application/use-cases/auth/RegisterUser.usecase';
import { GetOrCreateUserUseCase } from './application/use-cases/auth/GetOrCreateUser.usecase';
import { CreateMoodEntryUseCase } from './application/use-cases/mood/CreateMoodEntry.usecase';
import { GetMoodHistoryUseCase } from './application/use-cases/mood/GetMoodHistory.usecase';
import { CreateJournalEntryUseCase } from './application/use-cases/journal/CreateJournalEntry.usecase';
import { AnalyzeJournalEntryUseCase } from './application/use-cases/journal/AnalyzeJournalEntry.usecase';
import { GetJournalHistoryUseCase } from './application/use-cases/journal/GetJournalHistory.usecase';
import { AuthController } from './infrastructure/http/controllers/AuthController';
import { MoodController } from './infrastructure/http/controllers/MoodController';
import { JournalController } from './infrastructure/http/controllers/JournalController';

const prisma = new PrismaClient();

// Repositories
const userRepository = new PrismaUserRepository(prisma);
const moodRepository = new PrismaMoodRepository(prisma);
const journalRepository = new PrismaJournalRepository(prisma);

// Services
const emailService = new ResendEmailService(process.env.RESEND_API_KEY ?? 're_placeholder');
const geminiAdapter = new GeminiAiAdapter(process.env.GEMINI_API_KEY ?? '');
const groqAdapter = new GroqAiAdapter(process.env.GROQ_API_KEY ?? '');
const aiService = new MultiProviderAiService(groqAdapter, geminiAdapter);

// Use Cases — Auth
const registerUserUseCase = new RegisterUserUseCase(userRepository, emailService);
const getOrCreateUserUseCase = new GetOrCreateUserUseCase(userRepository);

// Use Cases — Mood
const createMoodEntryUseCase = new CreateMoodEntryUseCase(moodRepository, userRepository);
const getMoodHistoryUseCase = new GetMoodHistoryUseCase(moodRepository, userRepository);

// Use Cases — Journal
const createJournalEntryUseCase = new CreateJournalEntryUseCase(journalRepository, userRepository);
const analyzeJournalEntryUseCase = new AnalyzeJournalEntryUseCase(journalRepository, userRepository, aiService);
const getJournalHistoryUseCase = new GetJournalHistoryUseCase(journalRepository, userRepository);

// Controllers
const authController = new AuthController(registerUserUseCase, getOrCreateUserUseCase);
const moodController = new MoodController(createMoodEntryUseCase, getMoodHistoryUseCase);
const journalController = new JournalController(
  createJournalEntryUseCase,
  analyzeJournalEntryUseCase,
  getJournalHistoryUseCase,
);

export const authContainer = { authController };
export const moodContainer = { moodController };
export const journalContainer = { journalController };
