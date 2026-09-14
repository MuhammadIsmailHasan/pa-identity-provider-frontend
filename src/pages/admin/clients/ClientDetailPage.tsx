import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Modal, Radio, Select, Space, Spin, Switch, Table, Tabs, Tag, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import JabatanTreeSelect from '../../../components/jabatan/JabatanTreeSelect';
import {
  useClientRoles,
  useCreateClientRole,
  useDeleteClientRole,
  useOAuthClient,
  useUpdateClientRole,
  useUpdateOAuthClient,
} from '../../../hooks/useClients';
import { useCreateRoleMapping, useDeleteRoleMapping, useRoleMappings } from '../../../hooks/useRoles';
import { useJabatanTree } from '../../../hooks/useJabatan';
import { ACCESS_POLICY_LABEL, CLIENT_SCOPE_OPTIONS } from '../../../config/labels';
import { getErrorMessage } from '../../../utils/apiError';
import type { ClientRole, ClientRoleCreate, OAuthClientUpdate } from '../../../types/oauth';

const ACCESS_POLICY_OPTIONS = Object.entries(ACCESS_POLICY_LABEL).map(([value, label]) => ({ value, label }));

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = Number(id);
  const { data: client, isLoading } = useOAuthClient(clientId);
  const updateClientMutation = useUpdateOAuthClient();

  const { data: roles } = useClientRoles(clientId);
  const createRoleMutation = useCreateClientRole();
  const updateRoleMutation = useUpdateClientRole();
  const deleteRoleMutation = useDeleteClientRole();

  const { data: mappings } = useRoleMappings(clientId);
  const { data: jabatanTree } = useJabatanTree();
  const createMappingMutation = useCreateRoleMapping();
  const deleteMappingMutation = useDeleteRoleMapping();

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsForm] = Form.useForm();
  const settingsAllowCC = Form.useWatch('allow_client_credentials', settingsForm);

  const [roleModalTarget, setRoleModalTarget] = useState<ClientRole | 'new' | null>(null);
  const [roleForm] = Form.useForm();

  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [mappingForm] = Form.useForm();

  useEffect(() => {
    if (settingsModalOpen && client) {
      settingsForm.setFieldsValue({
        app_name: client.app_name,
        redirect_uri: client.redirect_uri,
        allowed_origins: client.allowed_origins,
        access_policy: client.access_policy,
        allow_client_credentials: client.allow_client_credentials,
        scopes: client.allowed_scopes ? client.allowed_scopes.split(' ') : [],
        is_active: client.is_active,
      });
    }
  }, [settingsModalOpen, client, settingsForm]);

  if (isLoading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!client) return null;

  const handleUpdateSettings = async () => {
    const values = await settingsForm.validateFields();
    const { scopes, ...rest } = values;
    const data: OAuthClientUpdate = {
      ...rest,
      allowed_origins: rest.allowed_origins || null,
      allowed_scopes: scopes && scopes.length > 0 ? scopes.join(' ') : null,
    };
    try {
      await updateClientMutation.mutateAsync({ id: clientId, data });
      message.success('Pengaturan aplikasi berhasil diperbarui');
      setSettingsModalOpen(false);
    } catch (err) {
      message.error(getErrorMessage(err, 'Gagal memperbarui pengaturan aplikasi'));
    }
  };

  const openRoleModal = (target: ClientRole | 'new') => {
    if (target === 'new') {
      roleForm.resetFields();
    } else {
      roleForm.setFieldsValue(target);
    }
    setRoleModalTarget(target);
  };

  const handleRoleSubmit = async () => {
    const values = await roleForm.validateFields();
    try {
      if (roleModalTarget === 'new') {
        await createRoleMutation.mutateAsync({ clientId, data: values as ClientRoleCreate });
        message.success('Role aplikasi berhasil ditambahkan');
      } else if (roleModalTarget) {
        await updateRoleMutation.mutateAsync({
          clientId,
          roleId: roleModalTarget.id,
          data: { ...values, label: values.label || null, description: values.description || null },
        });
        message.success('Role aplikasi berhasil diperbarui');
      }
      setRoleModalTarget(null);
    } catch (err) {
      message.error(getErrorMessage(err, 'Gagal menyimpan role aplikasi'));
    }
  };

  const handleDeleteRole = (role: ClientRole) => {
    Modal.confirm({
      title: 'Hapus Role Aplikasi',
      content: 'Menghapus role juga menghapus pemetaan jabatan dan role pegawai yang memakai role ini.',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteRoleMutation.mutateAsync({ clientId, roleId: role.id });
          message.success('Role aplikasi berhasil dihapus');
        } catch (err) {
          message.error(getErrorMessage(err, 'Gagal menghapus role aplikasi'));
        }
      },
    });
  };

  const handleAddMapping = async () => {
    const values = await mappingForm.validateFields();
    try {
      await createMappingMutation.mutateAsync({ jabatan_id: values.jabatan_id, client_role_id: values.client_role_id });
      message.success('Pemetaan jabatan berhasil ditambahkan');
      setMappingModalOpen(false);
      mappingForm.resetFields();
    } catch (err) {
      message.error(getErrorMessage(err, 'Gagal menambahkan pemetaan jabatan'));
    }
  };

  const handleDeleteMapping = (mappingId: number) => {
    Modal.confirm({
      title: 'Hapus Pemetaan Jabatan',
      content: 'Yakin ingin menghapus pemetaan ini?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMappingMutation.mutateAsync(mappingId);
          message.success('Pemetaan jabatan berhasil dihapus');
        } catch (err) {
          message.error(getErrorMessage(err, 'Gagal menghapus pemetaan jabatan'));
        }
      },
    });
  };

  return (
    <div>
      <PageHeader
        title={client.app_name}
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Aplikasi Client', path: '/admin/clients' }, { title: client.app_name }]}
        extra={
          <>
            <Button icon={<EditOutlined />} onClick={() => setSettingsModalOpen(true)}>Ubah Pengaturan</Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/clients')}>Kembali</Button>
          </>
        }
      />

      <Card className="border-0 shadow-sm mb-6">
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
          <Descriptions.Item label="Nama Aplikasi">{client.app_name}</Descriptions.Item>
          <Descriptions.Item label="Client ID"><code className="bg-gray-100 px-2 py-0.5 rounded">{client.client_id}</code></Descriptions.Item>
          <Descriptions.Item label="Redirect URI" span={2}><code className="bg-gray-100 px-2 py-0.5 rounded">{client.redirect_uri}</code></Descriptions.Item>
          <Descriptions.Item label="Allowed Origins" span={2}>{client.allowed_origins || '-'}</Descriptions.Item>
          <Descriptions.Item label="Kebijakan Akses">
            <Tag color={client.access_policy === 'all_active' ? 'green' : 'orange'}>{ACCESS_POLICY_LABEL[client.access_policy]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sinkronisasi">{client.allow_client_credentials ? 'Ya' : 'Tidak'}</Descriptions.Item>
          <Descriptions.Item label="Scope" span={2}>
            {client.allowed_scopes
              ? client.allowed_scopes.split(' ').map((s) => <Tag key={s}>{s}</Tag>)
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge active={client.is_active} /></Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        type="card"
        items={[
          {
            key: 'roles',
            label: 'Role Aplikasi',
            children: (
              <Card
                className="border-0 shadow-sm"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleModal('new')}>
                    Tambah Role
                  </Button>
                }
              >
                <Alert
                  type="info"
                  showIcon
                  className="mb-4"
                  message="Nama role harus sama persis dengan nama role di aplikasi client. Permission setiap role tetap diatur di aplikasi client."
                />
                <Table
                  dataSource={roles || []}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: 'Nama', dataIndex: 'name', key: 'name', render: (v: string) => <span className="font-mono">{v}</span> },
                    { title: 'Label', dataIndex: 'label', key: 'label', render: (v: string | null) => v || '-' },
                    { title: 'Deskripsi', dataIndex: 'description', key: 'description', render: (v: string | null) => v || '-' },
                    { title: 'Default', dataIndex: 'is_default', key: 'is_default', render: (v: boolean) => (v ? <Tag color="blue">Default</Tag> : '-') },
                    {
                      title: 'Aksi',
                      key: 'action',
                      render: (_, record: ClientRole) => (
                        <Space size="small">
                          <Button size="small" onClick={() => openRoleModal(record)}>Ubah</Button>
                          <Button size="small" danger onClick={() => handleDeleteRole(record)}>Hapus</Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: 'mappings',
            label: 'Pemetaan Jabatan',
            children: (
              <Card
                className="border-0 shadow-sm"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setMappingModalOpen(true)}>
                    Tambah Pemetaan
                  </Button>
                }
              >
                <Alert
                  type="info"
                  showIcon
                  className="mb-4"
                  message="Pemegang jabatan (definitif, Plt, maupun Plh) otomatis mendapat role yang dipetakan. Role tidak diwariskan ke jabatan bawahan maupun atasan."
                />
                <Table
                  dataSource={mappings || []}
                  rowKey="id"
                  pagination={false}
                  columns={[
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
                    { title: 'Role', dataIndex: 'role_name', key: 'role_name', render: (v: string) => <Tag color="purple">{v}</Tag> },
                    {
                      title: 'Aksi',
                      key: 'action',
                      render: (_, record) => (
                        <Button size="small" danger onClick={() => handleDeleteMapping(record.id)}>Hapus</Button>
                      ),
                    },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Modal Ubah Pengaturan */}
      <Modal
        title="Ubah Pengaturan Aplikasi"
        open={settingsModalOpen}
        onCancel={() => setSettingsModalOpen(false)}
        onOk={handleUpdateSettings}
        confirmLoading={updateClientMutation.isPending}
        destroyOnClose
      >
        <Form form={settingsForm} layout="vertical" className="mt-4">
          <Form.Item name="app_name" label="Nama Aplikasi" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="redirect_uri" label="Redirect URI" rules={[{ required: true, message: 'Wajib diisi' }, { type: 'url', message: 'URL tidak valid' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="allowed_origins" label="Allowed Origins">
            <Input />
          </Form.Item>
          <Form.Item name="access_policy" label="Kebijakan Akses">
            <Radio.Group options={ACCESS_POLICY_OPTIONS} optionType="button" />
          </Form.Item>
          <Form.Item name="allow_client_credentials" label="Izinkan sinkronisasi data (client_credentials)" valuePropName="checked">
            <Switch />
          </Form.Item>
          {settingsAllowCC && (
            <Form.Item name="scopes" label="Scope">
              <Select mode="multiple" options={CLIENT_SCOPE_OPTIONS} />
            </Form.Item>
          )}
          <Form.Item name="is_active" label="Aktif" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Role Aplikasi */}
      <Modal
        title={roleModalTarget === 'new' ? 'Tambah Role Aplikasi' : 'Ubah Role Aplikasi'}
        open={!!roleModalTarget}
        onCancel={() => setRoleModalTarget(null)}
        onOk={handleRoleSubmit}
        confirmLoading={createRoleMutation.isPending || updateRoleMutation.isPending}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" className="mt-4" initialValues={{ is_default: false }}>
          <Form.Item name="name" label="Nama Role" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. admin" />
          </Form.Item>
          <Form.Item name="label" label="Label">
            <Input placeholder="cth. Administrator" />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="is_default" label="Diberikan otomatis kepada semua pegawai aktif" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Pemetaan Jabatan */}
      <Modal
        title="Tambah Pemetaan Jabatan"
        open={mappingModalOpen}
        onCancel={() => setMappingModalOpen(false)}
        onOk={handleAddMapping}
        confirmLoading={createMappingMutation.isPending}
        destroyOnClose
      >
        {(roles || []).length === 0 ? (
          <Empty description="Tambahkan role di tab Role Aplikasi terlebih dahulu" />
        ) : (
          <Form form={mappingForm} layout="vertical" className="mt-4">
            <Form.Item name="jabatan_id" label="Jabatan" rules={[{ required: true, message: 'Wajib dipilih' }]}>
              <JabatanTreeSelect tree={jabatanTree || []} onlyActive placeholder="Pilih jabatan" />
            </Form.Item>
            <Form.Item name="client_role_id" label="Role" rules={[{ required: true, message: 'Wajib dipilih' }]}>
              <Select
                placeholder="Pilih role"
                options={(roles || []).map((r) => ({ label: r.label || r.name, value: r.id }))}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
