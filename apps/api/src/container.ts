// container.ts — Composition Root
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './infrastructure/db/PrismaUserRepository';
import { PrismaMoodRepository } from './infrastructure/db/PrismaMoodRepository';
import { ResendEmailService } from './infrastructure/email/ResendEmailService';
import { RegisterUserUseCase } from './application/use-cases/auth/RegisterUser.usecase';
import { GetOrCreateUserUseCase } from './application/use-cases/auth/GetOrCreateUser.usecase';
import { CreateMoodEntryUseCase } from './application/use-cases/mood/CreateMoodEntry.usecase';
import { GetMoodHistoryUseCase } from './application/use-cases/mood/GetMoodHistory.usecase';
import { AuthController } from './infrastructure/http/controllers/AuthController';
import { MoodController } from './infrastructure/http/controllers/MoodController';

const prisma = new PrismaClient();

// Repositories
const userRepository = new PrismaUserRepository(prisma);
const moodRepository = new PrismaMoodRepository(prisma);

// Services
const emailService = new ResendEmailService(process.env.RESEND_API_KEY ?? 're_placeholder');

// Use Cases — Auth
const registerUserUseCase = new RegisterUserUseCase(userRepository, emailService);
const getOrCreateUserUseCase = new GetOrCreateUserUseCase(userRepository);

// Use Cases — Mood
const createMoodEntryUseCase = new CreateMoodEntryUseCase(moodRepository, userRepository);
const getMoodHistoryUseCase = new GetMoodHistoryUseCase(moodRepository);

// Controllers
const authController = new AuthController(registerUserUseCase, getOrCreateUserUseCase);
const moodController = new MoodController(createMoodEntryUseCase, getMoodHistoryUseCase);

export const authContainer = { authController };
export const moodContainer = { moodController };
