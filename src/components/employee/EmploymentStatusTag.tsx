import { Tag } from 'antd';
import { STATUS_KEPEGAWAIAN_COLOR, STATUS_KEPEGAWAIAN_LABEL } from '../../config/labels';
import type { StatusKepegawaian } from '../../types/enums';

interface EmploymentStatusTagProps {
  status: StatusKepegawaian;
}

export default function EmploymentStatusTag({ status }: EmploymentStatusTagProps) {
  return <Tag color={STATUS_KEPEGAWAIAN_COLOR[status]}>{STATUS_KEPEGAWAIAN_LABEL[status]}</Tag>;
}
