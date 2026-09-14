import api from '../config/api';
import type {
  Employee,
  EmployeeClientRole,
  EmployeeCreate,
  EmployeeListParams,
  EmployeeListResponse,
  EmployeeStatusUpdate,
  EmployeeUpdate,
} from '../types/employee';
import type { Penugasan, PenugasanCreate, PenugasanMutationResponse, PenugasanUpdate } from '../types/penugasan';
import type { Unavailability, UnavailabilityCreate, UnavailabilityUpdate } from '../types/unavailability';

export const employeeService = {
  list: async (params?: EmployeeListParams): Promise<EmployeeListResponse> => {
    const response = await api.get<EmployeeListResponse>('/api/v1/employees', { params });
    return response.data;
  },

  get: async (id: number): Promise<Employee> => {
    const response = await api.get<Employee>(`/api/v1/employees/${id}`);
    return response.data;
  },

  create: async (data: EmployeeCreate): Promise<Employee> => {
    const response = await api.post<Employee>('/api/v1/employees', data);
    return response.data;
  },

  update: async (id: number, data: EmployeeUpdate): Promise<Employee> => {
    const response = await api.put<Employee>(`/api/v1/employees/${id}`, data);
    return response.data;
  },

  changeStatus: async (id: number, data: EmployeeStatusUpdate): Promise<Employee> => {
    const response = await api.put<Employee>(`/api/v1/employees/${id}/status`, data);
    return response.data;
  },

  // Penugasan
  listPenugasan: async (employeeId: number, includeHistory = true): Promise<Penugasan[]> => {
    const response = await api.get<Penugasan[]>(`/api/v1/employees/${employeeId}/penugasan`, {
      params: { include_history: includeHistory },
    });
    return response.data;
  },

  createPenugasan: async (employeeId: number, data: PenugasanCreate): Promise<PenugasanMutationResponse> => {
    const response = await api.post<PenugasanMutationResponse>(`/api/v1/employees/${employeeId}/penugasan`, data);
    return response.data;
  },

  updatePenugasan: async (
    employeeId: number,
    penugasanId: number,
    data: PenugasanUpdate,
  ): Promise<PenugasanMutationResponse> => {
    const response = await api.put<PenugasanMutationResponse>(
      `/api/v1/employees/${employeeId}/penugasan/${penugasanId}`,
      data,
    );
    return response.data;
  },

  deletePenugasan: async (employeeId: number, penugasanId: number): Promise<void> => {
    await api.delete(`/api/v1/employees/${employeeId}/penugasan/${penugasanId}`);
  },

  // Ketidaktersediaan
  listUnavailability: async (employeeId: number, includePast = false): Promise<Unavailability[]> => {
    const response = await api.get<Unavailability[]>(`/api/v1/employees/${employeeId}/ketidaktersediaan`, {
      params: { include_past: includePast },
    });
    return response.data;
  },

  createUnavailability: async (employeeId: number, data: UnavailabilityCreate): Promise<Unavailability> => {
    const response = await api.post<Unavailability>(`/api/v1/employees/${employeeId}/ketidaktersediaan`, data);
    return response.data;
  },

  updateUnavailability: async (
    employeeId: number,
    recordId: number,
    data: UnavailabilityUpdate,
  ): Promise<Unavailability> => {
    const response = await api.put<Unavailability>(
      `/api/v1/employees/${employeeId}/ketidaktersediaan/${recordId}`,
      data,
    );
    return response.data;
  },

  deleteUnavailability: async (employeeId: number, recordId: number): Promise<void> => {
    await api.delete(`/api/v1/employees/${employeeId}/ketidaktersediaan/${recordId}`);
  },

  // Role aplikasi per pegawai
  listClientRoles: async (employeeId: number): Promise<EmployeeClientRole[]> => {
    const response = await api.get<EmployeeClientRole[]>(`/api/v1/employees/${employeeId}/client-roles`);
    return response.data;
  },

  grantClientRole: async (employeeId: number, clientRoleId: number): Promise<EmployeeClientRole> => {
    const response = await api.post<EmployeeClientRole>(`/api/v1/employees/${employeeId}/client-roles`, {
      client_role_id: clientRoleId,
    });
    return response.data;
  },

  revokeClientRole: async (employeeId: number, grantId: number): Promise<void> => {
    await api.delete(`/api/v1/employees/${employeeId}/client-roles/${grantId}`);
  },

  // Avatar (tidak berubah)
  uploadAvatar: async (employeeId: number, file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/v1/employees/${employeeId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAvatar: async (employeeId: number): Promise<void> => {
    await api.delete(`/api/v1/employees/${employeeId}/avatar`);
  },
};
