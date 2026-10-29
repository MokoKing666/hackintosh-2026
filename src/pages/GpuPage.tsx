import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareTable } from '@/components/HardwareTable';
import { SourceList } from '@/components/Evidence';

const TIMELINE = [
  {
    when: '≤ 10.13.6',
    title: 'Kepler / Maxwell / Pascal 都还能用',
    desc: '靠 NVIDIA Web Driver，GTX 10 系在 High Sierra 上是完整可用的。',
  },
  {
    when: '10.14',
    title: 'Mojave 起 Web Driver 断绝',
    desc: 'NVIDIA 未再发布新驱动。GTX 10 系从此停在 High Sierra，往后只能靠 OCLP 点亮，没有 Metal。',
  },
  {
    when: '11',
    title: 'Kepler 被移出内核（Monterey beta 7 完成）',
    desc: 'GTX 680 / 780 / TITAN 反而活得久，OCLP 补丁能带到 Sequoia 15 并保留 Metal。',
  },
  {
    when: '12 – 26',
    title: 'Turing / Ampere / Ada 官方「None」',
    desc: 'Dortania 的显卡指南里，这一栏长期写着 Highest Supported OS: None，直到 2026-10 被第三方改写。',
  },
];

export function GpuPage() {
  useDocumentTitle('显卡资料');
  const nvidia = HARDWARE.filter((h) => h.gpu?.vendor === 'nvidia');
  const amd = HARDWARE.filter((h) => h.gpu?.vendor === 'amd');
  const intel = HARDWARE.filter((h) => h.gpu?.vendor === 'intel');
  const evidenceIds = [...new Set([...nvidia, ...amd, ...intel].flatMap((g) => g.evidenceIds))];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">显卡</p>
          <h1>N 卡回来了，但只有十分之一的力气</h1>
          <p className="lead">
            2026 年最意外的事：被 Apple 判死七年的 NVIDIA，被一个独立开发者用三周时间救活了。 GTX 16
            到 RTX 50 全系能点亮、能跑 Metal——只是性能只有 Windows 的零头。
          </p>
        </div>
      </section>

      <section className="section section--invert">
        <div className="container">
          <p className="eyebrow">主角</p>
          <h2 style={{ maxWidth: '22em' }}>NullMoth：把 Metal 架在 NVIDIA 的开源内核模块上</h2>
          <p className="lead" style={{ marginTop: 12 }}>
            它不是重写驱动，而是绕路：让 Metal 应用以为在跟 Apple 的驱动说话，中间一层翻译器把 Apple
            的 AIR 中间表示转成 SPIR-V，交给 Mesa 的 NVK，再由 NVIDIA 开源的 r610
            内核模块落到硬件上。
          </p>

          <div className="grid grid--3" style={{ marginTop: 24 }}>
            <div className="card" style={{ background: 'transparent' }}>
              <h3 className="card__title">能装什么</h3>
              <p className="card__body">
                Turing 及更新：GTX 1650 / 1660 系、RTX 20 / 30 / 40 / 50 全系、TITAN RTX、Quadro RTX
                与 T400–T1200。设备表共 247 个 PCI ID，取自 NVIDIA 615.78.08。
              </p>
            </div>
            <div className="card" style={{ background: 'transparent' }}>
              <h3 className="card__title">系统范围</h3>
              <p className="card__body">
                驱动本体支持 macOS 15.5 起与 26 Tahoe；但配套的一键安装器 1401 把系统锁在 15。 想上
                Tahoe 要手动装，注意黑屏 bug 在 v1.14 才修。
              </p>
            </div>
            <div className="card" style={{ background: 'transparent' }}>
              <h3 className="card__title">必须满足</h3>
              <p className="card__body">
                ReBAR + Above 4G 必须开启；BAR 只尝试 8G / 4G，不回退到更小尺寸； Kernel → Block
                排除 IONDRVSupport。
              </p>
            </div>
          </div>

          <div className="grid grid--2" style={{ marginTop: 16 }}>
            <div className="card" style={{ background: 'transparent' }}>
              <h3 className="card__title">性能实测（社区数据，非基准）</h3>
              <dl className="kv" style={{ marginTop: 8 }}>
                <div>
                  <dt>RTX 3060 · Windows</dt>
                  <dd>Minecraft 约 700 帧</dd>
                </div>
                <div>
                  <dt>RTX 3060 · macOS</dt>
                  <dd>同一整合包约 60 帧</dd>
                </div>
                <div>
                  <dt>Geekbench Metal</dt>
                  <dd>RTX 5060 超过 90000，媒体表述为「约等于标准版 M1」，口径与官方基准不一致</dd>
                </div>
              </dl>
            </div>
            <div className="card" style={{ background: 'transparent' }}>
              <h3 className="card__title">已知硬伤</h3>
              <ul className="list list--cross" style={{ marginTop: 8 }}>
                <li>双 4K 输出只剩鼠标（BAR1 停在 256MB）</li>
                <li>没有硬件编解码，视频播放吃 CPU，达芬奇直接报错</li>
                <li>无 Optimus 切换</li>
                <li>物理验证只到 RTX 5060，其余以社区报告为主</li>
              </ul>
            </div>
          </div>

          <div className="callout callout--danger" style={{ marginTop: 20 }}>
            <strong>别当生产力用。</strong>没有硬解、双 4K 黑屏、HDMI 音频针脚仍在修；
            安全研究者已经在这套驱动里挖出过几处漏洞。能跑，不等于可靠。
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>NVIDIA</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            官方线与第三方线的区别，比型号本身更重要：官方支持的最后一站是 Pascal（且无 Metal）。
          </p>
          <HardwareTable rows={nvidia} label="NVIDIA 显卡兼容矩阵" />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>AMD</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            免驱上限卡在 Navi 2x。Navi 3x 没有驱动，直通进虚拟机也没有意义。
          </p>
          <HardwareTable rows={amd} label="AMD 显卡兼容矩阵" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>Intel 核显</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            UHD 630 之后，核显全靠两条实验分支：WhateverXe 补老架构，XeGfx 搬 Linux 驱动。
          </p>
          <HardwareTable rows={intel} label="Intel 核显兼容矩阵" />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container container--text">
          <h2 style={{ marginBottom: 8 }}>Apple 那边的四代结局</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            第三方驱动是补救，不是翻案。按 Apple 自己的支持线，N 卡在 macOS 上的历史是这样断掉的。
          </p>
          <div className="timeline">
            {TIMELINE.map((t) => (
              <div key={t.when} className="timeline__item">
                <div className="timeline__date">{t.when}</div>
                <div>
                  <p className="timeline__title">{t.title}</p>
                  <p className="timeline__desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
