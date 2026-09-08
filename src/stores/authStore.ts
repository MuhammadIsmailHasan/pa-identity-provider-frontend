import { create } from 'zustand';
import type { User } from '../types/auth';
import api from '../config/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;

  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,

  login: async (loginId: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', {
      login: loginId,
      password,
    });
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    await get().fetchMe();
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await api.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      }
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isAdmin: false });
    }
  },

  fetchMe: async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      const user: User = response.data;
      set({
        user,
        isAuthenticated: true,
        isAdmin: user.is_admin,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.is_admin ?? false,
    });
  },

  initialize: async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      await get().fetchMe();
    } else {
      set({ isLoading: false });
    }
  },
}));
