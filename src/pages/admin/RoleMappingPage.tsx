import { useState } from 'react';
import { App, Card, Table, Button, Modal, Form, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import JabatanTreeSelect from '../../components/jabatan/JabatanTreeSelect';
import { useRoleMappings, useCreateRoleMapping, useDeleteRoleMapping } from '../../hooks/useRoles';
import { useJabatanTree } from '../../hooks/useJabatan';
import { useClientRoles, useOAuthClients } from '../../hooks/useClients';
import { getErrorMessage } from '../../utils/apiError';
import type { RoleMapping } from '../../types/oauth';
import type { ColumnsType } from 'antd/es/table';

export default function RoleMappingPage() {
  const { message: msg, modal } = App.useApp();
  const [filterClientId, setFilterClientId] = useState<number | undefined>();
  const { data: mappingsData, isLoading: mappingsLoading } = useRoleMappings(filterClientId);
  const { data: treeData, isLoading: treeLoading } = useJabatanTree();
  const { data: clientsData, isLoading: clientsLoading } = useOAuthClients();

  const createMutation = useCreateRoleMapping();
  const deleteMutation = useDeleteRoleMapping();

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const formClientId: number | undefined = Form.useWatch('oauth_client_id', form);
  const { data: rolesForForm } = useClientRoles(formClientId);

  const mappings = mappingsData || [];
  const jabatanTree = treeData || [];
  const clients = clientsData || [];
  const loading = mappingsLoading || treeLoading || clientsLoading;

  const handleCreate = async (values: { oauth_client_id: number; jabatan_id: number; client_role_id: number }) => {
    try {
      await createMutation.mutateAsync({ jabatan_id: values.jabatan_id, client_role_id: values.client_role_id });
      msg.success('Pemetaan role berhasil ditambahkan');
      setModalOpen(false);
      form.resetFields();
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal menambahkan pemetaan role'));
    }
  };

  const handleDelete = (id: number) => {
    modal.confirm({
      title: 'Hapus Pemetaan Role',
      content: 'Yakin ingin menghapus pemetaan role ini?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          msg.success('Pemetaan role dihapus');
        } catch (err) {
          msg.error(getErrorMessage(err, 'Gagal menghapus pemetaan role'));
        }
      },
    });
  };

  const columns: ColumnsType<RoleMapping> = [
    {
      title: 'Jabatan',
      key: 'jabatan',
      render: (_, record) => (
        <div>
          <div>{record.jabatan_name}</div>
          <div className="text-xs text-gray-400">{record.jabatan_kode}</div>
        </div>
      ),
    },
    {
      title: 'Aplikasi',
      dataIndex: 'app_name',
      key: 'app_name',
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
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
        title="Pemetaan Role Jabatan"
        subtitle="Pemegang jabatan otomatis mendapat role di aplikasi client"
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Pemetaan Role Jabatan' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Tambah Mapping</Button>}
      />

      <Card className="border-0 shadow-sm mb-4">
        <Select
          allowClear
          placeholder="Semua aplikasi"
          style={{ width: 280 }}
          value={filterClientId}
          onChange={setFilterClientId}
          options={clients.map((c) => ({ label: c.app_name, value: c.id }))}
        />
      </Card>

      <Card className="border-0 shadow-sm">
        <Table
          columns={columns}
          dataSource={mappings}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title="Tambah Pemetaan Role"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item name="oauth_client_id" label="Aplikasi" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <Select
              placeholder="Pilih aplikasi"
              options={clients.map((c) => ({ label: c.app_name, value: c.id }))}
              onChange={() => form.setFieldValue('client_role_id', undefined)}
            />
          </Form.Item>
          <Form.Item name="client_role_id" label="Role" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <Select
              placeholder="Pilih role"
              disabled={!formClientId}
              options={(rolesForForm || []).map((r) => ({ label: r.label || r.name, value: r.id }))}
            />
          </Form.Item>
          <Form.Item name="jabatan_id" label="Jabatan" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <JabatanTreeSelect tree={jabatanTree} onlyActive placeholder="Pilih jabatan" />
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
