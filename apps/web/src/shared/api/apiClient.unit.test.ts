import { describe, expect, it } from 'vitest';

import { asTenantId, asWorkspaceId, domainContractVersion } from '../../domain-contracts';
import { createWorkspaceRuntime, type WorkspaceScope } from '../../shell';
import { createPapaDataApiClient, redactTelemetryPayload } from './apiClient';

const scope: WorkspaceScope = {
  tenantId: asTenantId('ten_northstar'),
  workspaceId: asWorkspaceId('wrk_northstar_main'),
};

describe('PapaData API client foundation', () => {
  it('dodaje correlationId, contract version i aktywny workspace do headers', () => {
    const runtime = createWorkspaceRuntime({ initialScope: scope });
    const client = createPapaDataApiClient({ runtime });
    const headers = client.createHeaders();

    expect(headers['x-contract-version']).toBe(domainContractVersion);
    expect(headers['x-tenant-id']).toBe(scope.tenantId);
    expect(headers['x-workspace-id']).toBe(scope.workspaceId);
    expect(headers['x-correlation-id']).toBeTruthy();
  });

  it('redaguje sekrety przed raportowaniem błędu', () => {
    const redacted = redactTelemetryPayload({
      nested: {
        mfaCode: '123456',
      },
      password: 'secret',
      providerToken: 'token',
      visible: 'workspace',
    });

    expect(redacted).toEqual({
      nested: {
        mfaCode: '[REDACTED]',
      },
      password: '[REDACTED]',
      providerToken: '[REDACTED]',
      visible: 'workspace',
    });
  });
});
