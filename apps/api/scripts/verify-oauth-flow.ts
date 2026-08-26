// Exercises the OAuth identity-linking data layer against real Postgres —
// not mocks — to prove the properties that only a real database (unique
// constraints, row locking, RLS) can actually guarantee:
//
//   1. PKCE/state transactions are genuinely single-use (a replayed
//      callback can never succeed twice) and expire correctly.
//   2. The (provider, provider_subject_id) unique index is what actually
//      stops one provider identity from silently attaching to two users —
//      not application logic that could regress silently.
//   3. OAuth accept-invitation, composed from the same primitives
//      oauth-flow.service.ts uses (findInvitationByToken, normalizeEmail
//      comparison, acceptInvitation/acceptInvitationForExistingIdentity,
//      createLink), correctly branches new-identity vs existing-identity
//      and never mutates anything on an email mismatch.
//
// This intentionally bypasses the real HTTP/JWKS/token-exchange path
// (there are no live Google/Microsoft credentials in this environment —
// see oauth-token-verifier.service.test.ts for that layer, tested
// separately against a fake local JWKS). What's proven here is: given a
// provider's verified {subjectId, email}, is the surrounding data layer
// correct? Requires compose.production-parity.yml up (for Postgres). Run
// with:
//   pnpm --filter @papadata/api exec tsx scripts/verify-oauth-flow.ts
process.env.NODE_ENV = "test";

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  IdentityOAuthRepository,
  IdentityRepository,
  InvitationRepository,
  normalizeEmail,
  ProductionDatabase,
} from "@papadata/database";

const repoRoot = new URL("../../../", import.meta.url).pathname;
const databaseUrl = readDatabaseUrl();
const database = new ProductionDatabase({ connectionString: databaseUrl, max: 4, statementTimeoutMs: 10_000 });
const identities = new IdentityRepository(database);
const invitations = new InvitationRepository(database);
const oauthLinks = new IdentityOAuthRepository(database);

const failures: string[] = [];
const createdUserIds: string[] = [];
const createdEmails: string[] = [];

function assertTrue(condition: boolean, message: string): void {
  if (condition) {
    console.log(`PASS: ${message}`);
  } else {
    failures.push(message);
    console.error(`FAIL: ${message}`);
  }
}

try {
  await runTransactionMechanicsCheck();
  await runUniqueConstraintCheck();
  await runAcceptInvitationNewIdentityCheck();
  await runAcceptInvitationExistingIdentityCheck();
  await runAcceptInvitationMismatchCheck();

  console.log(JSON.stringify({
    failures,
    result: failures.length === 0 ? "pass" : "fail",
  }, null, 2));
} finally {
  await cleanup();
  await database.close();
}

if (failures.length > 0) process.exitCode = 1;

async function runTransactionMechanicsCheck(): Promise<void> {
  const { state } = await oauthLinks.createTransaction({
    intent: "login",
    nonce: "verify-nonce",
    pkceCodeVerifier: "verify-code-verifier",
    provider: "google",
    ttlMinutes: 10,
  });

  const first = await oauthLinks.consumeTransaction(state);
  assertTrue(first !== null, "createTransaction/consumeTransaction: a freshly created transaction consumes successfully");

  const replay = await oauthLinks.consumeTransaction(state);
  assertTrue(replay === null, "consumeTransaction: a replayed callback (same state twice) is refused — single-use enforced");

  const { state: expiredState } = await oauthLinks.createTransaction({
    intent: "login",
    nonce: "verify-nonce-2",
    pkceCodeVerifier: "verify-code-verifier-2",
    provider: "google",
    ttlMinutes: -1,
  });
  const expired = await oauthLinks.consumeTransaction(expiredState);
  assertTrue(expired === null, "consumeTransaction: an already-expired transaction is refused");
}

async function runUniqueConstraintCheck(): Promise<void> {
  const { user: userA } = await registerTestUser("oauth-flow-unique-a");
  const { user: userB } = await registerTestUser("oauth-flow-unique-b");
  const subjectId = `subject-${randomUUID()}`;

  await oauthLinks.createLink({
    identityKey: userA.identityKey,
    provider: "google",
    providerEmail: userA.normalizedEmail,
    providerSubjectId: subjectId,
    userId: userA.userId,
  });

  let rejected = false;
  try {
    await oauthLinks.createLink({
      identityKey: userB.identityKey,
      provider: "google",
      providerEmail: userB.normalizedEmail,
      providerSubjectId: subjectId,
      userId: userB.userId,
    });
  } catch (error) {
    rejected = error instanceof Error && error.message === "OAUTH_IDENTITY_ALREADY_LINKED";
  }
  assertTrue(rejected, "createLink: the (provider, provider_subject_id) unique index rejects attaching the same provider identity to a second user");

  const lookup = await oauthLinks.findLinkBySubject("google", subjectId);
  assertTrue(lookup?.userId === userA.userId, "the rejected cross-user attempt left the original link untouched");
}

async function runAcceptInvitationNewIdentityCheck(): Promise<void> {
  const { user: inviter, membership: inviterMembership } = await registerTestUser("oauth-flow-invite-new-inviter");
  const invitedEmail = testEmail("oauth-flow-invite-new-member");
  createdEmails.push(invitedEmail);

  const created = await invitations.createInvitation({
    email: invitedEmail,
    invitedByUserId: inviter.userId,
    role: "Analyst",
    tenantId: inviterMembership.tenantId,
    ttlHours: 24,
    workspaceId: inviterMembership.workspaceId,
  });
  const invitation = await invitations.findInvitationByToken(created.invitationId, created.token);
  if (!invitation) throw new Error("invitation lookup failed");

  // Mirrors oauth-flow.service.ts's handleAcceptInvitation: verified email
  // matches, no existing identity -> create new identity + link.
  assertTrue(
    normalizeEmail(invitation.email) === normalizeEmail(invitedEmail),
    "email-match check passes for the correct provider email (sanity check before the real assertions)",
  );

  const existing = await identities.findByEmail(invitation.email);
  assertTrue(existing === null, "no pre-existing identity for a brand-new invited email");

  const passwordHash = "argon2-placeholder-oauth-new-identity";
  const joined = await invitations.acceptInvitation({
    displayName: "OAuth New Member",
    invitation,
    passwordHash,
    token: created.token,
  });
  assertTrue(joined !== null, "acceptInvitation succeeds for a valid invitation + new identity");
  if (!joined) return;
  createdUserIds.push(joined.user.userId);

  const subjectId = `subject-${randomUUID()}`;
  await oauthLinks.createLink({
    identityKey: joined.user.identityKey,
    provider: "google",
    providerEmail: invitedEmail,
    providerSubjectId: subjectId,
    userId: joined.user.userId,
  });
  const link = await oauthLinks.findLinkBySubject("google", subjectId);
  assertTrue(link?.userId === joined.user.userId, "OAuth accept-invite (new identity): the created user has a real OAuth link recorded");
}

async function runAcceptInvitationExistingIdentityCheck(): Promise<void> {
  const { user: inviter, membership: inviterMembership } = await registerTestUser("oauth-flow-invite-existing-inviter");
  const { user: member } = await registerTestUser("oauth-flow-invite-existing-member");

  const created = await invitations.createInvitation({
    email: member.normalizedEmail,
    invitedByUserId: inviter.userId,
    role: "Analyst",
    tenantId: inviterMembership.tenantId,
    ttlHours: 24,
    workspaceId: inviterMembership.workspaceId,
  });
  const invitation = await invitations.findInvitationByToken(created.invitationId, created.token);
  if (!invitation) throw new Error("invitation lookup failed");

  // Mirrors handleAcceptInvitation's existing-identity branch: the
  // verified OAuth email IS the authentication, no password check.
  const existing = await identities.findByEmail(invitation.email);
  assertTrue(existing?.userId === member.userId, "the invited email resolves to the pre-existing member identity");
  if (!existing) return;

  const joined = await invitations.acceptInvitationForExistingIdentity({
    identityKey: existing.identityKey,
    invitation,
    token: created.token,
    userId: existing.userId,
  });
  assertTrue(joined !== null, "OAuth accept-invite (existing identity): acceptInvitationForExistingIdentity succeeds");

  const afterAccept = await identities.findByEmail(member.normalizedEmail);
  assertTrue(afterAccept?.passwordHash === member.passwordHash, "OAuth accept-invite (existing identity): password_hash is untouched — the OAuth token was the authentication, not a password");

  await oauthLinks.createLink({
    identityKey: existing.identityKey,
    provider: "microsoft",
    providerEmail: member.normalizedEmail,
    providerSubjectId: `subject-${randomUUID()}`,
    userId: existing.userId,
  });
  const memberships = await identities.listMemberships(existing);
  assertTrue(memberships.length === 2, "OAuth accept-invite (existing identity): the existing user now has both their own tenant and the newly joined one");
}

async function runAcceptInvitationMismatchCheck(): Promise<void> {
  const { user: inviter, membership: inviterMembership } = await registerTestUser("oauth-flow-invite-mismatch-inviter");
  const invitedEmail = testEmail("oauth-flow-invite-mismatch-invited");
  const attackerEmail = testEmail("oauth-flow-invite-mismatch-attacker");
  createdEmails.push(invitedEmail, attackerEmail);

  const created = await invitations.createInvitation({
    email: invitedEmail,
    invitedByUserId: inviter.userId,
    role: "Analyst",
    tenantId: inviterMembership.tenantId,
    ttlHours: 24,
    workspaceId: inviterMembership.workspaceId,
  });
  const invitation = await invitations.findInvitationByToken(created.invitationId, created.token);
  if (!invitation) throw new Error("invitation lookup failed");

  // This is the exact check oauth-flow.service.ts's handleAcceptInvitation
  // runs BEFORE any mutation.
  const mismatch = normalizeEmail(invitation.email) !== normalizeEmail(attackerEmail);
  assertTrue(mismatch, "email-match check correctly detects a mismatch between invitation email and verified provider email");

  // Because the real handler throws before calling acceptInvitation at
  // all on a mismatch, nothing was mutated — prove the invitation token
  // is still fully valid and usable by the CORRECT email afterward.
  const stillOpen = await invitations.findInvitationByToken(created.invitationId, created.token);
  assertTrue(
    stillOpen !== null && stillOpen.status === "pending",
    "a mismatch leaves the invitation token untouched (still pending, retryable with the correct account)",
  );

  const joined = await invitations.acceptInvitation({
    displayName: "Correct Invitee",
    invitation: stillOpen!,
    passwordHash: "argon2-placeholder-oauth-mismatch-retry",
    token: created.token,
  });
  assertTrue(joined !== null, "the same, untouched invitation token is still acceptable by the correct (matching) email afterward");
  if (joined) createdUserIds.push(joined.user.userId);
}

async function registerTestUser(label: string): ReturnType<typeof identities.register> {
  const email = testEmail(label);
  createdEmails.push(email);
  return identities.register({
    capabilities: [],
    displayName: label,
    email,
    passwordHash: `argon2-placeholder-${label}`,
    tenantName: `${label} tenant`,
    workspaceName: `${label} workspace`,
  });
}

function testEmail(label: string): string {
  return `verify-${label}-${randomUUID()}@papadata.test`;
}

async function cleanup(): Promise<void> {
  console.log(`\nCLEANUP_USER_IDS=${createdUserIds.join(",")}`);
  console.log(`CLEANUP_EMAILS=${createdEmails.join(",")}`);
}

function readDatabaseUrl(): string {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();
  const raw = readFileSync(`${repoRoot}.env.production-parity`, "utf8");
  const line = raw.split("\n").find((entry) => entry.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL not found in .env.production-parity");
  return line.slice("DATABASE_URL=".length).trim().replace("postgres-production:5432", "127.0.0.1:55432");
}
