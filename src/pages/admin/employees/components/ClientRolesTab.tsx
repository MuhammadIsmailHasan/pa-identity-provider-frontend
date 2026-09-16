import { useState } from 'react';
import { Alert, App, Button, Card, Empty, Modal, Select, Space, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { useEmployeeClientRoles, useGrantClientRole, useRevokeClientRole } from '../../../../hooks/useEmployees';
import { useClientRoles, useOAuthClients } from '../../../../hooks/useClients';
import { getErrorMessage } from '../../../../utils/apiError';
import type { Employee } from '../../../../types/employee';

interface ClientRolesTabProps {
  employee: Employee;
}

export default function ClientRolesTab({ employee }: ClientRolesTabProps) {
  const { message: msg, modal } = App.useApp();
  const { data: grants, isLoading } = useEmployeeClientRoles(employee.id);
  const { data: clients } = useOAuthClients();
  const grantMutation = useGrantClientRole();
  const revokeMutation = useRevokeClientRole();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>();
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>();
  const { data: roles } = useClientRoles(selectedClientId);

  const activeClients = (clients || []).filter((c) => c.is_active);

  const handleAdd = async () => {
    if (!selectedRoleId) return;
    try {
      await grantMutation.mutateAsync({ employeeId: employee.id, clientRoleId: selectedRoleId });
      msg.success('Role aplikasi berhasil ditambahkan');
      setAddModalOpen(false);
      setSelectedClientId(undefined);
      setSelectedRoleId(undefined);
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal menambahkan role aplikasi'));
    }
  };

  const handleRevoke = (grantId: number) => {
    modal.confirm({
      title: 'Hapus Role Aplikasi',
      content: 'Yakin ingin menghapus role ini dari pegawai?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await revokeMutation.mutateAsync({ employeeId: employee.id, grantId });
          msg.success('Role aplikasi berhasil dihapus');
        } catch (err) {
          msg.error(getErrorMessage(err, 'Gagal menghapus role aplikasi'));
        }
      },
    });
  };

  return (
    <Card
      className="border-0 shadow-sm"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
          Tambah Role
        </Button>
      }
    >
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="Role di sini ditambahkan langsung ke pegawai. Pegawai juga mendapat role default aplikasi dan role dari pemetaan jabatan (diatur di halaman Aplikasi Client)."
      />
      <Table
        dataSource={grants || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        columns={[
          { title: 'Aplikasi', dataIndex: 'app_name', key: 'app_name' },
          { title: 'Role', dataIndex: 'role_name', key: 'role_name', render: (v: string) => <Tag color="purple">{v}</Tag> },
          {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
              <Button size="small" danger onClick={() => handleRevoke(record.id)}>
                Hapus
              </Button>
            ),
          },
        ]}
      />

      <Modal
        title="Tambah Role Aplikasi"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          setSelectedClientId(undefined);
          setSelectedRoleId(undefined);
        }}
        onOk={handleAdd}
        confirmLoading={grantMutation.isPending}
        okButtonProps={{ disabled: !selectedRoleId }}
        destroyOnClose
      >
        <Space direction="vertical" className="w-full mt-4">
          <div>
            <div className="mb-1">Aplikasi</div>
            <Select
              className="w-full"
              placeholder="Pilih aplikasi"
              value={selectedClientId}
              onChange={(value) => {
                setSelectedClientId(value);
                setSelectedRoleId(undefined);
              }}
              options={activeClients.map((c) => ({ label: c.app_name, value: c.id }))}
            />
          </div>
          <div>
            <div className="mb-1">Role</div>
            {selectedClientId && (roles || []).length === 0 ? (
              <Empty
                description={
                  <span>
                    Aplikasi ini belum punya role.{' '}
                    <Link to={`/admin/clients/${selectedClientId}`}>Tambahkan di sini</Link>
                  </span>
                }
              />
            ) : (
              <Select
                className="w-full"
                placeholder="Pilih role"
                disabled={!selectedClientId}
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                options={(roles || []).map((r) => ({
                  label: r.is_default ? `${r.label || r.name} (default, sudah dimiliki semua pegawai)` : r.label || r.name,
                  value: r.id,
                  disabled: r.is_default,
                }))}
              />
            )}
          </div>
        </Space>
      </Modal>
    </Card>
  );
}
