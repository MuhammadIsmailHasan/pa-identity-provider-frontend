import { Form, Input, InputNumber, Select, Switch, type FormInstance } from 'antd';
import JabatanTreeSelect from '../../../components/jabatan/JabatanTreeSelect';
import { TIPE_JABATAN_LABEL } from '../../../config/labels';
import type { JabatanTreeNode } from '../../../types/jabatan';

const KODE_PATTERN = /^[a-z0-9_]+$/;
const TIPE_OPTIONS = Object.entries(TIPE_JABATAN_LABEL).map(([value, label]) => ({ value, label }));

interface JabatanFormFieldsProps {
  form: FormInstance;
  mode: 'create' | 'edit';
  tree?: JabatanTreeNode[];
}

export default function JabatanFormFields({ form, mode, tree }: JabatanFormFieldsProps) {
  const isPejabat = Form.useWatch('is_pejabat', form);

  return (
    <>
      <Form.Item name="name" label="Nama Jabatan" rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="cth. Kepala Bagian Kepegawaian" />
      </Form.Item>

      <Form.Item
        name="kode"
        label="Kode"
        rules={[{ pattern: KODE_PATTERN, message: 'Kode hanya boleh berisi huruf kecil, angka, dan garis bawah' }]}
        extra={
          mode === 'create'
            ? 'Kosongkan untuk dibuat otomatis dari nama'
            : 'Kode dipakai aplikasi client untuk sinkronisasi. Hindari mengubah kode jabatan yang sudah dipakai.'
        }
      >
        <Input placeholder="cth. kabag_kepegawaian" />
      </Form.Item>

      <Form.Item name="description" label="Deskripsi">
        <Input placeholder="Deskripsi jabatan..." />
      </Form.Item>

      <Form.Item
        name="kelompok"
        label="Kelompok"
        rules={[{ pattern: KODE_PATTERN, message: 'Kode hanya boleh berisi huruf kecil, angka, dan garis bawah' }]}
        extra="Isi sama untuk jabatan yang sama dengan jenis pegawai berbeda, mis. arsiparis"
      >
        <Input placeholder="cth. arsiparis" />
      </Form.Item>

      <Form.Item name="tipe" label="Tipe Pegawai" extra="Jenis pegawai pemegang jabatan. Kosongkan untuk jabatan pengelompokan.">
        <Select allowClear options={TIPE_OPTIONS} placeholder="Pilih tipe" />
      </Form.Item>

      <Form.Item
        name="is_pejabat"
        label="Pejabat"
        valuePropName="checked"
        extra="Jabatan pejabat hanya boleh memiliki satu pejabat definitif."
      >
        <Switch
          onChange={(checked) => {
            if (!checked) {
              form.setFieldValue('allow_plt', false);
              form.setFieldValue('allow_plh', false);
            }
          }}
        />
      </Form.Item>

      <Form.Item name="allow_plt" label="Izinkan Plt" valuePropName="checked">
        <Switch disabled={!isPejabat} />
      </Form.Item>

      <Form.Item name="allow_plh" label="Izinkan Plh" valuePropName="checked">
        <Switch disabled={!isPejabat} />
      </Form.Item>

      <Form.Item name="urutan" label="Urutan" initialValue={0}>
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      {mode === 'create' && (
        <Form.Item name="parent_id" label="Jabatan Induk (Atasan Langsung)">
          <JabatanTreeSelect tree={tree || []} placeholder="Pilih atasan (kosongkan jika posisi puncak)" />
        </Form.Item>
      )}

      {mode === 'edit' && (
        <Form.Item name="is_active" label="Aktif" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}
    </>
  );
}
