import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(repoRoot, relativePath), "utf8"));
}

export function parseEnv(text) {
  const values = new Map();
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    values.set(line.slice(0, separator), line.slice(separator + 1));
  }
  return values;
}

export function renderExample(contract) {
  const groups = [
    [
      "NODE_ENV",
      "POSTGRES_PASSWORD",
      "PAPADATA_APP_PASSWORD",
      "PAPADATA_PLATFORM_PASSWORD",
      "PAPADATA_TEST_PASSWORD",
      "REDIS_PASSWORD",
      "MINIO_ROOT_USER",
      "MINIO_ROOT_PASSWORD",
    ],
    ["DATABASE_URL", "SCHEDULER_DATABASE_URL", "REDIS_URL", "REDIS_CA_BASE64"],
    [
      "PAPADATA_STORAGE_DRIVER",
      "PAPADATA_STORAGE_BUCKET",
      "PAPADATA_STORAGE_ENDPOINT",
      "PAPADATA_STORAGE_ACCESS_KEY",
      "PAPADATA_STORAGE_SECRET_KEY",
    ],
    [
      "PAPADATA_API_AUTH_ACTIVE_SECRET",
      "PAPADATA_API_AUTH_PREVIOUS_SECRET",
      "PAPADATA_API_AUTH_ISSUER",
      "PAPADATA_API_AUTH_AUDIENCE",
      "PAPADATA_API_AUTH_SESSION_STORE",
      "PAPADATA_API_AUTH_SESSION_REDIS_PREFIX",
      "PAPADATA_INFRASTRUCTURE_AUTH_TOKEN",
      "MFA_ENCRYPTION_KEY",
    ],
    [
      "BFF_PORT",
      "API_ORIGIN",
      "BFF_ALLOWED_ORIGINS",
      "BFF_PUBLIC_HOSTS",
      "BFF_COOKIE_SECRET",
      "BFF_COOKIE_PREVIOUS_SECRET",
      "BFF_CSRF_SECRET",
      "BFF_REFRESH_COOKIE_SECRET",
      "BFF_REFRESH_COOKIE_PREVIOUS_SECRET",
      "BFF_INTERNAL_AUTH_ACTIVE_SECRET",
      "BFF_INTERNAL_AUTH_PREVIOUS_SECRET",
      "BFF_INTERNAL_AUTH_ISSUER",
      "BFF_INTERNAL_AUTH_AUDIENCE",
      "BFF_SESSION_STORE",
      "BFF_SESSION_REDIS_PREFIX",
      "BFF_RATE_LIMIT_MAX",
      "BFF_RATE_LIMIT_WINDOW_MS",
      "BFF_MAX_BODY_BYTES",
    ],
    ["OTEL_EXPORTER_OTLP_ENDPOINT"],
  ];
  const byName = new Map(contract.entries.map((entry) => [entry.name, entry]));
  const lines = [
    "# GENERATED from config/production-parity-env.contract.json.",
    "# Do not edit by hand. Run: pnpm generate:production-parity-env-example",
    "",
  ];

  for (const names of groups) {
    for (const name of names) {
      const entry = byName.get(name);
      if (!entry) throw new Error(`Missing env contract entry: ${name}`);
      lines.push(`${name}=${entry.example ?? ""}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function randomHex(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export async function resolveEnvironment(
  contract,
  localContract,
  existing = new Map(),
  options = {},
) {
  const values = new Map();
  const entries = new Map(contract.entries.map((entry) => [entry.name, entry]));
  const virtual = new Map([
    ["LOCAL_PUBLIC_HOST", localContract.canonicalLocalEndpoint.hostname],
  ]);

  async function resolveName(name, stack = []) {
    if (values.has(name)) return values.get(name);
    if (virtual.has(name)) return virtual.get(name);
    if (stack.includes(name)) {
      throw new Error(`Circular env contract reference: ${[...stack, name].join(" -> ")}`);
    }
    const entry = entries.get(name);
    if (!entry) throw new Error(`Unknown env contract reference: ${name}`);
    const source = entry.source ?? {};
    let value;

    if (source.kind === "literal") {
      value = String(source.value);
    } else if (source.kind === "randomHex") {
      value = !options.regenerate && existing.get(name)
        ? existing.get(name)
        : randomHex(Number(source.bytes ?? 32));
    } else if (source.kind === "randomUser") {
      value = !options.regenerate && existing.get(name)
        ? existing.get(name)
        : `${source.prefix ?? "parity-"}${randomHex(Number(source.bytes ?? 6))}`;
    } else if (source.kind === "reference") {
      value = await resolveName(source.from, [...stack, name]);
    } else if (source.kind === "contract") {
      const path = String(source.path).split(".");
      value = path.reduce((current, part) => current?.[part], localContract);
      if (typeof value !== "string") {
        throw new Error(`Contract path ${source.path} does not resolve to text.`);
      }
    } else if (source.kind === "template") {
      value = String(source.value);
      const matches = [...value.matchAll(/\$\{([A-Z0-9_]+)\}/gu)];
      for (const match of matches) {
        const replacement = await resolveName(match[1], [...stack, name]);
        value = value.replaceAll(match[0], replacement);
      }
    } else if (source.kind === "fileBase64") {
      const content = await readFile(resolve(repoRoot, source.path));
      value = Buffer.from(content).toString("base64");
    } else {
      throw new Error(`Unsupported env source kind for ${name}: ${String(source.kind)}`);
    }

    values.set(name, String(value));
    return String(value);
  }

  for (const entry of contract.entries) await resolveName(entry.name);
  return values;
}

export function renderEnvironment(contract, values) {
  const lines = [];
  for (const entry of contract.entries) {
    const value = values.get(entry.name);
    if (value === undefined) throw new Error(`Missing generated value for ${entry.name}`);
    lines.push(`${entry.name}=${value}`);
  }
  return `${lines.join("\n")}\n`;
}
