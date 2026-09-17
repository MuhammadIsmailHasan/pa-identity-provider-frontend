import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { App, Form, Input, Button, Alert, Spin, Avatar } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
  CloseOutlined,
} from '@ant-design/icons';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../config/routes';
import { getErrorMessage } from '../../utils/apiError';
import { resolveAssetUrl } from '../../utils/assetUrl';
import type { User } from '../../types/auth';

type ViewMode = 'validating' | 'lanjutkan' | 'form' | 'clientError';

export default function OAuthAuthorizePage() {
  const { modal } = App.useApp();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>('validating');
  const [error, setError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<{ app_name?: string; client_id: string; scope: string } | null>(null);
  const [account, setAccount] = useState<User | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const validatedOnce = useRef(false);

  const clientId = searchParams.get('client_id') || '';
  const redirectUri = searchParams.get('redirect_uri') || '';
  const state = searchParams.get('state') || undefined;
  const scope = searchParams.get('scope') || 'openid profile email';
  const nonce = searchParams.get('nonce') || undefined;
  const promptLogin = searchParams.get('prompt') === 'login';

  useEffect(() => {
    if (validatedOnce.current) return;
    validatedOnce.current = true;

    const validateClient = async () => {
      if (!clientId || !redirectUri) {
        setClientError('Parameter client_id dan redirect_uri diperlukan.');
        setView('clientError');
        return;
      }

      try {
        const response = await authService.oauthAuthorize({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope,
          state,
          nonce,
        });
        setAppInfo({ app_name: response.app_name, client_id: response.client_id, scope: response.scope });
      } catch (err) {
        setClientError(getErrorMessage(err, 'Aplikasi client tidak valid atau belum terdaftar.'));
        setView('clientError');
        return;
      }

      const hasToken = !!localStorage.getItem('access_token');
      if (hasToken && !promptLogin) {
        try {
          const me = await authService.meForAuthorize();
          setAccount(me);
          setView('lanjutkan');
          return;
        } catch {
          // Sesi portal tidak ada/berakhir — jatuh ke form login biasa.
        }
      }
      setView('form');
    };

    validateClient();
  }, [clientId, redirectUri, scope, state, nonce, promptLogin]);

  // Kembalikan true jika sudah mengalihkan atau menampilkan pengingat password
  const authorizeWithPortalSession = async (): Promise<boolean> => {
    try {
      const result = await authService.oauthAuthorizeWithSession({
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope,
        nonce,
      });
      if (result.password_is_default) {
        setPendingRedirect(result.redirect_url);
      } else {
        window.location.href = result.redirect_url;
      }
      return true;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAccount(null);
        setView('form');
        setError('Sesi SSO telah berakhir. Silakan masuk kembali.');
      } else {
        setError(getErrorMessage(err, 'Gagal melanjutkan ke aplikasi.'));
      }
      return false;
    }
  };

  const handleContinueAsSession = async () => {
    setLoading(true);
    setError(null);
    try {
      await authorizeWithPortalSession();
    } finally {
      setLoading(false);
    }
  };

  const handleUseAnotherAccount = () => {
    modal.confirm({
      title: 'Gunakan akun lain?',
      content: 'Anda akan keluar dari Portal SSO dan dari aplikasi lain yang sedang memakai akun ini.',
      okText: 'Keluar dan ganti akun',
      okType: 'danger',
      onOk: async () => {
        await useAuthStore.getState().logout();
        setAccount(null);
        setView('form');
      },
    });
  };

  const handleSubmit = async (values: { login: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      let tokens;
      try {
        tokens = await authService.login(values.login.trim(), values.password);
      } catch (err) {
        setError(getErrorMessage(err, 'Login gagal. Periksa kembali NIP/username dan kata sandi Anda.'));
        return;
      }

      // prompt=login: cabut sesi portal lama sebelum menyimpan sesi baru
      const oldRefreshToken = localStorage.getItem('refresh_token');
      if (oldRefreshToken) {
        try {
          await authService.logout(oldRefreshToken);
        } catch {
          // Sesi lama mungkin sudah berakhir; lanjutkan dengan sesi baru
        }
      }

      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      const ok = await authorizeWithPortalSession();
      if (!ok && localStorage.getItem('access_token')) {
        try {
          setAccount(await authService.meForAuthorize());
          setView('lanjutkan');
        } catch {
          // Tetap di form; pesan error sudah ditampilkan
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (redirectUri) {
      const url = new URL(redirectUri);
      url.searchParams.set('error', 'access_denied');
      url.searchParams.set('error_description', 'Pengguna membatalkan login');
      if (state) url.searchParams.set('state', state);
      window.location.href = url.toString();
    } else {
      window.history.back();
    }
  };

  const scopesList = (appInfo?.scope || scope).split(' ').filter(Boolean);
  const primaryJabatan = account?.jabatan?.find((j) => j.is_primary) || account?.jabatan?.[0];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-material-subtle">
      <div className="material-card w-full max-w-lg overflow-hidden bg-white">
        {/* App Header */}
        <div className="p-6 bg-emerald-800 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-amber-300 mb-2">
            <AppstoreOutlined className="text-xl" />
          </div>
          <h2 className="text-lg font-bold text-white mb-0.5">
            {view === 'lanjutkan' ? (
              <>Masuk ke {appInfo?.app_name || clientId}</>
            ) : (
              'Otorisasi Akses Single Sign On'
            )}
          </h2>
          <p className="text-xs text-emerald-100">SSO Pengadilan Agama Ngawi</p>
        </div>

        <div className="p-6 sm:p-8">
          {view === 'validating' ? (
            <div className="text-center py-10">
              <Spin size="large" />
              <div className="text-slate-500 text-xs mt-3">Memvalidasi aplikasi client...</div>
            </div>
          ) : view === 'clientError' ? (
            <div className="py-4">
              <Alert message="Aplikasi Tidak Diizinkan" description={clientError} type="error" showIcon className="rounded-xl" />
              <div className="mt-6 text-center">
                <Button onClick={() => window.history.back()}>Kembali</Button>
              </div>
            </div>
          ) : (
            <div>
              {view === 'form' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
                  <div className="text-xs font-semibold text-slate-700 mb-0.5">Aplikasi Peminta:</div>
                  <div className="text-base font-bold text-emerald-800 break-words">{appInfo?.app_name || clientId}</div>

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Izin Akses (Scope):
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {scopesList.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 text-xs font-medium">
                          <CheckCircleFilled className="text-emerald-600 text-xs" />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <Alert message="Gagal" description={error} type="error" showIcon closable onClose={() => setError(null)} className="mb-5 rounded-xl" />
              )}

              {pendingRedirect ? (
                <div>
                  <Alert
                    type="warning"
                    showIcon
                    className="mb-5 rounded-xl"
                    message="Anda masih menggunakan kata sandi bawaan"
                    description="Kata sandi bawaan mudah ditebak oleh orang yang mengetahui NIP Anda. Anda dapat menggantinya melalui Portal SSO, menu Profil → Ganti Kata Sandi."
                  />
                  <Button
                    autoFocus
                    type="primary"
                    className="btn-material-primary h-11 rounded-full w-full"
                    icon={<ArrowRightOutlined />}
                    onClick={() => { window.location.href = pendingRedirect; }}
                  >
                    Lanjutkan ke aplikasi
                  </Button>
                  <div className="text-center mt-4">
                    <a
                      className="text-xs text-emerald-800 font-semibold"
                      onClick={() => window.open(ROUTES.LOGIN, '_blank', 'noopener')}
                    >
                      Buka Portal SSO
                    </a>
                  </div>
                </div>
              ) : view === 'lanjutkan' && account ? (
                <div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
                    <Avatar
                      size={48}
                      src={account.avatar ? resolveAssetUrl(account.avatar) : undefined}
                      icon={!account.avatar && <UserOutlined />}
                    >
                      {!account.avatar && account.name?.[0]}
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-800 truncate">{account.name}</div>
                      <div className="text-xs text-slate-500">{account.nip || account.username}</div>
                      {primaryJabatan && (
                        <div className="text-xs text-emerald-700 truncate">{primaryJabatan.name}</div>
                      )}
                    </div>
                  </div>

                  <Button
                    autoFocus
                    type="primary"
                    loading={loading}
                    className="btn-material-primary h-11 rounded-full w-full"
                    icon={<ArrowRightOutlined />}
                    onClick={handleContinueAsSession}
                  >
                    Lanjutkan sebagai {account.nama_tanpa_gelar || account.name}
                  </Button>

                  <div className="flex items-center justify-between mt-4">
                    <a className="text-xs text-slate-500 font-medium" onClick={handleUseAnotherAccount}>
                      Gunakan akun lain
                    </a>
                    <Button size="small" onClick={handleCancel} icon={<CloseOutlined />}>
                      Batalkan
                    </Button>
                  </div>
                </div>
              ) : (
                <Form form={form} layout="vertical" onFinish={handleSubmit} size="large" requiredMark={false}>
                  <Form.Item name="login" label={<span className="text-xs font-semibold text-slate-700 uppercase">NIP / Username</span>} rules={[{ required: true, message: 'Wajib diisi' }]}>
                    <Input prefix={<UserOutlined className="text-slate-400" />} placeholder="NIP 18 digit atau username" autoComplete="username" className="text-sm" />
                  </Form.Item>

                  <Form.Item name="password" label={<span className="text-xs font-semibold text-slate-700 uppercase">Kata Sandi</span>} rules={[{ required: true, message: 'Wajib diisi' }]}>
                    <Input.Password prefix={<LockOutlined className="text-slate-400" />} placeholder="Kata sandi akun" autoComplete="current-password" className="text-sm" />
                  </Form.Item>

                  <div className="flex gap-3 mt-6">
                    <Button onClick={handleCancel} className="h-11 rounded-full flex-1" icon={<CloseOutlined />}>
                      Batalkan
                    </Button>
                    <Button htmlType="submit" loading={loading} className="btn-material-primary h-11 rounded-full flex-[2]" icon={<ArrowRightOutlined />}>
                      Masuk
                    </Button>
                  </div>
                </Form>
              )}

              <div className="text-center text-[11px] text-slate-400 mt-6">
                Pengadilan Agama Ngawi &bull; Mahkamah Agung RI
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
