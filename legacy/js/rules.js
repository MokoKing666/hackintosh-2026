/* ============================================================
   rules.js — 配置生成器规则引擎（纯函数，无 DOM）
   输入 {platform, cpu, gpu, wifi, audio, os}，输出结论 + 三段清单
   每条结论都带 evidence，便于在 UI 上标来源
   ============================================================ */

window.RULES = (function () {
  "use strict";

  var OS_ORDER = { "14": 14, "15": 15, "26": 26, "26.7": 26.7, "27": 27 };

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function num(v) {
    if (OS_ORDER[v] != null) return OS_ORDER[v];
    var m = String(v).match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }

  function solve(input) {
    var out = {
      verdict: { level: "ok", label: "可以装", note: "" },
      osCap: "—",
      must: [],
      risk: [],
      blocked: [],
    };
    var must = out.must;
    var risk = out.risk;
    var blocked = out.blocked;
    var target = num(input.os);

    /* ---------- 1. 平台闸门 ---------- */
    if (input.platform === "arm") {
      var a = find(window.HW.arm, input.cpu);
      if (!a) {
        blocked.push({ text: "未识别的 ARM 平台", ev: "数据集无此条目" });
        return finish(out);
      }
      out.osCap = a.cap ? "macOS " + a.cap + (a.id === "rk3588" ? " Beta" : "") : "—";
      if (a.verdict === "none") {
        blocked.push({ text: a.name + " 目前没有任何可用的 macOS 引导方案", ev: a.note });
        return finish(out);
      }
      if (a.cap && target > num(a.cap)) {
        blocked.push({
          text: "目标系统超出该平台已达成的高度",
          ev: "该平台目前最高验证到 macOS " + a.cap,
        });
      }
      if (a.id === "snapintosh") {
        must.push({
          text: "机型必须是 ASUS Zenbook A16（UX3607OA）+ 骁龙 X2 Elite X2E-96-100",
          ev: "Snapintosh README：Nothing else is supported",
        });
        must.push({
          text: "每次启动都需要一台跑 macOS 27 的 Mac，经 USB-C 建立 NCM 链路喂入内核与日志",
          ev: "Snapintosh 硬性前提",
        });
        risk.push({
          text: "音频 / 摄像头 / 蓝牙 / 睡眠 / 外接显示器全部不可用；帧率未达 60Hz",
          ev: "Snapintosh README Status 表",
        });
        risk.push({
          text: "q1n1 上游为 GPL-2.0 的 m1n1，fork 标注 MIT，存在许可冲突",
          ev: "Snapintosh/q1n1 仓库元数据",
        });
      }
      if (a.id === "unixnu") {
        must.push({
          text: "需要 BootShim + Mu-Silicium UEFI + UniXNU.efi + DarwinBoot 全链路，且设备需有对应 UEFI 移植",
          ev: "UniXNU 六层架构",
        });
        risk.push({
          text: "公开验证到 iPadOS 17.7.11 与 macOS Recovery，尚未到 macOS 桌面",
          ev: "UniXNU 仓库与 unixnu.com 文档",
        });
      }
      if (a.id === "rk3588") {
        risk.push({
          text: "零代码公开：只有 Telegram 频道与推文，没有仓库、EFI 或可复现步骤",
          ev: "QiuChenly 的成果发布渠道",
        });
        risk.push({
          text: "已驱动仅限双 2.5G 网口、NVMe、32GB 内存总线、Mali-G610 初驱；完整加速与无线仍在待办",
          ev: "@realNyarime 2026-10-28 推文",
        });
      }
      out.verdict = {
        level: "exp",
        label: "实验性可行",
        note: "有实机成果，但没有面向公众的安装路径，别当日常主力。",
      };
      return finish(out);
    }

    /* ---------- 2. x86 平台闸门 ---------- */
    out.osCap = "macOS 26.7.x";
    if (target >= 27) {
      blocked.push({
        text: "macOS 27 只支持 Apple Silicon，x86 平台无法安装",
        ev: "WWDC26 / MacRumors 2026-09-25 / OCLP 声明",
      });
    }

    var cpu = find(window.HW.cpus, input.cpu);
    var gpu = find(window.HW.gpus, input.gpu);
    var wifi = find(window.HW.wifi, input.wifi);
    var audio = find(window.HW.audio, input.audio);

    if (!cpu || !gpu) {
      blocked.push({ text: "未识别的硬件组合", ev: "数据集无此条目" });
      return finish(out);
    }

    /* ---------- 3. CPU 层 ---------- */
    var f = cpu.flags || [];
    if (f.indexOf("cpuid-mask") > -1) {
      must.push({
        text: "Kernel → Emulate 设 Cpuid1Data / Cpuid1Mask 伪装成 Comet Lake，并开启 ProvideCurrentCpuInfo",
        ev: "12~14 代混合架构必需",
      });
    }
    if (f.indexOf("amd-vanilla") > -1) {
      must.push({
        text: "应用 AMD_Vanilla 内核补丁，并按物理核心数改写 _cpuid_set_info 的末位",
        ev: "AMD-OSX/AMD_Vanilla",
      });
    }
    if (f.indexOf("no-hypervisor") > -1) {
      risk.push({
        text: "没有 Hypervisor：Docker Desktop、Parallels、VMware Fusion、安卓模拟器硬加速全部不可用",
        ev: "AMD 补丁绕过 Intel 虚拟化指令的必然结果",
      });
    }
    if (f.indexOf("iopci-patch") > -1) {
      must.push({
        text: "启用 IOPCIFamily 补丁（Zen4 默认，同时修 MSI A520/B550/X570）",
        ev: "AMD_Vanilla Zen4 补丁集",
      });
    }
    if (f.indexOf("oc-102") > -1) {
      must.push({
        text: "OpenCore 必须 ≥ 1.0.2（AMD_CPU_EXT_FAMILY_1AH 支持）",
        ev: "OpenCore 1.0.2 Release Notes",
      });
      risk.push({
        text: "Zen5 的公开案例很少，属于「验证中」而非成熟方案",
        ev: "AMD_Vanilla 主仓库无 Zen5 专用补丁",
      });
    }
    if (f.indexOf("trx40") > -1) {
      must.push({
        text: "TRX40 可关闭两条 PAT patch 以提升 GPU 性能",
        ev: "AMD_Vanilla README",
      });
    }

    /* ---------- 4. 图形层 ---------- */
    if (gpu.level === "none") {
      blocked.push({
        text: gpu.name + " 无任何可用驱动",
        ev: gpu.note,
      });
    } else if (gpu.level === "experimental") {
      gpu.must.forEach(function (t) {
        must.push({ text: t, ev: gpu.name + " 官方要求" });
      });
      gpu.risk.forEach(function (t) {
        risk.push({ text: t, ev: gpu.name + " 已知限制" });
      });
      if (gpu.vendor === "nvidia") {
        must.push({
          text: "boot-args 加 nvfb=1 nvaccel=1 amfi=0x80，csr-active-config 设 430A0000，SecureBootModel 设 Disabled",
          ev: "NullMoth README 安装参数",
        });
        must.push({
          text: "Kernel → Block 排除 IONDRVSupport，并把 kext 装到 /Library/Extensions",
          ev: "NullMoth TROUBLESHOOTING",
        });
        risk.push({
          text: "双 4K 输出会黑屏：BAR1 停在 256MB，驱动只退到 4G",
          ev: "NullMoth TROUBLESHOOTING",
        });
        risk.push({
          text: "没有硬件编解码，视频播放吃 CPU，达芬奇等软件直接报错",
          ev: "社区实测",
        });
        risk.push({
          text: "无 Optimus 切换，笔记本内屏与外屏的接线方式需事先确认",
          ev: "NullMoth README",
        });
        risk.push({
          text: "物理验证只到 RTX 5060，其余型号以社区报告为主",
          ev: "nullmoth/nvidia-macos-driver v2.6.4",
        });
      }
    } else if (gpu.level === "kext" || gpu.level === "partial") {
      gpu.must.forEach(function (t) {
        must.push({ text: t, ev: gpu.name + " 要求" });
      });
      gpu.risk.forEach(function (t) {
        risk.push({ text: t, ev: gpu.name + " 限制" });
      });
    } else {
      gpu.must.forEach(function (t) {
        must.push({ text: t, ev: gpu.name + " 要求" });
      });
    }

    /* ---------- 5. 冲突扫描 ---------- */
    if (cpu.vendor === "amd" && gpu.vendor === "nvidia") {
      risk.push({
        text: "AMD CPU × NVIDIA 显卡存在 PAT 补丁冲突，通常表现为驱动装不上或启动黑屏",
        ev: "Shaneee PAT patch 与 NullMoth 的兼容性问题",
      });
    }

    if (target >= 26) {
      must.push({
        text: "移除 WhateverGreen（macOS 26 上会引发 kernel panic），agdpmod=pikera 改用 Kernel → Patch 手工注入",
        ev: "Dortania Tahoe 专页",
      });
    }

    /* ---------- 6. 音频 ---------- */
    if (audio) {
      if (audio.id === "applealc" && target >= 26) {
        blocked.push({
          text: "AppleALC 在 macOS 26 上失效：系统已移除 AppleHDA.kext",
          ev: "Dortania Tahoe 专页",
        });
      } else if (audio.level === "patch") {
        audio.must.forEach(function (t) {
          must.push({ text: t, ev: "音频方案：" + audio.name });
        });
        audio.risk.forEach(function (t) {
          risk.push({ text: t, ev: "音频方案：" + audio.name });
        });
      } else if (audio.level === "partial") {
        audio.must.forEach(function (t) {
          must.push({ text: t, ev: "音频方案：" + audio.name });
        });
        audio.risk.forEach(function (t) {
          risk.push({ text: t, ev: "音频方案：" + audio.name });
        });
      }
    }

    /* ---------- 7. 无线 ---------- */
    if (wifi) {
      if (wifi.id === "bcm94360" && target >= 26) {
        must.push({
          text: "Broadcom 老卡需 AppleBCMWLANCompanion 1.1.0 或 OCLP root patch 才能恢复",
          ev: "0xFireWolf/AppleBCMWLANCompanion",
        });
      }
      wifi.must.forEach(function (t) {
        must.push({ text: t, ev: "无线方案：" + wifi.name });
      });
      wifi.risk.forEach(function (t) {
        risk.push({ text: t, ev: "无线方案：" + wifi.name });
      });
    }

    /* ---------- 8. 结论 ---------- */
    var isExp =
      gpu.level === "experimental" ||
      cpu.verdict === "exp" ||
      (cpu.flags || []).indexOf("oc-102") > -1;

    if (blocked.length) {
      out.verdict = {
        level: "none",
        label: "这套配置装不了",
        note: "下面的阻断项必须先解决，否则不用开始。",
      };
    } else if (isExp) {
      out.verdict = {
        level: "exp",
        label: "能装，但属于折腾",
        note: "驱动是实验性的，随时可能因为一次小版本更新失效。",
      };
    } else if (must.length > 0) {
      out.verdict = {
        level: "patch",
        label: "能装，需要打补丁",
        note: "按下面的清单逐条做完，成功率很高。",
      };
    } else {
      out.verdict = {
        level: "ok",
        label: "基本可以开箱可用",
        note: "这套组合的社区案例很多，按标准流程走即可。",
      };
    }

    return finish(out);
  }

  function finish(out) {
    out.mustTotal = out.must.length;
    out.riskTotal = out.risk.length;
    out.blockTotal = out.blocked.length;
    return out;
  }

  return { solve: solve };
})();
