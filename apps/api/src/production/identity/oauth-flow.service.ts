import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import {
  IdentityOAuthRepository,
  IdentityRepository,
  InvitationRepository,
  ProductionDatabase,
  normalizeEmail,
  type IdentityMembershipRow,
  type InvitationRow,
  type OAuthIntent,
  type OAuthProvider,
  type OAuthTransactionRow,
} from "@papadata/database";
import { tenantOwnerBootstrapCapabilities } from "@papadata/contracts";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { Argon2PasswordService } from "../security/argon2.service.js";
import { StepUpService } from "../security/step-up.service.js";
import { OAuthProviderConfig } from "./oauth-provider.config.js";
import {
  OAuthTokenVerifierService,
  type VerifiedOAuthIdentity,
} from "./oauth-token-verifier.service.js";

// What each per-intent handler actually decides. `returnTo` is stitched on
// afterward in callback() from the transaction row (see OAuthCallbackResult
// below) — no individual handler decides it.
type OAuthIntentResult =
  | {
      readonly outcome: "authenticated";
      readonly userId: string;
      readonly email: string;
      readonly displayName: string;
      readonly memberships: readonly IdentityMembershipRow[];
    }
  | { readonly outcome: "linked"; readonly provider: OAuthProvider }
  | { readonly outcome: "reauth_confirmed"; readonly expiresAt: string }
  | { readonly outcome: "no_linked_account"; readonly email: string }
  | { readonly outcome: "email_already_registered"; readonly email: string }
  | { readonly outcome: "invitation_invalid" };

// Every variant carries `returnTo` — the callback URL only ever has
// `code`/`state`, so this is the only way the frontend landing page finds
// out where the flow was supposed to continue afterward, success or not.
export type OAuthCallbackResult = OAuthIntentResult & { readonly returnTo: string | null };

// Orchestrates the whole OAuth handshake. Every success path here
// terminates in IdentityRepository/InvitationRepository calls — the same
// ones email/password auth uses — so tenant/workspace/role/capabilities
// are always decided by PapaData's own backend, never read from the
// provider's ID token.
@Injectable()
export class OAuthFlowService {
  private readonly oauthLinks: IdentityOAuthRepository;

  private readonly identities: IdentityRepository;

  private readonly invitations: InvitationRepository;

  constructor(
    @Inject(ProductionDatabase) database: ProductionDatabase,
    @Inject(OAuthProviderConfig) private readonly config: OAuthProviderConfig,
    @Inject(OAuthTokenVerifierService) private readonly verifier: OAuthTokenVerifierService,
    @Inject(Argon2PasswordService) private readonly passwords: Argon2PasswordService,
    @Inject(StepUpService) private readonly stepUp: StepUpService,
  ) {
    this.oauthLinks = new IdentityOAuthRepository(database);
    this.identities = new IdentityRepository(database);
    this.invitations = new InvitationRepository(database);
  }

  async start(input: {
    readonly provider: OAuthProvider;
    readonly intent: OAuthIntent;
    readonly invitationId?: string;
    readonly invitationToken?: string;
    readonly returnTo?: string;
    // Present only for link_account/reauth — those intents require an
    // already-authenticated caller; the public auth.oauth.start path never
    // supplies this.
    readonly principal?: RequestPrincipal;
  }): Promise<{ readonly redirectUrl: string; readonly state: string }> {
    if (!this.config.isConfigured(input.provider)) {
      throw new ForbiddenException(
        `OAuth provider "${input.provider}" is not configured.`,
      );
    }
    if (input.intent === "accept_invitation" && (!input.invitationId || !input.invitationToken)) {
      throw new BadRequestException(
        "invitationId and invitationToken are required for the accept_invitation intent.",
      );
    }
    if ((input.intent === "link_account" || input.intent === "reauth") && !input.principal) {
      throw new ForbiddenException(
        `The "${input.intent}" intent requires an authenticated session.`,
      );
    }

    let linkingIdentityKey: string | null = null;
    if (input.principal) {
      linkingIdentityKey = await this.identities.findIdentityKeyByUserId(input.principal.userId);
      if (!linkingIdentityKey) {
        throw new ForbiddenException("Could not resolve the current identity.");
      }
    }

    const codeVerifier = randomBytes(32).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
    const nonce = randomBytes(16).toString("base64url");

    const { state } = await this.oauthLinks.createTransaction({
      intent: input.intent,
      invitationId: input.invitationId ?? null,
      invitationToken: input.invitationToken ?? null,
      linkingIdentityKey,
      linkingSessionId: input.principal?.sessionId ?? null,
      linkingTenantId: input.principal?.tenantId ?? null,
      linkingUserId: input.principal?.userId ?? null,
      nonce,
      pkceCodeVerifier: codeVerifier,
      provider: input.provider,
      returnTo: input.returnTo ?? null,
      ttlMinutes: 10,
    });

    const metadata = this.config.metadata(input.provider);
    const credentials = this.config.requireCredentials(input.provider);
    const url = new URL(metadata.authorizationEndpoint);
    url.searchParams.set("client_id", credentials.clientId);
    url.searchParams.set("redirect_uri", this.config.redirectUri());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("nonce", nonce);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");

    return { redirectUrl: url.toString(), state };
  }

  async callback(input: {
    readonly code: string;
    readonly state: string;
  }): Promise<OAuthCallbackResult> {
    const transaction = await this.oauthLinks.consumeTransaction(input.state);
    if (!transaction) {
      throw new BadRequestException("OAUTH_TRANSACTION_INVALID");
    }

    const idToken = await this.exchangeCode(
      transaction.provider,
      input.code,
      transaction.pkceCodeVerifier,
    );
    const verified = await this.verifier.verifyIdToken({
      idToken,
      nonce: transaction.nonce,
      provider: transaction.provider,
    });

    const result = await this.dispatchIntent(transaction, verified);
    return { ...result, returnTo: transaction.returnTo };
  }

  private async dispatchIntent(
    transaction: OAuthTransactionRow,
    verified: VerifiedOAuthIdentity,
  ): Promise<OAuthIntentResult> {
    switch (transaction.intent) {
      case "login":
        return this.handleLogin(transaction.provider, verified);
      case "register":
        return this.handleRegister(transaction.provider, verified);
      case "accept_invitation":
        return this.handleAcceptInvitation(transaction, verified);
      case "link_account":
        return this.handleLinkAccount(transaction, verified);
      case "reauth":
        return this.handleReauth(transaction, verified);
      default:
        throw new BadRequestException("OAUTH_INTENT_UNSUPPORTED");
    }
  }

  private async exchangeCode(
    provider: OAuthProvider,
    code: string,
    codeVerifier: string,
  ): Promise<string> {
    const metadata = this.config.metadata(provider);
    const credentials = this.config.requireCredentials(provider);
    const body = new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: this.config.redirectUri(),
    });

    // Plain fetch + timeout, not the retry-oriented provider HTTP client:
    // a single-use authorization code must never be silently retried —
    // the second attempt would just fail (the code is already spent).
    const response = await fetch(metadata.tokenEndpoint, {
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      method: "POST",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new BadRequestException("OAUTH_CODE_EXCHANGE_FAILED");
    }

    const payload = await response.json() as { readonly id_token?: unknown };
    if (typeof payload.id_token !== "string" || !payload.id_token) {
      throw new BadRequestException("OAUTH_ID_TOKEN_MISSING");
    }
    return payload.id_token;
  }

  // The provider only ever confirms subjectId+email here. If no link
  // exists, this returns a "no_linked_account" outcome rather than
  // silently registering — auto-registering on login is exactly the
  // "auto-grant access" failure mode this design must not have.
  private async handleLogin(
    provider: OAuthProvider,
    verified: VerifiedOAuthIdentity,
  ): Promise<OAuthIntentResult> {
    const link = await this.oauthLinks.findLinkBySubject(provider, verified.subjectId);
    if (!link) {
      return { email: verified.email, outcome: "no_linked_account" };
    }

    const user = await this.identities.findByUserId(link.userId, link.identityKey);
    if (!user) {
      return { email: verified.email, outcome: "no_linked_account" };
    }

    await this.oauthLinks.touchLogin({ identityKey: link.identityKey, provider, userId: link.userId });
    const memberships = await this.identities.listMemberships(user);

    return {
      displayName: user.displayName,
      email: user.normalizedEmail,
      memberships,
      outcome: "authenticated",
      userId: user.userId,
    };
  }

  private async handleRegister(
    provider: OAuthProvider,
    verified: VerifiedOAuthIdentity,
  ): Promise<OAuthIntentResult> {
    // Replaying "register" for an already-linked identity (e.g. a double
    // submit) is treated as a login, not an error.
    const existingLink = await this.oauthLinks.findLinkBySubject(provider, verified.subjectId);
    if (existingLink) {
      return this.handleLogin(provider, verified);
    }

    // Never auto-link on register intent: if this email already has a
    // password-based account, that would be a silent account takeover the
    // moment someone's provider email happens to match. Force an explicit
    // link_account instead.
    const existingEmailIdentity = await this.identities.findByEmail(verified.email);
    if (existingEmailIdentity) {
      return { email: verified.email, outcome: "email_already_registered" };
    }

    const displayName = verified.name ?? verified.email.split("@")[0] ?? "New member";
    // A random, never-disclosed password hash — this account has no
    // password auth path; the only way in is the linked provider. Hashed
    // (not stored raw) so a malformed value can never reach argon2.verify
    // on a future password-login attempt.
    const passwordHash = await this.passwords.hash(randomBytes(32).toString("base64url"));

    const { membership, user } = await this.identities.register({
      capabilities: tenantOwnerBootstrapCapabilities,
      displayName,
      email: verified.email,
      passwordHash,
      // No separate "organization name" step exists yet for OAuth
      // registration (that onboarding UI is out of scope here) — PapaData
      // itself assigns a default name, the same way it assigns tenant
      // ownership/capabilities; nothing here is taken from the provider.
      tenantName: `${displayName}'s organization`,
      workspaceName: "Main workspace",
    }).catch((error: unknown) => {
      if (error instanceof Error && error.message === "IDENTITY_EMAIL_EXISTS") {
        throw new ConflictException("Account already exists.");
      }
      throw error;
    });

    await this.oauthLinks.createLink({
      identityKey: user.identityKey,
      provider,
      providerEmail: verified.email,
      providerSubjectId: verified.subjectId,
      userId: user.userId,
    });

    return {
      displayName: user.displayName,
      email: user.normalizedEmail,
      memberships: [membership],
      outcome: "authenticated",
      userId: user.userId,
    };
  }

  private async handleAcceptInvitation(
    transaction: OAuthTransactionRow,
    verified: VerifiedOAuthIdentity,
  ): Promise<OAuthIntentResult> {
    if (!transaction.invitationId || !transaction.invitationToken) {
      return { outcome: "invitation_invalid" };
    }

    const invitation = await this.invitations.findInvitationByToken(
      transaction.invitationId,
      transaction.invitationToken,
    );
    if (!isInvitationOpen(invitation)) {
      return { outcome: "invitation_invalid" };
    }

    // Email-match enforcement (before any mutation): the invitation token
    // no longer resolves via findInvitationByToken until the invitation is
    // re-fetched (it hasn't been consumed yet at this point), so a
    // mismatch here leaves it fully retryable with the correct account.
    if (normalizeEmail(invitation.email) !== normalizeEmail(verified.email)) {
      throw new ForbiddenException("OAUTH_EMAIL_MISMATCH");
    }

    const existingIdentity = await this.identities.findByEmail(invitation.email);

    if (existingIdentity) {
      const joined = await this.invitations.acceptInvitationForExistingIdentity({
        identityKey: existingIdentity.identityKey,
        invitation,
        token: transaction.invitationToken,
        userId: existingIdentity.userId,
      }).catch((error: unknown) => {
        if (error instanceof Error && error.message === "ALREADY_MEMBER") {
          throw new ConflictException("Already a member of this workspace.");
        }
        throw error;
      });
      if (!joined) {
        return { outcome: "invitation_invalid" };
      }

      // The verified, email-matched ID token IS the authentication for an
      // existing identity — no password involved — so the link is
      // recorded (or refreshed) the same way a fresh register would.
      await this.oauthLinks.createLink({
        identityKey: existingIdentity.identityKey,
        provider: transaction.provider,
        providerEmail: verified.email,
        providerSubjectId: verified.subjectId,
        userId: existingIdentity.userId,
      });

      const memberships = await this.identities.listMemberships(existingIdentity);
      return {
        displayName: existingIdentity.displayName,
        email: existingIdentity.normalizedEmail,
        memberships,
        outcome: "authenticated",
        userId: existingIdentity.userId,
      };
    }

    const displayName = verified.name ?? invitation.email.split("@")[0] ?? "New member";
    const passwordHash = await this.passwords.hash(randomBytes(32).toString("base64url"));
    const joined = await this.invitations.acceptInvitation({
      displayName,
      invitation,
      passwordHash,
      token: transaction.invitationToken,
    }).catch((error: unknown) => {
      if (error instanceof Error && error.message === "IDENTITY_EMAIL_EXISTS") {
        throw new ConflictException("Account already exists.");
      }
      throw error;
    });
    if (!joined) {
      return { outcome: "invitation_invalid" };
    }

    await this.oauthLinks.createLink({
      identityKey: joined.user.identityKey,
      provider: transaction.provider,
      providerEmail: verified.email,
      providerSubjectId: verified.subjectId,
      userId: joined.user.userId,
    });

    return {
      displayName: joined.user.displayName,
      email: joined.user.normalizedEmail,
      memberships: [joined.membership],
      outcome: "authenticated",
      userId: joined.user.userId,
    };
  }

  private async handleLinkAccount(
    transaction: OAuthTransactionRow,
    verified: VerifiedOAuthIdentity,
  ): Promise<OAuthIntentResult> {
    if (!transaction.linkingUserId || !transaction.linkingIdentityKey) {
      throw new ForbiddenException("OAUTH_LINK_CONTEXT_MISSING");
    }

    // createLink's unique index is the actual enforcement; this check just
    // gives a clearer, typed error before hitting it.
    const existingLink = await this.oauthLinks.findLinkBySubject(
      transaction.provider,
      verified.subjectId,
    );
    if (existingLink && existingLink.userId !== transaction.linkingUserId) {
      throw new ConflictException("OAUTH_IDENTITY_ALREADY_LINKED");
    }

    await this.oauthLinks.createLink({
      identityKey: transaction.linkingIdentityKey,
      provider: transaction.provider,
      providerEmail: verified.email,
      providerSubjectId: verified.subjectId,
      userId: transaction.linkingUserId,
    });

    return { outcome: "linked", provider: transaction.provider };
  }

  private async handleReauth(
    transaction: OAuthTransactionRow,
    verified: VerifiedOAuthIdentity,
  ): Promise<OAuthIntentResult> {
    if (
      !transaction.linkingUserId
      || !transaction.linkingIdentityKey
      || !transaction.linkingTenantId
      || !transaction.linkingSessionId
    ) {
      throw new ForbiddenException("OAUTH_REAUTH_CONTEXT_MISSING");
    }

    // A Google/Microsoft login only proves "you are provider subject Y" —
    // it becomes proof of "you are session X" only via a link that was
    // already established beforehand. Reauth can never be the first time
    // a provider identity is attached to this user.
    const link = await this.oauthLinks.findLinkBySubject(transaction.provider, verified.subjectId);
    if (!link || link.userId !== transaction.linkingUserId) {
      throw new ForbiddenException("OAUTH_REAUTH_IDENTITY_MISMATCH");
    }

    // Reuses the real StepUpService — the exact mechanism
    // /v1/security/step-up issues after a fresh TOTP code — instead of a
    // parallel authLevel-upgrade path.
    const { expiresAt } = await this.stepUp.issue({
      assuranceLevel: "aal2",
      operationScope: "account.reauth",
      sessionId: transaction.linkingSessionId,
      targetReference: null,
      tenantId: transaction.linkingTenantId,
      userId: transaction.linkingUserId,
    });

    return { expiresAt, outcome: "reauth_confirmed" };
  }
}

function isInvitationOpen(invitation: InvitationRow | null): invitation is InvitationRow {
  return invitation !== null
    && invitation.status === "pending"
    && Date.parse(invitation.expiresAt) > Date.now();
}
