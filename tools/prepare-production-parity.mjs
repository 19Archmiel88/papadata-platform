import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  parseEnv,
  readJson,
  renderEnvironment,
  repoRoot,
  resolveEnvironment,
} from "./lib/production-parity-env.mjs";

const contract = await readJson("config/production-parity-env.contract.json");
const localContract = await readJson(contract.localContract);
const runtimeDir = resolve(repoRoot, ".runtime/backend-production-parity");
const tlsDir = resolve(runtimeDir, "redis-tls");
const edgeTlsDir = resolve(runtimeDir, "edge-tls");
const postgresTlsDir = resolve(runtimeDir, "postgres-tls");
const envPath = resolve(repoRoot, contract.generatedEnvFile);
const regenerate = process.env.PAPADATA_REGENERATE_PARITY === "1";
// Must match the alpine postgres image's built-in `postgres` OS user
// (`id postgres` inside postgres:16.13-alpine reports uid=70(postgres)
// gid=70(postgres)). Postgres refuses to start if ssl_key_file is
// group/world-accessible OR not owned by that uid (or root), so the key
// generated on the host -- which cannot chown to an arbitrary uid without
// root -- is re-owned via a throwaway container run as root against the
// exact same image, which can.
const POSTGRES_CONTAINER_UID = 70;

assertCommand("openssl");
assertCommand("docker");
await ensureRuntimeDirectory(tlsDir, 0o700);
await ensureRuntimeDirectory(edgeTlsDir, 0o755);
await ensureRuntimeDirectory(postgresTlsDir, 0o755);
await chmod(runtimeDir, 0o700);
await chmod(tlsDir, 0o700);
await chmod(edgeTlsDir, 0o755);
await chmod(postgresTlsDir, 0o755);

const existing = await readEnvIfPresent(envPath);

const requiredTlsFiles = ["ca.crt", "ca.key", "server.crt", "server.key"]
  .map((name) => resolve(tlsDir, name));
if (
  regenerate
  || !requiredTlsFiles.every((path) => existsSync(path))
  || !hasValidCertificate(resolve(tlsDir, "server.crt"))
) {
  await generateRedisTls(runtimeDir, tlsDir);
}

const requiredEdgeTlsFiles = ["ca.crt", "ca.key", "server.crt", "server.key"]
  .map((name) => resolve(edgeTlsDir, name));
if (
  regenerate
  || !requiredEdgeTlsFiles.every((path) => existsSync(path))
  || !hasValidCertificate(resolve(edgeTlsDir, "server.crt"))
) {
  await generateEdgeTls(runtimeDir, edgeTlsDir, localContract.canonicalLocalEndpoint.hostname);
}

const requiredPostgresTlsFiles = ["ca.crt", "ca.key", "server.crt", "server.key"]
  .map((name) => resolve(postgresTlsDir, name));
if (
  regenerate
  || !requiredPostgresTlsFiles.every((path) => existsSync(path))
  || !hasValidCertificate(resolve(postgresTlsDir, "server.crt"))
) {
  await generatePostgresTls(runtimeDir, postgresTlsDir);
}

const values = await resolveEnvironment(contract, localContract, existing, { regenerate });
await writeEnvAtomic(envPath, renderEnvironment(contract, values));
await chmod(resolve(tlsDir, "ca.key"), 0o600);
await chmod(resolve(tlsDir, "server.key"), 0o600);
await chmod(resolve(tlsDir, "ca.crt"), 0o644);
await chmod(resolve(tlsDir, "server.crt"), 0o644);
await chmod(resolve(edgeTlsDir, "ca.key"), 0o600);
await chmod(resolve(edgeTlsDir, "server.key"), 0o644);
await chmod(resolve(edgeTlsDir, "ca.crt"), 0o644);
await chmod(resolve(edgeTlsDir, "server.crt"), 0o644);
await chmod(resolve(postgresTlsDir, "ca.key"), 0o600);
await chmod(resolve(postgresTlsDir, "ca.crt"), 0o644);
await reownPostgresServerKey(postgresTlsDir);

console.log("Production-parity environment prepared.");
console.log(`Environment file: ${envPath}`);
console.log(`Redis TLS assets: ${tlsDir}`);
console.log(`Edge TLS assets: ${edgeTlsDir}`);
console.log(`PostgreSQL TLS assets: ${postgresTlsDir}`);
console.log(`Canonical local origin: ${localContract.canonicalLocalEndpoint.origin}`);
console.log(`Next: pnpm verify:production-parity-env`);
console.log(`Then: pnpm start:production-parity`);
if (regenerate) {
  console.warn("WARNING: secrets were rotated. Persistent parity volumes may still contain previous credentials.");
  console.warn("For a clean rotation use: docker compose -f compose.production-parity.yml --env-file .env.production-parity down -v");
}

async function readEnvIfPresent(path) {
  try {
    return parseEnv(await readFile(path, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") return new Map();
    throw error;
  }
}

// Writes via a uniquely-named temp file in the same directory, then rename()s
// it into place. rename() atomically replaces whatever is at `path` -- even a
// symlink -- without ever opening/writing through it, which closes the
// check-then-write race a plain writeFile(path, ...) after an existsSync/read
// would have.
async function writeEnvAtomic(path, content) {
  const tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tempPath, content, { encoding: "utf8", mode: 0o600, flag: "wx" });
  await rename(tempPath, path);
}

async function ensureRuntimeDirectory(path, mode) {
  try {
    await mkdir(path, { recursive: true, mode });
  } catch (error) {
    throw explainRuntimePermission(error);
  }

  try {
    await chmod(path, mode);
  } catch (error) {
    throw explainRuntimePermission(error);
  }
}

function explainRuntimePermission(error) {
  if (error && typeof error === "object" && ["EACCES", "EPERM"].includes(error.code)) {
    return new Error(
      `${runtimeDir} is not writable by the current user. Remove or chown the generated .runtime directory and rerun pnpm prepare:production-parity.`,
    );
  }
  return error;
}

function assertCommand(command) {
  const result = spawnSync(command, ["version"], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${command} is required.`);
}

function hasValidCertificate(path) {
  if (!existsSync(path)) return false;
  return spawnSync("openssl", ["x509", "-checkend", "86400", "-noout", "-in", path], {
    stdio: "ignore",
  }).status === 0;
}

async function generateRedisTls(runtimeDirectory, tlsDirectory) {
  const configPath = resolve(runtimeDirectory, "redis-server.cnf");
  await writeFile(configPath, `[req]
distinguished_name = dn
prompt = no
req_extensions = req_ext

[dn]
CN = redis-production

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = redis-production
DNS.2 = localhost
IP.1 = 127.0.0.1
`, "utf8");

  runOpenSsl([
    "req", "-x509", "-newkey", "rsa:3072", "-sha256", "-nodes", "-days", "30",
    "-subj", "/CN=PapaData Production Parity Redis CA",
    "-keyout", resolve(tlsDirectory, "ca.key"),
    "-out", resolve(tlsDirectory, "ca.crt"),
  ]);
  runOpenSsl([
    "req", "-newkey", "rsa:3072", "-sha256", "-nodes",
    "-config", configPath,
    "-keyout", resolve(tlsDirectory, "server.key"),
    "-out", resolve(tlsDirectory, "server.csr"),
  ]);
  runOpenSsl([
    "x509", "-req", "-sha256", "-days", "30",
    "-in", resolve(tlsDirectory, "server.csr"),
    "-CA", resolve(tlsDirectory, "ca.crt"),
    "-CAkey", resolve(tlsDirectory, "ca.key"),
    "-CAcreateserial",
    "-extfile", configPath,
    "-extensions", "req_ext",
    "-out", resolve(tlsDirectory, "server.crt"),
  ]);
}

async function generateEdgeTls(runtimeDirectory, tlsDirectory, hostname) {
  const configPath = resolve(runtimeDirectory, "edge-server.cnf");
  await writeFile(configPath, `[req]
distinguished_name = dn
prompt = no
req_extensions = req_ext

[dn]
CN = ${hostname}

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${hostname}
`, "utf8");

  runOpenSsl([
    "req", "-x509", "-newkey", "rsa:3072", "-sha256", "-nodes", "-days", "30",
    "-subj", "/CN=PapaData Production Parity Edge CA",
    "-keyout", resolve(tlsDirectory, "ca.key"),
    "-out", resolve(tlsDirectory, "ca.crt"),
  ]);
  runOpenSsl([
    "req", "-newkey", "rsa:3072", "-sha256", "-nodes",
    "-config", configPath,
    "-keyout", resolve(tlsDirectory, "server.key"),
    "-out", resolve(tlsDirectory, "server.csr"),
  ]);
  runOpenSsl([
    "x509", "-req", "-sha256", "-days", "30",
    "-in", resolve(tlsDirectory, "server.csr"),
    "-CA", resolve(tlsDirectory, "ca.crt"),
    "-CAkey", resolve(tlsDirectory, "ca.key"),
    "-CAcreateserial",
    "-extfile", configPath,
    "-extensions", "req_ext",
    "-out", resolve(tlsDirectory, "server.crt"),
  ]);
}

async function generatePostgresTls(runtimeDirectory, tlsDirectory) {
  const configPath = resolve(runtimeDirectory, "postgres-server.cnf");
  await writeFile(configPath, `[req]
distinguished_name = dn
prompt = no
req_extensions = req_ext

[dn]
CN = postgres-production

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = postgres-production
DNS.2 = localhost
IP.1 = 127.0.0.1
`, "utf8");

  runOpenSsl([
    "req", "-x509", "-newkey", "rsa:3072", "-sha256", "-nodes", "-days", "30",
    "-subj", "/CN=PapaData Production Parity PostgreSQL CA",
    "-keyout", resolve(tlsDirectory, "ca.key"),
    "-out", resolve(tlsDirectory, "ca.crt"),
  ]);
  runOpenSsl([
    "req", "-newkey", "rsa:3072", "-sha256", "-nodes",
    "-config", configPath,
    "-keyout", resolve(tlsDirectory, "server.key"),
    "-out", resolve(tlsDirectory, "server.csr"),
  ]);
  runOpenSsl([
    "x509", "-req", "-sha256", "-days", "30",
    "-in", resolve(tlsDirectory, "server.csr"),
    "-CA", resolve(tlsDirectory, "ca.crt"),
    "-CAkey", resolve(tlsDirectory, "ca.key"),
    "-CAcreateserial",
    "-extfile", configPath,
    "-extensions", "req_ext",
    "-out", resolve(tlsDirectory, "server.crt"),
  ]);
}

// postgres:16.13-alpine's `postgres` OS user is uid/gid 70. Postgres
// refuses to start ("private key file ... has group or world access") if
// ssl_key_file is readable by anyone but its owner (or root), and the file
// generated on the host by openssl is owned by whichever uid ran this
// script -- not 70. A throwaway container run as root (the image's default
// user before its entrypoint drops privileges) against the exact same
// image can chown/chmod it correctly on the host-mounted directory; a
// non-root host process cannot chown to an arbitrary uid it does not own.
async function reownPostgresServerKey(tlsDirectory) {
  const result = spawnSync("docker", [
    "run", "--rm",
    "-v", `${tlsDirectory}:/certs`,
    "postgres:16.13-alpine",
    "sh", "-c",
    `chown ${POSTGRES_CONTAINER_UID}:${POSTGRES_CONTAINER_UID} /certs/server.key && chmod 600 /certs/server.key && chmod 644 /certs/server.crt`,
  ], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Failed to set PostgreSQL TLS key ownership: ${result.stderr || result.stdout}`);
  }
}

function runOpenSsl(args) {
  const result = spawnSync("openssl", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`OpenSSL failed: ${result.stderr || result.stdout || args.join(" ")}`);
  }
}
