import { getHardware } from './hardware';
import { BOARD_BY_ID } from './boards';
import type { Finding, BuildInput, BuildResult, MacOsVersion, OsRange, Verdict } from './types';

/** 版本排序用的数值映射；不要用字符串比较 */
export const OS_VALUE: Record<MacOsVersion, number> = {
  '10.13': 10.13,
  '11': 11,
  '12': 12,
  '13': 13,
  '14': 14,
  '15': 15,
  '15.2': 15.2,
  '26': 26,
  '26.7': 26.7,
  '27': 27,
};

export const OS_ORDER: readonly MacOsVersion[] = [
  '10.13',
  '11',
  '12',
  '13',
  '14',
  '15',
  '15.2',
  '26',
  '26.7',
  '27',
];

export function compareOs(a: MacOsVersion, b: MacOsVersion): number {
  return OS_VALUE[a] - OS_VALUE[b];
}

export function osInRange(os: MacOsVersion, range: OsRange): boolean {
  if (range.min && compareOs(os, range.min) < 0) return false;
  if (range.max && compareOs(os, range.max) > 0) return false;
  return true;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  verified: '已验证可用',
  conditional: '有条件可用',
  experimental: '实验性支持',
  unverified: '尚未验证',
  incompatible: '已知不兼容',
  unknown: '信息不足',
};

export const VERDICT_MEANING: Record<Verdict, string> = {
  verified: '有上游代码或可复现测试支撑，不需要额外补丁。',
  conditional: '需要明确的补丁、kext 或特定配置，条件已列出。',
  experimental: '有代码或实机演示，但未达日常可用，随时可能失效。',
  unverified: '有方案流传，但缺少可复现证据，不应当作可行方案。',
  incompatible: '有明确证据表明当前无解。',
  unknown: '缺少判断所需的输入或证据。',
};

const CONFIDENCE_RANK = { high: 2, medium: 1, low: 0 } as const;

function finding(
  severity: Finding['severity'],
  text: string,
  evidenceIds: string[],
  claimIds?: string[],
): Finding {
  return {
    id: `${severity}-${text.slice(0, 12)}`,
    severity,
    text,
    evidenceIds,
    ...(claimIds ? { claimIds } : {}),
  };
}

function worst(a: Verdict, b: Verdict): Verdict {
  const order: Verdict[] = [
    'verified',
    'conditional',
    'experimental',
    'unverified',
    'incompatible',
  ];
  return order.indexOf(b) > order.indexOf(a) ? b : a;
}

/**
 * 配置评估。纯函数：输入相同，输出必然相同；不读 DOM、不读时间。
 * 判定顺序：平台闸门 → 版本闸门 → CPU → 图形 → 冲突扫描 → 结论。
 */
export function solve(input: BuildInput): BuildResult {
  const findings: Finding[] = [];
  const missing: string[] = [];
  const alternatives: BuildResult['alternatives'] = [];
  let verdict: Verdict = 'verified';
  let confidence: 'high' | 'medium' | 'low' = 'high';
  let osCap: OsRange = { max: '26.7' };

  const isArm = input.platform === 'arm';
  const cpu = input.cpuId ? getHardware(input.cpuId) : null;
  const gpu = !isArm && input.gpuId ? getHardware(input.gpuId) : null;
  const board = input.boardId ? BOARD_BY_ID.get(input.boardId) : undefined;
  const wifi = input.wifiId ? getHardware(input.wifiId) : null;
  const audio = input.audioId ? getHardware(input.audioId) : null;

  /* ---------- 0. 输入完整性 ---------- */
  if (!cpu) {
    missing.push('CPU 型号');
    return {
      verdict: 'unknown',
      confidence: 'low',
      osCap,
      findings: [finding('blocker', '没有选择 CPU，无法判断平台上限', [])],
      missing,
      alternatives: [{ label: '查看完整硬件矩阵', to: '/library' }],
    };
  }
  if (!isArm && !gpu) missing.push('显卡（核显或独显）');
  if (!board) missing.push('主板');
  if (board && cpu.cpu && board.socket !== cpu.cpu.socket) {
    findings.push(
      finding(
        'blocker',
        `主板插槽（${board.socket}）与 CPU（${cpu.cpu.socket}）不匹配，无法点亮`,
        board.evidenceIds,
      ),
    );
    verdict = 'incompatible';
  }
  if (board && isArm && board.socket !== 'SoC') {
    findings.push(finding('blocker', 'ARM 方案由整机锁定，不能搭配 x86 主板', board.evidenceIds));
    verdict = 'incompatible';
  }

  /* ---------- 1. 平台闸门 ---------- */
  if (isArm) {
    osCap = cpu.os.max ? { max: cpu.os.max, ...(cpu.os.beta ? { beta: true } : {}) } : {};
    if (input.route === 'vm') {
      findings.push(
        finding(
          'blocker',
          'ARM 平台上无法用虚拟机运行 macOS：没有 arm64 macOS 的机器模型，Apple 的虚拟化框架只允许 Apple 硬件',
          ['E-INFER-ARCH'],
          ['C-023'],
        ),
      );
      verdict = worst(verdict, 'incompatible');
    }
    if (cpu.arm?.bootMethod === 'none') {
      findings.push(
        finding('blocker', `${cpu.name} 目前没有任何可用的 macOS 引导方案`, cpu.evidenceIds),
      );
      verdict = worst(verdict, 'incompatible');
    } else {
      verdict = worst(verdict, cpu.verdict);
      for (const req of cpu.requirements) {
        findings.push(finding('required', req.text, req.evidenceIds));
      }
      for (const lim of cpu.limitations) {
        findings.push(finding('risk', lim.text, lim.evidenceIds));
      }
      if (cpu.arm?.requiresHostMac) {
        findings.push(
          finding('required', '每次启动都需要一台运行 macOS 27 的 Mac，经 USB-C 建立链路', [
            'E-SNAPINTOSH',
          ]),
        );
      }
      if (cpu.arm?.singleDevice) {
        findings.push(finding('info', '该方案只针对特定机型调校，换机器不成立', cpu.evidenceIds));
      }
    }
    if (cpu.verdict === 'experimental') confidence = 'low';
  } else {
    osCap = { max: '26.7' };
    if (compareOs(input.targetOs, '27') >= 0) {
      findings.push(
        finding(
          'blocker',
          'macOS 27 只支持 Apple Silicon，x86 平台无法安装——这是架构性排除，不是缺驱动',
          ['E-APPLE-27'],
          ['C-002'],
        ),
      );
      verdict = worst(verdict, 'incompatible');
    }

    /* ---------- 2. CPU ---------- */
    verdict = worst(verdict, cpu.verdict);
    for (const req of cpu.requirements)
      findings.push(finding('required', req.text, req.evidenceIds));
    for (const lim of cpu.limitations) findings.push(finding('risk', lim.text, lim.evidenceIds));

    const flags = cpu.cpu?.flags ?? [];
    if (flags.includes('cpuid-mask')) {
      findings.push(
        finding(
          'required',
          'CPUID 伪装为 Comet Lake，并开启 ProvideCurrentCpuInfo',
          ['E-DORTANIA-TAHOE'],
          ['C-007'],
        ),
      );
    }
    if (flags.includes('no-hypervisor')) {
      findings.push(
        finding(
          'risk',
          '没有 Hypervisor：Docker Desktop、Parallels、VMware Fusion、安卓模拟器硬加速不可用',
          ['E-AMD-VANILLA'],
          ['C-011'],
        ),
      );
    }
    if (flags.includes('oc-102')) {
      findings.push(
        finding(
          'required',
          'OpenCore 必须 ≥ 1.0.2（AMD_CPU_EXT_FAMILY_1AH）',
          ['E-OC-108'],
          ['C-012'],
        ),
      );
    }

    /* ---------- 3. 图形 ---------- */
    if (gpu) {
      verdict = worst(verdict, gpu.verdict);
      for (const req of gpu.requirements)
        findings.push(finding('required', req.text, req.evidenceIds));
      for (const lim of gpu.limitations) findings.push(finding('risk', lim.text, lim.evidenceIds));

      if (gpu.gpu?.driver === 'none') {
        findings.push(
          finding('blocker', `${gpu.name} 没有任何 macOS 驱动`, gpu.evidenceIds, ['C-013']),
        );
        verdict = worst(verdict, 'incompatible');
      }
      if (gpu.gpu?.driver === 'third-party') {
        confidence = 'low';
        findings.push(
          finding('risk', '第三方图形驱动属实验性，一次小版本更新就可能失效', gpu.evidenceIds),
        );
      }
      if (input.route === 'vm' && gpu.gpu?.vendor === 'nvidia') {
        findings.push(
          finding(
            'risk',
            'NullMoth 驱动面向裸机，虚拟机内通常起不来；N 卡直通缺少可靠复现',
            ['E-NULLMOTH-TS'],
            ['C-024'],
          ),
        );
        verdict = worst(verdict, 'unverified');
        confidence = 'low';
      }
    }

    /* ---------- 4. 冲突扫描 ---------- */
    if (input.platform === 'amd' && gpu?.gpu?.vendor === 'nvidia') {
      findings.push(
        finding('risk', 'AMD CPU × NVIDIA 显卡存在 PAT 补丁冲突，常表现为驱动装不上或启动黑屏', [
          'E-AMD-VANILLA',
        ]),
      );
      confidence = 'low';
    }
    if (compareOs(input.targetOs, '26') >= 0) {
      findings.push(
        finding(
          'required',
          '移除 WhateverGreen（macOS 26 上会引发 kernel panic），agdpmod=pikera 改用 Kernel → Patch 注入',
          ['E-DORTANIA-TAHOE'],
          ['C-006'],
        ),
      );
    }
  }

  /* ---------- 5. 音频与无线 ---------- */
  if (audio && audio.verdict !== 'verified') {
    verdict = worst(verdict, audio.verdict);
    for (const req of audio.requirements)
      findings.push(finding('required', req.text, req.evidenceIds));
    for (const lim of audio.limitations) findings.push(finding('risk', lim.text, lim.evidenceIds));
  }
  if (wifi && wifi.verdict !== 'verified') {
    verdict = worst(verdict, wifi.verdict);
    for (const req of wifi.requirements)
      findings.push(finding('required', req.text, req.evidenceIds));
    for (const lim of wifi.limitations) findings.push(finding('risk', lim.text, lim.evidenceIds));
    if (wifi.features.airdrop === 'no') {
      findings.push(finding('risk', 'AirDrop / Handoff 不可用', wifi.evidenceIds, ['C-026']));
    }
  }

  /* ---------- 6. 缺失信息 ---------- */
  const incomplete = !isArm && !gpu;
  if (incomplete) {
    findings.push(
      finding('info', '未选择显卡：若使用核显，请确认它是否在支持列表内', ['E-DORTANIA-TAHOE']),
    );
    confidence = 'low';
  }

  /* ---------- 7. 结论收敛 ---------- */
  const hasBlocker = findings.some((f) => f.severity === 'blocker');
  if (hasBlocker) verdict = 'incompatible';
  else if (incomplete && verdict !== 'incompatible') verdict = 'unknown';
  if (verdict === 'verified' && findings.some((f) => f.severity === 'required')) {
    verdict = 'conditional';
  }
  if (verdict === 'verified' && confidence === 'low') verdict = 'experimental';

  if (verdict === 'incompatible') {
    alternatives.push({ label: '改用 QEMU/KVM 虚拟机', to: '/vm' });
  }
  alternatives.push({ label: '在资料库核对证据', to: '/library' });
  if (!isArm) alternatives.push({ label: '查看同平台其它配置', to: `/${input.platform}` });

  const dedup = new Map<string, Finding>();
  for (const f of findings) if (!dedup.has(f.text)) dedup.set(f.text, f);

  return {
    verdict,
    confidence,
    osCap,
    findings: [...dedup.values()].sort((a, b) => {
      const w: Record<Finding['severity'], number> = { blocker: 0, required: 1, risk: 2, info: 3 };
      return w[a.severity] - w[b.severity];
    }),
    missing,
    alternatives,
  };
}

export const CONFIDENCE_LABEL: Record<BuildResult['confidence'], string> = {
  high: '证据充分',
  medium: '证据一般',
  low: '证据薄弱',
};

export const SEVERITY_LABEL: Record<Finding['severity'], string> = {
  blocker: '阻断',
  required: '必做',
  risk: '风险',
  info: '提示',
};

export const CONFIDENCE_ORDER = CONFIDENCE_RANK;
