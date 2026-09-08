import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Space, Tag, Avatar, Modal, Form, message, Select, Flex } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import { useEmployees, useCreateEmployee, useDeleteEmployee } from '../../../hooks/useEmployees';
import type { Employee, EmployeeCreate } from '../../../types/employee';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useEmployees({ page, page_size: pageSize, search: search || undefined });
  const createMutation = useCreateEmployee();
  const deleteMutation = useDeleteEmployee();

  const employees = data?.items || [];
  const total = data?.total || 0;

  const handleCreate = async (values: EmployeeCreate) => {
    try {
      await createMutation.mutateAsync(values);
      message.success('Pegawai berhasil ditambahkan');
      setCreateModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Gagal menambahkan pegawai');
    }
  };

  const handleDelete = (record: Employee) => {
    Modal.confirm({
      title: 'Hapus Pegawai',
      content: `Yakin ingin menghapus pegawai "${record.name}" (${record.nip})? Tindakan ini tidak dapat dibatalkan.`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(record.id);
          message.success('Pegawai berhasil dihapus');
        } catch (err: any) {
          message.error(err?.response?.data?.detail || 'Gagal menghapus pegawai');
        }
      },
    });
  };

  const columns: ColumnsType<Employee> = [
    {
      title: 'Pegawai',
      key: 'employee',
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            src={record.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${record.avatar}` : undefined}
            icon={!record.avatar && <UserOutlined />}
            style={{ backgroundColor: '#1677ff' }}
          />
          <div>
            <div className="font-semibold text-gray-800">{record.name}</div>
            <div className="text-xs text-gray-400">@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      render: (nip: string) => <span className="font-mono text-sm">{nip}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => email || <span className="text-gray-300">-</span>,
    },
    {
      title: 'Peran',
      key: 'role',
      render: (_, record) =>
        record.is_admin ? (
          <Tag color="red">Super Admin</Tag>
        ) : (
          <Tag color="blue">Pegawai</Tag>
        ),
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
            onClick={() => navigate(`/admin/employees/${record.id}`)}
            title="Lihat Detail"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Hapus"
          />
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 20);
  };

  return (
    <div>
      <PageHeader
        title="Daftar Pegawai"
        subtitle="Kelola data pegawai, peran, dan penugasan jabatan"
        breadcrumbs={[{ title: 'Dashboard', path: '/dashboard' }, { title: 'Pegawai' }]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            id="btn-add-employee"
          >
            Tambah Pegawai
          </Button>
        }
      />

      <Card className="border-0 shadow-sm mb-4">
        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
          <Input
            placeholder="Cari berdasarkan nama, NIP, atau username..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 400 }}
            allowClear
            id="employee-search-input"
          />
        </Flex>
      </Card>

      <Card className="border-0 shadow-sm">
        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (tot) => `Total ${tot} pegawai`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modal Tambah Pegawai */}
      <Modal
        title="Tambah Pegawai Baru"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ is_admin: false, is_active: true }}
          className="mt-4"
        >
          <Form.Item name="name" label="Nama Lengkap" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. Ahmad Fauzi" />
          </Form.Item>

          <Form.Item name="nip" label="NIP" rules={[{ required: true, message: 'Wajib diisi' }, { pattern: /^\d{18}$/, message: 'NIP harus 18 digit angka' }]}>
            <Input placeholder="18 digit NIP" maxLength={18} />
          </Form.Item>

          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. ahmad.fauzi" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Format email tidak valid' }]}>
            <Input placeholder="cth. ahmad@instansi.go.id" />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Wajib diisi' }, { min: 8, message: 'Minimal 8 karakter' }]}>
            <Input.Password placeholder="Password awal" />
          </Form.Item>

          <Form.Item name="is_admin" label="Peran">
            <Select
              options={[
                { label: 'Pegawai Biasa', value: false },
                { label: 'Super Admin', value: true },
              ]}
            />
          </Form.Item>

          <Flex justify="flex-end" gap={8} className="mt-6">
            <Button onClick={() => setCreateModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Simpan
            </Button>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
}
