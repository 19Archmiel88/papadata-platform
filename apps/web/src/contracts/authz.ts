import type { Capability, DataScope, Role } from '../domain-contracts';
import { asCapability } from '../domain-contracts';
import type { UserId } from './ids';
import type { TenantContext } from './tenant';

export type { Capability, DataScope, Role };
export { asCapability };

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
