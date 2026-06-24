import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {renderApp} from '@/test/render-app';

describe('App routing', () => {
  it('enables the React Router v7 transition flags', () => {
    const warn = vi.spyOn(console, 'warn');

    renderApp('/workbench');

    expect(
      warn.mock.calls.some(([message]) =>
        String(message).includes('React Router Future Flag Warning'),
      ),
    ).toBe(false);
  });

  it('redirects unknown routes to the workbench', async () => {
    renderApp('/missing');

    expect(
      await screen.findByRole('heading', {name: '运营概览'}),
    ).toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe('#/workbench'));
  });

  it('exposes the sidebar menu as the main navigation', () => {
    renderApp('/workbench');

    expect(
      screen.getByRole('navigation', {name: '主导航'}),
    ).toBeVisible();
  });

  it('navigates to the tag center and marks its link as current', async () => {
    const user = userEvent.setup();
    renderApp('/workbench');

    const tagCenterLink = screen.getByRole('link', {name: '标签中心'});
    await user.click(tagCenterLink);

    expect(
      await screen.findByRole('heading', {name: '标签清单'}),
    ).toBeInTheDocument();
    expect(tagCenterLink).toHaveAttribute('aria-current', 'page');
  });

  it('keeps sidebar collapse state out of cookies', async () => {
    const user = userEvent.setup();
    document.cookie = 'sidebar_state=; path=/; max-age=0';
    const {container} = renderApp('/workbench');
    const sidebar = container.querySelector('[data-slot="sidebar"]');

    expect(sidebar).toHaveAttribute('data-state', 'expanded');

    await user.click(
      screen.getByRole('button', {name: '折叠侧边栏'}),
    );

    await waitFor(() =>
      expect(sidebar).toHaveAttribute('data-state', 'collapsed'),
    );
    expect(document.cookie).not.toContain('sidebar_state');
  });

});
