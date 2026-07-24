import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createAuthHttpRuntime } from "./authHttpRuntime.mjs";
import {
  authCookieNames,
  csrfHeaderName,
} from "./src/auth/authCore.ts";
import {
  notificationTypes,
} from "./src/compliance/complianceCore.ts";

describe(
  "backend compliance HTTP runtime",
  {
    concurrency: false,
  },
  () => {
    test(
      "CMP zwraca i zapisuje kategorie cookie z wymuszonym necessary",
      async (context) => {
        const fixture = await createFixture(context);
        const jar = new CookieJar();

        await fixture.csrf(jar);
        await fixture.registerLogin(
          jar,
          "cmp@example.com",
        );
        await fixture.bootstrap(
          jar,
          "CMP Tenant",
          "CMP Workspace",
        );

        const initial = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/privacy/consent",
        );

        const updated = await fixture.apiRequest(
          jar,
          "PUT",
          "/v1/privacy/consent",
          {
            analytics: true,
            marketing: false,
            necessary: false,
            preferences: true,
          },
        );

        const after = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/privacy/consent",
        );

        assert.equal(initial.status, 200);

        assert.deepEqual(
          initial.body.data.consent.categories,
          {
            analytics: false,
            marketing: false,
            necessary: true,
            preferences: false,
          },
        );

        assert.equal(updated.status, 200);

        assert.deepEqual(
          updated.body.data.consent.categories,
          {
            analytics: true,
            marketing: false,
            necessary: true,
            preferences: true,
          },
        );

        assert.equal(
          after.body.data.consent.consentId,
          updated.body.data.consent.consentId,
        );

        const snapshot =
          await fixture.runtime.complianceService.getSnapshot();

        assert.equal(
          snapshot.auditEvents.some(
            (event) =>
              event.action === "cookie_consent.updated",
          ),
          true,
        );
      },
    );

    test(
      "dokumenty prawne sa publiczne i mozna pobrac dokument po typie",
      async (context) => {
        const fixture = await createFixture(context);
        const jar = new CookieJar();

        await fixture.csrf(jar);

        const list = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/legal/documents",
        );

        const one = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/legal/documents/privacy_notice",
        );

        const missing = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/legal/documents/not_a_document",
        );

        assert.equal(list.status, 200);
        assert.equal(
          list.body.data.documents.items.length,
          4,
        );

        assert.deepEqual(
          list.body.data.documents.items
            .map((document) => document.type)
            .sort(),
          [
            "cookie_policy",
            "data_processing_terms",
            "privacy_notice",
            "terms_of_service",
          ],
        );

        assert.equal(one.status, 200);
        assert.equal(
          one.body.data.document.type,
          "privacy_notice",
        );
        assert.equal(missing.status, 404);
      },
    );

    test(
      "akceptacje prawne wymagaja aktywnego kontekstu i sa idempotentne",
      async (context) => {
        const fixture = await createFixture(context);
        const jar = new CookieJar();

        await fixture.csrf(jar);
        await fixture.registerLogin(
          jar,
          "legal@example.com",
        );

        const rejected = await fixture.apiRequest(
          jar,
          "POST",
          "/v1/legal/acceptances",
          {
            type: "privacy_notice",
          },
        );

        const bootstrapped = await fixture.bootstrap(
          jar,
          "Legal Tenant",
          "Legal Workspace",
        );

        const accepted = await fixture.apiRequest(
          jar,
          "POST",
          "/v1/legal/acceptances",
          {
            type: "privacy_notice",
            version: "2026-07",
          },
        );

        const repeated = await fixture.apiRequest(
          jar,
          "POST",
          "/v1/legal/acceptances",
          {
            type: "privacy_notice",
            version: "2026-07",
          },
        );

        const mine = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/legal/acceptances/me",
        );

        assert.equal(rejected.status, 403);
        assert.equal(accepted.status, 201);

        assert.equal(
          accepted.body.data.acceptance.tenantId,
          bootstrapped.tenant.tenantId,
        );

        assert.equal(repeated.status, 200);

        assert.equal(
          repeated.body.data.acceptance.acceptanceId,
          accepted.body.data.acceptance.acceptanceId,
        );

        assert.equal(mine.status, 200);

        assert.equal(
          mine.body.data.acceptances.items.length,
          1,
        );

        const snapshot =
          await fixture.runtime.complianceService.getSnapshot();

        assert.equal(
          snapshot.auditEvents.some(
            (event) =>
              event.action === "legal.acceptance.created",
          ),
          true,
        );
      },
    );

    test(
      "powiadomienia sa trwalymi rekordami i obsluguja wymagane typy",
      async (context) => {
        const fixture = await createFixture(context);
        const jar = new CookieJar();

        await fixture.csrf(jar);

        const user = await fixture.registerLogin(
          jar,
          "notifications@example.com",
        );

        const bootstrapped = await fixture.bootstrap(
          jar,
          "Notifications Tenant",
          "Notifications Workspace",
        );

        for (const type of notificationTypes) {
          await fixture.runtime.complianceService
            .createNotificationForTest({
              recipientUserId: user.userId,
              resourceId: type,
              tenantId:
                bootstrapped.tenant.tenantId,
              type,
              workspaceId:
                bootstrapped.workspace.workspaceId,
            });
        }

        const listed = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/notifications",
        );

        const first =
          listed.body.data.notifications.items[0];

        assert.ok(first);

        const readOne = await fixture.apiRequest(
          jar,
          "POST",
          `/v1/notifications/${first.notificationId}/read`,
        );

        const afterOne = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/notifications",
        );

        const readAll = await fixture.apiRequest(
          jar,
          "POST",
          "/v1/notifications/read-all",
        );

        const afterAll = await fixture.apiRequest(
          jar,
          "GET",
          "/v1/notifications",
        );

        assert.equal(listed.status, 200);

        assert.deepEqual(
          listed.body.data.notifications.items
            .map((notification) => notification.type)
            .sort(),
          [...notificationTypes].sort(),
        );

        assert.equal(
          listed.body.data.unreadCount,
          notificationTypes.length,
        );

        assert.equal(readOne.status, 200);

        assert.equal(
          readOne.body.data.notification.status,
          "read",
        );

        assert.equal(
          afterOne.body.data.unreadCount,
          notificationTypes.length - 1,
        );

        assert.equal(readAll.status, 200);

        assert.equal(
          readAll.body.data.readCount,
          notificationTypes.length - 1,
        );

        assert.equal(
          afterAll.body.data.unreadCount,
          0,
        );
      },
    );

    test(
      "powiadomienie innego uzytkownika nie jest ujawniane po identyfikatorze",
      async (context) => {
        const fixture = await createFixture(context);
        const ownerJar = new CookieJar();
        const viewerJar = new CookieJar();

        await fixture.csrf(ownerJar);

        const owner = await fixture.registerLogin(
          ownerJar,
          "owner-notification@example.com",
        );

        const bootstrapped = await fixture.bootstrap(
          ownerJar,
          "Notification ID Tenant",
          "Workspace",
        );

        const invitation =
          await fixture.runtime.accessService
            .createInvitationForTest({
              email:
                "viewer-notification@example.com",
              invitedByUserId: owner.userId,
              role: "Viewer",
              tenantId:
                bootstrapped.tenant.tenantId,
              workspaceId:
                bootstrapped.workspace.workspaceId,
            });

        await fixture.csrf(viewerJar);

        await fixture.registerLogin(
          viewerJar,
          "viewer-notification@example.com",
        );

        const acceptance = await fixture.apiRequest(
          viewerJar,
          "POST",
          "/v1/invitations/accept",
          {
            invitationToken: invitation.token,
          },
        );

        assert.equal(acceptance.status, 200);

        const notification =
          await fixture.runtime.complianceService
            .createNotificationForTest({
              recipientUserId: owner.userId,
              tenantId:
                bootstrapped.tenant.tenantId,
              type: "sync_failed",
              workspaceId:
                bootstrapped.workspace.workspaceId,
            });

        const response = await fixture.apiRequest(
          viewerJar,
          "POST",
          `/v1/notifications/${notification.notificationId}/read`,
        );

        assert.equal(response.status, 404);

        assert.equal(
          response.body.error.code,
          "NOT_FOUND",
        );
      },
    );
  },
);

async function createFixture(context) {
  const allowedHosts = [];
  const allowedOrigins = [];

  const now = createMonotonicNow();

  const runtime = createAuthHttpRuntime({
    allowedHosts,
    allowedOrigins,
    exposeLocalTestRoutes: true,
    now,
  });

  await listen(runtime.server);

  const address = runtime.server.address();

  assert.equal(typeof address, "object");
  assert.ok(address);

  const baseUrl =
    `http://127.0.0.1:${address.port}`;

  allowedHosts.push(
    `127.0.0.1:${address.port}`,
  );

  allowedOrigins.push(baseUrl);

  context.after(async () => {
    await close(runtime.server);
  });

  async function apiRequest(
    targetJar,
    method,
    path,
    body = undefined,
  ) {
    const headers = {
      "content-type": "application/json",
      origin: baseUrl,
      "user-agent": "node-test",
      cookie: targetJar.cookieHeader(),
      [csrfHeaderName]:
        targetJar.get(authCookieNames.csrf) ?? "",
    };

    const response = await fetch(
      `${baseUrl}${path}`,
      {
        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
        headers,
        method,
      },
    );

    targetJar.store(
      response.headers.getSetCookie(),
    );

    return {
      body: await response.json(),
      status: response.status,
    };
  }

  async function csrf(targetJar) {
    const response = await fetch(
      `${baseUrl}/v1/auth/csrf`,
      {
        headers: {
          origin: baseUrl,
        },
      },
    );

    targetJar.store(
      response.headers.getSetCookie(),
    );

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(
      typeof body.data.csrfToken,
      "string",
    );

    return body.data.csrfToken;
  }

  async function latestOutbox(
    email,
    purpose,
  ) {
    const snapshot =
      await runtime.service.getSnapshot();

    const messages =
      snapshot.emailOutbox.filter(
        (message) =>
          message.email === email
          && message.purpose === purpose,
      );

    assert.ok(
      messages.length > 0,
      `Missing outbox message for ${email}:${purpose}`,
    );

    return messages[messages.length - 1];
  }

  async function registerLogin(
    targetJar,
    email,
  ) {
    const register = await apiRequest(
      targetJar,
      "POST",
      "/v1/auth/register",
      {
        email,
        fullName: "Test User",
        password: "correct-password",
      },
    );

    assert.equal(register.status, 201);

    const outbox = await latestOutbox(
      email,
      "email_verification",
    );

    const verify = await apiRequest(
      targetJar,
      "POST",
      "/v1/auth/email/verify",
      {
        email,
        otp: outbox.otpPreview,
      },
    );

    assert.equal(verify.status, 200);

    const login = await apiRequest(
      targetJar,
      "POST",
      "/v1/auth/login",
      {
        email,
        password: "correct-password",
      },
    );

    assert.equal(login.status, 200);

    assert.equal(
      typeof targetJar.get(
        authCookieNames.sessionId,
      ),
      "string",
      "Login did not persist pd_session.",
    );

    return login.body.data.user;
  }

  async function bootstrap(
    targetJar,
    name,
    workspaceName,
  ) {
    const registered = await apiRequest(
      targetJar,
      "POST",
      "/v1/organizations/register",
      {
        name,
      },
    );

    assert.equal(registered.status, 201);

    const verified = await apiRequest(
      targetJar,
      "POST",
      "/v1/organizations/verify",
      {
        tenantId:
          registered.body.data.tenant.tenantId,
        verificationCode:
          registered.body.data
            .verificationCodePreview,
      },
    );

    assert.equal(verified.status, 200);

    const bootstrapped = await apiRequest(
      targetJar,
      "POST",
      "/v1/organizations/bootstrap",
      {
        tenantId:
          registered.body.data.tenant.tenantId,
        workspaceName,
      },
    );

    assert.equal(bootstrapped.status, 201);

    return bootstrapped.body.data;
  }

  return {
    apiRequest,
    baseUrl,
    bootstrap,
    csrf,
    registerLogin,
    runtime,
  };
}

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
      .map(
        ([name, value]) =>
          `${name}=${encodeURIComponent(value)}`,
      )
      .join("; ");
  }

  get(name) {
    return this.#cookies.get(name);
  }

  store(headers) {
    for (const header of headers) {
      const [cookiePair] = header.split(";");
      const [name, ...value] =
        cookiePair.split("=");

      if (!name) {
        continue;
      }

      if (header.includes("Max-Age=0")) {
        this.#cookies.delete(name);
      } else {
        this.#cookies.set(
          name,
          decodeURIComponent(value.join("=")),
        );
      }
    }
  }
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(
      0,
      "127.0.0.1",
      resolve,
    );
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
