import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import {
  exportJWK,
  generateKeyPair,
  SignJWT,
  type CryptoKey,
  type JWK,
} from "jose";
import type { OAuthProvider, OAuthProviderConfig, OAuthProviderMetadata } from "./oauth-provider.config.ts";
import { OAuthTokenVerifierService } from "./oauth-token-verifier.service.ts";

const issuer = "https://fake-idp.test.papadata.local";
const audience = "test-client-id";

async function withFakeJwks(
  publicJwk: JWK,
  run: (jwksUri: string) => Promise<void>,
): Promise<void> {
  const server: Server = createServer((_request: IncomingMessage, response: ServerResponse) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ keys: [publicJwk] }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address() as AddressInfo;
    await run(`http://127.0.0.1:${port}/jwks`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function fakeConfig(provider: OAuthProvider, jwksUri: string, providerIssuer: OAuthProviderMetadata["issuer"] = issuer): OAuthProviderConfig {
  return {
    isConfigured: () => true,
    metadata: () => ({
      authorizationEndpoint: "https://unused.example/authorize",
      issuer: providerIssuer,
      jwksUri,
      tokenEndpoint: "https://unused.example/token",
    }),
    redirectUri: () => "https://web.example/oauth/callback",
    requireCredentials: () => ({ clientId: audience, clientSecret: "unused-secret" }),
    statusFor: () => "available",
  } as unknown as OAuthProviderConfig;
  void provider;
}

async function signToken(
  privateKey: CryptoKey,
  claims: Readonly<Record<string, unknown>>,
  options: { readonly expiresIn?: string; readonly issuer?: string } = {},
): Promise<string> {
  return new SignJWT({ nonce: "nonce-abc", ...claims })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setIssuer(options.issuer ?? issuer)
    .setAudience(audience)
    .setExpirationTime(options.expiresIn ?? "5m")
    .sign(privateKey);
}

test("OAuthTokenVerifierService accepts a valid, fully verified ID token", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  publicJwk.alg = "RS256";
  publicJwk.use = "sig";

  await withFakeJwks(publicJwk, async (jwksUri) => {
    const verifier = new OAuthTokenVerifierService(fakeConfig("google", jwksUri));
    const idToken = await signToken(privateKey, {
      email: "user@example.com",
      email_verified: true,
      sub: "subject-123",
    });

    const result = await verifier.verifyIdToken({ idToken, nonce: "nonce-abc", provider: "google" });
    assert.equal(result.subjectId, "subject-123");
    assert.equal(result.email, "user@example.com");
  });
});

test("OAuthTokenVerifierService rejects an expired ID token", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);

  await withFakeJwks(publicJwk, async (jwksUri) => {
    const verifier = new OAuthTokenVerifierService(fakeConfig("google", jwksUri));
    const idToken = await signToken(privateKey, {
      email: "user@example.com",
      email_verified: true,
      sub: "subject-123",
    }, { expiresIn: "-1s" });

    await assert.rejects(() => verifier.verifyIdToken({ idToken, nonce: "nonce-abc", provider: "google" }));
  });
});

test("OAuthTokenVerifierService rejects a token with the wrong audience", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);

  await withFakeJwks(publicJwk, async (jwksUri) => {
    const verifier = new OAuthTokenVerifierService(fakeConfig("google", jwksUri));
    const idToken = await new SignJWT({
      email: "user@example.com",
      email_verified: true,
      sub: "subject-123",
    })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setIssuer(issuer)
      .setAudience("some-other-client-id")
      .setExpirationTime("5m")
      .sign(privateKey);

    await assert.rejects(() => verifier.verifyIdToken({ idToken, nonce: "nonce-abc", provider: "google" }));
  });
});

test("OAuthTokenVerifierService hard-rejects a token whose email is not provider-verified", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);

  await withFakeJwks(publicJwk, async (jwksUri) => {
    const verifier = new OAuthTokenVerifierService(fakeConfig("google", jwksUri));
    const idTokenUnverified = await signToken(privateKey, {
      email: "user@example.com",
      email_verified: false,
      sub: "subject-123",
    });
    await assert.rejects(
      () => verifier.verifyIdToken({ idToken: idTokenUnverified, nonce: "nonce-abc", provider: "google" }),
      /OAUTH_EMAIL_NOT_VERIFIED/u,
    );

    const idTokenMissingClaim = await signToken(privateKey, {
      email: "user@example.com",
      sub: "subject-123",
    });
    await assert.rejects(
      () => verifier.verifyIdToken({ idToken: idTokenMissingClaim, nonce: "nonce-abc", provider: "google" }),
      /OAUTH_EMAIL_NOT_VERIFIED/u,
      "a missing email_verified claim must be treated as unverified, not as \"unknown, allow it\"",
    );
  });
});

test("OAuthTokenVerifierService rejects a nonce that does not match the stored transaction", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);

  await withFakeJwks(publicJwk, async (jwksUri) => {
    const verifier = new OAuthTokenVerifierService(fakeConfig("google", jwksUri));
    const idToken = await new SignJWT({
      email: "user@example.com",
      email_verified: true,
      nonce: "nonce-from-token",
      sub: "subject-123",
    })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setIssuer(issuer)
      .setAudience(audience)
      .setExpirationTime("5m")
      .sign(privateKey);

    await assert.rejects(
      () => verifier.verifyIdToken({ idToken, nonce: "nonce-expected-by-caller", provider: "google" }),
      /OAUTH_NONCE_MISMATCH/u,
    );
  });
});

test("OAuthTokenVerifierService validates Microsoft's tenant-specific issuer by pattern, not exact string", async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  const microsoftIssuerPattern = /^https:\/\/login\.microsoftonline\.com\/[^/]+\/v2\.0$/u;

  await withFakeJwks(publicJwk, async (jwksUri) => {
    const verifier = new OAuthTokenVerifierService(fakeConfig("microsoft", jwksUri, microsoftIssuerPattern));

    const validIssuer = "https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0";
    const validToken = await signToken(privateKey, {
      email: "user@example.com",
      email_verified: true,
      sub: "subject-123",
    }, { issuer: validIssuer });
    const result = await verifier.verifyIdToken({ idToken: validToken, nonce: "nonce-abc", provider: "microsoft" });
    assert.equal(result.email, "user@example.com");

    const spoofedIssuer = "https://attacker.example/v2.0";
    const spoofedToken = await signToken(privateKey, {
      email: "user@example.com",
      email_verified: true,
      sub: "subject-123",
    }, { issuer: spoofedIssuer });
    await assert.rejects(
      () => verifier.verifyIdToken({ idToken: spoofedToken, nonce: "nonce-abc", provider: "microsoft" }),
      /OAUTH_ISSUER_MISMATCH/u,
    );
  });
});
