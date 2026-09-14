import { Avatar, Card, Descriptions, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import EmploymentStatusTag from '../../../../components/employee/EmploymentStatusTag';
import AvailabilityTag from '../../../../components/employee/AvailabilityTag';
import JabatanSummary from '../../../../components/employee/JabatanSummary';
import { TIPE_JABATAN_LABEL } from '../../../../config/labels';
import { formatDate } from '../../../../utils/date';
import { resolveAssetUrl } from '../../../../utils/assetUrl';
import type { Employee } from '../../../../types/employee';

interface EmployeeProfileCardProps {
  employee: Employee;
}

export default function EmployeeProfileCard({ employee }: EmployeeProfileCardProps) {
  return (
    <Card className="border-0 shadow-sm mb-6">
      <div className="flex items-center gap-6 mb-6">
        <Avatar
          size={80}
          src={resolveAssetUrl(employee.avatar)}
          icon={!employee.avatar && <UserOutlined />}
          style={{ backgroundColor: '#1677ff', fontSize: 32 }}
        />
        <div>
          <div className="text-2xl font-bold">{employee.name}</div>
          <div className="text-gray-400">@{employee.username} &bull; {employee.nip ? `NIP: ${employee.nip}` : 'Tanpa NIP'}</div>
          <div className="mt-2 flex gap-2">
            <EmploymentStatusTag status={employee.status_kepegawaian} />
            <AvailabilityTag available={employee.is_available} />
            {employee.is_admin && <Tag color="red">Super Admin</Tag>}
          </div>
        </div>
      </div>

      <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
        <Descriptions.Item label="Nama Lengkap">{employee.name}</Descriptions.Item>
        <Descriptions.Item label="Nama Tanpa Gelar">{employee.nama_tanpa_gelar || '-'}</Descriptions.Item>
        <Descriptions.Item label="NIP">{employee.nip || '-'}</Descriptions.Item>
        <Descriptions.Item label="Username">{employee.username}</Descriptions.Item>
        <Descriptions.Item label="Email">{employee.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Nomor HP">{employee.nomor_hp || '-'}</Descriptions.Item>
        <Descriptions.Item label="Jenis Pegawai">
          {employee.jenis_pegawai ? TIPE_JABATAN_LABEL[employee.jenis_pegawai] : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Status Kepegawaian">
          {employee.status_kepegawaian === 'aktif' || !employee.tanggal_status
            ? '-'
            : `sejak ${formatDate(employee.tanggal_status)}`}
        </Descriptions.Item>
        <Descriptions.Item label="Jabatan Saat Ini" span={2}>
          <JabatanSummary jabatan={employee.jabatan} />
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
