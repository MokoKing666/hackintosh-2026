import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'hp-theme';

function apply(theme: Theme) {
  document.documentElement.dataset['theme'] = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(KEY);
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}

/** 在 React 挂载前先把主题写上，避免首帧闪白 */
export function initTheme(): void {
  const stored = localStorage.getItem(KEY);
  apply(stored === 'light' ? 'light' : 'dark');
}
