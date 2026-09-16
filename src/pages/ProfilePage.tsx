import { App, Card, Descriptions, Avatar, Typography, Tag, Upload, Flex, Table, Button } from 'antd';
import { UserOutlined, CameraOutlined, MailOutlined, IdcardOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { ROUTES } from '../config/routes';
import EmploymentStatusTag from '../components/employee/EmploymentStatusTag';
import AvailabilityTag from '../components/employee/AvailabilityTag';
import TipePenugasanTag from '../components/employee/TipePenugasanTag';
import { useAuth } from '../hooks/useAuth';
import { useUploadAvatar } from '../hooks/useEmployees';
import { TIPE_JABATAN_LABEL } from '../config/labels';
import { formatDate } from '../utils/date';
import { getErrorMessage } from '../utils/apiError';
import { resolveAssetUrl } from '../utils/assetUrl';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { message: msg } = App.useApp();
  const { user, fetchMe } = useAuth();
  const uploadAvatarMutation = useUploadAvatar();
  const navigate = useNavigate();

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
      msg.success('Avatar berhasil diperbarui');
      onSuccess?.('ok');
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal mengunggah avatar'));
      onError?.(err as Error);
    }
  };

  const jabatanList = user.jabatan || [];

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
                src={resolveAssetUrl(user.avatar)}
                icon={!user.avatar && <UserOutlined />}
                style={{ backgroundColor: '#1677ff', fontSize: 36 }}
              >
                {!user.avatar && getInitials(user.name)}
              </Avatar>
              {user.is_admin && (
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
              )}
            </div>

            <div>
              <Title level={3} className="!mb-1">{user.name}</Title>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Text type="secondary" className="flex items-center gap-1">
                  <IdcardOutlined /> {user.nip ? `NIP: ${user.nip}` : 'Tanpa NIP'}
                </Text>
                <Text type="secondary" className="flex items-center gap-1">
                  <MailOutlined /> {user.email || '-'}
                </Text>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Tag color="blue">@{user.username}</Tag>
                {user.is_admin ? (
                  <Tag color="red">Administrator</Tag>
                ) : (
                  <Tag color="green">Pegawai</Tag>
                )}
                <EmploymentStatusTag status={user.status_kepegawaian} />
                <AvailabilityTag available={user.is_available} until={user.ketidaktersediaan?.end_date} />
              </div>
            </div>
          </Flex>
        </Card>

        <Card
          title="Informasi Akun"
          className="border-0 shadow-sm"
          extra={
            <Button icon={<KeyOutlined />} onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}>
              Ganti Kata Sandi
            </Button>
          }
        >
          <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
            <Descriptions.Item label="Nama Lengkap">{user.name}</Descriptions.Item>
            <Descriptions.Item label="Nama Tanpa Gelar">{user.nama_tanpa_gelar || '-'}</Descriptions.Item>
            <Descriptions.Item label="NIP">{user.nip || '-'}</Descriptions.Item>
            <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nomor HP">{user.nomor_hp || '-'}</Descriptions.Item>
            <Descriptions.Item label="Jenis Pegawai">
              {user.jenis_pegawai ? TIPE_JABATAN_LABEL[user.jenis_pegawai] : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status Kepegawaian">
              <EmploymentStatusTag status={user.status_kepegawaian} />
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Jabatan Saat Ini" className="border-0 shadow-sm">
          <Table
            dataSource={jabatanList}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'Belum ada jabatan' }}
            columns={[
              {
                title: 'Jabatan',
                key: 'name',
                render: (_, record) => (
                  <span>
                    {record.name} {record.is_primary && <Tag color="gold">Utama</Tag>}
                  </span>
                ),
              },
              { title: 'Tipe', key: 'tipe', render: (_, record) => <TipePenugasanTag tipe={record.tipe_penugasan} /> },
              {
                title: 'Periode',
                key: 'periode',
                render: (_, record) => `${formatDate(record.start_date)} – ${record.end_date ? formatDate(record.end_date) : 'sekarang'}`,
              },
            ]}
          />
        </Card>
      </Flex>
    </div>
  );
}
