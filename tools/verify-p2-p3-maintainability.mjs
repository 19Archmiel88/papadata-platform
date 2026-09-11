import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const errors = [];
const text = (path) => readFileSync(resolve(root, path), "utf8");
const exists = (path) => existsSync(resolve(root, path));
const check = (condition, message) => { if (!condition) errors.push(message); };

const storybookHeader = text("rejestry/storybook.csv").split(/\r?\n/u)[0].split(",");
for (const field of ["target_status", "story_exists", "runtime_used", "test_executed", "acceptance_status"]) {
  check(storybookHeader.includes(field), `P2-02 missing storybook state field: ${field}`);
}
check(exists("scripts/regenerate_storybook_registry_state.py"), "P2-02 storybook runtime-state generator is missing");

const runtimeReportFiles = [
  "apps/api/src/production/reports/report.service.ts",
  "packages/database/src/remediation.ts",
  "apps/worker/src/production/platform-worker.service.ts",
  "tests/backend-production-parity/e2e.mjs",
];
for (const path of runtimeReportFiles) {
  check(!text(path).includes("app.report_requests"), `P2-03 legacy report_requests still active in ${path}`);
}
check(exists("packages/database/migrations/0070_unify_report_export_lifecycle.sql"), "P2-03 report lifecycle migration is missing");
check(text("packages/database/migrations/0070_unify_report_export_lifecycle.sql").includes("REVOKE INSERT, UPDATE, DELETE ON app.report_requests"), "P2-03 legacy report table is not frozen read-only");

check(text("scripts/validate_all.py").includes("DEPRECATED"), "P2-04 validate_all.py must fail loudly as deprecated");
check(exists("scripts/validate_specification_archive.py"), "P2-04 historical specification validator is missing");
check(exists("scripts/validate_repository.py"), "P2-04 canonical repository validator is missing");

for (const path of [
  "scripts/validate_docs.py",
  "scripts/validate_descriptive_coverage.py",
  "scripts/validate_e2e_step_bindings.py",
  "scripts/validate_operation_ids.py",
  "scripts/validate_auth_api_contract.py",
  "scripts/validate_structural.py",
  "scripts/validate_story_targets.py",
]) {
  check(!exists(path), `P2-04 obsolete validate_all wrapper still exists: ${path}`);
}
check(text("scripts/finalize_package.py").includes("validate_specification_archive.py"), "P2-04 archive finalizer must invoke the archive validator explicitly");
check(exists("scripts/validate_documentation_maintainability.py"), "P2-01 documentation maintainability validator is missing");

const releaseScope = JSON.parse(text("config/backend-release-scope.json"));
check(releaseScope.schemaVersion === 4, "P3 backend release scope must use schemaVersion 4");
check(releaseScope.scopeId === "backend-production-runtime", "P3 backend release scope must use stable scopeId");
check(!Object.hasOwn(releaseScope, "releaseName"), "P3 backend release scope must not contain historical releaseName");
check(!Object.hasOwn(releaseScope, "baseHead"), "P3 backend release scope must not contain stale baseHead");
check(releaseScope.revisionPolicy?.releaseEvidenceRequiresCleanCommit === true, "P3 release evidence must require a clean immutable commit");
check(text("tools/generate-backend-evidence.mjs").includes("gitWorkingTreeClean"), "P3 evidence generator must enforce a clean working tree");

if (errors.length) {
  console.error(JSON.stringify({ status: "FAIL", errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: "PASS", checks: ["P2-01", "P2-02", "P2-03", "P2-04", "P3"] }, null, 2));
}
