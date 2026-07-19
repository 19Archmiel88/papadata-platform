import { describe, expect, it } from 'vitest';

import {
  localAuthCapabilities,
  localAuthFixturePasswords,
  localAuthOwnerActor,
} from '../fixtures/auth-domain';
import { createLocalAuthGateway } from './localAuthGateway';

describe('local auth gateway integration flows', () => {
  it('runs login to MFA to active session', async () => {
    const gateway = await createLocalAuthGateway();
    const login = await gateway.signIn({
      email: 'owner@northstar.example',
      password: localAuthFixturePasswords.owner,
      returnUrl: '/dashboard',
    });

    expect(login.status).toBe('mfa_required');

    if (login.status !== 'mfa_required') {
      return;
    }

    const verified = await gateway.verifyMfaChallenge({
      challengeId: login.challenge.challengeId,
      code: '123456',
    });

    expect(verified.status).toBe('authenticated');

    if (verified.status !== 'authenticated') {
      return;
    }

    const restored = await gateway.restoreSession(verified.session.sessionId);

    expect(restored.status).toBe('active');
    expect(verified.session.mfaSatisfied).toBe(true);
  });

  it('runs login without MFA and resolves workspace context', async () => {
    const gateway = await createLocalAuthGateway();
    const login = await gateway.signIn({
      email: 'analyst@northstar.example',
      password: localAuthFixturePasswords.analyst,
    });

    expect(login.status).toBe('authenticated');

    if (login.status !== 'authenticated') {
      return;
    }

    expect(login.context.status).toBe('workspace_selected');
  });

  it('detects revoked session reuse on refresh and keeps logout safe', async () => {
    const gateway = await createLocalAuthGateway();
    const login = await gateway.signIn({
      email: 'analyst@northstar.example',
      password: localAuthFixturePasswords.analyst,
    });

    expect(login.status).toBe('authenticated');

    if (login.status !== 'authenticated') {
      return;
    }

    const logout = await gateway.logout(login.session.sessionId);
    const refresh = await gateway.refreshSession(login.session.sessionId);

    expect(logout.status).toBe('success');
    expect(refresh.status).toBe('revoked');
  });

  it('runs forgot password to reset to login with new password', async () => {
    const gateway = await createLocalAuthGateway();
    const request = await gateway.requestPasswordReset({
      email: 'viewer@northstar.example',
    });

    expect(request.status).toBe('success');

    const token = gateway
      .getTestOutbox()
      .find((message) => message.channel === 'password_reset')?.token;

    expect(token).toBeTruthy();

    if (!token) {
      return;
    }

    const reset = await gateway.resetPassword({
      confirmPassword: 'ViewerNextPassphrase123',
      newPassword: 'ViewerNextPassphrase123',
      token,
    });
    const login = await gateway.signIn({
      email: 'viewer@northstar.example',
      password: 'ViewerNextPassphrase123',
    });

    expect(reset.status).toBe('success');
    expect(login.status).toBe('authenticated');
  });

  it('handles invitation acceptance, expired invitation and email mismatch', async () => {
    const gateway = await createLocalAuthGateway();
    const accepted = await gateway.acceptInvitation({
      email: 'new-admin@northstar.example',
      password: 'InvitedAdminPassphrase123',
      token: 'invite-active-new-admin-token',
    });
    const expired = await gateway.acceptInvitation({
      email: 'expired@northstar.example',
      password: 'ExpiredInvitePassphrase123',
      token: 'invite-expired-token',
    });
    const mismatch = await gateway.acceptInvitation({
      email: 'other@northstar.example',
      password: 'MismatchInvitePassphrase123',
      token: 'invite-active-new-admin-token',
    });

    expect(accepted.status).toBe('authenticated');
    expect(expired.status).toBe('error');
    expect(mismatch.status).toBe('error');
    expect(expired.status === 'error' ? expired.error.code : undefined).toBe(
      'INVITATION_EXPIRED',
    );
    expect(mismatch.status === 'error' ? mismatch.error.code : undefined).toBe(
      'INVITATION_USED',
    );
  });

  it('requires tenant or workspace selection when context is ambiguous', async () => {
    const gateway = await createLocalAuthGateway();
    const multiTenant = await gateway.signIn({
      email: 'multi-tenant@papadata.example',
      password: localAuthFixturePasswords.multiTenant,
    });
    const multiWorkspace = await gateway.signIn({
      email: 'multi-workspace@northstar.example',
      password: localAuthFixturePasswords.multiWorkspace,
    });

    expect(multiTenant.status).toBe('authenticated');
    expect(multiWorkspace.status).toBe('authenticated');

    if (multiTenant.status !== 'authenticated' || multiWorkspace.status !== 'authenticated') {
      return;
    }

    expect(multiTenant.context.status).toBe('tenant_selection_required');
    expect(multiWorkspace.context.status).toBe('workspace_selection_required');
  });

  it('requires reauthentication before high risk session revoke', async () => {
    const gateway = await createLocalAuthGateway();
    const login = await gateway.signIn({
      email: 'owner@northstar.example',
      password: localAuthFixturePasswords.owner,
    });

    expect(login.status).toBe('mfa_required');

    if (login.status !== 'mfa_required') {
      return;
    }

    const verified = await gateway.verifyMfaChallenge({
      challengeId: login.challenge.challengeId,
      code: '123456',
    });

    expect(verified.status).toBe('authenticated');

    if (verified.status !== 'authenticated') {
      return;
    }

    const beforeReauth = await gateway.revokeOtherSessions(verified.session.sessionId);
    const reauth = await gateway.reauthenticate({
      password: localAuthFixturePasswords.owner,
      purpose: 'revoke_session',
      sessionId: verified.session.sessionId,
    });
    const afterReauth = await gateway.revokeOtherSessions(verified.session.sessionId);

    expect(beforeReauth.status).toBe('error');
    expect(beforeReauth.status === 'error' ? beforeReauth.error.code : undefined).toBe(
      'REAUTHENTICATION_REQUIRED',
    );
    expect(reauth.status).toBe('success');
    expect(afterReauth.status).toBe('success');
  });

  it('audits denied access and invitation operations', async () => {
    const gateway = await createLocalAuthGateway();
    const created = await gateway.createInvitation(localAuthOwnerActor, {
      email: 'audited@northstar.example',
      tenantId: localAuthOwnerActor.tenantId,
      requestedRole: 'viewer',
      workspaceId: localAuthOwnerActor.workspaceId,
    });

    expect(created.status).toBe('success');

    const auditTypes = gateway.getAuditEvents().map((event) => event.eventType);

    expect(auditTypes).toContain('auth.invitation_created');

    const login = await gateway.signIn({
      email: 'viewer@northstar.example',
      password: localAuthFixturePasswords.viewer,
    });

    expect(login.status).toBe('authenticated');

    if (login.status !== 'authenticated' || login.context.status !== 'workspace_selected') {
      return;
    }

    await gateway.authorizeOperation(
      login.session.sessionId,
      localAuthCapabilities.createInvitation,
      login.context.tenant,
    );

    expect(gateway.getAuditEvents().map((event) => event.eventType)).toContain(
      'auth.unauthorized_access_attempt',
    );
  });
});
