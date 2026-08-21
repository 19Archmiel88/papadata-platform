// Real end-to-end WooCommerce reconciliation proof for a specific,
// established calendar day (see .claude/CLAUDE.md, "P0 -- reconciliation"
// and "WooCommerce"). Runs the real DurableIngestionPipeline against a real
// Postgres and a real, self-hosted WooCommerce sandbox
// (compose.woocommerce-sandbox.yml) -- for four *separate* stream jobs
// (orders, products, refunds, inventory -- inventory requested literally as
// its own stream, not piggy-backed on `products`), each bounded to the same
// day window as the WooCommerce-side comparison, then reads the result back
// through the real production `IntegrationRepository.listCanonicalRecords`
// query (the same method `command-center-metrics.real-source.ts` uses to
// build Command Center's metric engine input) and compares it against the
// same store's REST API read independently for that day. Writes a
// persistent JSON report to .runtime/reports/ instead of being a throwaway
// script.
//
// Reconciliation tolerance policy (formal, not ad-hoc): counts and money
// sums are compared as EXACT integer minor units (grosze), zero tolerance.
// This is not a business allowance for missing transactions -- it's simply
// correct, because summing exact 2-decimal currency literals in integer
// cents never introduces rounding ambiguity (unlike floating-point decimal
// arithmetic, which is why this script never compares `Number` money values
// directly). A non-zero tolerance would only be defensible for *derived*
// values that involve division (e.g. AOV, ROAS) at the metric engine's own
// declared decimal precision -- this script does not reconcile those.
//
// Requires: compose.production-parity.yml up (for Postgres) and
// compose.woocommerce-sandbox.yml up (for the real provider). Run with:
//   WOOCOMMERCE_SANDBOX_CONSUMER_KEY=... WOOCOMMERCE_SANDBOX_CONSUMER_SECRET=... \
//     pnpm --filter @papadata/worker exec tsx scripts/woocommerce-reconciliation.ts
// Optionally pin the day explicitly instead of auto-detecting it from the
// store's most recent order:
//   WOOCOMMERCE_RECONCILIATION_DAY=2026-08-20 ... tsx scripts/woocommerce-reconciliation.ts
//
// Orders/revenue are attributed to the reconciliation day by the order's OWN
// creation date. Refunds are attributed by the REFUND's own date instead.
// WooCommerce >= 9.0 exposes /wc/v3/refunds independently of parent orders,
// so refund discovery no longer depends on an arbitrary order-history floor.
// The runtime adapter uses that endpoint with full pagination and retains a
// complete paginated order-history fallback for older WooCommerce versions.
// When the pinned/auto-detected day is real "today", the script also seeds
// one real previous-day order + current-day refund pair proving that case.
process.env.NODE_ENV = "test";
// The sandbox terminates TLS with a throwaway self-signed certificate (see
// .runtime/woo-sandbox-tls) not part of any trusted CA bundle. This process
// only ever talks to that one local sandbox.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";
import { join } from "node:path";
import {
  DurableIntegrationIngestionRepository,
  IdentityRepository,
  IntegrationCredentialRepository,
  IntegrationRepository,
  ProductionDatabase,
} from "@papadata/database";
import {
  ScopedCredentialProvider,
  InMemoryCredentialSecretStore,
  createProviderAdapter,
} from "@papadata/integrations";
import { DurableIngestionPipeline } from "../src/production/ingestion-pipeline.js";

const repoRoot = new URL("../../../", import.meta.url).pathname;
const databaseUrl = readDatabaseUrl();
const wooSandboxUrl = process.env.WOOCOMMERCE_SANDBOX_URL?.trim() || "https://127.0.0.1:8543";
const consumerKey = requireEnv("WOOCOMMERCE_SANDBOX_CONSUMER_KEY");
const consumerSecret = requireEnv("WOOCOMMERCE_SANDBOX_CONSUMER_SECRET");
const failures: string[] = [];
const checks: Record<string, unknown>[] = [];
const runId = randomUUID().slice(0, 8);

const database = new ProductionDatabase({
  connectionString: databaseUrl,
  max: 8,
  statementTimeoutMs: 30_000,
});

const report: Record<string, unknown> = {
  generatedAt: new Date().toISOString(),
  provider: "woocommerce",
  sandboxUrl: wooSandboxUrl,
  runId,
  tolerancePolicy: "exact integer minor-unit (grosze) equality for counts and money sums; zero tolerance, see script header",
};

try {
  const { reconciliationDay, dayStart, dayEnd } = await resolveReconciliationDay();
  report.reconciliationDay = reconciliationDay;
  report.dayStart = dayStart;
  report.dayEnd = dayEnd;

  report.multiDayScenario = seedMultiDayRefundScenario(dayStart, dayEnd);

  const { tenantId, workspaceId, connectionId } = await setUp();
  report.tenantId = tenantId;
  report.workspaceId = workspaceId;
  report.connectionId = connectionId;

  const jobRuns: Record<string, unknown>[] = [];
  for (const stream of ["orders", "products", "refunds", "inventory"] as const) {
    jobRuns.push(await runStreamJob({ tenantId, workspaceId, connectionId, stream, dayStart, dayEnd }));
  }
  report.jobRuns = jobRuns;

  const canonical = await readCanonicalRecordsForDay(tenantId, workspaceId, dayStart, dayEnd);
  const source = await readSourceOfTruthForDay(dayStart, dayEnd);
  report.canonical = canonical;
  report.source = source;

  compareCents("orders_count_completed", canonical.ordersCountCompletedCents, source.ordersCountCompletedCents, "count");
  compareCents("gross_revenue_completed_cents", canonical.grossRevenueCompletedCents, source.grossRevenueCompletedCents, "money");
  compareCents(
    "revenue_qualifying_refund_amount_cents",
    canonical.refundAmountQualifyingCents,
    source.refundAmountQualifyingCents,
    "money",
  );
  compareCents("refund_amount_all_cents", canonical.refundAmountAllCents, source.refundAmountAllCents, "money");

  const multiDayScenario = report.multiDayScenario as { seeded: boolean; amountCents?: string };
  if (multiDayScenario.seeded && multiDayScenario.amountCents) {
    // Regression proof for the day-boundary fix above: this refund's order
    // was created on the PREVIOUS calendar day (see
    // seedMultiDayRefundScenario), so if refund candidate discovery were
    // still bounded to [dayStart, dayEnd) on the order's own date, this
    // refund would be silently absent from one or both sides and the
    // general compareCents checks above would either mismatch or falsely
    // agree on an undercount. Asserting it is actually present in both
    // totals makes that failure mode explicit instead of relying on nobody
    // noticing a too-small number.
    const seededCents = BigInt(multiDayScenario.amountCents);
    checks.push({
      name: "multi_day_refund_present_in_both_totals",
      kind: "money",
      seededAmountCents: multiDayScenario.amountCents,
      canonicalRefundAmountAllCents: canonical.refundAmountAllCents.toString(),
      sourceRefundAmountAllCents: source.refundAmountAllCents.toString(),
      matched: canonical.refundAmountAllCents >= seededCents && source.refundAmountAllCents >= seededCents,
    });
    if (canonical.refundAmountAllCents < seededCents || source.refundAmountAllCents < seededCents) {
      failures.push(
        `multi_day_refund_present_in_both_totals: seeded a ${multiDayScenario.amountCents}-cent refund against an `
        + `order from the previous calendar day, but refund_amount_all_cents is canonical=${canonical.refundAmountAllCents} `
        + `source=${source.refundAmountAllCents} -- the refund is missing from at least one side, meaning refund `
        + "day-boundary discovery regressed.",
      );
    }
  }

  for (const product of source.products) {
    const match = canonical.inventoryByExternalId[product.id];
    compareCents(
      `inventory_quantity_product_${product.id}`,
      match === undefined ? null : BigInt(match),
      BigInt(product.stockQuantity),
      "count",
    );
  }
} finally {
  await database.close();
}

report.checks = checks;
report.result = failures.length === 0 ? "matched" : "mismatch";
report.failures = failures;

const reportDir = join(repoRoot, ".runtime", "reports", "production-parity-audit-20260821");
mkdirSync(reportDir, { recursive: true });
const reportPath = join(reportDir, "woocommerce-reconciliation.json");
writeFileSync(reportPath, `${JSON.stringify(report, bigintReplacer, 2)}\n`, "utf8");

console.log(JSON.stringify(report, bigintReplacer, 2));
console.log(`\nReport written to ${reportPath}`);
if (failures.length > 0) process.exitCode = 1;

async function resolveReconciliationDay(): Promise<{ reconciliationDay: string; dayStart: string; dayEnd: string }> {
  const explicit = process.env.WOOCOMMERCE_RECONCILIATION_DAY?.trim();
  let reconciliationDay = explicit;

  if (!reconciliationDay) {
    // Auto-detect: the calendar day (UTC) of the store's most recently
    // created order. This keeps the script runnable without hardcoding a
    // date that will eventually go stale, while still reconciling one
    // explicit, established day rather than "everything ever in the store".
    const recent = await wooFetch<{ date_created_gmt?: string; date_created?: string }[]>(
      "/wp-json/wc/v3/orders?per_page=1&orderby=date&order=desc&status=any",
    );
    const latest = recent[0];
    const dateField = latest?.date_created_gmt ?? latest?.date_created;
    if (!dateField) {
      throw new Error(
        "Could not auto-detect a reconciliation day: the WooCommerce sandbox has no orders. " +
          "Set WOOCOMMERCE_RECONCILIATION_DAY=YYYY-MM-DD explicitly, or seed the sandbox first.",
      );
    }
    reconciliationDay = dateField.slice(0, 10);
  }

  const dayStart = `${reconciliationDay}T00:00:00.000Z`;
  const dayEndMs = Date.parse(dayStart) + 24 * 60 * 60 * 1000;
  const dayEnd = new Date(dayEndMs).toISOString();
  return { reconciliationDay, dayStart, dayEnd };
}

// Regression proof for day-bounded refunds: create a REAL WooCommerce order
// on the previous UTC calendar day and a real refund now. No same-day control
// order/product is seeded anymore. That is intentional: on a quiet day the
// orders/products/inventory jobs may legitimately fetch zero rows, and the
// durable pipeline must prove that 0=0=0=0 is a successful reconciliation.
function seedMultiDayRefundScenario(
  dayStart: string,
  dayEnd: string,
): {
  seeded: boolean;
  reason?: string;
  orderId?: string;
  refundId?: string;
  amountCents?: string;
  orderDateCreated?: string;
  refundDateCreated?: string;
} {
  const nowMs = Date.now();
  if (nowMs < Date.parse(dayStart) || nowMs >= Date.parse(dayEnd)) {
    return {
      seeded: false,
      reason:
        "reconciliationDay is not real 'today' -- a WooCommerce refund's date_created cannot be backdated, "
        + "so this scenario only proves anything when run against the current day "
        + "(pass WOOCOMMERCE_RECONCILIATION_DAY=<today's date> to force it).",
    };
  }

  const amount = "50.00";
  const previousDay = new Date(Date.parse(dayStart) - 12 * 60 * 60 * 1000).toISOString().slice(0, 19);
  const feeLabel = `Reconciliation multi-day regression scenario ${runId}`;
  const refundReason = `Multi-day reconciliation regression test ${runId}`;
  const php = `
$order = wc_create_order();
$item = new WC_Order_Item_Fee();
$item->set_name(${phpString(feeLabel)});
$item->set_amount(${amount});
$item->set_total(${amount});
$item->set_tax_status("none");
$order->add_item($item);
$order->calculate_totals();
$order->set_status("completed");
$order->set_date_created(new WC_DateTime(${phpString(previousDay)}, new DateTimeZone("UTC")));
$order->save();
$refund = wc_create_refund([
  "order_id" => $order->get_id(),
  "amount" => ${amount},
  "reason" => ${phpString(refundReason)},
]);
if (is_wp_error($refund)) {
  echo "SEED_ERROR=" . $refund->get_error_message() . "\\n";
} else {
  echo "SEED_ORDER_ID=" . $order->get_id() . "\\n";
  echo "SEED_ORDER_DATE_CREATED=" . $order->get_date_created()->date("c") . "\\n";
  echo "SEED_REFUND_ID=" . $refund->get_id() . "\\n";
  echo "SEED_REFUND_DATE_CREATED=" . $refund->get_date_created()->date("c") . "\\n";
}
`;

  const output = wpCliEval(php);
  const error = /^SEED_ERROR=(.*)$/m.exec(output);
  if (error) {
    failures.push(`seedMultiDayRefundScenario: wc_create_refund failed: ${error[1]}`);
    return { seeded: false, reason: error[1] };
  }

  const orderId = /^SEED_ORDER_ID=(.*)$/m.exec(output)?.[1];
  const refundId = /^SEED_REFUND_ID=(.*)$/m.exec(output)?.[1];
  const orderDateCreated = /^SEED_ORDER_DATE_CREATED=(.*)$/m.exec(output)?.[1];
  const refundDateCreated = /^SEED_REFUND_DATE_CREATED=(.*)$/m.exec(output)?.[1];
  if (!orderId || !refundId) {
    failures.push(`seedMultiDayRefundScenario: could not parse wp-cli output: ${output}`);
    return { seeded: false, reason: "unparseable wp-cli output" };
  }

  return {
    seeded: true,
    orderId,
    refundId,
    amountCents: decimalToCents(amount).toString(),
    orderDateCreated,
    refundDateCreated,
  };
}

function wpCliEval(php: string): string {
  const wpcliScript = join(repoRoot, ".runtime", "wpcli.sh");
  return execFileSync("bash", [wpcliScript, "eval", php], { encoding: "utf8" });
}

function phpString(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

async function setUp(): Promise<{ tenantId: string; workspaceId: string; connectionId: string }> {
  const identity = new IdentityRepository(database);
  const integrations = new IntegrationRepository(database);

  const { membership } = await identity.register({
    email: `woo-reconciliation-${runId}@papadata.test`,
    passwordHash: "not-used-by-this-test",
    displayName: "WooCommerce Reconciliation",
    tenantName: `Woo Reconciliation ${runId}`,
    workspaceName: "Primary",
    capabilities: [],
  });
  const tenantId = membership.tenantId;
  const workspaceId = membership.workspaceId;

  const credentialReference = `woo-reconciliation-cred-${runId}`;
  const connection = await integrations.createConnection({
    tenantId,
    workspaceId,
    providerId: "woocommerce",
    credentialReference,
    requestedScopes: ["read"],
    idempotencyKey: `woo-reconciliation-connection-${runId}`,
  });
  const connectionId = String(connection.id);

  await database.withTenantWorkspace(tenantId, workspaceId, async (client) => {
    await client.query(
      `insert into app.integration_credentials (
         tenant_id, workspace_id, connection_id, provider_id,
         secret_reference, credential_reference, secret_resource, active_version,
         rotation_state, required_scopes, granted_scopes, status, issued_at
       ) values (
         $1, $2, $3, 'woocommerce',
         $4, $4, $4, 'v1',
         'active', '["read"]'::jsonb, '["read"]'::jsonb, 'active', now()
       )`,
      [tenantId, workspaceId, connectionId, credentialReference],
    );
  });

  report.credentialReference = credentialReference;
  return { tenantId, workspaceId, connectionId };
}

async function runStreamJob(input: {
  tenantId: string;
  workspaceId: string;
  connectionId: string;
  stream: "orders" | "products" | "refunds" | "inventory";
  dayStart: string;
  dayEnd: string;
}): Promise<Record<string, unknown>> {
  const integrations = new IntegrationRepository(database);
  const credentials = new IntegrationCredentialRepository(database);
  const ingestion = new DurableIntegrationIngestionRepository(database);

  const secretStore = new InMemoryCredentialSecretStore();
  const credentialReference = String(report.credentialReference);
  secretStore.setSecret(
    {
      providerId: "woocommerce",
      credentialReference,
      secretResource: credentialReference,
      version: "v1",
    },
    JSON.stringify({ storeUrl: wooSandboxUrl, consumerKey, consumerSecret }),
  );
  const credentialProvider = new ScopedCredentialProvider({ metadataReader: credentials, secretStore });
  const adapterFactory = async () => {
    const resolved = await credentialProvider.resolve({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      connectionId: input.connectionId,
      credentialReference,
      provider: "woocommerce",
    });
    const adapter = createProviderAdapter(resolved);
    await adapter.verifyConnection();
    return adapter;
  };

  // Every stream is bounded to the same reconciliation day. For refunds this
  // now works correctly because the WooCommerce adapter discovers refunds
  // through /wc/v3/refunds by the refund's own creation time, rather than by
  // first restricting parent orders to the same day.
  const discoveryFrom = input.dayStart;

  const pipeline = new DurableIngestionPipeline({ repository: ingestion });
  const job = await integrations.createJob({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    connectionId: input.connectionId,
    providerId: "woocommerce",
    operation: "backfill",
    streams: [input.stream],
    from: discoveryFrom,
    to: input.dayEnd,
    idempotencyKey: `woo-reconciliation-job-${input.stream}-${runId}`,
  });

  const run = await pipeline.run({
    payload: {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      jobId: String(job.id),
      connectionId: input.connectionId,
      providerId: "woocommerce",
      operation: "backfill",
      streams: [input.stream],
      from: discoveryFrom,
      to: input.dayEnd,
    },
    adapterFactory,
    attempt: 1,
    maxAttempts: 5,
    leaseOwner: `woo-reconciliation:${hostname()}:${input.stream}`,
    correlationId: `woo-reconciliation-${runId}-${input.stream}`,
  });

  if (run.status !== "succeeded") {
    failures.push(`Stream "${input.stream}" sync did not succeed: ${JSON.stringify(run)}`);
  }

  return {
    stream: input.stream,
    status: run.status,
    fetchedCount: run.fetchedCount,
    canonicalCount: run.canonicalCount,
    duplicateCount: run.duplicateCount,
  };
}

async function readCanonicalRecordsForDay(
  tenantId: string,
  workspaceId: string,
  dayStart: string,
  dayEnd: string,
): Promise<{
  ordersCountCompletedCents: bigint;
  grossRevenueCompletedCents: bigint;
  refundAmountQualifyingCents: bigint;
  refundAmountAllCents: bigint;
  inventoryByExternalId: Record<string, number>;
}> {
  const integrations = new IntegrationRepository(database);

  // The real production read path -- the same `listCanonicalRecords` method
  // `command-center-metrics.real-source.ts` calls to build Command Center's
  // metric engine input -- not a hand-rolled query, so this reconciliation
  // proves the actual data-read path, not just that rows exist in the table.
  const rows = await integrations.listCanonicalRecords(tenantId, workspaceId, {
    streams: ["orders", "refunds", "inventory"],
    businessTimeFrom: dayStart,
    businessTimeTo: dayEnd,
  });

  const orderRows = rows.filter((row) => row.stream === "orders");
  const refundRows = rows.filter((row) => row.stream === "refunds");
  const inventoryRows = rows.filter((row) => row.stream === "inventory");

  const completedOrders = orderRows.filter(
    (row) => statusOf(row) === "completed",
  );
  const completedOrderExternalIds = new Set(completedOrders.map((row) => String(row.external_id)));

  const ordersCountCompletedCents = BigInt(completedOrders.length);
  const grossRevenueCompletedCents = completedOrders.reduce(
    (sum, row) => sum + decimalToCents(String(entityOf(row).grossAmount ?? "0")),
    0n,
  );

  // Mirrors metricEngineCore.ts's `createMetricFacts`: a refund only
  // reduces revenue when its order is still revenue-qualifying (present in
  // the completed-orders set). A refund against an order that's already
  // excluded (e.g. status flipped to "refunded") must not be counted here,
  // or revenue would be decremented twice for the same loss.
  let refundAmountQualifyingCents = 0n;
  let refundAmountAllCents = 0n;
  for (const row of refundRows) {
    const entity = entityOf(row);
    const amountCents = decimalToCents(String(entity.amount ?? "0"));
    refundAmountAllCents += amountCents;
    const orderId = entity.orderId === undefined || entity.orderId === null ? null : String(entity.orderId);
    if (orderId !== null && completedOrderExternalIds.has(orderId)) {
      refundAmountQualifyingCents += amountCents;
    }
  }

  const inventoryByExternalId: Record<string, number> = {};
  for (const row of inventoryRows) {
    const entity = entityOf(row);
    const quantity = entity.availableQuantity;
    if (typeof quantity === "number") {
      const productId = entity.productId !== undefined && entity.productId !== null
        ? String(entity.productId)
        : String(row.external_id);
      inventoryByExternalId[productId] = quantity;
    }
  }

  return {
    ordersCountCompletedCents,
    grossRevenueCompletedCents,
    refundAmountQualifyingCents,
    refundAmountAllCents,
    inventoryByExternalId,
  };
}

async function readSourceOfTruthForDay(
  dayStart: string,
  dayEnd: string,
): Promise<{
  ordersCountCompletedCents: bigint;
  grossRevenueCompletedCents: bigint;
  refundAmountQualifyingCents: bigint;
  refundAmountAllCents: bigint;
  products: readonly { id: string; stockQuantity: number }[];
}> {
  const orders = await wooFetchAllPages<{ id: number; status: string; total: string }>(
    "/wp-json/wc/v3/orders",
    {
      status: "any",
      after: dayStart,
      before: dayEnd,
      order: "asc",
    },
  );
  const completed = orders.filter((order) => order.status === "completed");
  const completedIds = new Set(completed.map((order) => String(order.id)));
  const ordersCountCompletedCents = BigInt(completed.length);
  const grossRevenueCompletedCents = completed.reduce(
    (sum, order) => sum + decimalToCents(order.total),
    0n,
  );

  const refunds = await readWooRefundsForDay(dayStart, dayEnd);
  let refundAmountQualifyingCents = 0n;
  let refundAmountAllCents = 0n;
  for (const refund of refunds) {
    const amountCents = decimalToCents(refund.amount);
    refundAmountAllCents += amountCents;
    if (completedIds.has(String(refund.parentId))) {
      refundAmountQualifyingCents += amountCents;
    }
  }

  const productsRaw = await wooFetchAllPages<{ id: number; stock_quantity: number | null }>(
    "/wp-json/wc/v3/products",
    {
      after: dayStart,
      before: dayEnd,
      order: "asc",
    },
  );
  const products = productsRaw.map((product) => ({
    id: String(product.id),
    stockQuantity: product.stock_quantity ?? 0,
  }));

  return {
    ordersCountCompletedCents,
    grossRevenueCompletedCents,
    refundAmountQualifyingCents,
    refundAmountAllCents,
    products,
  };
}

type WooRefundForReconciliation = {
  readonly id: number;
  readonly parentId: number;
  readonly amount: string;
  readonly refundedAt: string;
};

async function readWooRefundsForDay(
  dayStart: string,
  dayEnd: string,
): Promise<readonly WooRefundForReconciliation[]> {
  try {
    const direct = await wooFetchAllPages<{
      id: number;
      parent_id: number;
      amount: string;
      date_created_gmt?: string;
      date_created?: string;
    }>(
      "/wp-json/wc/v3/refunds",
      {
        after: dayStart,
        before: dayEnd,
        order: "asc",
      },
    );

    report.refundDiscoveryMode = "wc/v3/refunds";
    return direct
      .map((refund) => ({
        id: refund.id,
        parentId: refund.parent_id,
        amount: refund.amount,
        refundedAt: normalizeWooDate(refund.date_created_gmt, refund.date_created),
      }))
      .filter((refund) => isTimestampInWindow(refund.refundedAt, dayStart, dayEnd));
  } catch (error) {
    if (!(error instanceof WooRestError) || (error.status !== 400 && error.status !== 404)) {
      throw error;
    }

    // WooCommerce < 9.0 compatibility fallback. There is deliberately no
    // lower-date floor: a refund inside the target day can belong to an
    // arbitrarily old order. Pagination keeps the fallback complete.
    report.refundDiscoveryMode = "legacy-order-history-fallback";
    const candidateOrders = await wooFetchAllPages<{ id: number }>(
      "/wp-json/wc/v3/orders",
      {
        status: "any",
        before: dayEnd,
        order: "asc",
      },
    );
    const refunds: WooRefundForReconciliation[] = [];

    for (const order of candidateOrders) {
      const nested = await wooFetchAllPages<{
        id: number;
        amount: string;
        date_created_gmt?: string;
        date_created?: string;
      }>(`/wp-json/wc/v3/orders/${order.id}/refunds`, {});

      for (const refund of nested) {
        const refundedAt = normalizeWooDate(refund.date_created_gmt, refund.date_created);
        if (!isTimestampInWindow(refundedAt, dayStart, dayEnd)) continue;
        refunds.push({
          id: refund.id,
          parentId: order.id,
          amount: refund.amount,
          refundedAt,
        });
      }
    }

    return refunds;
  }
}

async function wooFetchAllPages<T>(
  path: string,
  filters: Readonly<Record<string, string | null>>,
): Promise<readonly T[]> {
  const items: T[] = [];
  let page = 1;

  while (page <= 10_000) {
    const query = new URLSearchParams({ page: String(page), per_page: "100" });
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, value);
    }
    const separator = path.includes("?") ? "&" : "?";
    const response = await wooFetchResponse<unknown>(`${path}${separator}${query.toString()}`);
    if (!Array.isArray(response.data)) {
      throw new Error(`WooCommerce REST call ${path} returned a non-array collection`);
    }
    items.push(...response.data as T[]);

    const totalPages = Number(response.headers.get("x-wp-totalpages") ?? "0");
    if (
      response.data.length < 100
      || (Number.isFinite(totalPages) && totalPages > 0 && page >= totalPages)
    ) {
      break;
    }
    page += 1;
  }

  return items;
}

class WooRestError extends Error {
  readonly status: number;

  constructor(path: string, status: number, body: string) {
    super(`WooCommerce REST call ${path} failed: ${status} ${body}`);
    this.name = "WooRestError";
    this.status = status;
  }
}

async function wooFetchResponse<T>(path: string): Promise<{ readonly data: T; readonly headers: Headers }> {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(`${wooSandboxUrl}${path}`, {
    headers: { authorization: `Basic ${auth}` },
  });
  if (!response.ok) {
    throw new WooRestError(path, response.status, await response.text());
  }
  return {
    data: await response.json() as T,
    headers: response.headers,
  };
}

async function wooFetch<T>(path: string): Promise<T> {
  return (await wooFetchResponse<T>(path)).data;
}

function normalizeWooDate(gmt: string | undefined, local: string | undefined): string {
  const candidate = gmt
    ? (/[zZ]|[+-]\d{2}:?\d{2}$/u.test(gmt) ? gmt : `${gmt}Z`)
    : local;
  if (!candidate || !Number.isFinite(Date.parse(candidate))) {
    return "";
  }
  return new Date(Date.parse(candidate)).toISOString();
}

function isTimestampInWindow(timestamp: string, from: string, to: string): boolean {
  const value = Date.parse(timestamp);
  return Number.isFinite(value) && value >= Date.parse(from) && value < Date.parse(to);
}

function statusOf(row: Record<string, unknown>): string | null {
  const value = entityOf(row).status;
  return typeof value === "string" ? value.toLowerCase() : null;
}

function entityOf(row: Record<string, unknown>): Record<string, unknown> {
  const payload = row.canonical_payload as { entity?: Record<string, unknown> } | undefined;
  return payload?.entity ?? {};
}

// Exact decimal-string -> integer-cents conversion (no floating point),
// mirroring apps/api/src/metrics/metricEngineCore.ts's `decimalToCents` --
// the same technique the real metric engine uses internally, so this
// reconciliation's arithmetic can't itself introduce the kind of rounding
// noise a float-based comparison would need a tolerance for.
function decimalToCents(value: string): bigint {
  const sign = value.trim().startsWith("-") ? -1n : 1n;
  const normalized = sign < 0n ? value.trim().slice(1) : value.trim();
  const [units = "0", cents = ""] = normalized.split(".");
  const paddedCents = `${cents}00`.slice(0, 2);
  return sign * (BigInt(units || "0") * 100n + BigInt(paddedCents || "0"));
}

function compareCents(name: string, actual: bigint | null, expected: bigint, kind: "count" | "money"): void {
  const matched = actual === expected;
  checks.push({
    name,
    kind,
    actual: actual === null ? null : actual.toString(),
    expected: expected.toString(),
    matched,
  });
  if (!matched) {
    failures.push(`${name}: PapaData=${actual === null ? "null" : actual.toString()} WooCommerce=${expected.toString()} (exact match required, zero tolerance)`);
  }
}

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();
  const envPath = join(repoRoot, ".env.production-parity");
  const raw = readFileSync(envPath, "utf8");
  const line = raw.split("\n").find((entry) => entry.startsWith("DATABASE_URL="));
  if (!line) throw new Error(`DATABASE_URL not found in ${envPath}`);
  return line
    .slice("DATABASE_URL=".length)
    .trim()
    .replace("postgres-production:5432", "127.0.0.1:55432");
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set (real WooCommerce sandbox REST API credentials).`);
  return value;
}
