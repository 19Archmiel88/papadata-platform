import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  businessOutcomeMessage,
  isOAuthProviderEnabled,
  oauthErrorMessage,
  resolvePostAuthDestination,
} from './oauthOutcomes';

test('resolvePostAuthDestination sends a single-membership account straight to returnTo', () => {
  assert.equal(resolvePostAuthDestination(1, '/app/command-center'), '/app/command-center');
});

test('resolvePostAuthDestination sends a multi-membership account to /select-workspace, carrying returnTo forward', () => {
  const destination = resolvePostAuthDestination(2, '/app/billing');
  assert.equal(destination, `/select-workspace?returnTo=${encodeURIComponent('/app/billing')}`);
});

test('resolvePostAuthDestination treats zero memberships the same as one (no workspace choice to make)', () => {
  assert.equal(resolvePostAuthDestination(0, '/app'), '/app');
});

test('businessOutcomeMessage returns a distinct, actionable message per outcome', () => {
  const noLinked = businessOutcomeMessage('no_linked_account');
  const alreadyRegistered = businessOutcomeMessage('email_already_registered');
  const invitationInvalid = businessOutcomeMessage('invitation_invalid');

  assert.match(noLinked, /nie jest jeszcze połączone/u);
  assert.match(alreadyRegistered, /ma już konto/u);
  assert.match(invitationInvalid, /nieprawidłowe|wygasło/u);
  // Each outcome must produce a genuinely different message — never a
  // generic fallback masking which case actually happened.
  assert.notEqual(noLinked, alreadyRegistered);
  assert.notEqual(alreadyRegistered, invitationInvalid);
});

test('oauthErrorMessage maps each known upstream code to a distinct, actionable message', () => {
  const mismatch = oauthErrorMessage('OAUTH_EMAIL_MISMATCH', 'Forbidden');
  const alreadyLinked = oauthErrorMessage('OAUTH_IDENTITY_ALREADY_LINKED', 'Conflict');
  const transactionInvalid = oauthErrorMessage('OAUTH_TRANSACTION_INVALID', 'Bad request');

  assert.match(mismatch, /nie pasuje do adresu/u);
  assert.match(alreadyLinked, /już połączone/u);
  assert.match(transactionInvalid, /wygasła|wykorzystana/u);
  assert.notEqual(mismatch, alreadyLinked);
  assert.notEqual(alreadyLinked, transactionInvalid);
});

test('oauthErrorMessage falls back to the caller-supplied message for an unrecognized code, not a generic string', () => {
  const message = oauthErrorMessage('SOME_UNRECOGNIZED_CODE', 'A specific upstream detail');
  assert.equal(message, 'A specific upstream detail');
});

test('oauthErrorMessage handles a null code (plain Error, not a BffProblem) and an empty fallback without crashing', () => {
  assert.equal(oauthErrorMessage(null, 'network down'), 'network down');
  assert.equal(oauthErrorMessage(null, ''), 'Nie udało się dokończyć logowania.');
});

test('isOAuthProviderEnabled treats undefined availability as configuration_required for both providers', () => {
  assert.equal(isOAuthProviderEnabled(undefined, 'google'), false);
  assert.equal(isOAuthProviderEnabled(undefined, 'microsoft'), false);
});

test('isOAuthProviderEnabled is independent per provider — one being available never enables the other', () => {
  const availability = { google: 'available' as const, microsoft: 'configuration_required' as const };
  assert.equal(isOAuthProviderEnabled(availability, 'google'), true);
  assert.equal(isOAuthProviderEnabled(availability, 'microsoft'), false);
});
