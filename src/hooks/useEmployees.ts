import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '../services/employeeService';
import type { EmployeeCreate, EmployeeListParams, EmployeeStatusUpdate, EmployeeUpdate } from '../types/employee';
import type { PenugasanCreate, PenugasanUpdate } from '../types/penugasan';
import type { UnavailabilityCreate, UnavailabilityUpdate } from '../types/unavailability';

export const EMPLOYEE_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_KEYS.all, 'list'] as const,
  list: (params?: EmployeeListParams) => [...EMPLOYEE_KEYS.lists(), params] as const,
  details: () => [...EMPLOYEE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...EMPLOYEE_KEYS.details(), id] as const,
  penugasan: (id: number) => [...EMPLOYEE_KEYS.detail(id), 'penugasan'] as const,
  unavailability: (id: number, includePast: boolean) =>
    [...EMPLOYEE_KEYS.detail(id), 'ketidaktersediaan', includePast] as const,
  clientRoles: (id: number) => [...EMPLOYEE_KEYS.detail(id), 'client-roles'] as const,
};

/** Perubahan penugasan/status/ketidaktersediaan memengaruhi detail dan daftar pegawai. */
function useInvalidateEmployee() {
  const queryClient = useQueryClient();
  return (employeeId: number) => {
    queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(employeeId) });
    queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
  };
}

export function useEmployees(params?: EmployeeListParams) {
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
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateEmployee();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeUpdate }) => employeeService.update(id, data),
    onSuccess: (_, { id }) => invalidate(id),
  });
}

export function useChangeEmployeeStatus() {
  const invalidate = useInvalidateEmployee();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmployeeStatusUpdate }) => employeeService.changeStatus(id, data),
    onSuccess: (_, { id }) => invalidate(id),
  });
}

// --- Penugasan ---

export function usePenugasan(employeeId: number) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.penugasan(employeeId),
    queryFn: () => employeeService.listPenugasan(employeeId, true),
    enabled: !!employeeId,
  });
}

export function useCreatePenugasan() {
  const invalidate = useInvalidateEmployee();
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: PenugasanCreate }) =>
      employeeService.createPenugasan(employeeId, data),
    onSuccess: (_, { employeeId }) => invalidate(employeeId),
  });
}

export function useUpdatePenugasan() {
  const invalidate = useInvalidateEmployee();
  return useMutation({
    mutationFn: ({ employeeId, penugasanId, data }: { employeeId: number; penugasanId: number; data: PenugasanUpdate }) =>
      employeeService.updatePenugasan(employeeId, penugasanId, data),
    onSuccess: (_, { employeeId }) => invalidate(employeeId),
  });
}

export function useDeletePenugasan() {
  const invalidate = useInvalidateEmployee();
  return useMutation({
    mutationFn: ({ employeeId, penugasanId }: { employeeId: number; penugasanId: number }) =>
      employeeService.deletePenugasan(employeeId, penugasanId),
    onSuccess: (_, { employeeId }) => invalidate(employeeId),
  });
}

// --- Ketidaktersediaan ---

export function useUnavailability(employeeId: number, includePast: boolean) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.unavailability(employeeId, includePast),
    queryFn: () => employeeService.listUnavailability(employeeId, includePast),
    enabled: !!employeeId,
  });
}

export function useCreateUnavailability() {
  const invalidate = useInvalidateEmployee();
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: number; data: UnavailabilityCreate }) =>
      employeeService.createUnavailability(employeeId, data),
    onSuccess: (_, { employeeId }) => invalidate(employeeId),
  });
}

export function useUpdateUnavailability() {
  const invalidate = useInvalidateEmployee();
  return useMutation({
    mutationFn: ({ employeeId, recordId, data }: { employeeId: number; recordId: number; data: UnavailabilityUpdate }) =>
      employeeService.updateUnavailability(employeeId, recordId, data),
    onSuccess: (_, { employeeId }) => invalidate(employeeId),
  });
}

export function useDeleteUnavailability() {
  const invalidate = useInvalidateEmployee();
  return useMutation({
    mutationFn: ({ employeeId, recordId }: { employeeId: number; recordId: number }) =>
      employeeService.deleteUnavailability(employeeId, recordId),
    onSuccess: (_, { employeeId }) => invalidate(employeeId),
  });
}

// --- Role aplikasi per pegawai ---

export function useEmployeeClientRoles(employeeId: number) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.clientRoles(employeeId),
    queryFn: () => employeeService.listClientRoles(employeeId),
    enabled: !!employeeId,
  });
}

export function useGrantClientRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, clientRoleId }: { employeeId: number; clientRoleId: number }) =>
      employeeService.grantClientRole(employeeId, clientRoleId),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.clientRoles(employeeId) });
    },
  });
}

export function useRevokeClientRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, grantId }: { employeeId: number; grantId: number }) =>
      employeeService.revokeClientRole(employeeId, grantId),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.clientRoles(employeeId) });
    },
  });
}

// --- Avatar ---

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, file }: { employeeId: number; file: File }) =>
      employeeService.uploadAvatar(employeeId, file),
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_KEYS.detail(employeeId) });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
