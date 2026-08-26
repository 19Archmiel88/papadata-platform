import { Injectable } from "@nestjs/common";

export type OAuthProvider = "google" | "microsoft";

export type OAuthProviderStatus = "available" | "configuration_required";

export type OAuthProviderMetadata = {
  readonly authorizationEndpoint: string;
  readonly tokenEndpoint: string;
  readonly jwksUri: string;
  // Google's issuer is a fixed string. Microsoft's `common`/multi-tenant
  // endpoint issues tokens with a tenant-specific issuer
  // (https://login.microsoftonline.com/{tenantId}/v2.0), so it is matched
  // by pattern instead of exact string.
  readonly issuer: string | RegExp;
};

export type OAuthProviderCredentials = {
  readonly clientId: string;
  readonly clientSecret: string;
};

// Well-known, stable, non-secret OIDC endpoints. Hardcoded rather than
// fetched from each provider's /.well-known/openid-configuration at
// startup, to avoid a network dependency for the API to boot — these URLs
// are published, stable API surface for both providers, not configuration.
const PROVIDER_METADATA: Record<OAuthProvider, OAuthProviderMetadata> = {
  google: {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
    issuer: "https://accounts.google.com",
  },
  microsoft: {
    authorizationEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys",
    issuer: /^https:\/\/login\.microsoftonline\.com\/[^/]+\/v2\.0$/u,
  },
};

// Gates every OAuth code path: until GOOGLE_OAUTH_CLIENT_ID/SECRET or
// MICROSOFT_OAUTH_CLIENT_ID/SECRET (plus PAPADATA_WEB_ORIGIN, needed to
// build the exact registered redirect_uri) are set, the corresponding
// provider reports "configuration_required" — real credentials will make
// it work without further code changes, but none are supplied by this
// environment.
@Injectable()
export class OAuthProviderConfig {
  private readonly credentials: Partial<Record<OAuthProvider, OAuthProviderCredentials>>;

  private readonly webOrigin: string | null;

  constructor() {
    this.webOrigin = readOrigin(process.env.PAPADATA_WEB_ORIGIN);
    this.credentials = {
      google: readCredentials(process.env, "GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"),
      microsoft: readCredentials(process.env, "MICROSOFT_OAUTH_CLIENT_ID", "MICROSOFT_OAUTH_CLIENT_SECRET"),
    };
  }

  isConfigured(provider: OAuthProvider): boolean {
    return this.credentials[provider] !== undefined && this.webOrigin !== null;
  }

  statusFor(provider: OAuthProvider): OAuthProviderStatus {
    return this.isConfigured(provider) ? "available" : "configuration_required";
  }

  requireCredentials(provider: OAuthProvider): OAuthProviderCredentials {
    const credentials = this.credentials[provider];
    if (!credentials || !this.webOrigin) {
      throw new Error(`OAuth provider "${provider}" is not configured.`);
    }
    return credentials;
  }

  metadata(provider: OAuthProvider): OAuthProviderMetadata {
    return PROVIDER_METADATA[provider];
  }

  redirectUri(): string {
    if (!this.webOrigin) {
      throw new Error("PAPADATA_WEB_ORIGIN is not configured.");
    }
    return `${this.webOrigin}/oauth/callback`;
  }
}

function readCredentials(
  env: NodeJS.ProcessEnv,
  clientIdVar: string,
  clientSecretVar: string,
): OAuthProviderCredentials | undefined {
  const clientId = env[clientIdVar]?.trim();
  const clientSecret = env[clientSecretVar]?.trim();
  if (!clientId || !clientSecret) return undefined;
  return { clientId, clientSecret };
}

function readOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}
