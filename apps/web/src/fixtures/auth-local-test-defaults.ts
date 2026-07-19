import type { AuthOperationalFieldDefaults } from './auth-experience';
import {
  localAuthFixturePasswords,
  localAuthInvitationTokens,
  localAuthPasswordResetTokens,
} from './auth-domain';

export const localTestAuthFieldDefaults: AuthOperationalFieldDefaults = {
  mfaCodes: {
    mfaChallenge: '123456',
    mfaExpired: '123456',
    mfaInvalid: '000000',
    mfaRecoveryCode: '202020',
  },
  passwords: {
    activeSessions: localAuthFixturePasswords.owner,
    contextSelection: localAuthFixturePasswords.multiWorkspace,
    forbidden: localAuthFixturePasswords.viewer,
    invitation: 'InvitedAdminPassphrase123',
    invitationEmailMismatch: 'MismatchInvitePassphrase123',
    invitationExpired: 'ExpiredInvitePassphrase123',
    invitationUsed: 'UsedInvitePassphrase123',
    login: localAuthFixturePasswords.analyst,
    loginAccountBlocked: localAuthFixturePasswords.blocked,
    loginInvalidCredentials: 'WrongPassphrase123',
    loginLoading: localAuthFixturePasswords.analyst,
    mfaChallenge: localAuthFixturePasswords.owner,
    mfaExpired: localAuthFixturePasswords.owner,
    mfaInvalid: localAuthFixturePasswords.owner,
    mfaRecoveryCode: localAuthFixturePasswords.owner,
    noMembership: localAuthFixturePasswords.noMembership,
    reauthentication: localAuthFixturePasswords.owner,
    securitySettings: localAuthFixturePasswords.owner,
    sessionExpired: localAuthFixturePasswords.owner,
    workspaceBlocked: localAuthFixturePasswords.multiWorkspace,
    workspaceNotReady: localAuthFixturePasswords.multiWorkspace,
  },
  tokens: {
    invitation: localAuthInvitationTokens.inv_active_new_admin,
    invitationEmailMismatch: localAuthInvitationTokens.inv_active_new_admin,
    invitationExpired: localAuthInvitationTokens.inv_expired,
    invitationUsed: localAuthInvitationTokens.inv_used,
    resetExpiredLink: localAuthPasswordResetTokens.rst_expired_viewer,
    resetPassword: localAuthPasswordResetTokens.rst_active_analyst,
    resetUsedLink: localAuthPasswordResetTokens.rst_used_owner,
  },
};
