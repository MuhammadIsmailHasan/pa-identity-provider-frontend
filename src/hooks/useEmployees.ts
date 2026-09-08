import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '../services/employeeService';
import type { EmployeeCreate, EmployeeUpdate, EmployeeJabatanAssign } from '../types/employee';

export const EMPLOYEE_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_KEYS.all, 'list'] as const,
  list: (params: any) => [...EMPLOYEE_KEYS.lists(), params] as const,
  details: () => [...EMPLOYEE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...EMPLOYEE_KEYS.details(), id] as const,
};

export function useEmployees(params?: { page?: number; page_size?: number; search?: string; is_active?: boolean }) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.list(params),
    queryFn: () => employeeService.list(params),
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.detail(id),
    queryFn: () => employeeService.get(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeCreate) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.all });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeUpdate }) => employeeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.all });
    },
  });
}

export function useAssignJabatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: EmployeeJabatanAssign }) =>
      employeeService.assignJabatan(employeeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(variables.employeeId) });
    },
  });
}

export function useRemoveJabatan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, jabatanId }: { employeeId: number; jabatanId: number }) =>
      employeeService.removeJabatan(employeeId, jabatanId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(variables.employeeId) });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, file }: { employeeId: number; file: File }) =>
      employeeService.uploadAvatar(employeeId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(variables.employeeId) });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
