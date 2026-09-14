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

// Groups entries in the generated example file by service, in a stable,
// deterministic order -- so the file stays readably organized without
// requiring anyone to hand-maintain a second, parallel list of names here.
// (schemaVersion 1 did exactly that with a hardcoded `groups` array: any
// contract entry left out of that array was silently dropped from the
// generated example with no test catching it. Deriving the groups from
// contract.entries itself, filtered by parityEntries(), closes that gap.)
const SERVICE_ORDER = ["compose", "migrate", "redis", "storage", "api", "bff", "worker", "edge", "web"];

export function parityEntries(contract) {
  return contract.entries.filter((entry) => entry.environments.includes("production-parity"));
}

export function renderExample(contract) {
  const entries = parityEntries(contract);
  const seen = new Set();
  const lines = [
    "# GENERATED from config/production-parity-env.contract.json.",
    "# Do not edit by hand. Run: pnpm generate:production-parity-env-example",
    "",
  ];

  for (const service of SERVICE_ORDER) {
    const inService = entries.filter(
      (entry) => entry.services.includes(service) && !seen.has(entry.name),
    );
    if (inService.length === 0) continue;
    for (const entry of inService) {
      seen.add(entry.name);
      lines.push(`${entry.name}=${entry.example ?? ""}`);
    }
    lines.push("");
  }

  // Entries whose `services` list doesn't match any SERVICE_ORDER bucket
  // (shouldn't happen, but fail loudly in the example rather than dropping
  // them silently).
  const orphaned = entries.filter((entry) => !seen.has(entry.name));
  if (orphaned.length > 0) {
    throw new Error(
      `renderExample: entries not covered by any known service bucket: ${orphaned.map((e) => e.name).join(", ")}`,
    );
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function randomHex(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

// PAPADATA_AUTH_MAIL_KEY_BASE64 (and any future base64-encoded key/secret
// material) is decoded with Buffer.from(value, "base64") and length-checked
// in raw bytes -- randomHex's hex-encoded output would silently decode to
// the wrong byte length if read back through that same "base64" call, so it
// needs its own encoding, not a second consumer of randomHex.
export function randomBase64(bytes = 32) {
  return randomBytes(bytes).toString("base64");
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
    } else if (source.kind === "randomBase64") {
      value = !options.regenerate && existing.get(name)
        ? existing.get(name)
        : randomBase64(Number(source.bytes ?? 32));
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

  for (const entry of generatedEntries(contract)) await resolveName(entry.name);
  return values;
}

// Entries actually written into the generated .env.production-parity file:
// applicable to production-parity AND carrying a concrete generation recipe.
// An entry with environments including production-parity but source: null
// (e.g. a bounded integer/cron/name knob with a safe code-level default) is
// deliberately left unset so the application's own default applies --
// exactly as it already behaves for every such knob today.
export function generatedEntries(contract) {
  return parityEntries(contract).filter((entry) => entry.source != null);
}

export function renderEnvironment(contract, values) {
  const lines = [];
  for (const entry of generatedEntries(contract)) {
    const value = values.get(entry.name);
    if (value === undefined) throw new Error(`Missing generated value for ${entry.name}`);
    lines.push(`${entry.name}=${value}`);
  }
  return `${lines.join("\n")}\n`;
}
