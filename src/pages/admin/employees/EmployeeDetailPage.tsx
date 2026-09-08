import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Avatar, Tag, Tabs, Table, Button, Space, Modal, Form, message, Spin, Input, Select, TreeSelect } from 'antd';
import { UserOutlined, ArrowLeftOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { useEmployee, useAssignJabatan, useRemoveJabatan } from '../../../hooks/useEmployees';
import { useJabatanTree } from '../../../hooks/useJabatan';
import { useOAuthClients } from '../../../hooks/useClients';
import { useRoleOverrides, useCreateRoleOverride, useDeleteRoleOverride } from '../../../hooks/useRoles';
import type { JabatanTreeNode } from '../../../types/jabatan';
import type { RoleOverride } from '../../../types/oauth';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = Number(id);

  const { data: employee, isLoading: employeeLoading } = useEmployee(employeeId);
  const { data: treeData } = useJabatanTree();
  const { data: clientList } = useOAuthClients();
  const { data: allOverrides } = useRoleOverrides();

  const assignJabatanMutation = useAssignJabatan();
  const removeJabatanMutation = useRemoveJabatan();
  const createOverrideMutation = useCreateRoleOverride();
  const deleteOverrideMutation = useDeleteRoleOverride();

  const [jabatanModalOpen, setJabatanModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [jabatanForm] = Form.useForm();
  const [overrideForm] = Form.useForm();

  const overrides = (allOverrides || []).filter((o) => o.employee_id === employeeId);
  const jabatanTree = treeData || [];
  const clients = clientList || [];

  const handleAssignJabatan = async (values: any) => {
    try {
      await assignJabatanMutation.mutateAsync({
        employeeId,
        data: { jabatan_id: values.jabatan_id, is_primary: values.is_primary ?? false },
      });
      message.success('Jabatan berhasil ditugaskan');
      setJabatanModalOpen(false);
      jabatanForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal menugaskan jabatan');
    }
  };

  const handleRemoveJabatan = (jabatanId: number) => {
    Modal.confirm({
      title: 'Hapus Penugasan Jabatan',
      content: 'Yakin ingin melepas jabatan ini dari pegawai?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await removeJabatanMutation.mutateAsync({ employeeId, jabatanId });
          message.success('Jabatan dilepas');
        } catch {
          message.error('Gagal melepas jabatan');
        }
      },
    });
  };

  const handleCreateOverride = async (values: any) => {
    try {
      await createOverrideMutation.mutateAsync({
        employee_id: employeeId,
        oauth_client_id: values.oauth_client_id,
        app_role: values.app_role,
      });
      message.success('Role override ditambahkan');
      setOverrideModalOpen(false);
      overrideForm.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal menambahkan override');
    }
  };

  const handleDeleteOverride = (overrideId: number) => {
    Modal.confirm({
      title: 'Hapus Override',
      content: 'Yakin ingin menghapus override role ini?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteOverrideMutation.mutateAsync(overrideId);
          message.success('Override dihapus');
        } catch {
          message.error('Gagal menghapus override');
        }
      },
    });
  };

  const toSelectData = (nodes: JabatanTreeNode[]): any[] =>
    nodes.map((n) => ({ value: n.id, title: n.name, children: n.children ? toSelectData(n.children) : [] }));

  if (employeeLoading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!employee) return null;

  return (
    <div>
      <PageHeader
        title={employee.name}
        breadcrumbs={[
          { title: 'Dashboard', path: '/dashboard' },
          { title: 'Pegawai', path: '/admin/employees' },
          { title: employee.name },
        ]}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/employees')}>
            Kembali
          </Button>
        }
      />

      <Card className="border-0 shadow-sm mb-6">
        <div className="flex items-center gap-6 mb-6">
          <Avatar
            size={80}
            src={employee.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${employee.avatar}` : undefined}
            icon={!employee.avatar && <UserOutlined />}
            style={{ backgroundColor: '#1677ff', fontSize: 32 }}
          />
          <div>
            <div className="text-2xl font-bold">{employee.name}</div>
            <div className="text-gray-400">@{employee.username} &bull; NIP: {employee.nip}</div>
            <div className="mt-2 flex gap-2">
              <StatusBadge active={employee.is_active} />
              {employee.is_admin && <Tag color="red">Super Admin</Tag>}
            </div>
          </div>
        </div>

        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
          <Descriptions.Item label="Nama Lengkap">{employee.name}</Descriptions.Item>
          <Descriptions.Item label="NIP">{employee.nip}</Descriptions.Item>
          <Descriptions.Item label="Username">{employee.username}</Descriptions.Item>
          <Descriptions.Item label="Email">{employee.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Peran">{employee.is_admin ? 'Super Admin' : 'Pegawai'}</Descriptions.Item>
          <Descriptions.Item label="Status">{employee.is_active ? 'Aktif' : 'Nonaktif'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        type="card"
        items={[
          {
            key: 'jabatan',
            label: 'Penugasan Jabatan',
            children: (
              <Card
                className="border-0 shadow-sm"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setJabatanModalOpen(true)}>
                    Tugaskan Jabatan
                  </Button>
                }
              >
                <Table
                  dataSource={employee.jabatan || []}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: 'Jabatan', dataIndex: 'name', key: 'name' },
                    {
                      title: 'Tipe',
                      dataIndex: 'is_primary',
                      key: 'is_primary',
                      render: (primary: boolean) =>
                        primary ? <Tag color="gold">Jabatan Utama</Tag> : <Tag>Tambahan</Tag>,
                    },
                    {
                      title: 'Aksi',
                      key: 'action',
                      render: (_, record: any) => (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveJabatan(record.id)}
                        />
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'overrides',
            label: 'Role Overrides',
            children: (
              <Card
                className="border-0 shadow-sm"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setOverrideModalOpen(true)}>
                    Tambah Override
                  </Button>
                }
              >
                <Table
                  dataSource={overrides}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: 'Aplikasi Client',
                      dataIndex: 'oauth_client_id',
                      key: 'oauth_client_id',
                      render: (cid: number) => clients.find((c) => c.id === cid)?.app_name || `Client #${cid}`,
                    },
                    { title: 'Role', dataIndex: 'app_role', key: 'app_role', render: (r: string) => <Tag color="purple">{r}</Tag> },
                    {
                      title: 'Aksi',
                      key: 'action',
                      render: (_, record: RoleOverride) => (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteOverride(record.id)}
                        />
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Modal Assign Jabatan */}
      <Modal
        title="Tugaskan Jabatan"
        open={jabatanModalOpen}
        onCancel={() => setJabatanModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={jabatanForm} layout="vertical" onFinish={handleAssignJabatan} className="mt-4">
          <Form.Item name="jabatan_id" label="Pilih Jabatan" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <TreeSelect treeData={toSelectData(jabatanTree)} placeholder="Pilih jabatan" treeDefaultExpandAll />
          </Form.Item>
          <Form.Item name="is_primary" label="Tipe Penugasan" initialValue={false}>
            <Select
              options={[
                { label: 'Jabatan Tambahan', value: false },
                { label: 'Jabatan Utama', value: true },
              ]}
            />
          </Form.Item>
          <Space className="w-full justify-end mt-4">
            <Button onClick={() => setJabatanModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={assignJabatanMutation.isPending}>
              Simpan
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Modal Add Override */}
      <Modal
        title="Tambah Role Override"
        open={overrideModalOpen}
        onCancel={() => setOverrideModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={overrideForm} layout="vertical" onFinish={handleCreateOverride} className="mt-4">
          <Form.Item name="oauth_client_id" label="Aplikasi Client" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <Select
              placeholder="Pilih aplikasi"
              options={clients.map((c) => ({ label: c.app_name, value: c.id }))}
            />
          </Form.Item>
          <Form.Item name="app_role" label="Role" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. admin, operator, reviewer" />
          </Form.Item>
          <Space className="w-full justify-end mt-4">
            <Button onClick={() => setOverrideModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={createOverrideMutation.isPending}>
              Simpan
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
