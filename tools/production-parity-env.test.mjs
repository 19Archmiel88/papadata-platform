// Unit tests for tools/lib/production-parity-env.mjs's value-generation
// primitives. Synthetic fixtures only -- no file I/O, no real contract.
// Run: node --test tools/production-parity-env.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBase64, resolveEnvironment } from "./lib/production-parity-env.mjs";

const localContract = { canonicalLocalEndpoint: { hostname: "papadata.localhost", origin: "https://papadata.localhost" } };

function contractWith(entries) {
  return { entries };
}

test("randomBase64 produces a base64 string that decodes to exactly the requested byte length", () => {
  const value = randomBase64(32);
  const decoded = Buffer.from(value, "base64");
  assert.equal(decoded.length, 32);
  // Sanity: this is genuinely base64, not e.g. hex misread as base64 -- hex
  // output run through the same decode would silently produce a different
  // (wrong) byte length instead of throwing, which is exactly the defect
  // class this primitive exists to avoid for PAPADATA_AUTH_MAIL_KEY_BASE64.
  assert.match(value, /^[A-Za-z0-9+/]+={0,2}$/u);
});

test("randomBase64 defaults to 32 bytes and produces different values across calls", () => {
  const a = randomBase64();
  const b = randomBase64();
  assert.equal(Buffer.from(a, "base64").length, 32);
  assert.notEqual(a, b);
});

test("resolveEnvironment: a randomBase64 entry resolves to a value that decodes to the configured byte length", async () => {
  const contract = contractWith([
    { name: "SOME_KEY_BASE64", environments: ["production-parity"], source: { kind: "randomBase64", bytes: 32 } },
  ]);
  const values = await resolveEnvironment(contract, localContract, new Map(), {});
  const decoded = Buffer.from(values.get("SOME_KEY_BASE64"), "base64");
  assert.equal(decoded.length, 32);
});

test("resolveEnvironment: a randomBase64 entry preserves its existing value across a non-regenerate run (matches randomHex/randomUser)", async () => {
  const contract = contractWith([
    { name: "SOME_KEY_BASE64", environments: ["production-parity"], source: { kind: "randomBase64", bytes: 32 } },
  ]);
  const existing = new Map([["SOME_KEY_BASE64", "existing-value-should-survive"]]);

  const values = await resolveEnvironment(contract, localContract, existing, { regenerate: false });

  assert.equal(values.get("SOME_KEY_BASE64"), "existing-value-should-survive");
});

test("resolveEnvironment: a randomBase64 entry is rotated when regenerate is explicitly requested", async () => {
  const contract = contractWith([
    { name: "SOME_KEY_BASE64", environments: ["production-parity"], source: { kind: "randomBase64", bytes: 32 } },
  ]);
  const existing = new Map([["SOME_KEY_BASE64", "existing-value-should-not-survive"]]);

  const values = await resolveEnvironment(contract, localContract, existing, { regenerate: true });

  assert.notEqual(values.get("SOME_KEY_BASE64"), "existing-value-should-not-survive");
  assert.equal(Buffer.from(values.get("SOME_KEY_BASE64"), "base64").length, 32);
});
