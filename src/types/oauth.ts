import type { AccessPolicy } from './enums';

export interface OAuthClient {
  id: number;
  app_name: string;
  client_id: string;
  redirect_uri: string;
  allowed_origins: string | null;
  access_policy: AccessPolicy;
  allow_client_credentials: boolean;
  allowed_scopes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OAuthClientCreate {
  app_name: string;
  redirect_uri: string;
  allowed_origins?: string | null;
  access_policy: AccessPolicy;
  allow_client_credentials: boolean;
  allowed_scopes?: string | null;
}

export interface OAuthClientUpdate {
  app_name?: string;
  redirect_uri?: string;
  allowed_origins?: string | null;
  access_policy?: AccessPolicy;
  allow_client_credentials?: boolean;
  allowed_scopes?: string | null;
  is_active?: boolean;
}

export interface OAuthClientWithSecret extends OAuthClient {
  client_secret: string;
}

export interface ClientRole {
  id: number;
  oauth_client_id: number;
  name: string;
  label: string | null;
  description: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ClientRoleCreate {
  name: string;
  label?: string | null;
  description?: string | null;
  is_default: boolean;
}

export type ClientRoleUpdate = Partial<ClientRoleCreate>;

export interface RoleMapping {
  id: number;
  jabatan_id: number;
  jabatan_kode: string;
  jabatan_name: string;
  client_role_id: number;
  role_name: string;
  oauth_client_id: number;
  app_name: string;
  created_at: string;
}

export interface RoleMappingCreate {
  jabatan_id: number;
  client_role_id: number;
}
