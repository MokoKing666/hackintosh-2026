# 黑苹果配置全景 2026

2026 年 10 月的黑苹果现状档案：x86 定格在 macOS 26.7，ARM 四条移植路线同时开跑，N 卡被第三方驱动重新点亮。

**在线站点：https://mokoking666.github.io/hackintosh-2026/**

React + TypeScript + Vite 单页应用，纯静态部署在 GitHub Pages 子路径 `/hackintosh-2026/` 下。

---

## 这个站解决什么问题

网上关于黑苹果的信息有两个毛病：一是过期，二是没有证据。这个站的做法是：

1. **每条结论都挂证据**：官方文档 / 上游代码 / 可复现测试 / 社区报告 / 项目方声明 / 推断，六级分开标注。
2. **六态结论**：已验证可用 / 有条件可用 / 实验性支持 / 尚未验证 / 已知不兼容 / 信息不足。不允许把「不知道」写成「可以」。
3. **一个数据源**：硬件、项目、结论、纠错全部在 `src/domain/`，页面只负责展示，不允许各页维护互相矛盾的说法。
4. **配置生成器**是纯函数规则引擎，可单测，输出必做清单、风险与阻断项，并给出替代方案。

## 技术栈

| 层       | 选择                                                                 |
| -------- | -------------------------------------------------------------------- |
| 框架     | React 19 + TypeScript 5.9（strict + `noUncheckedIndexedAccess`）     |
| 构建     | Vite 8，`base: '/hackintosh-2026/'`，路由级代码分割                  |
| 路由     | React Router 7（BrowserRouter + basename），深链接靠 `404.html` 兜底 |
| 样式     | 全局设计令牌（`src/styles/tokens.css`）+ 单一组件样式表，无 UI 框架  |
| 数据校验 | Zod 4，启动时校验结构与证据引用                                      |
| 测试     | Vitest + Testing Library（42 例）、Playwright（30 例）               |
| 质量     | ESLint 9（flat config）、Prettier                                    |
| 部署     | GitHub Actions → Pages（artifact 方式）                              |

**视觉与交互**：深色为默认主题（可切换浅色），Apple 硬件页式 Bento 网格；硬件/项目卡片分三层披露——正面只有名称、状态、一句结论与 2–4 项指标，展开看配置要求，右下角证据胶囊点开是完整来源浮层（含等级、版本、核验日期）。

字体：本地 MiSans 子集，三档字重（400/500/600）共约 428KB，`font-display: swap` + 关键两档预载；子集覆盖全站文案字符，构建前用 `--check` 校验缺字。

## 快速开始

```bash
npm ci            # 安装依赖（package-lock.json 已锁定）
npm run dev       # 本地开发
npm run verify    # 类型检查 + Lint + 单测 + 构建
```

其他命令：

```bash
npm run typecheck   # tsc -b --force
npm run lint        # eslint .
npm run format      # prettier --check .
npm run test        # vitest run（42 例）
npm run e2e         # playwright（30 例，桌面 + 移动）
npm run build       # tsc -b && vite build + postbuild
```

## 目录结构

```
src/
  domain/           唯一数据源与规则引擎（纯 TS，不依赖 React）
    types.ts        领域类型：六态、证据等级、硬件/项目/结论
    evidence.ts     证据库（43 条，带版本、核验日期、失效标记）
    hardware.ts     50 条硬件兼容记录
    projects.ts     86 个项目 + 20 个失效项目
    claims.ts       30 条结论台账 + 8 条取证纠错
    boards.ts       主板与插槽（配置生成器用）
    rules.ts        solve()：平台闸门 → 版本闸门 → CPU → 图形 → 冲突 → 结论
    validate.ts     Zod 运行时校验 + 证据引用完整性检查
  components/       Layout、DataTable、VerdictBadge、Evidence、Toolbar…
  pages/            9 个路由页面
  styles/           tokens.css / app.css / fonts.css
e2e/                Playwright 用例
scripts/            postbuild（生成 404.html）、check-build（子路径自检）
tools/              MiSans 子集化脚本
docs/               DESIGN.md（设计令牌与组件规范）、MIGRATION.md、AUDIT.md
```

## 数据模型要点

- 硬件记录同时承载「展示字段」与「引擎字段」（`cpu.flags`、`gpu.driver`、`arm.bootMethod`），规则引擎不靠字符串比较判断分支。
- 每条要求与限制都带 `evidenceIds`；`validateDomain()` 会在启动时检查引用是否真实存在。
- 项目记录把「代码开放度」与「可复现程度」拆成两个维度——有仓库不等于别人能跑起来。

## 部署

推送到 `main` 触发 `.github/workflows/deploy.yml`：类型检查 → Lint → 格式 → 单测 → E2E → 构建 → 子路径自检 → 上传 artifact → 部署 Pages。

Pages 的 Source 需设为 **GitHub Actions**（不是 branch）。仓库名必须保持 `hackintosh-2026`，否则要同步修改 `vite.config.ts` 的 `base`。

本地验证产物：

```bash
npm run build && node scripts/check-build.mjs
npx vite preview --port 4173 --host 127.0.0.1
```

## 更新内容时

1. 改 `src/domain/*`，先补证据再改结论；
2. 若新增文案字符，重跑 `python tools/subset_fonts.py`，再 `--check` 确认无缺字；
3. `npm run verify`，推送到 `main` 等 Actions 绿。

## 免责声明

在非 Apple 硬件上运行 macOS 可能违反 Apple 的软件许可协议。本站只做技术资料整理，**不提供**任何 Apple 二进制、EFI 或安装镜像；所有商标归其所有者。
