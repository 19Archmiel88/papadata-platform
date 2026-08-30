import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readJson, renderExample, repoRoot } from "./lib/production-parity-env.mjs";

const contract = await readJson("config/production-parity-env.contract.json");
const expected = renderExample(contract);
const output = resolve(repoRoot, contract.generatedExampleFile);
const check = process.argv.includes("--check");

if (check) {
  const actual = await readFile(output, "utf8");
  if (actual !== expected) {
    console.error(`${contract.generatedExampleFile} is out of date.`);
    console.error("Run: pnpm generate:production-parity-env-example");
    process.exitCode = 1;
  } else {
    console.log(`${contract.generatedExampleFile}: OK`);
  }
} else {
  await writeFile(output, expected, "utf8");
  console.log(`Generated ${contract.generatedExampleFile}`);
}
