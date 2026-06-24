import {readFileSync} from 'node:fs';
import path from 'node:path';

import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {renderApp} from '@/test/render-app';

const workbenchSource = readFileSync(
  path.join(process.cwd(), 'src/views/WorkbenchView.tsx'),
  'utf8',
);

describe('WorkbenchView', () => {
  it('navigates to tag creation from the new tag button', async () => {
    const user = userEvent.setup();
    renderApp('/workbench');

    await user.click(screen.getByRole('button', {name: '新建标签'}));

    expect(
      await screen.findByRole('heading', {name: '新增业务标签'}),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(window.location.hash).toBe('#/tags?mode=create'),
    );
  });

  it('keeps the constitution education placeholder inert', async () => {
    const user = userEvent.setup();
    const {container} = renderApp('/workbench');
    const initialHash = window.location.hash;

    await user.click(screen.getByRole('button', {name: '发起体质宣教'}));

    expect(window.location.hash).toBe(initialHash);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('[data-sonner-toast]')).toBeNull();
  });

  it('uses accessible workbench controls and table semantics', () => {
    renderApp('/workbench');

    expect(screen.getByRole('button', {name: '新建标签'})).toBeVisible();
    expect(screen.getByRole('table')).toBeVisible();
  });

  it('keeps task name cells as table cells with an inner flex layout', () => {
    renderApp('/workbench');

    const taskCell = screen.getByRole('cell', {name: '气虚质扫描'});
    const taskCellClasses = taskCell.className.split(/\s+/);
    const taskContent = taskCell.querySelector('div');

    expect(taskCellClasses).not.toContain('flex');
    expect(taskContent).toHaveClass('flex', 'items-center', 'gap-1.5');
  });

  it('uses the shadcn table container for sticky table scrolling', () => {
    renderApp('/workbench');

    const tableContainer = screen
      .getByRole('table')
      .closest('[data-slot="table-container"]');
    const scrollRegion = tableContainer?.parentElement;

    expect(scrollRegion).toHaveClass(
      'min-h-0',
      'flex-1',
      '[&_[data-slot=table-container]]:h-full',
      '[&_[data-slot=table-container]]:overflow-auto',
    );
    expect(scrollRegion).not.toHaveClass('overflow-y-auto');
  });

  it('gives the responsive chart a non-zero initial size', () => {
    expect(workbenchSource).toContain(
      'className="min-h-0 min-w-0 flex-1 h-full"',
    );
    expect(workbenchSource).toContain(
      'initialDimension={{width: 480, height: 220}}',
    );
  });
});
