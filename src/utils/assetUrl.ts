import { BASE_URL } from '../config/api';

/** Ubah path file dari backend (relatif atau absolut) menjadi URL yang bisa dipakai <img>. */
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
