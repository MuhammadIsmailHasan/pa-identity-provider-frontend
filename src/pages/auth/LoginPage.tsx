import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Checkbox } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useLoginMutation } from '../../hooks/useAuth';
import { ROUTES } from '../../config/routes';
import BrandLogo from '../../components/common/BrandLogo';
import { getErrorMessage } from '../../utils/apiError';

export default function LoginPage() {
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const handleSubmit = async (values: { login: string; password: string }) => {
    setError(null);
    try {
      await loginMutation.mutateAsync({
        login: values.login.trim(),
        password: values.password,
      });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login gagal. Periksa kembali NIP/username dan password Anda.'));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-2 sm:p-4 lg:p-6 relative">
      {/* Top Bar / Clean Material Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          {/* Logo Pengadilan Agama Ngawi */}
          <BrandLogo size={52} />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Pengadilan Agama Ngawi Kelas 1A
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
              Single Sign On (SSO)
            </div>
          </div>
        </div>
      </div>

      {/* Center Container: Clean Material Login Box */}
      <div className="w-full max-w-md mx-auto my-auto py-3">
        <div className="material-card p-5 sm:p-7 bg-white">
          {/* Header Inside Card */}
          <div className="text-center mb-4">
            <BrandLogo size={72} className="mb-2 mx-auto" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0">
              Masuk ke Akun
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              SSO Pengadilan Agama Ngawi
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <Alert
              message="Gagal Masuk"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-3 rounded-xl border-red-200 bg-red-50 text-xs text-red-700"
            />
          )}

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            requiredMark={false}
          >
            {/* Username / NIP Field */}
            <Form.Item
              name="login"
              label={
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  NIP / Username
                </span>
              }
              rules={[
                { required: true, message: 'Masukkan NIP 18 digit atau username' },
                { min: 3, message: 'Minimal 3 karakter' },
              ]}
              className="mb-2"
              style={{ marginBottom: '8px' }}
            >
              <Input
                prefix={<UserOutlined className="text-slate-400 mr-2" />}
                placeholder="18 Digit NIP resmi atau username"
                autoComplete="username"
                id="login-input"
                className="text-sm"
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              label={
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </span>
              }
              rules={[{ required: true, message: 'Masukkan kata sandi akun Anda' }]}
              className="mb-2"
              style={{ marginBottom: '8px' }}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-2" />}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                id="password-input"
                className="text-sm"
              />
            </Form.Item>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between mb-6 text-xs">
              <Form.Item name="remember" valuePropName="checked" noStyle initialValue={true}>
                <Checkbox className="text-slate-600 text-xs font-medium">Ingat sesi saya</Checkbox>
              </Form.Item>
              <span
                onClick={() => {
                  alert('Silakan hubungi Pengelola TI / Kepegawaian Pengadilan Agama Ngawi untuk reset kata sandi.');
                }}
                className="text-emerald-700 hover:text-emerald-800 cursor-pointer font-medium flex items-center gap-1"
              >
                <QuestionCircleOutlined className="text-xs" />
                Lupa sandi?
              </span>
            </div>

            {/* Submit Button (Material Filled Pill) */}
            <Form.Item className="mb-0">
              <Button
                htmlType="submit"
                loading={loginMutation.isPending}
                block
                className="btn-material-primary h-12 text-sm flex items-center justify-center gap-2"
                id="login-submit"
              >
                <span>{loginMutation.isPending ? 'Memverifikasi...' : 'Masuk ke SSO'}</span>
                {!loginMutation.isPending && <ArrowRightOutlined className="text-xs" />}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Clean Material Footer */}
      <div className="w-full max-w-5xl mx-auto py-2 text-center text-xs text-slate-500 border-t border-slate-200/60">
        <p className="mb-0 font-medium text-slate-600">
          &copy; {new Date().getFullYear()} Pengadilan Agama Ngawi &bull; Mahkamah Agung Republik Indonesia
        </p>
        <p className="text-[11px] text-slate-400">
          Jl. Ir. Soekarno (Ring Road Barat), Beran, Kec. Ngawi, Kabupaten Ngawi, Jawa Timur 63216
        </p>
      </div>
    </div>
  );
}
