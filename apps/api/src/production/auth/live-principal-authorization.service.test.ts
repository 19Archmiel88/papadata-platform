import type { CanonicalCapability } from "@papadata/contracts";
import type { ProductionDatabase } from "@papadata/database";
import { describe, expect, it, vi } from "vitest";
import { LivePrincipalAuthorizationService } from "./live-principal-authorization.service.js";
import type { RequestPrincipal } from "./request-principal.js";

const now = new Date("2026-08-31T10:00:00.000Z");

describe("LivePrincipalAuthorizationService", () => {
  it("allows from current database role even when session capabilities are stale", async () => {
    const service = createService({
      memberships: [{
        dataScope: "workspace",
        exactWorkspace: true,
        jitExpiresAt: null,
        role: "Workspace Admin",
        status: "active",
      }],
    });

    await expect(service.authorize({
      now,
      principal: principal({ capabilities: [] }),
      requiredCapabilities: ["workspace.manage"],
    })).resolves.toMatchObject({
      allowed: true,
      grantedCapabilities: expect.arrayContaining(["workspace.manage"]),
      source: "live_database",
    });
  });

  it("denies when tenant or workspace is not active", async () => {
    const service = createService({
      target: [],
    });

    await expect(service.authorize({
      now,
      principal: principal(),
      requiredCapabilities: ["workspace.read"],
    })).resolves.toMatchObject({
      allowed: false,
      grantedCapabilities: [],
      reason: "tenant_or_workspace_not_active",
    });
  });

  it("denies missing workspace membership", async () => {
    const service = createService({
      memberships: [],
    });

    await expect(service.authorize({
      now,
      principal: principal({ workspaceId: "workspace-b" }),
      requiredCapabilities: ["workspace.read"],
    })).resolves.toMatchObject({
      allowed: false,
      reason: "workspace_membership_required",
    });
  });

  it("denies revoked or blocked exact workspace membership immediately", async () => {
    const service = createService({
      memberships: [
        {
          dataScope: "tenant",
          exactWorkspace: false,
          jitExpiresAt: null,
          role: "Tenant Owner",
          status: "active",
        },
        {
          dataScope: "workspace",
          exactWorkspace: true,
          jitExpiresAt: null,
          role: "Analyst",
          status: "blocked",
        },
      ],
    });

    await expect(service.authorize({
      now,
      principal: principal(),
      requiredCapabilities: ["workspace.read"],
    })).resolves.toMatchObject({
      allowed: false,
      grantedCapabilities: [],
      reason: "workspace_membership_not_active",
    });
  });

  it("applies dataScope changes without requiring a new login", async () => {
    const service = createService({
      memberships: [{
        dataScope: "none",
        exactWorkspace: true,
        jitExpiresAt: null,
        role: "Workspace Admin",
        status: "active",
      }],
    });

    await expect(service.authorize({
      now,
      principal: principal(),
      requiredCapabilities: ["workspace.manage"],
    })).resolves.toMatchObject({
      allowed: false,
      reason: "live_capability_missing",
    });
  });

  it("expires support JIT capabilities immediately", async () => {
    const service = createService({
      memberships: [{
        dataScope: "support_jit",
        exactWorkspace: true,
        jitExpiresAt: "2026-08-31T09:59:59.000Z",
        role: "Internal Support/Operations",
        status: "active",
      }],
    });

    await expect(service.authorize({
      now,
      principal: principal(),
      requiredCapabilities: ["audit.verify"],
    })).resolves.toMatchObject({
      allowed: false,
      grantedCapabilities: [],
      reason: "live_capability_missing",
    });
  });

  it("does not widen Billing Admin into analytics or integration write access", async () => {
    const service = createService({
      memberships: [{
        dataScope: "billing",
        exactWorkspace: true,
        jitExpiresAt: null,
        role: "Billing Admin",
        status: "active",
      }],
    });

    await expect(service.authorize({
      now,
      principal: principal(),
      requiredCapabilities: ["billing.manage"],
    })).resolves.toMatchObject({
      allowed: true,
    });

    await expect(service.authorize({
      now,
      principal: principal(),
      requiredCapabilities: ["integrations.credentials.manage"],
    })).resolves.toMatchObject({
      allowed: false,
      reason: "live_capability_missing",
    });
  });
});

type TargetRow = {
  readonly tenantStatus: string;
  readonly workspaceStatus: string;
};

type MembershipRow = {
  readonly dataScope: string;
  readonly exactWorkspace: boolean;
  readonly jitExpiresAt: string | null;
  readonly role: string;
  readonly status: string;
};

function createService(input: {
  readonly target?: readonly TargetRow[];
  readonly memberships?: readonly MembershipRow[];
}): LivePrincipalAuthorizationService {
  const target = input.target ?? [{
    tenantStatus: "active",
    workspaceStatus: "active",
  }];
  const memberships = input.memberships ?? [];

  const client = {
    query: vi.fn(async (text: string) => ({
      rows: text.includes("from app.workspaces") ? target : memberships,
    })),
  };
  const database = {
    withTenantWorkspace: vi.fn(async (
      _tenantId: string,
      _workspaceId: string,
      operation: (queryClient: typeof client) => Promise<unknown>,
    ) => operation(client)),
  } as unknown as ProductionDatabase;

  return new LivePrincipalAuthorizationService(database);
}

function principal(
  overrides: Partial<RequestPrincipal> = {},
): RequestPrincipal {
  return {
    authLevel: "step_up",
    capabilities: [] as readonly CanonicalCapability[],
    expiresAt: "2026-08-31T11:00:00.000Z",
    issuedAt: "2026-08-31T10:00:00.000Z",
    issuer: "papadata-bff",
    memberships: [],
    sessionId: "session-a",
    source: "internal_token",
    stepUpExpiresAt: "2026-08-31T10:05:00.000Z",
    tenantId: "tenant-a",
    userId: "user-a",
    workspaceId: "workspace-a",
    ...overrides,
  };
}
