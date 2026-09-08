import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { oauthClientService } from '../services/oauthClientService';
import type { OAuthClientCreate } from '../types/oauth';

export const CLIENT_KEYS = {
  all: ['oauth-clients'] as const,
  lists: () => [...CLIENT_KEYS.all, 'list'] as const,
  detail: (id: number) => [...CLIENT_KEYS.all, 'detail', id] as const,
};

export function useOAuthClients() {
  return useQuery({
    queryKey: CLIENT_KEYS.lists(),
    queryFn: oauthClientService.list,
  });
}

export function useOAuthClient(id: number) {
  return useQuery({
    queryKey: CLIENT_KEYS.detail(id),
    queryFn: () => oauthClientService.get(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateOAuthClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OAuthClientCreate) => oauthClientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
    },
  });
}

export function useDeleteOAuthClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => oauthClientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all });
    },
  });
}
