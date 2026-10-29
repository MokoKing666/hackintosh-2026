import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareCard } from '@/components/HardwareCard';
import { SourceList } from '@/components/Evidence';

const COSTS = [
  {
    name: 'Docker Desktop',
    state: '不可用',
    note: 'Linux 容器依赖 Hypervisor.framework，只能退回远程 Docker',
  },
  { name: 'Parallels / VMware Fusion', state: '不可用', note: '启动即报错，无绕过方案' },
  { name: 'Android 模拟器（AVD）', state: '无硬件加速', note: '可运行但慢到不可用' },
  { name: 'Adobe 部分组件', state: '需额外补丁', note: 'Lightroom 与部分 GPU 加速路径' },
  { name: 'Intel MKL 依赖软件', state: '需替换库', note: '部分科学计算与 AI 工具链' },
  { name: 'FairPlay / Apple TV+', state: '依赖独显', note: '需免驱 A 卡，核显不行' },
];

export function AmdPage() {
  useDocumentTitle('AMD 平台');
  const cpus = HARDWARE.filter((h) => h.category === 'cpu' && h.platform === 'amd');
  const apus = HARDWARE.filter((h) => h.category === 'apu');
  const evidenceIds = [...new Set([...cpus, ...apus].flatMap((h) => h.evidenceIds))];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">AMD 平台</p>
          <h1 className="page-title">暴力的多核性能。代价明确的补丁哲学。</h1>
          <p className="lead">
            借助 AMD Vanilla 内核二进制补丁，Ryzen 全系均可引导 macOS 26
            Tahoe。但在上车之前，你必须清楚内核指令替换带来的三大结构性代价。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">兼容矩阵</p>
            <h2>Ryzen 与 Threadripper</h2>
          </div>
          <div className="grid grid--3">
            {[...cpus, ...apus].map((h) => (
              <HardwareCard key={h.id} h={h} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">补丁链</p>
              <h2>AMD_Vanilla 到底改了什么</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                它不是「让 macOS 支持 AMD」，而是把内核里那些假定「我是 Intel」的指令一条条替换掉。
                补丁是二进制级的，所以每个系统小版本都要重新对齐。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">① 核心数补丁（Core Count Patch）</h3>
                <p className="card__verdict">
                  补丁里有一个 <span className="code-pill">_cpuid_set_info</span> 替换块，
                  需要按物理核心数改最后一位：6 核写 <span className="code-pill">06</span>，8 核写{' '}
                  <span className="code-pill">08</span>，16 核写{' '}
                  <span className="code-pill">10</span>。写错会直接卡在启动早期。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">② MSR 与电源管理</h3>
                <p className="card__verdict">
                  绕开 Intel 专有的 MSR 读写，改走 AMD 等效路径，再由 VirtualSMC 模拟一层 SMC。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">③ PAT 重映射：两种流派</h3>
                <p className="card__verdict">
                  Algrey 补丁保守，显存带宽略低但音频/USB 更稳；Shaneee 补丁激进，跑分更高，
                  但在部分 Navi 卡上会出现爆音与 USB 掉线。选哪个取决于你是跑分还是干活。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">④ Zen4 / Zen5 的额外门槛</h3>
                <p className="card__verdict">
                  Zen4 需 IOPCIFamily 补丁（同时修好 MSI 500 系主板）；Zen5 依赖 OpenCore ≥ 1.0.2 的
                  CPU 家族识别，公开案例很少。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">结构性代价</p>
            <h2>没有 Hypervisor，半个生态断掉</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              AMD 补丁绕过了 Intel 的虚拟化指令，代价是 Hypervisor.framework 起不来。
              这不是「虚拟机慢一点」，是直接不可用。
            </p>
          </div>
          <div className="table-shell">
            <div className="table-scroll">
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
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
