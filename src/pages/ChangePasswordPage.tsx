import { Card, Form, Input, Button, Alert, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/apiError';
import { ROUTES } from '../config/routes';
import type { ChangePasswordRequest } from '../types/auth';

export default function ChangePasswordPage() {
  const { user, fetchMe } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
  });

  const handleSubmit = async (values: { current_password: string; new_password: string; confirm_password: string }) => {
    try {
      const response = await changePasswordMutation.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      message.success(response.message);
      await fetchMe();
      form.resetFields();
      navigate(ROUTES.PROFILE);
    } catch (err) {
      message.error(getErrorMessage(err, 'Gagal mengubah kata sandi'));
    }
  };

  return (
    <div>
      <PageHeader
        title="Ganti Kata Sandi"
        breadcrumbs={[
          { title: 'Dashboard', path: '/dashboard' },
          { title: 'Profil', path: ROUTES.PROFILE },
          { title: 'Ganti Kata Sandi' },
        ]}
      />

      <Card className="border-0 shadow-sm max-w-[420px]">
        {user?.password_is_default && (
          <Alert
            type="warning"
            showIcon
            className="mb-4"
            message="Anda masih menggunakan kata sandi bawaan (8 digit pertama NIP). Kata sandi ini mudah ditebak oleh orang yang mengetahui NIP Anda."
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="current_password"
            label="Kata Sandi Saat Ini"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input.Password placeholder="Masukkan kata sandi saat ini" />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="Kata Sandi Baru"
            rules={[
              { required: true, message: 'Wajib diisi' },
              { min: 8, message: 'Kata sandi baru minimal terdiri dari 8 karakter' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value && value === getFieldValue('current_password')) {
                    return Promise.reject(new Error('Kata sandi baru harus berbeda dari kata sandi saat ini'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password placeholder="Masukkan kata sandi baru" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Konfirmasi Kata Sandi Baru"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Wajib diisi' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value === getFieldValue('new_password')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Konfirmasi kata sandi tidak sama'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Ulangi kata sandi baru" />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Button type="primary" htmlType="submit" loading={changePasswordMutation.isPending}>
              Simpan Kata Sandi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
