import type { StatusKepegawaian, TipeJabatan, TipePenugasan } from './enums';

/** Penugasan yang sedang berjalan. `id` adalah ID jabatan. */
export interface JabatanInfo {
  id: number;
  kode: string;
  name: string;
  kelompok: string | null;
  tipe: TipeJabatan | null;
  is_pejabat: boolean;
  tipe_penugasan: TipePenugasan;
  is_primary: boolean;
  start_date: string;
  end_date: string | null;
}

export interface Employee {
  id: number;
  name: string;
  nama_tanpa_gelar: string | null;
  nip: string | null;
  username: string;
  email: string | null;
  nomor_hp: string | null;
  /** Path relatif, gunakan resolveAssetUrl() */
  avatar: string | null;
  status_kepegawaian: StatusKepegawaian;
  tanggal_status: string | null;
  is_active: boolean;
  is_admin: boolean;
  is_available: boolean;
  jenis_pegawai: TipeJabatan | null;
  created_at: string;
  updated_at: string;
  jabatan: JabatanInfo[];
}

export interface EmployeeCreate {
  name: string;
  nama_tanpa_gelar?: string;
  nip?: string;
  username?: string;
  email?: string;
  nomor_hp?: string;
  password: string;
  is_admin?: boolean;
}

export interface EmployeeUpdate {
  name?: string;
  nama_tanpa_gelar?: string | null;
  nip?: string | null;
  username?: string;
  email?: string | null;
  nomor_hp?: string | null;
  password?: string;
  is_admin?: boolean;
}

export interface EmployeeStatusUpdate {
  status_kepegawaian: StatusKepegawaian;
  tanggal_status?: string | null;
}

export interface EmployeeListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
  page: number;
  page_size: number;
}

export interface EmployeeClientRole {
  id: number;
  employee_id: number;
  client_role_id: number;
  role_name: string;
  oauth_client_id: number;
  app_name: string;
  created_at: string;
}
