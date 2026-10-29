import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareTable } from '@/components/HardwareTable';
import { SourceList } from '@/components/Evidence';

const COSTS = [
  {
    name: 'Docker Desktop',
    state: '不可用',
    note: 'Linux 容器需要 HVF，只能退回远程 Docker 或 Colima 的远程模式',
  },
  { name: 'Parallels Desktop', state: '不可用', note: '启动即报错' },
  { name: 'VMware Fusion', state: '不可用', note: '同上' },
  { name: 'Android 模拟器（AVD）', state: '无硬件加速', note: '能跑但慢到不可用' },
  { name: 'Adobe 部分组件', state: '需额外 patch', note: 'Lightroom 与部分 GPU 加速路径' },
  { name: 'FairPlay / Apple TV+', state: '依赖独显', note: '需免驱 A 卡，核显不行' },
];

export function AmdPage() {
  useDocumentTitle('AMD 平台');
  const cpus = HARDWARE.filter((h) => h.category === 'cpu' && h.platform === 'amd');
  const apus = HARDWARE.filter((h) => h.category === 'apu');
  const evidenceIds = [
    ...new Set([...cpus.flatMap((c) => c.evidenceIds), ...apus.flatMap((a) => a.evidenceIds)]),
  ];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">AMD</p>
          <h1>用补丁换来的性能</h1>
          <p className="lead">
            AMD 平台的性价比一直很有说服力：同样的钱买到更多核心，Zen3 至今是最成熟的非 Intel 方案。
            代价不在装的时候，而在装完之后——你会发现某些东西永远用不了。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <HardwareTable
            rows={cpus}
            label="AMD CPU 兼容矩阵"
            caption={<span>所有 AMD 方案的共同代价：没有 Hypervisor，且必须配独显。</span>}
          />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">补丁链</p>
              <h2>AMD_Vanilla 做的四件事</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                它不是「让 macOS 支持 AMD」，而是把内核里那些假定「我是 Intel」的指令一条条改掉。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">① 改 CPUID 与核心数</h3>
                <p className="card__body">
                  补丁里有一个 _cpuid_set_info 的替换块，需要按物理核心数改最后一位（8 核写 08，12
                  核写 0C）。 改错会直接卡在启动早期。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">② 补 MSR 与电源管理</h3>
                <p className="card__body">
                  绕开 Intel 专有的 MSR 读写，改走 AMD 的等效路径，再由 VirtualSMC 模拟一层 SMC。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">③ Zen4 额外打 IOPCIFamily 补丁</h3>
                <p className="card__body">
                  这一条同时修好 MSI 的 A520 / B550 / X570 主板，Zen4 平台默认启用。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">④ Zen5 需要 OpenCore ≥ 1.0.2</h3>
                <p className="card__body">
                  靠 AMD_CPU_EXT_FAMILY_1AH
                  支持。注意：公开案例很少，社区把它归在「验证中」，不是「成熟」。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--invert">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">代价</p>
              <h2>没有 Hypervisor，等于半个生态断掉</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                AMD 补丁绕过了 Intel 的虚拟化指令，代价是 Hypervisor.framework 起不来。
                这不是「虚拟机慢一点」，是直接不可用。
              </p>
            </div>
            <div className="card" style={{ background: 'transparent' }}>
              <table className="data" aria-label="AMD 平台不可用功能">
                <thead>
                  <tr>
                    <th>依赖项</th>
                    <th>状态</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  {COSTS.map((c) => (
                    <tr key={c.name}>
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td className="nowrap">{c.state}</td>
                      <td>{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="callout callout--warn" style={{ marginTop: 20 }}>
            <strong>先问自己一句：</strong>你平时开不开 Docker？如果开，AMD 平台基本可以排除，
            除非你愿意把容器全放到另一台机器上。
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>APU 核显：断代非常干净</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            NootedRed 是唯一能让 AMD 核显出画面的项目，但它只覆盖 GCN / Vega 一代，再往后就断了。
          </p>
          <HardwareTable rows={apus} label="AMD APU 兼容矩阵" />
          <div className="callout" style={{ marginTop: 16 }}>
            <strong>一个容易忽略的细节：</strong>NootedRed 的 README 上挂着「written by humans, not
            AI」徽章， 并在 2026-10 换成了 ChefKiss Open Knowledge License
            v1，明文禁止用于训练或配合 AI。 这个圈子里，「谁写的」本身已经成了立场问题。
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
