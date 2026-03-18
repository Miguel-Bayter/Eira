import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import type { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUser.usecase';
import type { GetOrCreateUserUseCase } from '@application/use-cases/auth/GetOrCreateUser.usecase';

const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_ANON_KEY ?? '',
);

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly getOrCreateUser: GetOrCreateUserUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body as { name: string; email: string; password: string };

      // 1. Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error !== null || data.user === null) {
        res.status(400).json({
          error: { code: 'SUPABASE_ERROR', message: error?.message ?? 'Error al registrar' },
        });
        return;
      }

      // 2. Crear usuario en nuestra DB
      const user = await this.registerUser.execute({
        name,
        email,
        supabaseId: data.user.id,
      });

      res.status(201).json({
        user: { id: user.id, email: user.email, name: user.name, wellnessScore: user.wellnessScore },
        token: data.session?.access_token ?? '',
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error !== null || data.user === null || data.session === null) {
        // SEGURIDAD: mismo mensaje para email inexistente y password incorrecta
        res.status(401).json({
          error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' },
        });
        return;
      }

      // Obtener o crear usuario en nuestra DB
      const user = await this.getOrCreateUser.execute({
        supabaseId: data.user.id,
        email: data.user.email ?? email,
        name: (data.user.user_metadata as { name?: string } | null)?.name ?? 'Usuario',
      });

      res.status(200).json({
        user: { id: user.id, email: user.email, name: user.name, wellnessScore: user.wellnessScore },
        token: data.session.access_token,
      });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.userId viene del authMiddleware
      const supabaseId = req.userId;

      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      // Buscar por supabaseId
      res.status(200).json({ userId: supabaseId, supabaseUser });
    } catch (err) {
      next(err);
    }
  };
}
