import TipePenugasanTag from './TipePenugasanTag';
import type { JabatanInfo } from '../../types/employee';

interface JabatanSummaryProps {
  jabatan: JabatanInfo[];
}

export default function JabatanSummary({ jabatan }: JabatanSummaryProps) {
  if (jabatan.length === 0) {
    return <span className="text-gray-300">-</span>;
  }

  const primary = jabatan.find((j) => j.is_primary && j.tipe_penugasan === 'definitif');
  const others = jabatan.filter((j) => j !== primary);

  return (
    <div>
      {primary && <div>{primary.name}</div>}
      {others.map((j) => (
        <div key={j.id + '-' + j.tipe_penugasan} className="text-xs">
          <TipePenugasanTag tipe={j.tipe_penugasan} /> {j.name}
        </div>
      ))}
      {!primary && others.length === 0 && <span className="text-gray-300">-</span>}
    </div>
  );
}
