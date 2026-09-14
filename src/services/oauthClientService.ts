import api from '../config/api';
import type {
  ClientRole,
  ClientRoleCreate,
  ClientRoleUpdate,
  OAuthClient,
  OAuthClientCreate,
  OAuthClientUpdate,
  OAuthClientWithSecret,
} from '../types/oauth';

export const oauthClientService = {
  list: async (): Promise<OAuthClient[]> => {
    const response = await api.get<OAuthClient[]>('/api/v1/oauth-clients');
    return response.data;
  },

  get: async (id: number): Promise<OAuthClient> => {
    const response = await api.get<OAuthClient>(`/api/v1/oauth-clients/${id}`);
    return response.data;
  },

  create: async (data: OAuthClientCreate): Promise<OAuthClientWithSecret> => {
    const response = await api.post<OAuthClientWithSecret>('/api/v1/oauth-clients', data);
    return response.data;
  },

  update: async (id: number, data: OAuthClientUpdate): Promise<OAuthClient> => {
    const response = await api.put<OAuthClient>(`/api/v1/oauth-clients/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/oauth-clients/${id}`);
  },

  listRoles: async (clientId: number): Promise<ClientRole[]> => {
    const response = await api.get<ClientRole[]>(`/api/v1/oauth-clients/${clientId}/roles`);
    return response.data;
  },

  createRole: async (clientId: number, data: ClientRoleCreate): Promise<ClientRole> => {
    const response = await api.post<ClientRole>(`/api/v1/oauth-clients/${clientId}/roles`, data);
    return response.data;
  },

  updateRole: async (clientId: number, roleId: number, data: ClientRoleUpdate): Promise<ClientRole> => {
    const response = await api.put<ClientRole>(`/api/v1/oauth-clients/${clientId}/roles/${roleId}`, data);
    return response.data;
  },

  deleteRole: async (clientId: number, roleId: number): Promise<void> => {
    await api.delete(`/api/v1/oauth-clients/${clientId}/roles/${roleId}`);
  },
};
