import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Select, Input, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useRoleOverrides, useCreateRoleOverride, useDeleteRoleOverride } from '../../hooks/useRoles';
import { useEmployees } from '../../hooks/useEmployees';
import { useOAuthClients } from '../../hooks/useClients';
import type { RoleOverride } from '../../types/oauth';
import type { ColumnsType } from 'antd/es/table';

export default function RoleOverridePage() {
  const { data: overridesData, isLoading: overridesLoading } = useRoleOverrides();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ page: 1, page_size: 100 });
  const { data: clientsData, isLoading: clientsLoading } = useOAuthClients();

  const createMutation = useCreateRoleOverride();
  const deleteMutation = useDeleteRoleOverride();

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const overrides = overridesData || [];
  const employees = employeesData?.items || [];
  const clients = clientsData || [];
  const loading = overridesLoading || employeesLoading || clientsLoading;

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Role override berhasil ditambahkan');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal menambahkan override');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Hapus Role Override',
      content: 'Yakin ingin menghapus role override ini?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('Override dihapus');
        } catch {
          message.error('Gagal menghapus');
        }
      },
    });
  };

  const columns: ColumnsType<RoleOverride> = [
    {
      title: 'Pegawai',
      dataIndex: 'employee_id',
      key: 'employee_id',
      render: (eid: number) => {
        const emp = employees.find((e) => e.id === eid);
        return emp ? `${emp.name} (${emp.nip})` : `Pegawai #${eid}`;
      },
    },
    {
      title: 'Aplikasi Client',
      dataIndex: 'oauth_client_id',
      key: 'oauth_client_id',
      render: (cid: number) => clients.find((c) => c.id === cid)?.app_name || `Client #${cid}`,
    },
    {
      title: 'Role',
      dataIndex: 'app_role',
      key: 'app_role',
      render: (role: string) => <span className="font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{role}</span>,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Role Override Pegawai"
        subtitle="Berikan peran khusus kepada pegawai tertentu yang mengabaikan role bawaan jabatan"
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Role Override' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Tambah Override</Button>}
      />

      <Card className="border-0 shadow-sm">
        <Table columns={columns} dataSource={overrides} rowKey="id" loading={loading} />
      </Card>

      <Modal title="Tambah Role Override" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item name="employee_id" label="Pegawai" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <Select
              showSearch
              placeholder="Cari pegawai"
              filterOption={(input, opt: any) => opt?.label?.toLowerCase().includes(input.toLowerCase())}
              options={employees.map((e) => ({ label: `${e.name} (${e.nip})`, value: e.id }))}
            />
          </Form.Item>
          <Form.Item name="oauth_client_id" label="Aplikasi Client" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <Select placeholder="Pilih aplikasi" options={clients.map((c) => ({ label: c.app_name, value: c.id }))} />
          </Form.Item>
          <Form.Item name="app_role" label="Role" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. admin, reviewer, operator" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Simpan</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
