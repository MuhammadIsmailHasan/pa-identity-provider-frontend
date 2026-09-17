import { useEffect } from 'react';
import { App, Modal, Form, Select, DatePicker, Alert } from 'antd';
import dayjs from 'dayjs';
import { useChangeEmployeeStatus } from '../../hooks/useEmployees';
import { STATUS_KEPEGAWAIAN_LABEL } from '../../config/labels';
import { DISPLAY_DATE_FORMAT, toApiDate } from '../../utils/date';
import { getErrorMessage } from '../../utils/apiError';
import type { Employee, EmployeeStatusUpdate } from '../../types/employee';
import type { StatusKepegawaian } from '../../types/enums';

interface StatusChangeModalProps {
  open: boolean;
  employee: Employee | null;
  onClose: () => void;
}

const STATUS_OPTIONS = Object.entries(STATUS_KEPEGAWAIAN_LABEL).map(([value, label]) => ({ value, label }));

export default function StatusChangeModal({ open, employee, onClose }: StatusChangeModalProps) {
  const { message: msg } = App.useApp();
  const [form] = Form.useForm();
  const changeStatus = useChangeEmployeeStatus();
  const selectedStatus: StatusKepegawaian | undefined = Form.useWatch('status_kepegawaian', form);

  useEffect(() => {
    if (open && employee) {
      form.setFieldsValue({
        status_kepegawaian: employee.status_kepegawaian,
        tanggal_status: dayjs(),
      });
    }
  }, [open, employee, form]);

  if (!employee) return null;

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const data: EmployeeStatusUpdate = {
      status_kepegawaian: values.status_kepegawaian,
      tanggal_status: toApiDate(values.tanggal_status),
    };
    try {
      await changeStatus.mutateAsync({ id: employee.id, data });
      msg.success('Status pegawai berhasil diperbarui');
      onClose();
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal memperbarui status pegawai'));
    }
  };

  return (
    <Modal
      title={`Ubah Status — ${employee.name}`}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={changeStatus.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="status_kepegawaian" label="Status Kepegawaian" rules={[{ required: true }]}>
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
        <Form.Item name="tanggal_status" label="Tanggal Status" rules={[{ required: true }]}>
          <DatePicker format={DISPLAY_DATE_FORMAT} className="w-full" />
        </Form.Item>
        {selectedStatus && selectedStatus !== 'aktif' && (
          <Alert
            type="warning"
            showIcon
            className="mb-4"
            message="Pegawai tidak akan dapat login ke seluruh aplikasi. Penugasan yang masih berjalan akan diakhiri pada tanggal status, dan penugasan yang belum dimulai akan dihapus."
          />
        )}
        {employee.status_kepegawaian !== 'aktif' && selectedStatus === 'aktif' && (
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message="Akun akan aktif kembali, tetapi penugasan jabatan tidak dipulihkan otomatis."
          />
        )}
      </Form>
    </Modal>
  );
}
