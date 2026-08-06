import { readFile } from "node:fs/promises";
const manifest = JSON.parse(await readFile(new URL("../../config/backend-release-scope.json", import.meta.url), "utf8"));
const remaining = manifest.operations.filter((item) => item.implementation === "contract-compatibility-runtime");
for (const item of remaining) console.log(`${item.operationId}\t${item.method}\t${item.servicePath}`);
console.error(`REMAINING_COMPATIBILITY_OPERATIONS=${remaining.length}`);
