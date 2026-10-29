import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('页面不存在');
  return (
    <div className="section">
      <div className="container container--text">
        <p className="eyebrow">404</p>
        <h1>这个地址没有内容</h1>
        <p className="lead" style={{ marginTop: 12 }}>
          可能是链接过期，或者拼写有误。站内没有隐藏页面，所有资料都在资料库里。
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Link className="btn btn--primary" to="/">
            回到总览
          </Link>
          <Link className="btn" to="/library">
            打开资料库
          </Link>
        </div>
      </div>
    </div>
  );
}
