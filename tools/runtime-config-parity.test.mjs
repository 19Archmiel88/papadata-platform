// Unit tests for the runtime-config-parity discovery/comparison functions
// (tools/lib/runtime-config-discovery.mjs). All fixtures are synthetic --
// none of this touches the real contract, real Terraform, or real source --
// so each failure class can be exercised in isolation, including negative
// (should-not-fire) cases.
//
// Run: node --test tools/runtime-config-parity.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  discoverEnvVarsInSource,
  discoverTerraformEnvVars,
  discoverComposeServiceEnvironmentOverride,
  compareRuntimeAgainstContract,
  compareTerraformAgainstContract,
  checkProductionParityCoverage,
  checkLocalOnlyNeverReachesProduction,
  checkSecretNameHeuristic,
  checkRequiredOptionalConsistency,
  checkDuplicateNames,
  checkUnusedContractEntries,
  checkEnvironmentBehaviorExceptions,
  checkDynamicNameSites,
  findBlocks,
} from "./lib/runtime-config-discovery.mjs";

const ALL_ENV = ["dev", "production-parity", "staging", "production"];

function baseEntry(overrides) {
  return {
    name: "EXAMPLE_VAR",
    services: ["api"],
    type: "string",
    secret: false,
    environments: [...ALL_ENV],
    required: { dev: false, "production-parity": false, staging: false, production: false },
    source: { kind: "literal", value: "x" },
    terraform: null,
    defaultPolicy: "fallback",
    validation: "",
    consumer: "",
    productionOnlyReason: null,
    parityOnlyReason: null,
    example: "x",
    ...overrides,
  };
}

function contractWith(entries, extra = {}) {
  return { environments: ALL_ENV, entries, services: {}, environmentBehaviorExceptions: [], dynamicNameSites: [], ...extra };
}

// 1. Runtime variable missing in schema (Class A) ----------------------------

test("Class A: runtime code reading an undeclared var fails", () => {
  const contract = contractWith([baseEntry({ name: "KNOWN_VAR" })]);
  const failures = compareRuntimeAgainstContract(new Set(["KNOWN_VAR", "UNDECLARED_VAR"]), contract);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /UNDECLARED_VAR/u);
});

test("Class A negative: every discovered name declared passes clean", () => {
  const contract = contractWith([baseEntry({ name: "KNOWN_VAR" })]);
  const failures = compareRuntimeAgainstContract(new Set(["KNOWN_VAR"]), contract);
  assert.deepEqual(failures, []);
});

test("discoverEnvVarsInSource finds process.env.X, env.X, bracket access, and helper calls, but not import.meta.env", () => {
  const source = `
    const a = process.env.FOO_BAR;
    const b = env.BAZ_QUX;
    const c = process.env["BRACKET_NAME"];
    const d = requiredText(env, "HELPER_NAME");
    const e = readCredentials(process.env, "MULTI_A", "MULTI_B");
    const f = import.meta.env.DEV;
    const g = readPositiveIntEnv("LOCAL_HELPER_VAR", 30);
  `;
  const { names } = discoverEnvVarsInSource(source);
  for (const expected of ["FOO_BAR", "BAZ_QUX", "BRACKET_NAME", "HELPER_NAME", "MULTI_A", "MULTI_B", "LOCAL_HELPER_VAR"]) {
    assert.ok(names.has(expected), `expected ${expected} to be discovered`);
  }
  assert.ok(!names.has("DEV"), "import.meta.env.DEV must not be treated as a process env var");
});

test("discoverEnvVarsInSource does not treat error/reason codes as env names", () => {
  const source = `return unavailable("MISSING_INVENTORY_AUTHORITY", "message");`;
  const { names } = discoverEnvVarsInSource(source);
  assert.equal(names.size, 0);
});

// 2. Terraform-only variable (Class B) ---------------------------------------

test("Class B: Terraform-injected var absent from contract fails", () => {
  const contract = contractWith([baseEntry({ name: "KNOWN_VAR", services: ["api"] })]);
  const terraformByService = new Map([["api", new Map([["KNOWN_VAR", { secret: false }], ["TF_ONLY_VAR", { secret: false }]])]]);
  const failures = compareTerraformAgainstContract(terraformByService, contract);
  assert.ok(failures.some((f) => f.includes("TF_ONLY_VAR")));
});

test("Class B negative: Terraform vars all declared passes clean", () => {
  const contract = contractWith([baseEntry({ name: "KNOWN_VAR", services: ["api"] })]);
  const terraformByService = new Map([["api", new Map([["KNOWN_VAR", { secret: false }]])]]);
  const failures = compareTerraformAgainstContract(terraformByService, contract);
  assert.deepEqual(failures, []);
});

test("discoverTerraformEnvVars extracts plain env{}, dynamic map, and dynamic list-of-objects forms across services, without over-matching var.environment", () => {
  const tf = `
resource "google_cloud_run_v2_service" "api" {
  template {
    containers {
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      dynamic "env" {
        for_each = {
          DATABASE_URL = "database_url"
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret = local.runtime_secret_ids[env.value]
            }
          }
        }
      }
      dynamic "env" {
        for_each = {
          for entry in [
            { name = "STRIPE_SECRET_KEY", key = "stripe_secret_key" },
          ] : entry.name => entry.key
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret = local.runtime_secret_ids[env.value]
            }
          }
        }
      }
    }
    scaling {
      min_instance_count = var.environment == "production" ? 1 : 0
    }
  }
}

resource "google_cloud_run_v2_worker_pool" "worker" {
  template {
    containers {
      env {
        name  = "WORKER_ONLY_VAR"
        value = "x"
      }
    }
  }
}
`;
  const byService = discoverTerraformEnvVars(tf);
  const api = byService.get("api");
  assert.ok(api, "api service should be discovered");
  assert.deepEqual(api.get("NODE_ENV"), { secret: false });
  assert.deepEqual(api.get("DATABASE_URL"), { secret: true });
  assert.deepEqual(api.get("STRIPE_SECRET_KEY"), { secret: true });
  assert.ok(!api.has("environment"), "var.environment must not be mistaken for an env block");

  const worker = byService.get("worker");
  assert.ok(worker, "worker (google_cloud_run_v2_worker_pool) service should be discovered");
  assert.deepEqual(worker.get("WORKER_ONLY_VAR"), { secret: false });
});

// 3. Parity-only variable (local-only, must be justified and never reach prod)

test("Class D: local-only var without parityOnlyReason fails", () => {
  const contract = contractWith([
    baseEntry({ name: "LOCAL_ONLY_VAR", environments: ["production-parity"], parityOnlyReason: null }),
  ]);
  const failures = checkLocalOnlyNeverReachesProduction(contract, new Map());
  assert.ok(failures.some((f) => f.includes("LOCAL_ONLY_VAR") && f.includes("parityOnlyReason")));
});

test("Class D: local-only var that Terraform also injects fails (would reach production)", () => {
  const contract = contractWith([
    baseEntry({ name: "LOCAL_ONLY_VAR", environments: ["production-parity"], parityOnlyReason: "local infra credential" }),
  ]);
  const terraformByService = new Map([["api", new Map([["LOCAL_ONLY_VAR", { secret: true }]])]]);
  const failures = checkLocalOnlyNeverReachesProduction(contract, terraformByService);
  assert.ok(failures.some((f) => f.includes("LOCAL_ONLY_VAR") && f.includes("Terraform injects")));
});

test("Class D negative / intentional infrastructure exception passes clean", () => {
  const contract = contractWith([
    baseEntry({ name: "MINIO_ROOT_PASSWORD", services: ["compose"], environments: ["production-parity"], secret: true, parityOnlyReason: "MinIO root credential; GCS uses the service account identity instead." }),
  ]);
  const failures = checkLocalOnlyNeverReachesProduction(contract, new Map());
  assert.deepEqual(failures, []);
});

// 4. Production-required variable missing in parity (Class C) ---------------

test("Class C: production-required var absent from parity without productionOnlyReason fails", () => {
  const contract = contractWith([
    baseEntry({
      name: "PROD_ONLY_REQUIRED",
      required: { dev: false, "production-parity": false, staging: true, production: true },
      source: null,
      productionOnlyReason: null,
    }),
  ]);
  const failures = checkProductionParityCoverage(contract);
  assert.ok(failures.some((f) => f.includes("PROD_ONLY_REQUIRED")));
});

test("Class C negative: production-required var with a productionOnlyReason passes", () => {
  const contract = contractWith([
    baseEntry({
      name: "GCS_ONLY_VAR",
      required: { dev: false, "production-parity": false, staging: true, production: true },
      source: null,
      productionOnlyReason: "Only meaningful for the GCS driver, which production-parity does not use.",
    }),
  ]);
  assert.deepEqual(checkProductionParityCoverage(contract), []);
});

test("Class C negative: production-required var actually available in parity passes", () => {
  const contract = contractWith([
    baseEntry({
      name: "SHARED_REQUIRED",
      required: { dev: false, "production-parity": true, staging: true, production: true },
      source: { kind: "randomHex", bytes: 32 },
    }),
  ]);
  assert.deepEqual(checkProductionParityCoverage(contract), []);
});

// 5. Secret incorrectly declared as plain (Class E) --------------------------

test("Class E: secret-shaped name declared as non-secret fails", () => {
  const contract = contractWith([baseEntry({ name: "SOME_API_SECRET", secret: false })]);
  const failures = checkSecretNameHeuristic(contract);
  assert.ok(failures.some((f) => f.includes("SOME_API_SECRET")));
});

test("Class E: Terraform sourcing via secret_key_ref must match contract.secret", () => {
  const contract = contractWith([baseEntry({ name: "SHOULD_BE_SECRET", services: ["api"], secret: false })]);
  const terraformByService = new Map([["api", new Map([["SHOULD_BE_SECRET", { secret: true }]])]]);
  const failures = compareTerraformAgainstContract(terraformByService, contract);
  assert.ok(failures.some((f) => f.includes("SHOULD_BE_SECRET") && f.startsWith("[E]")));
});

test("Class E negative: reviewed heuristic exception (e.g. a *_TOKEN_TTL duration) passes", () => {
  const contract = contractWith([baseEntry({ name: "BFF_INTERNAL_TOKEN_TTL_SECONDS", secret: false, type: "integer" })]);
  assert.deepEqual(checkSecretNameHeuristic(contract), []);
});

// 6. Service ownership mismatch (Class G) ------------------------------------

test("Class G: Terraform injects a var into a service the contract doesn't scope it to", () => {
  const contract = contractWith([baseEntry({ name: "API_ONLY_VAR", services: ["api"] })]);
  const terraformByService = new Map([["worker", new Map([["API_ONLY_VAR", { secret: false }]])]]);
  const failures = compareTerraformAgainstContract(terraformByService, contract);
  assert.ok(failures.some((f) => f.includes("API_ONLY_VAR") && f.startsWith("[G]")));
});

test("Class G negative: multi-service var matches cleanly", () => {
  const contract = contractWith([baseEntry({ name: "SHARED_VAR", services: ["api", "worker"] })]);
  const terraformByService = new Map([
    ["api", new Map([["SHARED_VAR", { secret: false }]])],
    ["worker", new Map([["SHARED_VAR", { secret: false }]])],
  ]);
  assert.deepEqual(compareTerraformAgainstContract(terraformByService, contract), []);
});

// 7. Required/optional mismatch (Class F) ------------------------------------

test("Class F: required in an environment absent from the entry's environments list fails", () => {
  const contract = contractWith([
    baseEntry({ name: "NARROW_VAR", environments: ["dev"], required: { dev: false, "production-parity": true, staging: false, production: false } }),
  ]);
  const failures = checkRequiredOptionalConsistency(contract);
  assert.ok(failures.some((f) => f.includes("NARROW_VAR")));
});

test("Class F: required declared for an unknown environment name fails", () => {
  const contract = contractWith([
    baseEntry({ name: "TYPO_VAR", required: { dev: false, "production-parity": false, staging: false, production: false, "prod": true } }),
  ]);
  const failures = checkRequiredOptionalConsistency(contract);
  assert.ok(failures.some((f) => f.includes("TYPO_VAR") && f.includes("prod")));
});

test("Class F negative: consistent required/environments passes", () => {
  const contract = contractWith([baseEntry({ name: "CONSISTENT_VAR" })]);
  assert.deepEqual(checkRequiredOptionalConsistency(contract), []);
});

// 8. Duplicate variable -------------------------------------------------------

test("duplicate contract entries are rejected", () => {
  const contract = contractWith([baseEntry({ name: "DUPE" }), baseEntry({ name: "DUPE" })]);
  const failures = checkDuplicateNames(contract);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /DUPE/u);
});

test("duplicate check negative: unique names pass", () => {
  const contract = contractWith([baseEntry({ name: "A" }), baseEntry({ name: "B" })]);
  assert.deepEqual(checkDuplicateNames(contract), []);
});

// 9. Unused variable in schema ------------------------------------------------

test("unused entry (neither runtime nor Terraform reads it) is flagged", () => {
  const contract = contractWith([baseEntry({ name: "DEAD_VAR", services: ["api"] })]);
  const failures = checkUnusedContractEntries(contract, new Set(), new Map());
  assert.ok(failures.some((f) => f.includes("DEAD_VAR")));
});

test("unused check negative: entry read by runtime source is not flagged", () => {
  const contract = contractWith([baseEntry({ name: "USED_VAR", services: ["api"] })]);
  const failures = checkUnusedContractEntries(contract, new Set(["USED_VAR"]), new Map());
  assert.deepEqual(failures, []);
});

test("unused check negative: local-only compose primitive is exempt even though app code never reads it", () => {
  const contract = contractWith([baseEntry({ name: "MINIO_ROOT_USER", services: ["compose", "storage"] })]);
  const failures = checkUnusedContractEntries(contract, new Set(), new Map());
  assert.deepEqual(failures, []);
});

// 10. Intentional infrastructure exception (already covered by the Class D
// negative test above with a MinIO-vs-GCS-style reason) -- also verify the
// dynamic-name-site registry treats a registered site as satisfied.

test("dynamicNameSites: registered site with all resolved names present passes", () => {
  const contract = contractWith(
    [baseEntry({ name: "PAPADATA_TERMS_VERSION" }), baseEntry({ name: "PAPADATA_PRIVACY_VERSION" })],
    {
      dynamicNameSites: [
        { file: "some/file.ts", pattern: "process.env[`${prefix}_VERSION`]", resolvedNames: ["PAPADATA_TERMS_VERSION", "PAPADATA_PRIVACY_VERSION"] },
      ],
    },
  );
  const sourceFilesByPath = new Map([["some/file.ts", "...process.env[`${prefix}_VERSION`]..."]]);
  const failures = checkDynamicNameSites(contract, sourceFilesByPath, new Map());
  assert.deepEqual(failures, []);
});

test("dynamicNameSites: a resolved name missing from the contract fails", () => {
  const contract = contractWith([], {
    dynamicNameSites: [
      { file: "some/file.ts", pattern: "process.env[`${prefix}_VERSION`]", resolvedNames: ["PAPADATA_TERMS_VERSION"] },
    ],
  });
  const sourceFilesByPath = new Map([["some/file.ts", "...process.env[`${prefix}_VERSION`]..."]]);
  const failures = checkDynamicNameSites(contract, sourceFilesByPath, new Map());
  assert.ok(failures.some((f) => f.includes("PAPADATA_TERMS_VERSION")));
});

test("dynamicNameSites: an unregistered dynamic-access site in source is flagged", () => {
  const contract = contractWith([]);
  const sourceFilesByPath = new Map();
  const discovered = new Map([["some/other-file.ts", ["process.env[`${prefix}_NEW`]"]]]);
  const failures = checkDynamicNameSites(contract, sourceFilesByPath, discovered);
  assert.ok(failures.some((f) => f.includes("some/other-file.ts")));
});

// 11. Environment-specific behavior drift (Class H) --------------------------

test("Class H: an undeclared exact-environment fork in a diverging service fails", () => {
  const contract = contractWith([], {
    services: { bff: { configLoader: "bff/config.ts" } },
    environmentBehaviorExceptions: [],
  });
  const sourceFilesByPath = new Map([
    ["bff/config.ts", 'const x = runtimeEnvironment === "production" ? a : b;'],
  ]);
  const failures = checkEnvironmentBehaviorExceptions(contract, sourceFilesByPath, new Set(["bff"]));
  assert.ok(failures.some((f) => f.includes("undeclared")));
});

test("Class H negative: a registered fork in a diverging service passes", () => {
  const contract = contractWith([], {
    services: { bff: { configLoader: "bff/config.ts" } },
    environmentBehaviorExceptions: [
      {
        id: "identity-hop",
        service: "bff",
        file: "bff/config.ts",
        mustContainSubstring: 'runtimeEnvironment === "production"',
        justification: "Cloud Run identity hop, no local equivalent.",
      },
    ],
  });
  const sourceFilesByPath = new Map([
    ["bff/config.ts", 'const x = runtimeEnvironment === "production" ? a : b;'],
  ]);
  const failures = checkEnvironmentBehaviorExceptions(contract, sourceFilesByPath, new Set(["bff"]));
  assert.deepEqual(failures, []);
});

test("Class H negative: forks that OR-unify production and production-parity are not counted", () => {
  const contract = contractWith([], {
    services: { bff: { configLoader: "bff/config.ts" } },
    environmentBehaviorExceptions: [],
  });
  const sourceFilesByPath = new Map([
    ["bff/config.ts", 'const productionLike = runtimeEnvironment === "production" || runtimeEnvironment === "production-parity";'],
  ]);
  const failures = checkEnvironmentBehaviorExceptions(contract, sourceFilesByPath, new Set(["bff"]));
  assert.deepEqual(failures, []);
});

test("Class H: a registered exception becomes stale when its service stops diverging", () => {
  const contract = contractWith([], {
    services: { bff: { configLoader: "bff/config.ts" } },
    environmentBehaviorExceptions: [
      {
        id: "identity-hop",
        service: "bff",
        file: "bff/config.ts",
        mustContainSubstring: 'runtimeEnvironment === "production"',
        justification: "x",
      },
    ],
  });
  const sourceFilesByPath = new Map([
    ["bff/config.ts", 'const x = runtimeEnvironment === "production" ? a : b;'],
  ]);
  // No services passed as diverging -- simulates the compose override having
  // been removed so bff's parity NODE_ENV now equals production's.
  const failures = checkEnvironmentBehaviorExceptions(contract, sourceFilesByPath, new Set());
  assert.ok(failures.some((f) => f.includes("stale")));
});

test("Class H: a registered exception whose substring no longer exists fails", () => {
  const contract = contractWith([], {
    services: { bff: { configLoader: "bff/config.ts" } },
    environmentBehaviorExceptions: [
      {
        id: "identity-hop",
        service: "bff",
        file: "bff/config.ts",
        mustContainSubstring: 'runtimeEnvironment === "production"',
        justification: "x",
      },
    ],
  });
  const sourceFilesByPath = new Map([["bff/config.ts", "// refactored away"]]);
  const failures = checkEnvironmentBehaviorExceptions(contract, sourceFilesByPath, new Set(["bff"]));
  assert.ok(failures.some((f) => f.includes("no longer found")));
});

// discoverComposeServiceEnvironmentOverride -----------------------------------

test("discoverComposeServiceEnvironmentOverride reads a service's literal environment: overrides", () => {
  const compose = `services:
  api-production:
    image: x
    environment:
      FOO: bar
  bff-production:
    image: y
    env_file: [.env.production-parity]
    environment:
      NODE_ENV: production-parity
    ports:
      - "3001:3001"
  worker-production:
    image: z
`;
  const bffOverride = discoverComposeServiceEnvironmentOverride(compose, "bff-production");
  assert.equal(bffOverride.get("NODE_ENV"), "production-parity");
  const apiOverride = discoverComposeServiceEnvironmentOverride(compose, "api-production");
  assert.equal(apiOverride.get("FOO"), "bar");
  const workerOverride = discoverComposeServiceEnvironmentOverride(compose, "worker-production");
  assert.equal(workerOverride.size, 0);
});

// findBlocks robustness --------------------------------------------------------

test("findBlocks does not mistake a header-like prefix (e.g. 'env' inside 'environment') for a real block", () => {
  const text = `
    scaling {
      min_instance_count = var.environment == "production" ? 1 : 0
    }
    env {
      name = "REAL_VAR"
      value = "x"
    }
  `;
  const blocks = findBlocks(text, /\benv\s*/u);
  assert.equal(blocks.length, 1);
  assert.match(blocks[0].body, /REAL_VAR/u);
});
