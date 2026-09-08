import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleMappingService } from '../services/roleMappingService';
import type { RoleMappingCreate, RoleOverrideCreate } from '../types/oauth';

export const ROLE_KEYS = {
  all: ['roles'] as const,
  mappings: () => [...ROLE_KEYS.all, 'mappings'] as const,
  overrides: () => [...ROLE_KEYS.all, 'overrides'] as const,
};

export function useRoleMappings() {
  return useQuery({
    queryKey: ROLE_KEYS.mappings(),
    queryFn: roleMappingService.listMappings,
  });
}

export function useCreateRoleMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleMappingCreate) => roleMappingService.createMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.mappings() });
    },
  });
}

export function useDeleteRoleMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleMappingService.deleteMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.mappings() });
    },
  });
}

export function useRoleOverrides() {
  return useQuery({
    queryKey: ROLE_KEYS.overrides(),
    queryFn: roleMappingService.listOverrides,
  });
}

export function useCreateRoleOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleOverrideCreate) => roleMappingService.createOverride(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.overrides() });
    },
  });
}

export function useDeleteRoleOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleMappingService.deleteOverride(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.overrides() });
    },
  });
}
