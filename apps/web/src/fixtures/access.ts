import type { Role } from '../contracts/authz';
import { denyByDefaultAccessDecision } from '../contracts/authz';

export const papaDataRoles = [
  'tenant_owner',
  'workspace_admin',
  'analyst',
  'marketing_operator',
  'viewer',
  'billing_admin',
  'auditor_security',
  'internal_support_operations',
] as const satisfies readonly Role[];

export const defaultAccessDecision = denyByDefaultAccessDecision;
