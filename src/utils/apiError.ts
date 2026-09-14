import axios from 'axios';

interface ValidationItem {
  loc?: (string | number)[];
  msg?: string;
}

/** Ambil pesan error dari respons backend (string atau daftar error validasi 422). */
export function getErrorMessage(err: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Tidak dapat terhubung ke server';

    const detail = (err.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      const messages = (detail as ValidationItem[])
        .map((item) => {
          const field = item.loc?.filter((part) => part !== 'body').join('.');
          return field ? `${field}: ${item.msg}` : item.msg;
        })
        .filter(Boolean);
      if (messages.length > 0) return messages.join('; ');
    }
  }
  return fallback;
}
