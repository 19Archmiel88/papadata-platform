import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

const root = resolve(process.cwd());
const output = resolve(root, "artifacts/backend-evidence");
await mkdir(output, { recursive: true });

function run(command, args) {
  try {
    return { status: "pass", output: execFileSync(command, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim() };
  } catch (error) {
    return { status: "fail", output: `${error.stdout ?? ""}${error.stderr ?? ""}`.trim() };
  }
}

async function sha256(path) {
  const body = await readFile(path);
  return createHash("sha256").update(body).digest("hex");
}

const release = run(process.execPath, ["tools/verify-backend-release-scope.mjs"]);
const security = run(process.execPath, ["tools/verify-backend-security-controls.mjs"]);
const manifest = JSON.parse(await readFile(resolve(root, "config/backend-release-scope.json"), "utf8"));
const controlMatrix = JSON.parse(await readFile(resolve(root, "config/backend-security-controls.json"), "utf8"));
let gitHead = "unavailable";
try {
  gitHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
} catch {}

const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  gitHead,
  releaseName: manifest.releaseName,
  targetReleaseClaimed: manifest.contractPosition.targetReleaseClaimed,
  checks: { release, security },
  operationCount: manifest.operations.length,
  controlCount: controlMatrix.controls.length,
  acceptancePending: controlMatrix.controls.filter((item) => !["implemented", "release_scope_control", "excluded_storybook_context"].includes(item.status)).map((item) => item.findingId),
  hashes: {
    releaseScope: await sha256(resolve(root, "config/backend-release-scope.json")),
    securityControls: await sha256(resolve(root, "config/backend-security-controls.json")),
  },
};

await writeFile(resolve(output, "backend-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
await writeFile(resolve(output, "route-map.json"), `${JSON.stringify(manifest.operations, null, 2)}\n`);
await writeFile(resolve(output, "security-control-snapshot.json"), `${JSON.stringify(controlMatrix, null, 2)}\n`);

const files = (await readdir(output)).sort();
const sums = [];
for (const name of files) {
  if (name === "SHA256SUMS") continue;
  sums.push(`${await sha256(resolve(output, name))}  ${relative(output, resolve(output, name))}`);
}
await writeFile(resolve(output, "SHA256SUMS"), `${sums.join("\n")}\n`);

console.log(`BACKEND_EVIDENCE=${release.status === "pass" && security.status === "pass" ? "PASS" : "FAIL"} path=${relative(root, output)}`);
if (release.status !== "pass" || security.status !== "pass") process.exitCode = 1;
