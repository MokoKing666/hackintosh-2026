import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import {
  PROJECTS,
  DEAD_PROJECTS,
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  CODE_OPEN_LABEL,
  REPRODUCIBILITY_LABEL,
} from '@/domain/projects';
import { CLAIMS, CORRECTIONS } from '@/domain/claims';
import { getEvidence, EVIDENCE_GRADE_LABEL } from '@/domain/evidence';
import { VERDICT_LABEL } from '@/domain/rules';
import { CATEGORY_LABEL, PLATFORM_LABEL } from '@/domain/labels';
import type { HardwareRecord, ProjectRecord } from '@/domain/types';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { ChipGroup, SearchBox } from '@/components/Toolbar';
import { VerdictBadge } from '@/components/VerdictBadge';
import { EvidenceList, StrongestEvidence } from '@/components/Evidence';

const TABS = [
  { id: 'hardware', label: '硬件矩阵' },
  { id: 'projects', label: '项目图谱' },
  { id: 'claims', label: '结论台账' },
  { id: 'dead', label: '已死与纠错' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const VERDICT_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'verified', label: '已验证' },
  { value: 'conditional', label: '有条件' },
  { value: 'experimental', label: '实验性' },
  { value: 'unverified', label: '未验证' },
  { value: 'incompatible', label: '不兼容' },
];

const PLATFORM_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'intel', label: 'Intel' },
  { value: 'amd', label: 'AMD' },
  { value: 'nvidia', label: 'NVIDIA' },
  { value: 'broadcom', label: 'Broadcom' },
  { value: 'intel-wifi', label: 'Intel 无线' },
  { value: 'realtek', label: 'Realtek' },
  { value: 'mediatek', label: 'MediaTek' },
  { value: 'arm', label: 'ARM' },
  { value: 'system', label: '系统 / 存储' },
];

const CATEGORY_FILTERS = [
  { value: 'all', label: '全部' },
  ...Object.entries(PROJECT_CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
];

const STATUS_FILTERS = [
  { value: 'all', label: '全部' },
  ...Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({ value, label })),
];

const osText = (h: HardwareRecord) => {
  if (!h.os.max && !h.os.min) return '—';
  if (h.os.max && !h.os.min) return `≤ ${h.os.max}`;
  if (h.os.min && !h.os.max) return `≥ ${h.os.min}`;
  return `${h.os.min} – ${h.os.max}`;
};

export function LibraryPage() {
  useDocumentTitle('资料库');
  const { tab: tabParam } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const tab: TabId = (TABS.find((t) => t.id === tabParam)?.id ?? 'hardware') as TabId;

  const [verdict, setVerdict] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [hwQuery, setHwQuery] = useState('');

  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [projQuery, setProjQuery] = useState('');

  const [claimQuery, setClaimQuery] = useState('');

  function setTab(next: TabId) {
    navigate(next === 'hardware' ? '/library' : `/library/${next}`);
  }

  const hardware = useMemo(() => {
    const q = hwQuery.trim().toLowerCase();
    return HARDWARE.filter(
      (h) =>
        (verdict === 'all' || h.verdict === verdict) &&
        (platform === 'all' || h.platform === platform) &&
        (!q || h.name.toLowerCase().includes(q) || h.summary.toLowerCase().includes(q)),
    );
  }, [verdict, platform, hwQuery]);

  const projects = useMemo(() => {
    const q = projQuery.trim().toLowerCase();
    return PROJECTS.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (status === 'all' || p.status === status) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.repo.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)),
    );
  }, [category, status, projQuery]);

  const claims = useMemo(() => {
    const q = claimQuery.trim().toLowerCase();
    return CLAIMS.filter(
      (c) =>
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.statement.toLowerCase().includes(q) ||
        c.scope.toLowerCase().includes(q),
    );
  }, [claimQuery]);

  const hwColumns: Column<HardwareRecord>[] = [
    {
      key: 'name',
      header: '硬件',
      render: (h) => <strong>{h.name}</strong>,
      sortValue: (h) => h.name,
    },
    {
      key: 'category',
      header: '类别',
      render: (h) => CATEGORY_LABEL[h.category],
      sortValue: (h) => h.category,
      width: '84px',
    },
    {
      key: 'platform',
      header: '平台',
      render: (h) => PLATFORM_LABEL[h.platform],
      sortValue: (h) => h.platform,
      width: '96px',
    },
    {
      key: 'verdict',
      header: '状态',
      render: (h) => <VerdictBadge verdict={h.verdict} />,
      sortValue: (h) => Object.keys(VERDICT_LABEL).indexOf(h.verdict),
      width: '116px',
    },
    {
      key: 'os',
      header: '系统',
      render: (h) => <span className="mono-num">{osText(h)}</span>,
      sortValue: (h) => h.os.max ?? '',
      width: '96px',
    },
    {
      key: 'evidence',
      header: '最强证据',
      render: (h) => <StrongestEvidence ids={h.evidenceIds} />,
      width: '150px',
    },
    { key: 'summary', header: '结论', render: (h) => h.summary },
  ];

  const projColumns: Column<ProjectRecord>[] = [
    {
      key: 'name',
      header: '项目',
      render: (p) => (
        <a href={p.url} target="_blank" rel="noreferrer noopener">
          {p.name}
        </a>
      ),
      sortValue: (p) => p.name,
    },
    {
      key: 'repo',
      header: '仓库',
      render: (p) => <span className="mono-num">{p.repo}</span>,
      sortValue: (p) => p.repo,
    },
    {
      key: 'stars',
      header: '★',
      align: 'right',
      render: (p) => p.stars.toLocaleString('zh-CN'),
      sortValue: (p) => p.stars,
      width: '80px',
    },
    {
      key: 'pushed',
      header: '最后提交',
      render: (p) => <span className="mono-num">{p.pushedAt}</span>,
      sortValue: (p) => p.pushedAt,
      width: '104px',
    },
    {
      key: 'status',
      header: '维护',
      render: (p) => PROJECT_STATUS_LABEL[p.status],
      sortValue: (p) => p.status,
      width: '72px',
    },
    {
      key: 'open',
      header: '代码',
      render: (p) => CODE_OPEN_LABEL[p.codeOpen],
      sortValue: (p) => p.codeOpen,
      width: '84px',
    },
    {
      key: 'repro',
      header: '可复现',
      render: (p) => REPRODUCIBILITY_LABEL[p.reproducibility],
      sortValue: (p) => p.reproducibility,
      width: '84px',
    },
    { key: 'desc', header: '作用', render: (p) => p.description },
  ];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">资料库</p>
          <h1>全部数据，可以查</h1>
          <p className="lead">
            {HARDWARE.length} 条硬件兼容记录、{PROJECTS.length} 个项目快照、{CLAIMS.length}{' '}
            条结论台账、
            {CORRECTIONS.length}{' '}
            条取证纠错。每条结论都能点回上游来源，拿不准的会明确标注「待核实」。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div
            className="chips"
            role="tablist"
            aria-label="资料库分类"
            style={{ marginBottom: 16 }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className="chip"
                aria-selected={tab === t.id}
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'hardware' && (
            <>
              <div className="toolbar toolbar--stack">
                <div className="toolbar__row">
                  <SearchBox
                    label="搜索"
                    value={hwQuery}
                    onChange={setHwQuery}
                    placeholder="型号或结论关键词"
                  />
                  <span className="toolbar__count">
                    {hardware.length} / {HARDWARE.length}
                  </span>
                </div>
                <ChipGroup
                  label="状态"
                  value={verdict}
                  options={VERDICT_FILTERS}
                  onChange={setVerdict}
                />
                <ChipGroup
                  label="平台"
                  value={platform}
                  options={PLATFORM_FILTERS}
                  onChange={setPlatform}
                />
              </div>
              <DataTable
                label="硬件兼容矩阵"
                rows={hardware}
                columns={hwColumns}
                rowKey={(h) => h.id}
                initialSort={{ key: 'name', dir: 'asc' }}
                empty={
                  <div className="empty">
                    <strong>没有匹配的硬件</strong>试试放宽状态或平台筛选。
                  </div>
                }
                caption={
                  <>
                    <span>
                      状态含义：已验证 = 无需补丁；有条件 = 需 kext 或配置；实验性 =
                      有代码但未成熟；未验证 = 缺可复现证据。
                    </span>
                  </>
                }
              />
            </>
          )}

          {tab === 'projects' && (
            <>
              <div className="toolbar toolbar--stack">
                <div className="toolbar__row">
                  <SearchBox
                    label="搜索"
                    value={projQuery}
                    onChange={setProjQuery}
                    placeholder="项目名或仓库"
                  />
                  <span className="toolbar__count">
                    {projects.length} / {PROJECTS.length}
                  </span>
                </div>
                <ChipGroup
                  label="类别"
                  value={category}
                  options={CATEGORY_FILTERS}
                  onChange={setCategory}
                />
                <ChipGroup
                  label="维护"
                  value={status}
                  options={STATUS_FILTERS}
                  onChange={setStatus}
                />
              </div>
              <DataTable
                label="开源项目图谱"
                rows={projects}
                columns={projColumns}
                rowKey={(p) => p.id}
                initialSort={{ key: 'stars', dir: 'desc' }}
                empty={
                  <div className="empty">
                    <strong>没有匹配的项目</strong>试试换一个类别。
                  </div>
                }
                caption={
                  <>
                    <span>star 与最后提交为 2026-10-29 的 GitHub API 快照。</span>
                    <span>「代码」与「可复现」是两个独立维度：有仓库不等于别人能跑起来。</span>
                  </>
                }
              />
            </>
          )}

          {tab === 'claims' && (
            <>
              <div className="toolbar toolbar--stack">
                <div className="toolbar__row">
                  <SearchBox
                    label="搜索"
                    value={claimQuery}
                    onChange={setClaimQuery}
                    placeholder="结论编号、关键词或适用范围"
                  />
                  <span className="toolbar__count">
                    {claims.length} / {CLAIMS.length}
                  </span>
                </div>
              </div>
              <div className="stack">
                {claims.map((c) => (
                  <article key={c.id} className="card">
                    <div className="card__head">
                      <span className="badge badge--neutral mono-num">{c.id}</span>
                      <h2 className="card__title">{c.statement}</h2>
                    </div>
                    <p className="card__body">适用范围：{c.scope}</p>
                    {c.limits && (
                      <p className="card__body" style={{ marginTop: 6 }}>
                        已知限制：{c.limits}
                      </p>
                    )}
                    <div style={{ marginTop: 10 }}>
                      <EvidenceList ids={c.evidenceIds} />
                    </div>
                    <p className="card__foot">
                      <span>{c.needsVerification ? '待进一步核实' : '已核实'}</span>
                      <span>核验日期 2026-10-29</span>
                    </p>
                  </article>
                ))}
                {!claims.length && (
                  <div className="empty">
                    <strong>没有匹配的结论</strong>换个关键词试试。
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'dead' && (
            <>
              <h2 style={{ marginBottom: 8 }}>已经死掉的项目</h2>
              <p className="small muted" style={{ marginBottom: 16 }}>
                归档或超过 18
                个月没有提交。它们大多不是失败，而是被更好的方案取代——看它们为什么死，比看它们怎么用更有信息量。
              </p>
              <DataTable
                label="已失效项目"
                rows={DEAD_PROJECTS}
                columns={[
                  {
                    key: 'name',
                    header: '项目',
                    render: (d) => <strong>{d.name}</strong>,
                    sortValue: (d) => d.name,
                  },
                  {
                    key: 'repo',
                    header: '仓库',
                    render: (d) => <span className="mono-num">{d.repo}</span>,
                    sortValue: (d) => d.repo,
                  },
                  {
                    key: 'stars',
                    header: '★',
                    align: 'right',
                    render: (d) => d.stars.toLocaleString('zh-CN'),
                    sortValue: (d) => d.stars,
                    width: '80px',
                  },
                  {
                    key: 'pushed',
                    header: '最后更新',
                    render: (d) => <span className="mono-num">{d.pushedAt}</span>,
                    sortValue: (d) => d.pushedAt,
                    width: '104px',
                  },
                  { key: 'reason', header: '为什么死了', render: (d) => d.reason },
                ]}
                rowKey={(d) => d.id}
                initialSort={{ key: 'pushed', dir: 'asc' }}
              />

              <h2 style={{ margin: '40px 0 8px' }}>取证纠错</h2>
              <p className="small muted" style={{ marginBottom: 16 }}>
                下面这些说法流传很广，但都能用上游仓库或官方文档直接证伪。收录在这里，是因为它们经常出现在教程和视频里。
              </p>
              <div className="stack">
                {CORRECTIONS.map((x) => (
                  <article key={x.id} className="card">
                    <div className="card__head">
                      <span className="badge badge--incompatible">
                        <span className="badge__mark" aria-hidden="true">
                          ✕
                        </span>
                        流传说法
                      </span>
                    </div>
                    <p
                      className="card__body"
                      style={{ textDecoration: 'line-through', color: 'var(--fg-tertiary)' }}
                    >
                      {x.claim}
                    </p>
                    <p className="card__body" style={{ marginTop: 8, color: 'var(--fg-primary)' }}>
                      实际：{x.correction}
                    </p>
                    <div style={{ marginTop: 10 }}>
                      <EvidenceList ids={x.evidenceIds} />
                    </div>
                  </article>
                ))}
              </div>

              <h2 style={{ margin: '40px 0 8px' }}>证据索引</h2>
              <p className="small muted" style={{ marginBottom: 16 }}>
                全站引用的{' '}
                {
                  new Set(
                    HARDWARE.flatMap((h) => h.evidenceIds).concat(
                      PROJECTS.flatMap((p) => p.evidenceIds),
                    ),
                  ).size
                }{' '}
                个来源， 按等级排列。官方文档与上游代码优先，推断类证据单独标注。
              </p>
              <div className="stack">
                {[
                  ...new Set(
                    HARDWARE.flatMap((h) => h.evidenceIds).concat(
                      PROJECTS.flatMap((p) => p.evidenceIds),
                      CLAIMS.flatMap((c) => c.evidenceIds),
                    ),
                  ),
                ]
                  .map((id) => getEvidence(id))
                  .sort((a, b) =>
                    EVIDENCE_GRADE_LABEL[a.grade].localeCompare(EVIDENCE_GRADE_LABEL[b.grade]),
                  )
                  .map((e) => (
                    <div key={e.id} className="card">
                      <div className="card__head">
                        <span className="badge badge--neutral mono-num">{e.id}</span>
                        <span className="card__title" style={{ fontSize: '0.9375rem' }}>
                          {e.title}
                        </span>
                      </div>
                      <p className="card__body">
                        {EVIDENCE_GRADE_LABEL[e.grade]}
                        {e.version ? ` · ${e.version}` : ''}
                        {e.publisher ? ` · ${e.publisher}` : ''}
                        {' · 核验 '}
                        {e.checkedAt}
                      </p>
                      {e.url && (
                        <p className="small" style={{ marginTop: 4 }}>
                          <a href={e.url} target="_blank" rel="noreferrer noopener">
                            {e.url}
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
