import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const reportPath = process.argv[2];
if (!reportPath) {
  console.error("Usage: node tools/check-license-report.mjs <pnpm-licenses.json>");
  process.exit(2);
}
const policy = JSON.parse(await readFile(resolve("config/backend-license-policy.json"), "utf8"));
const report = JSON.parse(await readFile(resolve(reportPath), "utf8"));
const licenses = new Set();

function visit(value, key = "") {
  if (Array.isArray(value)) return value.forEach((item) => visit(item, key));
  if (!value || typeof value !== "object") {
    if (/license/i.test(key) && typeof value === "string") licenses.add(value.trim());
    return;
  }
  for (const [childKey, childValue] of Object.entries(value)) visit(childValue, childKey);
}
visit(report);

const normalize = (license) => license.replace(/[()]/g, "").split(/\s+(?:OR|AND)\s+/i).map((item) => item.trim());
const denied = [];
const review = [];
const unknown = [];
for (const expression of licenses) {
  for (const license of normalize(expression)) {
    if (policy.denied.includes(license)) denied.push(license);
    else if (policy.reviewRequired.includes(license)) review.push(license);
    else if (!policy.allowed.includes(license)) unknown.push(license);
  }
}

if (denied.length || review.length || (unknown.length && policy.unknownPolicy === "fail")) {
  console.error(`LICENSE_POLICY=FAIL denied=${[...new Set(denied)].join(",")} review=${[...new Set(review)].join(",")} unknown=${[...new Set(unknown)].join(",")}`);
  process.exit(1);
}
console.log(`LICENSE_POLICY=PASS licenses=${licenses.size}`);
