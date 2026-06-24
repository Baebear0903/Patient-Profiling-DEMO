import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {FormEvent} from 'react';
import {describe, expect, it, vi} from 'vitest';

import {Button} from '@/components/ui/button';
import {CompactPagination} from '@/components/common/CompactPagination';
import {
  ConfirmAction,
  type ConfirmActionProps,
} from '@/components/common/ConfirmAction';
import {DataTableShell} from '@/components/common/DataTableShell';
import {PageHeader} from '@/components/common/PageHeader';
import {StatusBadge} from '@/components/common/StatusBadge';

describe('PageHeader', () => {
  it('renders its heading, description, and actions', () => {
    render(
      <PageHeader title="标签清单" description="共 30 个标签">
        <Button>新增标签</Button>
      </PageHeader>,
    );

    expect(
      screen.getByRole('heading', {level: 1, name: '标签清单'}),
    ).toHaveClass('text-lg');
    expect(screen.getByText('共 30 个标签')).toHaveClass('text-[10px]');
    expect(screen.getByRole('button', {name: '新增标签'})).toBeVisible();
  });
});

describe('StatusBadge', () => {
  it('uses the published status color', () => {
    render(<StatusBadge status="已发布" />);

    expect(screen.getByText('已发布')).toHaveClass('text-emerald-700');
  });

  it('falls back to a neutral style for unknown statuses', () => {
    render(<StatusBadge status="未知状态" />);

    expect(screen.getByText('未知状态')).toHaveClass('text-slate-700');
  });
});

describe('CompactPagination', () => {
  it('moves to the next page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <CompactPagination
        page={1}
        pageSize={10}
        total={30}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: '下一页'}));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables navigation at the first and last pages', () => {
    const {rerender} = render(
      <CompactPagination
        page={1}
        pageSize={10}
        total={30}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', {name: '上一页'})).toBeDisabled();
    expect(screen.getByRole('button', {name: '下一页'})).toBeEnabled();

    rerender(
      <CompactPagination
        page={3}
        pageSize={10}
        total={30}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', {name: '上一页'})).toBeEnabled();
    expect(screen.getByRole('button', {name: '下一页'})).toBeDisabled();
  });

  it('shows the total without invalid navigation for a single page', () => {
    render(
      <CompactPagination
        page={1}
        pageSize={10}
        total={8}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('共 8 条')).toBeVisible();
    expect(screen.queryByRole('button', {name: '上一页'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '下一页'})).not.toBeInTheDocument();
  });

  it('clamps an invalid page before moving forward', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <CompactPagination
        page={-1}
        pageSize={10}
        total={30}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('1 / 3')).toBeVisible();
    await user.click(screen.getByRole('button', {name: '下一页'}));

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(onPageChange).not.toHaveBeenCalledWith(0);
  });

  it('clamps an overflowing page before moving backward', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <CompactPagination
        page={5}
        pageSize={10}
        total={30}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('3 / 3')).toBeVisible();
    await user.click(screen.getByRole('button', {name: '上一页'}));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('normalizes non-finite and fractional page values', () => {
    const {rerender} = render(
      <CompactPagination
        page={Number.NaN}
        pageSize={10}
        total={30}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('1 / 3')).toBeVisible();

    rerender(
      <CompactPagination
        page={2.8}
        pageSize={10}
        total={30}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('2 / 3')).toBeVisible();
  });

  it('normalizes invalid page sizes and totals', () => {
    const {rerender} = render(
      <CompactPagination
        page={1}
        pageSize={0}
        total={3}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('1 / 3')).toBeVisible();

    rerender(
      <CompactPagination
        page={1}
        pageSize={10}
        total={-3}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('共 0 条')).toBeVisible();
    expect(screen.queryByRole('button', {name: '下一页'})).not.toBeInTheDocument();

    rerender(
      <CompactPagination
        page={1}
        pageSize={10}
        total={Number.NaN}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('共 0 条')).toBeVisible();
  });
});

describe('DataTableShell', () => {
  it('renders its table content when no empty state is provided', () => {
    render(
      <DataTableShell
        title="标签列表"
        description="按更新时间排序"
        toolbar={<Button>筛选</Button>}
        footer={<p>最近更新</p>}
      >
        <table aria-label="标签数据" />
      </DataTableShell>,
    );

    expect(screen.getByText('标签列表')).toBeVisible();
    expect(screen.getByText('按更新时间排序')).toBeVisible();
    expect(screen.getByRole('button', {name: '筛选'})).toBeVisible();
    expect(screen.getByRole('table', {name: '标签数据'})).toBeVisible();
    expect(screen.queryByText('暂无标签')).not.toBeInTheDocument();
    expect(screen.getByText('最近更新')).toBeVisible();
    expect(
      screen.getByRole('heading', {name: '标签列表'}).closest('section'),
    ).toHaveAttribute('data-slot', 'data-table-shell');
  });

  it('passes content classes to the table content wrapper', () => {
    render(
      <DataTableShell contentClassName="min-h-0 flex-1">
        <table aria-label="标签数据" />
      </DataTableShell>,
    );

    expect(
      screen
        .getByRole('table', {name: '标签数据'})
        .closest('[data-slot="data-table-content"]'),
    ).toHaveClass('overflow-x-auto', 'min-h-0', 'flex-1');
  });

  it('renders a provided empty state instead of table content', () => {
    render(
      <DataTableShell empty={0}>
        <table aria-label="标签数据" />
      </DataTableShell>,
    );

    expect(screen.getByText('0')).toBeVisible();
    expect(
      screen.queryByRole('table', {name: '标签数据'}),
    ).not.toBeInTheDocument();
  });

  it('renders table content when the empty state is false', () => {
    render(
      <DataTableShell empty={false}>
        <table aria-label="标签数据" />
      </DataTableShell>,
    );

    expect(screen.getByRole('table', {name: '标签数据'})).toBeVisible();
  });
});

describe('ConfirmAction', () => {
  const invalidTriggerMessage =
    'ConfirmAction trigger must be text, a native button, or a shadcn Button without asChild';

  function expectInvalidTrigger(trigger: unknown) {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect(() =>
        render(
          <ConfirmAction
            trigger={trigger as ConfirmActionProps['trigger']}
            title="确认删除标签？"
            description="删除后不可恢复。"
            onConfirm={vi.fn()}
          />,
        ),
      ).toThrow(invalidTriggerMessage);
    } finally {
      consoleError.mockRestore();
    }
  }

  it('opens a confirmation dialog and confirms once', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmAction
        trigger="删除"
        title="确认删除标签？"
        description="删除后不可恢复。"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', {name: '删除'}));

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeVisible();
    expect(screen.getByText('确认删除标签？')).toBeVisible();
    expect(screen.getByText('删除后不可恢复。')).toBeVisible();

    await user.click(screen.getByRole('button', {name: '确认删除'}));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('uses a native button trigger', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmAction
        trigger={<button type="button">删除</button>}
        title="确认删除标签？"
        description="删除后不可恢复。"
        onConfirm={vi.fn()}
      />,
    );

    const trigger = screen.getByRole('button', {name: '删除'});
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('alertdialog')).toBeVisible();
  });

  it('uses an existing Button trigger without nesting buttons', () => {
    render(
      <ConfirmAction
        trigger={<Button>停用</Button>}
        title="确认停用标签？"
        description="停用后可重新启用。"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button', {name: '停用'})).toHaveLength(1);
  });

  it.each([
    ['native button', <button type="submit">删除</button>, '删除'],
    ['shadcn Button', <Button type="submit">停用</Button>, '停用'],
  ])(
    'prevents a %s trigger from submitting its form',
    async (_kind, trigger, name) => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <ConfirmAction
            trigger={trigger}
            title="确认操作？"
            description="操作后不可恢复。"
            onConfirm={vi.fn()}
          />
        </form>,
      );

      await user.click(screen.getByRole('button', {name}));

      expect(screen.getByRole('alertdialog')).toBeVisible();
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it('rejects a custom component trigger', () => {
    function CustomTrigger() {
      return <span>删除</span>;
    }

    expectInvalidTrigger(<CustomTrigger />);
  });

  it('rejects an anchor trigger', () => {
    expectInvalidTrigger(<a href="#x">删除</a>);
  });

  it('rejects a Fragment trigger', () => {
    expectInvalidTrigger(<>删除</>);
  });

  it('rejects a shadcn Button using asChild', () => {
    expectInvalidTrigger(
      <Button asChild>
        <a href="#x">删除</a>
      </Button>,
    );
  });
});
