import api from '../config/api';
import type { ChangePasswordRequest, TokenResponse, OAuthAuthorizeResponse, OAuthAuthorizeSubmitResponse } from '../types/auth';

export const authService = {
  login: async (login: string, password: string): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/api/v1/auth/login', { login, password });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/api/v1/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    const token = refreshToken || localStorage.getItem('refresh_token') || '';
    if (token) {
      await api.post('/api/v1/auth/logout', { refresh_token: token });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getMe: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },

  // Like getMe, but for the authorize page: a 401 (no session, or a revoked
  // one) must not trigger the global redirect-to-/login — the page needs to
  // fall back to its own login form while keeping the OAuth query params.
  meForAuthorize: async () => {
    const response = await api.get('/api/v1/auth/me', { skipAuthRedirect: true });
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/api/v1/auth/me/password', data);
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

  // OAuth authorize with portal session
  oauthAuthorizeWithSession: async (params: {
    client_id: string;
    redirect_uri: string;
    state?: string;
    scope?: string;
    nonce?: string;
  }): Promise<OAuthAuthorizeSubmitResponse> => {
    const response = await api.post<OAuthAuthorizeSubmitResponse>('/oauth/authorize/session', {}, {
      params,
      skipAuthRedirect: true,
    });
    return response.data;
  },

  // Validate logout request
  validateLogout: async (params: {
    client_id: string;
    post_logout_redirect_uri: string;
    state?: string;
  }): Promise<{ app_name: string; post_logout_redirect_uri: string; state?: string } | null> => {
    try {
      const response = await api.get('/oauth/logout', { params });
      return response.data;
    } catch (err) {
      return null;
    }
  },
};
