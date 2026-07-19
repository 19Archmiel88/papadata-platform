import { describe, expect, it } from 'vitest';

import {
  asCorrelationId,
  asOperationId,
  asTenantId,
  asUserId,
  asWorkspaceId,
  domainContractVersion,
} from '../domain-contracts';
import { createPapaDataApiClient } from '../shared/api';
import {
  createApplicationSessionContext,
  createWorkspaceRuntime,
  foundationCapabilities,
  type WorkspaceScope,
} from './sessionContext';

const northstarMain: WorkspaceScope = {
  tenantId: asTenantId('ten_northstar'),
  workspaceId: asWorkspaceId('wrk_northstar_main'),
};

const northstarLab: WorkspaceScope = {
  tenantId: asTenantId('ten_northstar'),
  workspaceId: asWorkspaceId('wrk_northstar_lab'),
};

const balticMarketplace: WorkspaceScope = {
  tenantId: asTenantId('ten_baltic'),
  workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
};

function createRuntime(scope: WorkspaceScope = northstarMain) {
  const context = createApplicationSessionContext({
    tenantId: scope.tenantId,
    userId: asUserId('usr_multi_workspace'),
    workspaceId: scope.workspaceId,
  });

  return createWorkspaceRuntime({
    actor: {
      actorId: context.user.userId,
      roles: context.memberships.map((membership) => membership.role),
    },
    initialScope: scope,
    now: () => '2026-07-19T00:00:00.000Z',
  });
}

describe('Fala 1 workspace runtime isolation', () => {
  it('odmawia odczytu zasobu z obcego workspace', () => {
    const runtime = createRuntime();
    const decision = runtime.assertWorkspaceResource(northstarLab);

    expect(decision).toMatchObject({
      accepted: false,
      reason: 'foreign_workspace',
    });
  });

  it('odmawia mutacji zasobu z obcego workspace przez klienta API', () => {
    const runtime = createRuntime();
    const client = createPapaDataApiClient({ runtime });
    const result = client.mutateWorkspaceResource(
      {
        resourceId: 'dataset:canonical-orders',
        ...northstarLab,
      },
      foundationCapabilities.integrationSync,
    );

    expect(result.status).toBe('error');
    expect(result.status === 'error' ? result.error.error.code : '').toBe(
      'FOREIGN_WORKSPACE',
    );
  });

  it('blokuje manipulację workspaceId z innego tenanta', () => {
    const runtime = createRuntime();

    expect(() =>
      runtime.switchWorkspace({
        tenantId: northstarMain.tenantId,
        workspaceId: balticMarketplace.workspaceId,
      }),
    ).toThrow('WORKSPACE_TENANT_MISMATCH');
  });

  it('odrzuca późną odpowiedź po zmianie workspace', () => {
    const runtime = createRuntime();
    const token = runtime.beginWorkspaceRequest();

    runtime.switchWorkspace(northstarLab);
    const decision = runtime.completeWorkspaceRequest(token, northstarMain);

    expect(decision).toMatchObject({
      accepted: false,
      reason: 'late_response',
    });
  });

  it('nie przenosi cache ani draftów między workspace', () => {
    const runtime = createRuntime();
    const mainKey = runtime.putCache('command-center', domainContractVersion, {
      value: 'main',
    });
    runtime.putDraft('draft:decision', { value: 'main' });

    runtime.switchWorkspace(northstarLab);
    const labKey = runtime.putCache('command-center', domainContractVersion, {
      value: 'lab',
    });

    expect(labKey).not.toBe(mainKey);
    expect(runtime.getCache('command-center', domainContractVersion)).toEqual({
      value: 'lab',
    });
    expect(runtime.getDraft('draft:decision')).toBeUndefined();
  });

  it('odmawia przyjęcia statusu joba z innego workspace', () => {
    const runtime = createRuntime();
    const decision = runtime.acceptOperationStatus({
      contractVersion: domainContractVersion,
      correlationId: asCorrelationId('cor_foreign_job'),
      limitations: [],
      operationId: asOperationId('op_foreign_job'),
      status: 'succeeded',
      tenantId: northstarLab.tenantId,
      workspaceId: northstarLab.workspaceId,
    });

    expect(decision).toMatchObject({
      accepted: false,
      reason: 'foreign_workspace',
    });
  });

  it('odmawia AI retrieval dla zasobu z obcego tenanta', () => {
    const runtime = createRuntime();
    const decision = runtime.assertAiRetrievalResource(balticMarketplace);

    expect(decision).toMatchObject({
      accepted: false,
      reason: 'foreign_tenant',
    });
    expect(
      runtime
        .getAuditEvents()
        .some((event) => event.eventType === 'ai.retrieval_denied'),
    ).toBe(true);
  });
});
