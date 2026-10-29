import type { HardwareRecord } from '@/domain/types';
import { CATEGORY_LABEL } from '@/domain/labels';
import { VerdictBadge } from './VerdictBadge';
import { EvidencePopover } from './EvidencePopover';

const DRIVER_LABEL: Record<string, string> = {
  native: '原生免驱',
  kext: '需 kext',
  'third-party': '第三方驱动',
  none: '无驱动',
};

const BOOT_LABEL: Record<string, string> = {
  'el2-monitor': 'EL2 监视器',
  'uefi-efi': 'UEFI 引导',
  virtualization: '虚拟机',
  none: '无引导方案',
};

const FEATURE_LABEL: Record<string, string> = {
  boot: '引导',
  display: '显示',
  metal: 'Metal',
  hwDecode: '硬解',
  sleep: '睡眠',
  wifi: '无线',
  airdrop: 'AirDrop',
  audio: '音频',
  iservices: 'iServices',
};

const FEATURE_STATE: Record<string, string> = {
  yes: '可用',
  partial: '部分',
  no: '不可用',
  unknown: '未知',
};

function osText(h: HardwareRecord): string {
  if (h.verdict === 'incompatible') return '不支持';
  if (h.os.max && h.os.min) return `${h.os.min}–${h.os.max}`;
  if (h.os.max) return `≤ ${h.os.max}`;
  if (h.os.min) return `≥ ${h.os.min}`;
  return '—';
}

function specsOf(h: HardwareRecord): string[] {
  const out: string[] = [];
  if (h.cpu) {
    out.push(h.cpu.generation);
    out.push(h.cpu.socket);
  }
  if (h.gpu) {
    out.push(h.gpu.family);
    out.push(DRIVER_LABEL[h.gpu.driver] ?? h.gpu.driver);
  }
  if (h.arm) {
    out.push(BOOT_LABEL[h.arm.bootMethod] ?? h.arm.bootMethod);
    if (h.arm.singleDevice) out.push('单机型锁定');
    if (h.arm.requiresHostMac) out.push('需 Mac 主机');
  }
  if (!h.cpu && !h.gpu && !h.arm) out.push(CATEGORY_LABEL[h.category]);
  out.push(`macOS ${osText(h)}`);
  return out.slice(0, 4);
}

/**
 * 硬件卡片：三层渐进披露。
 * 第一层 名称 + 状态 + 一句结论 + 指标；第二层 details 展开要求与限制；第三层证据浮层。
 */
export function HardwareCard({ h }: { h: HardwareRecord }) {
  const features = Object.entries(h.features).filter(([, v]) => v !== 'unknown');

  return (
    <article className="card">
      <div className="card__head">
        <h3 className="card__title">{h.name}</h3>
        <VerdictBadge verdict={h.verdict} />
      </div>
      <p className="card__verdict">{h.summary}</p>

      <div className="card__specs">
        {specsOf(h).map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>

      {(h.requirements.length > 0 || h.limitations.length > 0 || features.length > 0) && (
        <details className="card__disclosure">
          <summary>配置要求与限制</summary>
          <div className="card__detail">
            {h.requirements.length > 0 && (
              <div>
                <dt>必需配置</dt>
                <ul>
                  {h.requirements.map((r) => (
                    <li key={r.text}>{r.text}</li>
                  ))}
                </ul>
              </div>
            )}
            {h.limitations.length > 0 && (
              <div>
                <dt>已知限制</dt>
                <ul>
                  {h.limitations.map((r) => (
                    <li key={r.text}>{r.text}</li>
                  ))}
                </ul>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <dt>功能状态</dt>
                <ul>
                  {features.map(([k, v]) => (
                    <li key={k}>
                      {FEATURE_LABEL[k] ?? k}：{FEATURE_STATE[v] ?? v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}

      <div className="card__foot">
        <span className="caption">核验 2026-10-29</span>
        <EvidencePopover ids={h.evidenceIds} />
      </div>
    </article>
  );
}
