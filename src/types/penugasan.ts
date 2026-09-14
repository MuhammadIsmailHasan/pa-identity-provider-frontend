import type { TipeJabatan, TipePenugasan } from './enums';

export interface Penugasan {
  id: number;
  employee_id: number;
  jabatan_id: number;
  jabatan_kode: string;
  jabatan_name: string;
  jabatan_tipe: TipeJabatan | null;
  tipe_penugasan: TipePenugasan;
  is_primary: boolean;
  start_date: string;
  end_date: string | null;
  nomor_sk: string | null;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
}

export interface PenugasanCreate {
  jabatan_id: number;
  tipe_penugasan: TipePenugasan;
  is_primary: boolean;
  start_date?: string | null;
  end_date?: string | null;
  nomor_sk?: string | null;
  keterangan?: string | null;
}

export interface PenugasanUpdate {
  is_primary?: boolean;
  start_date?: string;
  end_date?: string | null;
  nomor_sk?: string | null;
  keterangan?: string | null;
}

export interface PenugasanMutationResponse {
  message: string;
  data: Penugasan;
  warnings: string[];
}
