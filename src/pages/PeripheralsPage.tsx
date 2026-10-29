import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareTable } from '@/components/HardwareTable';
import { SourceList } from '@/components/Evidence';

export function PeripheralsPage() {
  useDocumentTitle('外设资料');
  const wifi = HARDWARE.filter((h) => h.category === 'wifi');
  const audio = HARDWARE.filter((h) => h.category === 'audio');
  const eth = HARDWARE.filter((h) => h.category === 'ethernet');
  const storage = HARDWARE.filter((h) => h.category === 'storage');
  const evidenceIds = [
    ...new Set([...wifi, ...audio, ...eth, ...storage].flatMap((h) => h.evidenceIds)),
  ];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">外设</p>
          <h1>装完之后才是坑</h1>
          <p className="lead">
            显卡决定能不能进桌面，外设决定能不能用下去。2026 年最麻烦的两件事都在这一层： Tahoe
            删掉了 AppleHDA，Broadcom 老卡的原生驱动也早就没了。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>无线：四条路线，没有一条全能</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            要 AirDrop 只有 Broadcom 一条路；只要上网，Intel 卡最省事；Wi-Fi 7 与 MT792x
            都还是实验阶段。
          </p>
          <HardwareTable rows={wifi} label="无线网卡兼容矩阵" />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">音频</p>
              <h2>Tahoe 删了 AppleHDA，所有人被迫重选方案</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                macOS 26 不再自带 AppleHDA.kext，AppleALC
                直接失效。现在有三条路，按「改动系统的程度」从轻到重排列。
              </p>
            </div>
            <div className="stack">
              <div className="card">
                <h3 className="card__title">① SimpleHDA 1.0.0 —— 首选</h3>
                <p className="card__body">
                  用 Lilu 插件 + OpenCore 注入恢复原生 AppleHDA，不改系统卷、不重建 KC， 现有
                  AppleALC layout 可以继续用。需要 Lilu ≥ 1.7.1 与 keepsyms=1。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">② MyKextInstaller v1.8 —— 有风险</h3>
                <p className="card__body">
                  从 KDK 里把 AppleHDA 重新注入系统卷。社区里有把系统搞坏、必须进 Recovery
                  修的案例。
                </p>
              </div>
              <div className="card">
                <h3 className="card__title">③ VoodooHDA 3.1.x —— 保底</h3>
                <p className="card__body">
                  最老的方案，Tahoe 上又活了过来。需要把 csr-active-config 设成 03000000。
                  音质与音量控制不如原生，但最省事。
                </p>
              </div>
            </div>
          </div>
          <div className="callout" style={{ marginTop: 16 }}>
            <strong>不受影响的部分：</strong>HDMI / DisplayPort / USB 音频。它们不走 AppleHDA，
            所以外接显示器出声、USB 声卡都正常。
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: 8 }}>音频与有线</h2>
          <p className="small muted" style={{ marginBottom: 16 }}>
            有线几乎不是问题，除了 Intel 2.5G 那两代需要区分：I225-V 在 Tahoe 是原生支持，I226-V
            还得靠第三方 kext。
          </p>
          <div className="grid grid--2">
            <div>
              <p className="caption" style={{ marginBottom: 8 }}>
                音频
              </p>
              <HardwareTable rows={audio} label="音频兼容矩阵" />
            </div>
            <div>
              <p className="caption" style={{ marginBottom: 8 }}>
                有线网卡
              </p>
              <HardwareTable rows={eth} label="有线网卡兼容矩阵" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">存储</p>
              <h2>装机前就要避开的那几块盘</h2>
              <p className="lead" style={{ marginTop: 12 }}>
                PM981 / PM991 是经典雷区，表现为安装阶段卡死。其余主流 NVMe 基本可用，建议加 NVMeFix
                改善电源管理。
              </p>
            </div>
            <div>
              <HardwareTable rows={storage} label="存储兼容矩阵" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            <div className="card">
              <h3 className="card__title">USB 映射</h3>
              <p className="card__body">
                必须做，否则会出现「USB 3.0 口只跑 2.0」「插拔后睡眠失效」这类玄学问题。 工具从
                USBToolBox（已停更）转向 corpnewt/USBMap。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">睡眠与唤醒</h3>
              <p className="card__body">
                标准三件套：SSDT-PLUG、SSDT-EC、SSDT-USBX，配合 XcpmExtraMsrs。 AMD
                平台偶发不睡；ARM 侧睡眠属于未实现，不是配置问题。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">iServices 三码</h3>
              <p className="card__body">
                iMessage / FaceTime 需要 SystemSerialNumber、MLB、ROM 三码齐全，且网卡必须是内建
                en0。 2026-06 Apple 上线异常检测，一批账号被误锁，建议用小号。
              </p>
              <p className="card__foot">
                <span>有封号风险</span>
              </p>
            </div>
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
