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

  test("gross_order_value i orders wykluczaja pending/cancelled/refunded, licza tylko completed", async () => {
    const base = createMetricEngineInput();
    const [templateOrder] = base.canonicalOrders;
    assert.ok(templateOrder, "fixture must ship at least one canonical order");

    const nonQualifying = ["pending", "cancelled", "refunded", "on-hold", "failed"].map(
      (status, index) => ({
        ...templateOrder,
        canonicalOrderId: `status_filter_test_${status}`,
        externalOrderId: `status-filter-${index}`,
        grossAmount: "1000.00",
        orderNumber: `STATUS-${status}`,
        status,
      }),
    );
    const qualifyingCompleted = {
      ...templateOrder,
      canonicalOrderId: "status_filter_test_completed",
      externalOrderId: "status-filter-completed",
      grossAmount: "1000.00",
      orderNumber: "STATUS-completed",
      status: "completed",
    };

    const before = await createService().calculate(base);
    const after = await createService().calculate({
      ...base,
      canonicalOrders: [...base.canonicalOrders, ...nonQualifying, qualifyingCompleted],
    });

    const beforeGross = Number(metric(before, "gross_order_value").value);
    const afterGross = Number(metric(after, "gross_order_value").value);
    const beforeOrders = Number(metric(before, "orders").value);
    const afterOrders = Number(metric(after, "orders").value);

    assert.equal(
      afterGross - beforeGross,
      1000,
      "only the single completed order (1000.00) should raise revenue; pending/cancelled/refunded/on-hold/failed must not",
    );
    assert.equal(
      afterOrders - beforeOrders,
      1,
      "only the single completed order should raise the order count",
    );
  });

  test("revenue_after_refunds nie jest podwojnie pomniejszane refundem zamowienia juz wykluczonego po statusie", async () => {
    const base = createMetricEngineInput();
    const [templateOrder] = base.canonicalOrders;
    const [templateRefund] = base.canonicalRefunds;
    assert.ok(templateOrder, "fixture must ship at least one canonical order");
    assert.ok(templateRefund, "fixture must ship at least one canonical refund");

    // Order fully refunded -> excluded from commerceOrders/gross_order_value
    // by status alone (matches real WooCommerce: a fully-refunded order's
    // status becomes "refunded"). Its own refund record must NOT also
    // subtract from revenue_after_refunds, or the same loss gets counted
    // twice: once by the order contributing 0 gross, once by the refund
    // being subtracted on top.
    const excludedOrder = {
      ...templateOrder,
      canonicalOrderId: "double_decrement_test_order",
      externalOrderId: "double-decrement-order",
      grossAmount: "500.00",
      orderNumber: "DOUBLE-DECREMENT",
      status: "refunded",
    };
    const refundAgainstExcludedOrder = {
      ...templateRefund,
      amount: "500.00",
      canonicalOrderId: excludedOrder.canonicalOrderId,
      canonicalRefundId: "double_decrement_test_refund",
      externalRefundId: "double-decrement-refund",
    };

    // Control case: a still-qualifying ("completed") order that received a
    // partial refund. This refund SHOULD reduce revenue_after_refunds,
    // since the order's full gross is still counted.
    const qualifyingOrder = {
      ...templateOrder,
      canonicalOrderId: "partial_refund_test_order",
      externalOrderId: "partial-refund-order",
      grossAmount: "300.00",
      orderNumber: "PARTIAL-REFUND",
      status: "completed",
    };
    const refundAgainstQualifyingOrder = {
      ...templateRefund,
      amount: "40.00",
      canonicalOrderId: qualifyingOrder.canonicalOrderId,
      canonicalRefundId: "partial_refund_test_refund",
      externalRefundId: "partial-refund-refund",
    };

    const before = await createService().calculate(base);

    const withExcludedOrderRefund = await createService().calculate({
      ...base,
      canonicalOrders: [...base.canonicalOrders, excludedOrder],
      canonicalRefunds: [...base.canonicalRefunds, refundAgainstExcludedOrder],
    });
    const beforeRevenue = Number(metric(before, "revenue_after_refunds").value);
    const afterExcludedRevenue = Number(metric(withExcludedOrderRefund, "revenue_after_refunds").value);

    assert.equal(
      afterExcludedRevenue,
      beforeRevenue,
      "a refund against an order already excluded by status must not change revenue_after_refunds at all -- " +
        "not add (order stays excluded), and not subtract further (that would double-decrement)",
    );

    const withQualifyingOrderRefund = await createService().calculate({
      ...base,
      canonicalOrders: [...base.canonicalOrders, qualifyingOrder],
      canonicalRefunds: [...base.canonicalRefunds, refundAgainstQualifyingOrder],
    });
    const afterQualifyingRevenue = Number(metric(withQualifyingOrderRefund, "revenue_after_refunds").value);

    assert.equal(
      afterQualifyingRevenue,
      beforeRevenue + 300 - 40,
      "a refund against a still-qualifying order must reduce revenue_after_refunds by exactly the refund amount",
    );
  });

  test("return_value i return_rate_orders widza WSZYSTKIE refundy, wliczajac te przeciwko zamowieniom wykluczonym po statusie", async () => {
    // Regression test: facts.refunds used to be pre-filtered down to only
    // revenue-qualifying orders (to avoid double-decrementing
    // revenue_after_refunds -- see the test above), which had the side
    // effect of hiding real refunds from return_value/return_rate_orders/
    // returned_units/return_rate_units entirely. Those metrics must reflect
    // every real refund in the period; only revenue_after_refunds gets the
    // narrower, revenue-qualifying-only view (via facts.revenueQualifyingRefunds).
    const base = createMetricEngineInput();
    const [templateOrder] = base.canonicalOrders;
    const [templateRefund] = base.canonicalRefunds;
    assert.ok(templateOrder, "fixture must ship at least one canonical order");
    assert.ok(templateRefund, "fixture must ship at least one canonical refund");

    const before = await createService().calculate(base);
    const beforeReturnValue = Number(metric(before, "return_value").value);
    const beforeReturnRateOrders = Number(metric(before, "return_rate_orders").value);
    const beforeOrders = Number(metric(before, "orders").value);

    // Full refund of an order whose status is "refunded" -- excluded from
    // commerceOrders/orders by status, so it must not move the "orders"
    // denominator, but its refund must still count in return_value and in
    // the refunded-orders numerator of return_rate_orders.
    const fullyRefundedOrder = {
      ...templateOrder,
      canonicalOrderId: "full_refund_status_test_order",
      externalOrderId: "full-refund-status-test-order",
      grossAmount: "220.00",
      orderNumber: "FULL-REFUND-STATUS",
      status: "refunded",
    };
    const fullRefund = {
      ...templateRefund,
      amount: "220.00",
      canonicalOrderId: fullyRefundedOrder.canonicalOrderId,
      canonicalRefundId: "full_refund_status_test_refund",
      externalRefundId: "full-refund-status-test-refund",
    };

    const after = await createService().calculate({
      ...base,
      canonicalOrders: [...base.canonicalOrders, fullyRefundedOrder],
      canonicalRefunds: [...base.canonicalRefunds, fullRefund],
    });

    const afterReturnValue = Number(metric(after, "return_value").value);
    const afterReturnRateOrders = Number(metric(after, "return_rate_orders").value);
    const afterOrders = Number(metric(after, "orders").value);

    assert.equal(
      afterReturnValue,
      beforeReturnValue + 220,
      "return_value must include a refund even when its order is excluded from revenue by status",
    );
    assert.equal(
      afterOrders,
      beforeOrders,
      "a fully-refunded order (status: refunded) must not be counted in the orders denominator",
    );
    assert.equal(
      afterReturnRateOrders,
      (beforeReturnRateOrders * beforeOrders + 1) / afterOrders,
      "return_rate_orders' numerator (refunded orders) must include the excluded order's refund even though " +
        "the denominator (orders) does not count that order -- return_rate_orders operates on the full refund set",
    );
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
