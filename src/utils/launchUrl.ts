import type { OAuthClient } from '../types/oauth';

/**
 * URL yang dibuka saat pegawai menekan "Buka Aplikasi" di Portal.
 *
 * Harus berupa pintu masuk login aplikasi (yang memulai alur OAuth dan menyimpan `state`),
 * BUKAN redirect_uri: URL callback itu hanya sah setelah aplikasi memulai login, sehingga
 * dibuka langsung akan menampilkan "Sesi login SSO tidak valid".
 *
 * Bila launch_url belum diisi, dipakai alamat dasar aplikasi (origin redirect_uri).
 */
export function getLaunchUrl(client: Pick<OAuthClient, 'launch_url' | 'redirect_uri'>): string {
  if (client.launch_url) return client.launch_url;
  try {
    return new URL(client.redirect_uri).origin + '/';
  } catch {
    return client.redirect_uri;
  }
}
