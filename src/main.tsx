import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { validateDomain } from './domain/validate';
import { initTheme } from './components/theme';
import fontRegular from './assets/fonts/MiSans-400.woff2?url';
import fontSemibold from './assets/fonts/MiSans-600.woff2?url';
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/app.css';

// 主题要在首帧前写入，避免深色站点闪白
initTheme();

// 启动即校验：数据写错要在这里炸，而不是渲染出空表格
validateDomain();

// 预载正文与标题两档字重（构建后是带 hash 的绝对路径，天然带 base）
for (const href of [fontRegular, fontSemibold]) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.href = href;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

const root = document.getElementById('root');
if (!root) throw new Error('#root 不存在');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
