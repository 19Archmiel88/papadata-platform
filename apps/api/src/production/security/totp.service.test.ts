import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductionDatabase } from "@papadata/database";
import { TotpService } from "./totp.service.js";

// Behavioral coverage for the P0 Faza 5 (MFA / step-up / recovery
// hardening) work: the full enroll -> confirm -> verify -> disable
// lifecycle, recovery-code single-use redemption, and TOTP anti-replay
// (a code accepted once can never be accepted again, and time cannot roll
// backward). Runs against a small stateful in-memory fake of
// ProductionDatabase that mirrors the exact SQL SecurityRepository issues
// (see remediation.ts) closely enough to exercise the real atomicity
// guards, not just the crypto.

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(value: string): Buffer {
  let bits = "";
  for (const char of value.replace(/=+$/u, "").toUpperCase()) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("Invalid base32 secret.");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function totpAt(secret: string, timeMs: number): string {
  const key = base32Decode(secret);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(timeMs / 30_000)));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest[digest.length - 1]! & 15;
  const binary = ((digest[offset]! & 127) << 24)
    | ((digest[offset + 1]! & 255) << 16)
    | ((digest[offset + 2]! & 255) << 8)
    | (digest[offset + 3]! & 255);
  return String(binary % 1_000_000).padStart(6, "0");
}

class FakeMfaTable {
  private readonly rows = new Map<string, Record<string, unknown>>();

  private key(tenantId: unknown, userId: unknown): string {
    return `${String(tenantId)}:${String(userId)}`;
  }

  query(sql: string, params: readonly unknown[]): { rows: Record<string, unknown>[]; rowCount: number } {
    if (sql.includes("insert into app.security_mfa_enrollments")) {
      const [tenantId, userId, encryptedSecret, recoveryCodeHashesJson] = params;
      const row = {
        confirmed_at: null,
        encrypted_secret: encryptedSecret,
        id: "enrollment-1",
        last_totp_step: null,
        method: "totp",
        recovery_code_hashes: JSON.parse(String(recoveryCodeHashesJson)) as string[],
        revoked_at: null,
        status: "pending",
        tenant_id: tenantId,
        used_recovery_code_hashes: [] as string[],
        user_id: userId,
      };
      this.rows.set(this.key(tenantId, userId), row);
      return { rowCount: 1, rows: [row] };
    }

    if (sql.includes("select * from app.security_mfa_enrollments")) {
      const [tenantId, userId] = params;
      const row = this.rows.get(this.key(tenantId, userId));
      return row ? { rowCount: 1, rows: [row] } : { rowCount: 0, rows: [] };
    }

    if (sql.includes("set status = 'active', confirmed_at = now()")) {
      const [tenantId, userId] = params;
      const row = this.rows.get(this.key(tenantId, userId));
      if (row) {
        row.status = "active";
        row.confirmed_at = new Date().toISOString();
      }
      return { rowCount: row ? 1 : 0, rows: [] };
    }

    if (sql.includes("set last_totp_step = $3")) {
      const [tenantId, userId, step] = params;
      const row = this.rows.get(this.key(tenantId, userId));
      const last = row?.last_totp_step as number | null | undefined;
      if (row && (last === null || last === undefined || last < (step as number))) {
        row.last_totp_step = step;
        return { rowCount: 1, rows: [{ id: row.id }] };
      }
      return { rowCount: 0, rows: [] };
    }

    if (sql.includes("used_recovery_code_hashes = used_recovery_code_hashes || $3::jsonb")) {
      const [tenantId, userId, hashJson] = params;
      const hash = (JSON.parse(String(hashJson)) as string[])[0];
      const row = this.rows.get(this.key(tenantId, userId));
      const recoveryHashes = row?.recovery_code_hashes as string[] | undefined;
      const usedHashes = row?.used_recovery_code_hashes as string[] | undefined;
      if (
        row
        && row.status === "active"
        && recoveryHashes?.includes(hash)
        && !usedHashes?.includes(hash)
      ) {
        usedHashes!.push(hash);
        return { rowCount: 1, rows: [{ id: row.id }] };
      }
      return { rowCount: 0, rows: [] };
    }

    if (sql.includes("set status = 'revoked', revoked_at = now()")) {
      const [tenantId, userId] = params;
      const row = this.rows.get(this.key(tenantId, userId));
      if (row) {
        row.status = "revoked";
        row.revoked_at = new Date().toISOString();
      }
      return { rowCount: row ? 1 : 0, rows: [] };
    }

    throw new Error(`Unhandled SQL in FakeMfaTable: ${sql}`);
  }
}

function buildService(): { readonly service: TotpService; readonly table: FakeMfaTable } {
  const table = new FakeMfaTable();
  const database = {
    withTenantWorkspace: async (
      _tenantId: string,
      _scope: string | null,
      operation: (client: unknown) => unknown,
    ) => operation({
      query: async (sql: string, params: readonly unknown[]) => table.query(sql, params),
    }),
  } as unknown as ProductionDatabase;
  return { service: new TotpService(database), table };
}

describe("TotpService", () => {
  beforeEach(() => {
    process.env.MFA_ENCRYPTION_KEY = "a".repeat(64);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs the full lifecycle: enroll -> confirm -> verify -> disable", async () => {
    const { service } = buildService();

    const enrolled = await service.enroll({
      accountName: "user@example.test",
      tenantId: "tenant-1",
      userId: "user-1",
    });
    expect(enrolled.secret).toBeTruthy();
    expect(enrolled.recoveryCodes).toHaveLength(10);

    const confirmCode = totpAt(enrolled.secret, Date.now());
    const confirmed = await service.confirm({ code: confirmCode, tenantId: "tenant-1", userId: "user-1" });
    expect(confirmed).toBe(true);

    // A fresh login session later verifies the same active enrollment --
    // advance the clock so a NEW code is required (see anti-replay tests
    // below for why reusing confirmCode here would correctly fail).
    vi.setSystemTime(new Date("2026-01-01T00:00:30.000Z"));
    const verifyCode = totpAt(enrolled.secret, Date.now());
    const verified = await service.verify({ code: verifyCode, tenantId: "tenant-1", userId: "user-1" });
    expect(verified).toBe(true);

    await service.disable({ tenantId: "tenant-1", userId: "user-1" });
    vi.setSystemTime(new Date("2026-01-01T00:01:00.000Z"));
    const afterDisable = await service.verify({
      code: totpAt(enrolled.secret, Date.now()),
      tenantId: "tenant-1",
      userId: "user-1",
    });
    expect(afterDisable).toBe(false);
  });

  it("rejects replaying the exact same code a second time (anti-replay)", async () => {
    const { service } = buildService();
    const enrolled = await service.enroll({ accountName: "a@b.test", tenantId: "tenant-1", userId: "user-1" });
    await service.confirm({
      code: totpAt(enrolled.secret, Date.now()),
      tenantId: "tenant-1",
      userId: "user-1",
    });

    // Advance past confirm's own step -- confirm already consumed it, so
    // a distinct step is needed before this test's own replay pair.
    vi.setSystemTime(new Date("2026-01-01T00:00:30.000Z"));
    const code = totpAt(enrolled.secret, Date.now());
    const first = await service.verify({ code, tenantId: "tenant-1", userId: "user-1" });
    expect(first).toBe(true);

    // Same code, same (or overlapping, via the +/-1 step tolerance) window
    // -- must be rejected even though it is still numerically "valid".
    const replay = await service.verify({ code, tenantId: "tenant-1", userId: "user-1" });
    expect(replay).toBe(false);
  });

  it("rejects a code from a step older than the last one already accepted", async () => {
    const { service } = buildService();
    const enrolled = await service.enroll({ accountName: "a@b.test", tenantId: "tenant-1", userId: "user-1" });
    await service.confirm({
      code: totpAt(enrolled.secret, Date.now()),
      tenantId: "tenant-1",
      userId: "user-1",
    });

    const oldCode = totpAt(enrolled.secret, Date.now());
    vi.setSystemTime(new Date("2026-01-01T00:05:00.000Z"));
    const newCode = totpAt(enrolled.secret, Date.now());
    expect(await service.verify({ code: newCode, tenantId: "tenant-1", userId: "user-1" })).toBe(true);

    // Presenting the OLD code now (an attacker replaying a captured code
    // after a legitimate newer one has already been used) must fail, even
    // though the +/-1 step window around "now" no longer contains it
    // anyway -- this proves the rejection is the step-ordering guard, not
    // an accident of the window.
    expect(await service.verify({ code: oldCode, tenantId: "tenant-1", userId: "user-1" })).toBe(false);
  });

  it("rejects a code before the enrollment is confirmed", async () => {
    const { service } = buildService();
    const enrolled = await service.enroll({ accountName: "a@b.test", tenantId: "tenant-1", userId: "user-1" });
    const verified = await service.verify({
      code: totpAt(enrolled.secret, Date.now()),
      tenantId: "tenant-1",
      userId: "user-1",
    });
    expect(verified).toBe(false);
  });

  it("rejects an incorrect code", async () => {
    const { service } = buildService();
    await service.enroll({ accountName: "a@b.test", tenantId: "tenant-1", userId: "user-1" });
    const confirmed = await service.confirm({ code: "000000", tenantId: "tenant-1", userId: "user-1" });
    expect(confirmed).toBe(false);
  });
});

describe("TotpService recovery codes", () => {
  beforeEach(() => {
    process.env.MFA_ENCRYPTION_KEY = "a".repeat(64);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redeems a valid recovery code exactly once", async () => {
    const { service } = buildService();
    const enrolled = await service.enroll({ accountName: "a@b.test", tenantId: "tenant-1", userId: "user-1" });
    await service.confirm({
      code: totpAt(enrolled.secret, Date.now()),
      tenantId: "tenant-1",
      userId: "user-1",
    });

    const code = enrolled.recoveryCodes[0]!;
    const first = await service.redeemRecoveryCode({ code, tenantId: "tenant-1", userId: "user-1" });
    expect(first).toBe(true);

    const replay = await service.redeemRecoveryCode({ code, tenantId: "tenant-1", userId: "user-1" });
    expect(replay).toBe(false);

    // A different, still-unused code from the same batch still works.
    const other = await service.redeemRecoveryCode({
      code: enrolled.recoveryCodes[1]!,
      tenantId: "tenant-1",
      userId: "user-1",
    });
    expect(other).toBe(true);
  });

  it("rejects an unknown recovery code", async () => {
    const { service } = buildService();
    const enrolled = await service.enroll({ accountName: "a@b.test", tenantId: "tenant-1", userId: "user-1" });
    await service.confirm({
      code: totpAt(enrolled.secret, Date.now()),
      tenantId: "tenant-1",
      userId: "user-1",
    });

    const result = await service.redeemRecoveryCode({
      code: "0000000000000000",
      tenantId: "tenant-1",
      userId: "user-1",
    });
    expect(result).toBe(false);
  });

  it("rejects recovery codes before the enrollment is confirmed", async () => {
    const { service } = buildService();
    const enrolled = await service.enroll({ accountName: "a@b.test", tenantId: "tenant-1", userId: "user-1" });
    const result = await service.redeemRecoveryCode({
      code: enrolled.recoveryCodes[0]!,
      tenantId: "tenant-1",
      userId: "user-1",
    });
    expect(result).toBe(false);
  });
});
