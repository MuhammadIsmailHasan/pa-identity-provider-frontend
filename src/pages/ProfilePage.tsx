import { Card, Descriptions, Avatar, Typography, Tag, message, Upload, Flex } from 'antd';
import { UserOutlined, CameraOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { useEmployee, useUploadAvatar } from '../hooks/useEmployees';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, fetchMe } = useAuth();
  const { data: employeeData } = useEmployee(user?.id || 0);
  const uploadAvatarMutation = useUploadAvatar();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    try {
      await uploadAvatarMutation.mutateAsync({ employeeId: user.id, file: file as File });
      await fetchMe();
      message.success('Avatar berhasil diperbarui');
      onSuccess?.('ok');
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal mengunggah avatar');
      onError?.(err);
    }
  };

  const jabatanList = employeeData?.jabatan || [];

  return (
    <div>
      <PageHeader
        title="Profil Pengguna"
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Profil' }]}
      />

      <Flex gap={24} vertical>
        <Card className="border-0 shadow-sm">
          <Flex align="center" gap={24} wrap="wrap">
            <div className="relative group">
              <Avatar
                size={96}
                src={user.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user.avatar}` : undefined}
                icon={!user.avatar && <UserOutlined />}
                style={{ backgroundColor: '#1677ff', fontSize: 36 }}
              >
                {!user.avatar && getInitials(user.name)}
              </Avatar>
              <Upload
                showUploadList={false}
                customRequest={handleAvatarUpload}
                accept="image/*"
                className="absolute inset-0 cursor-pointer"
              >
                <div
                  className="w-24 h-24 rounded-full bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Ubah Foto Profil"
                >
                  <CameraOutlined className="text-xl" />
                </div>
              </Upload>
            </div>

            <div>
              <Title level={3} className="!mb-1">{user.name}</Title>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Text type="secondary" className="flex items-center gap-1">
                  <IdcardOutlined /> NIP: {user.nip}
                </Text>
                <Text type="secondary" className="flex items-center gap-1">
                  <MailOutlined /> {user.email || '-'}
                </Text>
              </div>
              <div className="flex gap-2">
                <Tag color="blue">@{user.username}</Tag>
                {user.is_admin ? (
                  <Tag color="red">Administrator</Tag>
                ) : (
                  <Tag color="green">Pegawai</Tag>
                )}
                {user.is_active ? (
                  <Tag color="success">Aktif</Tag>
                ) : (
                  <Tag color="default">Nonaktif</Tag>
                )}
              </div>
            </div>
          </Flex>
        </Card>

        <Card title="Informasi Akun" className="border-0 shadow-sm">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
            <Descriptions.Item label="Nama Lengkap">{user.name}</Descriptions.Item>
            <Descriptions.Item label="NIP">{user.nip}</Descriptions.Item>
            <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="Peran">{user.is_admin ? 'Super Admin' : 'Pegawai'}</Descriptions.Item>
            <Descriptions.Item label="Status Akun">{user.is_active ? 'Aktif' : 'Nonaktif'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {jabatanList.length > 0 && (
          <Card title="Jabatan Saat Ini" className="border-0 shadow-sm">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
              {jabatanList.map((j) => (
                <Descriptions.Item key={j.id} label={j.is_primary ? 'Jabatan Utama' : 'Jabatan Tambahan'}>
                  <Text strong>{j.name}</Text>
                  {j.is_primary && <Tag color="gold" className="ml-2">Utama</Tag>}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        )}
      </Flex>
    </div>
  );
}
