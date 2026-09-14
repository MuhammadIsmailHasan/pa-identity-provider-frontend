import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Alert, Spin } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/apiError';
import { ROUTES } from '../../config/routes';

export default function OAuthAuthorizePage() {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<{ client_id: string; scope: string } | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const clientId = searchParams.get('client_id') || '';
  const redirectUri = searchParams.get('redirect_uri') || '';
  const state = searchParams.get('state') || undefined;
  const scope = searchParams.get('scope') || 'openid profile email';
  const nonce = searchParams.get('nonce') || undefined;

  useEffect(() => {
    const validateClient = async () => {
      if (!clientId || !redirectUri) {
        setClientError('Parameter client_id dan redirect_uri diperlukan.');
        setValidating(false);
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
        setAppInfo({ client_id: response.client_id, scope: response.scope });
      } catch (err) {
        setClientError(getErrorMessage(err, 'Aplikasi client tidak valid atau belum terdaftar.'));
      } finally {
        setValidating(false);
      }
    };

    validateClient();
  }, [clientId, redirectUri, scope, state, nonce]);

  const handleSubmit = async (values: { login: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.oauthAuthorizeSubmit(
        { client_id: clientId, redirect_uri: redirectUri, state, scope, nonce },
        { login: values.login.trim(), password: values.password }
      );
      if (result.password_is_default) {
        setPendingRedirect(result.redirect_url);
      } else {
        window.location.href = result.redirect_url;
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Login gagal. Periksa kembali NIP/username dan kata sandi Anda.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (redirectUri) {
      const url = new URL(redirectUri);
      url.searchParams.set('error', 'access_denied');
      url.searchParams.set('error_description', 'Pengguna membatalkan otorisasi');
      if (state) url.searchParams.set('state', state);
      window.location.href = url.toString();
    } else {
      window.history.back();
    }
  };

  const scopesList = (appInfo?.scope || scope).split(' ').filter(Boolean);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-material-subtle">
      <div className="material-card w-full max-w-lg overflow-hidden bg-white">
        {/* App Header */}
        <div className="p-6 bg-emerald-800 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-amber-300 mb-2">
            <AppstoreOutlined className="text-xl" />
          </div>
          <h2 className="text-lg font-bold text-white mb-0.5">Otorisasi Akses Single Sign On</h2>
          <p className="text-xs text-emerald-100">SSO Pengadilan Agama Ngawi</p>
        </div>

        <div className="p-6 sm:p-8">
          {validating ? (
            <div className="text-center py-10">
              <Spin size="large" />
              <div className="text-slate-500 text-xs mt-3">Memvalidasi aplikasi client...</div>
            </div>
          ) : clientError ? (
            <div className="py-4">
              <Alert message="Aplikasi Tidak Diizinkan" description={clientError} type="error" showIcon className="rounded-xl" />
              <div className="mt-6 text-center">
                <Button onClick={() => window.history.back()}>Kembali</Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
                <div className="text-xs font-semibold text-slate-700 mb-0.5">Aplikasi Peminta:</div>
                <div className="font-mono text-sm font-bold text-emerald-800 break-all">{clientId}</div>
                <div className="text-[11px] text-slate-500 mt-1">Callback: {redirectUri}</div>

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
                      Tolak
                    </Button>
                    <Button htmlType="submit" loading={loading} className="btn-material-primary h-11 rounded-full flex-[2]" icon={<ArrowRightOutlined />}>
                      Izinkan & Masuk
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
