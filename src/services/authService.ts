import api from '../config/api';
import type { TokenResponse, OAuthAuthorizeResponse, OAuthAuthorizeSubmitResponse } from '../types/auth';

export const authService = {
  login: async (login: string, password: string): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/api/v1/auth/login', { login, password });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/api/v1/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/api/v1/auth/logout', { refresh_token: refreshToken });
  },

  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  // OAuth authorize - validate client
  oauthAuthorize: async (params: {
    client_id: string;
    redirect_uri: string;
    state?: string;
    scope?: string;
    nonce?: string;
  }): Promise<OAuthAuthorizeResponse> => {
    const response = await api.get<OAuthAuthorizeResponse>('/oauth/authorize', { params });
    return response.data;
  },

  // OAuth authorize - submit credentials
  oauthAuthorizeSubmit: async (
    params: { client_id: string; redirect_uri: string; state?: string; scope?: string; nonce?: string },
    credentials: { login: string; password: string }
  ): Promise<OAuthAuthorizeSubmitResponse> => {
    const response = await api.post<OAuthAuthorizeSubmitResponse>('/oauth/authorize', credentials, { params });
    return response.data;
  },
};
