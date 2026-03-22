import type { Request, Response, NextFunction } from 'express';
import type { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUser.usecase';
import type { LoginUserUseCase } from '@application/use-cases/auth/LoginUser.usecase';
import type { GetOrCreateUserUseCase } from '@application/use-cases/auth/GetOrCreateUser.usecase';
import { authCookieOptions, AUTH_COOKIE_NAME } from '../security/httpSecurity';

interface SafeUserDto {
  id: string;
  email: string;
  name: string;
  wellnessScore: number;
  streakDays: number;
}

function toSafeUserDto(user: SafeUserDto): SafeUserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    wellnessScore: user.wellnessScore,
    streakDays: user.streakDays ?? 0,
  };
}

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly getOrCreateUser: GetOrCreateUserUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body as { name: string; email: string; password: string };
      const user = await this.registerUser.execute({
        name,
        email,
        password,
      });

      if (user.accessToken) {
        res.cookie(AUTH_COOKIE_NAME, user.accessToken, authCookieOptions);
      }

      res.status(201).json({
        user: toSafeUserDto(user.user),
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await this.loginUser.execute({ email, password });

      res.cookie(AUTH_COOKIE_NAME, result.token, authCookieOptions);

      res.status(200).json({
        user: toSafeUserDto(result.user),
      });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authUser = req.authUser;
      if (!authUser?.email) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
        return;
      }

      const fallbackName = authUser.email.split('@')[0] ?? 'Eira User';
      const user = await this.getOrCreateUser.execute({
        supabaseId: req.userId,
        email: authUser.email,
        name: authUser.name ?? fallbackName,
      });

      res.status(200).json({ user: toSafeUserDto(user) });
    } catch (err) {
      next(err);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: authCookieOptions.httpOnly,
      secure: authCookieOptions.secure,
      sameSite: authCookieOptions.sameSite,
      path: authCookieOptions.path,
    });
    res.status(200).json({ success: true });
  };
}
