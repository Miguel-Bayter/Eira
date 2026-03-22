import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../../../src/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, status: 'bootstrapping', isAuthenticated: false });
    window.localStorage.removeItem('eira-auth');
  });

  it('does not persist user session data to localStorage', () => {
    useAuthStore.getState().setUser({
      id: 'user-1',
      email: 'ana@example.com',
      name: 'Ana',
      wellnessScore: 52,
      streakDays: 4,
    });

    expect(window.localStorage.getItem('eira-auth')).toBeNull();
  });
});
