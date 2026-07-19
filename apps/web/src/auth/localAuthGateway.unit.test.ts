import { describe, expect, it } from 'vitest';

import { localAuthCapabilities, localAuthFixturePasswords } from '../fixtures/auth-domain';
import { createLocalAuthGateway } from './localAuthGateway';

function mutableClock(start: string) {
  let current = new Date(start);

  return {
    advance(milliseconds: number) {
      current = new Date(current.getTime() + milliseconds);
    },
    now() {
      return new Date(current);
    },
  };
}

describe('local auth gateway unit behavior', () => {
  it('denies protected operations by default for roles without fixture capability', async () => {
    const gateway = await createLocalAuthGateway();
    const login = await gateway.signIn({
      email: 'viewer@northstar.example',
      password: localAuthFixturePasswords.viewer,
    });

    expect(login.status).toBe('authenticated');

    if (login.status !== 'authenticated') {
      return;
    }

    if (login.context.status !== 'workspace_selected') {
      throw new Error(`Unexpected context status: ${login.context.status}`);
    }

    const decision = await gateway.authorizeOperation(
      login.session.sessionId,
      localAuthCapabilities.createInvitation,
      login.context.tenant,
    );

    expect(decision.status).toBe('error');
    expect(decision.status === 'error' ? decision.error.code : undefined).toBe('FORBIDDEN');
  });

  it('expires sessions according to local/test TTL', async () => {
    const clock = mutableClock('2026-07-19T00:00:00.000Z');
    const gateway = await createLocalAuthGateway({ now: clock.now });
    const login = await gateway.signIn({
      email: 'analyst@northstar.example',
      password: localAuthFixturePasswords.analyst,
    });

    expect(login.status).toBe('authenticated');

    if (login.status !== 'authenticated') {
      return;
    }

    clock.advance(31 * 60 * 1000);

    const restored = await gateway.restoreSession(login.session.sessionId);

    expect(restored.status).toBe('expired');
  });

  it('uses password reset tokens only once', async () => {
    const gateway = await createLocalAuthGateway();
    const first = await gateway.resetPassword({
      confirmPassword: 'NextAnalystPassphrase123',
      newPassword: 'NextAnalystPassphrase123',
      token: 'reset-active-analyst-token',
    });
    const second = await gateway.resetPassword({
      confirmPassword: 'AnotherAnalystPassphrase123',
      newPassword: 'AnotherAnalystPassphrase123',
      token: 'reset-active-analyst-token',
    });

    expect(first.status).toBe('success');
    expect(second.status).toBe('error');
    expect(second.status === 'error' ? second.error.code : undefined).toBe('RESET_TOKEN_USED');
  });

  it('uses recovery codes only once', async () => {
    const gateway = await createLocalAuthGateway();
    const firstLogin = await gateway.signIn({
      email: 'owner@northstar.example',
      password: localAuthFixturePasswords.owner,
    });

    expect(firstLogin.status).toBe('mfa_required');

    if (firstLogin.status !== 'mfa_required') {
      return;
    }

    const recoveryLogin = await gateway.verifyMfaChallenge({
      challengeId: firstLogin.challenge.challengeId,
      code: '101010',
    });

    expect(recoveryLogin.status).toBe('authenticated');

    const secondLogin = await gateway.signIn({
      email: 'owner@northstar.example',
      password: localAuthFixturePasswords.owner,
    });

    expect(secondLogin.status).toBe('mfa_required');

    if (secondLogin.status !== 'mfa_required') {
      return;
    }

    const reusedRecoveryCode = await gateway.verifyMfaChallenge({
      challengeId: secondLogin.challenge.challengeId,
      code: '101010',
    });

    expect(reusedRecoveryCode.status).toBe('error');
    expect(
      reusedRecoveryCode.status === 'error' ? reusedRecoveryCode.error.code : undefined,
    ).toBe('MFA_INVALID');
  });
});
