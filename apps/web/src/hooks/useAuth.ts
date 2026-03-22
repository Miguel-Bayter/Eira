import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { API_URL, createJsonHeaders } from '../lib/api';

interface AuthResponse {
  user: { id: string; email: string; name: string; wellnessScore: number; streakDays?: number };
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

async function registerRequest(data: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: createJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? 'Registration error');
  }
  return res.json() as Promise<AuthResponse>;
}

async function loginRequest(data: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: createJsonHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? 'Invalid credentials');
  }
  return res.json() as Promise<AuthResponse>;
}

async function sessionRequest(): Promise<AuthResponse['user'] | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: 'include',
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Failed to bootstrap session');
  }

  const body = await res.json() as AuthResponse;
  return body.user;
}

async function logoutRequest(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: createJsonHeaders({ includeCsrf: true }),
  });
}

export function useAuthSessionBootstrap() {
  const setUser = useAuthStore((state) => state.setUser);
  const setAnonymous = useAuthStore((state) => state.setAnonymous);

  const query = useQuery({
    queryKey: ['auth-session'],
    queryFn: sessionRequest,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.isSuccess) {
      if (query.data) {
        setUser({
          id: query.data.id,
          email: query.data.email,
          name: query.data.name,
          wellnessScore: query.data.wellnessScore,
          streakDays: query.data.streakDays ?? 0,
        });
        return;
      }

      setAnonymous();
    }

    if (query.isError) {
      setAnonymous();
    }
  }, [query.data, query.isError, query.isSuccess, setAnonymous, setUser]);

  return query;
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        wellnessScore: data.user.wellnessScore,
        streakDays: data.user.streakDays ?? 0, // from API, not hardcoded
      });
    },
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        wellnessScore: data.user.wellnessScore,
        streakDays: data.user.streakDays ?? 0, // from API, not hardcoded
      });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      logout();
    },
  });
}
