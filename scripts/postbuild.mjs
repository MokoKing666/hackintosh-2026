/**
 * GitHub Pages 的 SPA 兜底：
 * 直接访问 /hackintosh-2026/arm 会 404，把 index.html 复制成 404.html，
 * 由 Pages 返回该文件后 React Router 再按 pathname 渲染。
 */
import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = 'dist';

if (!existsSync(join(dist, 'index.html'))) {
  console.error('[postbuild] dist/index.html 不存在，先执行 vite build');
  process.exit(1);
}

await copyFile(join(dist, 'index.html'), join(dist, '404.html'));
await writeFile(join(dist, '.nojekyll'), '');

// 为每个路由生成实体目录，让 /library 这类深链接返回 200 而不是 404
const ROUTES = [
  'arm',
  'intel',
  'amd',
  'gpu',
  'virtualization',
  'peripherals',
  'generator',
  'library',
  'library/projects',
  'library/claims',
  'library/dead',
  // 旧路径保留，命中后由前端重定向
  'vm',
  'builder',
];
for (const route of ROUTES) {
  const dir = join(dist, route);
  await mkdir(dir, { recursive: true });
  await copyFile(join(dist, 'index.html'), join(dir, 'index.html'));
}

// 校验关键产物，避免「本地正常、线上 404」
const required = ['index.html', '404.html', 'favicon.svg'];
const missing = required.filter((f) => !existsSync(join(dist, f)));
if (missing.length) {
  console.error('[postbuild] 缺少产物:', missing.join(', '));
  process.exit(1);
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const files = await walk(dist);
const assets = files.filter((f) => f.includes(`${join('dist', 'assets')}`));
const fonts = assets.filter((f) => f.endsWith('.woff2'));
const js = assets.filter((f) => f.endsWith('.js'));
const css = assets.filter((f) => f.endsWith('.css'));

console.log(
  `[postbuild] 404.html 与 ${ROUTES.length} 个路由目录已生成 · 产物 ${files.length} 个（js ${js.length} / css ${css.length} / 字体 ${fonts.length}）`,
);
if (!fonts.length) console.warn('[postbuild] 警告：没有字体产物，检查 public/fonts 是否就位');
for (const f of assets.slice(0, 3)) console.log('  ·', relative(dist, f));
