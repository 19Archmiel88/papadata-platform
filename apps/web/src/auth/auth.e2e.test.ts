import { describe, expect, it } from 'vitest';

import { localAuthFixturePasswords } from '../fixtures/auth-domain';
import { createLocalAuthGateway } from './localAuthGateway';

describe('AUTH-001 deterministic local e2e scenarios', () => {
  it('invitation to account activation to workspace to dashboard context', async () => {
    const gateway = await createLocalAuthGateway();
    const accepted = await gateway.acceptInvitation({
      email: 'new-admin@northstar.example',
      password: 'InvitedAdminPassphrase123',
      token: 'invite-active-new-admin-token',
    });

    expect(accepted.status).toBe('authenticated');

    if (accepted.status !== 'authenticated') {
      return;
    }

    expect(accepted.context.status).toBe('workspace_selected');
    expect(accepted.returnUrl).toBe('/');
  });

  it('existing user login to MFA to dashboard context', async () => {
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

    expect(verified.context.status).toBe('workspace_selected');
  });

  it('forgot password to reset to another successful login', async () => {
    const gateway = await createLocalAuthGateway();

    await gateway.requestPasswordReset({ email: 'analyst@northstar.example' });

    const token = gateway
      .getTestOutbox()
      .find((message) => message.channel === 'password_reset')?.token;

    expect(token).toBeTruthy();

    if (!token) {
      return;
    }

    const reset = await gateway.resetPassword({
      confirmPassword: 'AnalystFreshPassphrase123',
      newPassword: 'AnalystFreshPassphrase123',
      token,
    });
    const login = await gateway.signIn({
      email: 'analyst@northstar.example',
      password: 'AnalystFreshPassphrase123',
    });

    expect(reset.status).toBe('success');
    expect(login.status).toBe('authenticated');
  });

  it('revoked session requires safe relogin path', async () => {
    const gateway = await createLocalAuthGateway();
    const login = await gateway.signIn({
      email: 'analyst@northstar.example',
      password: localAuthFixturePasswords.analyst,
      returnUrl: 'https://evil.example/steal',
    });

    expect(login.status).toBe('authenticated');

    if (login.status !== 'authenticated') {
      return;
    }

    await gateway.logout(login.session.sessionId);

    const restored = await gateway.restoreSession(login.session.sessionId);
    const relogin = await gateway.signIn({
      email: 'analyst@northstar.example',
      password: localAuthFixturePasswords.analyst,
      returnUrl: 'https://evil.example/steal',
    });

    expect(restored.status).toBe('revoked');
    expect(relogin.status).toBe('authenticated');

    if (relogin.status === 'authenticated') {
      expect(relogin.returnUrl).toBe('/');
    }
  });

  it('no membership and invalid invitations are explicit states', async () => {
    const gateway = await createLocalAuthGateway();
    const noMembership = await gateway.signIn({
      email: 'nomembership@northstar.example',
      password: localAuthFixturePasswords.noMembership,
    });
    const expiredInvite = await gateway.acceptInvitation({
      email: 'expired@northstar.example',
      password: 'ExpiredInvitePassphrase123',
      token: 'invite-expired-token',
    });
    const mismatchInvite = await gateway.acceptInvitation({
      email: 'someone-else@northstar.example',
      password: 'MismatchInvitePassphrase123',
      token: 'invite-active-new-admin-token',
    });

    expect(noMembership.status).toBe('authenticated');
    expect(expiredInvite.status).toBe('error');
    expect(mismatchInvite.status).toBe('error');

    if (noMembership.status === 'authenticated') {
      expect(noMembership.context.status).toBe('no_active_membership');
    }

    expect(expiredInvite.status === 'error' ? expiredInvite.error.code : undefined).toBe(
      'INVITATION_EXPIRED',
    );
    expect(mismatchInvite.status === 'error' ? mismatchInvite.error.code : undefined).toBe(
      'INVITATION_EMAIL_MISMATCH',
    );
  });
});
