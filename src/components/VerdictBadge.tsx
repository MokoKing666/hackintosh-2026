import type { Verdict } from '@/domain/types';
import { VERDICT_LABEL } from '@/domain/rules';

/**
 * 六态标记用 CSS 画，不依赖字体字形：
 * 圆点 / 半圆 / 菱形 / 空心圆 / 叉 / 虚线圆。
 * 这样在灰度、色盲与缺字环境下都能区分。
 */
export function VerdictBadge({ verdict, label }: { verdict: Verdict; label?: string }) {
  return (
    <span className={`badge badge--${verdict}`} title={VERDICT_LABEL[verdict]}>
      <span className={`vmark vmark--${verdict}`} aria-hidden="true" />
      {label ?? VERDICT_LABEL[verdict]}
    </span>
  );
}
