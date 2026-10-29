import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';

// 路由级懒加载：首屏只加载首页，其余页面按需拉取
const ArmPage = lazy(() => import('@/pages/ArmPage').then((m) => ({ default: m.ArmPage })));
const IntelPage = lazy(() => import('@/pages/IntelPage').then((m) => ({ default: m.IntelPage })));
const AmdPage = lazy(() => import('@/pages/AmdPage').then((m) => ({ default: m.AmdPage })));
const GpuPage = lazy(() => import('@/pages/GpuPage').then((m) => ({ default: m.GpuPage })));
const VirtualizationPage = lazy(() =>
  import('@/pages/VirtualizationPage').then((m) => ({ default: m.VirtualizationPage })),
);
const PeripheralsPage = lazy(() =>
  import('@/pages/PeripheralsPage').then((m) => ({ default: m.PeripheralsPage })),
);
const LibraryPage = lazy(() =>
  import('@/pages/LibraryPage').then((m) => ({ default: m.LibraryPage })),
);
const GeneratorPage = lazy(() =>
  import('@/pages/GeneratorPage').then((m) => ({ default: m.GeneratorPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="container" style={{ paddingTop: 120, paddingBottom: 120 }}>
            <span className="caption">正在加载…</span>
          </div>
        }
      >
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="arm" element={<ArmPage />} />
            <Route path="intel" element={<IntelPage />} />
            <Route path="amd" element={<AmdPage />} />
            <Route path="gpu" element={<GpuPage />} />
            <Route path="virtualization" element={<VirtualizationPage />} />
            <Route path="peripherals" element={<PeripheralsPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/:tab" element={<LibraryPage />} />
            <Route path="generator" element={<GeneratorPage />} />
            {/* 旧路径兼容 */}
            <Route path="vm" element={<Navigate to="/virtualization" replace />} />
            <Route path="builder" element={<Navigate to="/generator" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
