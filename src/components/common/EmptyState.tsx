import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  description = 'Tidak ada data',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <Empty
      description={description}
      className="py-12"
    >
      {actionText && onAction && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
}
