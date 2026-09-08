export interface JabatanInfo {
  id: number;
  name: string;
  is_primary: boolean;
  start_date: string;
  end_date: string | null;
}

export interface Employee {
  id: number;
  name: string;
  nip: string;
  username: string;
  email: string | null;
  avatar: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  jabatan: JabatanInfo[];
}

export interface EmployeeCreate {
  name: string;
  nip: string;
  username?: string;
  email?: string;
  password: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export interface EmployeeUpdate {
  name?: string;
  nip?: string;
  username?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
}

export interface EmployeeJabatanAssign {
  jabatan_id: number;
  is_primary?: boolean;
  start_date?: string;
  end_date?: string | null;
}
