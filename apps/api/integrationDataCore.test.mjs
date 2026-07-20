import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  adsProviderIds,
  createSandboxIntegrationDataRuntime,
  integrationProviderIds,
  requiredSandboxAdapterOperations,
  salesProviderIds,
} from "./src/integrations/integrationDataCore.ts";

const tenantId = "tenant_prompt6";
const workspaceId = "workspace_prompt6";

function connect(runtime, providerId) {
  const { accounts, connection } = runtime.connect({
    providerId,
    tenantId,
    workspaceId,
  });

  assert.equal(connection.status, "account_selection_required");
  assert.ok(accounts.length > 0);

  const selectedConnection = runtime.selectAccount({
    accountId: accounts[0].accountId,
    connectionId: connection.connectionId,
  });

  assert.equal(selectedConnection.status, "active");
  assert.equal(selectedConnection.externalAccountId, accounts[0].accountId);
  return selectedConnection;
}

describe("sandbox integration adapters", () => {
  test("expose the required Prompt 6 lifecycle for every MVP provider", () => {
    const runtime = createSandboxIntegrationDataRuntime();

    for (const providerId of integrationProviderIds) {
      const adapter = runtime.getAdapter(providerId);
      assert.deepEqual(
        [...adapter.supportedOperations].sort(),
        [...requiredSandboxAdapterOperations].sort(),
      );

      const connection = connect(runtime, providerId);
      const backfillJob = runtime.backfill({
        connectionId: connection.connectionId,
        from: "2026-07-01T00:00:00.000Z",
        to: "2026-07-20T00:00:00.000Z",
      });
      assert.equal(backfillJob.status, "succeeded");

      const reauthorizedConnection = runtime.reauthorize(connection.connectionId);
      assert.equal(reauthorizedConnection.status, "active");
      assert.ok(reauthorizedConnection.credentialRef);

      const disconnectedConnection = runtime.disconnect(connection.connectionId);
      assert.equal(disconnectedConnection.status, "disconnected");

      const recoveryJob = runtime.recovery(connection.connectionId);
      assert.equal(recoveryJob.status, "recovered");
    }
  });

  test("keeps commerce sales facts separate from ad cost and attributed conversions", () => {
    const runtime = createSandboxIntegrationDataRuntime();
    runtime.selectPrimaryInventorySource({
      providerId: "woocommerce",
      tenantId,
      workspaceId,
    });

    for (const providerId of integrationProviderIds) {
      const connection = connect(runtime, providerId);
      const job = runtime.initialSync(connection.connectionId);
      assert.equal(job.status, "succeeded");
    }

    const snapshot = runtime.getSnapshot();
    assert.equal(snapshot.canonicalOrders.length, 2);
    assert.equal(snapshot.canonicalAdSpend.length, 2);
    assert.equal(snapshot.canonicalAttributedConversions.length, 2);
    assert.ok(
      snapshot.canonicalOrders.every((order) =>
        salesProviderIds.includes(order.providerId),
      ),
    );
    assert.ok(
      snapshot.canonicalAdSpend.every((spend) =>
        adsProviderIds.includes(spend.providerId),
      ),
    );
    assert.ok(
      snapshot.canonicalAttributedConversions.every((conversion) =>
        adsProviderIds.includes(conversion.providerId),
      ),
    );
    assert.equal(
      snapshot.canonicalOrders.some((order) =>
        adsProviderIds.includes(order.providerId),
      ),
      false,
    );
    assert.equal(
      snapshot.canonicalAttributedConversions.some(
        (conversion) => conversion.attributedValueAmount === "199.00",
      ),
      false,
    );
    assert.equal(snapshot.canonicalInventorySnapshots.length, 1);
    assert.equal(snapshot.canonicalInventorySnapshots[0].providerId, "woocommerce");
  });

  test("updates checkpoints and deduplicates repeated provider source records", () => {
    const runtime = createSandboxIntegrationDataRuntime();
    runtime.selectPrimaryInventorySource({
      providerId: "woocommerce",
      tenantId,
      workspaceId,
    });
    const connection = connect(runtime, "woocommerce");

    const initialJob = runtime.initialSync(connection.connectionId);
    assert.equal(initialJob.status, "succeeded");
    const afterInitial = runtime.getSnapshot();

    const incrementalJob = runtime.incrementalSync(connection.connectionId);
    assert.equal(incrementalJob.status, "succeeded");
    const afterIncremental = runtime.getSnapshot();

    assert.equal(afterIncremental.sourceRecords.length, afterInitial.sourceRecords.length);
    assert.equal(afterIncremental.normalizedRecords.length, afterInitial.normalizedRecords.length);
    assert.equal(afterIncremental.canonicalOrders.length, afterInitial.canonicalOrders.length);
    assert.equal(afterIncremental.canonicalRefunds.length, afterInitial.canonicalRefunds.length);
    assert.deepEqual(
      afterIncremental.syncCheckpoints
        .filter((checkpoint) => checkpoint.providerId === "woocommerce")
        .map((checkpoint) => checkpoint.stream)
        .sort(),
      ["inventory", "orders", "products", "refunds"],
    );
  });

  test("records rate limits and lets retry continue from the same stream set", () => {
    const runtime = createSandboxIntegrationDataRuntime({
      failurePlan: [
        {
          providerId: "google_ads",
          stream: "ad_spend",
          type: "rate_limit",
        },
      ],
    });
    const connection = connect(runtime, "google_ads");

    const blockedJob = runtime.initialSync(connection.connectionId);
    assert.equal(blockedJob.status, "rate_limited");
    assert.equal(blockedJob.retryAfterSeconds, 60);
    assert.equal(
      runtime.getSnapshot().syncCheckpoints.some(
        (checkpoint) =>
          checkpoint.providerId === "google_ads" &&
          checkpoint.stream === "ad_spend",
      ),
      false,
    );

    const retryJob = runtime.retry(blockedJob.jobId);
    assert.equal(retryJob.status, "succeeded");
    assert.equal(retryJob.parentJobId, blockedJob.jobId);
    assert.ok(
      runtime.getSnapshot().syncCheckpoints.some(
        (checkpoint) =>
          checkpoint.providerId === "google_ads" &&
          checkpoint.stream === "ad_spend",
      ),
    );
  });

  test("persists partial success with quality and readiness limitations", () => {
    const runtime = createSandboxIntegrationDataRuntime({
      failurePlan: [
        {
          providerId: "meta_ads",
          stream: "attributed_conversions",
          type: "partial_success",
        },
      ],
    });
    const connection = connect(runtime, "meta_ads");

    const job = runtime.initialSync(connection.connectionId);
    const snapshot = runtime.getSnapshot();

    assert.equal(job.status, "partial_success");
    assert.ok(
      snapshot.dataIssues.some((issue) => issue.code === "PARTIAL_SYNC_FAILURE"),
    );
    assert.equal(snapshot.qualityAssessments.at(-1)?.status, "partial");
    assert.deepEqual(snapshot.readinessAssessments.at(-1)?.limitations, [
      "partial_success",
    ]);
  });

  test("canonicalizes refunds and enforces product mapping approval rules", () => {
    const runtime = createSandboxIntegrationDataRuntime();
    const connection = connect(runtime, "woocommerce");

    const job = runtime.initialSync(connection.connectionId);
    assert.equal(job.status, "succeeded");

    const snapshot = runtime.getSnapshot();
    const [canonicalProduct] = snapshot.canonicalProducts;
    assert.ok(canonicalProduct);
    assert.equal(snapshot.canonicalRefunds.length, 1);
    assert.equal(snapshot.canonicalCustomerReturns.length, 1);

    const skuMapping = runtime.mapProduct({
      catalogId: null,
      ean: null,
      externalProductId: "external-sku-product",
      name: "Different name",
      providerId: "allegro",
      sku: "PAPA-MUG",
      tenantId,
      workspaceId,
    });
    assert.equal(skuMapping.method, "sku");

    const eanMapping = runtime.mapProduct({
      catalogId: null,
      ean: "5900000000011",
      externalProductId: "external-ean-product",
      name: "Different name",
      providerId: "allegro",
      sku: null,
      tenantId,
      workspaceId,
    });
    assert.equal(eanMapping.method, "ean");

    const catalogMapping = runtime.mapProduct({
      catalogId: "catalog-papa-mug",
      ean: null,
      externalProductId: "external-catalog-product",
      name: "Different name",
      providerId: "allegro",
      sku: null,
      tenantId,
      workspaceId,
    });
    assert.equal(catalogMapping.method, "catalog");

    const exactMapping = runtime.mapProduct({
      catalogId: null,
      ean: null,
      externalProductId: "external-exact-product",
      name: "Papa Mug",
      providerId: "allegro",
      sku: null,
      tenantId,
      workspaceId,
    });
    assert.equal(exactMapping.method, "exact_match");

    const fuzzyMapping = runtime.mapProduct({
      catalogId: null,
      ean: null,
      externalProductId: "external-fuzzy-product",
      name: "Papa Mugg",
      providerId: "allegro",
      sku: null,
      tenantId,
      workspaceId,
    });
    assert.equal(fuzzyMapping.method, "fuzzy_manual_review");
    assert.equal(fuzzyMapping.approvedAt, null);
    assert.ok(
      runtime
        .getSnapshot()
        .dataIssues.some(
          (issue) => issue.code === "FUZZY_MATCH_REQUIRES_MANUAL_APPROVAL",
        ),
    );

    const manualMapping = runtime.createManualProductMapping({
      canonicalProductId: canonicalProduct.canonicalProductId,
      externalProductId: "external-manual-product",
      providerId: "allegro",
      tenantId,
      workspaceId,
    });
    assert.equal(manualMapping.method, "manual");
    assert.ok(manualMapping.approvedAt);
  });
});
