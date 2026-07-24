import assert from "node:assert/strict";
import test from "node:test";
import type { ProductionDatabase, IntegrationRepository } from "@papadata/database";
import type { CredentialProvider, CredentialResolutionInput } from "@papadata/integrations";
import type { IdempotencyKey } from "@papadata/contracts";
import { IntegrationService } from "./integration.service.js";
import type {
  IntegrationQueuePayload,
  IntegrationQueueService,
} from "../queue/queue.service.js";

test("API startSync resolves connection-scoped credentials without queueing secret material", async () => {
  const queuePayloads: IntegrationQueuePayload[] = [];
  const credentialCalls: CredentialResolutionInput[] = [];
  const service = createTestService({
    repository: {
      async findConnection(tenantId: string, workspaceId: string, connectionId: string) {
        assert.equal(tenantId, "tenant-a");
        assert.equal(workspaceId, "workspace-a");
        assert.equal(connectionId, "connection-a");
        return {
          provider_id: "baselinker",
          credential_ref: "credential-ref-a",
        };
      },
      async createJob(input: Record<string, unknown>) {
        assert.doesNotMatch(JSON.stringify(input), /tenant-a-secret/);
        return { id: "job-a", ...input };
      },
    },
    queue: {
      async enqueue(payload: IntegrationQueuePayload) {
        queuePayloads.push(payload);
      },
    },
    credentialProvider: {
      async resolve(input: CredentialResolutionInput) {
        credentialCalls.push(input);
        return {
          providerId: "baselinker",
          credentialReference: input.credentialReference,
          secretResource: "projects/p/secrets/baselinker-a",
          version: "1",
          material: { token: "tenant-a-secret" },
        };
      },
    },
  });

  await service.startSync({
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    connectionId: "connection-a",
    providerId: "baselinker",
    operation: "incremental_sync",
    request: {
      streams: ["orders"],
      idempotencyKey: "idem-a" as IdempotencyKey,
    },
  });

  assert.deepEqual(credentialCalls, [
    {
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      connectionId: "connection-a",
      credentialReference: "credential-ref-a",
      provider: "baselinker",
    },
  ]);
  assert.equal(queuePayloads.length, 1);
  assert.doesNotMatch(JSON.stringify(queuePayloads[0]), /tenant-a-secret|credential-ref-a/);
});

test("API startSync blocks provider mismatch before resolving credentials or queueing job", async () => {
  const queuePayloads: IntegrationQueuePayload[] = [];
  const credentialCalls: CredentialResolutionInput[] = [];
  const service = createTestService({
    repository: {
      async findConnection() {
        return {
          provider_id: "shopify",
          credential_ref: "credential-ref-a",
        };
      },
      async createJob() {
        throw new Error("createJob should not be called");
      },
    },
    queue: {
      async enqueue(payload: IntegrationQueuePayload) {
        queuePayloads.push(payload);
      },
    },
    credentialProvider: {
      async resolve(input: CredentialResolutionInput) {
        credentialCalls.push(input);
        throw new Error("resolve should not be called");
      },
    },
  });

  await assert.rejects(
    () => service.startSync({
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      connectionId: "connection-a",
      providerId: "baselinker",
      operation: "incremental_sync",
      request: {
        streams: ["orders"],
        idempotencyKey: "idem-a" as IdempotencyKey,
      },
    }),
    /Integration connection scope mismatch/,
  );

  assert.equal(credentialCalls.length, 0);
  assert.equal(queuePayloads.length, 0);
});

function createTestService(input: {
  readonly repository: Partial<IntegrationRepository>;
  readonly queue: Partial<IntegrationQueueService>;
  readonly credentialProvider: CredentialProvider;
}): IntegrationService {
  const service = new IntegrationService(
    {} as ProductionDatabase,
    input.queue as IntegrationQueueService,
    input.credentialProvider,
  );
  (service as unknown as { repository: IntegrationRepository }).repository =
    input.repository as IntegrationRepository;
  return service;
}
