import { useState, useEffect } from 'react';
import { Modal, Alert, Form, Input, Button, App } from 'antd';
import { useDeleteOAuthClient } from '../../../../hooks/useClients';
import { getErrorMessage } from '../../../../utils/apiError';
import type { OAuthClient } from '../../../../types/oauth';

interface DeleteClientModalProps {
  open: boolean;
  client: OAuthClient | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteClientModal({ open, client, onClose, onSuccess }: DeleteClientModalProps) {
  const { message: msg } = App.useApp();
  const [confirmText, setConfirmText] = useState('');
  const deleteMutation = useDeleteOAuthClient();

  useEffect(() => {
    if (open) {
      setConfirmText('');
    }
  }, [open]);

  if (!client) return null;

  const isMatched = confirmText === client.app_name;

  const handleDelete = async () => {
    if (!isMatched) return;
    try {
      await deleteMutation.mutateAsync(client.id);
      msg.success(`Aplikasi '${client.app_name}' berhasil dihapus permanen`);
      onClose();
      onSuccess?.();
    } catch (err) {
      msg.error(getErrorMessage(err, 'Gagal menghapus aplikasi client'));
    }
  };

  return (
    <Modal
      title="Hapus Permanen Aplikasi Client"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Batal
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          disabled={!isMatched}
          loading={deleteMutation.isPending}
          onClick={handleDelete}
        >
          Hapus Permanen
        </Button>,
      ]}
    >
      <div className="space-y-4 py-2">
        <Alert
          type="error"
          showIcon
          message="Tindakan ini tidak dapat dibatalkan"
          description="Role aplikasi, pemetaan jabatan, dan role pegawai untuk aplikasi ini ikut dihapus. Aplikasi yang masih memakai client ID ini tidak akan dapat login maupun sinkronisasi."
        />
        <Form layout="vertical">
          <Form.Item
            label={
              <span>
                Ketik nama aplikasi <strong>{client.app_name}</strong> untuk konfirmasi
              </span>
            }
          >
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={client.app_name}
              autoFocus
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
