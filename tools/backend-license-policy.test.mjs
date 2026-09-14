import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const licenseReportPath = resolve("artifacts/backend-evidence/licenses.json");

test("production dependency license report is accepted by the fail-closed policy", async () => {
  const report = await readProductionLicenseReport();
  const result = spawnSync(
    process.execPath,
    ["tools/check-license-report.mjs", licenseReportPath],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);

  const policy = JSON.parse(await readFile("config/backend-license-policy.json", "utf8"));
  assert.equal(policy.unknownPolicy, "fail");

  const nodemailer = report["MIT-0"]?.find((item) => item.name === "nodemailer");
  assert.deepEqual(nodemailer?.versions, ["10.0.9"]);

  const packageJson = JSON.parse(await readFile(
    "node_modules/.pnpm/nodemailer@10.0.9/node_modules/nodemailer/package.json",
    "utf8",
  ));
  assert.equal(packageJson.license, "MIT-0");
  assert.ok(policy.allowed.includes(packageJson.license));
});

test("unknown production licenses still fail closed", async () => {
  const temp = await mkdtemp(join(tmpdir(), "papadata-license-policy-"));
  const reportPath = join(temp, "licenses.json");

  try {
    await writeFile(
      reportPath,
      JSON.stringify({
        "Example-Unknown": [
          {
            license: "Example-Unknown",
            name: "example-package",
            versions: ["1.0.0"],
          },
        ],
      }),
    );

    const result = spawnSync(
      process.execPath,
      ["tools/check-license-report.mjs", reportPath],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unknown=Example-Unknown/u);
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});

async function readProductionLicenseReport() {
  if (!existsSync(licenseReportPath)) {
    const output = execFileSync(
      "pnpm",
      ["licenses", "list", "--prod", "--json"],
      { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
    );
    await mkdir(resolve("artifacts/backend-evidence"), { recursive: true });
    await writeFile(licenseReportPath, output);
  }

  return JSON.parse(await readFile(licenseReportPath, "utf8"));
}
