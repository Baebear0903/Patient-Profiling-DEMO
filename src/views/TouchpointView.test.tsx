import {readFileSync} from 'node:fs';
import path from 'node:path';

import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';

import {renderApp} from '@/test/render-app';

const touchpointSource = readFileSync(
  path.join(process.cwd(), 'src/views/TouchpointView.tsx'),
  'utf8',
);

describe('TouchpointView', () => {
  it('creates a task with the selected channel', async () => {
    const user = userEvent.setup();
    renderApp('/touchpoint');

    await user.click(
      await screen.findByRole('button', {name: '创建触达任务'}),
    );

    const dialog = await screen.findByRole('dialog', {
      name: '新建触达运营任务',
    });
    await user.type(within(dialog).getByLabelText('任务名称'), '气虚质复诊提醒');
    await user.clear(within(dialog).getByLabelText('目标人群快照'));
    await user.type(
      within(dialog).getByLabelText('目标人群快照'),
      '气虚质快照',
    );
    await user.click(
      within(dialog).getByRole('radio', {name: '微信服务号'}),
    );
    await user.click(
      within(dialog).getByRole('button', {name: '确认创建'}),
    );

    expect(
      screen.queryByRole('dialog', {name: '新建触达运营任务'}),
    ).not.toBeInTheDocument();
    const table = await screen.findByRole('table', {name: '触达任务列表'});
    const row = within(table)
      .getByText('气虚质复诊提醒', {exact: true})
      .closest('tr');
    expect(row).not.toBeNull();
    expect(within(row!).getByText('气虚质快照')).toBeVisible();
    expect(within(row!).getByText('微信服务号')).toBeVisible();
    expect(within(row!).getByText('待发布')).toBeVisible();
    expect(await screen.findByText('任务创建成功')).toBeVisible();
  });

  it('filters task rows by task or snapshot name', async () => {
    const user = userEvent.setup();
    renderApp('/touchpoint');

    const table = await screen.findByRole('table', {name: '触达任务列表'});
    expect(within(table).getByText('高危气虚质复诊提醒')).toBeVisible();
    expect(within(table).getByText('三伏贴适用人群夏季推文')).toBeVisible();

    await user.type(
      screen.getByRole('textbox', {name: '搜索触达任务'}),
      '阳虚质',
    );

    await waitFor(() => {
      expect(
        within(table).queryByText('高危气虚质复诊提醒'),
      ).not.toBeInTheDocument();
      expect(within(table).getByText('三伏贴适用人群夏季推文')).toBeVisible();
    });
  });

  it('keeps placeholder task actions inert', async () => {
    const user = userEvent.setup();
    renderApp('/touchpoint');

    const initialHash = window.location.hash;
    const initialRows = (
      await screen.findByRole('table', {name: '触达任务列表'})
    ).querySelectorAll('tbody tr').length;

    await user.click(screen.getByRole('button', {name: '筛选任务'}));
    await user.click(screen.getAllByRole('button', {name: '概览'})[0]);

    expect(window.location.hash).toBe(initialHash);
    expect(
      screen.getByRole('table', {name: '触达任务列表'}).querySelectorAll(
        'tbody tr',
      ),
    ).toHaveLength(initialRows);
    expect(screen.queryByText('任务创建成功')).not.toBeInTheDocument();
  });

  it('uses shadcn controls and restores focus after closing the dialog', async () => {
    const user = userEvent.setup();
    renderApp('/touchpoint');

    const trigger = await screen.findByRole('button', {
      name: '创建触达任务',
    });
    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', {
      name: '新建触达运营任务',
    });
    expect(within(dialog).getByLabelText('任务名称')).toHaveFocus();
    expect(
      within(dialog).getByRole('radiogroup', {name: '触达渠道'}),
    ).toBeVisible();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '新建触达运营任务'}),
      ).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    expect(
      await screen.findByRole('table', {name: '触达任务列表'}),
    ).toBeVisible();
  });

  it('contains no native interactive controls in the view source', () => {
    expect(touchpointSource).not.toMatch(
      /<(?:button|input|select|textarea|table)\b/,
    );
    expect(touchpointSource).toContain('<PageHeader');
    expect(touchpointSource).toContain('<DataTableShell');
    expect(touchpointSource).toContain('<Table');
    expect(touchpointSource).toContain('<StatusBadge');
    expect(touchpointSource).toContain('<Dialog');
    expect(touchpointSource).toContain('<RadioGroup');
  });
});
