export type TouchpointCreateRouteState = {
  action: 'create_task';
  snapshotName: string;
  patientCount: number;
};

export type DataServiceRouteData = {
  name: string;
  code: string;
  snapshotId: string;
  snapshotName: string;
  returnFields: string[];
  caller: string;
  authMethod: string;
  status: 'Enabled' | 'Disabled';
  rateLimit: string;
};

export type DataServiceInsertRouteState = {
  action: 'insert_service';
  serviceData: DataServiceRouteData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasStringFields(
  value: Record<string, unknown>,
  fields: readonly string[],
) {
  return fields.every((field) => typeof value[field] === 'string');
}

export function isTouchpointCreateRouteState(
  value: unknown,
): value is TouchpointCreateRouteState {
  return (
    isRecord(value) &&
    value.action === 'create_task' &&
    typeof value.snapshotName === 'string' &&
    typeof value.patientCount === 'number' &&
    Number.isFinite(value.patientCount) &&
    Number.isInteger(value.patientCount) &&
    value.patientCount >= 0
  );
}

export function isDataServiceInsertRouteState(
  value: unknown,
): value is DataServiceInsertRouteState {
  if (
    !isRecord(value) ||
    value.action !== 'insert_service' ||
    !isRecord(value.serviceData)
  ) {
    return false;
  }

  const serviceData = value.serviceData;
  return (
    hasStringFields(serviceData, [
      'name',
      'code',
      'snapshotId',
      'snapshotName',
      'caller',
      'authMethod',
      'rateLimit',
    ]) &&
    Array.isArray(serviceData.returnFields) &&
    serviceData.returnFields.every((field) => typeof field === 'string') &&
    (serviceData.status === 'Enabled' || serviceData.status === 'Disabled')
  );
}
