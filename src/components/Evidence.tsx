import { getEvidence, EVIDENCE_GRADE_LABEL, strongestGrade } from '@/domain/evidence';
import type { Evidence } from '@/domain/types';

const LEVEL: Record<Evidence['grade'], number> = {
  official: 4,
  upstream: 3,
  reproducible: 3,
  community: 2,
  'vendor-claim': 1,
  inference: 1,
};

const SHORT: Record<Evidence['grade'], string> = {
  official: 'O',
  upstream: 'U',
  reproducible: 'R',
  community: 'C',
  'vendor-claim': 'V',
  inference: 'I',
};

export function EvidenceMeter({
  grade,
  showLabel = true,
}: {
  grade: Evidence['grade'];
  showLabel?: boolean;
}) {
  const on = LEVEL[grade];
  return (
    <span
      className={`evidence-meter evidence-meter--${grade}`}
      title={`证据等级：${EVIDENCE_GRADE_LABEL[grade]}`}
    >
      <span className="evidence-meter__bars" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <i key={i} data-on={i <= on} />
        ))}
      </span>
      {showLabel && (
        <span className="evidence-meter__label">
          {SHORT[grade]} · {EVIDENCE_GRADE_LABEL[grade]}
        </span>
      )}
    </span>
  );
}

export function EvidenceList({ ids }: { ids: readonly string[] }) {
  if (!ids.length) return null;
  return (
    <ul className="evidence-list">
      {ids.map((id) => {
        const e = getEvidence(id);
        return (
          <li key={id}>
            <EvidenceMeter grade={e.grade} showLabel={false} />
            <span>
              {e.url ? (
                <a href={e.url} target="_blank" rel="noreferrer noopener">
                  {e.title}
                </a>
              ) : (
                e.title
              )}
              <span className="faint">
                {' · '}
                {EVIDENCE_GRADE_LABEL[e.grade]}
                {e.version ? ` · ${e.version}` : ''}
                {e.status === 'link-rot' ? ' · 链接失效' : ''}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function StrongestEvidence({ ids }: { ids: readonly string[] }) {
  if (!ids.length) return null;
  return <EvidenceMeter grade={strongestGrade(ids)} />;
}

export function SourceList({ ids }: { ids: readonly string[] }) {
  if (!ids.length) return null;
  const seen = new Set<string>();
  const list = ids.filter((id) => (seen.has(id) ? false : (seen.add(id), true)));
  return (
    <div className="sources">
      <span>来源（核验日期 2026-10-29）</span>
      <ol>
        {list.map((id) => {
          const e = getEvidence(id);
          return (
            <li key={id}>
              {e.url ? (
                <a href={e.url} target="_blank" rel="noreferrer noopener">
                  {e.title}
                </a>
              ) : (
                e.title
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
