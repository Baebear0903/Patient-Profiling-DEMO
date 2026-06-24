import {act, fireEvent, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {renderApp} from '@/test/render-app';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

Object.defineProperties(Element.prototype, {
  hasPointerCapture: {
    configurable: true,
    value: () => false,
  },
  setPointerCapture: {
    configurable: true,
    value: () => undefined,
  },
  releasePointerCapture: {
    configurable: true,
    value: () => undefined,
  },
  scrollIntoView: {
    configurable: true,
    value: () => undefined,
  },
});

async function chooseCategory(category: string) {
  const trigger = screen.getByRole('combobox', {name: '所属分类'});
  await act(async () => {
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
  });
  const listbox = await screen.findByRole('listbox');
  const option = within(listbox).getByRole('option', {name: category});
  await act(async () => {
    fireEvent.keyDown(option, {key: 'Enter'});
  });
  await waitFor(() => {
    expect(trigger).toHaveTextContent(category);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
}

describe('TagManagementView', () => {
  it('opens the empty tag editor from mode=create', async () => {
    renderApp('/tags?mode=create');

    expect(
      await screen.findByRole('heading', {name: '新增业务标签'}),
    ).toBeInTheDocument();
  });

  it('resets an existing editor when mode=create is added externally', async () => {
    const user = userEvent.setup();
    renderApp('/tags?q=气虚质');

    const row = (await screen.findByText('气虚质')).closest('tr');
    expect(row).not.toBeNull();
    await user.click(within(row!).getByRole('button', {name: '编辑'}));
    expect(screen.getByRole('textbox', {name: '标签名称'})).toHaveValue(
      '气虚质',
    );

    window.location.hash = '#/tags?mode=create';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(
      await screen.findByRole('heading', {name: '新增业务标签'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: '标签名称'})).toHaveValue('');
    expect(screen.getByRole('combobox', {name: '所属分类'})).toHaveTextContent(
      '请选择所属目录',
    );
    expect(
      screen.getByRole('textbox', {name: '适用场景 / 业务用途'}),
    ).toHaveValue('');
  });

  it('shows field errors and an error toast when publishing an empty tag', async () => {
    const user = userEvent.setup();
    renderApp('/tags?mode=create');

    await user.click(
      await screen.findByRole('button', {name: '保存并发布'}),
    );

    expect(screen.getByText('请输入标签名称')).toBeVisible();
    expect(screen.getByText('请选择所属分类')).toBeVisible();
    expect(screen.getByText('请输入适用场景/业务用途')).toBeVisible();
    expect(
      await screen.findByText('请完善必填信息后再提交'),
    ).toBeVisible();
  });

  it('publishes a valid new tag and returns to the list', async () => {
    const user = userEvent.setup();
    renderApp('/tags?mode=create');

    await user.type(
      await screen.findByRole('textbox', {name: '标签名称'}),
      '脾虚湿困重点人群',
    );
    await chooseCategory('九种体质倾向类');
    await user.type(
      screen.getByRole('textbox', {name: '适用场景 / 业务用途'}),
      '随访管理',
    );
    await user.click(screen.getByRole('button', {name: '保存并发布'}));

    expect(
      await screen.findByRole('heading', {name: '标签清单'}),
    ).toBeInTheDocument();
    const newTagRow = screen
      .getByText('脾虚湿困重点人群')
      .closest('tr');
    expect(newTagRow).not.toBeNull();
    expect(within(newTagRow!).getByText('已发布')).toBeVisible();
    expect(await screen.findByText('标签已发布')).toBeVisible();
  });

  it('clears list filters after publishing a new tag from a filtered route', async () => {
    const user = userEvent.setup();
    renderApp('/tags?q=气虚质');

    await user.click(
      await screen.findByRole('button', {name: '九种体质倾向类'}),
    );
    await user.click(screen.getByRole('button', {name: '新增标签'}));
    await user.type(
      await screen.findByRole('textbox', {name: '标签名称'}),
      '脾虚湿困新建人群',
    );
    await chooseCategory('九种体质倾向类');
    await user.type(
      screen.getByRole('textbox', {name: '适用场景 / 业务用途'}),
      '随访管理',
    );
    await user.click(screen.getByRole('button', {name: '保存并发布'}));

    await waitFor(() => expect(window.location.hash).toBe('#/tags'));
    expect(
      screen.getByRole('textbox', {name: '搜索标签名称或编码'}),
    ).toHaveValue('');
    expect(screen.getByRole('button', {name: '全部'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('脾虚湿困新建人群')).toBeVisible();
    expect(screen.getByText('1 / 4')).toBeVisible();
  });

  it('hydrates q into the search and writes changes back with replace', async () => {
    const user = userEvent.setup();
    renderApp('/tags?q=气虚质');

    const search = await screen.findByRole('textbox', {
      name: '搜索标签名称或编码',
    });
    expect(search).toHaveValue('气虚质');
    expect(screen.getByRole('button', {name: '全部'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('共 1 条')).toBeVisible();
    expect(screen.getByText('气虚质')).toBeVisible();

    await user.clear(search);
    await user.type(search, '阳虚质');

    await waitFor(() =>
      expect(window.location.hash).toBe('#/tags?q=%E9%98%B3%E8%99%9A%E8%B4%A8'),
    );
  });

  it('synchronizes an externally changed q and resets category and page', async () => {
    const user = userEvent.setup();
    renderApp('/tags?q=气虚质');

    const search = await screen.findByRole('textbox', {
      name: '搜索标签名称或编码',
    });
    await user.clear(search);
    await user.click(screen.getByRole('button', {name: '九种体质倾向类'}));
    await user.click(screen.getByRole('button', {name: '下一页'}));
    expect(screen.getByText('2 / 2')).toBeVisible();

    window.location.hash = '#/tags?q=阳虚质';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    await waitFor(() => expect(search).toHaveValue('阳虚质'));
    expect(screen.getByRole('button', {name: '全部'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('共 1 条')).toBeVisible();
    expect(screen.queryByText('2 / 2')).not.toBeInTheDocument();
    expect(screen.getByText('阳虚质')).toBeVisible();
    expect(screen.queryByText('气虚质')).not.toBeInTheDocument();
  });

  it('renders the tag list inside the shared data table shell', () => {
    renderApp('/tags');

    const shell = screen
      .getByRole('heading', {name: '标签清单'})
      .closest('section');
    const tableContainer = screen
      .getByRole('table')
      .closest('[data-slot="table-container"]');

    expect(shell).toHaveAttribute('data-slot', 'data-table-shell');
    expect(tableContainer?.parentElement).toHaveClass(
      'h-full',
      'min-h-0',
      'flex-1',
      '[&_[data-slot=table-container]]:h-full',
      '[&_[data-slot=table-container]]:overflow-auto',
    );
  });

  it('does not expose the list heading while the editor is open', async () => {
    renderApp('/tags?mode=create');

    expect(
      await screen.findByRole('heading', {name: '新增业务标签'}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {name: '标签清单'}),
    ).not.toBeInTheDocument();
  });

  it('confirms deletion of a draft tag and shows a toast', async () => {
    const user = userEvent.setup();
    renderApp('/tags?q=心脾两虚');

    const draftTag = await screen.findByText('心脾两虚');
    const row = draftTag.closest('tr');
    expect(row).not.toBeNull();
    await user.click(within(row!).getByRole('button', {name: '删除'}));

    const dialog = await screen.findByRole('alertdialog', {name: '删除标签'});
    await user.click(within(dialog).getByRole('button', {name: '彻底删除'}));

    expect(screen.queryByText('心脾两虚')).not.toBeInTheDocument();
    expect(await screen.findByText('标签已删除')).toBeVisible();
  });

  it('confirms stopping a published tag before changing its status', async () => {
    const user = userEvent.setup();
    renderApp('/tags?q=气虚质');

    const row = (await screen.findByText('气虚质')).closest('tr');
    expect(row).not.toBeNull();
    await user.click(within(row!).getByRole('button', {name: '停用'}));

    const dialog = await screen.findByRole('alertdialog', {name: '停用标签'});
    await user.click(within(dialog).getByRole('button', {name: '确认停用'}));

    expect(within(row!).getByText('已停用')).toBeVisible();
    expect(await screen.findByText('标签已停用')).toBeVisible();
  });

  it('opens the tag preview in an accessible sheet', async () => {
    const user = userEvent.setup();
    renderApp('/tags?q=气虚质');

    const row = (await screen.findByText('气虚质')).closest('tr');
    expect(row).not.toBeNull();
    await user.click(within(row!).getByRole('button', {name: '预览'}));

    expect(
      await screen.findByRole('dialog', {name: '预览命中结果'}),
    ).toBeVisible();
  });
});
