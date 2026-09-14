import dayjs, { type Dayjs } from 'dayjs';

export const API_DATE_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_DATE_FORMAT = 'DD-MM-YYYY';

export const toApiDate = (value?: Dayjs | null): string | null =>
  value ? value.format(API_DATE_FORMAT) : null;

export const fromApiDate = (value?: string | null): Dayjs | null => (value ? dayjs(value) : null);

export const formatDate = (value?: string | null): string =>
  value ? dayjs(value).format(DISPLAY_DATE_FORMAT) : '-';

export type PeriodStatus = 'akan_datang' | 'berjalan' | 'berakhir';

export function getPeriodStatus(start: string, end: string | null): PeriodStatus {
  const today = dayjs();
  if (dayjs(start).isAfter(today, 'day')) return 'akan_datang';
  if (end && dayjs(end).isBefore(today, 'day')) return 'berakhir';
  return 'berjalan';
}
