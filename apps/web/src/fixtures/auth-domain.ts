import type {
  AuthSession,
  AuthUser,
  Invitation,
  Membership,
  MfaChallenge,
  Organization,
  PasswordResetRequest,
  RecoveryCode,
  Workspace,
} from '../contracts/auth';
import type { ActorContext, Capability } from '../contracts/authz';
import { asCapability } from '../contracts/authz';
import {
  asAuthChallengeId,
  asInvitationId,
  asMembershipId,
  asOrganizationId,
  asPasswordResetId,
  asSessionId,
  asUserId,
  asWorkspaceId,
} from '../contracts/ids';

export const localAuthFixtureNow = '2026-07-19T00:00:00.000Z';

export const localAuthFixturePasswords = {
  admin: 'AdminPassphrase123',
  analyst: 'AnalystPassphrase123',
  blocked: 'BlockedPassphrase123',
  changePassword: 'ChangePasswordPassphrase123',
  multiOrg: 'MultiOrgPassphrase123',
  multiWorkspace: 'MultiWorkspacePassphrase123',
  noMembership: 'NoMembershipPassphrase123',
  owner: 'OwnerPassphrase123',
  viewer: 'ViewerPassphrase123',
} as const;

export const localAuthCapabilities = {
  acceptInvitation: asCapability('auth:invitation:accept'),
  cancelInvitation: asCapability('auth:invitation:cancel'),
  createInvitation: asCapability('auth:invitation:create'),
  listSessions: asCapability('auth:session:list'),
  reauthenticate: asCapability('auth:reauthenticate'),
  resendInvitation: asCapability('auth:invitation:resend'),
  revokeSession: asCapability('auth:session:revoke'),
} as const satisfies Record<string, Capability>;

export const localAuthOrganizations: readonly Organization[] = [
  {
    name: 'Northstar Retail',
    organizationId: asOrganizationId('org_northstar'),
    status: 'active',
  },
  {
    name: 'Baltic Direct',
    organizationId: asOrganizationId('org_baltic'),
    status: 'active',
  },
];

export const localAuthWorkspaces: readonly Workspace[] = [
  {
    name: 'Northstar Commerce',
    organizationId: asOrganizationId('org_northstar'),
    status: 'ready',
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    name: 'Northstar Brand Lab',
    organizationId: asOrganizationId('org_northstar'),
    status: 'not_ready',
    workspaceId: asWorkspaceId('wrk_northstar_lab'),
  },
  {
    name: 'Northstar Archived',
    organizationId: asOrganizationId('org_northstar'),
    status: 'blocked',
    workspaceId: asWorkspaceId('wrk_northstar_blocked'),
  },
  {
    name: 'Baltic Marketplace',
    organizationId: asOrganizationId('org_baltic'),
    status: 'ready',
    workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
  },
  {
    name: 'Baltic Empty',
    organizationId: asOrganizationId('org_baltic'),
    status: 'no_data',
    workspaceId: asWorkspaceId('wrk_baltic_empty'),
  },
];

export const localAuthUsers: readonly AuthUser[] = [
  {
    email: 'owner@northstar.example',
    fullName: 'Alicja Owner',
    mfaEnabled: true,
    status: 'active',
    userId: asUserId('usr_owner'),
  },
  {
    email: 'admin@northstar.example',
    fullName: 'Adam Admin',
    mfaEnabled: true,
    status: 'active',
    userId: asUserId('usr_admin'),
  },
  {
    email: 'analyst@northstar.example',
    fullName: 'Aneta Analyst',
    mfaEnabled: false,
    status: 'active',
    userId: asUserId('usr_analyst'),
  },
  {
    email: 'viewer@northstar.example',
    fullName: 'Wiktor Viewer',
    mfaEnabled: false,
    status: 'active',
    userId: asUserId('usr_viewer'),
  },
  {
    email: 'blocked@northstar.example',
    fullName: 'Blanka Blocked',
    mfaEnabled: false,
    status: 'blocked',
    userId: asUserId('usr_blocked'),
  },
  {
    email: 'nomembership@northstar.example',
    fullName: 'Nina No Membership',
    mfaEnabled: false,
    status: 'active',
    userId: asUserId('usr_no_membership'),
  },
  {
    email: 'multi-org@papadata.example',
    fullName: 'Marta Multi Org',
    mfaEnabled: false,
    status: 'active',
    userId: asUserId('usr_multi_org'),
  },
  {
    email: 'multi-workspace@northstar.example',
    fullName: 'Marcin Multi Workspace',
    mfaEnabled: false,
    status: 'active',
    userId: asUserId('usr_multi_workspace'),
  },
  {
    email: 'change-password@northstar.example',
    fullName: 'Celina Change Password',
    mfaEnabled: false,
    status: 'password_change_required',
    userId: asUserId('usr_change_password'),
  },
];

export const localAuthMemberships: readonly Membership[] = [
  {
    membershipId: asMembershipId('mem_owner_northstar_main'),
    organizationId: asOrganizationId('org_northstar'),
    role: 'organization_owner',
    status: 'active',
    userId: asUserId('usr_owner'),
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    membershipId: asMembershipId('mem_admin_northstar_main'),
    organizationId: asOrganizationId('org_northstar'),
    role: 'workspace_admin',
    status: 'active',
    userId: asUserId('usr_admin'),
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    membershipId: asMembershipId('mem_analyst_northstar_main'),
    organizationId: asOrganizationId('org_northstar'),
    role: 'analyst',
    status: 'active',
    userId: asUserId('usr_analyst'),
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    membershipId: asMembershipId('mem_viewer_northstar_main'),
    organizationId: asOrganizationId('org_northstar'),
    role: 'viewer',
    status: 'active',
    userId: asUserId('usr_viewer'),
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    membershipId: asMembershipId('mem_multi_org_northstar'),
    organizationId: asOrganizationId('org_northstar'),
    role: 'analyst',
    status: 'active',
    userId: asUserId('usr_multi_org'),
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    membershipId: asMembershipId('mem_multi_org_baltic'),
    organizationId: asOrganizationId('org_baltic'),
    role: 'analyst',
    status: 'active',
    userId: asUserId('usr_multi_org'),
    workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
  },
  {
    membershipId: asMembershipId('mem_multi_workspace_main'),
    organizationId: asOrganizationId('org_northstar'),
    role: 'workspace_admin',
    status: 'active',
    userId: asUserId('usr_multi_workspace'),
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    membershipId: asMembershipId('mem_multi_workspace_lab'),
    organizationId: asOrganizationId('org_northstar'),
    role: 'workspace_admin',
    status: 'active',
    userId: asUserId('usr_multi_workspace'),
    workspaceId: asWorkspaceId('wrk_northstar_lab'),
  },
];

export const localAuthSessions: readonly AuthSession[] = [
  {
    clientLabel: 'Chrome na Linux',
    createdAt: '2026-07-19T00:00:00.000Z',
    currentTenant: {
      organizationId: asOrganizationId('org_northstar'),
      workspaceId: asWorkspaceId('wrk_northstar_main'),
    },
    expiresAt: '2026-07-19T00:30:00.000Z',
    idleExpiresAt: '2026-07-19T00:15:00.000Z',
    lastActivityAt: '2026-07-19T00:00:00.000Z',
    mfaSatisfied: true,
    reauthenticatedUntil: '2026-07-19T00:05:00.000Z',
    sessionId: asSessionId('ses_owner_active'),
    status: 'active',
    userId: asUserId('usr_owner'),
  },
  {
    clientLabel: 'Safari na macOS',
    createdAt: '2026-07-18T23:45:00.000Z',
    currentTenant: {
      organizationId: asOrganizationId('org_northstar'),
      workspaceId: asWorkspaceId('wrk_northstar_main'),
    },
    expiresAt: '2026-07-19T00:04:00.000Z',
    idleExpiresAt: '2026-07-19T00:04:00.000Z',
    lastActivityAt: '2026-07-18T23:50:00.000Z',
    mfaSatisfied: true,
    sessionId: asSessionId('ses_owner_expiring'),
    status: 'expiring',
    userId: asUserId('usr_owner'),
  },
  {
    clientLabel: 'Firefox na Linux',
    createdAt: '2026-07-18T20:00:00.000Z',
    expiresAt: '2026-07-18T20:30:00.000Z',
    idleExpiresAt: '2026-07-18T20:15:00.000Z',
    lastActivityAt: '2026-07-18T20:10:00.000Z',
    mfaSatisfied: false,
    sessionId: asSessionId('ses_owner_expired'),
    status: 'expired',
    userId: asUserId('usr_owner'),
  },
  {
    clientLabel: 'Edge na Windows',
    createdAt: '2026-07-18T21:00:00.000Z',
    expiresAt: '2026-07-18T21:30:00.000Z',
    idleExpiresAt: '2026-07-18T21:15:00.000Z',
    lastActivityAt: '2026-07-18T21:05:00.000Z',
    mfaSatisfied: true,
    sessionId: asSessionId('ses_owner_revoked'),
    status: 'revoked',
    userId: asUserId('usr_owner'),
  },
];

export const localAuthMfaChallenges: readonly MfaChallenge[] = [
  {
    attempts: 0,
    challengeId: asAuthChallengeId('mfa_active_owner'),
    expiresAt: '2026-07-19T00:05:00.000Z',
    method: 'totp_dev',
    status: 'active',
    userId: asUserId('usr_owner'),
  },
  {
    attempts: 3,
    challengeId: asAuthChallengeId('mfa_limited_owner'),
    expiresAt: '2026-07-19T00:05:00.000Z',
    method: 'totp_dev',
    status: 'retry_limited',
    userId: asUserId('usr_owner'),
  },
  {
    attempts: 1,
    challengeId: asAuthChallengeId('mfa_expired_owner'),
    expiresAt: '2026-07-18T23:55:00.000Z',
    method: 'totp_dev',
    status: 'expired',
    userId: asUserId('usr_owner'),
  },
];

export const localAuthRecoveryCodes: Record<string, readonly RecoveryCode[]> = {
  usr_owner: [
    { codeId: 'rc_owner_1', state: 'available' },
    { codeId: 'rc_owner_2', state: 'available' },
    { codeId: 'rc_owner_3', state: 'used', usedAt: '2026-07-18T23:00:00.000Z' },
  ],
};

export const localAuthRecoveryCodeValues = {
  rc_owner_1: '101010',
  rc_owner_2: '202020',
  rc_owner_3: '303030',
} as const;

export const localAuthPasswordResets: readonly PasswordResetRequest[] = [
  {
    email: 'analyst@northstar.example',
    expiresAt: '2026-07-19T00:20:00.000Z',
    passwordResetId: asPasswordResetId('rst_active_analyst'),
    status: 'active',
    userId: asUserId('usr_analyst'),
  },
  {
    email: 'viewer@northstar.example',
    expiresAt: '2026-07-18T23:40:00.000Z',
    passwordResetId: asPasswordResetId('rst_expired_viewer'),
    status: 'expired',
    userId: asUserId('usr_viewer'),
  },
  {
    email: 'owner@northstar.example',
    expiresAt: '2026-07-19T00:20:00.000Z',
    passwordResetId: asPasswordResetId('rst_used_owner'),
    status: 'used',
    userId: asUserId('usr_owner'),
  },
];

export const localAuthPasswordResetTokens = {
  rst_active_analyst: 'reset-active-analyst-token',
  rst_expired_viewer: 'reset-expired-viewer-token',
  rst_used_owner: 'reset-used-owner-token',
} as const;

export const localAuthInvitations: readonly Invitation[] = [
  {
    createdBy: asUserId('usr_owner'),
    email: 'new-admin@northstar.example',
    expiresAt: '2026-07-26T00:00:00.000Z',
    invitationId: asInvitationId('inv_active_new_admin'),
    organizationId: asOrganizationId('org_northstar'),
    requestedRole: 'workspace_admin',
    status: 'active',
    tokenIssuedAt: '2026-07-19T00:00:00.000Z',
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    createdBy: asUserId('usr_owner'),
    email: 'expired@northstar.example',
    expiresAt: '2026-07-18T00:00:00.000Z',
    invitationId: asInvitationId('inv_expired'),
    organizationId: asOrganizationId('org_northstar'),
    requestedRole: 'viewer',
    status: 'expired',
    tokenIssuedAt: '2026-07-11T00:00:00.000Z',
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    createdBy: asUserId('usr_owner'),
    email: 'cancelled@northstar.example',
    expiresAt: '2026-07-26T00:00:00.000Z',
    invitationId: asInvitationId('inv_cancelled'),
    organizationId: asOrganizationId('org_northstar'),
    requestedRole: 'viewer',
    status: 'cancelled',
    tokenIssuedAt: '2026-07-19T00:00:00.000Z',
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    acceptedAt: '2026-07-18T22:00:00.000Z',
    createdBy: asUserId('usr_owner'),
    email: 'used@northstar.example',
    expiresAt: '2026-07-26T00:00:00.000Z',
    invitationId: asInvitationId('inv_used'),
    organizationId: asOrganizationId('org_northstar'),
    requestedRole: 'viewer',
    status: 'used',
    tokenIssuedAt: '2026-07-19T00:00:00.000Z',
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
  {
    createdBy: asUserId('usr_owner'),
    email: 'analyst@northstar.example',
    expiresAt: '2026-07-26T00:00:00.000Z',
    invitationId: asInvitationId('inv_membership_conflict'),
    organizationId: asOrganizationId('org_northstar'),
    requestedRole: 'analyst',
    status: 'active',
    tokenIssuedAt: '2026-07-19T00:00:00.000Z',
    workspaceId: asWorkspaceId('wrk_northstar_main'),
  },
];

export const localAuthInvitationTokens = {
  inv_active_new_admin: 'invite-active-new-admin-token',
  inv_cancelled: 'invite-cancelled-token',
  inv_expired: 'invite-expired-token',
  inv_membership_conflict: 'invite-membership-conflict-token',
  inv_used: 'invite-used-token',
} as const;

export const localAuthOwnerActor: ActorContext = {
  actorId: asUserId('usr_owner'),
  capabilities: [
    localAuthCapabilities.createInvitation,
    localAuthCapabilities.resendInvitation,
    localAuthCapabilities.cancelInvitation,
    localAuthCapabilities.listSessions,
    localAuthCapabilities.reauthenticate,
    localAuthCapabilities.revokeSession,
  ],
  dataScope: 'workspace',
  organizationId: asOrganizationId('org_northstar'),
  roles: ['organization_owner'],
  workspaceId: asWorkspaceId('wrk_northstar_main'),
};

export const localAuthViewerActor: ActorContext = {
  actorId: asUserId('usr_viewer'),
  capabilities: [],
  dataScope: 'none',
  organizationId: asOrganizationId('org_northstar'),
  roles: ['viewer'],
  workspaceId: asWorkspaceId('wrk_northstar_main'),
};
