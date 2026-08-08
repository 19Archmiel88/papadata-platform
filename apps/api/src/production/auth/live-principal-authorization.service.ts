import { Inject, Injectable } from "@nestjs/common";
import {
  resolveMembershipCapabilities,
  type CanonicalCapability,
} from "@papadata/contracts";
import { ProductionDatabase } from "@papadata/database";
import type { RequestPrincipal } from "./request-principal.js";

export type LiveAuthorizationDenyReason =
  | "live_capability_missing"
  | "tenant_or_workspace_not_active"
  | "workspace_membership_not_active"
  | "workspace_membership_required";

export type LiveAuthorizationDecision =
  | {
      readonly allowed: true;
      readonly grantedCapabilities: readonly CanonicalCapability[];
      readonly reason: null;
      readonly source: "live_database";
    }
  | {
      readonly allowed: false;
      readonly grantedCapabilities: readonly CanonicalCapability[];
      readonly reason: LiveAuthorizationDenyReason;
      readonly source: "live_database";
    };

type TargetWorkspaceRow = {
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

@Injectable()
export class LivePrincipalAuthorizationService {
  constructor(
    @Inject(ProductionDatabase)
    private readonly database: ProductionDatabase,
  ) {}

  async authorize(input: {
    readonly now?: Date;
    readonly principal: RequestPrincipal;
    readonly requiredCapabilities: readonly CanonicalCapability[];
  }): Promise<LiveAuthorizationDecision> {
    const now = input.now ?? new Date();
    const requiredCapabilities = [...new Set(input.requiredCapabilities)];

    return this.database.withTenantWorkspace(
      input.principal.tenantId,
      input.principal.workspaceId,
      async (client) => {
        const target = await client.query<TargetWorkspaceRow>(
          `select tenant.status as "tenantStatus",
                  workspace.status as "workspaceStatus"
             from app.workspaces as workspace
             join app.tenants as tenant
               on tenant.tenant_id = workspace.tenant_id
            where workspace.tenant_id = $1::uuid
              and workspace.workspace_id = $2::uuid
            limit 1`,
          [input.principal.tenantId, input.principal.workspaceId],
        );
        const targetRow = target.rows[0];

        if (
          !targetRow
          || targetRow.tenantStatus !== "active"
          || targetRow.workspaceStatus !== "active"
        ) {
          return deny("tenant_or_workspace_not_active", []);
        }

        const memberships = await client.query<MembershipRow>(
          `select membership.role,
                  membership.status,
                  membership.data_scope as "dataScope",
                  membership.jit_expires_at::text as "jitExpiresAt",
                  (membership.workspace_id = $2::uuid) as "exactWorkspace"
             from app.memberships as membership
            where membership.tenant_id = $1::uuid
              and membership.user_id = $3::uuid
              and (
                membership.workspace_id = $2::uuid
                or (
                  membership.role = 'Tenant Owner'
                  and membership.data_scope = 'tenant'
                )
              )
            order by
              case when membership.workspace_id = $2::uuid then 0 else 1 end,
              membership.created_at asc`,
          [
            input.principal.tenantId,
            input.principal.workspaceId,
            input.principal.userId,
          ],
        );

        const exactRows = memberships.rows.filter((row) => row.exactWorkspace);
        const hardBlockedExact = exactRows.find((row) =>
          row.status === "blocked" || row.status === "revoked",
        );

        if (hardBlockedExact) {
          return deny("workspace_membership_not_active", []);
        }

        if (memberships.rows.length === 0) {
          return deny("workspace_membership_required", []);
        }

        const grantedCapabilities = [
          ...new Set(
            memberships.rows.flatMap((membership) =>
              resolveMembershipCapabilities(membership, now),
            ),
          ),
        ];

        const missing = requiredCapabilities.filter(
          (capability) => !grantedCapabilities.includes(capability),
        );

        if (missing.length > 0) {
          return deny("live_capability_missing", grantedCapabilities);
        }

        return {
          allowed: true,
          grantedCapabilities,
          reason: null,
          source: "live_database",
        };
      },
    );
  }
}

function deny(
  reason: LiveAuthorizationDenyReason,
  grantedCapabilities: readonly CanonicalCapability[],
): LiveAuthorizationDecision {
  return {
    allowed: false,
    grantedCapabilities,
    reason,
    source: "live_database",
  };
}
