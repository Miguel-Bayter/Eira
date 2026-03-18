import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface AuthResponse {
  user: { id: string; email: string; name: string; wellnessScore: number };
  token: string;
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? 'Error al registrarse');
  }
  return res.json() as Promise<AuthResponse>;
}

async function loginRequest(data: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? 'Credenciales inválidas');
  }
  return res.json() as Promise<AuthResponse>;
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      setUser(
        { id: data.user.id, email: data.user.email, name: data.user.name, wellnessScore: data.user.wellnessScore, streakDays: 0 },
        data.token,
      );
    },
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setUser(
        { id: data.user.id, email: data.user.email, name: data.user.name, wellnessScore: data.user.wellnessScore, streakDays: 0 },
        data.token,
      );
    },
  });
}
