import { Inject, Injectable } from "@nestjs/common";
import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";
import { OAuthProviderConfig, type OAuthProvider } from "./oauth-provider.config.js";

export type VerifiedOAuthIdentity = {
  readonly subjectId: string;
  readonly email: string;
  // Best-effort display name from the provider's `name` claim — used only
  // as a friendly default when creating a brand-new identity (register /
  // accept_invitation-new-identity); never used for anything security-
  // relevant.
  readonly name: string | null;
};

// Real ID-token verification: fetches each provider's published JWKS,
// checks the signature, audience, issuer and nonce, and hard-rejects any
// token whose email is not provider-verified. This is the sole source of
// truth for "who is this" — tenant/workspace/role/capabilities are never
// read from here, only subjectId + email.
@Injectable()
export class OAuthTokenVerifierService {
  private readonly jwksCache = new Map<OAuthProvider, JWTVerifyGetKey>();

  constructor(
    @Inject(OAuthProviderConfig) private readonly config: OAuthProviderConfig,
  ) {}

  async verifyIdToken(input: {
    readonly provider: OAuthProvider;
    readonly idToken: string;
    readonly nonce: string;
  }): Promise<VerifiedOAuthIdentity> {
    const metadata = this.config.metadata(input.provider);
    const credentials = this.config.requireCredentials(input.provider);
    const jwks = this.jwksFor(input.provider, metadata.jwksUri);

    const { payload } = await jwtVerify(input.idToken, jwks, {
      audience: credentials.clientId,
      ...(typeof metadata.issuer === "string" ? { issuer: metadata.issuer } : {}),
    });

    if (typeof metadata.issuer !== "string") {
      const issuerClaim = typeof payload.iss === "string" ? payload.iss : "";
      if (!metadata.issuer.test(issuerClaim)) {
        throw new Error("OAUTH_ISSUER_MISMATCH");
      }
    }

    if (payload.nonce !== input.nonce) {
      throw new Error("OAUTH_NONCE_MISMATCH");
    }

    const subjectId = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!subjectId || !email) {
      throw new Error("OAUTH_CLAIMS_INCOMPLETE");
    }

    // Hard reject: an ID token whose email the provider itself has not
    // verified must never be trusted as a real identity. Both providers
    // return this as a JSON boolean; a missing claim is treated the same
    // as false, not as "unknown, allow it" — the conservative default.
    const emailVerified = payload.email_verified === true;
    if (!emailVerified) {
      throw new Error("OAUTH_EMAIL_NOT_VERIFIED");
    }

    const name = typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : null;

    return { subjectId, email, name };
  }

  private jwksFor(provider: OAuthProvider, jwksUri: string): JWTVerifyGetKey {
    const cached = this.jwksCache.get(provider);
    if (cached) return cached;
    const created = createRemoteJWKSet(new URL(jwksUri));
    this.jwksCache.set(provider, created);
    return created;
  }
}
