import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ARM_ROUTES } from '@/domain/arm';
import { HARDWARE } from '@/domain/hardware';
import { PROJECTS } from '@/domain/projects';
import { HardwareTable } from '@/components/HardwareTable';
import { VerdictBadge } from '@/components/VerdictBadge';
import { EvidenceList, SourceList } from '@/components/Evidence';

const BOOT_LABEL: Record<string, string> = {
  'el2-monitor': 'EL2 监视器（伪装 Apple 平台契约）',
  'uefi-efi': '真实 UEFI / EFI 引导',
  virtualization: '虚拟机',
  none: '无',
};

export function ArmPage() {
  useDocumentTitle('ARM 移植');
  const rows = HARDWARE.filter((h) => h.category === 'arm');
  const armProjects = PROJECTS.filter((p) => p.category === 'arm');
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
          <p className="eyebrow">ARM</p>
          <h1>四条路线，两种底层逻辑</h1>
          <p className="lead">
            2026 年的 ARM 黑苹果不是一个项目，是四条互不背书的技术路线。它们唯一的共同点是：
            都要骗过 macOS 对 Apple 硬件的那套假设。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="stack-lg">
            {ARM_ROUTES.map((r) => (
              <article key={r.id} className="card">
                <div className="card__head">
                  <h2 className="card__title">{r.name}</h2>
                  <VerdictBadge verdict={r.verdict} />
                  <span className="badge badge--neutral">{BOOT_LABEL[r.bootMethod]}</span>
                  {r.singleDevice && <span className="badge badge--neutral">单机型</span>}
                  {r.requiresHostMac && <span className="badge badge--neutral">需 Mac 主机</span>}
                </div>
                <p className="card__body">
                  主导：{r.lead} · 已达成：{r.osReached}
                </p>
                <div className="grid grid--2" style={{ marginTop: 12 }}>
                  <div>
                    <p className="caption" style={{ marginBottom: 6 }}>
                      已实现
                    </p>
                    <ul className="list list--check">
                      {r.achieved.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="caption" style={{ marginBottom: 6 }}>
                      仍缺
                    </p>
                    <ul className="list list--cross">
                      {r.missing.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="small muted" style={{ marginTop: 12 }}>
                  {r.notes}
                </p>
                <div style={{ marginTop: 12 }}>
                  <EvidenceList ids={r.evidenceIds} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>平台清单：能跑到哪一步</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            「实验性支持」意味着有代码或实机演示，但离日常可用还有距离；「已知不兼容」意味着目前没有任何公开方案。
          </p>
          <HardwareTable
            rows={rows}
            label="ARM 平台兼容矩阵"
            caption={
              <span>
                证据等级见每行的条码：官方文档 &gt; 上游代码 &gt; 社区报告 &gt; 项目方声明 &gt;
                推断。
              </span>
            }
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">为什么难</p>
              <h2>三年只有个位数团队做出来</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                x86 黑苹果是配置工程：UEFI、ACPI、PCIe 都是公开标准。ARM 这边没有标准可依。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">没有 iBoot，也没有设备树</h3>
                <p className="card__body">
                  Apple 的启动链是 BootROM → iBoot → 内核，中间没有 UEFI 接口。要引导 macOS，
                  要么伪造整套 EFI 环境，要么在 EL2 里造一个假平台。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">页表粒度对不上</h3>
                <p className="card__body">
                  XNU 在 Apple Silicon 上按 16KiB 页管理内存，多数 ARM SoC 的 MMU 只认 4KiB。
                  Snapintosh 为此做了一层影子页表。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">GPU 闭源，只能自己写驱动栈</h3>
                <p className="card__body">
                  Adreno、Mali 都没有 macOS 驱动。Snapintosh 自己写了 Metal 插件与 IOGPU kext， 再把
                  Apple 的 AIR 翻译成 Mesa 的 ir3。
                </p>
              </div>
              <div className="callout callout--warn">
                <strong>关于虚拟机：</strong>UTM、VirtualBuddy 只支持 Apple Silicon 宿主，QEMU 没有
                arm64 macOS 机器模型。在非 Apple ARM 硬件上用虚拟机跑 macOS 是架构性为零。
                反过来，x86 上的 KVM 是条成熟主线——见 <Link to="/vm">虚拟机篇</Link>。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>相关项目</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            共 {armProjects.length} 个，按 star 排序。「代码」列说明是否公开可复现。
          </p>
          <div className="grid grid--2">
            {[...armProjects]
              .sort((a, b) => b.stars - a.stars)
              .map((p) => (
                <article key={p.id} className="card">
                  <div className="card__head">
                    <a
                      className="card__title"
                      href={p.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {p.name}
                    </a>
                    <span className="badge badge--neutral mono-num">
                      {p.stars.toLocaleString('zh-CN')} ★
                    </span>
                  </div>
                  <p className="card__body">{p.description}</p>
                  <p className="card__foot">
                    <span className="mono-num">{p.repo}</span>
                    <span>{p.pushedAt}</span>
                  </p>
                </article>
              ))}
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
