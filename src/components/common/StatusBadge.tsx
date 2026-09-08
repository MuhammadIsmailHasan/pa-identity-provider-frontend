import { Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface StatusBadgeProps {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
}

export default function StatusBadge({
  active,
  activeText = 'Aktif',
  inactiveText = 'Nonaktif',
}: StatusBadgeProps) {
  return active ? (
    <Tag icon={<CheckCircleOutlined />} color="success">{activeText}</Tag>
  ) : (
    <Tag icon={<CloseCircleOutlined />} color="error">{inactiveText}</Tag>
  );
}
