import {readFileSync} from 'node:fs';
import path from 'node:path';

import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';

import {renderApp} from '@/test/render-app';

const analysisSource = readFileSync(
  path.join(process.cwd(), 'src/views/AnalysisView.tsx'),
  'utf8',
);

beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    hasPointerCapture: {
      configurable: true,
      value: vi.fn(() => false),
    },
    releasePointerCapture: {
      configurable: true,
      value: vi.fn(),
    },
    setPointerCapture: {
      configurable: true,
      value: vi.fn(),
    },
    scrollIntoView: {
      configurable: true,
      value: vi.fn(),
    },
  });
});

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    bottom: 300,
    height: 300,
    left: 0,
    right: 800,
    toJSON: () => ({}),
    top: 0,
    width: 800,
    x: 0,
    y: 0,
  });

  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(
        private readonly callback: ResizeObserverCallback,
      ) {}

      observe(target: Element) {
        this.callback(
          [
            {
              borderBoxSize: [],
              contentBoxSize: [],
              contentRect: target.getBoundingClientRect(),
              devicePixelContentBoxSize: [],
              target,
            },
          ],
          this as unknown as ResizeObserver,
        );
      }

      unobserve() {}
      disconnect() {}
    },
  );
});

describe('AnalysisView', () => {
  it('switches analysis modules with shadcn tabs', async () => {
    const user = userEvent.setup();
    renderApp('/analysis');

    await user.click(
      screen.getByRole('tab', {name: '重点病种干预转化效果分析'}),
    );

    expect(
      screen.getByRole('heading', {name: '重点病种干预转化效果分析'}),
    ).toBeVisible();
  });

  it('changes the visible trend metric with a select', async () => {
    const user = userEvent.setup();
    renderApp('/analysis');

    await user.click(
      screen.getByRole('tab', {name: '重点病种干预转化效果分析'}),
    );
    await user.click(screen.getByRole('combobox', {name: '趋势指标'}));
    await user.click(screen.getByRole('option', {name: '改善率'}));

    expect(screen.getByRole('combobox', {name: '趋势指标'})).toHaveTextContent(
      '改善率',
    );
  });

  it('uses semantic tables for ranking and transition data', async () => {
    const user = userEvent.setup();
    renderApp('/analysis');

    expect(
      screen.getByRole('table', {name: '科室分布排名'}),
    ).toBeVisible();
    expect(
      screen.getByRole('table', {name: '病种分布排名'}),
    ).toBeVisible();
    expect(screen.getByRole('table', {name: '体质转归矩阵'})).toBeVisible();

    await user.click(
      screen.getByRole('tab', {name: '重点病种干预转化效果分析'}),
    );
    expect(
      screen.queryByRole('table', {name: '体质转归矩阵'}),
    ).not.toBeInTheDocument();
  });

  it('contains only shadcn interactive controls and sized chart containers', () => {
    expect(analysisSource).not.toMatch(
      /<(?:button|select|table)\b/,
    );
    expect(analysisSource).toContain('<Tabs');
    expect(analysisSource).toContain('<Select');
    expect(analysisSource).toContain('<Table');
    expect(analysisSource).toContain('<CompactPagination');

    const responsiveContainers =
      analysisSource.match(/<ResponsiveContainer\b/g) ?? [];
    const sizedParents =
      analysisSource.match(
        /className="[^"]*min-h-(?:0|\[260px\])[^"]*min-w-0[^"]*"[\s\S]{0,80}<ResponsiveContainer\b/g,
      ) ?? [];

    expect(responsiveContainers).toHaveLength(9);
    expect(sizedParents).toHaveLength(responsiveContainers.length);
  });

  it('renders charts without invalid container size warnings', () => {
    const warn = vi.spyOn(console, 'warn');

    renderApp('/analysis');

    const chartWarnings = warn.mock.calls.filter(([message]) =>
      String(message).includes('of chart should be greater than 0'),
    );
    expect(chartWarnings).toHaveLength(0);
  });
});
