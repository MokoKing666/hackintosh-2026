import { useMemo, useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareCard } from '@/components/HardwareCard';
import { ChipGroup } from '@/components/Toolbar';
import { EvidencePopover } from '@/components/EvidencePopover';
import { SourceList } from '@/components/Evidence';

const VENDOR = [
  { value: 'all', label: '全部厂商' },
  { value: 'amd', label: 'AMD' },
  { value: 'nvidia', label: 'NVIDIA' },
  { value: 'intel', label: 'Intel' },
];

const KIND = [
  { value: 'all', label: '全部类型' },
  { value: 'dgpu', label: '独立显卡' },
  { value: 'igpu', label: '核显 / APU' },
];

const STATUS = [
  { value: 'all', label: '全部状态' },
  { value: 'verified', label: '已验证' },
  { value: 'conditional', label: '有条件' },
  { value: 'experimental', label: '实验性' },
  { value: 'incompatible', label: '不兼容' },
];

export function GpuPage() {
  useDocumentTitle('显卡资料');
  const all = HARDWARE.filter((h) => h.gpu);
  const [vendor, setVendor] = useState('all');
  const [kind, setKind] = useState('all');
  const [status, setStatus] = useState('all');

  const rows = useMemo(
    () =>
      all.filter(
        (h) =>
          (vendor === 'all' || h.gpu?.vendor === vendor) &&
          (kind === 'all' ||
            (kind === 'dgpu' && h.category === 'dgpu') ||
            (kind === 'igpu' && (h.category === 'igpu' || h.category === 'apu'))) &&
          (status === 'all' || h.verdict === status),
      ),
    [all, vendor, kind, status],
  );

  const evidenceIds = [...new Set(all.flatMap((h) => h.evidenceIds))];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">显卡资料</p>
          <h1 className="page-title">图形加速：黑苹果真正的生死线。</h1>
          <p className="lead">
            没有 Metal 硬件加速的 macOS 只是一台高分辨率幻灯片放映机。2026 年的显卡版图由久经考验的
            AMD 原生防线，以及试图打破禁区的社区逆向工程共同构成。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="toolbar">
            <ChipGroup label="厂商" value={vendor} options={VENDOR} onChange={setVendor} />
            <ChipGroup label="类型" value={kind} options={KIND} onChange={setKind} />
            <ChipGroup label="状态" value={status} options={STATUS} onChange={setStatus} />
            <span className="toolbar__count">
              {rows.length} / {all.length}
            </span>
          </div>

          {rows.length ? (
            <div className="grid grid--3" style={{ marginTop: 12 }}>
              {rows.map((h) => (
                <HardwareCard key={h.id} h={h} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <strong>没有匹配的显卡</strong>
              试试放宽厂商或状态筛选。
            </div>
          )}
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">专题 · NVIDIA</p>
              <h2>NullMoth：能点亮，和能干活是两件事</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                它不重写驱动，而是绕路：Metal 应用以为在跟 Apple 的驱动说话，中间一层翻译器把 AIR
                转成 SPIR-V，交给 Mesa 的 NVK，再由 NVIDIA 开源的 r610 内核模块落到硬件。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">覆盖范围与前提</h3>
                <p className="card__verdict">
                  Turing 及更新：GTX 16 系、RTX 20/30/40/50、TITAN RTX、Quadro RTX。 需 ReBAR +
                  Above 4G；BAR 只尝试 8G / 4G，不回退更小尺寸。
                </p>
                <div className="card__foot">
                  <span className="caption">驱动本体支持 15.5+ 与 26</span>
                  <EvidencePopover ids={['E-NULLMOTH', 'E-NULLMOTH-TS']} />
                </div>
              </div>
              <div className="card">
                <h3 className="card__title">性能与缺陷</h3>
                <p className="card__verdict">
                  社区样本：RTX 3060 跑 Minecraft 约 60 帧，同卡 Windows 约 700 帧。 双 4K
                  输出只剩鼠标，无硬件编解码，无 Optimus 切换。
                </p>
                <div className="card__foot">
                  <span className="caption">社区实测，非标准基准</span>
                  <EvidencePopover ids={['E-NULLMOTH-PERF']} />
                </div>
              </div>
              <div className="callout callout--danger">
                <strong>别当生产力用。</strong>没有硬解、双 4K 黑屏、HDMI 音频仍在修；
                安全研究者已在这套驱动里发现过漏洞。能跑，不等于可靠。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="callout callout--danger" style={{ marginBottom: 28 }}>
            <strong>Intel 独显同样无解：</strong>Arc A 系列（Alchemist）与 B 系列（Battlemage）
            都没有 macOS 驱动，DG1 同理。Arc 需要 ReBAR，但缺驱动与 ReBAR 无关—— 不要因为「N
            卡都能被社区救活」就推断 Arc 也有机会。
          </div>
          <div className="split">
            <div>
              <p className="eyebrow">专题 · Intel</p>
              <h2>WhateverXe：给老核显补一张驱动</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                基于 WhateverGreen 派生，覆盖 Tiger Lake-U、Alder Lake-N、UHD 770、ADL-P /
                RPL-P。必须搭配已签名图形包，SIP 固定 0x803。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">实际能力边界</h3>
                <p className="card__verdict">
                  能拿到 Metal 与 OpenCL，能做视频硬解；但 FairPlay 明确不支持， DP
                  重连可能黑屏，最多三屏。Meteor Lake 的 Xe-LPG 不在支持范围。
                </p>
                <div className="card__foot">
                  <span className="caption">WEX 0.6.1 / 图形包 0.3.2</span>
                  <EvidencePopover ids={['E-WEX']} />
                </div>
              </div>
              <div className="card">
                <h3 className="card__title">另一条路：XeGfx</h3>
                <p className="card__verdict">
                  把 FreeBSD 的 drm-kmod i915 搬进 XNU，配 Mesa ANV 做 Metal-to-Vulkan，
                  目标是最新的 Xe-LPG / Xe2。仍是测试驱动，有未决 panic。
                </p>
                <div className="card__foot">
                  <span className="caption">0.0.46 · 测试驱动</span>
                  <EvidencePopover ids={['E-XEGFX']} />
                </div>
              </div>
            </div>
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
