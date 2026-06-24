import {readFileSync} from 'node:fs';
import path from 'node:path';

import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';

import {renderApp} from '@/test/render-app';

const dataServiceSource = readFileSync(
  path.join(process.cwd(), 'src/views/DataServiceView.tsx'),
  'utf8',
);

describe('DataServiceView', () => {
  it('creates a service with selected fields', async () => {
    const user = userEvent.setup();
    renderApp('/dataservice');

    await user.click(
      await screen.findByRole('button', {name: '创建服务'}),
    );
    const dialog = await screen.findByRole('dialog', {
      name: '新建数据开放服务',
    });
    await user.type(within(dialog).getByLabelText('服务名称'), '体质随访名单服务');
    await user.click(within(dialog).getByRole('combobox', {name: '调用方'}));
    await user.click(screen.getByRole('option', {name: '中医智能宣教及专病随访系统'}));
    await user.click(
      within(dialog).getByRole('checkbox', {name: '患者唯一标识'}),
    );
    await user.click(
      within(dialog).getByRole('button', {name: '保存配置'}),
    );

    expect(
      screen.queryByRole('dialog', {name: '新建数据开放服务'}),
    ).not.toBeInTheDocument();
    expect(await screen.findByText('体质随访名单服务')).toBeVisible();
    expect(await screen.findByText('服务已创建')).toBeVisible();
  });

  it('requires confirmation before deleting a disabled service', async () => {
    const user = userEvent.setup();
    renderApp('/dataservice');

    const table = await screen.findByRole('table', {name: '数据服务列表'});
    const row = within(table)
      .getByText('气虚质患者重点关注名单服务')
      .closest('tr');
    expect(row).not.toBeNull();

    const statusSwitch = within(row!).getByRole('switch', {
      name: '气虚质患者重点关注名单服务启停状态',
    });
    await user.click(statusSwitch);
    const statusDialog = await screen.findByRole('alertdialog', {
      name: '确认停用服务',
    });
    expect(within(row!).getByText('已启用')).toBeVisible();
    await user.click(
      within(statusDialog).getByRole('button', {name: '确认'}),
    );
    await waitFor(() => {
      expect(within(row!).getByText('已停用')).toBeVisible();
      expect(statusSwitch).toHaveFocus();
    });

    await user.click(
      within(row!).getByRole('button', {name: '删除服务'}),
    );
    const alertDialog = await screen.findByRole('alertdialog', {
      name: '确认删除操作',
    });
    expect(alertDialog).toBeVisible();
    expect(
      within(alertDialog).getByText(/气虚质患者重点关注名单服务/),
    ).toBeVisible();
    expect(row).toBeInTheDocument();

    await user.click(
      within(alertDialog).getByRole('button', {name: '确认删除'}),
    );
    await waitFor(() => {
      expect(row).not.toBeInTheDocument();
      expect(
        screen.getByRole('tab', {name: '服务管理列表'}),
      ).toHaveFocus();
    });
  });

  it('restores records tab and search from the URL and writes changes back', async () => {
    const user = userEvent.setup();
    renderApp('/dataservice?tab=records&q=未知调用方');

    expect(
      await screen.findByRole('tab', {name: 'API调用记录'}),
    ).toHaveAttribute('data-state', 'active');
    const search = screen.getByRole('textbox', {name: '搜索调用记录'});
    expect(search).toHaveValue('未知调用方');
    expect(screen.getByText('API Key 无效')).toBeVisible();

    await user.clear(search);
    await user.type(search, '门诊电子病历系统');

    await waitFor(() => {
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      expect(params.get('tab')).toBe('records');
      expect(params.get('q')).toBe('门诊电子病历系统');
    });
  });

  it('opens credentials in a dialog and keeps placeholder controls inert', async () => {
    const user = userEvent.setup();
    renderApp('/dataservice');

    const table = await screen.findByRole('table', {name: '数据服务列表'});
    const row = within(table)
      .getByText('气虚质患者重点关注名单服务')
      .closest('tr');
    expect(row).not.toBeNull();
    const credentialsTrigger = within(row!).getByRole('button', {
      name: '查看调用凭证',
    });
    await user.click(credentialsTrigger);

    const dialog = await screen.findByRole('dialog', {
      name: '调用凭证信息',
    });
    expect(within(dialog).getByLabelText('API Base URL')).toHaveValue(
      'https://api.internal-hospital.com/v1/data',
    );
    expect(within(dialog).getByLabelText('API Key')).toHaveAttribute(
      'type',
      'password',
    );

    const initialHash = window.location.hash;
    await user.click(within(dialog).getByRole('button', {name: '复制 API Base URL'}));
    expect(window.location.hash).toBe(initialHash);
    expect(screen.queryByText('复制成功')).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '调用凭证信息'}),
      ).not.toBeInTheDocument();
      expect(credentialsTrigger).toHaveFocus();
    });
  });

  it('navigates from a service to its filtered call records', async () => {
    const user = userEvent.setup();
    renderApp('/dataservice');

    const table = await screen.findByRole('table', {name: '数据服务列表'});
    const row = within(table)
      .getByText('气虚质患者重点关注名单服务')
      .closest('tr');
    expect(row).not.toBeNull();
    await user.click(
      within(row!).getByRole('button', {name: '查看调用记录'}),
    );

    expect(
      screen.getByRole('tab', {name: 'API调用记录'}),
    ).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('textbox', {name: '搜索调用记录'})).toHaveValue(
      '气虚质患者重点关注名单服务',
    );
    expect(window.location.hash).toContain('tab=records');
    expect(window.location.hash).toContain('q=');
  });

  it('contains no native interactive controls or legacy modal markup', () => {
    expect(dataServiceSource).not.toMatch(
      /<(?:button|input|select|textarea|table)\b/,
    );
    expect(dataServiceSource).toContain('<Tabs');
    expect(dataServiceSource).toContain('<DataTableShell');
    expect(dataServiceSource).toContain('<Dialog');
    expect(dataServiceSource).toContain('<ConfirmAction');
    expect(dataServiceSource).toContain('<Checkbox');
    expect(dataServiceSource).toContain('<Switch');
    expect(dataServiceSource).toContain('<Select');
    expect(dataServiceSource).toContain('<StatusBadge');
  });
});
