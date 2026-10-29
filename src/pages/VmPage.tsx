import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PROJECTS, PROJECT_STATUS_LABEL } from '@/domain/projects';
import { SourceList } from '@/components/Evidence';

const ROUTES = [
  {
    name: 'QEMU / KVM + OpenCore',
    projects: 'OSX-KVM · Docker-OSX · quickemu · OpenCore-ISO',
    host: 'x86 宿主，Intel / AMD 都行',
    guest: 'x86 版 macOS，从 10.4 到 26',
    gpu: '无直通＝软件渲染；直通 A 卡≈原生',
    tone: 'verified' as const,
  },
  {
    name: 'Virtualization.framework',
    projects: 'UTM · VirtualBuddy',
    host: '只能 Apple Silicon',
    guest: 'arm64 macOS',
    gpu: '有 Metal，接近原生',
    tone: 'conditional' as const,
  },
  {
    name: '全模拟（TCG）',
    projects: 'QEMU 无 KVM 模式',
    host: '任意平台',
    guest: '理论上都能跑',
    gpu: '慢到不可用，仅调试',
    tone: 'incompatible' as const,
  },
];

const PASSTHROUGH = [
  {
    gpu: 'AMD RX 580 / 6600 / 6800 XT',
    state: '可行',
    note: 'macOS 原生免驱，直通后接近物理机；部分型号需要 vendor-reset',
  },
  {
    gpu: 'AMD RX 6700 / 6750',
    state: '需 NootRX',
    note: '虚拟机内注入 kext 比裸机麻烦，成功率低一些',
  },
  {
    gpu: 'AMD RX 7900 XTX（Navi 3x）',
    state: '无意义',
    note: 'macOS 没有驱动，直通进去也只是块砖',
  },
  {
    gpu: 'NVIDIA GTX 16 / RTX 20–50',
    state: '基本没戏',
    note: 'NullMoth 是裸机驱动，依赖 GSP 固件与直连，虚拟机内通常起不来',
  },
  {
    gpu: 'NVIDIA Kepler（GTX 780）',
    state: '老系统可用',
    note: '只能在 Big Sur 及更早版本，配合 OCLP 补丁',
  },
];

export function VmPage() {
  useDocumentTitle('虚拟机');
  const vms = PROJECTS.filter((p) => p.category === 'virtualization').sort(
    (a, b) => b.stars - a.stars,
  );

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">虚拟机 / KVM</p>
          <h1>虚拟机不是退路，是另一条主线</h1>
          <p className="lead">
            黑苹果被讲成「拆机箱、刷 EFI」的事，但过去六年里跑 macOS 最省事的方式一直是 KVM：
            不用一台 Mac，不用挑主板，不用改 BIOS。x86 定格在 26.7 之后，这条路反而更重要了。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="table-shell">
            <div className="table-scroll">
              <table className="data" aria-label="三条虚拟化路线">
                <thead>
                  <tr>
                    <th>路线</th>
                    <th>代表项目</th>
                    <th>宿主要求</th>
                    <th>能跑什么</th>
                    <th>图形</th>
                  </tr>
                </thead>
                <tbody>
                  {ROUTES.map((r) => (
                    <tr key={r.name}>
                      <td>
                        <strong>{r.name}</strong>
                      </td>
                      <td>{r.projects}</td>
                      <td>{r.host}</td>
                      <td>{r.guest}</td>
                      <td>{r.gpu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="caption" style={{ marginTop: 8 }}>
            关键区别：KVM 需要 x86 宿主 + x86 版 macOS；Apple 的虚拟化框架只能跑在 Apple 硬件上。
            所以「在 ARM 板子上用虚拟机跑 macOS」两条路都堵死了——详见 <Link to="/arm">ARM 篇</Link>
            。
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">取舍</p>
              <h2>它能给你什么，拿不走什么</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                KVM 的本质是把「挑硬件」换成「配虚拟机」：虚拟硬件是固定的，OpenCore 只要针对 Q35 +
                OVMF 写一次，换机器直接迁移还能启动。
              </p>
            </div>
            <div className="grid grid--2">
              <div className="card">
                <h3 className="card__title">能拿到</h3>
                <ul className="list list--check">
                  <li>CPU 接近原生（KVM 硬件虚拟化，非模拟）</li>
                  <li>快照、克隆、回滚，装坏了三十秒还原</li>
                  <li>跑在无头服务器上，Proxmox 一条命令起一台</li>
                  <li>同一台机器同时开 Windows / Linux / macOS</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="card__title">拿不到</h3>
                <ul className="list list--cross">
                  <li>没有 GPU 直通就没有 Metal，界面卡顿、视频软解</li>
                  <li>iServices 要三码 + en0 内建网卡，比裸机更挑配置</li>
                  <li>DRM / FairPlay 基本放不了</li>
                  <li>ARM 宿主上完全无解</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>想把显卡塞进去，先看这张表</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            直通（VFIO）是把整张卡从宿主手里夺走，交给虚拟机独占。macOS 拿到的是真卡，
            所以能加载原生驱动——前提是这张卡在 macOS 里本来就免驱。
          </p>
          <div className="table-shell">
            <div className="table-scroll">
              <table className="data" aria-label="GPU 直通可行性">
                <thead>
                  <tr>
                    <th>显卡</th>
                    <th>可行性</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  {PASSTHROUGH.map((p) => (
                    <tr key={p.gpu}>
                      <td>
                        <strong>{p.gpu}</strong>
                      </td>
                      <td className="nowrap">{p.state}</td>
                      <td>{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="caption" style={{ marginTop: 8 }}>
            直通前提：主板开启 VT-d / AMD-Vi，内核带 iommu=pt，显卡独占一个 IOMMU 分组。 显卡和 USB
            控制器分在同一组是最常见的翻车点。
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>够用的六个项目</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            按 star 排序。「可复现」列说明是否有公开的第三方复现记录。
          </p>
          <div className="grid grid--2">
            {vms.map((p) => (
              <article key={p.id} className="card">
                <div className="card__head">
                  <a className="card__title" href={p.url} target="_blank" rel="noreferrer noopener">
                    {p.name}
                  </a>
                  <span className="badge badge--neutral mono-num">
                    {p.stars.toLocaleString('zh-CN')} ★
                  </span>
                  <span className="badge badge--neutral">{PROJECT_STATUS_LABEL[p.status]}</span>
                </div>
                <p className="card__body">{p.description}</p>
                <p className="card__foot">
                  <span className="mono-num">{p.repo}</span>
                  <span>{p.pushedAt}</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container--text">
          <h2 style={{ marginBottom: 8 }}>什么时候该选 KVM</h2>
          <div className="stack" style={{ marginTop: 16 }}>
            <div className="card">
              <h3 className="card__title">选它，如果</h3>
              <p className="card__body">
                你只是想试试 macOS / 跑 Xcode / 做 iOS 自动化测试 / 在一台服务器上同时跑三个系统。
                零硬件成本，装坏了删掉重来。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">别选它，如果</h3>
              <p className="card__body">
                你要剪视频、要 Metal、要 AirDrop、要一台能日常用的机器。直通能救一部分，
                但每多一层虚拟化，就多一个找不到原因的问题。
              </p>
            </div>
            <div className="callout">
              <strong>一个常被忽略的点：</strong>KVM 里跑的也是 x86 版
              macOS，所以它和裸机黑苹果共享同一个天花板——26.7。 虚拟机不能让你绕过 macOS 27
              的架构门槛。
            </div>
          </div>
          <SourceList
            ids={[
              'E-OSXKVM',
              'E-DOCKEROSX',
              'E-QUICKEMU',
              'E-OCISO',
              'E-PROXMOX-NEXT',
              'E-UTM',
              'E-VIRTUALBUDDY',
              'E-PVE-GUIDE',
            ]}
          />
        </div>
      </section>
    </>
  );
}
