import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { useOAuthClient } from '../../../hooks/useClients';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useOAuthClient(Number(id));

  if (isLoading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;
  if (!client) return null;

  return (
    <div>
      <PageHeader
        title={client.app_name}
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Aplikasi Client', path: '/admin/clients' }, { title: client.app_name }]}
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/clients')}>Kembali</Button>}
      />
      <Card className="border-0 shadow-sm">
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
          <Descriptions.Item label="Nama Aplikasi">{client.app_name}</Descriptions.Item>
          <Descriptions.Item label="Client ID"><code className="bg-gray-100 px-2 py-0.5 rounded">{client.client_id}</code></Descriptions.Item>
          <Descriptions.Item label="Redirect URI" span={2}><code className="bg-gray-100 px-2 py-0.5 rounded">{client.redirect_uri}</code></Descriptions.Item>
          <Descriptions.Item label="Allowed Origins" span={2}>{client.allowed_origins || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge active={client.is_active} /></Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
