import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UserSwitchOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/common/PageHeader';
import StatusChangeModal from '../../../components/common/StatusChangeModal';
import { useEmployee } from '../../../hooks/useEmployees';
import EmployeeProfileCard from './components/EmployeeProfileCard';
import EmployeeEditModal from './components/EmployeeEditModal';
import PenugasanTab from './components/PenugasanTab';
import UnavailabilityTab from './components/UnavailabilityTab';
import ClientRolesTab from './components/ClientRolesTab';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = Number(id);

  const { data: employee, isLoading: employeeLoading } = useEmployee(employeeId);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

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
          <>
            <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
              Edit Profil
            </Button>
            <Button icon={<UserSwitchOutlined />} onClick={() => setStatusModalOpen(true)}>
              Ubah Status
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/employees')}>
              Kembali
            </Button>
          </>
        }
      />

      <EmployeeProfileCard employee={employee} />

      <Tabs
        type="card"
        items={[
          { key: 'penugasan', label: 'Penugasan', children: <PenugasanTab employee={employee} /> },
          { key: 'ketidaktersediaan', label: 'Ketidaktersediaan', children: <UnavailabilityTab employee={employee} /> },
          { key: 'client-roles', label: 'Role Aplikasi', children: <ClientRolesTab employee={employee} /> },
        ]}
      />

      <EmployeeEditModal open={editModalOpen} employee={employee} onClose={() => setEditModalOpen(false)} />
      <StatusChangeModal open={statusModalOpen} employee={employee} onClose={() => setStatusModalOpen(false)} />
    </div>
  );
}
