import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";

import { createAuthHttpRuntime } from "./authHttpRuntime.mjs";
import { authCookieNames, csrfHeaderName } from "./src/auth/authCore.ts";

describe("backend tenant/workspace access HTTP runtime", { concurrency: false }, () => {
  let runtime;
  let baseUrl;
  let now;

  beforeEach(async () => {
    const allowedHosts = [];
    const allowedOrigins = [];

    now = createMonotonicNow();

    runtime = createAuthHttpRuntime({
      allowedHosts,
      allowedOrigins,
      exposeLocalTestRoutes: true,
      now,
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

  test("cross-tenant blokuje odczyt readiness obcego workspace", async () => {
    const ownerA = new CookieJar();
    const ownerB = new CookieJar();
    await registerLogin(ownerA, "owner-a@example.com");
    await registerLogin(ownerB, "owner-b@example.com");
    await bootstrap(ownerA, "Tenant A", "Workspace A");
    const second = await bootstrap(ownerB, "Tenant B", "Workspace B");

    const response = await apiRequest(
      ownerA,
      "GET",
      `/v1/workspaces/${second.workspace.workspaceId}/readiness`,
    );

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  test("cross-workspace blokuje uzycie workspace bez czlonkostwa", async () => {
    const owner = new CookieJar();
    const admin = new CookieJar();
    await registerLogin(owner, "tenant-owner@example.com");
    const bootstrapped = await bootstrap(owner, "Shared Tenant", "Main Workspace");
    const secondWorkspace = await apiRequest(owner, "POST", "/v1/workspaces", {
      name: "Second Workspace",
      tenantId: bootstrapped.tenant.tenantId,
    });
    assert.equal(secondWorkspace.status, 201);
    const invitation = await runtime.accessService.createInvitationForTest({
      email: "workspace-admin@example.com",
      invitedByUserId: bootstrapped.membership.userId,
      role: "Workspace Admin",
      tenantId: bootstrapped.tenant.tenantId,
      workspaceId: bootstrapped.workspace.workspaceId,
    });
    await registerLogin(admin, "workspace-admin@example.com");
    const accepted = await apiRequest(admin, "POST", "/v1/invitations/accept", {
      invitationToken: invitation.token,
    });
    assert.equal(accepted.status, 200);

    const response = await apiRequest(
      admin,
      "GET",
      `/v1/workspaces/${secondWorkspace.body.data.workspace.workspaceId}/readiness`,
    );

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  test("IDOR blokuje revoke zaproszenia z obcego tenanta", async () => {
    const ownerA = new CookieJar();
    const ownerB = new CookieJar();
    await registerLogin(ownerA, "idor-a@example.com");
    await registerLogin(ownerB, "idor-b@example.com");
    const first = await bootstrap(ownerA, "IDOR Tenant A", "Workspace A");
    await bootstrap(ownerB, "IDOR Tenant B", "Workspace B");
    const invitation = await runtime.accessService.createInvitationForTest({
      email: "victim@example.com",
      invitedByUserId: first.membership.userId,
      role: "Viewer",
      tenantId: first.tenant.tenantId,
      workspaceId: first.workspace.workspaceId,
    });

    const response = await apiRequest(
      ownerB,
      "POST",
      `/v1/invitations/${invitation.invitationId}/revoke`,
    );

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  test("wygasle zaproszenie nie przechodzi walidacji", async () => {
    const owner = new CookieJar();
    const anonymous = new CookieJar();
    await registerLogin(owner, "expired-owner@example.com");
    const bootstrapped = await bootstrap(owner, "Expired Tenant", "Expired Workspace");
    const invitation = await runtime.accessService.createInvitationForTest({
      email: "expired@example.com",
      invitedByUserId: bootstrapped.membership.userId,
      role: "Viewer",
      tenantId: bootstrapped.tenant.tenantId,
      ttlMs: -1_000,
      workspaceId: bootstrapped.workspace.workspaceId,
    });
    await csrf(anonymous);

    const response = await apiRequest(anonymous, "POST", "/v1/invitations/validate", {
      email: "expired@example.com",
      invitationToken: invitation.token,
    });

    assert.equal(response.status, 410);
    assert.equal(response.body.error.code, "INVITATION_EXPIRED");
  });

  test("ponowne uzycie zaproszenia jest odrzucane", async () => {
    const owner = new CookieJar();
    const invited = new CookieJar();
    await registerLogin(owner, "reuse-owner@example.com");
    const bootstrapped = await bootstrap(owner, "Reuse Tenant", "Reuse Workspace");
    const invitation = await runtime.accessService.createInvitationForTest({
      email: "reuse@example.com",
      invitedByUserId: bootstrapped.membership.userId,
      role: "Analyst",
      tenantId: bootstrapped.tenant.tenantId,
      workspaceId: bootstrapped.workspace.workspaceId,
    });
    await registerLogin(invited, "reuse@example.com");
    const accepted = await apiRequest(invited, "POST", "/v1/invitations/accept", {
      invitationToken: invitation.token,
    });

    const reused = await apiRequest(invited, "POST", "/v1/invitations/accept", {
      invitationToken: invitation.token,
    });

    assert.equal(accepted.status, 200);
    assert.equal(reused.status, 409);
    assert.equal(reused.body.error.code, "INVITATION_USED");
  });

  test("bledny e-mail nie moze zaakceptowac zaproszenia", async () => {
    const owner = new CookieJar();
    const wrongUser = new CookieJar();
    await registerLogin(owner, "wrong-email-owner@example.com");
    const bootstrapped = await bootstrap(owner, "Wrong Email Tenant", "Workspace");
    const invitation = await runtime.accessService.createInvitationForTest({
      email: "expected@example.com",
      invitedByUserId: bootstrapped.membership.userId,
      role: "Viewer",
      tenantId: bootstrapped.tenant.tenantId,
      workspaceId: bootstrapped.workspace.workspaceId,
    });
    await registerLogin(wrongUser, "other@example.com");

    const response = await apiRequest(wrongUser, "POST", "/v1/invitations/accept", {
      invitationToken: invitation.token,
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "INVITATION_EMAIL_MISMATCH");
  });

  test("brak capability blokuje mutacje onboardingu", async () => {
    const owner = new CookieJar();
    const viewer = new CookieJar();
    await registerLogin(owner, "viewer-owner@example.com");
    const bootstrapped = await bootstrap(owner, "Viewer Tenant", "Viewer Workspace");
    const invitation = await runtime.accessService.createInvitationForTest({
      email: "viewer@example.com",
      invitedByUserId: bootstrapped.membership.userId,
      role: "Viewer",
      tenantId: bootstrapped.tenant.tenantId,
      workspaceId: bootstrapped.workspace.workspaceId,
    });
    await registerLogin(viewer, "viewer@example.com");
    await apiRequest(viewer, "POST", "/v1/invitations/accept", {
      invitationToken: invitation.token,
    });

    const response = await apiRequest(viewer, "PUT", "/v1/onboarding/company", {
      companyName: "Viewer Company",
      country: "PL",
      legalName: "Viewer Company sp. z o.o.",
      taxId: "PL123",
      website: "https://example.com",
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "CAPABILITY_REQUIRED");
  });

  test("zablokowany workspace blokuje readiness", async () => {
    const owner = new CookieJar();
    await registerLogin(owner, "blocked-owner@example.com");
    const bootstrapped = await bootstrap(owner, "Blocked Tenant", "Blocked Workspace");
    await runtime.accessService.setWorkspaceStatusForTest(
      bootstrapped.workspace.workspaceId,
      "blocked",
      testContext(),
    );

    const response = await apiRequest(
      owner,
      "GET",
      `/v1/workspaces/${bootstrapped.workspace.workspaceId}/readiness`,
    );

    assert.equal(response.status, 423);
    assert.equal(response.body.error.code, "WORKSPACE_BLOCKED");
  });

  test("wybor obcego workspace jest odrzucany", async () => {
    const ownerA = new CookieJar();
    const ownerB = new CookieJar();
    await registerLogin(ownerA, "select-a@example.com");
    await registerLogin(ownerB, "select-b@example.com");
    await bootstrap(ownerA, "Select Tenant A", "Select Workspace A");
    const second = await bootstrap(ownerB, "Select Tenant B", "Select Workspace B");

    const response = await apiRequest(ownerA, "POST", "/v1/auth/context/select", {
      tenantId: second.tenant.tenantId,
      workspaceId: second.workspace.workspaceId,
    });

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  async function registerLogin(targetJar, email) {
    await csrf(targetJar);
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
      origin: baseUrl,
      "user-agent": "node-test",
      cookie: targetJar.cookieHeader(),
      [csrfHeaderName]: targetJar.get(authCookieNames.csrf) ?? "",
    };
    const response = await fetch(`${baseUrl}${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    });
    targetJar.store(response.headers.getSetCookie());

    return {
      body: await response.json(),
      status: response.status,
    };
  }

  async function latestOutbox(email, purpose) {
    const messages = (await runtime.service.getSnapshot()).emailOutbox.filter(
      (message) => message.email === email && message.purpose === purpose,
    );

    assert.ok(messages.length > 0, `Missing outbox message for ${email}:${purpose}`);
    return messages[messages.length - 1];
  }

  function testContext() {
    return {
      correlationId: "corr_test",
      ip: "127.0.0.1",
      now: now(),
      userAgent: "node-test",
    };
  }
});

function createMonotonicNow() {
  const wallClockOriginMs = Date.now();
  const monotonicOriginNs =
    process.hrtime.bigint();

  return () => {
    const elapsedNs =
      process.hrtime.bigint()
      - monotonicOriginNs;

    const elapsedMs = Number(
      elapsedNs / 1_000_000n,
    );

    return new Date(
      wallClockOriginMs + elapsedMs,
    );
  };
}

class CookieJar {
  #cookies = new Map();

  cookieHeader() {
    return [...this.#cookies.entries()]
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join("; ");
  }

  get(name) {
    return this.#cookies.get(name);
  }

  store(headers) {
    for (const header of headers) {
      const [cookiePair] = header.split(";");
      const [name, ...value] = cookiePair.split("=");

      if (!name) {
        continue;
      }

      if (header.includes("Max-Age=0")) {
        this.#cookies.delete(name);
      } else {
        this.#cookies.set(name, decodeURIComponent(value.join("=")));
      }
    }
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
      } else {
        resolve();
      }
    });
  });
}
