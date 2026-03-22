import type { Request, Response, NextFunction } from 'express';
import type { GetOrCreateUserUseCase } from '@application/use-cases/auth/GetOrCreateUser.usecase';
import type { GetChatConversationUseCase } from '@application/use-cases/chat/GetChatConversation.usecase';
import type { SendChatMessageUseCase } from '@application/use-cases/chat/SendChatMessage.usecase';

function parseAcceptLanguage(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const primary = header.split(',')[0]?.split(';')[0]?.trim();
  return primary ?? undefined;
}

export class ChatController {
  constructor(
    private readonly getOrCreateUserUseCase: GetOrCreateUserUseCase,
    private readonly getChatConversationUseCase: GetChatConversationUseCase,
    private readonly sendChatMessageUseCase: SendChatMessageUseCase,
  ) {}

  private ensureLocalUser = async (req: Request): Promise<void> => {
    const email = req.authUser?.email;
    if (!email) return;

    const fallbackName = email.split('@')[0] ?? 'Eira User';
    const name = req.authUser?.name ?? fallbackName;

    await this.getOrCreateUserUseCase.execute({
      supabaseId: req.userId,
      email,
      name,
    });
  };

  getConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.ensureLocalUser(req);

      const result = await this.getChatConversationUseCase.execute({
        userId: req.userId,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.ensureLocalUser(req);

      const language = parseAcceptLanguage(req.headers['accept-language']);
      const result = await this.sendChatMessageUseCase.execute({
        userId: req.userId,
        message: (req.body as { message: string }).message,
        ...(language !== undefined && { language }),
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
