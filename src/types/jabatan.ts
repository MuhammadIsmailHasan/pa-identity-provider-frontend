import type { TipeJabatan } from './enums';

interface JabatanBase {
  id: number;
  kode: string;
  name: string;
  description: string | null;
  kelompok: string | null;
  tipe: TipeJabatan | null;
  is_pejabat: boolean;
  allow_plt: boolean;
  allow_plh: boolean;
  urutan: number;
  is_active: boolean;
  parent_id: number | null;
  level: number;
  lft: number;
  rgt: number;
}

export interface Jabatan extends JabatanBase {
  created_at: string;
  updated_at: string;
}

export interface JabatanTreeNode extends JabatanBase {
  children: JabatanTreeNode[];
}

export interface JabatanCreate {
  name: string;
  kode?: string;
  description?: string | null;
  kelompok?: string | null;
  tipe?: TipeJabatan | null;
  is_pejabat?: boolean;
  allow_plt?: boolean;
  allow_plh?: boolean;
  urutan?: number;
  parent_id?: number | null;
}

export interface JabatanUpdate {
  name?: string;
  kode?: string;
  description?: string | null;
  kelompok?: string | null;
  tipe?: TipeJabatan | null;
  is_pejabat?: boolean;
  allow_plt?: boolean;
  allow_plh?: boolean;
  urutan?: number;
  is_active?: boolean;
}

export interface JabatanMove {
  new_parent_id: number | null;
  position?: number;
}
