import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE, getHardware } from '@/domain/hardware';
import { BOARDS } from '@/domain/boards';
import {
  solve,
  VERDICT_LABEL,
  VERDICT_MEANING,
  SEVERITY_LABEL,
  CONFIDENCE_LABEL,
} from '@/domain/rules';
import type { BuildInput, BuildRoute, MacOsVersion, Severity } from '@/domain/types';
import { VerdictBadge } from '@/components/VerdictBadge';
import { EvidencePopover } from '@/components/EvidencePopover';

const OS_OPTIONS: Array<{ value: MacOsVersion; label: string }> = [
  { value: '27', label: 'macOS 27 Golden Gate' },
  { value: '26.7', label: 'macOS 26.7 Tahoe（x86 上限）' },
  { value: '26', label: 'macOS 26 Tahoe' },
  { value: '15', label: 'macOS 15 Sequoia' },
  { value: '14', label: 'macOS 14 Sonoma' },
];

const ROUTES: Array<{ value: BuildRoute; label: string; platforms: string[] }> = [
  { value: 'bare-metal', label: '裸机安装', platforms: ['intel', 'amd'] },
  { value: 'vm', label: 'KVM 虚拟机', platforms: ['intel', 'amd'] },
  { value: 'arm-experiment', label: 'ARM 实验路线', platforms: ['arm'] },
];

const SEVERITY_ORDER: Severity[] = ['blocker', 'required', 'risk', 'info'];
const SEVERITY_MARK: Record<Severity, string> = {
  blocker: '×',
  required: '●',
  risk: '△',
  info: 'i',
};

function defaultsFor(platform: BuildInput['platform']): BuildInput {
  const common = {
    nvmeId: 'ssd-sn850',
    acceptOclp: true,
    allowExperimental: false,
  };
  if (platform === 'arm') {
    return {
      platform,
      cpuId: 'arm-snapintosh',
      gpuId: null,
      boardId: 'board-arm',
      wifiId: 'wifi-bcm94360',
      audioId: 'audio-usb',
      targetOs: '27',
      route: 'arm-experiment',
      ...common,
    };
  }
  return {
    platform,
    cpuId: platform === 'intel' ? 'cpu-intel-comet' : 'cpu-amd-zen3',
    gpuId: 'gpu-rx6600',
    boardId: platform === 'intel' ? 'board-z490' : 'board-b550',
    wifiId: 'wifi-bcm94360',
    audioId: 'audio-alc',
    targetOs: '26.7',
    route: 'bare-metal',
    ...common,
  };
}

function readParams(params: URLSearchParams): BuildInput {
  const platform = (params.get('platform') as BuildInput['platform']) ?? 'intel';
  const base = defaultsFor(['intel', 'amd', 'arm'].includes(platform) ? platform : 'intel');
  const os = params.get('os') as MacOsVersion | null;
  const route = params.get('route') as BuildRoute | null;
  return {
    platform: base.platform,
    cpuId: params.get('cpu') ?? base.cpuId,
    gpuId: params.get('gpu') ?? base.gpuId,
    boardId: params.get('board') ?? base.boardId,
    wifiId: params.get('wifi') ?? base.wifiId,
    audioId: params.get('audio') ?? base.audioId,
    nvmeId: params.get('nvme') ?? base.nvmeId,
    targetOs: os && OS_OPTIONS.some((o) => o.value === os) ? os : base.targetOs,
    route: route && ROUTES.some((r) => r.value === route) ? route : base.route,
    acceptOclp: params.get('oclp') !== '0',
    allowExperimental: params.get('exp') === '1',
  };
}

export function GeneratorPage() {
  useDocumentTitle('配置生成器');
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState<BuildInput>(() => readParams(params));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set('platform', input.platform);
    if (input.cpuId) next.set('cpu', input.cpuId);
    if (input.gpuId) next.set('gpu', input.gpuId);
    if (input.boardId) next.set('board', input.boardId);
    if (input.wifiId) next.set('wifi', input.wifiId);
    if (input.audioId) next.set('audio', input.audioId);
    if (input.nvmeId) next.set('nvme', input.nvmeId);
    next.set('os', input.targetOs);
    next.set('route', input.route);
    if (!input.acceptOclp) next.set('oclp', '0');
    if (input.allowExperimental) next.set('exp', '1');
    setParams(next, { replace: true });
  }, [input, setParams]);

  const result = useMemo(() => solve(input), [input]);

  const cpus = HARDWARE.filter((h) => h.category === 'cpu' && h.platform === input.platform);
  const boards = BOARDS.filter((b) => b.vendor === input.platform);
  const gpus = HARDWARE.filter(
    (h) => h.category === 'dgpu' || h.category === 'igpu' || h.category === 'apu',
  );
  const wifis = HARDWARE.filter((h) => h.category === 'wifi');
  const audios = HARDWARE.filter((h) => h.category === 'audio');
  const nvmes = HARDWARE.filter((h) => h.category === 'storage');

  const grouped = SEVERITY_ORDER.map((severity) => ({
    severity,
    items: result.findings.filter((f) => f.severity === severity),
  })).filter((g) => g.items.length > 0);

  const evidenceIds = [...new Set(result.findings.flatMap((f) => f.evidenceIds))];

  function patch(partial: Partial<BuildInput>) {
    setInput((prev) => ({ ...prev, ...partial }));
  }

  async function copySummary() {
    const cpu = input.cpuId ? getHardware(input.cpuId) : null;
    const lines = [
      `【黑苹果可行性评估】${VERDICT_LABEL[result.verdict]}（置信度：${CONFIDENCE_LABEL[result.confidence]}）`,
      `平台：${input.platform} / CPU：${cpu?.name ?? '未选'}`,
      `路线：${ROUTES.find((r) => r.value === input.route)?.label ?? input.route}`,
      `目标系统：macOS ${input.targetOs}`,
      `系统上限：macOS ${result.osCap.max ?? '未知'}${result.osCap.beta ? ' Beta' : ''}`,
      '',
      ...grouped.flatMap((g) => [
        `${SEVERITY_LABEL[g.severity]}：`,
        ...g.items.map((i) => `  · ${i.text}`),
        '',
      ]),
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">配置生成器</p>
          <h1 className="page-title">黑苹果可行性评估引擎。</h1>
          <p className="lead">
            输入你的硬件组合与目标系统版本，基于确定性纯函数规则引擎生成兼容性诊断报告。
            我们绝不把「未知」伪装成「可用」——每一项阻断冲突、必要补丁与存疑推断，均附带明确的技术解释与证据链接。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="builder">
            <form className="builder__form" onSubmit={(e) => e.preventDefault()}>
              <div className="field">
                <label className="field__label" htmlFor="f-platform">
                  平台
                </label>
                <select
                  id="f-platform"
                  className="select"
                  value={input.platform}
                  onChange={(e) => setInput(defaultsFor(e.target.value as BuildInput['platform']))}
                >
                  <option value="intel">Intel x86</option>
                  <option value="amd">AMD x86</option>
                  <option value="arm">ARM（实验）</option>
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="f-route">
                  运行路线
                </label>
                <select
                  id="f-route"
                  className="select"
                  value={input.route}
                  onChange={(e) => patch({ route: e.target.value as BuildRoute })}
                >
                  {ROUTES.filter((r) => r.platforms.includes(input.platform)).map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="f-os">
                  目标系统
                </label>
                <select
                  id="f-os"
                  className="select"
                  value={input.targetOs}
                  onChange={(e) => patch({ targetOs: e.target.value as MacOsVersion })}
                >
                  {OS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="f-cpu">
                  {input.platform === 'arm' ? 'ARM 设备' : 'CPU'}
                </label>
                <select
                  id="f-cpu"
                  className="select"
                  value={input.cpuId ?? ''}
                  onChange={(e) => patch({ cpuId: e.target.value })}
                >
                  {cpus.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="f-board">
                  主板 / 整机
                </label>
                <select
                  id="f-board"
                  className="select"
                  value={input.boardId ?? ''}
                  onChange={(e) => patch({ boardId: e.target.value })}
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {input.platform !== 'arm' && (
                <div className="field">
                  <label className="field__label" htmlFor="f-gpu">
                    显卡 / 核显
                  </label>
                  <select
                    id="f-gpu"
                    className="select"
                    value={input.gpuId ?? ''}
                    onChange={(e) => patch({ gpuId: e.target.value || null })}
                  >
                    <option value="">未确定</option>
                    {gpus.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field">
                <label className="field__label" htmlFor="f-wifi">
                  无线网卡
                </label>
                <select
                  id="f-wifi"
                  className="select"
                  value={input.wifiId ?? ''}
                  onChange={(e) => patch({ wifiId: e.target.value || null })}
                >
                  <option value="">未确定</option>
                  {wifis.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="f-audio">
                  音频
                </label>
                <select
                  id="f-audio"
                  className="select"
                  value={input.audioId ?? ''}
                  onChange={(e) => patch({ audioId: e.target.value || null })}
                >
                  <option value="">未确定</option>
                  {audios.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="f-nvme">
                  NVMe 硬盘
                </label>
                <select
                  id="f-nvme"
                  className="select"
                  value={input.nvmeId ?? ''}
                  onChange={(e) => patch({ nvmeId: e.target.value || null })}
                >
                  <option value="">未确定</option>
                  {nvmes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <label
                className="field"
                style={{
                  gridTemplateColumns: 'auto 1fr',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <input
                  type="checkbox"
                  checked={input.acceptOclp}
                  onChange={(e) => patch({ acceptOclp: e.target.checked })}
                />
                <span className="small">接受 OCLP 根补丁（会降低 SIP）</span>
              </label>

              <label
                className="field"
                style={{
                  gridTemplateColumns: 'auto 1fr',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <input
                  type="checkbox"
                  checked={input.allowExperimental}
                  onChange={(e) => patch({ allowExperimental: e.target.checked })}
                />
                <span className="small">接受第三方实验驱动</span>
              </label>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn--primary" onClick={copySummary}>
                  {copied ? '已复制' : '复制清单'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setInput(defaultsFor(input.platform))}
                >
                  重置
                </button>
              </div>
              <p className="caption">选择状态写入地址栏，可直接分享给他人复现同一份结论。</p>
            </form>

            <div className="builder__result" aria-live="polite">
              <div className="verdict-panel">
                <div>
                  <p className="verdict-panel__label">总体判定</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <span className="verdict-panel__title">{VERDICT_LABEL[result.verdict]}</span>
                    <VerdictBadge
                      verdict={result.verdict}
                      label={CONFIDENCE_LABEL[result.confidence]}
                    />
                  </div>
                  <p className="verdict-panel__desc">{VERDICT_MEANING[result.verdict]}</p>
                </div>
                <div className="verdict-panel__cap">
                  可用系统上限
                  <b>
                    {result.osCap.max ? `macOS ${result.osCap.max}` : '—'}
                    {result.osCap.beta ? ' Beta' : ''}
                  </b>
                </div>
              </div>

              {result.missing.length > 0 && (
                <div className="callout callout--warn">
                  <strong>还需要确认：</strong>
                  {result.missing.join('、')}。补齐后结论会更准确。
                </div>
              )}

              {grouped.map((g) => (
                <div key={g.severity} className="finding-group">
                  <div className="finding-group__head">
                    <span className={`finding--${g.severity}`} aria-hidden="true">
                      {SEVERITY_MARK[g.severity]}
                    </span>
                    {SEVERITY_LABEL[g.severity]}
                    <span className="finding-group__count">{g.items.length} 项</span>
                  </div>
                  <ul>
                    {g.items.map((f) => (
                      <li key={f.id + f.text} className={`finding finding--${f.severity}`}>
                        <span className="finding__mark" aria-hidden="true">
                          {SEVERITY_MARK[f.severity]}
                        </span>
                        <span>
                          {f.text}
                          {f.claimIds?.length ? (
                            <span className="finding__claims">
                              依据 {f.claimIds.join(' / ')} ·{' '}
                              <Link to="/library/claims">查看台账</Link>
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {evidenceIds.length > 0 && (
                <div className="card">
                  <div className="card__head">
                    <h2 className="card__title">本次判定引用的证据</h2>
                    <EvidencePopover ids={evidenceIds} label="全部来源" />
                  </div>
                  <p className="card__verdict">
                    共 {evidenceIds.length} 条来源，点击右上角查看完整清单、版本与核验日期。
                  </p>
                </div>
              )}

              <div className="card">
                <div className="card__head">
                  <h2 className="card__title">换个思路</h2>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {result.alternatives.map((a) => (
                    <Link key={a.to} className="btn" to={a.to}>
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
