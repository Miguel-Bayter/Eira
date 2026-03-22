import type { Request, Response, NextFunction } from 'express';
import { supabaseAuthProvider } from '@infrastructure/auth/SupabaseAuthProvider';
import { AUTH_COOKIE_NAME } from '../security/httpSecurity';

interface AuthenticatedUserProfile {
  id: string;
  email: string | null;
  name: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
      authUser?: AuthenticatedUserProfile;
      authTransport?: 'cookie' | 'authorization';
    }
  }
}

function readCookieToken(req: Request): string | null {
  const token = (req.cookies as Record<string, string> | undefined)?.[AUTH_COOKIE_NAME];
  return typeof token === 'string' && token.length > 0 ? token : null;
}

function readAuthorizationToken(req: Request): string | null {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  if (req.headers.origin) {
    return null;
  }

  return authorization.slice('Bearer '.length);
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const cookieToken = readCookieToken(req);
  const authorizationToken = cookieToken ? null : readAuthorizationToken(req);
  const token = cookieToken ?? authorizationToken;

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token required' } });
    return;
  }

  const user = await supabaseAuthProvider.getUserByAccessToken(token);
  if (!user) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
    return;
  }

  req.userId = user.supabaseId;
  req.authUser = {
    id: user.supabaseId,
    email: user.email ?? null,
    name: user.name,
  };
  req.authTransport = cookieToken ? 'cookie' : 'authorization';
  next();
}
