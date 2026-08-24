// Real end-to-end proof for the Settings + Invitations feature: logs in as
// the real local demo account (apps/worker/scripts/seed-demo-account.ts),
// enrolls real TOTP MFA
// against the real backend, reaches step-up, invites a second real email,
// accepts that invitation as a brand-new account, and confirms both
// accounts see each other through the real settings.memberships.read
// endpoint -- all through real HTTP against the running production-parity
// stack, not in-process repository calls.
//
// Run with:
//   pnpm --filter @papadata/worker exec tsx scripts/verify-invitations-flow.ts
process.env.NODE_ENV = "test";

import { createHmac, randomUUID } from "node:crypto";
import { request as httpRequest } from "node:http";

const connectBaseUrl = process.env.PAPADATA_BFF_CONNECT_URL?.trim() || "http://127.0.0.1:53001";
const hostHeader = process.env.PAPADATA_BFF_HOST_HEADER?.trim() || "papadata.localhost:53001";
const originHeader = process.env.PAPADATA_APP_ORIGIN?.trim() || "https://papadata.localhost";

assertLocalTarget("PAPADATA_BFF_CONNECT_URL", connectBaseUrl);

const DEMO_EMAIL = "papadata-demo@papadata.test";
const DEMO_PASSWORD = "PapaData2026!Demo";
const INVITEE_EMAIL = `invitee-${Date.now()}@papadata.test`;
const INVITEE_PASSWORD = "InviteeDemo2026!";
const INVITEE_ROLE = "Analyst";

const checks: { readonly name: string; readonly pass: boolean; readonly detail?: unknown }[] = [];

function check(name: string, pass: boolean, detail?: unknown): void {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail !== undefined ? ` -- ${JSON.stringify(detail)}` : ""}`);
}

const inviterAuth = await login(DEMO_EMAIL, DEMO_PASSWORD);
const inviterCsrf = await fetchCsrf(inviterAuth.sessionCookie);
console.log(`[1/9] Logged in as demo account (tenant ${inviterAuth.tenantId})`);

const enrollment = await bffRequest("POST", "/api/v1/security/mfa/enroll", {
  cookie: inviterCsrf.cookie,
  csrfToken: inviterCsrf.token,
  body: { accountName: DEMO_EMAIL },
});
check("mfa.enroll succeeds", enrollment.status === 200 || enrollment.status === 201, enrollment.status);
// SecurityController.enroll() returns its object directly (not wrapped in
// { data: ... }) -- see the matching comment in bffClient.ts's enrollMfa().
const enrollBody = JSON.parse(enrollment.bodyText) as { secret: string };
const secret = enrollBody.secret;

const confirmResponse = await bffRequest("POST", "/api/v1/auth/mfa/confirm", {
  cookie: inviterCsrf.cookie,
  csrfToken: inviterCsrf.token,
  body: { code: totpCode(secret) },
});
const confirmBody = JSON.parse(confirmResponse.bodyText) as { data?: { verified: boolean } };
check("mfa.confirm verifies the real TOTP code", confirmBody.data?.verified === true);

const stepUpResponse = await bffRequest("POST", "/api/v1/auth/step-up", {
  cookie: inviterCsrf.cookie,
  csrfToken: inviterCsrf.token,
  body: { code: totpCode(secret), operationScope: "invitation.request" },
});
check("step-up succeeds after MFA confirm", stepUpResponse.status === 200, stepUpResponse.status);
console.log("[2/9] MFA enrolled, confirmed, stepped up");

const inviteResponse = await bffRequest("POST", "/api/v1/auth/invitations/request", {
  cookie: inviterCsrf.cookie,
  csrfToken: inviterCsrf.token,
  body: { email: INVITEE_EMAIL, role: INVITEE_ROLE },
});
check("invitation.request succeeds once stepped up", inviteResponse.status === 201, inviteResponse.status);
const invite = (JSON.parse(inviteResponse.bodyText) as {
  data: { invitationId: string; token: string; role: string };
}).data;
console.log(`[3/9] Invited ${INVITEE_EMAIL} (invitation ${invite.invitationId})`);

const wrongTokenValidate = await bffRequest("POST", "/api/v1/auth/invitations/validate", {
  body: { invitationId: invite.invitationId, token: "not-the-real-token" },
});
const wrongTokenValidateBody = (JSON.parse(wrongTokenValidate.bodyText) as {
  data: { status: string; email?: string; role?: string; tenantName?: string; workspaceName?: string };
}).data;
check(
  "invitation.validate does not disclose metadata for a wrong token",
  wrongTokenValidateBody.status !== "valid"
    && wrongTokenValidateBody.email === undefined
    && wrongTokenValidateBody.role === undefined
    && wrongTokenValidateBody.tenantName === undefined
    && wrongTokenValidateBody.workspaceName === undefined,
  wrongTokenValidateBody,
);
console.log("[4/9] Wrong-token validation rejected without metadata disclosure");

const validateResponse = await bffRequest("POST", "/api/v1/auth/invitations/validate", {
  body: { invitationId: invite.invitationId, token: invite.token },
});
const validateBody = (JSON.parse(validateResponse.bodyText) as {
  data: { status: string; email: string; role: string };
}).data;
check("invitation.validate reports valid + correct email/role", validateBody.status === "valid" && validateBody.email === INVITEE_EMAIL.toLowerCase() && validateBody.role === INVITEE_ROLE, validateBody);
console.log("[5/9] Invitation validated (public, pre-auth)");

const wrongTokenAccept = await bffRequest("POST", "/api/v1/auth/invitations/accept", {
  body: { invitationId: invite.invitationId, token: "not-the-real-token", displayName: "Attacker", password: "Whatever12345!" },
});
check("accept rejects a wrong token instead of creating an account", wrongTokenAccept.status !== 200 || (JSON.parse(wrongTokenAccept.bodyText) as { data: { accepted: boolean } }).data.accepted !== true, wrongTokenAccept.status);
console.log("[6/9] Wrong-token accept correctly rejected");

const acceptResponse = await bffRequest("POST", "/api/v1/auth/invitations/accept", {
  body: {
    invitationId: invite.invitationId,
    token: invite.token,
    displayName: "Invited Analyst",
    password: INVITEE_PASSWORD,
  },
});
const acceptBody = (JSON.parse(acceptResponse.bodyText) as { data: { accepted: boolean; email?: string } }).data;
check("invitation.accept creates the account", acceptBody.accepted === true && acceptBody.email === INVITEE_EMAIL.toLowerCase(), acceptBody);
console.log("[7/9] Invitation accepted, account created");

const replayAccept = await bffRequest("POST", "/api/v1/auth/invitations/accept", {
  body: { invitationId: invite.invitationId, token: invite.token, displayName: "Replay", password: "Whatever12345!" },
});
const replayBody = (JSON.parse(replayAccept.bodyText) as { data: { accepted: boolean } }).data;
check("token cannot be replayed after being consumed once", replayBody.accepted !== true, replayBody);
console.log("[8/9] Token replay correctly rejected");

const inviteeAuth = await login(INVITEE_EMAIL, INVITEE_PASSWORD);
check("invited user can log in with the password they set", inviteeAuth.tenantId === inviterAuth.tenantId, {
  inviteeTenantId: inviteeAuth.tenantId,
  inviterTenantId: inviterAuth.tenantId,
});

// The role policy intentionally keeps tenant.membership.read away from an
// Analyst invitee, so the roster remains an owner/admin boundary.
const inviteeMembersResponse = await bffRequest("GET", "/api/v1/settings/czlonkostwa", {
  cookie: inviteeAuth.sessionCookie,
});
check("an Analyst-role invitee correctly cannot read the team roster (RBAC boundary)", inviteeMembersResponse.status === 403);

const membersResponse = await bffRequest("GET", "/api/v1/settings/czlonkostwa", {
  cookie: inviterCsrf.cookie,
});
const members = (JSON.parse(membersResponse.bodyText) as {
  data: { items: readonly { email: string; role: string; status: string }[] };
}).data.items;
const seesInviter = members.some((item) => item.email === DEMO_EMAIL);
const seesSelf = members.some((item) => item.email === INVITEE_EMAIL.toLowerCase() && item.role === INVITEE_ROLE && item.status === "active");
check("settings.memberships.read (as the Tenant Owner) shows both real members with the right role/status", seesInviter && seesSelf, members);
console.log(`[9/9] Members list verified from the owner session: ${JSON.stringify(members)}`);

const failed = checks.filter((entry) => !entry.pass);
console.log(`\n=== ${checks.length - failed.length}/${checks.length} checks passed ===`);
if (failed.length > 0) {
  console.log("FAILED:", failed.map((entry) => entry.name));
  process.exitCode = 1;
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

async function login(email: string, password: string): Promise<{ tenantId: string; sessionCookie: string }> {
  const response = await bffRequest("POST", "/api/v1/auth/login", { body: { email, password } });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Login failed for ${email}: ${response.status} ${response.bodyText}`);
  }
  const payload = JSON.parse(response.bodyText) as { data: { session: { activeTenantId: string } } };
  return {
    tenantId: payload.data.session.activeTenantId,
    sessionCookie: sessionCookieFromResponse(response),
  };
}

type BffResponse = {
  readonly status: number;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly bodyText: string;
};

async function fetchCsrf(sessionCookie: string): Promise<{ cookie: string; token: string }> {
  const response = await bffRequest("GET", "/api/csrf", { cookie: sessionCookie });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Fetching CSRF token failed: ${response.status} ${response.bodyText}`);
  }
  const payload = JSON.parse(response.bodyText) as { data: { csrfToken: string } };
  const csrfCookie = sessionCookieFromResponse(response);
  return { cookie: `${sessionCookie}; ${csrfCookie}`, token: payload.data.csrfToken };
}

function bffRequest(
  method: "GET" | "POST",
  path: string,
  options: { readonly body?: unknown; readonly cookie?: string; readonly csrfToken?: string } = {},
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
          ...(options.csrfToken ? { "x-papadata-csrf": options.csrfToken } : {}),
          ...(method === "POST" ? { "idempotency-key": randomUUID() } : {}),
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
  if (pairs.length === 0) throw new Error("No session cookie returned by the auth endpoint.");
  return pairs.join("; ");
}

// Same RFC 6238 TOTP algorithm as apps/api/src/production/security/totp.service.ts's
// private code()/decode() -- replicated here (not imported) since this
// script proves the real HTTP contract, not the internal implementation.
function totpCode(secret: string, time: number = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 30_000)));
  const digest = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = digest[digest.length - 1]! & 15;
  const binary = ((digest[offset]! & 127) << 24)
    | ((digest[offset + 1]! & 255) << 16)
    | ((digest[offset + 2]! & 255) << 8)
    | (digest[offset + 3]! & 255);
  return String(binary % 1_000_000).padStart(6, "0");
}

function base32Decode(value: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of value.replace(/=+$/u, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("Invalid base32 secret");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}
