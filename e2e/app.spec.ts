import { expect, test } from '@playwright/test';

test.describe('路由与导航', () => {
  test('首页加载并显示标题与统计', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/黑苹果配置全景 2026/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('站在 x86 的终点');
    await expect(page.getByText('2026-10-29').first()).toBeVisible();
  });

  test('直接访问子页面可用（不是只能从首页点进去）', async ({ page }) => {
    await page.goto('library');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('全部数据');
    await expect(page.getByRole('table', { name: '硬件兼容矩阵' })).toBeVisible();
  });

  test('刷新子页面仍然正常', async ({ page }) => {
    await page.goto('generator');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('可行性评估引擎');
  });

  test('浏览器前进后退可用', async ({ page }) => {
    await page.goto('./');
    await page.locator('footer a[href$="/arm"]').click();
    await expect(page).toHaveURL(/\/arm$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });

  test('未知路径显示 404 页面而不是白屏', async ({ page }) => {
    await page.goto('no-such-page');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('这个地址没有内容');
    await expect(page.getByRole('link', { name: '回到总览', exact: true })).toBeVisible();
  });

  test('页脚链接指向有效页面', async ({ page }) => {
    await page.goto('./');
    await page.locator('footer a[href$="/library/claims"]').click();
    await expect(page).toHaveURL(/\/library\/claims$/);
    await expect(page.getByText('C-001')).toBeVisible();
  });
});

test.describe('资料库交互', () => {
  test('按状态筛选并显示命中数', async ({ page }) => {
    await page.goto('library');
    await page.getByRole('button', { name: '不兼容', exact: true }).click();
    const count = page.locator('.toolbar__count').first();
    await expect(count).toContainText('/ 50');
    await expect(page.getByRole('table')).toContainText('Navi 3x');
  });

  test('搜索无结果时显示空状态', async ({ page }) => {
    await page.goto('library');
    await page.getByLabel('搜索').fill('zzzz-no-such');
    await expect(page.getByText('没有匹配的硬件')).toBeVisible();
  });

  test('表头可排序', async ({ page }) => {
    await page.goto('library/projects');
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toContainText('Docker-OSX');
    await page.getByRole('button', { name: /★/ }).click();
    await expect(page.locator('tbody tr').first()).not.toContainText('Docker-OSX');
  });

  test('切换 Tab 会写入 URL', async ({ page }) => {
    await page.goto('library');
    await page.getByRole('tab', { name: '项目图谱' }).click();
    await expect(page).toHaveURL(/\/library\/projects$/);
    await expect(page.getByRole('table', { name: '开源项目图谱' })).toBeVisible();
  });
});

test.describe('配置生成器', () => {
  test('默认配置给出结论与系统上限', async ({ page }) => {
    await page.goto('generator');
    await expect(page.getByText('有条件可用').first()).toBeVisible();
    await expect(page.locator('.verdict-panel__cap')).toContainText('26.7');
  });

  test('换成不兼容显卡后结论变化，并写入 URL', async ({ page }) => {
    await page.goto('generator');
    await page.getByLabel('显卡 / 核显').selectOption('gpu-rx7900');
    await expect(page.getByText('已知不兼容').first()).toBeVisible();
    await expect(page).toHaveURL(/gpu=gpu-rx7900/);
  });

  test('切到 ARM 后隐藏显卡选择并给出实验性结论', async ({ page }) => {
    await page.goto('generator');
    await page.getByLabel('平台').selectOption('arm');
    await expect(page.getByLabel('显卡 / 核显')).toHaveCount(0);
    await expect(page.getByText('实验性支持').first()).toBeVisible();
  });

  test('复制清单按钮有真实反馈', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('generator');
    await page.getByRole('button', { name: '复制清单' }).click();
    await expect(page.getByRole('button', { name: '已复制' })).toBeVisible();
  });
});

test.describe('移动端', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 800, '仅移动端视口');

  test('汉堡菜单可展开并跳转', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: '展开导航' }).click();
    await expect(page.locator('#site-nav')).toBeVisible();
    await page.locator('#site-nav').getByRole('link', { name: '显卡' }).click();
    await expect(page).toHaveURL(/\/gpu$/);
  });

  test('无横向溢出', async ({ page }) => {
    await page.goto('library');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
