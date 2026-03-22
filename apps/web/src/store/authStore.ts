import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  wellnessScore: number;
  streakDays: number;
}

type AuthStatus = 'bootstrapping' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setAnonymous: () => void;
  logout: () => void;
}

if (typeof window !== 'undefined') {
  window.localStorage.removeItem('eira-auth');
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'bootstrapping',
  isAuthenticated: false,
  setUser: (user) => set({ user, status: 'authenticated', isAuthenticated: true }),
  setAnonymous: () => set({ user: null, status: 'anonymous', isAuthenticated: false }),
  logout: () => set({ user: null, status: 'anonymous', isAuthenticated: false }),
}));
