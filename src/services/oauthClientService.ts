import api from '../config/api';
import type { OAuthClient, OAuthClientCreate, OAuthClientWithSecret } from '../types/oauth';

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

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/oauth-clients/${id}`);
  },
};
