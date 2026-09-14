import { Tag } from 'antd';
import { formatDate } from '../../utils/date';

interface AvailabilityTagProps {
  available: boolean;
  until?: string | null;
}

export default function AvailabilityTag({ available, until }: AvailabilityTagProps) {
  if (available) return null;
  return (
    <Tag color="orange">Tidak tersedia{until ? ` s.d. ${formatDate(until)}` : ''}</Tag>
  );
}
