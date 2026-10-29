/**
 * 全站唯一的领域模型。
 * 页面不得自行定义硬件/项目结论，只能从这里读取。
 */

/** 六态结论：任何「能不能用」的判断都必须落在这六个值之一 */
export type Verdict =
  | 'verified' // 已验证可用：有上游代码或可复现测试支撑，无需额外补丁
  | 'conditional' // 有条件可用：需要补丁/kext/特定配置，条件明确
  | 'experimental' // 实验性支持：有代码或实机演示，但未达日常可用
  | 'unverified' // 尚未验证：有方案流传，但缺少可复现证据
  | 'incompatible' // 已知不兼容：有明确证据表明无解
  | 'unknown'; // 信息不足：无法判断

/** 证据等级：从强到弱。不要用「传闻」直接支撑 incompatible 结论 */
export type EvidenceGrade =
  | 'official' // 厂商/项目官方文档
  | 'upstream' // 上游仓库代码、Release、提交记录
  | 'reproducible' // 可复现的第三方测试
  | 'community' // 社区报告、论坛实测
  | 'vendor-claim' // 仅项目方/作者声明
  | 'inference'; // 由其它事实推断，需标注

export type EvidenceStatus = 'ok' | 'link-rot' | 'unchecked';

export interface Evidence {
  id: string;
  title: string;
  /** 缺失表示离线资料或私有渠道 */
  url?: string;
  grade: EvidenceGrade;
  publisher?: string;
  /** 证据对应的版本 / 提交 / 发布日期 */
  version?: string;
  publishedAt?: string;
  /** 最近核验日期，统一 2026-10-29 基线 */
  checkedAt: string;
  status?: EvidenceStatus;
  note?: string;
}

export type MacOsVersion =
  '10.13' | '11' | '12' | '13' | '14' | '15' | '15.2' | '26' | '26.7' | '27';

export interface OsRange {
  min?: MacOsVersion;
  max?: MacOsVersion;
  /** 上限是否含 beta */
  beta?: boolean;
  note?: string;
}

export type PlatformId =
  | 'intel'
  | 'amd'
  | 'nvidia'
  | 'broadcom'
  | 'intel-wifi'
  | 'realtek'
  | 'mediatek'
  | 'qualcomm'
  | 'rockchip'
  | 'arm'
  | 'system';

export type HardwareCategory =
  | 'cpu'
  | 'igpu'
  | 'dgpu'
  | 'apu'
  | 'wifi'
  | 'ethernet'
  | 'audio'
  | 'storage'
  | 'arm'
  | 'bootloader'
  | 'system';

/** 功能维度：用于「能装 ≠ 好用」的表达 */
export type FeatureKey =
  'boot' | 'display' | 'metal' | 'hwDecode' | 'sleep' | 'wifi' | 'airdrop' | 'audio' | 'iservices';

export type FeatureState = 'yes' | 'partial' | 'no' | 'unknown';

export interface Requirement {
  text: string;
  evidenceIds: string[];
}

/** 规则引擎需要的结构化字段，与展示字段分开，避免字符串比较 */
export interface CpuEngine {
  vendor: 'intel' | 'amd';
  generation: string;
  socket: string;
  igpuId?: string;
  flags: Array<'cpuid-mask' | 'amd-vanilla' | 'no-hypervisor' | 'iopci-patch' | 'oc-102' | 'trx40'>;
}

export interface GpuEngine {
  vendor: 'amd' | 'nvidia' | 'intel';
  family: string;
  /** 驱动路径：决定规则分支 */
  driver: 'native' | 'kext' | 'third-party' | 'none';
  /** 与 AMD CPU 的 PAT 补丁冲突 */
  patConflict?: boolean;
}

export interface HardwareRecord {
  id: string;
  name: string;
  vendor: PlatformId;
  category: HardwareCategory;
  platform: PlatformId;
  verdict: Verdict;
  os: OsRange;
  /** 一句话结论，表格里用 */
  summary: string;
  requirements: Requirement[];
  limitations: Requirement[];
  features: Partial<Record<FeatureKey, FeatureState>>;
  evidenceIds: string[];
  verifiedAt: string;
  cpu?: CpuEngine;
  gpu?: GpuEngine;
  /** 仅 ARM 平台使用 */
  arm?: {
    bootMethod: 'el2-monitor' | 'uefi-efi' | 'virtualization' | 'none';
    singleDevice: boolean;
    requiresHostMac: boolean;
  };
  tags?: string[];
}

export type ProjectCategory =
  | 'bootloader'
  | 'kext'
  | 'gpu'
  | 'wireless'
  | 'peripheral'
  | 'toolchain'
  | 'amd'
  | 'arm'
  | 'community'
  | 'virtualization';

export type ProjectStatus = 'active' | 'slow' | 'stale' | 'dead';

export type CodeOpenness = 'full' | 'partial' | 'none';

export type Reproducibility = 'verified' | 'single-report' | 'demo-only' | 'unknown';

export interface ProjectRecord {
  id: string;
  name: string;
  repo: string;
  url: string;
  category: ProjectCategory;
  description: string;
  stars: number;
  pushedAt: string;
  status: ProjectStatus;
  codeOpen: CodeOpenness;
  reproducibility: Reproducibility;
  /** 目标系统或关键版本，如 "26.7" / "15.5+" */
  targetOs?: string;
  latestRelease?: string;
  license?: string;
  createdYear: number;
  evidenceIds: string[];
}

export interface DeadProject {
  id: string;
  name: string;
  repo: string;
  url: string;
  stars: number;
  pushedAt: string;
  reason: string;
  evidenceIds: string[];
}

export interface Correction {
  id: string;
  claim: string;
  correction: string;
  evidenceIds: string[];
}

/** 技术事实台账：每条结论一个 ID，可被页面引用 */
export interface Claim {
  id: string;
  statement: string;
  scope: string;
  evidenceIds: string[];
  /** 是否仍需进一步验证 */
  needsVerification: boolean;
  limits?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  major: boolean;
  evidenceIds: string[];
}

export interface ArmRoute {
  id: string;
  name: string;
  projectRepo?: string;
  lead: string;
  bootMethod: 'el2-monitor' | 'uefi-efi' | 'virtualization' | 'none';
  osReached: string;
  achieved: string[];
  missing: string[];
  evidenceIds: string[];
  verdict: Verdict;
  singleDevice: boolean;
  requiresHostMac: boolean;
  notes: string;
}

/* ---------------- 配置评估 ---------------- */

export type BuildRoute = 'bare-metal' | 'vm' | 'arm-experiment';

export interface BuildInput {
  platform: 'intel' | 'amd' | 'arm';
  cpuId: string | null;
  gpuId: string | null;
  boardId: string | null;
  wifiId: string | null;
  audioId: string | null;
  nvmeId: string | null;
  targetOs: MacOsVersion;
  route: BuildRoute;
  /** 是否接受 OCLP 根补丁（会降低系统完整性保护） */
  acceptOclp: boolean;
  /** 是否接受第三方实验驱动（NullMoth / WhateverXe / XeGfx） */
  allowExperimental: boolean;
}

export interface BoardRecord {
  id: string;
  name: string;
  chipset: string;
  socket: string;
  vendor: 'intel' | 'amd' | 'arm';
  note: string;
  evidenceIds: string[];
}

export type Severity = 'blocker' | 'required' | 'risk' | 'info';

export interface Finding {
  id: string;
  severity: Severity;
  text: string;
  evidenceIds: string[];
  claimIds?: string[];
}

export interface BuildResult {
  verdict: Verdict;
  confidence: 'high' | 'medium' | 'low';
  osCap: OsRange;
  findings: Finding[];
  missing: string[];
  alternatives: Array<{ label: string; to: string }>;
}
