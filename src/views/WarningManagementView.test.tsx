import {readFileSync} from 'node:fs';
import path from 'node:path';

import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {renderApp} from '@/test/render-app';

const warningManagementSource = readFileSync(
  path.join(process.cwd(), 'src/views/WarningManagementView.tsx'),
  'utf8',
);

function readWarningTagMetrics() {
  const table = screen.getByRole('table', {name: '预警标签列表'});
  const rows = within(table).getAllByRole('row').slice(1);

  return Object.fromEntries(
    rows.map((row) => {
      const cells = within(row).getAllByRole('cell');
      const tagId = cells[0].textContent?.match(/TCM-WARN-\d+/)?.[0];

      expect(tagId).toBeTruthy();

      return [
        tagId!,
        {
          newWarningCount: cells[6].textContent,
          pendingCount: cells[7].textContent,
        },
      ];
    }),
  );
}

describe('WarningManagementView URL state', () => {
  it('restores the records tab and its visible search from the URL', async () => {
    renderApp('/warning?tab=records&q=气虚质');

    expect(
      await screen.findByRole('tab', {name: '预警记录'}),
    ).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('textbox', {name: '搜索预警记录'})).toHaveValue(
      '气虚质',
    );
  });

  it('defaults invalid tabs to warning tags and restores the tag search', async () => {
    const user = userEvent.setup();
    renderApp('/warning?tab=unknown&q=高危&scope=clinic');

    expect(
      await screen.findByRole('tab', {name: '预警标签'}),
    ).toHaveAttribute('data-state', 'active');
    const search = screen.getByRole('textbox', {name: '搜索预警标签'});
    expect(search).toHaveValue('高危');

    await user.type(search, '患者');

    await waitFor(() => {
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      expect(params.get('tab')).toBeNull();
      expect(params.get('q')).toBe('高危患者');
      expect(params.get('scope')).toBe('clinic');
    });
  });

  it('writes tab and search changes with replace while preserving other params', async () => {
    const user = userEvent.setup();
    const replaceState = vi.spyOn(window.history, 'replaceState');
    const pushState = vi.spyOn(window.history, 'pushState');

    try {
      renderApp('/warning?scope=clinic&q=旧值');
      await screen.findByRole('tab', {name: '预警标签'});
      await waitFor(() => {
        expect(
          screen.getByRole('textbox', {name: '搜索预警标签'}),
        ).toHaveValue('旧值');
      });
      replaceState.mockClear();
      pushState.mockClear();

      await user.click(screen.getByRole('tab', {name: '预警记录'}));

      const search = screen.getByRole('textbox', {name: '搜索预警记录'});
      await user.clear(search);
      await user.type(search, '张某某');

      await waitFor(() => {
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        expect(params.get('tab')).toBe('records');
        expect(params.get('q')).toBe('张某某');
        expect(params.get('scope')).toBe('clinic');
      });
      expect(replaceState.mock.calls.length).toBeGreaterThan(0);
      expect(pushState).not.toHaveBeenCalled();
    } finally {
      replaceState.mockRestore();
      pushState.mockRestore();
    }
  });

  it('synchronizes an externally changed hash without stale local search state', async () => {
    const user = userEvent.setup();
    renderApp('/warning?q=体质');

    const tagSearch = await screen.findByRole('textbox', {
      name: '搜索预警标签',
    });
    await user.clear(tagSearch);
    await user.type(tagSearch, '失联');

    window.location.hash =
      '#/warning?tab=records&q=%E5%BC%A0%E6%9F%90%E6%9F%90&scope=clinic';

    await waitFor(() => {
      expect(
        screen.getByRole('tab', {name: '预警记录'}),
      ).toHaveAttribute('data-state', 'active');
      expect(
        screen.getByRole('textbox', {name: '搜索预警记录'}),
      ).toHaveValue('张某某');
    });
    expect(window.location.hash).toContain('scope=clinic');
  });
});

describe('WarningManagementView interactions', () => {
  it('keeps warning tag metrics stable after leaving and returning', async () => {
    const user = userEvent.setup();
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      renderApp('/warning');
      await screen.findByRole('table', {name: '预警标签列表'});
      const initialMetrics = readWarningTagMetrics();

      await user.click(screen.getByRole('link', {name: '工作台'}));
      await screen.findByRole('heading', {name: '运营概览'});

      random.mockReturnValue(0.99);
      await user.click(screen.getByRole('link', {name: '预警管理'}));
      await screen.findByRole('table', {name: '预警标签列表'});

      expect(readWarningTagMetrics()).toEqual(initialMetrics);
    } finally {
      random.mockRestore();
    }
  });

  it('applies the quick status filter to the actual record rows', async () => {
    const user = userEvent.setup();
    renderApp('/warning?tab=records');

    const initialTable = await screen.findByRole('table', {
      name: '预警记录列表',
    });
    const initialRowCount =
      within(initialTable).getAllByRole('row').length - 1;
    expect(initialRowCount).toBeGreaterThan(1);

    await user.click(screen.getByRole('button', {name: /处理中/}));

    await waitFor(() => {
      const currentTable = screen.getByRole('table', {
        name: '预警记录列表',
      });
      const currentRows = within(currentTable).getAllByRole('row').slice(1);
      expect(currentRows.length).toBeGreaterThan(0);
      expect(currentRows.length).toBeLessThan(initialRowCount);
      expect(within(currentTable).queryByText('待处理')).not.toBeInTheDocument();
      expect(within(currentTable).queryByText('已处理')).not.toBeInTheDocument();
      for (const row of currentRows) {
        expect(within(row).getByText('处理中')).toBeVisible();
      }
    });
  });

  it('keeps quick filters visible at zero results and restores matching records', async () => {
    const user = userEvent.setup();
    renderApp('/warning?tab=records&q=张某某');

    expect(await screen.findByText('张某某')).toBeVisible();
    await user.click(screen.getByRole('button', {name: /处理中/}));

    await waitFor(() => {
      expect(screen.getByText('没有找到匹配的记录')).toBeVisible();
      expect(screen.queryByText('张某某')).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: /全部/})).toBeVisible();
      expect(screen.getByRole('button', {name: /待处理/})).toBeVisible();
      expect(screen.getByRole('button', {name: /处理中/})).toBeVisible();
    });

    await user.click(screen.getByRole('button', {name: /全部/}));

    await waitFor(() => {
      expect(screen.getByText('张某某')).toBeVisible();
      expect(
        screen.queryByText('没有找到匹配的记录'),
      ).not.toBeInTheDocument();
    });
  });

  it('opens record details in a sheet and restores focus after Escape', async () => {
    const user = userEvent.setup();
    renderApp('/warning?tab=records');

    const detailTrigger = (await screen.findAllByRole('button', {
      name: '详情',
    }))[0];
    await user.click(detailTrigger);

    const sheet = await screen.findByRole('dialog', {
      name: '预警记录详情',
    });
    await waitFor(() => {
      expect(sheet).toContainElement(document.activeElement as HTMLElement);
    });
    expect(sheet).toHaveTextContent('患者身份');
    expect(sheet).toHaveTextContent('预警信息');
    expect(sheet).toHaveTextContent('命中规则');
    expect(sheet).toHaveTextContent('当前状态及责任人');
    expect(sheet).toHaveTextContent('系统推荐处置');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '预警记录详情'}),
      ).not.toBeInTheDocument();
      expect(detailTrigger).toHaveFocus();
    });
  });

  it('closes record details with the visible close action and restores focus', async () => {
    const user = userEvent.setup();
    renderApp('/warning?tab=records');

    const detailTrigger = (await screen.findAllByRole('button', {
      name: '详情',
    }))[0];
    await user.click(detailTrigger);
    const sheet = await screen.findByRole('dialog', {
      name: '预警记录详情',
    });

    await user.click(within(sheet).getByRole('button', {name: '关闭'}));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '预警记录详情'}),
      ).not.toBeInTheDocument();
      expect(detailTrigger).toHaveFocus();
    });
  });

  it('focuses record search when URL filtering removes the detail trigger', async () => {
    const user = userEvent.setup();
    renderApp('/warning?tab=records');

    const detailTrigger = (await screen.findAllByRole('button', {
      name: '详情',
    }))[0];
    await user.click(detailTrigger);
    const sheet = await screen.findByRole('dialog', {
      name: '预警记录详情',
    });

    window.location.hash =
      '#/warning?tab=records&q=%E7%8E%8B%E6%9F%90%E6%9F%90';
    await waitFor(() => {
      expect(detailTrigger.isConnected).toBe(false);
    });

    await user.click(within(sheet).getByRole('button', {name: '关闭'}));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '预警记录详情'}),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('textbox', {name: '搜索预警记录'}),
      ).toHaveFocus();
    });
  });

  it('keeps the tags route active when closing after records unmount', async () => {
    const user = userEvent.setup();
    renderApp('/warning?tab=records');

    const tagsTab = await screen.findByRole('tab', {name: '预警标签'});
    const detailTrigger = (await screen.findAllByRole('button', {
      name: '详情',
    }))[0];
    await user.click(detailTrigger);
    const sheet = await screen.findByRole('dialog', {
      name: '预警记录详情',
    });

    window.location.hash = '#/warning';
    await waitFor(() => {
      expect(tagsTab).toHaveAttribute('data-state', 'active');
      expect(detailTrigger.isConnected).toBe(false);
    });

    await user.click(within(sheet).getByRole('button', {name: '关闭'}));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '预警记录详情'}),
      ).not.toBeInTheDocument();
      expect(window.location.hash).toBe('#/warning');
      expect(screen.getByRole('tab', {name: '预警标签'})).toHaveFocus();
    });
  });

  it('navigates from a warning tag to the matching tag query', async () => {
    const user = userEvent.setup();
    renderApp('/warning');

    const table = await screen.findByRole('table', {name: '预警标签列表'});
    const firstDataRow = within(table).getAllByRole('row')[1];
    const tagName = within(firstDataRow)
      .getByRole('cell', {name: /TCM-WARN-/})
      .querySelector('div')?.textContent;
    expect(tagName).toBeTruthy();

    await user.click(within(firstDataRow).getByRole('button', {name: '规则'}));

    await waitFor(() => {
      expect(window.location.hash).toBe(
        `#/tags?q=${encodeURIComponent(tagName!)}`,
      );
    });
    expect(
      await screen.findByRole('textbox', {name: '搜索标签名称或编码'}),
    ).toHaveValue(tagName);
  });
});

describe('WarningManagementView component migration', () => {
  it('renders both datasets with accessible shadcn table semantics', async () => {
    const user = userEvent.setup();
    renderApp('/warning');

    const tagTable = await screen.findByRole('table', {
      name: '预警标签列表',
    });
    expect(
      within(tagTable).getByRole('columnheader', {name: '标签名称/编码'}),
    ).toBeVisible();
    expect(tagTable.closest('[data-slot="table-container"]')).not.toBeNull();

    await user.click(screen.getByRole('tab', {name: '预警记录'}));
    const recordTable = screen.getByRole('table', {name: '预警记录列表'});
    expect(
      within(recordTable).getByRole('columnheader', {name: '患者信息'}),
    ).toBeVisible();
    expect(recordTable.closest('[data-slot="table-container"]')).not.toBeNull();
  });

  it('keeps the main tables and detail body independently scrollable', async () => {
    const user = userEvent.setup();
    renderApp('/warning');

    const tagTable = await screen.findByRole('table', {
      name: '预警标签列表',
    });
    const tagScrollRegion = tagTable.closest(
      '[data-slot="table-container"]',
    )?.parentElement;
    expect(tagScrollRegion).toHaveClass(
      'min-h-0',
      'flex-1',
      '[&_[data-slot=table-container]]:h-full',
      '[&_[data-slot=table-container]]:overflow-auto',
    );
    expect(
      within(tagTable).getByRole('columnheader', {
        name: '标签名称/编码',
      }).parentElement?.parentElement,
    ).toHaveClass('sticky', 'top-0');

    await user.click(screen.getByRole('tab', {name: '预警记录'}));
    const recordTable = screen.getByRole('table', {name: '预警记录列表'});
    const recordScrollRegion = recordTable.closest(
      '[data-slot="table-container"]',
    )?.parentElement;
    expect(recordScrollRegion).toHaveClass(
      'flex',
      'min-h-0',
      'flex-1',
      'flex-col',
      'overflow-hidden',
      '[&_[data-slot=table-container]]:min-h-0',
      '[&_[data-slot=table-container]]:flex-1',
      '[&_[data-slot=table-container]]:overflow-auto',
    );

    await user.click(
      within(recordTable).getAllByRole('button', {name: '详情'})[0],
    );
    expect(screen.getByTestId('warning-sheet-scroll')).toHaveClass(
      'min-h-0',
      'flex-1',
      'overflow-y-auto',
    );
  });

  it('contains no native interactive controls or legacy navigation events', () => {
    expect(warningManagementSource).not.toMatch(
      /<(?:button|input|select|textarea|table)\b/,
    );
    expect(warningManagementSource).not.toMatch(/appNavigate|CustomEvent/);
    expect(warningManagementSource).not.toContain('Math.random');
    expect(warningManagementSource).toContain('<Tabs');
    expect(warningManagementSource).toContain('<DataTableShell');
    expect(warningManagementSource).toContain('<Sheet');
    expect(warningManagementSource).toContain('<StatusBadge');
  });
});
