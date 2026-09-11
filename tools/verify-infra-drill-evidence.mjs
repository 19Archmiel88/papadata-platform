import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const path = resolve(process.cwd(), process.env.PAPADATA_INFRA_DRILL_EVIDENCE ?? "artifacts/p1-infra-drill-evidence.json");
const maxAgeDays = Number(process.env.PAPADATA_INFRA_DRILL_MAX_AGE_DAYS ?? 30);
const doc = JSON.parse(await readFile(path, "utf8"));
const failures = [];
for (const key of ["cloudSqlRestore", "redisFailover", "cloudArmor", "loadBalancerTls"]) {
  const item = doc[key];
  const age = Date.now() - Date.parse(item?.executedAt ?? "");
  if (item?.status !== "pass") failures.push(`${key}: status must be pass`);
  if (!Number.isFinite(age) || age < 0 || age > maxAgeDays * 86400000) failures.push(`${key}: evidence must be <= ${maxAgeDays} days old`);
  if (typeof item?.reference !== "string" || !item.reference.trim()) failures.push(`${key}: evidence reference is required`);
}
console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", evidence: path, failures }, null, 2));
if (failures.length) process.exitCode = 1;
