/**
 * check-build.mjs — 构建产物自检：
 * 1. 所有 JS/CSS 引用都带 /hackintosh-2026/ 前缀（GitHub Pages 子路径）
 * 2. 404.html 存在且与 index.html 同源
 * 3. 字体与样式确实被引用
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const BASE = '/hackintosh-2026/';
const problems = [];

const html = await readFile(join(DIST, 'index.html'), 'utf8');

if (!existsSync(join(DIST, '404.html'))) problems.push('缺少 404.html（SPA 深链接会 404）');

const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
const assetRefs = refs.filter((r) => r.includes('/assets/'));

if (!assetRefs.length) problems.push('index.html 没有引用任何 assets 产物');

for (const ref of assetRefs) {
  if (!ref.startsWith(BASE)) {
    problems.push(`资源路径没有 base 前缀: ${ref}`);
  }
  const rel = ref.replace(BASE, '');
  if (!existsSync(join(DIST, rel))) problems.push(`引用的文件不存在: ${rel}`);
}

let fontUrls = [];
const cssFile = assetRefs.find((r) => r.endsWith('.css'));
if (cssFile) {
  const css = await readFile(join(DIST, cssFile.replace(BASE, '')), 'utf8');
  if (!css.includes('MiSans')) problems.push('CSS 里没有字体声明');
  fontUrls = [...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => m[1].replace(/["']/g, ''));
  if (!fontUrls.length) problems.push('CSS 里没有引用 woff2 字体');
  for (const u of fontUrls) {
    const rel = u.replace(/^\.\.\//, '').replace(BASE, '');
    if (!existsSync(join(DIST, rel))) problems.push(`字体文件不存在: ${rel}`);
  }
}

const assets = await readdir(join(DIST, 'assets'));
const jsChunks = assets.filter((f) => f.endsWith('.js'));
if (jsChunks.length < 2) problems.push('没有生成按路由拆分的 chunk，检查代码分割是否生效');

if (problems.length) {
  console.error('[check-build] 发现 %d 个问题：', problems.length);
  for (const p of problems) console.error('  ·', p);
  process.exit(1);
}

console.log(
  `[check-build] 通过 · HTML 引用 ${assetRefs.length} 个产物 · JS chunk ${jsChunks.length} 个 · 字体 ${fontUrls.length} 个`,
);
