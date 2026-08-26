import assert from "node:assert/strict";
import test from "node:test";
import { OAuthProviderConfig } from "./oauth-provider.config.ts";

const oauthEnvVars = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "MICROSOFT_OAUTH_CLIENT_ID",
  "MICROSOFT_OAUTH_CLIENT_SECRET",
  "PAPADATA_WEB_ORIGIN",
] as const;

function withEnv(overrides: Readonly<Record<string, string | undefined>>, run: () => void): void {
  const saved = oauthEnvVars.map((name) => [name, process.env[name]] as const);
  try {
    for (const name of oauthEnvVars) {
      const value = overrides[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    run();
  } finally {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

test("OAuthProviderConfig reports configuration_required for both providers when no env vars are set (the default/CI state)", () => {
  withEnv({}, () => {
    const config = new OAuthProviderConfig();
    assert.equal(config.isConfigured("google"), false);
    assert.equal(config.isConfigured("microsoft"), false);
    assert.equal(config.statusFor("google"), "configuration_required");
    assert.equal(config.statusFor("microsoft"), "configuration_required");
    assert.throws(() => config.requireCredentials("google"));
    assert.throws(() => config.requireCredentials("microsoft"));
    assert.throws(() => config.redirectUri());
  });
});

test("OAuthProviderConfig requires PAPADATA_WEB_ORIGIN even when provider credentials are set", () => {
  withEnv({
    GOOGLE_OAUTH_CLIENT_ID: "client-id",
    GOOGLE_OAUTH_CLIENT_SECRET: "client-secret",
  }, () => {
    const config = new OAuthProviderConfig();
    assert.equal(config.isConfigured("google"), false, "credentials alone are not enough without a redirect origin");
    assert.equal(config.statusFor("google"), "configuration_required");
  });
});

test("OAuthProviderConfig becomes available for a provider once both credentials and web origin are set, independent of the other provider", () => {
  withEnv({
    GOOGLE_OAUTH_CLIENT_ID: "client-id",
    GOOGLE_OAUTH_CLIENT_SECRET: "client-secret",
    PAPADATA_WEB_ORIGIN: "https://papadata.localhost",
  }, () => {
    const config = new OAuthProviderConfig();
    assert.equal(config.isConfigured("google"), true);
    assert.equal(config.statusFor("google"), "available");
    assert.equal(config.isConfigured("microsoft"), false, "microsoft has no credentials and must stay unconfigured");
    assert.equal(config.statusFor("microsoft"), "configuration_required");

    const credentials = config.requireCredentials("google");
    assert.equal(credentials.clientId, "client-id");
    assert.equal(credentials.clientSecret, "client-secret");
    assert.equal(config.redirectUri(), "https://papadata.localhost/oauth/callback");
  });
});

test("OAuthProviderConfig normalizes PAPADATA_WEB_ORIGIN to its origin, dropping any path/query", () => {
  withEnv({
    GOOGLE_OAUTH_CLIENT_ID: "client-id",
    GOOGLE_OAUTH_CLIENT_SECRET: "client-secret",
    PAPADATA_WEB_ORIGIN: "https://papadata.localhost/some/path?query=1",
  }, () => {
    const config = new OAuthProviderConfig();
    assert.equal(config.redirectUri(), "https://papadata.localhost/oauth/callback");
  });
});

test("OAuthProviderConfig treats a malformed PAPADATA_WEB_ORIGIN as unset rather than throwing at construction", () => {
  withEnv({
    GOOGLE_OAUTH_CLIENT_ID: "client-id",
    GOOGLE_OAUTH_CLIENT_SECRET: "client-secret",
    PAPADATA_WEB_ORIGIN: "not a url",
  }, () => {
    const config = new OAuthProviderConfig();
    assert.equal(config.isConfigured("google"), false);
  });
});
