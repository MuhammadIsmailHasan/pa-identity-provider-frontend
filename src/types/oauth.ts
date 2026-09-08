export interface OAuthClient {
  id: number;
  app_name: string;
  client_id: string;
  redirect_uri: string;
  allowed_origins: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OAuthClientCreate {
  app_name: string;
  redirect_uri: string;
  allowed_origins?: string;
}

export interface OAuthClientWithSecret extends OAuthClient {
  client_secret: string;
}

export interface RoleMapping {
  id: number;
  jabatan_id: number;
  oauth_client_id: number;
  app_role: string;
  jabatan_name: string | null;
  app_name: string | null;
  created_at: string;
}

export interface RoleMappingCreate {
  jabatan_id: number;
  oauth_client_id: number;
  app_role: string;
}

export interface RoleOverride {
  id: number;
  employee_id: number;
  oauth_client_id: number;
  app_role: string;
  created_at: string;
}

export interface RoleOverrideCreate {
  employee_id: number;
  oauth_client_id: number;
  app_role: string;
}
