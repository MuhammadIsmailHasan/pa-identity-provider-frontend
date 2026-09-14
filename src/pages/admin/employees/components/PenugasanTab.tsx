import { useMemo, useState } from 'react';
import { Alert, Button, Card, DatePicker, Form, Input, Modal, Radio, Space, Switch, Table, Tag, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TipePenugasanTag from '../../../../components/employee/TipePenugasanTag';
import JabatanTreeSelect from '../../../../components/jabatan/JabatanTreeSelect';
import { useCreatePenugasan, useDeletePenugasan, usePenugasan, useUpdatePenugasan } from '../../../../hooks/useEmployees';
import { useJabatanTree } from '../../../../hooks/useJabatan';
import { PERIOD_STATUS_COLOR, PERIOD_STATUS_LABEL } from '../../../../config/labels';
import { DISPLAY_DATE_FORMAT, formatDate, getPeriodStatus, toApiDate } from '../../../../utils/date';
import { getErrorMessage } from '../../../../utils/apiError';
import type { Employee } from '../../../../types/employee';
import type { Penugasan, PenugasanCreate } from '../../../../types/penugasan';
import type { JabatanTreeNode } from '../../../../types/jabatan';
import type { TipePenugasan } from '../../../../types/enums';
import dayjs from 'dayjs';

function findJabatanNode(nodes: JabatanTreeNode[], id: number): JabatanTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findJabatanNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

const PERIOD_ORDER: Record<string, number> = { berjalan: 0, akan_datang: 1, berakhir: 2 };

interface PenugasanTabProps {
  employee: Employee;
}

export default function PenugasanTab({ employee }: PenugasanTabProps) {
  const { data: penugasanList, isLoading } = usePenugasan(employee.id);
  const { data: jabatanTree } = useJabatanTree();
  const createMutation = useCreatePenugasan();
  const updateMutation = useUpdatePenugasan();
  const deleteMutation = useDeletePenugasan();

  const [showHistory, setShowHistory] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Penugasan | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [endDate, setEndDate] = useState(dayjs());

  const tree = jabatanTree || [];
  const selectedJabatanId: number | undefined = Form.useWatch('jabatan_id', form);
  const tipePenugasan: TipePenugasan | undefined = Form.useWatch('tipe_penugasan', form);

  const selectedNode = selectedJabatanId ? findJabatanNode(tree, selectedJabatanId) : undefined;
  const allowPlt = selectedNode?.allow_plt ?? true;
  const allowPlh = selectedNode?.allow_plh ?? true;

  const rows = useMemo(() => {
    const list = (penugasanList || []).map((p) => ({ ...p, status: getPeriodStatus(p.start_date, p.end_date) }));
    const filtered = showHistory ? list : list.filter((p) => p.status !== 'berakhir');
    return filtered.sort((a, b) => {
      const orderDiff = PERIOD_ORDER[a.status] - PERIOD_ORDER[b.status];
      if (orderDiff !== 0) return orderDiff;
      return b.start_date.localeCompare(a.start_date);
    });
  }, [penugasanList, showHistory]);

  const showWarnings = (warnings: string[]) => {
    if (warnings.length > 0) {
      Modal.warning({
        title: 'Penugasan tersimpan dengan catatan',
        content: (
          <ul className="list-disc pl-5">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ),
      });
    }
  };

  const handleAdd = async () => {
    const values = await form.validateFields();
    const data: PenugasanCreate = {
      jabatan_id: values.jabatan_id,
      tipe_penugasan: values.tipe_penugasan,
      is_primary: values.tipe_penugasan === 'definitif' ? !!values.is_primary : false,
      start_date: toApiDate(values.start_date),
      end_date: toApiDate(values.end_date),
      nomor_sk: values.nomor_sk || undefined,
      keterangan: values.keterangan || undefined,
    };
    try {
      const result = await createMutation.mutateAsync({ employeeId: employee.id, data });
      message.success(result.message);
      showWarnings(result.warnings);
      setAddModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(getErrorMessage(err, 'Gagal menambahkan penugasan'));
    }
  };

  const openEdit = (record: Penugasan) => {
    setEditTarget(record);
    editForm.setFieldsValue({
      is_primary: record.is_primary,
      start_date: dayjs(record.start_date),
      end_date: record.end_date ? dayjs(record.end_date) : undefined,
      nomor_sk: record.nomor_sk,
      keterangan: record.keterangan,
    });
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    const values = await editForm.validateFields();
    try {
      const result = await updateMutation.mutateAsync({
        employeeId: employee.id,
        penugasanId: editTarget.id,
        data: {
          is_primary: editTarget.tipe_penugasan === 'definitif' ? values.is_primary : undefined,
          start_date: toApiDate(values.start_date) ?? undefined,
          end_date: values.end_date === undefined ? undefined : toApiDate(values.end_date),
          nomor_sk: values.nomor_sk || null,
          keterangan: values.keterangan || null,
        },
      });
      message.success(result.message);
      showWarnings(result.warnings);
      setEditTarget(null);
    } catch (err) {
      message.error(getErrorMessage(err, 'Gagal memperbarui penugasan'));
    }
  };

  const handleEnd = (record: Penugasan) => {
    setEndDate(dayjs());
    Modal.confirm({
      title: 'Akhiri Penugasan',
      content: (
        <div className="mt-2">
          <Typography.Text>Tanggal akhir penugasan:</Typography.Text>
          <DatePicker
            className="w-full mt-2"
            format={DISPLAY_DATE_FORMAT}
            defaultValue={dayjs()}
            onChange={(value) => value && setEndDate(value)}
          />
        </div>
      ),
      okText: 'Akhiri',
      onOk: async () => {
        try {
          const result = await updateMutation.mutateAsync({
            employeeId: employee.id,
            penugasanId: record.id,
            data: { end_date: toApiDate(endDate) },
          });
          message.success(result.message);
          showWarnings(result.warnings);
        } catch (err) {
          message.error(getErrorMessage(err, 'Gagal mengakhiri penugasan'));
        }
      },
    });
  };

  const handleDelete = (record: Penugasan) => {
    Modal.confirm({
      title: 'Hapus Penugasan',
      content:
        'Hapus hanya untuk penugasan yang salah input. Untuk penugasan yang benar-benar terjadi, gunakan "Akhiri" agar riwayat tetap tersimpan.',
      okText: 'Hapus',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync({ employeeId: employee.id, penugasanId: record.id });
          message.success('Penugasan berhasil dihapus');
        } catch (err) {
          message.error(getErrorMessage(err, 'Gagal menghapus penugasan'));
        }
      },
    });
  };

  return (
    <Card
      className="border-0 shadow-sm"
      title={
        <Space>
          <span>Tampilkan riwayat</span>
          <Switch checked={showHistory} onChange={setShowHistory} />
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
          Tambah Penugasan
        </Button>
      }
    >
      <Table
        dataSource={rows}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        columns={[
          {
            title: 'Jabatan',
            key: 'jabatan',
            render: (_, record) => (
              <div>
                <div>{record.jabatan_name}</div>
                <div className="text-xs text-gray-400">{record.jabatan_kode}</div>
              </div>
            ),
          },
          {
            title: 'Tipe',
            key: 'tipe',
            render: (_, record) => (
              <Space>
                <TipePenugasanTag tipe={record.tipe_penugasan} />
                {record.is_primary && <Tag color="gold">Utama</Tag>}
              </Space>
            ),
          },
          {
            title: 'Periode',
            key: 'periode',
            render: (_, record) => `${formatDate(record.start_date)} – ${record.end_date ? formatDate(record.end_date) : 'sekarang'}`,
          },
          {
            title: 'Status',
            key: 'status',
            render: (_, record: Penugasan & { status: string }) => (
              <Tag color={PERIOD_STATUS_COLOR[record.status as keyof typeof PERIOD_STATUS_COLOR]}>
                {PERIOD_STATUS_LABEL[record.status as keyof typeof PERIOD_STATUS_LABEL]}
              </Tag>
            ),
          },
          { title: 'No. SK', dataIndex: 'nomor_sk', key: 'nomor_sk', render: (v: string | null) => v || '-' },
          {
            title: 'Aksi',
            key: 'action',
            render: (_, record: Penugasan & { status: string }) => (
              <Space size="small">
                <Button size="small" onClick={() => openEdit(record)}>
                  Ubah
                </Button>
                {record.status !== 'berakhir' && (
                  <Button size="small" onClick={() => handleEnd(record)}>
                    Akhiri
                  </Button>
                )}
                <Button size="small" danger onClick={() => handleDelete(record)}>
                  Hapus
                </Button>
              </Space>
            ),
          },
        ]}
      />

      {/* Modal Tambah */}
      <Modal
        title="Tambah Penugasan"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={handleAdd}
        confirmLoading={createMutation.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          initialValues={{ tipe_penugasan: 'definitif', start_date: dayjs() }}
          onValuesChange={(changed) => {
            if ('jabatan_id' in changed) {
              const node = findJabatanNode(tree, changed.jabatan_id);
              const tipe = form.getFieldValue('tipe_penugasan');
              if ((tipe === 'plt' && !node?.allow_plt) || (tipe === 'plh' && !node?.allow_plh)) {
                form.setFieldValue('tipe_penugasan', 'definitif');
              }
            }
            if ('tipe_penugasan' in changed && changed.tipe_penugasan !== 'definitif') {
              form.setFieldValue('is_primary', false);
            }
          }}
        >
          <Form.Item name="jabatan_id" label="Jabatan" rules={[{ required: true, message: 'Wajib dipilih' }]}>
            <JabatanTreeSelect tree={tree} onlyActive placeholder="Pilih jabatan" />
          </Form.Item>

          <Form.Item name="tipe_penugasan" label="Tipe Penugasan">
            <Radio.Group>
              <Radio value="definitif">Definitif</Radio>
              <Radio value="plt" disabled={!allowPlt}>Plt</Radio>
              <Radio value="plh" disabled={!allowPlh}>Plh</Radio>
            </Radio.Group>
          </Form.Item>
          {!allowPlt && !allowPlh && (
            <Typography.Text type="secondary" className="block -mt-3 mb-3">
              Jabatan ini tidak mengizinkan Plt maupun Plh.
            </Typography.Text>
          )}
          {!allowPlt && allowPlh && (
            <Typography.Text type="secondary" className="block -mt-3 mb-3">
              Jabatan ini tidak mengizinkan Plt.
            </Typography.Text>
          )}
          {allowPlt && !allowPlh && (
            <Typography.Text type="secondary" className="block -mt-3 mb-3">
              Jabatan ini tidak mengizinkan Plh.
            </Typography.Text>
          )}
          {tipePenugasan === 'plt' && (
            <Typography.Text type="secondary" className="block -mt-3 mb-3">
              Plt ditunjuk ketika jabatan kosong (pejabat definitif berhalangan tetap).
            </Typography.Text>
          )}
          {tipePenugasan === 'plh' && (
            <Typography.Text type="secondary" className="block -mt-3 mb-3">
              Plh ditunjuk ketika pejabat definitif/Plt berhalangan sementara, misalnya cuti.
            </Typography.Text>
          )}

          {tipePenugasan === 'definitif' && (
            <Form.Item name="is_primary" label="Jadikan jabatan utama" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}

          <Form.Item name="start_date" label="Tanggal Mulai" rules={[{ required: true, message: 'Wajib diisi' }]}>
            <DatePicker className="w-full" format={DISPLAY_DATE_FORMAT} />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Tanggal Selesai"
            dependencies={['start_date', 'tipe_penugasan']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('tipe_penugasan') === 'plh' && !value) {
                    return Promise.reject(new Error('Tanggal selesai wajib diisi untuk Plh'));
                  }
                  if (value && getFieldValue('start_date') && value.isBefore(getFieldValue('start_date'))) {
                    return Promise.reject(new Error('Tidak boleh sebelum tanggal mulai'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker className="w-full" format={DISPLAY_DATE_FORMAT} />
          </Form.Item>

          <Form.Item name="nomor_sk" label="Nomor SK">
            <Input />
          </Form.Item>

          <Form.Item name="keterangan" label="Keterangan">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Ubah */}
      <Modal
        title="Ubah Penugasan"
        open={!!editTarget}
        onCancel={() => setEditTarget(null)}
        onOk={handleEdit}
        confirmLoading={updateMutation.isPending}
        destroyOnClose
      >
        {editTarget && (
          <Form form={editForm} layout="vertical" className="mt-4">
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message={`${editTarget.jabatan_name} — ${editTarget.tipe_penugasan.toUpperCase()}`}
              description='Untuk mengganti jabatan atau tipe, akhiri penugasan ini lalu buat penugasan baru.'
            />
            {editTarget.tipe_penugasan === 'definitif' && (
              <Form.Item name="is_primary" label="Jadikan jabatan utama" valuePropName="checked">
                <Switch />
              </Form.Item>
            )}
            <Form.Item name="start_date" label="Tanggal Mulai" rules={[{ required: true, message: 'Wajib diisi' }]}>
              <DatePicker className="w-full" format={DISPLAY_DATE_FORMAT} />
            </Form.Item>
            <Form.Item name="end_date" label="Tanggal Selesai">
              <DatePicker className="w-full" format={DISPLAY_DATE_FORMAT} allowClear />
            </Form.Item>
            <Form.Item name="nomor_sk" label="Nomor SK">
              <Input />
            </Form.Item>
            <Form.Item name="keterangan" label="Keterangan">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Card>
  );
}
