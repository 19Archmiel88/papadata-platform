import { describe, expect, it, vi } from "vitest";
import type { ProductionDatabase } from "./production.js";
import { SecurityRepository } from "./remediation.js";

// Coverage for the P0 Faza 5 (MFA / step-up / recovery hardening)
// additions: recovery-code single-use redemption, MFA disable, and TOTP
// anti-replay step tracking. These test the SQL/params shape and the
// atomicity contract (a "no row updated" result must be treated as
// rejection), mirroring password-reset-repository.test.ts's style --
// simulating Postgres's row-level-lock re-evaluation semantics isn't
// meaningful in a unit test, so what's asserted here is that the query
// itself encodes the correct WHERE-clause guard, not a live race.

function fakeDatabase(
  queryImpl: (sql: string, params: readonly unknown[]) => { rowCount: number },
): ProductionDatabase {
  const withTenantWorkspace = vi.fn(async (
    _tenantId: string,
    _scope: string | null,
    operation: (client: unknown) => unknown,
  ) => operation({
    query: async (sql: string, params: readonly unknown[]) => queryImpl(sql, params),
  }));
  return { withTenantWorkspace } as unknown as ProductionDatabase;
}

describe("SecurityRepository.redeemRecoveryCode", () => {
  it("issues an atomic UPDATE guarded by both containment checks, and reports success on a matched row", async () => {
    let capturedSql = "";
    let capturedParams: readonly unknown[] = [];
    const database = fakeDatabase((sql, params) => {
      capturedSql = sql;
      capturedParams = params;
      return { rowCount: 1 };
    });
    const repository = new SecurityRepository(database);

    const result = await repository.redeemRecoveryCode({
      tenantId: "tenant-1",
      userId: "user-1",
      codeHash: "hash-abc",
    });

    expect(result).toBe(true);
    expect(capturedSql).toMatch(/recovery_code_hashes @> \$3::jsonb/u);
    expect(capturedSql).toMatch(/not \(used_recovery_code_hashes @> \$3::jsonb\)/u);
    expect(capturedSql).toMatch(/status = 'active'/u);
    expect(capturedParams).toEqual(["tenant-1", "user-1", JSON.stringify(["hash-abc"])]);
  });

  it("reports failure (no row updated) as false rather than throwing", async () => {
    const database = fakeDatabase(() => ({ rowCount: 0 }));
    const repository = new SecurityRepository(database);

    const result = await repository.redeemRecoveryCode({
      tenantId: "tenant-1",
      userId: "user-1",
      codeHash: "already-used-or-unknown",
    });

    expect(result).toBe(false);
  });
});

describe("SecurityRepository.advanceTotpStep", () => {
  it("guards the UPDATE on last_totp_step being null or older than the presented step", async () => {
    let capturedSql = "";
    let capturedParams: readonly unknown[] = [];
    const database = fakeDatabase((sql, params) => {
      capturedSql = sql;
      capturedParams = params;
      return { rowCount: 1 };
    });
    const repository = new SecurityRepository(database);

    const result = await repository.advanceTotpStep({
      tenantId: "tenant-1",
      userId: "user-1",
      step: 12345,
    });

    expect(result).toBe(true);
    expect(capturedSql).toMatch(/last_totp_step is null or last_totp_step < \$3/u);
    expect(capturedParams).toEqual(["tenant-1", "user-1", 12345]);
  });

  it("reports false when no row matched (step not newer than the last accepted one)", async () => {
    const database = fakeDatabase(() => ({ rowCount: 0 }));
    const repository = new SecurityRepository(database);

    const result = await repository.advanceTotpStep({
      tenantId: "tenant-1",
      userId: "user-1",
      step: 100,
    });

    expect(result).toBe(false);
  });
});

describe("SecurityRepository.revokeMfaEnrollment", () => {
  it("sets status=revoked and revoked_at for the enrollment", async () => {
    let capturedSql = "";
    let capturedParams: readonly unknown[] = [];
    const database = fakeDatabase((sql, params) => {
      capturedSql = sql;
      capturedParams = params;
      return { rowCount: 1 };
    });
    const repository = new SecurityRepository(database);

    await repository.revokeMfaEnrollment("tenant-1", "user-1");

    expect(capturedSql).toMatch(/status = 'revoked', revoked_at = now\(\)/u);
    expect(capturedParams).toEqual(["tenant-1", "user-1"]);
  });
});
