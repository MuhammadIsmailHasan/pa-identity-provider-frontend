import { Card, Row, Col, Typography, Button, Spin } from 'antd';
import { AppstoreOutlined, LinkOutlined } from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { useOAuthClients } from '../hooks/useClients';
import type { OAuthClient } from '../types/oauth';

const { Text, Title } = Typography;

export default function AppListPage() {
  const { data: clientsData, isLoading } = useOAuthClients();
  const clients = (clientsData || []).filter((c) => c.is_active);

  const handleOpenApp = (client: OAuthClient) => {
    window.open(`${client.redirect_uri}`, '_blank');
  };

  const getAppColor = (index: number) => {
    const colors = ['#1677ff', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];
    return colors[index % colors.length];
  };

  return (
    <div>
      <PageHeader
        title="Daftar Aplikasi"
        subtitle="Akses aplikasi internal terintegrasi melalui Single Sign-On"
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Aplikasi' }]}
      />

      <Spin spinning={isLoading}>
        {clients.length === 0 && !isLoading ? (
          <EmptyState
            description="Belum ada aplikasi yang terdaftar"
          />
        ) : (
          <Row gutter={[20, 20]}>
            {clients.map((client, index) => {
              const color = getAppColor(index);
              return (
                <Col xs={24} sm={12} lg={8} key={client.id}>
                  <Card
                    hoverable
                    className="border-0 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {client.app_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Title level={5} className="!mb-0">{client.app_name}</Title>
                          <Text type="secondary" className="text-xs">
                            {client.client_id}
                          </Text>
                        </div>
                      </div>

                      {client.allowed_origins && (
                        <Text type="secondary" className="text-sm block mb-4 line-clamp-2">
                          Origin: {client.allowed_origins}
                        </Text>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Tersedia
                      </span>

                      <Button
                        type="primary"
                        icon={<LinkOutlined />}
                        onClick={() => handleOpenApp(client)}
                        size="middle"
                      >
                        Buka Aplikasi
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>
    </div>
  );
}
