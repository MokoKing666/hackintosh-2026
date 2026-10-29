import { useEffect } from 'react';

const SUFFIX = '黑苹果配置全景 2026';

/**
 * 设置页面标题。
 * raw = true 时直接使用传入文本（首页用完整 SEO 标题），否则追加站点后缀。
 */
export function useDocumentTitle(title: string, raw = false): void {
  useEffect(() => {
    document.title = raw ? title : title ? `${title} · ${SUFFIX}` : SUFFIX;
  }, [title, raw]);
}
