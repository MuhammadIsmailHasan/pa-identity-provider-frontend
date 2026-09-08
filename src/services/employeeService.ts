import api from '../config/api';
import type { Employee, EmployeeCreate, EmployeeUpdate, EmployeeListResponse, EmployeeJabatanAssign } from '../types/employee';

export const employeeService = {
  list: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<EmployeeListResponse> => {
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

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/employees/${id}`);
  },

  assignJabatan: async (employeeId: number, data: EmployeeJabatanAssign): Promise<void> => {
    await api.post(`/api/v1/employees/${employeeId}/jabatan`, data);
  },

  removeJabatan: async (employeeId: number, jabatanId: number): Promise<void> => {
    await api.delete(`/api/v1/employees/${employeeId}/jabatan/${jabatanId}`);
  },

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
