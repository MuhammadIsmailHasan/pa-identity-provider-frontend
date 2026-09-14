import { Tag } from 'antd';
import { TIPE_PENUGASAN_COLOR, TIPE_PENUGASAN_LABEL } from '../../config/labels';
import type { TipePenugasan } from '../../types/enums';

interface TipePenugasanTagProps {
  tipe: TipePenugasan;
}

export default function TipePenugasanTag({ tipe }: TipePenugasanTagProps) {
  return <Tag color={TIPE_PENUGASAN_COLOR[tipe]}>{TIPE_PENUGASAN_LABEL[tipe]}</Tag>;
}
