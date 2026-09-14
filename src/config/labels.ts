import type { AccessPolicy, StatusKepegawaian, TipeJabatan, TipePenugasan } from '../types/enums';
import type { PeriodStatus } from '../utils/date';

export const TIPE_JABATAN_LABEL: Record<TipeJabatan, string> = {
  hakim: 'Hakim',
  pns: 'PNS',
  pppk: 'PPPK',
  outsourcing: 'Outsourcing',
};

export const STATUS_KEPEGAWAIAN_LABEL: Record<StatusKepegawaian, string> = {
  aktif: 'Aktif',
  pindah: 'Pindah',
  pensiun: 'Pensiun',
  berhenti: 'Berhenti',
  meninggal: 'Meninggal',
};

export const STATUS_KEPEGAWAIAN_COLOR: Record<StatusKepegawaian, string> = {
  aktif: 'success',
  pindah: 'warning',
  pensiun: 'default',
  berhenti: 'error',
  meninggal: 'default',
};

export const TIPE_PENUGASAN_LABEL: Record<TipePenugasan, string> = {
  definitif: 'Definitif',
  plt: 'Plt',
  plh: 'Plh',
};

export const TIPE_PENUGASAN_COLOR: Record<TipePenugasan, string> = {
  definitif: 'gold',
  plt: 'blue',
  plh: 'purple',
};

export const ACCESS_POLICY_LABEL: Record<AccessPolicy, string> = {
  all_active: 'Semua pegawai aktif',
  role_required: 'Hanya pemilik role',
};

export const PERIOD_STATUS_LABEL: Record<PeriodStatus, string> = {
  akan_datang: 'Akan Datang',
  berjalan: 'Berjalan',
  berakhir: 'Berakhir',
};

export const PERIOD_STATUS_COLOR: Record<PeriodStatus, string> = {
  akan_datang: 'blue',
  berjalan: 'green',
  berakhir: 'default',
};

export const CLIENT_SCOPE_OPTIONS = [
  { value: 'directory:read', label: 'directory:read — membaca data pegawai dan jabatan' },
  { value: 'availability:write', label: 'availability:write — mencatat ketidaktersediaan' },
];
