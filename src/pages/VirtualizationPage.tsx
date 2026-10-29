import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PROJECTS, PROJECT_STATUS_LABEL } from '@/domain/projects';
import { EvidencePopover } from '@/components/EvidencePopover';
import { SourceList } from '@/components/Evidence';

const ROUTES = [
  {
    name: 'QEMU / KVM + VFIO',
    projects: 'OSX-KVM · Docker-OSX · quickemu · OpenCore-ISO',
    host: 'x86 宿主，Intel / AMD 均可',
    guest: 'x86 版 macOS，10.4 – 26',
    cpu: '≈ 97%（host-passthrough）',
    metal: '直通 A 卡 ≈ 原生；无直通则软渲染',
  },
  {
    name: 'Virtualization.framework',
    projects: 'UTM · VirtualBuddy',
    host: '仅 Apple Silicon',
    guest: 'arm64 macOS',
    cpu: '≈ 98%',
    metal: '有 Metal，接近原生',
  },
  {
    name: 'QEMU TCG 全模拟',
    projects: 'QEMU 无 KVM 模式',
    host: '任意平台',
    guest: '跨架构（x86_64 ↔ arm64）',
    cpu: '≈ 10–20%',
    metal: '无硬件加速',
  },
];

const COMPARE = [
  { dim: 'CPU 损耗', kvm: '可忽略', vf: '可忽略', tcg: '数量级下降' },
  { dim: 'Metal 图形', kvm: '需 GPU 直通', vf: '原生支持', tcg: '无' },
  { dim: 'iServices 登录', kvm: '需三码 + en0', vf: '较稳定', tcg: '基本不可用' },
  { dim: 'USB 直通', kvm: '需 IOMMU 分组', vf: '受限', tcg: '受限' },
];

export function VirtualizationPage() {
  useDocumentTitle('虚拟化');
  const vms = PROJECTS.filter((p) => p.category === 'virtualization').sort(
    (a, b) => b.stars - a.stars,
  );

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">虚拟化</p>
          <h1 className="page-title">当裸机遇阻，把硬件交给 Hypervisor。</h1>
          <p className="lead">
            虚拟化是绕过主板 ACPI 泥潭与 CPU 架构限制的工程捷径。但不同的虚拟化层级，
            决定了你拿到的是生产力工具还是仅供调试的沙盒。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="grid grid--3">
            {ROUTES.map((r) => (
              <article key={r.name} className="card">
                <h3 className="card__title">{r.name}</h3>
                <p className="card__verdict" style={{ marginTop: 6 }}>
                  {r.projects}
                </p>
                <dl className="kv" style={{ marginTop: 16 }}>
                  <div>
                    <dt>宿主</dt>
                    <dd>{r.host}</dd>
                  </div>
                  <div>
                    <dt>客户机</dt>
                    <dd>{r.guest}</dd>
                  </div>
                  <div>
                    <dt>CPU</dt>
                    <dd>{r.cpu}</dd>
                  </div>
                  <div>
                    <dt>图形</dt>
                    <dd>{r.metal}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">横向对比</p>
            <h2>四个维度决定它能干什么</h2>
          </div>
          <div className="table-shell">
            <div className="table-scroll">
              <table className="data" aria-label="虚拟化方案对比">
                <thead>
                  <tr>
                    <th>维度</th>
                    <th>QEMU / KVM + VFIO</th>
                    <th>Virtualization.framework</th>
                    <th>TCG 全模拟</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((c) => (
                    <tr key={c.dim}>
                      <td>
                        <strong>{c.dim}</strong>
                      </td>
                      <td>{c.kvm}</td>
                      <td>{c.vf}</td>
                      <td>{c.tcg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-caption">
              <span>KVM 跑的是 x86 版 macOS，天花板与裸机一致：26.7</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">GPU 直通</p>
              <h2>IOMMU 分组决定成败</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                直通（VFIO）是把整张卡从宿主手里夺走，交给虚拟机独占。macOS 拿到的是真卡，
                所以能加载原生驱动——前提是这张卡本来就免驱。
              </p>
              <p className="small muted" style={{ marginTop: 12 }}>
                前提：主板开启 VT-d / AMD-Vi，内核带 iommu=pt，显卡独占一个 IOMMU 分组。 显卡与 USB
                控制器同组是最常见的翻车点。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">可行</h3>
                <p className="card__verdict">
                  RX 580 / 6600 / 6800 XT：macOS 原生免驱，直通后接近物理机。 部分型号需要
                  vendor-reset 才能在虚拟机重启后恢复。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">勉强</h3>
                <p className="card__verdict">
                  RX 6700 / 6750 需 NootRX，虚拟机内注入比裸机麻烦，成功率更低。 Navi 3x
                  没有驱动，直通进去也只是块砖。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">基本没戏</h3>
                <p className="card__verdict">
                  NVIDIA 16–50 系：NullMoth 面向裸机，依赖 GSP 固件与直连，虚拟机内通常起不来。
                </p>
                <div className="card__foot">
                  <span className="caption">直通结论依赖具体 IOMMU 分组</span>
                  <EvidencePopover ids={['E-PVE-GUIDE', 'E-NULLMOTH-TS']} />
                </div>
              </div>
              <div className="callout">
                <strong>ARM 上的例外：</strong>UTM / VirtualBuddy 只能跑在 Apple Silicon
                宿主上。想在 ARM 板子上用虚拟机跑 macOS，两条路都是架构性为零——见{' '}
                <Link to="/arm">ARM 篇</Link>。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">项目</p>
            <h2>{vms.length} 个够用的选择</h2>
          </div>
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
                </div>
                <p className="card__verdict">{p.description}</p>
                <div className="card__foot">
                  <span className="caption mono-num">{p.repo}</span>
                  <span className="caption">
                    {PROJECT_STATUS_LABEL[p.status]} · {p.pushedAt}
                  </span>
                </div>
              </article>
            ))}
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
