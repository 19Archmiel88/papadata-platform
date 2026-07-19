import type { TenantContext } from './tenant';
import type { UserId } from './ids';

export type Role =
  | 'organization_owner'
  | 'workspace_admin'
  | 'analyst'
  | 'marketing_operator'
  | 'viewer'
  | 'billing_admin'
  | 'auditor_security'
  | 'internal_support_operations';

export type Capability = string & {
  readonly __brand: 'Capability';
};

export function asCapability(value: string): Capability {
  return value as Capability;
}

export type DataScope =
  | 'none'
  | 'own'
  | 'workspace'
  | 'organization';

export type ActorContext = TenantContext & {
  actorId: UserId;
  capabilities?: readonly Capability[];
  dataScope?: DataScope;
  roles: readonly Role[];
};

export type AccessDecision =
  | {
      allowed: false;
      capabilities: readonly [];
      dataScope: 'none';
      reason: 'policy_not_configured' | 'missing_capability' | 'outside_scope';
    }
  | {
      allowed: true;
      capabilities: readonly Capability[];
      dataScope: Exclude<DataScope, 'none'>;
      reason: 'granted_by_policy';
    };

export const denyByDefaultAccessDecision = {
  allowed: false,
  capabilities: [],
  dataScope: 'none',
  reason: 'policy_not_configured',
} as const satisfies AccessDecision;
