import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { oauthClientService } from '../services/oauthClientService';
import type { ClientRoleCreate, ClientRoleUpdate, OAuthClientCreate, OAuthClientUpdate } from '../types/oauth';

export const CLIENT_KEYS = {
  all: ['oauth-clients'] as const,
  lists: () => [...CLIENT_KEYS.all, 'list'] as const,
  detail: (id: number) => [...CLIENT_KEYS.all, 'detail', id] as const,
  roles: (id: number) => [...CLIENT_KEYS.all, 'roles', id] as const,
};

export function useOAuthClients() {
  return useQuery({ queryKey: CLIENT_KEYS.lists(), queryFn: oauthClientService.list });
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all }),
  });
}

export function useUpdateOAuthClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OAuthClientUpdate }) => oauthClientService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all }),
  });
}

export function useDeleteOAuthClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => oauthClientService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.all }),
  });
}

/** Katalog role sebuah aplikasi. clientId 0/undefined = tidak memuat. */
export function useClientRoles(clientId?: number) {
  return useQuery({
    queryKey: CLIENT_KEYS.roles(clientId ?? 0),
    queryFn: () => oauthClientService.listRoles(clientId as number),
    enabled: !!clientId,
  });
}

export function useCreateClientRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: number; data: ClientRoleCreate }) =>
      oauthClientService.createRole(clientId, data),
    onSuccess: (_, { clientId }) => queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.roles(clientId) }),
  });
}

export function useUpdateClientRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, roleId, data }: { clientId: number; roleId: number; data: ClientRoleUpdate }) =>
      oauthClientService.updateRole(clientId, roleId, data),
    onSuccess: (_, { clientId }) => queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.roles(clientId) }),
  });
}

export function useDeleteClientRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, roleId }: { clientId: number; roleId: number }) =>
      oauthClientService.deleteRole(clientId, roleId),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_KEYS.roles(clientId) });
      // Menghapus role ikut menghapus pemetaan jabatan dan role pegawai terkait
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
