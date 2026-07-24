import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const productionSource = readFileSync(
  new URL("./production.ts", import.meta.url),
  "utf8",
);

test("A04 SQL repository uses sync_job_id instead of legacy id for sync job updates", () => {
  assert.doesNotMatch(productionSource, /where\s+id\s*=\s*\$1/iu);
  assert.match(productionSource, /sync_job_id\s*=\s*\$3/iu);
  assert.match(productionSource, /finalizeSucceeded/iu);
});

test("A04 SQL repository requires reconciliation before succeeded finalization", () => {
  assert.match(
    productionSource,
    /exists\s*\(\s*select\s+1\s+from\s+app\.integration_reconciliation_runs/isu,
  );
  assert.match(productionSource, /status\s*=\s*'passed'/iu);
});
