import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VerdictBadge } from '@/components/VerdictBadge';
import { DataTable } from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { BuilderPage } from '@/pages/BuilderPage';
import { LibraryPage } from '@/pages/LibraryPage';

interface Row {
  id: string;
  name: string;
  n: number;
}

const rows: Row[] = [
  { id: 'a', name: 'Bravo', n: 2 },
  { id: 'b', name: 'Alpha', n: 10 },
  { id: 'c', name: 'Charlie', n: 1 },
];

const columns: Column<Row>[] = [
  { key: 'name', header: '名称', render: (r) => r.name, sortValue: (r) => r.name },
  { key: 'n', header: '数值', align: 'right', render: (r) => r.n, sortValue: (r) => r.n },
];

describe('VerdictBadge', () => {
  it('渲染中文标签与状态类名', () => {
    const { container } = render(<VerdictBadge verdict="conditional" />);
    expect(screen.getByText('有条件可用')).toBeInTheDocument();
    expect(container.querySelector('.badge--conditional')).not.toBeNull();
    expect(container.querySelector('.vmark')).not.toBeNull();
  });

  it('六种状态都有独立类名', () => {
    const all = [
      'verified',
      'conditional',
      'experimental',
      'unverified',
      'incompatible',
      'unknown',
    ] as const;
    for (const v of all) {
      const { container } = render(<VerdictBadge verdict={v} />);
      expect(container.querySelector(`.badge--${v}`)).not.toBeNull();
    }
  });
});

describe('DataTable', () => {
  it('按名称升序排序', () => {
    render(
      <DataTable
        label="测试表"
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        initialSort={{ key: 'name', dir: 'asc' }}
      />,
    );
    const cells = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell')[0]?.textContent);
    expect(cells).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('点击表头切换排序方向', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        label="测试表"
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        initialSort={{ key: 'n', dir: 'asc' }}
      />,
    );
    const header = screen.getByRole('button', { name: /数值/ });
    await user.click(header);
    const cells = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell')[0]?.textContent);
    expect(cells).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(header.closest('th')?.getAttribute('aria-sort')).toBe('descending');
  });

  it('空数据时展示空状态', () => {
    render(<DataTable label="测试表" rows={[]} columns={columns} rowKey={(r) => r.id} />);
    expect(screen.getByText('没有匹配的记录')).toBeInTheDocument();
  });
});

describe('BuilderPage', () => {
  it('默认配置给出有条件可用', async () => {
    render(
      <MemoryRouter initialEntries={['/builder']}>
        <BuilderPage />
      </MemoryRouter>,
    );
    expect(await screen.findByText('有条件可用')).toBeInTheDocument();
    expect(screen.getByText('macOS 26.7', { selector: 'b' })).toBeInTheDocument();
  });

  it('选择 Navi 3x 后判为不兼容', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/builder']}>
        <BuilderPage />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('显卡 / 核显'), 'gpu-rx7900');
    expect(await screen.findByText('已知不兼容')).toBeInTheDocument();
  });

  it('切到 ARM 平台后隐藏显卡选择', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/builder']}>
        <BuilderPage />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('平台'), 'arm');
    expect(screen.queryByLabelText('显卡 / 核显')).toBeNull();
    expect(await screen.findByText('实验性支持')).toBeInTheDocument();
  });
});

describe('LibraryPage', () => {
  it('默认展示硬件矩阵并显示计数', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/library']}>
        <LibraryPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('table', { name: '硬件兼容矩阵' })).toBeInTheDocument();
    expect(container.querySelector('.toolbar__count')?.textContent).toMatch(/50 \/ 50/);
  });

  it('切换到项目图谱', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/library']}>
        <Routes>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:tab" element={<LibraryPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('tab', { name: '项目图谱' }));
    expect(await screen.findByRole('table', { name: '开源项目图谱' })).toBeInTheDocument();
  });

  it('搜索无结果时给出空状态', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/library']}>
        <Routes>
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:tab" element={<LibraryPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText('搜索'), 'zzzz-no-such-hardware');
    expect(await screen.findByText('没有匹配的硬件')).toBeInTheDocument();
  });
});
