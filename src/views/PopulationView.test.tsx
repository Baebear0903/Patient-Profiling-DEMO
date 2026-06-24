import {readFileSync} from 'node:fs';
import path from 'node:path';

import {screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it} from 'vitest';

import {renderApp} from '@/test/render-app';

const populationSource = readFileSync(
  path.join(process.cwd(), 'src/views/PopulationView.tsx'),
  'utf8',
);

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => undefined;
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => undefined;
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

describe('PopulationView routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('passes a snapshot to touchpoint creation and clears route state', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    await user.click(
      await screen.findByRole('tab', {name: '人群快照管理'}),
    );
    await user.click(screen.getByRole('button', {name: '新建触达'}));

    expect(window.location.hash).toBe('#/touchpoint');

    const dialog = await screen.findByRole('dialog', {
      name: '新建触达运营任务',
    });
    expect(dialog).toBeVisible();
    const snapshotInput = within(dialog).getByLabelText(
      '目标人群快照',
    ) as HTMLInputElement;
    expect(snapshotInput).toHaveValue('高危气虚质复诊提醒快照');
    expect(snapshotInput.value).toEqual(expect.stringContaining('快照'));
    expect(
      within(dialog).getByDisplayValue('高危气虚质复诊提醒快照 触达计划'),
    ).toBeVisible();

    await waitFor(() => {
      expect(window.history.state?.usr ?? null).toBeNull();
    });

    await user.click(within(dialog).getByRole('button', {name: '关闭'}));
    expect(
      screen.queryByRole('dialog', {name: '新建触达运营任务'}),
    ).not.toBeInTheDocument();
  });

  it('passes service data once and clears route state after creation', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    await user.click(
      await screen.findByRole('tab', {name: '人群快照管理'}),
    );
    await user.click(screen.getByRole('button', {name: '数据开放'}));

    const dialog = await screen.findByRole('dialog', {
      name: '新建数据开放服务',
    });
    const serviceName = '高危气虚质复诊提醒快照开放服务';
    expect(within(dialog).getByLabelText('服务名称')).toHaveValue(serviceName);

    await user.click(
      within(dialog).getByRole('button', {name: '确认保存配置'}),
    );

    expect(window.location.hash).toBe('#/dataservice');
    expect(await screen.findByText('数据服务已创建')).toBeVisible();
    expect(screen.getAllByText(serviceName)).toHaveLength(1);

    await waitFor(() => {
      expect(window.history.state?.usr ?? null).toBeNull();
    });
    expect(screen.getAllByText(serviceName)).toHaveLength(1);
  });
});

describe('PopulationView component migration', () => {
  it('shows the complete traceability details inside the patient sheet', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    const detailButtons = await screen.findAllByRole('button', {
      name: '溯源详情',
    });
    const detailTrigger = detailButtons[0];
    await user.click(detailTrigger);

    const sheet = await screen.findByRole('dialog', {name: '患者溯源详情'});
    await waitFor(() => {
      expect(sheet).toContainElement(document.activeElement as HTMLElement);
    });
    expect(sheet).toHaveTextContent('最近就诊时间');
    expect(sheet).toHaveTextContent('命中相关标签 (版本 V2.0)');
    expect(sheet).toHaveTextContent('命中规则明细');
    expect(sheet).toHaveTextContent('最新匹配: 2026-06-14 08:00');
    expect(sheet).toHaveTextContent(
      '引用来源: 治未病中心/门诊病历系统 [DOC_ID: 9940291] / 2026-06-08 09:12:00',
    );
    expect(sheet).toHaveTextContent(
      '"...舌淡白，边有齿痕，脉弱。辩证为气虚质，伴有脾胃虚弱症状..."',
    );
    expect(sheet).toHaveTextContent(
      '引用来源: 中药房/处方系统 [RX_ID: 109238] / 2026-06-08 09:45:00',
    );
    expect(sheet).toHaveTextContent(
      '包含黄芪、党参、白术、炙甘草等健脾益气类药材 (命中量: 4, 阈值: >=3)',
    );

    await user.click(within(sheet).getByRole('button', {name: 'Close'}));
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '患者溯源详情'}),
      ).not.toBeInTheDocument();
      expect(detailTrigger).toHaveFocus();
    });
  });

  it('restores rule empty states after all selected tags are removed', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    await user.click(
      await screen.findByRole('button', {name: '移除气虚质'}),
    );
    await user.click(screen.getByRole('button', {name: '移除脾胃虚弱'}));
    expect(screen.getByText('暂未添加必须命中标签')).toBeVisible();

    await user.click(screen.getByRole('button', {name: '移除寒凉药慎用'}));
    expect(screen.getByText('暂未添加排除标签')).toBeVisible();
  });

  it('opens the snapshot dialog with its patient table', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    const snapshotTrigger = await screen.findByRole('button', {
      name: '生成人群快照',
    });
    await user.click(snapshotTrigger);

    const dialog = await screen.findByRole('dialog', {name: '人群快照确认'});
    const snapshotNameInput = within(dialog).getByLabelText('快照名称');
    await waitFor(() => {
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
      expect(snapshotNameInput).toHaveFocus();
    });
    expect(
      within(dialog).getByRole('table', {name: '快照患者名单'}),
    ).toBeVisible();
    expect(
      within(dialog).getByRole('button', {name: '确认并生成快照'}),
    ).toBeVisible();
    expect(dialog).toHaveClass('h-[90vh]', 'overflow-hidden');
    expect(within(dialog).getByTestId('snapshot-dialog-body')).toHaveClass(
      'min-h-0',
      'overflow-hidden',
    );
    expect(within(dialog).getByTestId('snapshot-dialog-sidebar')).toHaveClass(
      'overflow-auto',
    );
    expect(within(dialog).getByTestId('snapshot-dialog-patients')).toHaveClass(
      'flex',
      'min-h-0',
    );
    expect(
      within(dialog).getByTestId('snapshot-patient-table-scroll'),
    ).toHaveClass('min-h-0', 'flex-1', 'overflow-auto');

    await user.click(within(dialog).getByRole('button', {name: '取消'}));
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '人群快照确认'}),
      ).not.toBeInTheDocument();
      expect(snapshotTrigger).toHaveFocus();
    });
  });

  it('focuses the next patient action after removing a snapshot patient', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    await user.click(
      await screen.findByRole('button', {name: '生成人群快照'}),
    );
    const dialog = await screen.findByRole('dialog', {name: '人群快照确认'});
    const patientActions = within(dialog).getAllByRole('combobox', {
      name: /处理方式$/,
    });
    expect(patientActions.length).toBeGreaterThan(1);
    const nextPatientAction = patientActions[1];

    await user.click(patientActions[0]);
    await user.click(
      await screen.findByRole('option', {name: '移除: 已线下处理'}),
    );

    await waitFor(() => {
      expect(nextPatientAction).toHaveFocus();
    });
  });

  it('focuses the snapshot name after removing the last patient', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    await user.click(
      await screen.findByRole('button', {name: '生成人群快照'}),
    );
    const dialog = await screen.findByRole('dialog', {name: '人群快照确认'});
    const patientActions = within(dialog).getAllByRole('combobox', {
      name: /处理方式$/,
    });
    const snapshotName = within(dialog).getByLabelText('快照名称');

    await user.click(patientActions.at(-1)!);
    await user.click(
      await screen.findByRole('option', {name: '移除: 联系方式无效'}),
    );

    await waitFor(() => {
      expect(snapshotName).toHaveFocus();
    });
  });

  it('focuses the snapshots tab after deleting the final snapshot', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    const snapshotsTab = await screen.findByRole('tab', {
      name: '人群快照管理',
    });
    await user.click(snapshotsTab);
    const table = screen.getByRole('table', {name: '人群快照列表'});
    const deleteButton = within(table).getByRole('button', {name: '删除'});

    await user.click(deleteButton);
    const alertDialog = await screen.findByRole('alertdialog', {
      name: '确认删除操作',
    });
    expect(alertDialog).toBeVisible();
    await waitFor(() => {
      expect(alertDialog).toContainElement(
        document.activeElement as HTMLElement,
      );
    });
    const focusedAlertElement = document.activeElement;
    await user.click(
      within(alertDialog).getByRole('button', {name: '确认删除'}),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('alertdialog', {name: '确认删除操作'}),
      ).not.toBeInTheDocument();
      expect(document.activeElement).not.toBe(focusedAlertElement);
      expect(within(table).queryByRole('button', {name: '删除'})).toBeNull();
      expect(snapshotsTab).toHaveFocus();
    });
  });

  it('focuses the next snapshot delete action after confirmation', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    await user.click(
      await screen.findByRole('button', {name: '生成人群快照'}),
    );
    const snapshotDialog = await screen.findByRole('dialog', {
      name: '人群快照确认',
    });
    await user.click(
      within(snapshotDialog).getByRole('button', {
        name: '确认并生成快照',
      }),
    );

    const table = await screen.findByRole('table', {name: '人群快照列表'});
    const deleteButtons = within(table).getAllByRole('button', {
      name: '删除',
    });
    expect(deleteButtons.length).toBeGreaterThan(1);
    const nextDeleteButton = deleteButtons[1];

    await user.click(deleteButtons[0]);
    const alertDialog = await screen.findByRole('alertdialog', {
      name: '确认删除操作',
    });
    await user.click(
      within(alertDialog).getByRole('button', {name: '确认删除'}),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('alertdialog', {name: '确认删除操作'}),
      ).not.toBeInTheDocument();
      expect(nextDeleteButton).toHaveFocus();
    });
  });

  it('exposes a disabled current page without false navigation controls', () => {
    renderApp('/population');

    const currentPage = screen.getByRole('button', {name: '当前页 1'});
    expect(currentPage).toHaveAttribute('aria-current', 'page');
    expect(currentPage).toBeDisabled();
    expect(
      screen.queryByRole('button', {name: '上一页'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: '下一页'}),
    ).not.toBeInTheDocument();
  });

  it('uses accessible tabs, shadcn tables, dialogs, and form controls', async () => {
    const user = userEvent.setup();
    renderApp('/population');

    expect(
      await screen.findByRole('tab', {name: '患者群体圈选'}),
    ).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('tab', {name: '人群快照管理'}));
    expect(screen.getByRole('table', {name: '人群快照列表'})).toBeVisible();

    await user.click(screen.getByRole('button', {name: '数据开放'}));
    const dialog = await screen.findByRole('dialog', {
      name: '新建数据开放服务',
    });
    expect(within(dialog).getByLabelText('患者唯一标识')).toBeChecked();
    expect(within(dialog).getByRole('switch', {name: '启停状态'})).toBeChecked();
  });

  it('contains no interactive native controls or legacy navigation events', () => {
    expect(populationSource).not.toMatch(
      /<(?:button|input|select|textarea|table)\b/,
    );
    expect(populationSource).not.toMatch(/appNavigate|CustomEvent/);
    expect(populationSource).toContain('<Sheet');
    expect(populationSource).toContain('<Dialog');
    expect(populationSource).toContain('<ConfirmAction');
    expect(populationSource).toContain('<CompactPagination');
  });
});
