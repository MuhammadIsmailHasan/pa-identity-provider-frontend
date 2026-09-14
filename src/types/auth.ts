// API & Auth Types

import type { JabatanInfo } from './employee';
import type { StatusKepegawaian, TipeJabatan } from './enums';

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
  sub: string;
  name: string;
  nama_tanpa_gelar: string | null;
  nip: string | null;
  username: string;
  preferred_username: string;
  email: string | null;
  email_verified: boolean | null;
  nomor_hp: string | null;
  /** URL absolut */
  avatar: string | null;
  picture: string | null;
  jenis_pegawai: TipeJabatan | null;
  status_kepegawaian: StatusKepegawaian;
  is_active: boolean;
  is_available: boolean;
  ketidaktersediaan: { start_date: string; end_date: string } | null;
  jabatan: JabatanInfo[];
  is_admin: boolean;
  /** true jika masih memakai password bawaan; tampilkan pengingat, jangan memaksa */
  password_is_default: boolean;
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
  password_is_default: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
