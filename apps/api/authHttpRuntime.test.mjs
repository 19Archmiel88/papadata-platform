import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";

import { createAuthHttpRuntime } from "./authHttpRuntime.mjs";
import { authCookieNames, csrfHeaderName } from "./src/auth/authCore.ts";

describe("backend auth HTTP runtime", { concurrency: false }, () => {
  let runtime;
  let baseUrl;
  let jar;
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
      policy: {
        maxFailedLoginAttempts: 3,
        rateLimitMaxAttempts: 4,
      },
    });
    await listen(runtime.server);
    const address = runtime.server.address();
    assert.equal(typeof address, "object");
    baseUrl = `http://127.0.0.1:${address.port}`;
    allowedHosts.push(`127.0.0.1:${address.port}`);
    allowedOrigins.push(baseUrl);
    jar = new CookieJar();
  });

  afterEach(async () => {
    await close(runtime.server);
  });

  test("rejestracja i weryfikacja OTP e-mail", async () => {
    await csrf();
    const register = await request("POST", "/register", {
      email: "owner@example.com",
      fullName: "Owner Example",
      password: "correct-password",
    });

    assert.equal(register.status, 201);
    assert.equal(register.body.data.user.emailVerified, false);
    assert.equal(hasSecretLeak((await runtime.service.getSnapshot()).auditEvents), false);

    const otp = (await latestOutbox("email_verification", "owner@example.com")).otpPreview;
    const verify = await request("POST", "/email/verify", {
      email: "owner@example.com",
      otp,
    });

    assert.equal(verify.status, 200);
    assert.equal(verify.body.data.emailVerified, true);
  });

  test("logowanie ustawia HttpOnly cookies i /me zwraca sesje", async () => {
    await registeredAndVerified("login@example.com", "correct-password");
    const login = await request("POST", "/login", {
      email: "login@example.com",
      password: "correct-password",
    });

    assert.equal(login.status, 200);
    assert.equal(login.body.data.mfaRequired, false);
    assert.match(jar.rawSetCookieHeader(authCookieNames.sessionId), /HttpOnly/);
    assert.match(jar.rawSetCookieHeader(authCookieNames.refreshToken), /HttpOnly/);

    const me = await request("GET", "/me");
    assert.equal(me.status, 200);
    assert.equal(me.body.data.user.email, "login@example.com");
  });

  test("bledne haslo uruchamia lockout", async () => {
    await registeredAndVerified("locked@example.com", "correct-password");

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await request("POST", "/login", {
        email: "locked@example.com",
        password: "wrong-password",
      });
    }

    const locked = await request("POST", "/login", {
      email: "locked@example.com",
      password: "correct-password",
    });

    assert.equal(locked.status, 423);
    assert.equal(locked.body.error.code, "ACCOUNT_LOCKED");
  });

  test("rate limiting blokuje nadmiar prob logowania", async () => {
    await registeredAndVerified("rate@example.com", "correct-password");

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await request("POST", "/login", {
        email: "rate@example.com",
        password: "bad-password",
      });
    }

    const limited = await request("POST", "/login", {
      email: "rate@example.com",
      password: "bad-password",
    });

    assert.equal(limited.status, 429);
    assert.equal(limited.body.error.code, "RATE_LIMITED");
  });

  test("refresh rotuje refresh token", async () => {
    await registeredAndVerified("refresh@example.com", "correct-password");
    await request("POST", "/login", {
      email: "refresh@example.com",
      password: "correct-password",
    });
    const previousRefresh = jar.get(authCookieNames.refreshToken);

    const refresh = await request("POST", "/refresh");

    assert.equal(refresh.status, 200);
    assert.notEqual(jar.get(authCookieNames.refreshToken), previousRefresh);
  });

  test("logout uniewaznia sesje", async () => {
    await registeredAndVerified("logout@example.com", "correct-password");
    await request("POST", "/login", {
      email: "logout@example.com",
      password: "correct-password",
    });

    const logout = await request("POST", "/logout");
    const me = await request("GET", "/me");

    assert.equal(logout.status, 200);
    assert.equal(me.status, 401);
  });

  test("reset hasla wymaga tokenu i OTP", async () => {
    await registeredAndVerified("reset@example.com", "old-password-ok");
    const start = await request("POST", "/password/reset/request", {
      email: "reset@example.com",
    });

    assert.equal(start.status, 202);
    const message = await latestOutbox("password_reset", "reset@example.com");
    const confirm = await request("POST", "/password/reset/confirm", {
      email: "reset@example.com",
      newPassword: "new-password-ok",
      otp: message.otpPreview,
      resetToken: message.tokenPreview,
    });

    assert.equal(confirm.status, 200);

    const login = await request("POST", "/login", {
      email: "reset@example.com",
      password: "new-password-ok",
    });

    assert.equal(login.status, 200);
  });

  test("zmiana hasla uniewaznia inne sesje", async () => {
    await registeredAndVerified("change@example.com", "old-password-ok");
    await request("POST", "/login", {
      email: "change@example.com",
      password: "old-password-ok",
    });
    const firstSessionCookie = jar.cookieHeader();
    const secondJar = new CookieJar();
    await csrf(secondJar);
    await requestWithJar(secondJar, "POST", "/login", {
      email: "change@example.com",
      password: "old-password-ok",
    });
    const secondMe = await requestWithJar(secondJar, "GET", "/me");
    assert.equal(secondMe.status, 200);

    jar.replaceFromHeader(firstSessionCookie);
    const change = await request("POST", "/password/change", {
      currentPassword: "old-password-ok",
      newPassword: "new-password-ok",
    });

    assert.equal(change.status, 200);
    const revoked = await requestWithJar(secondJar, "GET", "/me");
    assert.equal(revoked.status, 401);
  });

  test("MFA challenge, verify i recovery code", async () => {
    await registeredAndVerified("mfa@example.com", "correct-password");
    await request("POST", "/login", {
      email: "mfa@example.com",
      password: "correct-password",
    });
    const challenge = await request("POST", "/mfa/challenge");
    const setupOtp = (await latestOutbox("mfa", "mfa@example.com")).otpPreview;
    const verify = await request("POST", "/mfa/verify", {
      challengeId: challenge.body.data.challengeId,
      otp: setupOtp,
    });

    assert.equal(verify.status, 200);
    assert.ok(verify.body.data.recoveryCodes.length > 0);
    const recoveryCode = verify.body.data.recoveryCodes[0];

    await request("POST", "/logout");
    const login = await request("POST", "/login", {
      email: "mfa@example.com",
      password: "correct-password",
    });

    assert.equal(login.status, 401);
    assert.equal(login.body.data.mfaRequired, true);

    const recovery = await request("POST", "/mfa/recovery", {
      email: "mfa@example.com",
      recoveryCode,
    });

    assert.equal(recovery.status, 200);
    assert.equal(recovery.body.data.user.mfaEnabled, true);
  });

  test("usuwanie sesji usuwa wskazana sesje", async () => {
    await registeredAndVerified("sessions@example.com", "correct-password");
    await request("POST", "/login", {
      email: "sessions@example.com",
      password: "correct-password",
    });
    const sessions = await request("GET", "/sessions");
    const current = sessions.body.data.sessions.find((session) => session.current);

    assert.ok(current);

    const deleted = await request("DELETE", `/sessions/${current.sessionId}`);
    const me = await request("GET", "/me");

    assert.equal(deleted.status, 200);
    assert.equal(me.status, 401);
  });

  test("CSRF blokuje mutacje bez tokenu", async () => {
    const rejected = await requestWithoutCsrf("POST", "/register", {
      email: "csrf@example.com",
      fullName: "CSRF Example",
      password: "correct-password",
    });

    assert.equal(rejected.status, 403);
    assert.equal(rejected.body.error.code, "CSRF_INVALID");
  });

  test("niepoprawny JSON zwraca blad walidacji zamiast awarii serwera", async () => {
    await csrf();

    const rejected = await requestRaw("POST", "/register", "{broken json");

    assert.equal(rejected.status, 400);
    assert.equal(rejected.body.error.code, "VALIDATION_FAILED");
    assert.equal(rejected.body.error.retryable, false);
    assert.equal(rejected.body.error.message, "Request body must be valid JSON.");
  });

  async function registeredAndVerified(email, password) {
    await csrf();
    await request("POST", "/register", {
      email,
      fullName: "Test User",
      password,
    });
    const otp = (await latestOutbox("email_verification", email)).otpPreview;
    await request("POST", "/email/verify", {
      email,
      otp,
    });
  }

  async function csrf(targetJar = jar) {
    const response = await fetch(`${baseUrl}/v1/auth/csrf`, {
      headers: {
        origin: baseUrl,
      },
    });
    targetJar.store(response.headers.getSetCookie());
    const body = await response.json();
    return body.data.csrfToken;
  }

  async function request(method, path, body = undefined) {
    return requestWithJar(jar, method, path, body);
  }

  async function requestWithJar(targetJar, method, path, body = undefined) {
    const headers = {
      "content-type": "application/json",
      origin: baseUrl,
      "user-agent": "node-test",
      cookie: targetJar.cookieHeader(),
      [csrfHeaderName]: targetJar.get(authCookieNames.csrf) ?? "",
    };
    const response = await fetch(`${baseUrl}/v1/auth${path}`, {
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

  async function requestWithoutCsrf(method, path, body = undefined) {
    const response = await fetch(`${baseUrl}/v1/auth${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        origin: baseUrl,
      },
      method,
    });

    return {
      body: await response.json(),
      status: response.status,
    };
  }

  async function requestRaw(method, path, body) {
    const response = await fetch(`${baseUrl}/v1/auth${path}`, {
      body,
      headers: {
        "content-type": "application/json",
        origin: baseUrl,
        "user-agent": "node-test",
        cookie: jar.cookieHeader(),
        [csrfHeaderName]: jar.get(authCookieNames.csrf) ?? "",
      },
      method,
    });
    jar.store(response.headers.getSetCookie());

    return {
      body: await response.json(),
      status: response.status,
    };
  }

  async function latestOutbox(purpose, email) {
    const messages = (await runtime.service.getSnapshot()).emailOutbox.filter(
      (message) => message.purpose === purpose && message.email === email,
    );

    assert.ok(messages.length > 0, `Missing outbox message for ${email}:${purpose}`);
    return messages[messages.length - 1];
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

  #raw = new Map();

  cookieHeader() {
    return [...this.#cookies.entries()]
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join("; ");
  }

  get(name) {
    return this.#cookies.get(name);
  }

  rawSetCookieHeader(name) {
    return this.#raw.get(name) ?? "";
  }

  replaceFromHeader(header) {
    this.#cookies = new Map();

    for (const part of header.split(";")) {
      const [name, ...value] = part.trim().split("=");

      if (name) {
        this.#cookies.set(name, decodeURIComponent(value.join("=")));
      }
    }
  }

  store(headers) {
    for (const header of headers) {
      const [cookiePair] = header.split(";");
      const [name, ...value] = cookiePair.split("=");

      if (!name) {
        continue;
      }

      this.#raw.set(name, header);

      if (header.includes("Max-Age=0")) {
        this.#cookies.delete(name);
      } else {
        this.#cookies.set(name, decodeURIComponent(value.join("=")));
      }
    }
  }
}

function hasSecretLeak(events) {
  const serialized = JSON.stringify(events);
  return /correct-password|wrong-password|old-password|new-password|otp_|rfr_|rcv_|rst_/.test(
    serialized,
  );
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
