import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { PROJECTS } from '@/domain/projects';
import { CLAIMS, CORRECTIONS } from '@/domain/claims';
import { TIMELINE } from '@/domain/arm';

const PLATFORMS = [
  {
    to: '/arm',
    kicker: 'ARM',
    title: '四条移植路线',
    desc: 'UniXNU 的六层栈、Snapintosh 的 EL2 伪装、RK3588 的真 EFI、ios-sweet 的反向移植。',
    badges: ['实验性支持', '4 条线'],
  },
  {
    to: '/intel',
    kicker: 'INTEL',
    title: '末代 x86 的余量',
    desc: '9~10 代开箱可用，12 代以后要 CPUID 伪装，UHD 630 是最后的免驱核显。',
    badges: ['有条件可用', '≤ 26.7'],
  },
  {
    to: '/amd',
    kicker: 'AMD',
    title: '补丁换来的性能',
    desc: 'Vanilla 补丁链最成熟，代价是没有 Hypervisor——虚拟机与容器硬加速全废。',
    badges: ['有条件可用', '≤ 26.7'],
  },
  {
    to: '/gpu',
    kicker: 'GPU',
    title: 'N 卡回来了，但有条件',
    desc: 'NullMoth 覆盖 16–50 系，能点亮、能跑 Metal，性能却只有 Windows 的零头。',
    badges: ['实验性支持', 'A 卡免驱'],
  },
  {
    to: '/vm',
    kicker: 'VIRTUAL',
    title: '不拆机箱也能跑',
    desc: 'QEMU/KVM 是过去六年最省事的路，直通一张免驱 A 卡就能回到九成性能。',
    badges: ['有条件可用'],
  },
  {
    to: '/library',
    kicker: 'DATA',
    title: '全部证据，可以查',
    desc: '硬件矩阵、项目图谱、结论台账、取证纠错，每条都能点回上游来源。',
    badges: ['可筛选', '可深链'],
  },
];

export function HomePage() {
  useDocumentTitle('总览');

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">2026 年 10 月 · 全景报告</p>
          <h1 className="display">
            x86 定格，
            <br />
            ARM 开闸。
          </h1>
          <p className="hero__sub">
            macOS 27 把 Intel 关在门外，黑苹果的天花板钉死在 26.7。但同一时间，四条 ARM
            移植路线在跑， N 卡从 16 系到 50 系重新点亮，Intel
            核显被第三方驱动拽了回来。这是终结，也是换轨。
          </p>
          <div className="hero__meta">
            <span>数据截止 2026-10-29</span>
            <span>{PROJECTS.length} 个开源项目取证</span>
            <span>{HARDWARE.length} 条硬件兼容记录</span>
            <span>{CLAIMS.length} 条结论台账</span>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="grid grid--3">
            <article className="card">
              <p className="caption">01 / 系统边界</p>
              <h2 className="h3" style={{ marginTop: 6 }}>
                26.7 就是终点，没有 27
              </h2>
              <p className="card__body" style={{ marginTop: 6 }}>
                macOS 27 只支持 Apple Silicon，这是架构性排除。Tahoe 只剩 4 个 SMBIOS 可用，OCLP
                也没有 27 的适配计划。
              </p>
              <p className="card__foot">
                <Link to="/library/claims">C-002 / C-003</Link>
                <span>官方文档</span>
              </p>
            </article>
            <article className="card">
              <p className="caption">02 / ARM 现状</p>
              <h2 className="h3" style={{ marginTop: 6 }}>
                四条线在跑，两条有代码
              </h2>
              <p className="card__body" style={{ marginTop: 6 }}>
                UniXNU 有仓库有文档，Snapintosh 开源且带 Adreno 加速；RK3588 跑通了 27.2 Beta
                但零代码；ios-sweet 是反向移植。
              </p>
              <p className="card__foot">
                <Link to="/arm">看四条路线</Link>
                <span>上游仓库 + 项目方声明</span>
              </p>
            </article>
            <article className="card">
              <p className="caption">03 / 硬件禁区</p>
              <h2 className="h3" style={{ marginTop: 6 }}>
                Navi 3x 与 780M 仍然是墙
              </h2>
              <p className="card__body" style={{ marginTop: 6 }}>
                RX 7900 XTX、7800 XT、Radeon 780M 至今无解。反倒是被官方判死的 N 卡，
                被第三方驱动救了回来——但只救回一小半。
              </p>
              <p className="card__foot">
                <Link to="/gpu">看显卡矩阵</Link>
                <span>Dortania</span>
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="stat-row">
            <div className="stat">
              <div className="stat__num">26.7</div>
              <div className="stat__label">x86 黑苹果的系统上限</div>
            </div>
            <div className="stat">
              <div className="stat__num">4</div>
              <div className="stat__label">ARM 移植路线（2 条有代码）</div>
            </div>
            <div className="stat">
              <div className="stat__num">247</div>
              <div className="stat__label">NullMoth 覆盖的 NVIDIA PCI ID</div>
            </div>
            <div className="stat">
              <div className="stat__num">{CORRECTIONS.length}</div>
              <div className="stat__label">已证伪的流传说法</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container--text">
          <p className="eyebrow">2026 大事记</p>
          <h2 style={{ marginBottom: 8 }}>一个半月，七件事把局面改写</h2>
          <p className="lead" style={{ marginBottom: 32 }}>
            从 9 月 macOS 27 推送，到 10 月底 RK3588 跑起 27.2 Beta，节奏比过去三年加起来都快。
          </p>
          <div className="timeline">
            {TIMELINE.map((e) => (
              <div
                key={e.id}
                className={`timeline__item${e.major ? ' timeline__item--major' : ''}`}
              >
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

      <section className="section section--alt">
        <div className="container">
          <p className="eyebrow">按平台进</p>
          <h2 style={{ marginBottom: 24 }}>六个入口，各自独立</h2>
          <div className="plat-grid">
            {PLATFORMS.map((p) => (
              <Link key={p.to} to={p.to} className="plat-card">
                <span className="plat-card__kicker">{p.kicker}</span>
                <span className="plat-card__title">{p.title}</span>
                <span className="plat-card__desc">{p.desc}</span>
                <span className="plat-card__foot">
                  {p.badges.map((b) => (
                    <span key={b} className="badge badge--neutral">
                      {b}
                    </span>
                  ))}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--invert">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">判断</p>
              <h2>现在该不该上车</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                把「折腾」和「干活」分开看，答案会清楚很多。
              </p>
            </div>
            <div className="stack">
              <div className="card" style={{ background: 'transparent' }}>
                <h3 className="card__title">为了折腾 —— 三年里最好的时候</h3>
                <p className="card__body">
                  ARM 侧从零到四条线只用了三年，N 卡与 Intel 核显同时被第三方驱动救活，每天都有新
                  commit。 等到 2028 年前后安全更新停掉，这批项目会一起凉。
                </p>
              </div>
              <div className="card" style={{ background: 'transparent' }}>
                <h3 className="card__title">为了干活 —— 别上车</h3>
                <p className="card__body">
                  系统定格在 26.7，驱动永远停在 2026 年。没有 FairPlay、没有
                  AirDrop、没有硬件编解码， Adobe 与 Docker 各有各的坑。同价位一台二手 Mac mini
                  更省命。
                </p>
              </div>
              <div className="callout">
                <strong>一条经验：</strong>先查矩阵再买件。Navi 3x、Radeon 780M、Intel Arc
                这三类，无论谁跟你说「有教程」，都别信。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container--text" style={{ textAlign: 'center' }}>
          <h2>先算一遍，再拆机箱</h2>
          <p className="lead" style={{ margin: '12px auto 0' }}>
            配置生成器会告诉你这套件能不能装、缺什么补丁、以及会失去什么。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <Link className="btn btn--primary" to="/builder">
              打开配置生成器
            </Link>
            <Link className="btn" to="/library">
              看完整矩阵
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
