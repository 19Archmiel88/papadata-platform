import { createHmac } from "node:crypto";
import type { BffConfig } from "./config.js";
import type { BffSessionRecord } from "./session-store.js";

export function signInternalPrincipalToken(
  session: BffSessionRecord,
  config: BffConfig,
  now: Date,
): string {
  const issuedAtSeconds = Math.floor(now.getTime() / 1000);
  const expiresAtSeconds = issuedAtSeconds + config.internalTokenTtlSeconds;
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({
    aud: config.internalAuthAudience,
    auth_level: session.authLevel,
    caps: session.capabilities,
    exp: expiresAtSeconds,
    iat: issuedAtSeconds,
    iss: config.internalAuthIssuer,
    memberships: session.memberships,
    sid: session.sessionId,
    step_up_expires_at: session.stepUpExpiresAt,
    sub: session.userId,
    tid: session.activeTenantId,
    wid: session.activeWorkspaceId,
  });
  const signature = createHmac("sha256", config.internalAuthActiveSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
