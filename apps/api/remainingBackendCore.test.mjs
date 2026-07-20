import assert from "node:assert/strict";
import { mkdtemp, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

import { createAuthHttpRuntime } from "./authHttpRuntime.mjs";
import { authCookieNames, csrfHeaderName } from "./src/auth/authCore.ts";
import { dashboardMetricCodes } from "./src/metrics/metricEngineCore.ts";
import {
  assistantRefusalCodes,
  billingSandboxEventTypes,
  workerJobTypes,
} from "./src/operations/remainingBackendCore.ts";

describe("backend Prompt 8 remaining backend contract", () => {
  test("contract: publikuje wymagane joby, eventy billingowe, metryki i refusal code", () => {
    assert.deepEqual(workerJobTypes, [
      "email_outbox",
      "sync",
      "backfill",
      "readiness",
      "metric_calculation",
      "reprocessing",
      "notifications",
      "reports",
      "exports",
      "ai_briefings",
      "cleanup",
      "retry",
      "dlq",
    ]);
    assert.deepEqual(billingSandboxEventTypes, [
      "subscription_activated",
      "plan_changed",
      "subscription_cancelled",
      "subscription_resumed",
      "payment_pending",
      "payment_failed",
      "payment_recovered",
      "invoice_generated",
      "usage_updated",
      "limit_reached",
      "entitlement_changed",
    ]);
    assert.ok(assistantRefusalCodes.includes("INSUFFICIENT_DATA"));
    assert.equal(dashboardMetricCodes.length, 27);
  });
});

describe("backend Prompt 8 worker, reports, AI, billing and E2E", { concurrency: false }, () => {
  let runtime;
  let baseUrl;
  let reportDirectory;

  beforeEach(async () => {
    reportDirectory = await mkdtemp(join(tmpdir(), "papadata-prompt8-"));
    const allowedHosts = [];
    const allowedOrigins = [];
    runtime = createAuthHttpRuntime({
      allowedHosts,
      allowedOrigins,
      exposeLocalTestRoutes: true,
      now: () => new Date("2026-07-20T08:00:00.000Z"),
      reportExportDirectory: reportDirectory,
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

  test("resilience/recovery: worker obsluguje joby, retry, DLQ, replay i cleanup", async () => {
    const context = workerContext();
    const completedTypes = [];

    for (const jobType of workerJobTypes) {
      const job = await runtime.remainingBackendService.enqueueWorkerJob(
        {
          commandFingerprint: `contract:${jobType}`,
          idempotencyKey: `idem:${jobType}`,
          payload: {
            source: "prompt8-test",
          },
          tenantId: "tenant_worker",
          type: jobType,
          workspaceId: "workspace_worker",
        },
        context,
      );
      const completed = await runtime.remainingBackendService.runWorkerJob(job.jobId, context);
      assert.equal(completed.status, "succeeded");
      completedTypes.push(completed.type);
    }

    assert.deepEqual(completedTypes, [...workerJobTypes]);

    const flaky = await runtime.remainingBackendService.enqueueWorkerJob(
      {
        commandFingerprint: "sync:flaky",
        idempotencyKey: "idem:flaky",
        retryBudget: 2,
        tenantId: "tenant_worker",
        type: "sync",
        workspaceId: "workspace_worker",
      },
      context,
    );
    const retry = await runtime.remainingBackendService.failWorkerJob(
      flaky.jobId,
      "PROVIDER_UNAVAILABLE",
      context,
    );
    assert.equal(retry.status, "retry_wait");
    assert.ok(retry.nextRunAt);

    const dlq = await runtime.remainingBackendService.failWorkerJob(
      flaky.jobId,
      "PROVIDER_UNAVAILABLE",
      context,
    );
    assert.equal(dlq.status, "dlq");

    const replay = await runtime.remainingBackendService.replayDlq(flaky.jobId, context);
    assert.equal(replay.status, "queued");
    const recovered = await runtime.remainingBackendService.runWorkerJob(flaky.jobId, context);
    assert.equal(recovered.status, "succeeded");

    const cleaned = await runtime.remainingBackendService.cleanupCompletedJobs(context);
    assert.ok(cleaned.length >= workerJobTypes.length);

    const snapshot = await runtime.remainingBackendService.getSnapshot();
    assert.equal(snapshot.workerDlq.length, 1);
  });

  test("E2E/integration: rejestracja, dashboard, raport z plikiem, assistant i billing sandbox", async () => {
    const jar = new CookieJar();
    await csrf(jar);
    await registerLogin(jar, "prompt8-owner@example.com");
    const bootstrapped = await bootstrap(jar, "Prompt 8 Tenant", "Prompt 8 Workspace");

    const dashboard = await apiRequest(jar, "GET", "/v1/dashboard/readiness");
    assert.equal(dashboard.status, 200);
    assert.equal(dashboard.body.data.readiness, "ready");
    assert.equal(dashboard.body.data.metrics.length, dashboardMetricCodes.length);

    const exported = await apiRequest(jar, "POST", "/v1/reports/export", {
      format: "json",
      periodEnd: "2026-07-20T23:59:59.000Z",
      periodStart: "2026-07-01T00:00:00.000Z",
      reportType: "dashboard_summary",
    });
    assert.equal(exported.status, 202);
    assert.equal(exported.body.data.report.status, "completed");
    assert.equal(exported.body.data.workerJobIds.length, 2);
    const fileStats = await stat(exported.body.data.report.filePath);
    assert.ok(fileStats.size > 0);

    const reportId = exported.body.data.report.reportId;
    const status = await apiRequest(jar, "GET", `/v1/reports/${reportId}/status`);
    assert.equal(status.status, 200);
    assert.equal(status.body.data.report.status, "completed");

    const download = await apiRequest(jar, "GET", `/v1/reports/${reportId}/download`);
    assert.equal(download.status, 200);
    assert.match(download.body.data.content, new RegExp(reportId));

    const thread = await apiRequest(jar, "POST", "/v1/assistant/threads", {
      resourceId: "dashboard",
      resourceType: "dashboard",
      surface: "command_center",
      title: "Dashboard briefing",
      useCaseId: "dashboard_briefing",
    });
    assert.equal(thread.status, 201);
    assert.equal(thread.body.data.thread.context.tenantId, bootstrapped.tenant.tenantId);

    const threadId = thread.body.data.thread.threadId;
    const message = await apiRequest(jar, "POST", `/v1/assistant/threads/${threadId}/messages`, {
      message: "Co wymaga uwagi?",
    });
    assert.equal(message.status, 201);
    assert.ok(message.body.data.assistantMessage.evidence.length > 0);
    assert.equal(message.body.data.assistantMessage.refusal, null);
    assert.ok(message.body.data.assistantMessage.confidence > 0);

    const stream = await apiRequest(jar, "GET", `/v1/assistant/threads/${threadId}/stream`);
    assert.equal(stream.status, 200);
    assert.equal(stream.body.data.chunks.at(-1).event, "message.done");

    const simulation = await apiRequest(
      jar,
      "POST",
      `/v1/assistant/threads/${threadId}/simulation`,
      {
        actionKind: "create_report_recommendation",
      },
    );
    assert.equal(simulation.status, 200);
    assert.ok(simulation.body.data.impactPreview.includes("requires_human_approval"));

    const approval = await apiRequest(jar, "POST", `/v1/assistant/threads/${threadId}/approvals`, {
      actionKind: "create_report_recommendation",
    });
    assert.equal(approval.status, 201);
    assert.equal(approval.body.data.approval.status, "approved");
    assert.equal(approval.body.data.approval.reauthenticationRequired, true);

    const revalidation = await apiRequest(
      jar,
      "POST",
      `/v1/assistant/threads/${threadId}/revalidation`,
      {
        idempotencyKey: "idem-ai-action",
        targetId: "dashboard",
      },
    );
    assert.equal(revalidation.status, 200);
    assert.equal(revalidation.body.data.permissionRevalidated, true);
    assert.equal(revalidation.body.data.dataRevalidated, true);

    const noData = await apiRequest(jar, "POST", `/v1/assistant/threads/${threadId}/messages`, {
      message: "A gdy nie ma danych?",
      simulateNoData: true,
    });
    assert.equal(noData.status, 422);
    assert.equal(noData.body.data.assistantMessage.refusal.code, "INSUFFICIENT_DATA");

    const billingSubscription = await apiRequest(jar, "GET", "/v1/billing/subscription");
    assert.equal(billingSubscription.status, 200);
    assert.equal(billingSubscription.body.data.subscription.status, "trial");

    const billingRoutes = [
      ["/v1/billing/subscription/activate", { planCode: "growth" }, "subscription_activated"],
      ["/v1/billing/subscription/change-plan", { planCode: "scale" }, "plan_changed"],
      ["/v1/billing/subscription/cancel", { reason: "sandbox" }, "subscription_cancelled"],
      ["/v1/billing/subscription/resume", {}, "subscription_resumed"],
      ["/v1/billing/payment/pending", {}, "payment_pending"],
      ["/v1/billing/payment/failed", { reason: "card_declined" }, "payment_failed"],
      ["/v1/billing/payment/recovered", {}, "payment_recovered"],
      ["/v1/billing/invoices/generate", { amountDue: "199.00", currency: "PLN" }, "invoice_generated"],
      ["/v1/billing/usage/update", { meterCode: "metric_snapshot", quantity: "27" }, "usage_updated"],
      ["/v1/billing/limits/reached", { limitCode: "exports_monthly" }, "limit_reached"],
      [
        "/v1/billing/entitlements/change",
        { entitlements: ["analytics", "reports", "ai_assistant"] },
        "entitlement_changed",
      ],
    ];

    for (const [path, payload, eventType] of billingRoutes) {
      const response = await apiRequest(jar, "POST", path, payload);
      assert.equal(response.status, 200, path);
      assert.equal(response.body.data.event.eventType, eventType);
    }

    const snapshot = await runtime.remainingBackendService.getSnapshot();
    assert.deepEqual(
      snapshot.billingEvents.map((event) => event.eventType),
      billingSandboxEventTypes,
    );
    assert.equal(snapshot.reports.length, 1);
    assert.ok(snapshot.assistantAudit.length >= 5);
  });

  test("security/authorization: obcy tenant nie moze pobrac statusu raportu", async () => {
    const ownerJar = new CookieJar();
    await csrf(ownerJar);
    await registerLogin(ownerJar, "report-owner@example.com");
    await bootstrap(ownerJar, "Report Owner Tenant", "Report Owner Workspace");
    const exported = await apiRequest(ownerJar, "POST", "/v1/reports/export", {
      format: "csv",
      reportType: "dashboard_summary",
    });
    assert.equal(exported.status, 202);

    const otherJar = new CookieJar();
    await csrf(otherJar);
    await registerLogin(otherJar, "other-owner@example.com");
    await bootstrap(otherJar, "Other Tenant", "Other Workspace");
    const leaked = await apiRequest(
      otherJar,
      "GET",
      `/v1/reports/${exported.body.data.report.reportId}/status`,
    );

    assert.equal(leaked.status, 404);
    assert.equal(leaked.body.error.code, "NOT_FOUND");
  });

  async function registerLogin(targetJar, email) {
    const register = await apiRequest(targetJar, "POST", "/v1/auth/register", {
      email,
      fullName: "Prompt Eight Owner",
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

function workerContext() {
  return {
    correlationId: "corr_prompt8_worker",
    ip: "127.0.0.1",
    now: new Date("2026-07-20T08:00:00.000Z"),
    sessionId: undefined,
    userAgent: "node-test",
  };
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
