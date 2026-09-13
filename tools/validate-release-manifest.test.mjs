// P0-3 stage 14: negative tests for the release manifest validator's schema
// layer. Docker-dependent scenarios (missing/wrong digest not present in the
// local image store, registry mismatch) are exercised live against a real
// manifest by tools/verify-release-candidate.mjs and the release-candidate
// evidence it produces, rather than faked here with a mocked Docker daemon.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateManifestShape } from "./lib/release-manifest.mjs";

const HEX64 = "a".repeat(64);
const SHA = "b".repeat(40);

function validManifest() {
  const image = (service) => ({
    repository: `localhost:55051/papadata-${service}`,
    tag: SHA,
    digest: `sha256:${HEX64}`,
    reference: `localhost:55051/papadata-${service}@sha256:${HEX64}`,
  });
  return {
    schemaVersion: 1,
    releaseId: "rc-aaaaaaaa-20260101T000000",
    gitSha: SHA,
    dirty: false,
    createdAt: new Date().toISOString(),
    images: {
      api: image("api"),
      bff: image("bff"),
      worker: image("worker"),
      web: image("web"),
    },
    runtimeConfig: { contractFile: "config/production-parity-env.contract.json", hash: HEX64 },
    migrations: { directory: "packages/database/migrations", fileCount: 67, hash: HEX64 },
    terraform: { configHash: HEX64, files: [], sourceRevision: SHA },
    apiContract: { file: "contracts/openapi-1.0.json", version: "1.0" },
  };
}

test("a well-formed manifest passes shape validation", () => {
  const result = validateManifestShape(validManifest());
  assert.equal(result.ok, true, result.errors.join("; "));
});

test("wrong digest: malformed sha256 value fails", () => {
  const manifest = validManifest();
  manifest.images.api.digest = "sha256:not-a-real-digest";
  manifest.images.api.reference = `${manifest.images.api.repository}@${manifest.images.api.digest}`;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("images.api.digest")));
});

test("wrong digest: too-short hex fails", () => {
  const manifest = validManifest();
  manifest.images.web.digest = "sha256:abc123";
  manifest.images.web.reference = `${manifest.images.web.repository}@${manifest.images.web.digest}`;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
});

test("missing digest: absent field fails", () => {
  const manifest = validManifest();
  delete manifest.images.bff.digest;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("images.bff.digest")));
});

test("missing image block entirely fails", () => {
  const manifest = validManifest();
  delete manifest.images.worker;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("images.worker is missing")));
});

test("mutable-only reference: tag with no digest suffix fails", () => {
  const manifest = validManifest();
  manifest.images.api.reference = `${manifest.images.api.repository}:latest`;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("images.api.reference must equal")));
});

test("manifest mismatch: reference digest does not match the digest field (tampered) fails", () => {
  const manifest = validManifest();
  const otherDigest = `sha256:${"c".repeat(64)}`;
  // Simulate someone hand-editing just the digest field without updating the
  // pre-composed reference -- the two must be derived from one source of
  // truth, so any divergence between them is itself a tamper signal.
  manifest.images.api.digest = otherDigest;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes("images.api.reference must equal")));
});

test("wrong schemaVersion fails", () => {
  const manifest = validManifest();
  manifest.schemaVersion = 99;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
});

test("malformed gitSha fails", () => {
  const manifest = validManifest();
  manifest.gitSha = "not-a-sha";
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
});

test("dirty as non-boolean fails", () => {
  const manifest = validManifest();
  manifest.dirty = "false";
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
});

test("runtimeConfig.hash with wrong shape fails", () => {
  const manifest = validManifest();
  manifest.runtimeConfig.hash = "short";
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
});

test("migrations.fileCount of zero fails", () => {
  const manifest = validManifest();
  manifest.migrations.fileCount = 0;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
});

test("terraform.configHash missing fails", () => {
  const manifest = validManifest();
  delete manifest.terraform.configHash;
  const result = validateManifestShape(manifest);
  assert.equal(result.ok, false);
});
