import {describe, expect, it} from 'vitest';

import {
  isDataServiceInsertRouteState,
  isTouchpointCreateRouteState,
} from '@/lib/route-state';

describe('route state guards', () => {
  it('requires non-negative integer touchpoint patient counts', () => {
    expect(
      isTouchpointCreateRouteState({
        action: 'create_task',
        snapshotName: '测试快照',
        patientCount: 10,
      }),
    ).toBe(true);
    expect(
      isTouchpointCreateRouteState({
        action: 'create_task',
        snapshotName: '测试快照',
        patientCount: Number.POSITIVE_INFINITY,
      }),
    ).toBe(false);
    expect(
      isTouchpointCreateRouteState({
        action: 'create_task',
        snapshotName: '测试快照',
        patientCount: -1,
      }),
    ).toBe(false);
    expect(
      isTouchpointCreateRouteState({
        action: 'create_task',
        snapshotName: '测试快照',
        patientCount: 1.5,
      }),
    ).toBe(false);
  });

  it('validates every required data service field', () => {
    const validState = {
      action: 'insert_service',
      serviceData: {
        name: '测试服务',
        code: 'TEST-001',
        snapshotId: 'SNP-1',
        snapshotName: '测试快照',
        returnFields: ['patientId', 'hitTags'],
        caller: '测试调用方',
        authMethod: 'API Key',
        status: 'Enabled',
        rateLimit: '100 次/分钟',
      },
    };

    expect(isDataServiceInsertRouteState(validState)).toBe(true);
    expect(
      isDataServiceInsertRouteState({
        ...validState,
        serviceData: {...validState.serviceData, returnFields: [1]},
      }),
    ).toBe(false);
    expect(
      isDataServiceInsertRouteState({
        ...validState,
        serviceData: {...validState.serviceData, status: 'Unknown'},
      }),
    ).toBe(false);
  });
});
