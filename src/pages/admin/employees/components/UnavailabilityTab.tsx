import { useState } from 'react';
import { Alert, App, Button, Card, DatePicker, Form, Input, Modal, Space, Switch, Table, Tag, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  useCreateUnavailability,
  useDeleteUnavailability,
  useUnavailability,
  useUpdateUnavailability,
} from '../../../../hooks/useEmployees';
import { useOAuthClients } from '../../../../hooks/useClients';
import { PERIOD_STATUS_COLOR, PERIOD_STATUS_LABEL } from '../../../../config/labels';
import { formatDate, fromApiDate, getPeriodStatus } from '../../../../utils/date';
import { getErrorMessage } from '../../../../utils/apiError';
import type { Employee } from '../../../../types/employee';
import type { Unavailability } from '../../../../types/unavailability';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface UnavailabilityTabProps {
  employee: Employee;
}

export default function UnavailabilityTab({ employee }: UnavailabilityTabProps) {
  const { message: msg, modal } = App.useApp();
  const [includePast, setIncludePast] = useState(false);
  const { data: records, isLoading } = useUnavailability(employee.id, includePast);
  const { data: clients } = useOAuthClients();
  const createMutation = useCreateUnavailability();
  const updateMutation = useUpdateUnavailability();
  const deleteMutation = useDeleteUnavailability();

  const [modalTarget, setModalTarget] = useState<Unavailability | 'new' | null>(null);
  const [form] = Form.useForm();

  const openAdd = () => {
    form.resetFields();
    setModalTarget('new');
  };

  const openEdit = (record: Unavailability) => {
    form.setFieldsValue({
      range: [fromApiDate(record.start_date), fromApiDate(record.end_date)],
      keterangan: record.keterangan,
    });
    setModalTarget(record);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const [start, end] = values.range;
    try {
      if (modalTarget === 'new') {
        await createMutation.mutateAsync({
          employeeId: employee.id,
          data: { start_date: start.format('YYYY-MM-DD'), end_date: end.format('YYYY-MM-DD'), keterangan: values.keterangan || undefined },
        });
        msg.success('Data ketidaktersediaan berhasil ditambahkan');
      } else if (modalTarget) {
        await updateMutation.mutateAsync({
          employeeId: employee.id,
          recordId: modalTarget.id,
          data: { start_date: start.format('YYYY-MM-DD'), end_date: end.format('YYYY-MM-DD'), keterangan: values.keterangan || null },
        });
        msg.success('Data ketidaktersediaan berhasil diperbarui');
      }
      setModalTarget(null);
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal menyimpan data ketidaktersediaan'));
    }
  };

  const handleDelete = (record: Unavailability) => {
    modal.confirm({
      title: 'Hapus Ketidaktersediaan',
      content: 'Yakin ingin menghapus data ketidaktersediaan ini?',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync({ employeeId: employee.id, recordId: record.id });
          msg.success('Data ketidaktersediaan berhasil dihapus');
        } catch (err) {
          msg.error(getErrorMessage(err, 'Gagal menghapus data ketidaktersediaan'));
        }
      },
    });
  };

  return (
    <Card
      className="border-0 shadow-sm"
      title={
        <Space>
          <span>Ketidaktersediaan</span>
        </Space>
      }
      extra={
        <Space>
          <span>Tampilkan yang sudah lewat</span>
          <Switch checked={includePast} onChange={setIncludePast} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Tambah
          </Button>
        </Space>
      }
    >
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="Ketidaktersediaan tidak memblokir login. Data ini dipakai untuk menentukan pelaksana jabatan (Plh) dan pengingat aplikasi lain."
      />
      <Table
        dataSource={records || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            title: 'Periode',
            key: 'periode',
            render: (_, record) => `${formatDate(record.start_date)} – ${formatDate(record.end_date)}`,
          },
          {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
              const status = getPeriodStatus(record.start_date, record.end_date);
              return <Tag color={PERIOD_STATUS_COLOR[status]}>{PERIOD_STATUS_LABEL[status]}</Tag>;
            },
          },
          { title: 'Keterangan', dataIndex: 'keterangan', key: 'keterangan', render: (v: string | null) => v || '-' },
          {
            title: 'Sumber',
            key: 'sumber',
            render: (_, record) =>
              record.source_client_id
                ? clients?.find((c) => c.id === record.source_client_id)?.app_name || `Client #${record.source_client_id}`
                : 'Admin SSO',
          },
          {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => {
              const externalName = record.source_client_id
                ? clients?.find((c) => c.id === record.source_client_id)?.app_name || 'aplikasi lain'
                : null;
              const actions = (
                <Space size="small">
                  <Button size="small" disabled={!!record.source_client_id} onClick={() => openEdit(record)}>
                    Ubah
                  </Button>
                  <Button size="small" danger disabled={!!record.source_client_id} onClick={() => handleDelete(record)}>
                    Hapus
                  </Button>
                </Space>
              );
              return externalName ? (
                <Tooltip title={`Data dari ${externalName} hanya dapat diubah melalui aplikasi tersebut`}>{actions}</Tooltip>
              ) : (
                actions
              );
            },
          },
        ]}
      />

      <Modal
        title={modalTarget === 'new' ? 'Tambah Ketidaktersediaan' : 'Ubah Ketidaktersediaan'}
        open={!!modalTarget}
        onCancel={() => setModalTarget(null)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="mt-4" initialValues={{ range: [dayjs(), dayjs()] }}>
          <Form.Item name="range" label="Periode" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <RangePicker className="w-full" format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item name="keterangan" label="Keterangan">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
