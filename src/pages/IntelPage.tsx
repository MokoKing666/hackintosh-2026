import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareTable } from '@/components/HardwareTable';
import { SourceList } from '@/components/Evidence';

export function IntelPage() {
  useDocumentTitle('Intel 平台');
  const cpus = HARDWARE.filter((h) => h.category === 'cpu' && h.platform === 'intel');
  const igpus = HARDWARE.filter((h) => h.category === 'igpu');
  const evidenceIds = [
    ...new Set([...cpus.flatMap((c) => c.evidenceIds), ...igpus.flatMap((g) => g.evidenceIds)]),
  ];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Intel</p>
          <h1>末代 x86 的余量</h1>
          <p className="lead">
            Intel 这条路走了十七年，现在停在 26.7。好消息是它足够成熟——9~10
            代至今仍是「一次点亮」的代名词； 坏消息是 12
            代以后每代都要打补丁，而核显早已没有官方支持。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <HardwareTable
            rows={cpus}
            label="Intel CPU 兼容矩阵"
            caption={<span>系统上限统一为 macOS 26.7.x；27 起不再包含 Intel 机型的内核驱动。</span>}
          />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">关键补丁</p>
              <h2>12 代以后为什么要「假装自己是 10 代」</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                macOS 的电源管理与调度代码里写死了它认识的 CPU 家族。混合架构不在名单里，
                内核一启动就会算错核心拓扑。
              </p>
              <p className="small muted" style={{ marginTop: 12 }}>
                解决办法是把 CPUID 报成 Comet Lake，同时用 ProvideCurrentCpuInfo
                告诉内核真实的核心布局。 副作用是少数依赖真实 CPUID 的软件会认错硬件。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">config.plist 里要改的两处</h3>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: 'var(--bg-sunken)',
                    borderRadius: 8,
                    overflowX: 'auto',
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  {`Kernel → Emulate
  Cpuid1Data   <55 06 0A 00 00 00 00 00 …>
  Cpuid1Mask   <FF FF FF FF 00 00 00 00 …>

Kernel → Quirks
  ProvideCurrentCpuInfo = true`}
                </pre>
                <p className="card__foot">
                  <span>适用于 12 / 13 / 14 代</span>
                  <span>OpenCore 1.0.8</span>
                </p>
              </div>
              <div className="callout">
                <strong>别省这一步：</strong>不伪装也能进系统，但会出现核心数识别错误、睡眠立刻醒、
                以及「用着用着突然重启」。这类问题很难归因，先检查 CPUID。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>核显：UHD 630 是最后一代免驱</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            这句话在 2026 年 10 月之前是绝对的。现在多了两条实验分支，但它仍然是最稳的那一个。
          </p>
          <HardwareTable rows={igpus} label="Intel 核显兼容矩阵" />

          <div className="grid grid--2" style={{ marginTop: 20 }}>
            <div className="card">
              <h3 className="card__title">WhateverXe · 给老架构补驱动</h3>
              <p className="card__body">
                基于 WhateverGreen 派生，覆盖 Tiger Lake-U、Alder Lake-N、ADL-H、UHD 770、ADL-P /
                RPL-P。 必须用配套的已签名图形包，SIP 固定 0x803，还要 AMFIPass v1.4.1 Mod。
              </p>
              <p className="card__foot">
                <span>实验性</span>
                <span>FairPlay 不支持</span>
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">XeGfx · 把 Linux 驱动搬过来</h3>
              <p className="card__body">
                把 FreeBSD 的 drm-kmod i915 搬进 XNU，配 Mesa ANV 做 Metal-to-Vulkan 翻译。
                目标是最新的 Xe-LPG / Xe2，已在 Arrow Lake 与 Meteor Lake 上跑通。
              </p>
              <p className="card__foot">
                <span>测试驱动</span>
                <span>有未决 panic</span>
              </p>
            </div>
          </div>

          <div className="callout callout--warn" style={{ marginTop: 16 }}>
            <strong>两条线共同的代价：</strong>FairPlay 受保护内容放不了。Apple TV+、部分 Apple
            Music 内容、以及依赖 FairPlay 的网页播放器会直接失败。当生产力用之前先想清楚。
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">SMBIOS</p>
              <h2>只剩四个机型可以冒充</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                macOS 26 官方保留的 Intel 机型只剩四款，黑苹果能用的 SMBIOS 也就只有这四个。
                选错会直接影响 iServices 与电源管理。
              </p>
            </div>
            <div className="card">
              <dl className="kv">
                <div>
                  <dt>MacPro7,1</dt>
                  <dd>Mac Pro (2019)，台式机首选，无核显也能用；内存告警需 RestrictEvents 屏蔽</dd>
                </div>
                <div>
                  <dt>iMac20,1 / 20,2</dt>
                  <dd>iMac (2020)，有核显的桌面平台，需要正确的 ig-platform-id</dd>
                </div>
                <div>
                  <dt>MacBookPro16,1</dt>
                  <dd>16 寸 (2019)，笔记本或独显机器</dd>
                </div>
                <div>
                  <dt>MacBookPro16,3</dt>
                  <dd>13 寸 4×TB3 (2020)，核显本</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>升到 26 之后，两件事必须先处理</h2>
          <div className="grid grid--2" style={{ marginTop: 16 }}>
            <div className="card">
              <h3 className="card__title">① WhateverGreen 会导致 panic</h3>
              <p className="card__body">
                macOS 26 上它的 AMD connector patching 会直接引发内核 panic。Dortania
                给出的唯一方案是整个移除， 把 agdpmod=pikera 改成手工 Kernel → Patch 注入。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">② AppleHDA 被移除，AppleALC 失效</h3>
              <p className="card__body">
                现在有三条路：SimpleHDA（首选）、MyKextInstaller 重注、或退回 VoodooHDA。 HDMI / DP
                / USB 音频不受影响。
              </p>
              <p className="card__foot">
                <Link to="/peripherals">详见外设页</Link>
              </p>
            </div>
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
