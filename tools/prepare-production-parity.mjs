import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
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
const envPath = resolve(repoRoot, contract.generatedEnvFile);
const regenerate = process.env.PAPADATA_REGENERATE_PARITY === "1";

assertCommand("openssl");
await mkdir(tlsDir, { recursive: true });
await chmod(runtimeDir, 0o700);
await chmod(tlsDir, 0o700);

const existing = existsSync(envPath)
  ? parseEnv(await readFile(envPath, "utf8"))
  : new Map();

const requiredTlsFiles = ["ca.crt", "ca.key", "server.crt", "server.key"]
  .map((name) => resolve(tlsDir, name));
if (!requiredTlsFiles.every((path) => existsSync(path))
  || !hasValidCertificate(resolve(tlsDir, "server.crt"))) {
  await generateRedisTls(runtimeDir, tlsDir);
}

const values = await resolveEnvironment(contract, localContract, existing, { regenerate });
await writeFile(envPath, renderEnvironment(contract, values), { encoding: "utf8", mode: 0o600 });
await chmod(envPath, 0o600);
await chmod(resolve(tlsDir, "ca.key"), 0o600);
await chmod(resolve(tlsDir, "server.key"), 0o600);
await chmod(resolve(tlsDir, "ca.crt"), 0o644);
await chmod(resolve(tlsDir, "server.crt"), 0o644);

console.log("Production-parity environment prepared.");
console.log(`Environment file: ${envPath}`);
console.log(`Redis TLS assets: ${tlsDir}`);
console.log(`Canonical local origin: ${localContract.canonicalLocalEndpoint.origin}`);
if (regenerate) {
  console.warn("WARNING: secrets were rotated. Persistent parity volumes may still contain credentials derived from the previous environment.");
  console.warn("For a clean rotation use: docker compose -f compose.production-parity.yml down -v");
}
console.log("Next: pnpm verify:production-parity-env");
console.log("Then: pnpm start:production-parity");

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

function runOpenSsl(args) {
  const result = spawnSync("openssl", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`OpenSSL failed: ${result.stderr || result.stdout || args.join(" ")}`);
  }
}
