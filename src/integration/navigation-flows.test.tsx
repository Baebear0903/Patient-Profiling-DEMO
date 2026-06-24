import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';

import {renderApp} from '@/test/render-app';

describe('top-level navigation flows', () => {
  it.each([
    ['工作台', '运营概览'],
    ['标签中心', '标签清单'],
    ['人群运营', '动态结果清单'],
    ['预警管理', '预警管理'],
    ['触达运营', '触达运营中心'],
    ['数据服务', '数据开放服务'],
    ['主题分析', '中医体质分布与演变分析'],
  ])('opens %s', async (linkName, headingName) => {
    const user = userEvent.setup();
    renderApp('/workbench');

    await user.click(screen.getByRole('link', {name: linkName}));

    expect(
      await screen.findByRole('heading', {name: headingName}),
    ).toBeVisible();
  });
});
