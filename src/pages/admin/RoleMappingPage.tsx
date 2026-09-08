import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Select, Input, TreeSelect, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import { useRoleMappings, useCreateRoleMapping, useDeleteRoleMapping } from '../../hooks/useRoles';
import { useJabatanTree } from '../../hooks/useJabatan';
import { useOAuthClients } from '../../hooks/useClients';
import type { RoleMapping } from '../../types/oauth';
import type { JabatanTreeNode } from '../../types/jabatan';
import type { ColumnsType } from 'antd/es/table';

export default function RoleMappingPage() {
  const { data: mappingsData, isLoading: mappingsLoading } = useRoleMappings();
  const { data: treeData, isLoading: treeLoading } = useJabatanTree();
  const { data: clientsData, isLoading: clientsLoading } = useOAuthClients();

  const createMutation = useCreateRoleMapping();
  const deleteMutation = useDeleteRoleMapping();

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const mappings = mappingsData || [];
  const jabatanTree = treeData || [];
  const clients = clientsData || [];
  const loading = mappingsLoading || treeLoading || clientsLoading;

  const toSelectData = (nodes: JabatanTreeNode[]): any[] =>
    nodes.map((n) => ({ value: n.id, title: n.name, children: n.children ? toSelectData(n.children) : [] }));

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Role mapping berhasil ditambahkan');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal menambahkan role mapping');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Hapus Role Mapping',
      content: 'Yakin ingin menghapus role mapping ini?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('Role mapping dihapus');
        } catch {
          message.error('Gagal menghapus');
        }
      },
    });
  };

  const columns: ColumnsType<RoleMapping> = [
    {
      title: 'Jabatan',
      dataIndex: 'jabatan_name',
      key: 'jabatan_name',
      render: (name: string, record) => name || `Jabatan #${record.jabatan_id}`,
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
      render: (role: string) => <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{role}</span>,
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
        title="Role Mapping Jabatan"
        subtitle="Petakan peran/role pada aplikasi client berdasarkan jabatan pegawai"
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Role Mapping' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Tambah Mapping</Button>}
      />

      <Card className="border-0 shadow-sm">
        <Table columns={columns} dataSource={mappings} rowKey="id" loading={loading} />
      </Card>

      <Modal title="Tambah Role Mapping" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item name="jabatan_id" label="Jabatan" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <TreeSelect treeData={toSelectData(jabatanTree)} placeholder="Pilih jabatan" treeDefaultExpandAll />
          </Form.Item>
          <Form.Item name="oauth_client_id" label="Aplikasi Client" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <Select placeholder="Pilih aplikasi" options={clients.map((c) => ({ label: c.app_name, value: c.id }))} />
          </Form.Item>
          <Form.Item name="app_role" label="Role" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. admin, operator, reviewer" />
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
