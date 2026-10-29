/* ============================================================
   projects.js — 开源项目图谱（GitHub API 快照，2026-10-29）
   status: active(≤3月) / slow(3–12月) / stale(12–18月) / dead(>18月或归档)
   ============================================================ */

window.PROJECTS = (function () {
  const list = [
    /* ---------------- 引导器 ---------------- */
    { cat: "引导器", name: "OpenCorePkg", repo: "acidanthera/OpenCorePkg", stars: 15602, updated: "2026-10-23", status: "active", desc: "事实标准的 UEFI 引导器，最新 tag 1.0.8（2026-09-27）", year: 2019 },
    { cat: "引导器", name: "CloverBootloader", repo: "CloverHackyColor/CloverBootloader", stars: 5150, updated: "2026-10-28", status: "active", desc: "老牌引导器，r5176 意外活跃，Tahoe 音频注入跟进更快", year: 2011 },
    { cat: "引导器", name: "OpenCore Legacy Patcher", repo: "dortania/OpenCore-Legacy-Patcher", stars: 18777, updated: "2026-10-28", status: "active", desc: "老 Mac / 黑苹果根卷补丁，2.5.1 + 3.0.0-rc.2", year: 2020 },
    { cat: "引导器", name: "OCLP-T2", repo: "oclp-t2/OpenCore-Legacy-Patcher-T2", stars: 150, updated: "2026-10-29", status: "active", desc: "OCLP 的 T2 机型分支", year: 2026 },
    { cat: "引导器", name: "OCLP-CustoMac", repo: "kgp-macPro/OCLP-CustoMac", stars: 31, updated: "2026-09-14", status: "active", desc: "面向黑苹果 / 自定义机型的 OCLP 衍生版", year: 2025 },
    { cat: "引导器", name: "RefindPlus", repo: "RefindPlusRepo/RefindPlus", stars: 506, updated: "2026-10-13", status: "active", desc: "rEFInd 的 macOS 强化分支，黑苹果常用", year: 2019 },
    { cat: "引导器", name: "OpenCore_NO_ACPI", repo: "wjz304/OpenCore_NO_ACPI_Build", stars: 103, updated: "2026-10-27", status: "active", desc: "OpenCore Mod 自动构建（中文作者）", year: 2021 },
    { cat: "引导器", name: "meridian", repo: "seuros/meridian", stars: 21, updated: "2026-10-28", status: "active", desc: "2026 新 UEFI 引导管理器，rEFInd 类替代", year: 2026 },

    /* ---------------- 核心 kext ---------------- */
    { cat: "核心 kext", name: "Lilu", repo: "acidanthera/Lilu", stars: 3878, updated: "2026-10-26", status: "active", desc: "内核 patch 框架，所有 kext 的底座", year: 2016 },
    { cat: "核心 kext", name: "VirtualSMC", repo: "acidanthera/VirtualSMC", stars: 1806, updated: "2026-09-27", status: "active", desc: "SMC 模拟层", year: 2018 },
    { cat: "核心 kext", name: "WhateverGreen", repo: "acidanthera/WhateverGreen", stars: 3400, updated: "2026-09-27", status: "active", desc: "显卡通用补丁；Tahoe 上会导致 panic，官方建议移除", year: 2016 },
    { cat: "核心 kext", name: "AppleALC", repo: "acidanthera/AppleALC", stars: 3580, updated: "2026-09-27", status: "active", desc: "非原生 codec 的音频驱动；Tahoe 移除 AppleHDA 后失效", year: 2016 },
    { cat: "核心 kext", name: "CPUFriend", repo: "acidanthera/CPUFriend", stars: 584, updated: "2025-07-13", status: "slow", desc: "注入 CPU 电源管理数据", year: 2018 },
    { cat: "核心 kext", name: "NVMeFix", repo: "acidanthera/NVMeFix", stars: 771, updated: "2025-07-13", status: "slow", desc: "第三方 NVMe 电源管理修复", year: 2018 },
    { cat: "核心 kext", name: "AirportBrcmFixup", repo: "acidanthera/AirportBrcmFixup", stars: 720, updated: "2026-09-27", status: "active", desc: "非原生 Broadcom 无线补丁", year: 2016 },
    { cat: "核心 kext", name: "RestrictEvents", repo: "acidanthera/RestrictEvents", stars: 338, updated: "2026-03-19", status: "slow", desc: "屏蔽 / 伪造 CPU 型号与内存告警", year: 2020 },
    { cat: "核心 kext", name: "FeatureUnlock", repo: "acidanthera/FeatureUnlock", stars: 424, updated: "2025-07-13", status: "slow", desc: "给不支持的机型开 Sidecar / 通用控制", year: 2020 },
    { cat: "核心 kext", name: "ForgedInvariant", repo: "ChefKissInc/ForgedInvariant", stars: 93, updated: "2026-10-10", status: "active", desc: "Intel / AMD TSC 同步（取代 CpuTopologySync）", year: 2024 },

    /* ---------------- 显卡 ---------------- */
    { cat: "显卡", name: "NVIDIA Metal 驱动", repo: "nullmoth/nvidia-macos-driver", stars: 3870, updated: "2026-10-29", status: "active", desc: "GTX 16 / RTX 20–50 的 Metal 驱动，v2.6.4，247 个 PCI ID", year: 2026 },
    { cat: "显卡", name: "1401 安装器", repo: "nullmoth/1401", stars: 995, updated: "2026-10-29", status: "active", desc: "从 Windows 一键装 macOS 到 PC，自动写 boot-args", year: 2026 },
    { cat: "显卡", name: "1401-probe", repo: "nullmoth/1401-probe", stars: 44, updated: "2026-10-24", status: "active", desc: "离线硬件探测 U 盘工具", year: 2026 },
    { cat: "显卡", name: "WhateverXe", repo: "b00t0x/WhateverXe", stars: 182, updated: "2026-10-27", status: "active", desc: "Intel Xe 核显补丁，WEX 0.6.1，需签名图形包", year: 2026 },
    { cat: "显卡", name: "WhateverXe-Graphics", repo: "b00t0x/WhateverXe-Graphics", stars: 37, updated: "2026-10-27", status: "active", desc: "已签名图形负载 + 安装器，0.3.2", year: 2026 },
    { cat: "显卡", name: "XeGfx", repo: "watchthelight-labs/XeGfx", stars: 16, updated: "2026-10-29", status: "active", desc: "Xe-LPG/Xe2 路线：把 FreeBSD i915 搬进 XNU", year: 2026 },
    { cat: "显卡", name: "NootedRed", repo: "ChefKissInc/NootedRed", stars: 2000, updated: "2026-10-10", status: "active", desc: "AMD Vega APU 核显驱动，v0.8.10；RDNA 仍无解", year: 2021 },
    { cat: "显卡", name: "NootRX", repo: "ChefKissInc/NootRX", stars: 731, updated: "2026-10-10", status: "active", desc: "RDNA2 Navi22/23 独显补丁", year: 2021 },
    { cat: "显卡", name: "nullarc", repo: "luuumi-dev/nullarc", stars: 55, updated: "2026-10-21", status: "active", desc: "Radeon 780M 在 Tahoe 上的 Metal bring-up", year: 2026 },
    { cat: "显卡", name: "MetalCyan", repo: "amethyst8118/MetalCyan", stars: 39, updated: "2026-10-01", status: "active", desc: "ASRock BC-250 的 Metal 加速", year: 2026 },
    { cat: "显卡", name: "XPS13Plus IrisXe", repo: "JulioNectar/Hackintosh-XPS13Plus-IrisXe-Tahoe", stars: 167, updated: "2026-10-28", status: "active", desc: "Raptor Lake Iris Xe 在 Tahoe 的 Metal 加速实证", year: 2026 },

    /* ---------------- 无线 ---------------- */
    { cat: "无线", name: "itlwm（主线）", repo: "OpenIntelWireless/itlwm", stars: 7129, updated: "2024-06-09", status: "dead", desc: "Intel 无线主线，停在 2.4.0，28 个月无提交", year: 2019 },
    { cat: "无线", name: "itlwm（接盘分支）", repo: "laobamac/itlwm", stars: 181, updated: "2026-10-18", status: "active", desc: "Tahoe 原生适配，v2.4.0-alpha，免 OCLP 根补丁", year: 2026 },
    { cat: "无线", name: "AirportItlwm-Tahoe", repo: "kgp-macPro/AirportItlwm-Tahoe", stars: 23, updated: "2026-10-24", status: "active", desc: "Tahoe + AppleVTD，AWDL/P2P 实验", year: 2026 },
    { cat: "无线", name: "AirportRTW89", repo: "achcyano/AirportRTW89", stars: 13, updated: "2026-10-21", status: "active", desc: "RTL8922AE（Wi-Fi 7）/ 8852 系驱动，首个", year: 2026 },
    { cat: "无线", name: "Airport_RTW89（前身）", repo: "FranciumOS-org/Airport_RTW89", stars: 23, updated: "2026-10-12", status: "active", desc: "RTW89 kext 原型，2026-10-03 建库", year: 2026 },
    { cat: "无线", name: "AppleBCMWLANCompanion", repo: "0xFireWolf/AppleBCMWLANCompanion", stars: 151, updated: "2025-11-21", status: "slow", desc: "让 Sonoma/Tahoe 重新支持老 Broadcom 卡，免根补丁", year: 2025 },
    { cat: "无线", name: "SimpleBCM", repo: "laobamac/SimpleBCM", stars: 37, updated: "2026-10-25", status: "active", desc: "用独立 OC 驱动在 Tahoe 恢复 Broadcom Wi-Fi", year: 2026 },
    { cat: "无线", name: "SimpleMtkWlan", repo: "laobamac/SimpleMtkWlan", stars: 27, updated: "2026-06-27", status: "active", desc: "MT792x PCIe 无线实验驱动", year: 2026 },
    { cat: "无线", name: "IntelBluetoothFirmware", repo: "OpenIntelWireless/IntelBluetoothFirmware", stars: 2523, updated: "2026-01-15", status: "slow", desc: "Intel 蓝牙固件上传", year: 2019 },
    { cat: "无线", name: "WiFiPatcherPro", repo: "Mirone/WiFiPatcherPro", stars: 28, updated: "2026-10-18", status: "active", desc: "Broadcom / Intel 无线兼容性一键修复", year: 2026 },

    /* ---------------- 有线 / 音频 / USB ---------------- */
    { cat: "外设驱动", name: "AppleIGC", repo: "SongXiaoXi/AppleIGC", stars: 168, updated: "2026-09-17", status: "active", desc: "i225 / i226 2.5G 网卡驱动", year: 2022 },
    { cat: "外设驱动", name: "RTL8111 驱动", repo: "Mieze/RTL8111_driver_for_OS_X", stars: 716, updated: "2025-12-24", status: "slow", desc: "Realtek 8111/8168 系列（注意仓库名不是 RealtekRTL8111）", year: 2015 },
    { cat: "外设驱动", name: "SimpleHDA", repo: "laobamac/SimpleHDA", stars: 93, updated: "2026-10-14", status: "active", desc: "Tahoe 下通过 OC+Lilu 恢复原生 AppleHDA，1.0.0", year: 2026 },
    { cat: "外设驱动", name: "VoodooHDA", repo: "CloverHackyColor/VoodooHDA", stars: 55, updated: "2026-10-23", status: "active", desc: "AppleHDA 缺失时的通用音频驱动，Tahoe 回潮", year: 2008 },
    { cat: "外设驱动", name: "CirrusAudioFixup", repo: "hoaug-tran/CirrusAudioFixup", stars: 13, updated: "2026-10-28", status: "active", desc: "CS35L41 智能功放 bring-up", year: 2026 },
    { cat: "外设驱动", name: "USBMap", repo: "corpnewt/USBMap", stars: 1261, updated: "2025-12-13", status: "slow", desc: "纯 macOS 端端口映射，生成 USBPorts.kext", year: 2019 },
    { cat: "外设驱动", name: "USBToolBox", repo: "USBToolBox/tool", stars: 1472, updated: "2023-10-01", status: "dead", desc: "跨平台端口映射工具，3 年无更新", year: 2020 },

    /* ---------------- 工具链 ---------------- */
    { cat: "工具链", name: "OpCore-Simplify", repo: "lzhoang2801/OpCore-Simplify", stars: 7656, updated: "2026-10-15", status: "active", desc: "自动生成 OpenCore EFI，当前最热的配置工具", year: 2024 },
    { cat: "工具链", name: "Hardware-Sniffer", repo: "lzhoang2801/Hardware-Sniffer", stars: 453, updated: "2026-10-21", status: "active", desc: "OpCore-Simplify 的硬件探测前端", year: 2024 },
    { cat: "工具链", name: "Hackintool", repo: "benbaker76/Hackintool", stars: 3524, updated: "2026-10-27", status: "active", desc: "黑苹果瑞士军刀：PCI/USB/电源/补丁", year: 2018 },
    { cat: "工具链", name: "ProperTree", repo: "corpnewt/ProperTree", stars: 3189, updated: "2026-06-20", status: "slow", desc: "跨平台 plist 编辑器，OC 标配", year: 2018 },
    { cat: "工具链", name: "GenSMBIOS", repo: "corpnewt/GenSMBIOS", stars: 2016, updated: "2026-01-04", status: "slow", desc: "生成 SMBIOS 并写入 plist", year: 2018 },
    { cat: "工具链", name: "SSDTTime", repo: "corpnewt/SSDTTime", stars: 1289, updated: "2026-10-24", status: "active", desc: "SSDT / DSDT 热补丁生成", year: 2018 },
    { cat: "工具链", name: "OCAuxiliaryTools", repo: "ic005k/OCAuxiliaryTools", stars: 4480, updated: "2025-09-10", status: "stale", desc: "跨平台 OC config GUI，作者 13 个月未提交", year: 2021 },
    { cat: "工具链", name: "OCAT（社区续作）", repo: "YBronst/OCAuxiliaryTools", stars: 13, updated: "2026-10-28", status: "active", desc: "OCAT 的 2026 社区 fork", year: 2026 },
    { cat: "工具链", name: "gibMacOS", repo: "corpnewt/gibMacOS", stars: 7348, updated: "2026-06-18", status: "slow", desc: "直接向 Apple 拉取 macOS 组件", year: 2018 },
    { cat: "工具链", name: "macos-iso-builder", repo: "LongQT-sea/macos-iso-builder", stars: 2945, updated: "2026-10-29", status: "active", desc: "GitHub Actions 从 Apple 服务器直出 ISO/DMG", year: 2023 },
    { cat: "工具链", name: "hackmate", repo: "hackmatelabs/hackmate", stars: 305, updated: "2026-10-29", status: "active", desc: "全自动制作可启动 OC U 盘", year: 2026 },
    { cat: "工具链", name: "RapidSSDT", repo: "JeoJay127/RapidSSDT", stars: 79, updated: "2026-10-02", status: "active", desc: "跨平台 ACPI / SSDT 生成（中文作者）", year: 2026 },
    { cat: "工具链", name: "MaciASL", repo: "acidanthera/MaciASL", stars: 809, updated: "2024-09-07", status: "stale", desc: "macOS 端 ACPI 编辑 IDE", year: 2016 },

    /* ---------------- AMD ---------------- */
    { cat: "AMD", name: "AMD_Vanilla", repo: "AMD-OSX/AMD_Vanilla", stars: 3108, updated: "2025-12-07", status: "slow", desc: "AMD CPU 内核补丁，Zen4 已进主线，Zen5 无独立补丁", year: 2017 },
    { cat: "AMD", name: "AMDVanillaPatches", repo: "corpnewt/AMDVanillaPatches", stars: 33, updated: "2025-12-13", status: "slow", desc: "自动把 Vanilla 补丁合并进 config", year: 2022 },
    { cat: "AMD", name: "ryzen-hackintosh", repo: "mikigal/ryzen-hackintosh", stars: 1180, updated: "2026-07-03", status: "active", desc: "Ryzen OpenCore EFI 参考", year: 2019 },

    /* ---------------- ARM 移植 ---------------- */
    { cat: "ARM 移植", name: "UniXNU", repo: "UniXNU/UniXNU", stars: 1203, updated: "2026-10-29", status: "active", desc: "通用 ARM64 框架：BootShim → UEFI → DarwinBoot → 打补丁 XNU；小米平板 6S Pro 已跑 iPadOS", year: 2026 },
    { cat: "ARM 移植", name: "Snapintosh", repo: "Snapintosh/Snapintosh", stars: 1042, updated: "2026-10-25", status: "active", desc: "骁龙 X2 Elite 跑 macOS 27，EL2 监视器伪造 Apple 平台契约", year: 2026 },
    { cat: "ARM 移植", name: "q1n1", repo: "Snapintosh/q1n1", stars: 36, updated: "2026-10-25", status: "active", desc: "fork 自 m1n1 的 UEFI EL2 代理（上游 GPL-2.0 与 MIT 存在许可冲突）", year: 2026 },
    { cat: "ARM 移植", name: "air2ir3", repo: "Snapintosh/air2ir3", stars: 1, updated: "2026-10-24", status: "active", desc: "把 Apple AIR 中间表示翻译成 Mesa ir3 的着色器编译器", year: 2026 },
    { cat: "ARM 移植", name: "SnapMetal", repo: "Snapintosh/SnapMetal", stars: 2, updated: "2026-10-24", status: "active", desc: "Adreno X2-90 的 Metal 插件 AdrenoMetal.bundle", year: 2026 },
    { cat: "ARM 移植", name: "macOS-ForSheng", repo: "CrossDarwin/macOS-ForSheng", stars: 6, updated: "2026-10-29", status: "active", desc: "小米平板 6S Pro 跑 macOS 26.5，已到 Recovery 语言选择器", year: 2026 },
    { cat: "ARM 移植", name: "ios-sweet", repo: "dipa-studio/ios-sweet", stars: 1133, updated: "2026-10-23", status: "active", desc: "反向移植：Redmi Note 10 Pro 跑 iOS 16.7.16 主屏，96 个衍生仓库", year: 2026 },
    { cat: "ARM 移植", name: "edk2-rk3588", repo: "edk2-porting/edk2-rk3588", stars: 1058, updated: "2026-10-25", status: "active", desc: "RK3588 的 EDK2 UEFI 固件，是 RK3588 跑 macOS 的基座（本身不跑 macOS）", year: 2022 },
    { cat: "ARM 移植", name: "m1n1", repo: "AsahiLinux/m1n1", stars: 4283, updated: "2026-10-28", status: "active", desc: "Apple Silicon 的 bootloader / 调试代理，q1n1 的上游，方法论源头", year: 2021 },
    { cat: "ARM 移植", name: "HackinBoot", repo: "Shennaitong-wangchao/HackinBoot", stars: 4, updated: "2026-05-22", status: "stale", desc: "ARM EL2 hypervisor 跑 XNU 的研究原型", year: 2026 },
    { cat: "ARM 移植", name: "Mu-Silicium", repo: "Project-Silicium/Mu-Silicium", stars: 576, updated: "2026-09-20", status: "active", desc: "ARM64 设备的 Project Mu UEFI 移植，UniXNU 的固件层（常被误传为 macOS 项目）", year: 2022 },

    /* ---------------- 中文社区 ---------------- */
    { cat: "中文社区", name: "黑果小兵", repo: "daliansky/Hackintosh", stars: 10006, updated: "2026-08-28", status: "active", desc: "中文圈第一入口：EFI 与安装教程长期维护", year: 2018 },
    { cat: "中文社区", name: "XiaoXinPro-13", repo: "daliansky/XiaoXinPro-13-hackintosh", stars: 899, updated: "2026-10-19", status: "active", desc: "小新 Pro 13 2019 EFI", year: 2019 },
    { cat: "中文社区", name: "OC-little 英文版", repo: "5T33Z0/OC-Little-Translated", stars: 748, updated: "2026-10-28", status: "active", desc: "ACPI 热补丁样例，原版停更后的事实维护版", year: 2020 },
    { cat: "中文社区", name: "OC 参考手册中文", repo: "SukkaW/OpenCore-Document-zh_Hans", stars: 308, updated: "2026-07-30", status: "active", desc: "OpenCore 参考手册简体中文翻译", year: 2020 },
    { cat: "中文社区", name: "Kext Factory", repo: "ClayMoreBoy/Hackintosh-Kext-Factory", stars: 204, updated: "2026-07-31", status: "active", desc: "每日自动编译常用 kext", year: 2020 },
    { cat: "中文社区", name: "OpCore-Simplify 中文", repo: "Eanchao/Op-Core-Simplify-CN", stars: 32, updated: "2026-03-08", status: "active", desc: "OpCore-Simplify 中文化", year: 2026 },

    /* ---------------- 虚拟机 ---------------- */
    { cat: "虚拟机", name: "Docker-OSX", repo: "sickcodes/Docker-OSX", stars: 53004, updated: "2025-11-11", status: "slow", desc: "QEMU/KVM + OpenCore，只跑 x86_64 macOS", year: 2020 },
    { cat: "虚拟机", name: "UTM", repo: "utmapp/UTM", stars: 36587, updated: "2026-10-28", status: "active", desc: "Apple Silicon 宿主专用（Virtualization.framework），非 Apple ARM 无此路径", year: 2019 },
    { cat: "虚拟机", name: "OSX-KVM", repo: "kholia/OSX-KVM", stars: 23768, updated: "2026-01-26", status: "slow", desc: "QEMU/KVM x86_64 macOS", year: 2017 },
    { cat: "虚拟机", name: "quickemu", repo: "quickemu-project/quickemu", stars: 16593, updated: "2026-10-28", status: "active", desc: "一键虚拟机，macOS 客户机仅 x86_64", year: 2019 },
    { cat: "虚拟机", name: "VirtualBuddy", repo: "insidegui/VirtualBuddy", stars: 8876, updated: "2026-10-28", status: "active", desc: "Virtualization.framework 的 GUI，硬绑 Apple 硬件", year: 2021 },
    { cat: "虚拟机", name: "osx-proxmox-next", repo: "lucid-fabrics/osx-proxmox-next", stars: 287, updated: "2026-10-25", status: "active", desc: "Proxmox 9 一条命令跑 macOS 虚拟机", year: 2026 },
    { cat: "虚拟机", name: "OpenCore-ISO", repo: "LongQT-sea/OpenCore-ISO", stars: 871, updated: "2026-08-18", status: "active", desc: "给 Proxmox VE / QEMU-KVM 用的 OpenCore 启动镜像，覆盖 10.4 到 macOS 26，免 OVMF 补丁", year: 2025 },
  ];

  /* ---------------- 已死项目 ---------------- */
  const dead = [
    { name: "AptioFixPkg", repo: "acidanthera/AptioFixPkg", stars: 161, updated: "2019-08-05", why: "被 OpenCore 内置驱动取代" },
    { name: "AppleSupportPkg", repo: "acidanthera/AppleSupportPkg", stars: 560, updated: "2020-05-17", why: "功能并入 OpenCorePkg" },
    { name: "MacInfoPkg", repo: "acidanthera/MacInfoPkg", stars: 247, updated: "2020-05-17", why: "并入 OpenCorePkg" },
    { name: "Shiki", repo: "acidanthera/Shiki", stars: 148, updated: "2018-07-20", why: "视频硬解补丁，被 WhateverGreen 取代" },
    { name: "CpuTopologySync", repo: "acidanthera/CpuTopologySync", stars: 23, updated: "2021-12-10", why: "被 ForgedInvariant 取代" },
    { name: "itlwm 主线", repo: "OpenIntelWireless/itlwm", stars: 7129, updated: "2024-06-09", why: "28 个月无提交，实际维护转到 laobamac/itlwm" },
    { name: "HeliPort", repo: "OpenIntelWireless/HeliPort", stars: 1276, updated: "2025-07-05", why: "随 itlwm 主线停摆" },
    { name: "USBToolBox", repo: "USBToolBox/tool", stars: 1472, updated: "2023-10-01", why: "3 年无更新，改用 corpnewt/USBMap" },
    { name: "OC-little（原版）", repo: "daliansky/OC-little", stars: 1626, updated: "2021-09-22", why: "5 年无提交，内容由 5T33Z0 英文版承接" },
    { name: "国光 Hackintosh 教程", repo: "sqlsec/Hackintosh", stars: 1031, updated: "2023-06-15", why: "作者停更" },
    { name: "Hackintosh-Installer-University", repo: "huangyz0918/Hackintosh-Installer-University", stars: 3982, updated: "2022-11-10", why: "已归档" },
    { name: "macOS-Simple-KVM", repo: "foxlet/macOS-Simple-KVM", stars: 13939, updated: "2024-04-04", why: "被 quickemu / osx-proxmox-next 取代" },
    { name: "TINU", repo: "ITzTravelInTime/TINU", stars: 523, updated: "2022-06-17", why: "制作安装盘工具，已归档" },
    { name: "ComboJack", repo: "hackintosh-stuff/ComboJack", stars: 181, updated: "2021-11-13", why: "ALC256/255 耳机口修复，已归档" },
    { name: "Geforce-Kepler-patcher", repo: "chris1111/Geforce-Kepler-patcher", stars: 379, updated: "2024-05-04", why: "Kepler 补丁，已归档（OCLP 接手）" },
    { name: "SMCAMDProcessor", repo: "trulyspinach/SMCAMDProcessor", stars: 1132, updated: "2024-09-16", why: "AMD 电源管理，2 年无提交" },
    { name: "AppleIGB", repo: "Shaneee/AppleIGB", stars: 30, updated: "2022-10-08", why: "i210/i211 驱动，已归档" },
    { name: "Xiasl", repo: "ic005k/Xiasl", stars: 320, updated: "2023-01-05", why: "跨平台 DSDT IDE，已被 RapidSSDT 等取代" },
    { name: "Clover-Crate", repo: "5T33Z0/Clover-Crate", stars: 91, updated: "2026-10-25", why: "Clover 手册，作者转投 OpenCore 后归档" },
    { name: "OCLP-Mod", repo: "laobamac/OCLP-Mod", stars: 666, updated: "2026-06-14", why: "曾是热门 OCLP 增强版，2026-06 归档" },
  ];

  /* ---------------- 取证纠错 ---------------- */
  const corrections = [
    { wrong: "WhateverXe 是 ChefKissInc 的项目", right: "属 b00t0x；ChefKissInc 名下只有 NootedRed / NootRX / ForgedInvariant 等 8 个仓库" },
    { wrong: "NullMoth 驱动锁死 macOS 15 Sequoia", right: "驱动本体支持 15.5+ 与 26 Tahoe（NM_TAHOE=1）；锁 15 的是 1401 安装器" },
    { wrong: "AirportItlwm 是独立仓库", right: "OpenIntelWireless/AirportItlwm 返回 404，它是 itlwm 仓库内的编译目标" },
    { wrong: "acidanthera 有 iasl 仓库", right: "不存在；ACPI 编译用 MaciASL 内置 iasl + Intel ACPICA 上游" },
    { wrong: "RealtekRTL8111 是 Mieze 的仓库名", right: "正确名是 Mieze/RTL8111_driver_for_OS_X" },
    { wrong: "Olarila 有 GitHub 组织", right: "没有，Olarila 只是论坛 + ISO/EFI 打包分发渠道" },
    { wrong: "骁龙 8cx 上曾有 Project Silica 跑 macOS", right: "不存在该项目；真实的是 Project Silicium / Mu-Silicium，那是 UEFI 固件，不是 macOS 移植" },
    { wrong: "虚拟机可以曲线救国在 ARM 上跑 macOS", right: "UTM / VirtualBuddy 只支持 Apple Silicon 宿主；QEMU 无 arm64 macOS 机器模型" },
  ];

  return { list, dead, corrections };
})();
