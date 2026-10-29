# 黑苹果配置全景 2026

一份关于 2026 年 10 月黑苹果（Hackintosh）现状的静态站点：x86 定格在 macOS 26.7，ARM 四条移植路线同时开跑，N 卡被第三方驱动重新点亮。

**在线访问：https://mokoking666.github.io/hackintosh-2026/**

纯静态，无框架、无 CDN、无追踪，字体本地子集化。

## 页面

| 页面 | 内容 |
|---|---|
| `index.html` | 三条结论、2026 大事记时间轴、平台入口 |
| `arm.html` | UniXNU / Snapintosh / RK3588 / ios-sweet 四条路线 + 证据分级 |
| `intel.html` | 代际矩阵、CPUID 伪装、Xe 双实验线、仅剩 4 个 SMBIOS |
| `amd.html` | Vanilla 补丁链、无 Hypervisor 代价、APU 断代 |
| `gpu.html` | NullMoth 驱动链路、boot-args、AMD 免驱表、官方四代结局 |
| `vm.html` | QEMU/KVM 三条虚拟化路线、GPU 直通、五个项目 |
| `periph.html` | 无线四路线、音频三路线、有线、USB/睡眠/iServices |
| `data.html` | 51 条硬件矩阵 / 86 个项目图谱 / 20 个已死项目 / 8 条取证纠错 |
| `builder.html` | 配置生成器：选硬件 → 结论 + 系统上限 + 必做/风险/阻断清单 |

## 本地预览

直接双击 `index.html` 即可（`file://` 下字体可正常加载）。或用任意静态服务器：

```bash
python -m http.server 8000
```

## 重新构建字体

`assets/fonts/` 里的 6 个 woff2 是 MiSans 的子集（原文件 47MB，子集后约 870KB）。
改动文案后需要重跑，否则新字会缺字：

```bash
python tools/subset_fonts.py          # 重新生成
python tools/subset_fonts.py --check  # 校验缺字
```

## 规则引擎自测

```bash
node tools/test_rules.js   # 13 组断言
```

## 数据说明

- 数据截止 **2026-10-29**；star 数与最后提交为当日 GitHub API 快照
- 结论来源：项目 README、GitHub API、Dortania 指南、中文技术媒体交叉核对
- 每条兼容性结论在页面底部标注了来源；存疑的流传说法收录在 `data.html` 的「取证纠错」中

## 免责声明

在非 Apple 硬件上运行 macOS 可能违反 Apple 的软件许可协议，本项目仅作技术资料整理，不提供任何 Apple 二进制文件、EFI 或安装镜像。所有商标归其所有者。
