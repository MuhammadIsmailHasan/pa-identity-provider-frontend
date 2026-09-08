import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/auth';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  me: () => [...AUTH_KEYS.all, 'me'] as const,
};

export function useCurrentUser() {
  const token = localStorage.getItem('access_token');
  return useQuery<User>({
    queryKey: AUTH_KEYS.me(),
    queryFn: authService.getMe,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: async ({ login, password }: { login: string; password: string }) => {
      await storeLogin(login, password);
      return authService.getMe();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(AUTH_KEYS.me(), userData);
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { logout: storeLogout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await storeLogout();
    },
    onSuccess: () => {
      queryClient.removeQueries();
      queryClient.clear();
    },
  });
}

export function useAuth() {
  return useAuthStore();
}
