// container.ts — Composition Root
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './infrastructure/db/PrismaUserRepository';
import { PrismaMoodRepository } from './infrastructure/db/PrismaMoodRepository';
import { PrismaJournalRepository } from './infrastructure/db/PrismaJournalRepository';
import { PrismaChatRepository } from './infrastructure/db/PrismaChatRepository';
import { ResendEmailService } from './infrastructure/email/ResendEmailService';
import { GeminiAiAdapter } from './infrastructure/ai/GeminiAiAdapter';
import { GroqAiAdapter } from './infrastructure/ai/GroqAiAdapter';
import { MultiProviderAiService } from './infrastructure/ai/MultiProviderAiService';
import { supabaseAuthProvider } from './infrastructure/auth/SupabaseAuthProvider';
import { RegisterUserUseCase } from './application/use-cases/auth/RegisterUser.usecase';
import { LoginUserUseCase } from './application/use-cases/auth/LoginUser.usecase';
import { GetOrCreateUserUseCase } from './application/use-cases/auth/GetOrCreateUser.usecase';
import { CreateMoodEntryUseCase } from './application/use-cases/mood/CreateMoodEntry.usecase';
import { GetMoodHistoryUseCase } from './application/use-cases/mood/GetMoodHistory.usecase';
import { CreateJournalEntryUseCase } from './application/use-cases/journal/CreateJournalEntry.usecase';
import { AnalyzeJournalEntryUseCase } from './application/use-cases/journal/AnalyzeJournalEntry.usecase';
import { GetJournalHistoryUseCase } from './application/use-cases/journal/GetJournalHistory.usecase';
import { GetChatConversationUseCase } from './application/use-cases/chat/GetChatConversation.usecase';
import { SendChatMessageUseCase } from './application/use-cases/chat/SendChatMessage.usecase';
import { AuthController } from './infrastructure/http/controllers/AuthController';
import { MoodController } from './infrastructure/http/controllers/MoodController';
import { JournalController } from './infrastructure/http/controllers/JournalController';
import { ChatController } from './infrastructure/http/controllers/ChatController';

// Fail fast at startup if required environment variables are missing
// In test environments, fall back to empty string so mocked services can be instantiated
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === 'test') return '';
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const prisma = new PrismaClient();

// Repositories
const userRepository = new PrismaUserRepository(prisma);
const moodRepository = new PrismaMoodRepository(prisma);
const journalRepository = new PrismaJournalRepository(prisma);
const chatRepository = new PrismaChatRepository(prisma);

// Services
const emailService = new ResendEmailService(process.env.RESEND_API_KEY ?? 're_placeholder');
const geminiAdapter = new GeminiAiAdapter(requireEnv('GEMINI_API_KEY'));
const groqAdapter = new GroqAiAdapter(requireEnv('GROQ_API_KEY'));
const aiService = new MultiProviderAiService(groqAdapter, geminiAdapter);

// Use Cases — Auth
const registerUserUseCase = new RegisterUserUseCase(userRepository, emailService, supabaseAuthProvider);
const getOrCreateUserUseCase = new GetOrCreateUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository, supabaseAuthProvider);

// Use Cases — Mood
const createMoodEntryUseCase = new CreateMoodEntryUseCase(moodRepository, userRepository);
const getMoodHistoryUseCase = new GetMoodHistoryUseCase(moodRepository, userRepository);

// Use Cases — Journal
const createJournalEntryUseCase = new CreateJournalEntryUseCase(journalRepository, userRepository);
const analyzeJournalEntryUseCase = new AnalyzeJournalEntryUseCase(journalRepository, userRepository, aiService);
const getJournalHistoryUseCase = new GetJournalHistoryUseCase(journalRepository, userRepository);

// Use Cases — Chat
const getChatConversationUseCase = new GetChatConversationUseCase(chatRepository, userRepository);
const sendChatMessageUseCase = new SendChatMessageUseCase(chatRepository, userRepository, aiService);

// Controllers
const authController = new AuthController(registerUserUseCase, loginUserUseCase, getOrCreateUserUseCase);
const moodController = new MoodController(createMoodEntryUseCase, getMoodHistoryUseCase);
const journalController = new JournalController(
  createJournalEntryUseCase,
  analyzeJournalEntryUseCase,
  getJournalHistoryUseCase,
);
const chatController = new ChatController(getOrCreateUserUseCase, getChatConversationUseCase, sendChatMessageUseCase);

export { authController, moodController, journalController, chatController };
