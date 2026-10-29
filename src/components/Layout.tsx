import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/', label: '总览', end: true },
  { to: '/arm', label: 'ARM' },
  { to: '/intel', label: 'Intel' },
  { to: '/amd', label: 'AMD' },
  { to: '/gpu', label: '显卡' },
  { to: '/vm', label: '虚拟机' },
  { to: '/peripherals', label: '外设' },
  { to: '/library', label: '资料库' },
  { to: '/builder', label: '生成器' },
];

function Brand() {
  return (
    <NavLink to="/" className="brand">
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
      黑苹果全景
    </NavLink>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);

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
          <nav className="site-nav" id="site-nav" data-open={open}>
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
              <p className="small" style={{ maxWidth: '34em' }}>
                2026 年 10
                月黑苹果现状档案。数据来自上游仓库、官方文档与社区实测，每条结论都挂了证据与核验日期。
                本站不提供任何 Apple 二进制、EFI 或安装镜像。
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
                  <Link to="/library/projects">项目图谱</Link>
                </li>
                <li>
                  <Link to="/library/claims">结论台账</Link>
                </li>
                <li>
                  <Link to="/library/dead">取证纠错</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2>声明</h2>
              <ul className="small">
                <li>数据截止 2026-10-29</li>
                <li>star 数为当日 GitHub 快照</li>
                <li>非 Apple 硬件运行 macOS 可能违反许可协议</li>
              </ul>
            </div>
          </div>
          <div className="site-footer__bottom">
            <span>黑苹果配置全景 2026 · 数据截止 2026-10-29</span>
            <span>React + TypeScript + Vite · 无追踪、无第三方脚本</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
