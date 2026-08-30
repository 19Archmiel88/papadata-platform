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

visit(report);

const denied = [];
const review = [];
const unknown = [];
for (const expression of licenses) {
  for (const license of normalizeLicenseExpression(expression)) {
    if (policy.denied.includes(license)) denied.push(license);
    else if (policy.reviewRequired.includes(license)) review.push(license);
    else if (!policy.allowed.includes(license)) unknown.push(license);
  }
}

if (denied.length || review.length || (unknown.length && policy.unknownPolicy === "fail")) {
  console.error(
    `LICENSE_POLICY=FAIL denied=${unique(denied).join(",")} review=${unique(review).join(",")} unknown=${unique(unknown).join(",")}`,
  );
  process.exit(1);
}

console.log(`LICENSE_POLICY=PASS licenses=${licenses.size}`);

function visit(value, key = "") {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, key);
    return;
  }
  if (!value || typeof value !== "object") {
    if (/license/iu.test(key) && typeof value === "string") {
      licenses.add(value.trim());
    }
    return;
  }
  for (const [childKey, childValue] of Object.entries(value)) {
    visit(childValue, childKey);
  }
}

function normalizeLicenseExpression(expression) {
  return expression
    .replace(/[()]/gu, "")
    .split(/\s+(?:OR|AND)\s+/iu)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)].sort();
}
