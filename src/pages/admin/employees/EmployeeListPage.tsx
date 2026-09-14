import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Space, Avatar, Modal, Form, message, Select, Flex } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined, EyeOutlined, UserSwitchOutlined } from '@ant-design/icons';
import PageHeader from '../../../components/common/PageHeader';
import EmploymentStatusTag from '../../../components/employee/EmploymentStatusTag';
import AvailabilityTag from '../../../components/employee/AvailabilityTag';
import JabatanSummary from '../../../components/employee/JabatanSummary';
import StatusChangeModal from '../../../components/common/StatusChangeModal';
import { useEmployees, useCreateEmployee } from '../../../hooks/useEmployees';
import { useJabatanList } from '../../../hooks/useJabatan';
import { TIPE_JABATAN_LABEL } from '../../../config/labels';
import { getErrorMessage } from '../../../utils/apiError';
import { resolveAssetUrl } from '../../../utils/assetUrl';
import type { Employee, EmployeeCreate } from '../../../types/employee';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusModalEmployee, setStatusModalEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useEmployees({
    page,
    page_size: pageSize,
    search: search || undefined,
    is_active: isActiveFilter,
  });
  const { data: jabatanList } = useJabatanList();
  const createMutation = useCreateEmployee();

  const employees = data?.items || [];
  const total = data?.total || 0;

  const jabatanOrder = useMemo(
    () => new Map((jabatanList || []).map((j, index) => [j.id, index])),
    [jabatanList],
  );
  const primaryJabatanId = (e: Employee) => (e.jabatan.find((j) => j.is_primary) ?? e.jabatan[0])?.id;
  const sortedEmployees = [...employees].sort((a, b) => {
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
    const orderA = jabatanOrder.get(primaryJabatanId(a) ?? -1) ?? Number.MAX_SAFE_INTEGER;
    const orderB = jabatanOrder.get(primaryJabatanId(b) ?? -1) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  const handleCreate = async (values: EmployeeCreate) => {
    const payload: EmployeeCreate = {
      ...values,
      nama_tanpa_gelar: values.nama_tanpa_gelar || undefined,
      nip: values.nip || undefined,
      username: values.username || undefined,
      email: values.email || undefined,
      nomor_hp: values.nomor_hp || undefined,
    };
    try {
      const created = await createMutation.mutateAsync(payload);
      message.success('Pegawai berhasil ditambahkan. Tetapkan jabatannya melalui halaman detail.');
      setCreateModalOpen(false);
      form.resetFields();
      navigate(`/admin/employees/${created.id}`);
    } catch (err) {
      message.error(getErrorMessage(err, 'Gagal menambahkan pegawai'));
    }
  };

  const columns: ColumnsType<Employee> = [
    {
      title: 'Pegawai',
      key: 'employee',
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            src={resolveAssetUrl(record.avatar)}
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
      render: (nip: string | null) => (nip ? <span className="font-mono text-sm">{nip}</span> : <span className="text-gray-300">-</span>),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null) => email || <span className="text-gray-300">-</span>,
    },
    {
      title: 'Jabatan',
      key: 'jabatan',
      render: (_, record) => <JabatanSummary jabatan={record.jabatan} />,
    },
    {
      title: 'Jenis',
      dataIndex: 'jenis_pegawai',
      key: 'jenis_pegawai',
      render: (jenis: Employee['jenis_pegawai']) => (jenis ? TIPE_JABATAN_LABEL[jenis] : <span className="text-gray-300">-</span>),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <EmploymentStatusTag status={record.status_kepegawaian} />
          <AvailabilityTag available={record.is_available} />
        </Space>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
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
            icon={<UserSwitchOutlined />}
            onClick={() => setStatusModalEmployee(record)}
            title="Ubah Status"
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
          <Select
            value={isActiveFilter}
            onChange={(value) => {
              setIsActiveFilter(value);
              setPage(1);
            }}
            style={{ width: 180 }}
            options={[
              { label: 'Semua', value: undefined },
              { label: 'Aktif', value: true },
              { label: 'Nonaktif', value: false },
            ]}
          />
        </Flex>
      </Card>

      <Card className="border-0 shadow-sm">
        <Table
          columns={columns}
          dataSource={sortedEmployees}
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
          initialValues={{ is_admin: false }}
          className="mt-4"
        >
          <Form.Item name="name" label="Nama Lengkap (dengan gelar)" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <Input placeholder="cth. Ahmad Fauzi, S.H." />
          </Form.Item>

          <Form.Item name="nama_tanpa_gelar" label="Nama Tanpa Gelar">
            <Input placeholder="cth. Ahmad Fauzi" />
          </Form.Item>

          <Form.Item
            name="nip"
            label="NIP"
            rules={[{ pattern: /^\d{18}$/, message: 'NIP harus 18 digit angka' }]}
            extra="Kosongkan untuk pegawai outsourcing"
          >
            <Input placeholder="18 digit NIP" maxLength={18} />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            dependencies={['nip']}
            extra="Jika kosong, NIP dipakai sebagai username"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!getFieldValue('nip') && !value) {
                    return Promise.reject(new Error('Username wajib diisi untuk pegawai tanpa NIP'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="cth. ahmad.fauzi" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Format email tidak valid' }]}>
            <Input placeholder="cth. ahmad@instansi.go.id" />
          </Form.Item>

          <Form.Item name="nomor_hp" label="Nomor HP">
            <Input placeholder="cth. 081234567890" />
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

      <StatusChangeModal
        open={!!statusModalEmployee}
        employee={statusModalEmployee}
        onClose={() => setStatusModalEmployee(null)}
      />
    </div>
  );
}
