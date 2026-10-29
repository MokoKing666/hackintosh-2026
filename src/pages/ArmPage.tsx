import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ARM_ROUTES } from '@/domain/arm';
import { HARDWARE } from '@/domain/hardware';
import { PROJECTS } from '@/domain/projects';
import { HardwareCard } from '@/components/HardwareCard';
import { VerdictBadge } from '@/components/VerdictBadge';
import { EvidencePopover } from '@/components/EvidencePopover';
import { SourceList } from '@/components/Evidence';

const STAGES = ['Bootloader', 'XNU 内核', 'launchd', 'GUI 帧缓冲', 'Metal 加速'] as const;

type StageState = 'yes' | 'partial' | 'no';

const MATRIX: Record<string, Record<(typeof STAGES)[number], StageState>> = {
  'arm-unixnu': {
    Bootloader: 'yes',
    'XNU 内核': 'yes',
    launchd: 'yes',
    'GUI 帧缓冲': 'yes',
    'Metal 加速': 'partial',
  },
  'arm-snapintosh': {
    Bootloader: 'yes',
    'XNU 内核': 'yes',
    launchd: 'yes',
    'GUI 帧缓冲': 'yes',
    'Metal 加速': 'partial',
  },
  'arm-rk3588': {
    Bootloader: 'yes',
    'XNU 内核': 'yes',
    launchd: 'yes',
    'GUI 帧缓冲': 'partial',
    'Metal 加速': 'partial',
  },
};

const MARK: Record<StageState, string> = { yes: '✓', partial: '◐', no: '✕' };

export function ArmPage() {
  useDocumentTitle('ARM 移植');
  const rows = HARDWARE.filter((h) => h.category === 'arm');
  const armProjects = PROJECTS.filter((p) => p.category === 'arm').sort(
    (a, b) => b.stars - a.stars,
  );
  const evidenceIds = [
    ...new Set([
      ...rows.flatMap((r) => r.evidenceIds),
      ...ARM_ROUTES.flatMap((r) => r.evidenceIds),
    ]),
  ];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">ARM 移植</p>
          <h1 className="page-title">跨越 Apple Silicon 的高墙。</h1>
          <p className="lead">
            将 XNU 内核与 macOS / iOS 用户态运行在非 Apple 的 ARM64 SoC
            上，是最具极客想象力、却也最容易混杂夸大宣传的领域。本站按代码公开度、启动阶段与图形加速真实性对各项目进行独立取证。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="stack-lg">
            {ARM_ROUTES.map((r) => (
              <article key={r.id} className="card">
                <div className="card__head">
                  <div>
                    <h2 className="card__title" style={{ fontSize: '1.25rem' }}>
                      {r.name}
                    </h2>
                    <p className="caption" style={{ marginTop: 4 }}>
                      {r.lead} · 已达成 {r.osReached}
                    </p>
                  </div>
                  <VerdictBadge verdict={r.verdict} />
                </div>

                <div className="grid grid--2" style={{ marginTop: 16 }}>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 8 }}>
                      已实现
                    </p>
                    <ul className="list list--check">
                      {r.achieved.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 8 }}>
                      仍缺
                    </p>
                    <ul className="list list--cross">
                      {r.missing.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="card__verdict" style={{ marginTop: 16 }}>
                  {r.notes}
                </p>

                <div className="card__foot">
                  <span className="caption">
                    {r.singleDevice ? '单机型锁定' : '通用平台'} ·{' '}
                    {r.requiresHostMac ? '需 macOS 主机喂入' : '可独立引导'}
                  </span>
                  <EvidencePopover ids={r.evidenceIds} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">启动阶段</p>
            <h2>「跑起来了」有五个不同的含义</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              从引导器接管到 Metal
              加速，每一步之间的工程量差一个数量级。这张表是判断项目成熟度的唯一可靠刻度。
            </p>
          </div>

          <div className="table-shell">
            <div className="table-scroll">
              <table className="data" aria-label="ARM 移植项目启动阶段对比">
                <thead>
                  <tr>
                    <th>项目</th>
                    {STAGES.map((s) => (
                      <th key={s}>{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ARM_ROUTES.filter((r) => MATRIX[r.id]).map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.name}</strong>
                      </td>
                      {STAGES.map((s) => (
                        <td key={s} className="mono-num">
                          {MARK[MATRIX[r.id]![s]]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <strong>ios-sweet</strong>
                    </td>
                    <td className="mono-num">✓</td>
                    <td className="mono-num">✓</td>
                    <td className="mono-num">✓</td>
                    <td className="mono-num">✓</td>
                    <td className="mono-num">✕</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="table-caption">
              <span>✓ 已达成 · ◐ 部分达成 · ✕ 未达成；数据来自各项目 README 与实机演示</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">平台清单</p>
            <h2>能跑到哪一步，逐条记录</h2>
          </div>
          <div className="grid grid--3">
            {rows.map((h) => (
              <HardwareCard key={h.id} h={h} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">为什么难</p>
              <h2>三年只有个位数团队做出来</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                x86 黑苹果是配置工程：UEFI、ACPI、PCIe 都是公开标准。ARM 这边没有标准可依，
                每一步都要先伪造一个 Apple 硬件「应该长什么样」的假设。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">没有 iBoot，也没有设备树</h3>
                <p className="card__verdict">
                  Apple 的启动链是 BootROM → iBoot → 内核，中间没有 UEFI 接口。要引导 macOS，
                  要么伪造整套 EFI 环境，要么在 EL2 里造一个假平台。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">页表粒度对不上</h3>
                <p className="card__verdict">
                  XNU 在 Apple Silicon 上按 16KiB 页管理内存，多数 ARM SoC 的 MMU 只认 4KiB。
                  Snapintosh 为此做了一层影子页表。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">GPU 闭源，只能自己写驱动栈</h3>
                <p className="card__verdict">
                  Adreno、Mali 都没有 macOS 驱动。Snapintosh 自写 Metal 插件与 IOGPU kext， 再把
                  Apple 的 AIR 翻译成 Mesa 的 ir3。
                </p>
              </div>
              <div className="callout callout--warn">
                <strong>关于虚拟机：</strong>UTM、VirtualBuddy 只支持 Apple Silicon 宿主，QEMU 没有
                arm64 macOS 机器模型。ARM 上用虚拟机跑 macOS 是架构性为零。 反过来，x86 上的 KVM
                是条成熟主线——见 <Link to="/virtualization">虚拟化篇</Link>。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">相关项目</p>
            <h2>{armProjects.length} 个仓库，按 Star 排序</h2>
          </div>
          <div className="grid grid--2">
            {armProjects.map((p) => (
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
                  <span className="caption">{p.pushedAt}</span>
                </div>
              </article>
            ))}
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
