import { useEffect } from 'react';
import { App, Modal, Form, Input, Select } from 'antd';
import { useUpdateEmployee } from '../../../../hooks/useEmployees';
import { getErrorMessage } from '../../../../utils/apiError';
import type { Employee, EmployeeUpdate } from '../../../../types/employee';

interface EmployeeEditModalProps {
  open: boolean;
  employee: Employee;
  onClose: () => void;
}

const NULLABLE_FIELDS = ['nip', 'nama_tanpa_gelar', 'email', 'nomor_hp'] as const;

export default function EmployeeEditModal({ open, employee, onClose }: EmployeeEditModalProps) {
  const { message: msg } = App.useApp();
  const [form] = Form.useForm();
  const updateMutation = useUpdateEmployee();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: employee.name,
        nama_tanpa_gelar: employee.nama_tanpa_gelar,
        nip: employee.nip,
        username: employee.username,
        email: employee.email,
        nomor_hp: employee.nomor_hp,
        is_admin: employee.is_admin,
        password: undefined,
      });
    }
  }, [open, employee, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const data: EmployeeUpdate = { ...values };
    for (const field of NULLABLE_FIELDS) {
      if (data[field] === '' || data[field] === undefined) {
        data[field] = null;
      }
    }
    if (!data.password) {
      delete data.password;
    }
    try {
      await updateMutation.mutateAsync({ id: employee.id, data });
      msg.success('Profil pegawai berhasil diperbarui');
      onClose();
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal memperbarui profil pegawai'));
    }
  };

  return (
    <Modal
      title="Edit Profil Pegawai"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={updateMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="name" label="Nama Lengkap (dengan gelar)" rules={[{ required: true, message: 'Wajib diisi' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="nama_tanpa_gelar" label="Nama Tanpa Gelar">
          <Input />
        </Form.Item>

        <Form.Item
          name="nip"
          label="NIP"
          rules={[{ pattern: /^\d{18}$/, message: 'NIP harus 18 digit angka' }]}
          extra="Kosongkan untuk pegawai outsourcing"
        >
          <Input maxLength={18} />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          dependencies={['nip']}
          extra="Jika kosong, NIP dipakai sebagai username"
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!getFieldValue('nip') && !value) {
                  return Promise.reject(new Error('Username wajib diisi untuk pegawai tanpa NIP'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Format email tidak valid' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="nomor_hp" label="Nomor HP">
          <Input />
        </Form.Item>

        <Form.Item name="password" label="Password" extra="Kosongkan jika tidak diubah" rules={[{ min: 8, message: 'Minimal 8 karakter' }]}>
          <Input.Password />
        </Form.Item>

        <Form.Item name="is_admin" label="Peran">
          <Select
            options={[
              { label: 'Pegawai Biasa', value: false },
              { label: 'Super Admin', value: true },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
