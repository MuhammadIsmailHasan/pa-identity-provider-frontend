import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleMappingService } from '../services/roleMappingService';
import type { RoleMappingCreate } from '../types/oauth';

export const ROLE_KEYS = {
  all: ['roles'] as const,
  mappings: (oauthClientId?: number) => [...ROLE_KEYS.all, 'mappings', oauthClientId ?? 'all'] as const,
};

export function useRoleMappings(oauthClientId?: number) {
  return useQuery({
    queryKey: ROLE_KEYS.mappings(oauthClientId),
    queryFn: () => roleMappingService.listMappings(oauthClientId),
  });
}

export function useCreateRoleMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleMappingCreate) => roleMappingService.createMapping(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all }),
  });
}

export function useDeleteRoleMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleMappingService.deleteMapping(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all }),
  });
}
