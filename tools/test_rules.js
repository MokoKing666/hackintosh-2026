#!/usr/bin/env node
/* test_rules.js — 规则引擎断言自测（Node，无浏览器）
   用法：node tools/test_rules.js
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const sandbox = { window: {}, console };
vm.createContext(sandbox);

for (const rel of ['assets/data/hw.js', 'assets/js/rules.js']) {
  const code = fs.readFileSync(path.join(root, rel), 'utf8');
  vm.runInContext(code, sandbox, { filename: rel });
}

const RULES = sandbox.window.RULES;
if (!RULES) {
  console.error('规则引擎未加载');
  process.exit(1);
}

const base = {
  platform: 'intel',
  cpu: 'i5-10400',
  gpu: 'rx6600',
  wifi: 'bcm94360',
  audio: 'simplehda',
  os: '26.7',
};

function solve(patch) {
  return RULES.solve(Object.assign({}, base, patch));
}

function has(list, kw) {
  return list.some((i) => i.text.indexOf(kw) > -1);
}

const cases = [
  {
    name: 'Navi 3x + 26.7 必须阻断',
    run: () => solve({ gpu: 'rx7900xtx' }),
    check: (r) => r.blockTotal > 0 && has(r.blocked, 'Navi 3x'),
  },
  {
    name: 'RDNA3 APU（780M）必须阻断',
    run: () => solve({ platform: 'amd', cpu: 'r7-8845hs', gpu: 'rdna-apu' }),
    check: (r) => r.blockTotal > 0,
  },
  {
    name: 'RTX 5080 + 26 应走 NullMoth 分支且带双 4K 风险',
    run: () => solve({ gpu: 'rtx5080', os: '26' }),
    check: (r) => r.blockTotal === 0 && has(r.must, 'NullMoth') && has(r.risk, '双 4K'),
  },
  {
    name: '骁龙 X Elite 必须阻断',
    run: () => solve({ platform: 'arm', cpu: 'xelite' }),
    check: (r) => r.blockTotal > 0,
  },
  {
    name: 'RK3588 + 27 应为实验且上限 27.2 Beta',
    run: () => solve({ platform: 'arm', cpu: 'rk3588', os: '27' }),
    check: (r) => r.blockTotal === 0 && r.verdict.level === 'exp' && r.osCap.indexOf('27.2') > -1,
  },
  {
    name: 'x86 + macOS 27 必须阻断',
    run: () => solve({ os: '27' }),
    check: (r) => r.blockTotal > 0 && has(r.blocked, 'Apple Silicon'),
  },
  {
    name: 'i9-14900K + 26.7 应要求 CPUID 伪装与移除 WhateverGreen',
    run: () => solve({ cpu: 'i5-13600k', gpu: 'rx6800xt' }),
    check: (r) => has(r.must, 'Cpuid') && has(r.must, 'WhateverGreen'),
  },
  {
    name: 'AMD CPU × NVIDIA 应报 PAT 冲突',
    run: () => solve({ platform: 'amd', cpu: 'r5-5600', gpu: 'rtx3060', os: '15' }),
    check: (r) => has(r.risk, 'PAT'),
  },
  {
    name: 'Zen5 应提示 OpenCore 版本门槛',
    run: () => solve({ platform: 'amd', cpu: 'r9-9950x', gpu: 'rx6600' }),
    check: (r) => has(r.must, '1.0.2'),
  },
  {
    name: 'Snapintosh 必须写明机型与 Mac 主机前提',
    run: () => solve({ platform: 'arm', cpu: 'snapintosh', os: '27' }),
    check: (r) => r.blockTotal === 0 && has(r.must, 'Zenbook') && has(r.must, 'USB-C'),
  },
  {
    name: 'AppleALC + macOS 26 必须阻断（AppleHDA 已移除）',
    run: () => solve({ audio: 'applealc', os: '26' }),
    check: (r) => r.blockTotal > 0 && has(r.blocked, 'AppleHDA'),
  },
  {
    name: '树莓派 5 必须阻断',
    run: () => solve({ platform: 'arm', cpu: 'pi5' }),
    check: (r) => r.blockTotal > 0,
  },
  {
    name: '标准 i5-10400 + RX 6600 + 26.7 应为可用或需补丁（不应阻断）',
    run: () => solve({}),
    check: (r) => r.blockTotal === 0 && (r.verdict.level === 'ok' || r.verdict.level === 'patch'),
  },
];

let pass = 0;
const failed = [];

for (const c of cases) {
  let r;
  try {
    r = c.run();
  } catch (e) {
    failed.push(`${c.name} — 抛异常：${e.message}`);
    continue;
  }
  if (c.check(r)) {
    pass++;
    console.log(`  ok   ${c.name}`);
  } else {
    failed.push(c.name);
    console.log(`  FAIL ${c.name}`);
    console.log(
      `       verdict=${r.verdict.level} cap=${r.osCap} must=${r.mustTotal} risk=${r.riskTotal} block=${r.blockTotal}`,
    );
  }
}

console.log(`\n${pass}/${cases.length} 通过`);
if (failed.length) {
  console.log('失败项：');
  failed.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
