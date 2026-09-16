import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, Alert, Button } from 'antd';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';

export default function LogoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [appName, setAppName] = useState<string | null>(null);

  const clientId = searchParams.get('client_id') || '';
  const postLogoutRedirectUri = searchParams.get('post_logout_redirect_uri') || '';
  const state = searchParams.get('state') || '';

  const goToClient = () => {
    const url = new URL(postLogoutRedirectUri);
    if (state) {
      url.searchParams.set('state', state);
    }
    window.location.replace(url.toString());
  };

  useEffect(() => {
    const handleLogout = async () => {
      let valid = false;
      // Validate logout request if parameters provided
      if (clientId && postLogoutRedirectUri) {
        const result = await authService.validateLogout({
          client_id: clientId,
          post_logout_redirect_uri: postLogoutRedirectUri,
          state,
        });

        if (result) {
          valid = true;
          setIsValid(true);
          setAppName(result.app_name);
        } else {
          setMessage('Tautan kembali ke aplikasi tidak valid');
        }
      }

      // Logout from portal (revoke SSO session; back-channel notifies other apps)
      if (localStorage.getItem('refresh_token')) {
        try {
          await authService.logout();
        } catch (err) {
          console.error('Logout error:', err);
        }
      }

      setLoading(false);
      if (valid) {
        // Give the "Anda telah keluar" message a beat on screen, then leave.
        setTimeout(goToClient, 1200);
      }
    };

    handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, postLogoutRedirectUri, state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="text-slate-500 text-sm mt-3">Sedang keluar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-material-subtle">
      <div className="material-card w-full max-w-md p-8 bg-white text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Anda telah keluar</h2>

        {message && <Alert type="warning" message={message} className="mb-4" />}

        {isValid && clientId && postLogoutRedirectUri ? (
          <div>
            <p className="text-slate-600 text-sm mb-4">
              Mengalihkan ke {appName || 'aplikasi'}…
            </p>
            <Button type="primary" onClick={goToClient} className="w-full">
              Kembali ke {appName || 'Aplikasi'}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-slate-600 text-sm mb-4">
              Anda telah keluar dari SSO.
            </p>
            <Button
              type="primary"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full"
            >
              Masuk Kembali
            </Button>
          </div>
        )}

        <div className="text-center text-[11px] text-slate-400 mt-6">
          Pengadilan Agama Ngawi &bull; Mahkamah Agung RI
        </div>
      </div>
    </div>
  );
}
