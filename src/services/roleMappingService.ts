import api from '../config/api';
import type { RoleMapping, RoleMappingCreate } from '../types/oauth';

export const roleMappingService = {
  listMappings: async (oauthClientId?: number): Promise<RoleMapping[]> => {
    const response = await api.get<RoleMapping[]>('/api/v1/role-mappings', {
      params: oauthClientId ? { oauth_client_id: oauthClientId } : undefined,
    });
    return response.data;
  },

  createMapping: async (data: RoleMappingCreate): Promise<RoleMapping> => {
    const response = await api.post<RoleMapping>('/api/v1/role-mappings', data);
    return response.data;
  },

  deleteMapping: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/role-mappings/${id}`);
  },
};
