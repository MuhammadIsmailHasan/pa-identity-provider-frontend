export interface Unavailability {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  keterangan: string | null;
  /** Terisi jika dibuat oleh aplikasi lain (tidak bisa diubah dari admin) */
  source_client_id: number | null;
  external_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnavailabilityCreate {
  start_date: string;
  end_date: string;
  keterangan?: string | null;
}

export type UnavailabilityUpdate = Partial<UnavailabilityCreate>;
