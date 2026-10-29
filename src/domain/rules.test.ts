import { describe, expect, it } from 'vitest';
import { solve } from './rules';
import { HARDWARE } from './hardware';
import { PROJECTS } from './projects';
import { validateDomain } from './validate';
import type { BuildInput } from './types';

const base: BuildInput = {
  platform: 'intel',
  cpuId: 'cpu-intel-comet',
  gpuId: 'gpu-rx6600',
  boardId: 'board-z490',
  wifiId: 'wifi-bcm94360',
  audioId: 'audio-alc',
  nvmeId: 'ssd-sn850',
  targetOs: '26.7',
  route: 'bare-metal',
  acceptOclp: true,
  allowExperimental: true,
};

const run = (patch: Partial<BuildInput>) => solve({ ...base, ...patch });

describe('领域数据', () => {
  it('通过运行时校验（结构 + 证据引用）', () => {
    expect(() => validateDomain()).not.toThrow();
  });

  it('硬件与项目数量符合预期', () => {
    expect(HARDWARE.length).toBeGreaterThanOrEqual(50);
    expect(PROJECTS.length).toBeGreaterThanOrEqual(85);
  });

  it('不存在重复的硬件 id', () => {
    const ids = HARDWARE.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('规则引擎 · 平台与版本闸门', () => {
  it('x86 + macOS 27 必须判为已知不兼容', () => {
    const r = run({ targetOs: '27' });
    expect(r.verdict).toBe('incompatible');
    expect(r.findings.some((f) => f.severity === 'blocker' && f.text.includes('macOS 27'))).toBe(
      true,
    );
  });

  it('x86 的系统上限是 26.7', () => {
    expect(run({}).osCap.max).toBe('26.7');
  });

  it('ARM + 虚拟机路线必须阻断', () => {
    const r = run({
      platform: 'arm',
      cpuId: 'arm-rk3588',
      gpuId: null,
      boardId: 'board-arm',
      route: 'vm',
    });
    expect(r.verdict).toBe('incompatible');
    expect(r.findings.some((f) => f.text.includes('虚拟机'))).toBe(true);
  });

  it('骁龙 X Elite 必须判为不兼容', () => {
    const r = run({ platform: 'arm', cpuId: 'arm-xelite', gpuId: null, boardId: 'board-arm' });
    expect(r.verdict).toBe('incompatible');
  });

  it('RK3588 是实验性，上限含 beta', () => {
    const r = run({
      platform: 'arm',
      cpuId: 'arm-rk3588',
      gpuId: null,
      boardId: 'board-arm',
      targetOs: '27',
    });
    expect(r.verdict).toBe('experimental');
    expect(r.osCap.beta).toBe(true);
  });
});

describe('规则引擎 · 图形层', () => {
  it('Navi 3x 必须阻断', () => {
    const r = run({ gpuId: 'gpu-rx7900' });
    expect(r.verdict).toBe('incompatible');
    expect(r.findings.some((f) => f.severity === 'blocker')).toBe(true);
  });

  it('RDNA3 APU 必须阻断', () => {
    const r = run({ gpuId: 'igpu-rdna-apu' });
    expect(r.verdict).toBe('incompatible');
  });

  it('RTX 5080 走第三方驱动分支，并给出双 4K 与 ReBAR 提示', () => {
    const r = run({ gpuId: 'gpu-blackwell', targetOs: '26' });
    expect(r.verdict).toBe('experimental');
    const text = r.findings.map((f) => f.text).join(' ');
    expect(text).toContain('ReBAR');
    expect(text).toContain('双 4K');
  });

  it('AMD CPU × NVIDIA 显卡提示 PAT 冲突', () => {
    const r = run({ platform: 'amd', cpuId: 'cpu-amd-zen3', gpuId: 'gpu-ampere', targetOs: '15' });
    expect(r.findings.some((f) => f.text.includes('PAT'))).toBe(true);
  });

  it('虚拟机 + N 卡判为尚未验证', () => {
    const r = run({ gpuId: 'gpu-ampere', route: 'vm', targetOs: '15' });
    expect(r.verdict).toBe('unverified');
  });
});

describe('规则引擎 · CPU 与冲突', () => {
  it('12 代 Intel 要求 CPUID 伪装', () => {
    const r = run({ cpuId: 'cpu-intel-alder' });
    expect(r.findings.some((f) => f.text.includes('CPUID'))).toBe(true);
  });

  it('Zen5 要求 OpenCore 1.0.2', () => {
    const r = run({ platform: 'amd', cpuId: 'cpu-amd-zen5', gpuId: 'gpu-rx6600' });
    expect(r.findings.some((f) => f.text.includes('1.0.2'))).toBe(true);
  });

  it('AMD 平台提示没有 Hypervisor', () => {
    const r = run({ platform: 'amd', cpuId: 'cpu-amd-zen3', gpuId: 'gpu-rx6600' });
    expect(r.findings.some((f) => f.text.includes('Hypervisor'))).toBe(true);
  });

  it('macOS 26 要求移除 WhateverGreen', () => {
    const r = run({ targetOs: '26' });
    expect(r.findings.some((f) => f.text.includes('WhateverGreen'))).toBe(true);
  });

  it('ALC 声卡在 26 上要求替换音频方案', () => {
    const r = run({ targetOs: '26', audioId: 'audio-alc' });
    expect(r.findings.some((f) => f.text.includes('SimpleHDA'))).toBe(true);
  });

  it('AX210 提示 AirDrop 不可用', () => {
    const r = run({ wifiId: 'wifi-ax210' });
    expect(r.findings.some((f) => f.text.includes('AirDrop'))).toBe(true);
  });
});

describe('规则引擎 · 缺失输入与确定性', () => {
  it('NVMe 黑名单硬盘直接阻断', () => {
    const r = run({ nvmeId: 'ssd-pm981' });
    expect(r.verdict).toBe('incompatible');
    expect(r.findings.some((f) => f.severity === 'blocker' && f.text.includes('PM981'))).toBe(true);
  });

  it('不接受实验驱动时，第三方驱动显卡被阻断', () => {
    const r = run({ gpuId: 'gpu-blackwell', targetOs: '26', allowExperimental: false });
    expect(r.verdict).toBe('incompatible');
    expect(r.findings.some((f) => f.text.includes('实验驱动'))).toBe(true);
  });

  it('接受实验驱动后同一组合变为实验性支持', () => {
    const r = run({ gpuId: 'gpu-blackwell', targetOs: '26', allowExperimental: true });
    expect(r.verdict).toBe('experimental');
  });

  it('不接受 OCLP 根补丁时 Broadcom 方案阻断', () => {
    const r = run({ targetOs: '26', acceptOclp: false });
    expect(r.verdict).toBe('incompatible');
    expect(r.findings.some((f) => f.text.includes('OCLP'))).toBe(true);
  });

  it('缺少 CPU 返回信息不足', () => {
    const r = run({ cpuId: null });
    expect(r.verdict).toBe('unknown');
    expect(r.missing).toContain('CPU 型号');
  });

  it('缺少显卡返回信息不足但保留 CPU 结论', () => {
    const r = run({ gpuId: null });
    expect(r.verdict).toBe('unknown');
    expect(r.missing.some((m) => m.includes('显卡'))).toBe(true);
  });

  it('相同输入两次结果完全一致', () => {
    expect(run({})).toEqual(run({}));
  });

  it('结论为不兼容时提供替代方案', () => {
    const r = run({ targetOs: '27' });
    expect(r.alternatives.some((a) => a.to === '/vm')).toBe(true);
  });

  it('所有 finding 都带证据', () => {
    const r = run({ gpuId: 'gpu-blackwell', targetOs: '26' });
    for (const f of r.findings) expect(f.evidenceIds.length).toBeGreaterThan(0);
  });
});
