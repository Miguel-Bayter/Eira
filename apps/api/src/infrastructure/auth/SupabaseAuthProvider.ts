import type { AuthError, User } from '@supabase/supabase-js';
import type {
  AuthenticatedIdentity,
  IAuthProvider,
  LoginWithPasswordInput,
  LoginWithPasswordResult,
  RegisterWithPasswordInput,
  RegisterWithPasswordResult,
} from '@domain/services/IAuthProvider';
import {
  AuthProviderUnavailableError,
  InvalidCredentialsError,
  RegistrationFailedError,
} from '@domain/errors';
import { supabase } from '../supabase/supabaseClient';

function extractDisplayName(metadata: unknown): string | null {
  if (typeof metadata !== 'object' || metadata === null) {
    return null;
  }

  const record = metadata as Record<string, unknown>;
  const candidate = record.name ?? record.full_name ?? record.display_name ?? record.preferred_name;
  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate.trim()
    : null;
}

function toIdentity(user: User): AuthenticatedIdentity | null {
  if (!user.email) {
    return null;
  }

  return {
    supabaseId: user.id,
    email: user.email,
    name: extractDisplayName(user.user_metadata),
  };
}

function getStatus(error: AuthError | null): number | null {
  const status = (error as (AuthError & { status?: unknown }) | null)?.status;
  return typeof status === 'number' ? status : null;
}

function isProviderUnavailable(error: AuthError | null): boolean {
  if (!error) {
    return false;
  }

  const status = getStatus(error);
  if (status !== null && status >= 500) {
    return true;
  }

  const message = error.message.toLowerCase();
  return message.includes('network')
    || message.includes('fetch')
    || message.includes('timeout')
    || message.includes('timed out')
    || message.includes('unavailable');
}

export class SupabaseAuthProvider implements IAuthProvider {
  async register(input: RegisterWithPasswordInput): Promise<RegisterWithPasswordResult> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (isProviderUnavailable(error)) {
      throw new AuthProviderUnavailableError();
    }

    const identity = data.user ? toIdentity(data.user) : null;
    if (error || !identity) {
      throw new RegistrationFailedError();
    }

    return {
      ...identity,
      accessToken: data.session?.access_token ?? null,
    };
  }

  async login(input: LoginWithPasswordInput): Promise<LoginWithPasswordResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (isProviderUnavailable(error)) {
      throw new AuthProviderUnavailableError();
    }

    const identity = data.user ? toIdentity(data.user) : null;
    if (error || !identity || !data.session?.access_token) {
      throw new InvalidCredentialsError();
    }

    return {
      ...identity,
      accessToken: data.session.access_token,
    };
  }

  async getUserByAccessToken(token: string): Promise<AuthenticatedIdentity | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (isProviderUnavailable(error)) {
      throw new AuthProviderUnavailableError();
    }

    if (error || !user) {
      return null;
    }

    return toIdentity(user);
  }
}

export const supabaseAuthProvider = new SupabaseAuthProvider();
