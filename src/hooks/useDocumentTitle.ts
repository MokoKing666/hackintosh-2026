import { useEffect } from 'react';

const SUFFIX = '黑苹果配置全景 2026';

/** 每个页面设置独立标题，便于分享与历史记录识别 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
  }, [title]);
}
