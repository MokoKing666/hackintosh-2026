import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareCard } from '@/components/HardwareCard';
import { SourceList } from '@/components/Evidence';

export function IntelPage() {
  useDocumentTitle('Intel 平台');
  const cpus = HARDWARE.filter((h) => h.category === 'cpu' && h.platform === 'intel');
  const igpus = HARDWARE.filter((h) => h.category === 'igpu');
  const evidenceIds = [...new Set([...cpus, ...igpus].flatMap((h) => h.evidenceIds))];

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
            <p className="eyebrow">代际矩阵</p>
            <h2>处理器与核显</h2>
          </div>
          <div className="grid grid--3">
            {[...cpus, ...igpus].map((h) => (
              <HardwareCard key={h.id} h={h} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">12–14 代</p>
              <h2>大小核调度：三件套缺一不可</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                macOS 的电源管理与调度代码里写死了它认识的 CPU 家族。混合架构不在名单里，
                内核一启动就会算错核心拓扑。
              </p>
              <p className="small muted" style={{ marginTop: 12 }}>
                顺序不能颠倒：先让内核认得出这颗 CPU，再让它看清核心布局，最后才谈电源管理曲线。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">① CPUID 伪装</h3>
                <p className="card__verdict">
                  <span className="code-pill">Kernel → Emulate</span> 写入 Cpuid1Data / Cpuid1Mask，
                  把 CPUID 报成 Comet Lake。副作用是少数依赖真实 CPUID 的软件会认错硬件。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">② ProvideCurrentCpuInfo</h3>
                <p className="card__verdict">
                  <span className="code-pill">Kernel → Quirks</span> 打开它，内核才知道真实的 P/E
                  核心数量。不开会出现核心数识别错误、睡眠立刻醒、随机重启。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">③ CpuTopologyRebuild / CPUFriend</h3>
                <p className="card__verdict">
                  前者重建拓扑，把 E-Core 正确归组；后者注入电源管理数据，
                  让频率曲线贴近真实硬件。两者叠加才能让调度器不把任务全丢给 P 核。
                </p>
              </div>
              <div className="callout">
                <strong>一个常见误判：</strong>「能进系统」不等于「调度正确」。跑一次 Cinebench
                多核，如果分数只有 Windows 的六成，多半是 E-Core 没被识别。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">芯片组</p>
            <h2>主板层面的四个要点</h2>
          </div>
          <div className="grid grid--2">
            <div className="card">
              <h3 className="card__title">ACPI 与 CFG Lock</h3>
              <p className="card__verdict">
                400/500/600/700 系的 ACPI 差异主要在 EC 与 USB 供电表。CFG Lock 未解锁会导致
                电源管理异常，多数厂商 BIOS 不提供开关，需要 RU.efi 或 modGRUB 改 MSR 0xE2。
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
                Thunderbolt 3/4 依赖主板原生映射与 VT-d，热插拔支持不稳定。 没有明确需求时，建议在
                BIOS 里关闭雷电安全级别限制再测试。
              </p>
            </div>
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
