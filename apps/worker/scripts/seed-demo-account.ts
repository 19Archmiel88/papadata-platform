// Creates one real, login-able PapaData account with a real WooCommerce
// connection wired to the existing sandbox (compose.woocommerce-sandbox.yml),
// so a human can open https://papadata.localhost, log in with real
// credentials, and see the Command Center dashboard populated with real,
// correctly-calculated metrics -- not fixtures.
//
// Two things this script deliberately does NOT fake:
//  - The account is registered through the REAL HTTP endpoint
//    (POST /api/v1/auth/register/email, through the real edge -> bff ->
//    api path), so the password hash is a real argon2 hash produced by the
//    real API, not a placeholder string. It is genuinely login-able.
//  - The WooCommerce data is ingested through the real, production
//    DurableIngestionPipeline against the real WooCommerce sandbox REST
//    API -- the same pipeline apps/worker/src/production/worker.service.ts
//    runs -- not hand-inserted rows.
//
// What this script does NOT prove or provide:
//  - A live, scheduled sync. The production scheduler currently does not
//    enqueue ingestion jobs on a recurring schedule (scheduler.service.ts
//    only cron's reconciliation/retention). This is a one-time backfill;
//    re-run this script to pull in newer sandbox data.
//  - A UI path to connect a provider. apps/web's Integrations screen is an
//    unrouted static mock (no submit handler) -- the connection row here is
//    created directly against Postgres, mirroring
//    apps/worker/scripts/woocommerce-reconciliation.ts's proven setup, not
//    through a UI flow that does not exist yet.
//
// Idempotent: safe to re-run. Registration falls back to login on 409
// (account already exists); the connection/credential rows use fixed
// idempotency keys / unique-index upserts, so re-running just re-syncs
// whatever is currently in the WooCommerce sandbox.
//
// Requires: compose.production-parity.yml up, compose.woocommerce-sandbox.yml
// up, and fresh WooCommerce REST API keys (see tests/backend-production-parity/README.md
// -- keys cannot be read back after creation). Run with:
//   WOOCOMMERCE_SANDBOX_CONSUMER_KEY=... WOOCOMMERCE_SANDBOX_CONSUMER_SECRET=... \
//     pnpm --filter @papadata/worker exec tsx scripts/seed-demo-account.ts
process.env.NODE_ENV = "test";
// Both the WooCommerce sandbox and the local HTTPS edge terminate TLS with
// throwaway self-signed certificates not part of any trusted CA bundle. This
// process only ever talks to those two local services.
import { readFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { createHash } from "node:crypto";
import { join } from "node:path";
import {
  DurableIntegrationIngestionRepository,
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
// Node's fetch/DNS resolver does not special-case the `.localhost` TLD the
// way curl and Chromium do (see tests/backend-production-parity/README.md's
// https-trust-real-browser.mjs notes) -- `papadata.localhost` fails to
// resolve here even though it works fine through a real browser or curl.
// bff-production is also mapped straight to the host
// (127.0.0.1:53001, see compose.production-parity.yml), and
// BFF_PUBLIC_HOSTS in .env.production-parity already explicitly allow-lists
// "papadata.localhost:53001" alongside "papadata.localhost" for exactly this
// kind of direct, edge-bypassing script access. So: connect to that host
// port directly in plain HTTP, but send the Host/Origin headers a real
// browser request through the edge would carry, so BFF's host/origin
// allow-list checks see the same values either way.
const connectBaseUrl = process.env.PAPADATA_BFF_CONNECT_URL?.trim() || "http://127.0.0.1:53001";
const hostHeader = process.env.PAPADATA_BFF_HOST_HEADER?.trim() || "papadata.localhost:53001";
const originHeader = process.env.PAPADATA_APP_ORIGIN?.trim() || "https://papadata.localhost";
// What a human should actually type into a browser -- through the real
// HTTPS edge, not the direct bypass port used above.
const displayUrl = process.env.PAPADATA_APP_BASE_URL?.trim() || "https://papadata.localhost";
const databaseUrl = readDatabaseUrl();
const wooSandboxUrl = process.env.WOOCOMMERCE_SANDBOX_URL?.trim() || "https://127.0.0.1:8543";
const consumerKey = process.env.WOOCOMMERCE_SANDBOX_CONSUMER_KEY?.trim() || null;
const consumerSecret = process.env.WOOCOMMERCE_SANDBOX_CONSUMER_SECRET?.trim() || null;

assertLocalTarget("PAPADATA_BFF_CONNECT_URL", connectBaseUrl);
assertLocalTarget("DATABASE_URL", databaseUrl);
assertLocalTarget("WOOCOMMERCE_SANDBOX_URL", wooSandboxUrl);

// Only after all network/database targets have been proven local may this
// process accept the throwaway self-signed certificates used by parity.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const DEMO_EMAIL = "papadata-demo@papadata.test";
const DEMO_PASSWORD = "PapaData2026!Demo";
const DEMO_DISPLAY_NAME = "Demo Account";
const DEMO_ORG_NAME = "PapaData Demo";
const DEMO_WORKSPACE_NAME = "Primary";
const CONNECTION_IDEMPOTENCY_KEY = "papadata-demo-woocommerce-connection";
const DEMO_CONNECTION_IDEMPOTENCY_PREFIX = "papadata-demo-command-center";
const CREDENTIAL_REFERENCE = "papadata-demo-woocommerce-credential";
const DEMO_RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");

const demoProducts = [
  { id: "papa-mug", name: "PapaData Test Mug", sku: "PAPA-MUG", price: 100, unitCost: 46 },
  { id: "papa-tote", name: "PapaData Test Tote Bag", sku: "PAPA-TOTE", price: 89, unitCost: 38 },
  { id: "papa-hoodie", name: "PapaData Analytics Hoodie", sku: "PAPA-HOODIE", price: 249, unitCost: 112 },
  { id: "papa-notebook", name: "PapaData Notebook", sku: "PAPA-NOTE", price: 49, unitCost: 18 },
  { id: "papa-bottle", name: "PapaData Steel Bottle", sku: "PAPA-BOTTLE", price: 129, unitCost: 55 },
  { id: "papa-cap", name: "PapaData Cap", sku: "PAPA-CAP", price: 79, unitCost: 31 },
  { id: "papa-keyboard", name: "PapaData Keyboard", sku: "PAPA-KEYBOARD", price: 329, unitCost: 171 },
  { id: "papa-mousepad", name: "PapaData Desk Mat", sku: "PAPA-DESK", price: 119, unitCost: 43 },
  { id: "papa-sticker", name: "PapaData Sticker Pack", sku: "PAPA-STICKER", price: 29, unitCost: 7 },
  { id: "papa-poster", name: "PapaData Wall Poster", sku: "PAPA-POSTER", price: 59, unitCost: 16 },
  { id: "papa-socks", name: "PapaData Socks", sku: "PAPA-SOCKS", price: 39, unitCost: 12 },
  { id: "papa-lamp", name: "PapaData Focus Lamp", sku: "PAPA-LAMP", price: 399, unitCost: 210 },
] as const;

const database = new ProductionDatabase({
  connectionString: databaseUrl,
  max: 8,
  statementTimeoutMs: 30_000,
});

const summary: Record<string, unknown> = {
  appUrl: displayUrl,
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
};

try {
  const auth = await registerOrLogin();
  summary.tenantId = auth.tenantId;
  summary.workspaceId = auth.workspaceId;
  console.log(`[1/4] Account ready: ${DEMO_EMAIL} (tenant ${auth.tenantId})`);

  const connections = await ensureDemoProviderConnections(auth.tenantId, auth.workspaceId);
  summary.connections = connections;
  console.log(`[2/4] Demo provider connections ready: ${Object.entries(connections).map(([provider, id]) => `${provider}=${id}`).join(", ")}`);

  const seeded = await seedCommandCenterCanonicalDemoData(auth.tenantId, auth.workspaceId, connections);
  summary.seeded = seeded;
  console.log(`[3/4] Canonical demo data ready: ${seeded.records} records across ${seeded.days} days`);

  const from = seeded.from;
  const to = seeded.to;
  const jobRuns: Record<string, unknown>[] = [];
  if (consumerKey && consumerSecret) {
    for (const stream of ["orders", "products", "refunds", "inventory"] as const) {
      try {
        jobRuns.push(await runStreamJob({
          tenantId: auth.tenantId,
          workspaceId: auth.workspaceId,
          connectionId: connections.woocommerce,
          stream,
          from,
          to,
        }));
      } catch (error) {
        jobRuns.push({
          error: error instanceof Error ? error.message : String(error),
          status: "skipped_after_failure",
          stream,
        });
      }
    }
  } else {
    jobRuns.push({
      reason: "WOOCOMMERCE_SANDBOX_CONSUMER_KEY/SECRET not set",
      status: "skipped",
      stream: "woocommerce-live-backfill",
    });
  }
  summary.jobRuns = jobRuns;
  console.log(`[3b/4] Optional WooCommerce backfill: ${jobRuns.map((run) => `${run.stream}=${run.status}`).join(", ")}`);

  const verification = await verifyLoginAndDashboard(from, to);
  summary.verification = verification;
  console.log(`[4/4] Verified real login + dashboard read: ${verification.kpiCount} KPI values returned`);
} finally {
  await database.close();
}

console.log("\n=== Demo account ready ===");
console.log(JSON.stringify(summary, null, 2));
console.log(`\nLog in at ${displayUrl}/login with:`);
console.log(`  email:    ${DEMO_EMAIL}`);
console.log(`  password: ${DEMO_PASSWORD}`);

type BffResponse = {
  readonly status: number;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly bodyText: string;
};

// Node's global fetch (undici) treats "Host" as a forbidden request header
// and silently drops/overrides it with the real connection authority --
// confirmed empirically against this exact endpoint (fetch always sent
// Host: 127.0.0.1:53001, which is not in BFF_PUBLIC_HOSTS, so every call
// failed with "Host is not allowed" regardless of the header we asked fetch
// to send). node:http.request has no such restriction, so it's used here
// instead, connecting straight to bff-production's host-mapped port
// (127.0.0.1:53001, see compose.production-parity.yml) while presenting the
// same Host/Origin a real browser request through the edge would carry.
function bffRequest(
  method: "GET" | "POST",
  path: string,
  options: { readonly body?: unknown; readonly cookie?: string } = {},
): Promise<BffResponse> {
  const url = new URL(connectBaseUrl);
  const bodyText = options.body === undefined ? undefined : JSON.stringify(options.body);
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        hostname: url.hostname,
        port: url.port,
        path,
        method,
        headers: {
          "content-type": "application/json",
          host: hostHeader,
          origin: originHeader,
          ...(options.cookie ? { cookie: options.cookie } : {}),
          ...(bodyText ? { "content-length": Buffer.byteLength(bodyText) } : {}),
        },
      },
      (res) => {
        let bodyText = "";
        res.on("data", (chunk: Buffer) => { bodyText += chunk.toString("utf8"); });
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 0, headers: res.headers as Record<string, string | string[] | undefined>, bodyText });
        });
      },
    );
    req.on("error", reject);
    if (bodyText) req.write(bodyText);
    req.end();
  });
}

function sessionCookieFromResponse(response: BffResponse): string {
  const raw = response.headers["set-cookie"];
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const pairs = cookies.map((entry) => entry.split(";")[0]).filter((entry): entry is string => Boolean(entry));
  if (pairs.length === 0) {
    throw new Error("No session cookie returned by the auth endpoint.");
  }
  return pairs.join("; ");
}

async function registerOrLogin(): Promise<{ tenantId: string; workspaceId: string; sessionCookie: string }> {
  const registerResponse = await bffRequest("POST", "/api/v1/auth/register/email", {
    body: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      displayName: DEMO_DISPLAY_NAME,
      organizationName: DEMO_ORG_NAME,
      workspaceName: DEMO_WORKSPACE_NAME,
    },
  });

  if (registerResponse.status === 409) {
    // Already registered by a previous run of this script -- log in instead.
    return await login();
  }

  if (registerResponse.status < 200 || registerResponse.status >= 300) {
    throw new Error(`Registration failed: ${registerResponse.status} ${registerResponse.bodyText}`);
  }

  const payload = JSON.parse(registerResponse.bodyText) as {
    data: { session: { activeTenantId: string; activeWorkspaceId: string } };
  };
  return {
    tenantId: payload.data.session.activeTenantId,
    workspaceId: payload.data.session.activeWorkspaceId,
    sessionCookie: sessionCookieFromResponse(registerResponse),
  };
}

async function login(): Promise<{ tenantId: string; workspaceId: string; sessionCookie: string }> {
  const response = await bffRequest("POST", "/api/v1/auth/login", {
    body: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Login failed: ${response.status} ${response.bodyText}`);
  }
  const payload = JSON.parse(response.bodyText) as {
    data: { session: { activeTenantId: string; activeWorkspaceId: string } };
  };
  return {
    tenantId: payload.data.session.activeTenantId,
    workspaceId: payload.data.session.activeWorkspaceId,
    sessionCookie: sessionCookieFromResponse(response),
  };
}

async function ensureWooCommerceConnection(tenantId: string, workspaceId: string): Promise<string> {
  const integrations = new IntegrationRepository(database);

  const connection = await integrations.createConnection({
    tenantId,
    workspaceId,
    providerId: "woocommerce",
    credentialReference: CREDENTIAL_REFERENCE,
    requestedScopes: ["read"],
    idempotencyKey: CONNECTION_IDEMPOTENCY_KEY,
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
       )
       on conflict (tenant_id, workspace_id, connection_id, provider_id, credential_reference)
       where revoked_at is null and status <> 'revoked'
       do update set issued_at = now()`,
      [tenantId, workspaceId, connectionId, CREDENTIAL_REFERENCE],
    );
  });

  return connectionId;
}

type DemoProviderId = "ga4" | "google_ads" | "meta_ads" | "woocommerce";
type DemoConnections = Record<DemoProviderId, string>;

async function ensureDemoProviderConnections(tenantId: string, workspaceId: string): Promise<DemoConnections> {
  const woocommerce = await ensureWooCommerceConnection(tenantId, workspaceId);
  const googleAds = await ensureSyntheticConnection(tenantId, workspaceId, "google_ads", ["https://www.googleapis.com/auth/adwords"]);
  const metaAds = await ensureSyntheticConnection(tenantId, workspaceId, "meta_ads", ["ads_read"]);
  const ga4 = await ensureSyntheticConnection(tenantId, workspaceId, "ga4", ["https://www.googleapis.com/auth/analytics.readonly"]);

  await database.withTenantWorkspace(tenantId, workspaceId, async (client) => {
    await client.query(
      `update app.integration_connections
          set is_primary_inventory_source = false,
              updated_at = now()
        where tenant_id = $1
          and workspace_id = $2
          and is_primary_inventory_source is true`,
      [tenantId, workspaceId],
    );
    await client.query(
      `update app.integration_connections
          set status = 'active',
              external_account_id = case provider_id
                when 'woocommerce' then 'demo-woocommerce-store'
                when 'google_ads' then 'demo-google-ads-account'
                when 'meta_ads' then 'demo-meta-ads-account'
                when 'ga4' then 'demo-ga4-property'
                else external_account_id
              end,
              account_name = case provider_id
                when 'woocommerce' then 'PapaData Demo WooCommerce'
                when 'google_ads' then 'PapaData Demo Google Ads'
                when 'meta_ads' then 'PapaData Demo Meta Ads'
                when 'ga4' then 'PapaData Demo GA4'
                else account_name
              end,
              granted_scopes = requested_scopes,
              is_primary_inventory_source = provider_id = 'woocommerce',
              updated_at = now()
        where tenant_id = $1
          and workspace_id = $2
          and connection_id = any($3::uuid[])`,
      [tenantId, workspaceId, [woocommerce, googleAds, metaAds, ga4]],
    );
  });

  return {
    ga4,
    google_ads: googleAds,
    meta_ads: metaAds,
    woocommerce,
  };
}

async function ensureSyntheticConnection(
  tenantId: string,
  workspaceId: string,
  providerId: Exclude<DemoProviderId, "woocommerce">,
  requestedScopes: readonly string[],
): Promise<string> {
  const integrations = new IntegrationRepository(database);
  const connection = await integrations.createConnection({
    tenantId,
    workspaceId,
    providerId,
    credentialReference: `${DEMO_CONNECTION_IDEMPOTENCY_PREFIX}-${providerId}-credential`,
    requestedScopes,
    idempotencyKey: `${DEMO_CONNECTION_IDEMPOTENCY_PREFIX}-${providerId}-connection`,
  });

  return String(connection.id);
}

type DemoCanonicalRecord = {
  readonly providerId: DemoProviderId;
  readonly stream: "ad_spend" | "attributed_conversions" | "inventory" | "orders" | "products" | "refunds" | "traffic";
  readonly externalId: string;
  readonly occurredAt: string;
  readonly entity: Record<string, unknown>;
};

async function seedCommandCenterCanonicalDemoData(
  tenantId: string,
  workspaceId: string,
  connections: DemoConnections,
): Promise<{ readonly days: number; readonly from: string; readonly records: number; readonly to: string }> {
  const days = 90;
  const now = new Date();
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
  const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const records = buildDemoCanonicalRecords(startDate, days);
  const batches = new Map<string, { readonly batchId: string; readonly jobId: string }>();

  await database.withTenantWorkspace(tenantId, workspaceId, async (client) => {
    for (const record of records) {
      const sourceStream = sourceStreamFor(record.stream);
      const batchKey = `${record.providerId}:${sourceStream}`;
      let batch = batches.get(batchKey);
      if (!batch) {
        batch = await ensureSeedBatch(client, {
          connectionId: connections[record.providerId],
          providerId: record.providerId,
          sourceStream,
          tenantId,
          workspaceId,
        });
        batches.set(batchKey, batch);
      }

      await upsertCanonicalDemoRecord(client, {
        ...record,
        connectionId: connections[record.providerId],
        sourceBatchId: batch.batchId,
        syncJobId: batch.jobId,
        sourceStream,
        tenantId,
        workspaceId,
      });
    }

    await upsertDemoCheckpoints(client, tenantId, workspaceId, connections, endDate.toISOString());
  });

  return {
    days,
    from: startDate.toISOString(),
    records: records.length,
    to: new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function buildDemoCanonicalRecords(startDate: Date, days: number): readonly DemoCanonicalRecord[] {
  const records: DemoCanonicalRecord[] = [];
  const seenCustomers = new Set<string>();

  for (const product of demoProducts) {
    records.push({
      entity: {
        currency: "PLN",
        name: product.name,
        productId: product.id,
        sku: product.sku,
        unitCost: product.unitCost,
      },
      externalId: product.id,
      occurredAt: new Date(startDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      providerId: "woocommerce",
      stream: "products",
    });
    records.push({
      entity: {
        availableQuantity: 80 + (product.id.length % 7) * 9,
        productId: product.id,
      },
      externalId: product.id,
      occurredAt: new Date(startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000).toISOString(),
      providerId: "woocommerce",
      stream: "inventory",
    });
  }

  for (let day = 0; day < days; day += 1) {
    const dayStart = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    const orderCount = 5 + (day % 4) + (day > days - 21 ? 1 : 0);
    const dailyRevenueLift = 1 + day * 0.004;

    for (let orderIndex = 0; orderIndex < orderCount; orderIndex += 1) {
      const orderedAt = new Date(dayStart.getTime() + (9 + (orderIndex % 9)) * 60 * 60 * 1000 + orderIndex * 7 * 60 * 1000);
      const introducesFreshCustomer = orderIndex === 0 || (day + orderIndex) % 11 === 0;
      const customerId = introducesFreshCustomer
        ? `cust-new-${String(day).padStart(3, "0")}-${String(orderIndex).padStart(2, "0")}`
        : `cust-${String((day * 5 + orderIndex * 7) % 76).padStart(3, "0")}`;
      const customerType = introducesFreshCustomer || !seenCustomers.has(customerId) ? "new" : "returning";
      seenCustomers.add(customerId);
      const firstProduct = demoProducts[(day + orderIndex) % demoProducts.length]!;
      const secondProduct = demoProducts[(day * 2 + orderIndex + 3) % demoProducts.length]!;
      const hasSecondLine = (day + orderIndex) % 3 !== 0;
      const firstQuantity = 1 + ((day + orderIndex) % 2);
      const secondQuantity = hasSecondLine ? 1 : 0;
      const lineItems = [
        {
          externalProductId: firstProduct.id,
          grossAmount: roundMoney(firstProduct.price * firstQuantity * dailyRevenueLift),
          quantity: firstQuantity,
        },
        ...(hasSecondLine ? [{
          externalProductId: secondProduct.id,
          grossAmount: roundMoney(secondProduct.price * secondQuantity * dailyRevenueLift),
          quantity: secondQuantity,
        }] : []),
      ];
      const grossAmount = roundMoney(lineItems.reduce((sum, line) => sum + line.grossAmount, 0));
      const orderId = `demo-order-${String(day).padStart(3, "0")}-${String(orderIndex).padStart(2, "0")}`;

      records.push({
        entity: {
          currency: "PLN",
          customerReference: customerId,
          customerType,
          grossAmount,
          lineItems,
          orderId,
          orderNumber: `PD-${String(day + 1).padStart(3, "0")}-${String(orderIndex + 1).padStart(2, "0")}`,
          status: "completed",
          updatedAt: orderedAt.toISOString(),
        },
        externalId: orderId,
        occurredAt: orderedAt.toISOString(),
        providerId: "woocommerce",
        stream: "orders",
      });

      if ((day + orderIndex) % 17 === 0 && day < days - 2) {
        const refundAt = new Date(orderedAt.getTime() + 36 * 60 * 60 * 1000);
        records.push({
          entity: {
            amount: roundMoney(grossAmount * 0.18),
            currency: "PLN",
            orderId,
            refundId: `refund-${orderId}`,
          },
          externalId: `refund-${orderId}`,
          occurredAt: refundAt.toISOString(),
          providerId: "woocommerce",
          stream: "refunds",
        });
      }
    }

    records.push(...buildDailyAdsRecords(dayStart, day));
    records.push(...buildDailyTrafficRecords(dayStart, day, orderCount));
  }

  return records;
}

function buildDailyAdsRecords(dayStart: Date, day: number): readonly DemoCanonicalRecord[] {
  const channels = [
    { providerId: "google_ads" as const, campaignId: "search-high-intent", spend: 430 + day * 3.2, clicks: 260 + (day % 9) * 9, impressions: 11600 + day * 90, value: 1700 + day * 13 },
    { providerId: "google_ads" as const, campaignId: "shopping-bestsellers", spend: 310 + day * 2.1, clicks: 190 + (day % 7) * 8, impressions: 9400 + day * 70, value: 1280 + day * 9 },
    { providerId: "meta_ads" as const, campaignId: "prospecting-lookalike", spend: 360 + day * 4.8, clicks: 210 + (day % 6) * 7, impressions: 18300 + day * 120, value: 1020 + day * 5 },
    { providerId: "meta_ads" as const, campaignId: "retargeting-cart", spend: 180 + day * 1.4, clicks: 150 + (day % 5) * 6, impressions: 6800 + day * 45, value: 920 + day * 8 },
  ];

  return channels.flatMap((channel, index): DemoCanonicalRecord[] => {
    const occurredAt = new Date(dayStart.getTime() + (8 + index) * 60 * 60 * 1000).toISOString();
    return [
      {
        entity: {
          campaignId: channel.campaignId,
          clicks: Math.round(channel.clicks),
          currency: "PLN",
          date: occurredAt.slice(0, 10),
          impressions: Math.round(channel.impressions),
          spend: roundMoney(channel.spend),
        },
        externalId: `${channel.campaignId}-spend-${occurredAt.slice(0, 10)}`,
        occurredAt,
        providerId: channel.providerId,
        stream: "ad_spend",
      },
      {
        entity: {
          campaignId: channel.campaignId,
          conversionValue: roundMoney(channel.value),
          currency: "PLN",
          date: occurredAt.slice(0, 10),
        },
        externalId: `${channel.campaignId}-conversion-${occurredAt.slice(0, 10)}`,
        occurredAt: new Date(Date.parse(occurredAt) + 2 * 60 * 60 * 1000).toISOString(),
        providerId: channel.providerId,
        stream: "attributed_conversions",
      },
    ];
  });
}

function buildDailyTrafficRecords(dayStart: Date, day: number, orderCount: number): readonly DemoCanonicalRecord[] {
  const date = dayStart.toISOString().slice(0, 10);
  const sourceRows = [
    { source: "Organic Search", sessions: 94 + (day % 8) * 4, users: 78 + (day % 7) * 3 },
    { source: "Paid Search", sessions: 72 + (day % 6) * 5, users: 61 + (day % 5) * 4 },
    { source: "Paid Social", sessions: 66 + (day % 7) * 4, users: 57 + (day % 6) * 3 },
    { source: "Direct", sessions: 42 + (day % 5) * 3, users: 37 + (day % 4) * 2 },
    { source: "Email / CRM", sessions: 31 + (day % 4) * 3, users: 25 + (day % 3) * 2 },
  ];
  const productSessions = sourceRows.reduce((sum, row) => sum + row.sessions, 0);
  const cart = Math.round(productSessions * (0.28 - (day > 72 ? 0.018 : 0) + (day % 5) * 0.002));
  const checkout = Math.round(cart * (0.62 - (day > 72 ? 0.035 : 0)));
  const purchase = orderCount;
  const funnelRows = [
    { id: "product-sessions", label: "Sesje produktowe", order: 1, entrants: productSessions, completions: productSessions },
    { id: "add-to-cart", label: "Dodanie do koszyka", order: 2, entrants: productSessions, completions: cart },
    { id: "checkout", label: "Checkout", order: 3, entrants: cart, completions: checkout },
    { id: "purchase", label: "Zakup", order: 4, entrants: checkout, completions: purchase },
  ];
  const completeness = day > 82 ? 0.955 : 0.985 - (day % 4) * 0.002;

  return [
    ...sourceRows.map((row, index): DemoCanonicalRecord => ({
      entity: {
        eventCompleteness: round4Local(completeness),
        sessions: row.sessions,
        source: row.source,
        users: row.users,
      },
      externalId: `traffic-source-${date}-${index}`,
      occurredAt: new Date(dayStart.getTime() + (7 + index) * 60 * 60 * 1000).toISOString(),
      providerId: "ga4",
      stream: "traffic",
    })),
    ...funnelRows.map((row): DemoCanonicalRecord => ({
      entity: {
        completions: row.completions,
        entrants: row.entrants,
        eventCompleteness: round4Local(completeness),
        funnelStepId: row.id,
        funnelStepLabel: row.label,
        stageOrder: row.order,
      },
      externalId: `funnel-${date}-${row.id}`,
      occurredAt: new Date(dayStart.getTime() + (14 + row.order) * 60 * 60 * 1000).toISOString(),
      providerId: "ga4",
      stream: "traffic",
    })),
  ];
}

type QueryClient = {
  query: (
    sql: string,
    values?: readonly unknown[],
  ) => Promise<{ readonly rowCount?: number | null; readonly rows: readonly Record<string, unknown>[] }>;
};

async function ensureSeedBatch(
  client: QueryClient,
  input: {
    readonly connectionId: string;
    readonly providerId: DemoProviderId;
    readonly sourceStream: Exclude<DemoCanonicalRecord["stream"], "traffic">;
    readonly tenantId: string;
    readonly workspaceId: string;
  },
): Promise<{ readonly batchId: string; readonly jobId: string }> {
  const job = await client.query(
    `insert into app.sync_jobs (
       sync_job_id, tenant_id, workspace_id, connection_id, provider_id,
       job_kind, operation, status, streams, from_time, to_time,
       idempotency_key, attempts, max_attempts, created_at, started_at, completed_at
     )
     values (
       gen_random_uuid(), $1, $2, $3, $4,
       'backfill', 'backfill', 'succeeded', $5::text[], null, null,
       $6, 1, 5, now(), now(), now()
     )
     on conflict (tenant_id, workspace_id, idempotency_key)
     do update set status = 'succeeded', completed_at = now(), updated_at = now()
     returning sync_job_id::text as id`,
    [
      input.tenantId,
      input.workspaceId,
      input.connectionId,
      input.providerId,
      [input.sourceStream],
      `${DEMO_CONNECTION_IDEMPOTENCY_PREFIX}-job-${input.providerId}-${input.sourceStream}`,
    ],
  );
  const jobId = String(job.rows[0]?.id);
  const batch = await client.query(
    `insert into app.source_batches (
       source_batch_id, tenant_id, workspace_id, connection_id, sync_job_id,
       provider_id, stream, status, record_count, started_at, completed_at,
       provider_cursor, fetch_started_at, fetch_finished_at, payload_checksum,
       schema_version, attempt, correlation_id
     )
     values (
       gen_random_uuid(), $1, $2, $3, $4,
       $5, $6, 'success', 0, now(), now(),
       'demo-seed', now(), now(), $7,
       'provider.raw.v1', 1, 'papadata-demo-command-center-seed'
     )
     on conflict (source_batch_id)
     do nothing
     returning source_batch_id::text as id`,
    [
      input.tenantId,
      input.workspaceId,
      input.connectionId,
      jobId,
      input.providerId,
      input.sourceStream,
      stableHash(`${input.providerId}:${input.sourceStream}:batch`),
    ],
  );

  return {
    batchId: String(batch.rows[0]?.id),
    jobId,
  };
}

async function upsertCanonicalDemoRecord(
  client: QueryClient,
  input: DemoCanonicalRecord & {
    readonly connectionId: string;
    readonly sourceBatchId: string;
    readonly sourceStream: Exclude<DemoCanonicalRecord["stream"], "traffic">;
    readonly syncJobId: string;
    readonly tenantId: string;
    readonly workspaceId: string;
  },
): Promise<void> {
  const canonicalPayload = {
    entity: input.entity,
    externalId: input.externalId,
    occurredAt: input.occurredAt,
    providerId: input.providerId,
    quality: { missingFields: [], status: "valid" },
    stream: input.stream,
    version: "integration.canonical.v2",
  };
  const idempotencyKey = [
    "papadata-demo",
    input.tenantId,
    input.workspaceId,
    input.providerId,
    input.stream,
    input.externalId,
  ].join(":");
  const fingerprint = stableHash(idempotencyKey);

  await client.query(
    `with source_upsert as (
       insert into app.source_records (
         source_record_id, tenant_id, workspace_id, source_batch_id, connection_id,
         provider_id, stream, external_id, fingerprint, payload, ingested_at,
         provider_object_type, provider_object_id, provider_updated_at,
         payload_checksum, idempotency_key, schema_version
       )
       values (
         gen_random_uuid(), $1, $2, $3, $4,
         $5, $6, $7, $8, $9::jsonb, now(),
         $10, $11, $12,
         $8, $13, 'provider.raw.v1'
       )
       on conflict (tenant_id, workspace_id, provider_id, stream, external_id)
       do update set
         source_batch_id = excluded.source_batch_id,
         connection_id = excluded.connection_id,
         fingerprint = excluded.fingerprint,
         payload = excluded.payload,
         ingested_at = now(),
         provider_object_type = excluded.provider_object_type,
         provider_object_id = excluded.provider_object_id,
         provider_updated_at = excluded.provider_updated_at,
         payload_checksum = excluded.payload_checksum,
         idempotency_key = excluded.idempotency_key
       returning source_record_id
     )
     insert into app.integration_canonical_records (
       canonical_record_id, tenant_id, workspace_id, source_record_id,
       connection_id, provider_id, stream, external_id, canonical_payload,
       canonical_version, source_lineage, business_time, ingested_at, updated_at
     )
     select
       gen_random_uuid(), $1, $2, source_record_id,
       $4, $5, $14, $15, $16::jsonb,
       'integration.canonical.v2',
       jsonb_build_object(
         'sourceRecordId', source_record_id,
         'sourceBatchId', $3::uuid,
         'syncJobId', $17::uuid,
         'providerId', $5,
         'demoSeed', true
       ),
       $12, now(), now()
     from source_upsert
     on conflict (tenant_id, workspace_id, connection_id, provider_id, stream, external_id)
     do update set
       canonical_payload = excluded.canonical_payload,
       source_lineage = excluded.source_lineage,
       business_time = excluded.business_time,
       updated_at = now()`,
    [
      input.tenantId,
      input.workspaceId,
      input.sourceBatchId,
      input.connectionId,
      input.providerId,
      input.sourceStream,
      `${input.stream}:${input.externalId}`,
      fingerprint,
      JSON.stringify({ canonical: canonicalPayload, demoSeed: true }),
      input.stream,
      input.externalId,
      input.occurredAt,
      idempotencyKey,
      input.stream,
      input.externalId,
      JSON.stringify(canonicalPayload),
      input.syncJobId,
    ],
  );
}

async function upsertDemoCheckpoints(
  client: QueryClient,
  tenantId: string,
  workspaceId: string,
  connections: DemoConnections,
  watermark: string,
): Promise<void> {
  const checkpointInputs: readonly {
    readonly providerId: Exclude<DemoProviderId, "ga4">;
    readonly stream: "ad_spend" | "attributed_conversions" | "inventory" | "orders" | "products" | "refunds";
  }[] = [
    { providerId: "woocommerce", stream: "orders" },
    { providerId: "woocommerce", stream: "products" },
    { providerId: "woocommerce", stream: "refunds" },
    { providerId: "woocommerce", stream: "inventory" },
    { providerId: "google_ads", stream: "ad_spend" },
    { providerId: "google_ads", stream: "attributed_conversions" },
    { providerId: "meta_ads", stream: "ad_spend" },
    { providerId: "meta_ads", stream: "attributed_conversions" },
  ];

  for (const checkpoint of checkpointInputs) {
    const batch = await ensureSeedBatch(client, {
      connectionId: connections[checkpoint.providerId],
      providerId: checkpoint.providerId,
      sourceStream: checkpoint.stream,
      tenantId,
      workspaceId,
    });

    await client.query(
      `insert into app.sync_checkpoints (
         sync_checkpoint_id, tenant_id, workspace_id, connection_id,
         provider_id, stream, cursor, watermark, checkpoint_version,
         updated_by_sync_job_id, updated_at
       )
       values (
         gen_random_uuid(), $1, $2, $3,
         $4, $5, 'demo-seed', $6, 1,
         $7, now()
       )
       on conflict (tenant_id, workspace_id, connection_id, provider_id, stream)
       do update set
         cursor = excluded.cursor,
         watermark = excluded.watermark,
         checkpoint_version = app.sync_checkpoints.checkpoint_version + 1,
         updated_by_sync_job_id = excluded.updated_by_sync_job_id,
         updated_at = now()`,
      [
        tenantId,
        workspaceId,
        connections[checkpoint.providerId],
        checkpoint.providerId,
        checkpoint.stream,
        watermark,
        batch.jobId,
      ],
    );
  }
}

function sourceStreamFor(
  stream: DemoCanonicalRecord["stream"],
): Exclude<DemoCanonicalRecord["stream"], "traffic"> {
  return stream === "traffic" ? "attributed_conversions" : stream;
}

function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function round4Local(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

async function runStreamJob(input: {
  tenantId: string;
  workspaceId: string;
  connectionId: string;
  stream: "orders" | "products" | "refunds" | "inventory";
  from: string;
  to: string;
}): Promise<Record<string, unknown>> {
  if (!consumerKey || !consumerSecret) {
    throw new Error("WooCommerce sandbox credentials are not configured.");
  }

  const integrations = new IntegrationRepository(database);
  const credentials = new IntegrationCredentialRepository(database);
  const ingestion = new DurableIntegrationIngestionRepository(database);

  const secretStore = new InMemoryCredentialSecretStore();
  secretStore.setSecret(
    {
      providerId: "woocommerce",
      credentialReference: CREDENTIAL_REFERENCE,
      secretResource: CREDENTIAL_REFERENCE,
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
      credentialReference: CREDENTIAL_REFERENCE,
      provider: "woocommerce",
    });
    const adapter = createProviderAdapter(resolved);
    await adapter.verifyConnection();
    return adapter;
  };

  const pipeline = new DurableIngestionPipeline({ repository: ingestion });
  const job = await integrations.createJob({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    connectionId: input.connectionId,
    providerId: "woocommerce",
    operation: "backfill",
    streams: [input.stream],
    from: input.from,
    to: input.to,
    idempotencyKey: `papadata-demo-job-${input.stream}-${DEMO_RUN_ID}`,
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
      from: input.from,
      to: input.to,
    },
    adapterFactory,
    attempt: 1,
    maxAttempts: 5,
    leaseOwner: `papadata-demo-seed:${input.stream}`,
    correlationId: `papadata-demo-seed-${input.stream}`,
  });

  if (run.status !== "succeeded") {
    throw new Error(`Stream "${input.stream}" sync did not succeed: ${JSON.stringify(run)}`);
  }

  return {
    stream: input.stream,
    status: run.status,
    fetchedCount: run.fetchedCount,
    canonicalCount: run.canonicalCount,
    duplicateCount: run.duplicateCount,
  };
}

async function verifyLoginAndDashboard(from: string, to: string): Promise<{ kpiCount: number; sample: unknown }> {
  // Fresh, independent login -- proves the credentials work on their own,
  // not just as a side effect of the registration call above.
  const { sessionCookie } = await login();

  const query = new URLSearchParams({ from, to, timezone: "UTC" }).toString();
  const response = await bffRequest("GET", `/api/v1/command-center/kpi?${query}`, {
    cookie: sessionCookie,
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Dashboard KPI read failed: ${response.status} ${response.bodyText}`);
  }
  const payload = JSON.parse(response.bodyText) as { data: unknown };
  const items = Array.isArray(payload.data) ? payload.data : [payload.data];
  return { kpiCount: items.length, sample: items[0] };
}

function assertLocalTarget(label: string, value: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid local URL.`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const local = hostname === "127.0.0.1"
    || hostname === "localhost"
    || hostname === "::1"
    || hostname.endsWith(".localhost");

  if (!local) {
    throw new Error(`${label} must target localhost; received ${hostname}.`);
  }
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
