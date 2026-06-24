import {StrictMode} from 'react';
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {TooltipProvider} from '@/components/ui/tooltip';
import {DataServiceView} from '@/views/DataServiceView';
import {TouchpointView} from '@/views/TouchpointView';

const toastSuccess = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

beforeEach(() => {
  toastSuccess.mockClear();
});

function RouteStateProbe() {
  const location = useLocation();
  return (
    <output data-testid="route-state">
      {location.state === null ? 'null' : 'present'}
    </output>
  );
}

function renderRoute(
  path: '/touchpoint' | '/dataservice',
  state?: unknown,
) {
  const view =
    path === '/touchpoint' ? <TouchpointView /> : <DataServiceView />;

  return render(
    <StrictMode>
      <MemoryRouter
        initialEntries={[{pathname: path, state}]}
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <TooltipProvider delayDuration={250}>
          <Routes>
            <Route
              path={path}
              element={
                <>
                  {view}
                  <RouteStateProbe />
                </>
              }
            />
          </Routes>
        </TooltipProvider>
      </MemoryRouter>
    </StrictMode>,
  );
}

describe('Touchpoint route state and dialog accessibility', () => {
  it('opens once in StrictMode, focuses the task name, and clears state', async () => {
    const user = userEvent.setup();
    renderRoute('/touchpoint', {
      action: 'create_task',
      snapshotName: '严格模式测试快照',
      patientCount: 12,
    });

    const dialog = await screen.findByRole('dialog', {
      name: '新建触达运营任务',
    });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(within(dialog).getByLabelText('任务名称')).toHaveFocus();
    expect(within(dialog).getByLabelText('目标人群快照')).toHaveValue(
      '严格模式测试快照',
    );
    await waitFor(() => {
      expect(screen.getByTestId('route-state')).toHaveTextContent('null');
    });

    await user.click(within(dialog).getByRole('button', {name: '取消'}));
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '新建触达运营任务'}),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: '创建触达任务'}),
      ).toHaveFocus();
    });
  });

  it('supports keyboard radio selection, Escape, and trigger focus restoration', async () => {
    const user = userEvent.setup();
    renderRoute('/touchpoint');

    const trigger = screen.getByRole('button', {name: '创建触达任务'});
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: '新建触达运营任务',
    });
    expect(within(dialog).getByLabelText('任务名称')).toHaveFocus();

    const radioGroup = within(dialog).getByRole('radiogroup', {
      name: '触达渠道',
    });
    const sms = within(radioGroup).getByRole('radio', {name: '短信'});
    const weChat = within(radioGroup).getByRole('radio', {
      name: '微信服务号',
    });
    expect(sms).toBeChecked();
    sms.focus();
    fireEvent.keyDown(sms, {key: 'ArrowRight'});
    await waitFor(() => {
      expect(weChat).toBeChecked();
    });
    fireEvent.keyUp(weChat, {key: 'ArrowRight'});

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {name: '新建触达运营任务'}),
      ).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });

  it('rejects malformed route state and clears it without opening', async () => {
    renderRoute('/touchpoint', {
      action: 'create_task',
      snapshotName: '坏数据',
      patientCount: Number.NaN,
    });

    await waitFor(() => {
      expect(screen.getByTestId('route-state')).toHaveTextContent('null');
    });
    expect(
      screen.queryByRole('dialog', {name: '新建触达运营任务'}),
    ).not.toBeInTheDocument();
  });
});

describe('DataService route state validation', () => {
  it('inserts a valid service only once in StrictMode and clears state', async () => {
    renderRoute('/dataservice', {
      action: 'insert_service',
      serviceData: {
        name: '严格模式数据服务',
        code: 'STRICT-001',
        snapshotId: 'SNP-STRICT',
        snapshotName: '严格模式快照',
        returnFields: ['patientId'],
        caller: '测试调用方',
        authMethod: 'API Key',
        status: 'Enabled',
        rateLimit: '100 次/分钟',
      },
    });

    expect(await screen.findAllByText('严格模式数据服务')).toHaveLength(1);
    await waitFor(() => {
      expect(screen.getByTestId('route-state')).toHaveTextContent('null');
      expect(toastSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('rejects malformed service data and clears state without crashing', async () => {
    renderRoute('/dataservice', {
      action: 'insert_service',
      serviceData: {
        name: null,
        returnFields: 'patientId',
        status: 'Unknown',
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('route-state')).toHaveTextContent('null');
    });
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
