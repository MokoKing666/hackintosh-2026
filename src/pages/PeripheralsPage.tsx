import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HARDWARE } from '@/domain/hardware';
import { HardwareCard } from '@/components/HardwareCard';
import { SourceList } from '@/components/Evidence';

export function PeripheralsPage() {
  useDocumentTitle('外设资料');
  const wifi = HARDWARE.filter((h) => h.category === 'wifi');
  const audio = HARDWARE.filter((h) => h.category === 'audio');
  const net = HARDWARE.filter((h) => h.category === 'ethernet' || h.category === 'storage');
  const evidenceIds = [...new Set([...wifi, ...audio, ...net].flatMap((h) => h.evidenceIds))];

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">外设资料</p>
          <h1 className="page-title">决定日常幸福感的最后一公里。</h1>
          <p className="lead">
            能进桌面只是第一步。无线网络、蓝牙、音频、USB 端口映射与连续互通，
            才是决定一台黑苹果能否长期服役的关键。
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">Wi-Fi 与蓝牙</p>
            <h2>四条路线，没有一条全能</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              要 AirDrop 只有 Broadcom 一条路；只要上网，Intel 卡最省事； Wi-Fi 7 与 MT792x
              都还在实验阶段。
            </p>
          </div>
          <div className="grid grid--3">
            {wifi.map((h) => (
              <HardwareCard key={h.id} h={h} />
            ))}
          </div>
          <div className="callout" style={{ marginTop: 20 }}>
            <strong>连续互通功能对照：</strong>AirDrop / Handoff / 通用剪贴板 需要 Broadcom 卡 +
            OCLP 根补丁；Intel 卡在 Tahoe 下可用但 AirDrop 永久无解。这不是驱动没写好， 而是 AWDL
            依赖 Apple 私有固件接口。
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">音频</p>
            <h2>Tahoe 删掉 AppleHDA 之后</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              macOS 26 不再自带 AppleHDA.kext，AppleALC 直接失效。三条路，按改动系统的程度排序。
            </p>
          </div>
          <div className="grid grid--3">
            <div className="card">
              <h3 className="card__title">① SimpleHDA 1.0.0</h3>
              <p className="card__verdict">
                Lilu 插件 + OpenCore 注入恢复原生 AppleHDA，不改系统卷、不重建 KC， 现有 AppleALC
                layout 可继续用。需 Lilu ≥ 1.7.1 与 keepsyms=1。
              </p>
              <div className="card__specs">
                <span>首选</span>
                <span>2026-10-13</span>
              </div>
            </div>
            <div className="card">
              <h3 className="card__title">② MyKextInstaller v1.8</h3>
              <p className="card__verdict">
                从 KDK 把 AppleHDA 重新注入系统卷。社区有把系统搞坏、必须进 Recovery 修的案例。
              </p>
              <div className="card__specs">
                <span>有风险</span>
              </div>
            </div>
            <div className="card">
              <h3 className="card__title">③ VoodooHDA 3.1.x</h3>
              <p className="card__verdict">
                最老的方案，Tahoe 上又活了。需要把 csr-active-config 设成 03000000。
                音质与音量控制不如原生，但最省事。
              </p>
              <div className="card__specs">
                <span>保底</span>
              </div>
            </div>
          </div>
          <div className="grid grid--3" style={{ marginTop: 16 }}>
            {audio.map((h) => (
              <HardwareCard key={h.id} h={h} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">有线与存储</p>
            <h2>装机前就该避开的那几块盘</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              I225-V 在 Tahoe 原生可用，I226-V 还得靠第三方 kext； PM981 / PM991
              是经典雷区，表现为安装阶段卡死。
            </p>
          </div>
          <div className="grid grid--3">
            {net.map((h) => (
              <HardwareCard key={h.id} h={h} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--elevated">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">USB 与电源</p>
            <h2>两个不会报错、只会让人抓狂的问题</h2>
          </div>
          <div className="grid grid--3">
            <div className="card">
              <h3 className="card__title">USB 15 端口限制</h3>
              <p className="card__verdict">
                必须做端口映射，否则会出现「USB 3.0 口只跑 2.0」「插拔后睡眠失效」。 工具从
                USBToolBox（已停更）转向 corpnewt/USBMap。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">睡眠秒醒</h3>
              <p className="card__verdict">
                标准三件套：SSDT-PLUG、SSDT-EC、SSDT-USBX，配合 XcpmExtraMsrs。 AMD
                平台偶发不睡；ARM 侧睡眠属于未实现，不是配置问题。
              </p>
            </div>
            <div className="card">
              <h3 className="card__title">iServices 三码</h3>
              <p className="card__verdict">
                iMessage / FaceTime 需要 SystemSerialNumber、MLB、ROM 三码齐全， 且网卡必须是内建
                en0。2026-06 Apple 上线异常检测，一批账号被误锁。
              </p>
              <div className="card__specs">
                <span>有封号风险</span>
                <span>建议用小号</span>
              </div>
            </div>
          </div>
          <SourceList ids={evidenceIds} />
        </div>
      </section>
    </>
  );
}
