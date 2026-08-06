import {
  FetchProviderHttpClient,
  type ProviderHttpClient,
  readStringField,
} from "./http.js";
import { ProviderAdapterError } from "./provider-adapter.js";

export type RefreshableOAuthCredential = {
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly clientId?: string;
  readonly clientSecret?: string;
  readonly tokenUri?: string;
  readonly expiresAt?: string | null;
};

export class OAuthAccessTokenProvider {
  private readonly credential: RefreshableOAuthCredential;
  private readonly http: ProviderHttpClient;
  private cachedToken: string | null;
  private cachedExpiresAt: number | null;

  constructor(
    credential: RefreshableOAuthCredential,
    http: ProviderHttpClient = new FetchProviderHttpClient(),
  ) {
    this.credential = credential;
    this.http = http;
    this.cachedToken = credential.accessToken?.trim() || null;
    this.cachedExpiresAt = credential.expiresAt
      ? Date.parse(credential.expiresAt)
      : null;
  }

  isConfigured(): boolean {
    return Boolean(
      this.cachedToken
      || (
        this.credential.refreshToken
        && this.credential.clientId
        && this.credential.clientSecret
      ),
    );
  }

  async getAccessToken(): Promise<string> {
    if (
      this.cachedToken
      && (
        this.cachedExpiresAt === null
        || this.cachedExpiresAt > Date.now() + 60_000
      )
    ) {
      return this.cachedToken;
    }

    const refreshToken = this.credential.refreshToken?.trim();
    const clientId = this.credential.clientId?.trim();
    const clientSecret = this.credential.clientSecret?.trim();
    const tokenUri = this.credential.tokenUri?.trim()
      || "https://oauth2.googleapis.com/token";

    if (!refreshToken || !clientId || !clientSecret) {
      if (this.cachedToken) return this.cachedToken;
      throw new ProviderAdapterError(
        "OAuth credential is incomplete",
        "authentication",
      );
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
    const result = await this.http.requestJson<unknown>({
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      maxAttempts: 2,
      method: "POST",
      timeoutMs: 10_000,
      url: tokenUri,
    });
    const accessToken = readStringField(result.data, "access_token");
    if (!accessToken) {
      throw new ProviderAdapterError(
        "OAuth token endpoint did not return an access token",
        "authentication",
      );
    }

    const expiresIn = Number(
      typeof result.data === "object"
      && result.data !== null
      && "expires_in" in result.data
        ? (result.data as { readonly expires_in?: unknown }).expires_in
        : 3_600,
    );
    this.cachedToken = accessToken;
    this.cachedExpiresAt = Date.now()
      + (Number.isFinite(expiresIn) ? expiresIn : 3_600) * 1_000;
    return accessToken;
  }
}
