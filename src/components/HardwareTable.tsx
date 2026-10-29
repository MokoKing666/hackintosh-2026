import type { HardwareRecord } from '@/domain/types';
import { DataTable } from './DataTable';
import type { Column } from './DataTable';
import { VerdictBadge } from './VerdictBadge';
import { StrongestEvidence } from './Evidence';

function osText(h: HardwareRecord): string {
  if (!h.os.max && !h.os.min) return '—';
  if (h.os.max && !h.os.min) return `≤ ${h.os.max}`;
  if (h.os.min && !h.os.max) return `≥ ${h.os.min}`;
  return `${h.os.min} – ${h.os.max}`;
}

const columns: Column<HardwareRecord>[] = [
  {
    key: 'name',
    header: '型号',
    render: (h) => <strong>{h.name}</strong>,
    sortValue: (h) => h.name,
  },
  {
    key: 'verdict',
    header: '状态',
    render: (h) => <VerdictBadge verdict={h.verdict} />,
    sortValue: (h) => h.verdict,
    width: '116px',
  },
  {
    key: 'os',
    header: '系统',
    render: (h) => <span className="mono-num">{osText(h)}</span>,
    sortValue: (h) => h.os.max ?? '',
    width: '92px',
  },
  {
    key: 'evidence',
    header: '证据',
    render: (h) => <StrongestEvidence ids={h.evidenceIds} />,
    width: '150px',
  },
  { key: 'summary', header: '结论', render: (h) => h.summary },
];

export function HardwareTable({
  rows,
  label,
  caption,
}: {
  rows: readonly HardwareRecord[];
  label: string;
  caption?: React.ReactNode;
}) {
  return (
    <DataTable
      label={label}
      rows={rows}
      columns={columns}
      rowKey={(h) => h.id}
      initialSort={{ key: 'name', dir: 'asc' }}
      caption={caption}
    />
  );
}
