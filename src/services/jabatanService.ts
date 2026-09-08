import api from '../config/api';
import type { Jabatan, JabatanTreeNode, JabatanCreate, JabatanUpdate, JabatanMove } from '../types/jabatan';

export const jabatanService = {
  getTree: async (): Promise<JabatanTreeNode[]> => {
    const response = await api.get<JabatanTreeNode[]>('/api/v1/jabatan/tree');
    return response.data;
  },

  list: async (): Promise<Jabatan[]> => {
    const response = await api.get<Jabatan[]>('/api/v1/jabatan');
    return response.data;
  },

  get: async (id: number): Promise<Jabatan> => {
    const response = await api.get<Jabatan>(`/api/v1/jabatan/${id}`);
    return response.data;
  },

  create: async (data: JabatanCreate): Promise<Jabatan> => {
    const response = await api.post<Jabatan>('/api/v1/jabatan', data);
    return response.data;
  },

  update: async (id: number, data: JabatanUpdate): Promise<Jabatan> => {
    const response = await api.put<Jabatan>(`/api/v1/jabatan/${id}`, data);
    return response.data;
  },

  move: async (id: number, data: JabatanMove): Promise<Jabatan> => {
    const response = await api.put<Jabatan>(`/api/v1/jabatan/${id}/move`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/jabatan/${id}`);
  },

  getAncestors: async (id: number): Promise<Jabatan[]> => {
    const response = await api.get<Jabatan[]>(`/api/v1/jabatan/${id}/ancestors`);
    return response.data;
  },

  getDescendants: async (id: number): Promise<Jabatan[]> => {
    const response = await api.get<Jabatan[]>(`/api/v1/jabatan/${id}/descendants`);
    return response.data;
  },
};
