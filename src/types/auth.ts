// API & Auth Types

export interface LoginRequest {
  login: string; // NIP (18-digit) or username
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface User {
  id: number;
  name: string;
  nip: string;
  username: string;
  email: string | null;
  avatar: string | null;
  is_admin: boolean;
  is_active: boolean;
}

export interface OAuthAuthorizeParams {
  client_id: string;
  redirect_uri: string;
  response_type?: string;
  scope?: string;
  state?: string;
  nonce?: string;
}

export interface OAuthAuthorizeResponse {
  message: string;
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  state: string | null;
  nonce: string | null;
  instruction: string;
}

export interface OAuthAuthorizeSubmitResponse {
  redirect_url: string;
  code: string;
}
