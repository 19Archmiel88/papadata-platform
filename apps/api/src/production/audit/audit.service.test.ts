import { describe, expect, it } from "vitest";
import type { ProductionDatabase } from "@papadata/database";
import { AuditService } from "./audit.service.js";

// Faza 9 §20 regression: chainScope is pinned to tenantId (AuditService.
// append forces `chainScope: input.tenantId`), and AuditService.verify()
// independently re-checks `chainScope !== tenantId` before ever reaching
// the repository -- Tenant A must never be able to verify Tenant B's
// chain by passing Tenant B's chainScope alongside its own tenantId, or
// vice versa. This does not need a real database: the checks that matter
// here either run synchronously before AuditRepository is touched, or (for
// append) are observable as the first parameter of the first query fired.

describe("AuditService chain scope isolation", () => {
  it("append() always pins chainScope to the event's own tenantId, never anything else", async () => {
    const queries: { readonly sql: string; readonly params: readonly unknown[] }[] = [];
    const service = new AuditService(recordingDatabase(queries));

    await service.append({
      action: "test.action",
      actorId: "user-a",
      actorType: "user",
      correlationId: "corr-1",
      metadata: {},
      outcome: "success",
      resourceId: "resource-1",
      resourceType: "api_command",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
    }).catch(() => {
      // The fake client's query() only implements enough of the shape to
      // observe the first call's parameters -- later queries in append()'s
      // multi-statement flow are expected to fail against it. Only the
      // first query (the advisory lock, keyed on chainScope) is under test.
    });

    expect(queries[0]?.params[0]).toBe("tenant-a");
  });

  it("verify() rejects tenant A verifying tenant B's chainScope, before touching the repository", async () => {
    const service = new AuditService(unreachableDatabase());

    // verify() is not declared `async` and throws synchronously on
    // mismatch -- `expect(service.verify(...))` would throw while
    // *evaluating the argument*, before .rejects ever runs. Wrapping in an
    // async IIFE converts that synchronous throw into a real rejected
    // promise, the way any real (async) caller naturally experiences it.
    await expect((async () => service.verify("tenant-a", "tenant-b"))())
      .rejects.toThrow("Audit chain scope must match the authenticated tenant.");
  });

  it("verify() rejects tenant B verifying tenant A's chainScope (symmetric)", async () => {
    const service = new AuditService(unreachableDatabase());

    await expect((async () => service.verify("tenant-b", "tenant-a"))())
      .rejects.toThrow("Audit chain scope must match the authenticated tenant.");
  });

  it("verify() proceeds past the pre-check (reaches the repository) when chainScope matches tenantId", async () => {
    let reached = false;
    const service = new AuditService(recordingDatabase([], () => { reached = true; }));

    await service.verify("tenant-a", "tenant-a").catch(() => {
      // Fake repository has no real query implementation; only reaching
      // withTenantWorkspace (i.e. getting past the synchronous pre-check)
      // is under test.
    });

    expect(reached).toBe(true);
  });
});

function recordingDatabase(
  queries: { readonly sql: string; readonly params: readonly unknown[] }[],
  onReached: () => void = () => {},
): ProductionDatabase {
  return {
    withTenantWorkspace: async (
      _tenantId: string,
      _workspaceId: string | null,
      fn: (client: unknown) => unknown,
    ) => {
      onReached();
      return fn({
        query: async (sql: string, params: readonly unknown[] = []) => {
          queries.push({ params, sql });
          throw new Error("recordingDatabase: no further query implementation");
        },
      });
    },
  } as unknown as ProductionDatabase;
}

function unreachableDatabase(): ProductionDatabase {
  return {
    withTenantWorkspace: async () => {
      throw new Error("withTenantWorkspace must not be called: the chainScope pre-check should have rejected first.");
    },
  } as unknown as ProductionDatabase;
}
