import assert from "node:assert/strict";
import test from "node:test";
import { CrossProviderDeduplicationService } from "./deduplication.ts";

test("matches the same order across providers", () => {
  const service = new CrossProviderDeduplicationService();
  const base = {
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    orderNumber: "A-100",
    emailHash: "hash",
    grossAmountMinor: 10000n,
    currency: "PLN",
    occurredAt: "2026-07-21T10:00:00.000Z",
  };
  const result = service.compare(
    { ...base, providerId: "allegro", externalId: "1" },
    { ...base, providerId: "baselinker", externalId: "2" },
  );
  assert.equal(result?.state, "automatic_match");
});
