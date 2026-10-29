import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { PROJECTS } from '@/domain/projects';
import { CLAIMS } from '@/domain/claims';
import { TIMELINE } from '@/domain/arm';

const OS_BOUNDARY = [
  {
    os: 'macOS 15 Sequoia',
    arch: 'x86_64 + arm64e',
    intel: '支持',
    smbios: '全量机型',
    stack: '驱动栈完整，AppleHDA 仍在',
    tone: 'verified',
  },
  {
    os: 'macOS 26 Tahoe (26.0–26.7)',
    arch: 'x86_64 + arm64e',
    intel: '支持（末代）',
    smbios: '仅 4 个机型',
    stack: '移除 AppleHDA；WhateverGreen 需整体移除',
    tone: 'conditional',
  },
  {
    os: 'macOS 27 Golden Gate',
    arch: '仅 arm64e',
    intel: '不支持',
    smbios: '—',
    stack: 'Intel 驱动与内核路径移除，无法通过补丁绕过',
    tone: 'incompatible',
  },
];

const count = (fn: (h: (typeof HARDWARE)[number]) => boolean) => HARDWARE.filter(fn).length;

export function HomePage() {
  useDocumentTitle('黑苹果配置全景 2026 — x86 终章、ARM 移植与硬件兼容取证库', true);

  const entries = [
    {
      to: '/intel',
      kicker: 'INTEL',
      title: '十四代演进',
      desc: '从 Comet Lake 的末代原生核显，到 Arrow Lake 的异构大小核。CPUID 伪装、拓扑重构与主板 ACPI 是三道门槛。',
      stat: `${count((h) => h.platform === 'intel')} 条记录`,
      span: '',
    },
    {
      to: '/amd',
      kicker: 'AMD',
      title: '补丁哲学',
      desc: 'Ryzen 全系可引导，代价写在明面上：没有 Hypervisor，PAT 重映射影响显存带宽与音频稳定性。',
      stat: `${count((h) => h.platform === 'amd')} 条记录`,
      span: '',
    },
    {
      to: '/gpu',
      kicker: 'GPU',
      title: '生死线',
      desc: 'AMD 原生防线仍然可靠，Navi 3x 明确无解；NVIDIA 靠第三方驱动点亮，性能只有 Windows 的零头。',
      stat: `${count((h) => h.category === 'dgpu')} 条独显记录`,
      span: '',
    },
    {
      to: '/arm',
      kicker: 'ARM',
      title: '跨越 Apple Silicon 的高墙',
      desc: 'UniXNU、Snapintosh、RK3588、ios-sweet 四条路线。按代码公开度、启动阶段与图形加速真实性逐项取证。',
      stat: `${count((h) => h.platform === 'arm')} 个平台`,
      span: 'bento--half',
    },
    {
      to: '/virtualization',
      kicker: 'VIRTUAL',
      title: '把硬件交给 Hypervisor',
      desc: 'QEMU/KVM 加 VFIO 直通、Apple Virtualization.framework、TCG 全模拟，三种层级对应三种可用性。',
      stat: `${PROJECTS.filter((p) => p.category === 'virtualization').length} 个项目`,
      span: 'bento--half',
    },
    {
      to: '/peripherals',
      kicker: 'PERIPHERAL',
      title: '最后一公里',
      desc: '无线、蓝牙、音频、USB 映射与连续互通——决定这台机器能不能长期服役。',
      stat: `${count((h) => ['wifi', 'ethernet', 'audio', 'storage'].includes(h.category))} 条记录`,
      span: '',
    },
    {
      to: '/library',
      kicker: 'DATA',
      title: '证据链',
      desc: '硬件矩阵、项目图谱、失效墓园、取证纠错。每条结论绑定证据 ID 与核验日期。',
      stat: `${HARDWARE.length} 硬件 · ${PROJECTS.length} 项目`,
      span: '',
    },
    {
      to: '/generator',
      kicker: 'ENGINE',
      title: '可行性评估',
      desc: '纯函数规则引擎：输入硬件组合，输出判定、阻断原因、补丁清单与证据。',
      stat: `${CLAIMS.length} 条结论台账`,
      span: '',
    },
  ];

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">2026 · 非官方 macOS 技术档案</p>
          <h1 className="hero-title">站在 x86 的终点，审视非官方 macOS 的每一条技术路径。</h1>
          <p className="hero__sub">
            从 macOS 26 Tahoe（26.7）的末代 x86_64 绝唱，到 macOS 27 Golden Gate 彻底移除 Intel
            代码后的架构断层；从传统 OpenCore 引导、社区逆向驱动，到非 Apple 芯片的 ARM64
            移植实验。这里不兜售「完美免驱」的都市传说，只记录经过代码与实机取证的技术事实。
          </p>
          <div className="hero__meta">
            <span>数据截止 2026-10-29</span>
            <span>{HARDWARE.length} 条硬件记录</span>
            <span>{PROJECTS.length} 个开源项目</span>
            <span>{CLAIMS.length} 条结论台账</span>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="stat-row">
            <div className="stat">
              <div className="stat__num">26.7</div>
              <div className="stat__label">x86_64 黑苹果的系统上限</div>
            </div>
            <div className="stat">
              <div className="stat__num">4</div>
              <div className="stat__label">Tahoe 下可用的 Intel SMBIOS 数量</div>
            </div>
            <div className="stat">
              <div className="stat__num">247</div>
              <div className="stat__label">NullMoth 声明的 NVIDIA PCI ID</div>
            </div>
            <div className="stat">
              <div className="stat__num">
                {PROJECTS.filter((p) => p.codeOpen !== 'full').length}
              </div>
              <div className="stat__label">代码未完全公开的项目</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">系统边界</p>
            <h2>三个版本，一条断层</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              2026 年所有黑苹果讨论的前提，都写在这三行里。越过 26.7
              之后，问题不再是「驱动能不能补」，而是架构不再包含你。
            </p>
          </div>

          <div className="table-shell">
            <div className="table-scroll">
              <table className="data" aria-label="macOS 版本与 x86 支持边界">
                <thead>
                  <tr>
                    <th>系统版本</th>
                    <th>架构支持</th>
                    <th>Intel 支持</th>
                    <th>可用 SMBIOS</th>
                    <th>驱动栈状态</th>
                  </tr>
                </thead>
                <tbody>
                  {OS_BOUNDARY.map((row) => (
                    <tr key={row.os}>
                      <td>
                        <strong>{row.os}</strong>
                      </td>
                      <td className="mono-num">{row.arch}</td>
                      <td className="nowrap">{row.intel}</td>
                      <td>{row.smbios}</td>
                      <td>{row.stack}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-caption">
              <span>依据：Apple 官方支持文档、Dortania Tahoe 指南</span>
              <Link to="/library/claims">查看 C-001 / C-002 / C-003 的完整证据 →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">全景路线</p>
            <h2>八条路径，各自独立</h2>
          </div>
          <div className="bento">
            {entries.map((e) => (
              <Link key={e.to} to={e.to} className={`card ${e.span}`} style={{ display: 'block' }}>
                <span className="eyebrow" style={{ marginBottom: 8 }}>
                  {e.kicker}
                </span>
                <h3 className="card__title" style={{ fontSize: '1.125rem' }}>
                  {e.title}
                </h3>
                <p className="card__verdict">{e.desc}</p>
                <div className="card__specs">
                  <span>{e.stat}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">2026 风向标</p>
              <h2>今年真正改变判断的三件事</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                不是新品发布，而是三条让旧结论失效的事实。
              </p>
            </div>
            <div className="stack">
              <article className="card">
                <div className="card__head">
                  <h3 className="card__title">Tahoe 是终点，不是中转站</h3>
                  <span className="badge badge--incompatible">
                    <span className="vmark vmark--incompatible" aria-hidden="true" />
                    硬性阻断
                  </span>
                </div>
                <p className="card__verdict">
                  macOS 27 不再包含任何 Intel 机型的内核驱动，OCLP 团队也没有 27 的适配计划。
                  「再等一个补丁」这条经验，在这一代正式失效。
                </p>
              </article>
              <article className="card">
                <div className="card__head">
                  <h3 className="card__title">N 卡回来了，但只有十分之一的力气</h3>
                  <span className="badge badge--experimental">
                    <span className="vmark vmark--experimental" aria-hidden="true" />
                    实验性
                  </span>
                </div>
                <p className="card__verdict">
                  NullMoth 让 Turing 到 Blackwell 全系点亮，代价是双 4K 黑屏、无硬件编解码，
                  以及同卡在 Windows 上约十倍的帧数差距。能跑，不等于能用。
                </p>
              </article>
              <article className="card">
                <div className="card__head">
                  <h3 className="card__title">ARM 移植热，但代码公开的只有两条</h3>
                  <span className="badge badge--unverified">
                    <span className="vmark vmark--unverified" aria-hidden="true" />
                    待核实
                  </span>
                </div>
                <p className="card__verdict">
                  UniXNU 与 Snapintosh 有仓库、有提交；RK3588 有实机演示但零代码公开。
                  同一句「跑起来了」，可复现程度差了两个数量级。
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container container--text">
          <p className="eyebrow">时间线</p>
          <h2 style={{ marginBottom: 8 }}>一个半月，七件事改写判断</h2>
          <div className="timeline" style={{ marginTop: 24 }}>
            {TIMELINE.map((e) => (
              <div key={e.id} className="timeline__item">
                <div className="timeline__date">{e.date.slice(5)}</div>
                <div>
                  <p className="timeline__title">{e.title}</p>
                  <p className="timeline__desc">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container--text" style={{ textAlign: 'center' }}>
          <h2>先算一遍，再拆机箱</h2>
          <p className="lead" style={{ margin: '12px auto 0' }}>
            输入硬件组合，引擎会告诉你结论、阻断原因、必备补丁，以及每一条判定背后的证据。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
            <Link className="btn btn--primary" to="/generator">
              打开评估引擎
            </Link>
            <Link className="btn" to="/library">
              浏览证据库
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
