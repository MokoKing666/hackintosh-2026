import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareCard } from '@/components/HardwareCard';
import { SourceList } from '@/components/Evidence';

const MODERN = ['cpu-intel-comet', 'cpu-intel-alder', 'cpu-intel-raptor', 'cpu-intel-arrow'];
const HEDT = ['cpu-xeon-e5-v3v4', 'cpu-xeon-e5-v1v2', 'cpu-xeon-e3', 'cpu-xeon-scalable'];
const LEGACY = ['cpu-haswell', 'cpu-sandy-ivy', 'cpu-skylake', 'cpu-kabylake'];

const GENERATIONS = [
  {
    gen: 'Sandy / Ivy Bridge（2–3 代）',
    cap: 'Catalina',
    oclp: 'Big Sur 附近',
    note: '核显 HD 4000 需 framebuffer 补丁；Sandy 无可用加速',
  },
  {
    gen: 'Haswell（4 代）',
    cap: 'Big Sur',
    oclp: 'Sonoma',
    note: 'HD 4600 需注入 device-id；性价比最高的二手平台',
  },
  { gen: 'Skylake（6 代）', cap: 'Monterey', oclp: 'Ventura+', note: 'HD 530 可用，体验较完整' },
  {
    gen: 'Kaby Lake（7 代）',
    cap: 'Ventura',
    oclp: 'Sonoma+',
    note: 'HD 630 原生免驱，最后一代能原生到 Ventura',
  },
  {
    gen: 'Coffee / Comet Lake（8–10 代）',
    cap: '26.7 Tahoe',
    oclp: '—',
    note: 'UHD 630 是最后一代免驱核显，社区案例最多',
  },
  {
    gen: 'Alder / Raptor Lake（12–14 代）',
    cap: '26.7 Tahoe',
    oclp: '—',
    note: '需 CPUID 伪装 + 拓扑重构，核显靠 WhateverXe',
  },
  {
    gen: 'Arrow Lake（Core Ultra 200S）',
    cap: '26.7 Tahoe',
    oclp: '—',
    note: '无成熟案例，Xe-LPG 仅 XeGfx 实验',
  },
  {
    gen: 'HEDT · X79 / X99',
    cap: 'Catalina / Monterey',
    oclp: 'Big Sur / Ventura',
    note: '需 CPUID 伪装与 TSC 同步，XCPM 不完整',
  },
  {
    gen: '至强 E3 v5 / v6',
    cap: 'Ventura',
    oclp: 'Sonoma+',
    note: '本质是 Skylake / Kaby Lake，无核显',
  },
  {
    gen: '至强 Scalable（C621）',
    cap: 'Monterey（不稳定）',
    oclp: '不建议',
    note: 'NUMA 与多路中断超出社区补丁覆盖',
  },
];

function Group({ ids, title, desc }: { ids: string[]; title: string; desc: string }) {
  const rows = HARDWARE.filter((h) => ids.includes(h.id));
  return (
    <div style={{ marginTop: 32 }}>
      <div className="section__head" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.25rem' }}>{title}</h2>
        <p className="small muted" style={{ marginTop: 6 }}>
          {desc}
        </p>
      </div>
      <div className="grid grid--2">
        {rows.map((h) => (
          <HardwareCard key={h.id} h={h} />
        ))}
      </div>
    </div>
  );
}

export function IntelPage() {
  useDocumentTitle('Intel 平台');
  const igpus = HARDWARE.filter((h) => h.category === 'igpu' && !h.id.includes('arc'));
  const evidenceIds = [
    ...new Set([...HARDWARE.filter((h) => h.platform === 'intel').flatMap((h) => h.evidenceIds)]),
  ];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Intel 平台</p>
          <h1 className="page-title">十四代演进。在一套配置里完美收官。</h1>
          <p className="lead">
            从 Comet Lake 的末代原生核显，到 Alder / Raptor / Arrow Lake 的异构大小核。只要跨过
            CPUID 伪装、拓扑重构与主板 ACPI 的门槛，Intel 依然是 macOS 26 Tahoe 下最成熟的裸机底座。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">代际上限</p>
            <h2>每一代停在哪，先看这张表</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              「原生上限」指不依赖根补丁能到的版本；「OCLP」指用根补丁硬推的极限。
              两者之间的差距，就是你要付出的稳定性代价。
            </p>
          </div>

          <div className="table-shell">
            <div className="table-scroll">
              <table className="data" aria-label="Intel 代际与系统上限">
                <thead>
                  <tr>
                    <th>代际 / 平台</th>
                    <th>原生上限</th>
                    <th>OCLP 极限</th>
                    <th>要点</th>
                  </tr>
                </thead>
                <tbody>
                  {GENERATIONS.map((g) => (
                    <tr key={g.gen}>
                      <td>
                        <strong>{g.gen}</strong>
                      </td>
                      <td className="nowrap">{g.cap}</td>
                      <td className="nowrap">{g.oclp}</td>
                      <td>{g.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-caption">
              <span>依据：Dortania 各代际指南、OCLP 支持机型表</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">处理器</p>
            <h2>按平台分三组看</h2>
          </div>
          <Group
            ids={MODERN}
            title="现代平台（10 代及以后）"
            desc="Tahoe 下的主力。10 代开箱可用，12 代起要伪装 CPUID 并重建拓扑。"
          />
          <Group
            ids={HEDT}
            title="HEDT 与至强"
            desc="X79 / X99 洋垃圾、E3 与 Scalable 服务器平台。便宜是优势，补丁链是代价。"
          />
          <Group
            ids={LEGACY}
            title="旧平台（2–7 代）"
            desc="原生上限各不相同，OCLP 能续命但会牺牲图形加速与增量更新。"
          />
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">核显</p>
            <h2>HD 630 之后，就没有免驱了</h2>
          </div>
          <div className="grid grid--3">
            {igpus.map((h) => (
              <HardwareCard key={h.id} h={h} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">12–14 代</p>
              <h2>大小核调度：三件套缺一不可</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                macOS 的电源管理与调度代码里写死了它认识的 CPU 家族。混合架构不在名单里，
                内核一启动就会算错核心拓扑。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">① CPUID 伪装</h3>
                <p className="card__verdict">
                  <span className="code-pill">Kernel → Emulate</span> 写入 Cpuid1Data / Cpuid1Mask，
                  把 CPUID 报成 Comet Lake。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">② ProvideCurrentCpuInfo</h3>
                <p className="card__verdict">
                  <span className="code-pill">Kernel → Quirks</span> 打开它，内核才知道真实的 P/E
                  核心数量。不开会出现核心数识别错误、睡眠立刻醒。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">③ CpuTopologyRebuild / CPUFriend</h3>
                <p className="card__verdict">
                  前者重建拓扑把 E-Core 正确归组，后者注入电源管理数据。两者叠加，
                  调度器才不会把任务全丢给 P 核。
                </p>
              </div>
              <div className="callout">
                <strong>一个常见误判：</strong>「能进系统」不等于「调度正确」。跑一次多核跑分，
                如果只有 Windows 的六成，多半是 E-Core 没被识别。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">芯片组</p>
            <h2>主板层面的五个要点</h2>
          </div>
          <div className="grid grid--2">
            <div className="card">
              <h3 className="card__title">ACPI 与 CFG Lock</h3>
              <p className="card__verdict">
                400–700 系的 ACPI 差异主要在 EC 与 USB 供电表。CFG Lock 未解锁会导致电源管理异常，
                多数厂商不提供开关，需要 RU.efi 或 modGRUB 改 MSR 0xE2。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">X99 / X79 的额外门槛</h3>
              <p className="card__verdict">
                必须关闭 VT-d，并处理 TSC 同步；X99 的 XCPM 不完整，睡眠与变频通常要手写 SSDT。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">RTC 唤醒与睡眠</h3>
              <p className="card__verdict">
                睡眠秒醒通常来自 RTC 闹钟或 USB 设备唤醒。SSDT-AWAC + RTCMemoryFixup
                能覆盖大部分情况， 剩下的用{' '}
                <span className="code-pill">log show --last 1m | grep Wake</span> 定位。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">I225-V / I226-V</h3>
              <p className="card__verdict">
                I225-V 在 Tahoe 原生可用；I226-V 需 AppleIGC.kext，不加会插网线重启。 这是 2.5G
                主板最常见的翻车点。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">雷电接口</h3>
              <p className="card__verdict">
                Thunderbolt 3/4 依赖主板原生映射与 VT-d，热插拔支持不稳定。
                没有明确需求时，建议先关闭 BIOS 里的雷电安全级别限制再测试。
              </p>
            </div>
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
