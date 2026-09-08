import api from '../config/api';
import type { RoleMapping, RoleMappingCreate, RoleOverride, RoleOverrideCreate } from '../types/oauth';

export const roleMappingService = {
  // Jabatan Role Mappings
  listMappings: async (): Promise<RoleMapping[]> => {
    const response = await api.get<RoleMapping[]>('/api/v1/role-mappings');
    return response.data;
  },

  createMapping: async (data: RoleMappingCreate): Promise<RoleMapping> => {
    const response = await api.post<RoleMapping>('/api/v1/role-mappings', data);
    return response.data;
  },

  deleteMapping: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/role-mappings/${id}`);
  },

  // Employee Role Overrides
  listOverrides: async (): Promise<RoleOverride[]> => {
    const response = await api.get<RoleOverride[]>('/api/v1/role-mappings/overrides');
    return response.data;
  },

  createOverride: async (data: RoleOverrideCreate): Promise<RoleOverride> => {
    const response = await api.post<RoleOverride>('/api/v1/role-mappings/overrides', data);
    return response.data;
  },

  deleteOverride: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/role-mappings/overrides/${id}`);
  },
};
