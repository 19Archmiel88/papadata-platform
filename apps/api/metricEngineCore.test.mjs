import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";

import { createAuthHttpRuntime } from "./authHttpRuntime.mjs";
import { authCookieNames, csrfHeaderName } from "./src/auth/authCore.ts";
import {
  DashboardMetricService,
  InMemoryMetricState,
  createMetricEngineInput,
  dashboardMetricCodes,
  metricDefinitions,
} from "./src/metrics/metricEngineCore.ts";

function createService() {
  let nextId = 1;

  return new DashboardMetricService({
    accessService: {
      async authorizeSelectedContext() {
        throw new Error("HTTP authorization is not used by formula tests.");
      },
    },
    random: {
      operationId() {
        return `op_metric_test_${nextId++}`;
      },
      token(prefix) {
        return `${prefix}_metric_test_${nextId++}`;
      },
      uuid() {
        return `metric_test_${nextId++}`;
      },
    },
    state: new InMemoryMetricState(),
  });
}

describe("backend Metric Engine", () => {
  test("liczy kazda formule z Promptu 7 wedlug test vector definitions", async () => {
    const service = createService();
    const result = await service.calculate(createMetricEngineInput());

    assert.equal(result.readiness, "ready");
    assert.equal(result.metrics.length, dashboardMetricCodes.length);
    assert.equal(metricDefinitions.length, dashboardMetricCodes.length);

    for (const definition of metricDefinitions) {
      assert.ok(definition.metricCode);
      assert.ok(definition.definitionVersion);
      assert.ok(definition.businessDefinition);
      assert.ok(definition.formula);
      assert.ok(definition.requiredCanonicalFacts.length > 0);
      assert.ok(definition.includedStatuses.length > 0);
      assert.ok(definition.excludedStatuses.length > 0);
      assert.ok(definition.datePolicy);
      assert.ok(definition.currencyPolicy);
      assert.ok(definition.taxPolicy);
      assert.ok(definition.refundPolicy);
      assert.ok(definition.missingDataPolicy);
      assert.ok(definition.readinessRule);
      assert.ok(definition.testVectors.length > 0);

      const snapshot = result.metrics.find(
        (metric) => metric.metricCode === definition.metricCode,
      );
      assert.ok(snapshot, `Missing snapshot for ${definition.metricCode}`);
      assert.equal(snapshot.readiness, definition.testVectors[0].expectedReadiness);
      assert.equal(snapshot.value, definition.testVectors[0].expectedValue);
    }
  });

  test("rozroznia ready, partial, stale, invalid, no_data i unavailable", async () => {
    const service = createService();

    const ready = await service.calculate(createMetricEngineInput());
    assert.equal(metric(ready, "gross_order_value").readiness, "ready");

    const partial = await service.calculate(createMetricEngineInput({ partial: true }));
    assert.equal(metric(partial, "gross_order_value").readiness, "partial");

    const stale = await service.calculate(createMetricEngineInput({ stale: true }));
    assert.equal(metric(stale, "gross_order_value").readiness, "stale");
    assert.ok(stale.reprocessJobs.some((job) => job.reason === "stale"));

    const invalid = await service.calculate(createMetricEngineInput({ invalid: true }));
    assert.equal(metric(invalid, "gross_order_value").readiness, "invalid");
    assert.equal(metric(invalid, "gross_order_value").value, null);
    assert.ok(invalid.reprocessJobs.some((job) => job.reason === "invalid"));

    const noData = await service.calculate(createMetricEngineInput({ noData: true }));
    assert.equal(metric(noData, "gross_order_value").readiness, "no_data");
    assert.equal(metric(noData, "ad_spend").readiness, "no_data");

    const missingCosts = await service.calculate(
      createMetricEngineInput({ includeProductCosts: false }),
    );
    assert.deepEqual(metric(missingCosts, "stock_value").reasonCodes, [
      "UNAVAILABLE",
      "MISSING_PRODUCT_COST",
    ]);
    assert.deepEqual(metric(missingCosts, "product_margin").reasonCodes, [
      "UNAVAILABLE",
      "MISSING_PRODUCT_COST",
    ]);
    assert.deepEqual(metric(missingCosts, "product_contribution").reasonCodes, [
      "UNAVAILABLE",
      "MISSING_PRODUCT_COST",
    ]);

    const missingInventoryAuthority = await service.calculate(
      createMetricEngineInput({ primaryInventoryProvider: null }),
    );
    assert.deepEqual(metric(missingInventoryAuthority, "available_stock").reasonCodes, [
      "UNAVAILABLE",
      "MISSING_INVENTORY_AUTHORITY",
    ]);

    const missingMapping = await service.calculate(
      createMetricEngineInput({ missingProductMapping: true }),
    );
    assert.deepEqual(metric(missingMapping, "product_revenue").reasonCodes, [
      "UNAVAILABLE",
      "MISSING_PRODUCT_MAPPING",
    ]);
  });

  test("nie sumuje platform_attributed_revenue z przychodem sklepu", async () => {
    const result = await createService().calculate(createMetricEngineInput());

    assert.equal(metric(result, "gross_order_value").value, "348.00");
    assert.equal(metric(result, "platform_attributed_revenue").value, "810.00");
    assert.equal(metric(result, "revenue_after_refunds").value, "150.00");
    assert.equal(metric(result, "roas").value, "3.8571");
  });
});

describe("backend Dashboard API", { concurrency: false }, () => {
  let runtime;
  let baseUrl;

  beforeEach(async () => {
    const allowedHosts = [];
    const allowedOrigins = [];
    runtime = createAuthHttpRuntime({
      allowedHosts,
      allowedOrigins,
      exposeLocalTestRoutes: true,
      now: () => new Date("2026-07-20T00:00:00.000Z"),
    });
    await listen(runtime.server);
    const address = runtime.server.address();
    assert.equal(typeof address, "object");
    baseUrl = `http://127.0.0.1:${address.port}`;
    allowedHosts.push(`127.0.0.1:${address.port}`);
    allowedOrigins.push(baseUrl);
  });

  afterEach(async () => {
    await close(runtime.server);
  });

  test("udostepnia wszystkie endpointy dashboardu przez sesje i analytics.read", async () => {
    const jar = new CookieJar();
    await csrf(jar);
    await registerLogin(jar, "dashboard@example.com");
    await bootstrap(jar, "Dashboard Tenant", "Dashboard Workspace");

    const readiness = await apiRequest(jar, "GET", "/v1/dashboard/readiness");
    assert.equal(readiness.status, 200);
    assert.equal(readiness.body.data.readiness, "ready");
    assert.equal(readiness.body.data.metrics.length, dashboardMetricCodes.length);

    const paths = [
      "/v1/dashboard/command-center",
      "/v1/dashboard/campaigns",
      "/v1/dashboard/orders",
      "/v1/dashboard/products",
      "/v1/dashboard/customers",
      "/v1/dashboard/traffic",
    ];

    for (const path of paths) {
      const response = await apiRequest(jar, "GET", path);
      assert.equal(response.status, 200, path);
      assert.ok(response.body.data.projection.module);
      assert.ok(Array.isArray(response.body.data.projection.metrics));
    }

    const commandCenter = await apiRequest(jar, "GET", "/v1/dashboard/command-center");
    assert.equal(
      commandCenter.body.data.projection.metrics.some(
        (snapshot) =>
          snapshot.metricCode === "roas" &&
          snapshot.value === "3.8571",
      ),
      true,
    );
  });

  test("odrzuca dashboard bez aktywnej sesji", async () => {
    const jar = new CookieJar();
    await csrf(jar);

    const response = await apiRequest(jar, "GET", "/v1/dashboard/readiness");

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHENTICATED");
  });

  async function registerLogin(targetJar, email) {
    const register = await apiRequest(targetJar, "POST", "/v1/auth/register", {
      email,
      fullName: "Test User",
      password: "correct-password",
    });
    assert.equal(register.status, 201);
    const otp = (await latestOutbox(email, "email_verification")).otpPreview;
    const verify = await apiRequest(targetJar, "POST", "/v1/auth/email/verify", {
      email,
      otp,
    });
    assert.equal(verify.status, 200);
    const login = await apiRequest(targetJar, "POST", "/v1/auth/login", {
      email,
      password: "correct-password",
    });
    assert.equal(login.status, 200);
    return login.body.data.user;
  }

  async function bootstrap(targetJar, name, workspaceName) {
    const registered = await apiRequest(targetJar, "POST", "/v1/organizations/register", {
      name,
    });
    assert.equal(registered.status, 201);
    const verified = await apiRequest(targetJar, "POST", "/v1/organizations/verify", {
      tenantId: registered.body.data.tenant.tenantId,
      verificationCode: registered.body.data.verificationCodePreview,
    });
    assert.equal(verified.status, 200);
    const bootstrapped = await apiRequest(targetJar, "POST", "/v1/organizations/bootstrap", {
      tenantId: registered.body.data.tenant.tenantId,
      workspaceName,
    });
    assert.equal(bootstrapped.status, 201);
    return bootstrapped.body.data;
  }

  async function csrf(targetJar) {
    const response = await fetch(`${baseUrl}/v1/auth/csrf`, {
      headers: {
        origin: baseUrl,
      },
    });
    targetJar.store(response.headers.getSetCookie());
    const body = await response.json();
    return body.data.csrfToken;
  }

  async function apiRequest(targetJar, method, path, body = undefined) {
    const headers = {
      "content-type": "application/json",
      cookie: targetJar.cookieHeader(),
      origin: baseUrl,
      "user-agent": "node-test",
      [csrfHeaderName]: targetJar.get(authCookieNames.csrf) ?? "",
    };
    const response = await fetch(`${baseUrl}${path}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers,
      method,
    });
    targetJar.store(response.headers.getSetCookie());
    return {
      body: await response.json(),
      status: response.status,
    };
  }

  async function latestOutbox(email, type) {
    const messages = (await runtime.service.getSnapshot()).emailOutbox.filter(
      (message) => message.email === email && message.purpose === type,
    );

    assert.ok(messages.length > 0, `Missing outbox message for ${email}:${type}`);
    return messages.at(-1);
  }
});

function metric(result, metricCode) {
  const snapshot = result.metrics.find((item) => item.metricCode === metricCode);
  assert.ok(snapshot, `Missing metric ${metricCode}`);
  return snapshot;
}

class CookieJar {
  #cookies = new Map();

  store(setCookies) {
    for (const value of setCookies ?? []) {
      const [pair] = value.split(";");
      const [name, rawValue] = pair.split("=");

      if (name) {
        this.#cookies.set(name, rawValue);
      }
    }
  }

  get(name) {
    return this.#cookies.get(name);
  }

  cookieHeader() {
    return [...this.#cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
