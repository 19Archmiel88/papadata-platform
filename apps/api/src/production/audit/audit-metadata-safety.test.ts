import { describe, expect, it } from "vitest";
import {
  extractAuditCallBlocks,
  findDangerousMetadataKeys,
  scanRepoForAuditMetadataSafety,
} from "./audit-metadata-safety-scanner.js";

// Faza 9 §17/§18/§27 item 10: no audit event anywhere in the repo may carry
// a security-sensitive field (password, token, secret, credential, etc.)
// in its metadata.

describe("findDangerousMetadataKeys (§27 item 10: deliberately dangerous input)", () => {
  it("flags an object literal that carries a password field", () => {
    const findings = findDangerousMetadataKeys(`({ action: "test", metadata: { password: input.password } })`);
    expect(findings.map((f) => f.key)).toContain("password");
  });

  it("flags common secret-shaped key variants (snake_case, not just camelCase -- §17 explicitly requires this)", () => {
    const variants = [
      "refreshToken", "refresh_token", "accessToken", "access_token",
      "clientSecret", "client_secret", "apiKey", "api_key",
      "recoveryCode", "recovery_code", "totpSecret", "totp_secret",
      "rawBody", "raw_body", "requestBody", "request_body",
      "authorization", "cookie", "set-cookie", "credential", "otp", "secret", "token",
    ];
    for (const key of variants) {
      // A hyphenated key (e.g. "set-cookie") is not valid bare-identifier
      // object-literal syntax -- quote it, matching how it would actually
      // appear in real source.
      const keyToken = key.includes("-") ? `"${key}"` : key;
      const findings = findDangerousMetadataKeys(`({ ${keyToken}: value })`);
      expect(findings.map((f) => f.key), `expected "${key}" to be flagged`).toContain(key);
    }
  });

  it("does not flag ordinary, safe metadata keys", () => {
    const findings = findDangerousMetadataKeys(
      `({ action: "api.access.denied", metadata: { reason, requiredAuthLevel, requiredCapabilities }, outcome: "denied", resourceType: "api_endpoint" })`,
    );
    expect(findings).toHaveLength(0);
  });

  it("does not flag the reviewed-safe credentialReference (an opaque pointer, never the secret itself)", () => {
    const findings = findDangerousMetadataKeys(`({ credentialReference: input.credentialReference })`);
    expect(findings).toHaveLength(0);
  });
});

describe("extractAuditCallBlocks", () => {
  it("extracts a balanced-parens block starting at .append(", () => {
    const source = `
      await this.audit.append({
        action: "api.access.denied",
        metadata: { reason: "x" },
      });
      const unrelated = other.call(1, 2);
    `;
    const blocks = extractAuditCallBlocks(source);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toContain('action: "api.access.denied"');
    expect(blocks[0]).not.toContain("unrelated");
  });

  it("finds a dangerous key when it is actually present inside a real-shaped call", () => {
    const source = `
      await this.audit.append({
        action: "test.leaked",
        metadata: { refreshToken: session.refreshToken },
        outcome: "success",
      });
    `;
    const [block] = extractAuditCallBlocks(source);
    const findings = findDangerousMetadataKeys(block);
    expect(findings.map((f) => f.key)).toContain("refreshToken");
  });
});

describe("scanRepoForAuditMetadataSafety against the real repository", () => {
  it("finds zero dangerous metadata keys across every current audit-event writer", async () => {
    const violations = await scanRepoForAuditMetadataSafety();

    if (violations.length > 0) {
      throw new Error(
        `${violations.length} dangerous audit metadata key(s):\n`
        + violations.map((v) => `  ${v.file}: "${v.key}" (matched ${v.matchedPattern})`).join("\n"),
      );
    }
  });

  it("actually scanned real call sites (not a vacuous pass from finding nothing at all)", async () => {
    // A scanner that silently matches zero call sites would also report
    // "zero violations" -- assert it found real ones, using the two
    // handwritten call sites already covered by DeniedAccessAuditService's
    // own tests as a floor.
    const { readFile } = await import("node:fs/promises");
    const { repoRoot } = await import("./audit-metadata-safety-scanner.js");
    const source = await readFile(
      `${repoRoot}/apps/api/src/production/auth/denied-access-audit.service.ts`,
      "utf8",
    );
    expect(extractAuditCallBlocks(source).length).toBeGreaterThan(0);
  });
});
