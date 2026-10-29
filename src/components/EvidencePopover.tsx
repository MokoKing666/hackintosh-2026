import { useEffect, useRef, useState } from 'react';
import { EVIDENCE_GRADE_LABEL, getEvidence, strongestGrade } from '@/domain/evidence';

const GRADE_SHORT: Record<string, string> = {
  official: '官方文档',
  upstream: '上游代码',
  reproducible: '可复现测试',
  community: '社区报告',
  'vendor-claim': '项目方声明',
  inference: '推断',
};

/**
 * 第三层披露：证据胶囊 + 浮层。
 * 默认只显示「最强证据等级 + 条数」，点击才展开完整来源，避免污染主阅读流。
 */
export function EvidencePopover({
  ids,
  label = '证据',
}: {
  ids: readonly string[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!ids.length) return null;
  const grade = strongestGrade(ids);

  return (
    <div className="popover-wrap" ref={wrapRef}>
      <button
        type="button"
        className="evidence-chip"
        aria-expanded={open}
        aria-label={`${label}：${GRADE_SHORT[grade]}，共 ${ids.length} 条来源`}
        onClick={() => setOpen((v) => !v)}
        style={{ ['--ev-color' as string]: `var(--ev-${grade})` }}
      >
        <span className="evidence-chip__dot" aria-hidden="true" />
        {GRADE_SHORT[grade]} · {ids.length}
      </button>

      {open && (
        <div className="popover" role="dialog" aria-label={`${label}详情`}>
          <div className="popover__head">
            <span className="popover__title">{label} · 核验 2026-10-29</span>
            <button
              type="button"
              className="popover__close"
              aria-label="关闭证据浮层"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          <ul className="evidence-list">
            {ids.map((id) => {
              const e = getEvidence(id);
              return (
                <li key={id}>
                  <div className="evidence-list__meta">
                    <span
                      style={{ ['--ev-color' as string]: `var(--ev-${e.grade})` }}
                      className="evidence-chip__dot"
                      aria-hidden="true"
                    />
                    <span>{EVIDENCE_GRADE_LABEL[e.grade]}</span>
                    {e.version && <span>· {e.version}</span>}
                    <span>· {e.checkedAt}</span>
                  </div>
                  <span className="evidence-list__title">
                    {e.url ? (
                      <a href={e.url} target="_blank" rel="noreferrer noopener">
                        {e.title}
                      </a>
                    ) : (
                      e.title
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
