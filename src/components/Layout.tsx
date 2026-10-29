import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './theme';

const NAV = [
  { to: '/', label: '总览', end: true },
  { to: '/arm', label: 'ARM' },
  { to: '/intel', label: 'Intel' },
  { to: '/amd', label: 'AMD' },
  { to: '/gpu', label: '显卡' },
  { to: '/virtualization', label: '虚拟化' },
  { to: '/peripherals', label: '外设' },
  { to: '/library', label: '资料库' },
];

function Brand() {
  return (
    <NavLink to="/" className="brand" aria-label="黑苹果配置全景 2026 · 回到总览">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <rect x="7" y="7" width="10" height="10" rx="2.5" />
        <path
          d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"
          strokeLinecap="round"
        />
      </svg>
      黑苹果配置全景
    </NavLink>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        跳到正文
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <Brand />
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? '收起导航' : '展开导航'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>

          <nav className="site-nav" id="site-nav" data-open={open} aria-label="主导航">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? false}
                className="nav-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="nav-actions">
              <Link
                to="/generator"
                className="btn btn--primary"
                style={{ padding: '5px 14px', fontSize: '0.8125rem' }}
                onClick={() => setOpen(false)}
              >
                生成器
              </Link>
              <ThemeToggle theme={theme} onToggle={toggle} />
            </div>
          </nav>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="site-footer__grid">
            <div>
              <h2>关于本站</h2>
              <p className="small" style={{ maxWidth: '32em' }}>
                2026 年 10 月的非官方 macOS 技术档案。每条结论绑定证据 ID、来源类型与核验日期；
                无法核实的说法标注为「仅有项目方声明」，不冒充已验证事实。
              </p>
            </div>
            <div>
              <h2>平台</h2>
              <ul>
                <li>
                  <NavLink to="/arm">ARM 移植</NavLink>
                </li>
                <li>
                  <NavLink to="/intel">Intel 平台</NavLink>
                </li>
                <li>
                  <NavLink to="/amd">AMD 平台</NavLink>
                </li>
                <li>
                  <NavLink to="/gpu">显卡资料</NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h2>资料</h2>
              <ul>
                <li>
                  <NavLink to="/library">硬件矩阵</NavLink>
                </li>
                <li>
                  <NavLink to="/library/projects">项目图谱</NavLink>
                </li>
                <li>
                  <NavLink to="/library/claims">结论台账</NavLink>
                </li>
                <li>
                  <NavLink to="/library/dead">失效与纠错</NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h2>声明</h2>
              <ul className="small">
                <li>数据截止 2026-10-29</li>
                <li>Star 数为当日 GitHub 快照</li>
                <li>不提供 Apple 二进制、EFI 或安装镜像</li>
              </ul>
            </div>
          </div>
          <div className="site-footer__bottom">
            <span>HACKINTOSH PANORAMA 2026 · 数据截止 2026-10-29</span>
            <span>REACT · TYPESCRIPT · VITE · 无追踪脚本</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
