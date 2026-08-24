import assert from "node:assert/strict";
import { test } from "node:test";
import { ProductDomainRepository } from "./product-domain.js";

test("dashboardSummary reports evaluation time as generatedAt and keeps latest business data separate", async () => {
  const tenantId = "11111111-1111-4111-8111-111111111111";
  const workspaceId = "22222222-2222-4222-8222-222222222222";
  const evaluationTime = new Date("2026-08-25T10:00:00.000Z");
  const latestBusinessData = "2026-08-23 08:00:00+00";
  const queries: string[] = [];
  const database = {
    async withTenantWorkspace(
      tenant: string,
      workspace: string,
      operation: (client: { query: (sql: string, params?: readonly unknown[]) => Promise<{ rows: readonly Record<string, unknown>[] }> }) => Promise<unknown>,
    ) {
      assert.equal(tenant, tenantId);
      assert.equal(workspace, workspaceId);

      return operation({
        async query(sql: string, params?: readonly unknown[]) {
          queries.push(sql);

          if (sql.includes("transaction_timestamp() as generated_at")) {
            assert.equal(params, undefined);
            return { rows: [{ generated_at: evaluationTime }] };
          }

          if (sql.includes("from app.integration_canonical_records")) {
            assert.deepEqual(params, [tenantId, workspaceId]);
            return { rows: [{ latest: latestBusinessData, records: 1, stream: "orders" }] };
          }

          if (sql.includes("from app.product_domain_records")) {
            assert.deepEqual(params, [tenantId, workspaceId]);
            return { rows: [{ domain: "commerce", records: 3 }] };
          }

          throw new Error(`unexpected query: ${sql}`);
        },
      });
    },
  };
  const repository = new ProductDomainRepository(database as any);

  const summary = await repository.dashboardSummary(tenantId, workspaceId);

  assert.equal(summary.generatedAt, "2026-08-25T10:00:00.000Z");
  assert.deepEqual(summary.integrationStreams, [
    { latest: latestBusinessData, records: 1, stream: "orders" },
  ]);
  assert.equal(queries.length, 3);
  assert.ok(queries[0]!.includes("transaction_timestamp() as generated_at"));
  assert.equal(queries[0]!.includes("integration_canonical_records"), false);
  assert.equal(queries[0]!.includes("product_domain_records"), false);
});
