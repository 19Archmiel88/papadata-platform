// Contract tests for the local identity-metadata emulator -- proves it
// faithfully replicates the request/response shape
// apps/bff/src/cloud-run-identity.service.ts depends on (see that file's
// tests for the consumer side of the same contract).
import { test } from "node:test";
import assert from "node:assert/strict";

test("identity emulator: rejects requests without Metadata-Flavor: Google", async () => {
  const { spawnServer, stopServer, baseUrl } = await startEmulator();
  try {
    const response = await fetch(`${baseUrl}/computeMetadata/v1/instance/service-accounts/default/identity?audience=https://api.example&format=full`);
    assert.equal(response.status, 403);
  } finally {
    stopServer();
  }
});

test("identity emulator: rejects requests missing audience", async () => {
  const { stopServer, baseUrl } = await startEmulator();
  try {
    const response = await fetch(`${baseUrl}/computeMetadata/v1/instance/service-accounts/default/identity?format=full`, {
      headers: { "Metadata-Flavor": "Google" },
    });
    assert.equal(response.status, 400);
  } finally {
    stopServer();
  }
});

test("identity emulator: rejects requests missing format=full", async () => {
  const { stopServer, baseUrl } = await startEmulator();
  try {
    const response = await fetch(`${baseUrl}/computeMetadata/v1/instance/service-accounts/default/identity?audience=https://api.example`, {
      headers: { "Metadata-Flavor": "Google" },
    });
    assert.equal(response.status, 400);
  } finally {
    stopServer();
  }
});

test("identity emulator: issues a JWT-shaped token with the requested audience", async () => {
  const { stopServer, baseUrl } = await startEmulator();
  try {
    const response = await fetch(`${baseUrl}/computeMetadata/v1/instance/service-accounts/default/identity?audience=https://api.example&format=full`, {
      headers: { "Metadata-Flavor": "Google" },
    });
    assert.equal(response.status, 200);
    const token = await response.text();
    const segments = token.split(".");
    assert.equal(segments.length, 3);
    const payload = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8"));
    assert.equal(payload.aud, "https://api.example");
    assert.ok(typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000));
  } finally {
    stopServer();
  }
});

async function startEmulator() {
  const { spawn } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const { dirname, resolve } = await import("node:path");
  const scriptPath = resolve(dirname(fileURLToPath(import.meta.url)), "server.mjs");
  const port = 20000 + Math.floor(Math.random() * 10000);
  const child = spawn(process.execPath, [scriptPath], {
    env: { ...process.env, IDENTITY_EMULATOR_PORT: String(port) },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((resolvePromise, rejectPromise) => {
    const timeout = setTimeout(() => rejectPromise(new Error("identity emulator did not start in time")), 5000);
    child.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("listening")) {
        clearTimeout(timeout);
        resolvePromise();
      }
    });
    child.on("error", rejectPromise);
  });
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    stopServer: () => child.kill(),
  };
}
