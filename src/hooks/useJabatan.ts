import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jabatanService } from '../services/jabatanService';
import type { JabatanCreate, JabatanUpdate, JabatanMove } from '../types/jabatan';

export const JABATAN_KEYS = {
  all: ['jabatan'] as const,
  tree: () => [...JABATAN_KEYS.all, 'tree'] as const,
  list: () => [...JABATAN_KEYS.all, 'list'] as const,
  detail: (id: number) => [...JABATAN_KEYS.all, 'detail', id] as const,
};

export function useJabatanTree() {
  return useQuery({
    queryKey: JABATAN_KEYS.tree(),
    queryFn: jabatanService.getTree,
  });
}

export function useJabatanList() {
  return useQuery({
    queryKey: JABATAN_KEYS.list(),
    queryFn: jabatanService.list,
  });
}

export function useJabatan(id: number) {
  return useQuery({
    queryKey: JABATAN_KEYS.detail(id),
    queryFn: () => jabatanService.get(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateJabatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JabatanCreate) => jabatanService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JABATAN_KEYS.all });
    },
  });
}

export function useUpdateJabatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: JabatanUpdate }) => jabatanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JABATAN_KEYS.all });
    },
  });
}

export function useMoveJabatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: JabatanMove }) => jabatanService.move(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JABATAN_KEYS.all });
    },
  });
}

export function useDeleteJabatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jabatanService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JABATAN_KEYS.all });
    },
  });
}
