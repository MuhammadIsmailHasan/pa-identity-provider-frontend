import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Modal, Form, Input, message, Typography, Space, Radio, Switch, Select, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { useOAuthClients, useCreateOAuthClient, useDeleteOAuthClient } from '../../../hooks/useClients';
import { ACCESS_POLICY_LABEL, CLIENT_SCOPE_OPTIONS } from '../../../config/labels';
import { getErrorMessage } from '../../../utils/apiError';
import type { OAuthClient, OAuthClientCreate, OAuthClientWithSecret } from '../../../types/oauth';
import type { ColumnsType } from 'antd/es/table';

const { Text, Paragraph } = Typography;
const ACCESS_POLICY_OPTIONS = Object.entries(ACCESS_POLICY_LABEL).map(([value, label]) => ({ value, label }));

export default function ClientListPage() {
  const navigate = useNavigate();
  const { data: clientsData, isLoading } = useOAuthClients();
  const createMutation = useCreateOAuthClient();
  const deleteMutation = useDeleteOAuthClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [secretModalData, setSecretModalData] = useState<OAuthClientWithSecret | null>(null);
  const [form] = Form.useForm();
  const allowClientCredentials = Form.useWatch('allow_client_credentials', form);

  const clients = clientsData || [];

  const handleCreate = async (values: OAuthClientCreate & { scopes?: string[] }) => {
    const { scopes, ...rest } = values;
    const payload: OAuthClientCreate = {
      ...rest,
      allowed_scopes: scopes && scopes.length > 0 ? scopes.join(' ') : null,
    };
    try {
      const result = await createMutation.mutateAsync(payload);
      setSecretModalData(result);
      setCreateModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(getErrorMessage(err, 'Gagal mendaftarkan aplikasi'));
    }
  };

  const handleDelete = (client: OAuthClient) => {
    Modal.confirm({
      title: 'Nonaktifkan Aplikasi Client',
      content: `Yakin ingin menonaktifkan "${client.app_name}"? Pegawai tidak akan dapat login ke aplikasi ini.`,
      okText: 'Nonaktifkan',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(client.id);
          message.success('Aplikasi client berhasil dinonaktifkan');
        } catch (err) {
          message.error(getErrorMessage(err, 'Gagal menonaktifkan aplikasi client'));
        }
      },
    });
  };

  const columns: ColumnsType<OAuthClient> = [
    {
      title: 'Nama Aplikasi',
      dataIndex: 'app_name',
      key: 'app_name',
      render: (name: string, record) => (
        <div>
          <div className="font-semibold text-gray-800">{name}</div>
          <div className="text-xs text-gray-400 font-mono">{record.client_id}</div>
        </div>
      ),
    },
    {
      title: 'Redirect URI',
      dataIndex: 'redirect_uri',
      key: 'redirect_uri',
      render: (uri: string) => <span className="font-mono text-xs">{uri}</span>,
    },
    {
      title: 'Akses',
      dataIndex: 'access_policy',
      key: 'access_policy',
      render: (policy: OAuthClient['access_policy']) => (
        <Tag color={policy === 'all_active' ? 'green' : 'orange'}>{ACCESS_POLICY_LABEL[policy]}</Tag>
      ),
    },
    {
      title: 'Sinkronisasi',
      dataIndex: 'allow_client_credentials',
      key: 'allow_client_credentials',
      render: (allowed: boolean) => (allowed ? <Tag>client_credentials</Tag> : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <StatusBadge active={active} />,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/clients/${record.id}`)}
            title="Detail"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Nonaktifkan"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Aplikasi Client (OAuth2)"
        subtitle="Daftarkan dan kelola aplikasi client yang menggunakan SSO Identity Provider"
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Aplikasi Client' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Daftarkan Aplikasi
          </Button>
        }
      />

      <Card className="border-0 shadow-sm">
        <Table columns={columns} dataSource={clients} rowKey="id" loading={isLoading} />
      </Card>

      {/* Modal Buat Client */}
      <Modal
        title="Daftarkan Aplikasi Client Baru"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ access_policy: 'role_required', allow_client_credentials: false, scopes: [] }}
          className="mt-4"
        >
          <Form.Item name="app_name" label="Nama Aplikasi" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. Sistem Informasi Perkara (SIP)" />
          </Form.Item>
          <Form.Item name="redirect_uri" label="Redirect URI" rules={[{ required: true, message: 'Wajib diisi' }, { type: 'url', message: 'URL tidak valid' }]}>
            <Input placeholder="https://sip.instansi.go.id/oauth/callback" />
          </Form.Item>
          <Form.Item name="allowed_origins" label="Allowed Origins (opsional)">
            <Input placeholder="https://sip.instansi.go.id" />
          </Form.Item>
          <Form.Item
            name="access_policy"
            label="Kebijakan Akses"
            extra="Semua pegawai aktif: cocok untuk aplikasi yang dipakai seluruh pegawai. Hanya pemilik role: pegawai harus memiliki minimal satu role di aplikasi ini."
          >
            <Radio.Group options={ACCESS_POLICY_OPTIONS} optionType="button" />
          </Form.Item>
          <Form.Item name="allow_client_credentials" label="Izinkan sinkronisasi data (client_credentials)" valuePropName="checked">
            <Switch />
          </Form.Item>
          {allowClientCredentials && (
            <Form.Item name="scopes" label="Scope">
              <Select mode="multiple" options={CLIENT_SCOPE_OPTIONS} placeholder="Pilih scope" />
            </Form.Item>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setCreateModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Daftarkan
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Kredensial Baru */}
      <Modal
        title="Kredensial Aplikasi Dibuat"
        open={!!secretModalData}
        onOk={() => setSecretModalData(null)}
        onCancel={() => setSecretModalData(null)}
        okText="Saya sudah menyimpan secret ini"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div className="mt-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-sm mb-4">
            Simpan <strong>Client Secret</strong> ini sekarang. Secret tidak akan ditampilkan lagi!
          </div>
          <div className="space-y-3">
            <div>
              <Text type="secondary" className="text-xs">Client ID:</Text>
              <Paragraph copyable={{ icon: <CopyOutlined /> }} className="font-mono bg-gray-50 p-2 rounded">
                {secretModalData?.client_id}
              </Paragraph>
            </div>
            <div>
              <Text type="secondary" className="text-xs">Client Secret:</Text>
              <Paragraph copyable={{ icon: <CopyOutlined /> }} className="font-mono bg-red-50 p-2 rounded text-red-700 font-bold">
                {secretModalData?.client_secret}
              </Paragraph>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
