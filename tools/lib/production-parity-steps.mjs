// Shared step list for "is this a complete, reproducible, certified
// production-parity stack" -- used by both tools/verify-local-production-parity.mjs
// (dev/build mode: builds the stack from source) and
// tools/verify-release-candidate.mjs (certified mode: runs the exact images
// from a release manifest, never building). Keeping one definition means the
// two gates can never silently drift apart on which checks "certified"
// means -- only how the stack under test came to exist differs.
export function buildProductionParitySteps({
  composeArgs = ["-f", "compose.production-parity.yml", "--env-file", ".env.production-parity"],
  e2eEnv = {},
  extraSteps = [],
} = {}) {
  return [
    { id: "runtime-config-parity-env", command: "pnpm", args: ["verify:production-parity-env"] },
    { id: "runtime-config-parity-tests", command: "pnpm", args: ["test:runtime-config-parity"] },
    { id: "redis-parity-guard", command: "pnpm", args: ["test:redis-parity-guard"] },
    { id: "release-manifest-unit-tests", command: "pnpm", args: ["test:release-manifest"] },
    { id: "typecheck-backend", command: "pnpm", args: ["typecheck:backend"] },
    { id: "typecheck-web", command: "pnpm", args: ["--filter", "@papadata/web", "run", "typecheck"] },
    { id: "test-unit", command: "pnpm", args: ["test:unit"] },
    { id: "test-worker", command: "pnpm", args: ["test:worker"] },
    { id: "repository-integrity", command: "pnpm", args: ["verify:repository-integrity"] },
    { id: "tls-preparation", command: "pnpm", args: ["prepare:production-parity"] },
    ...extraSteps,
    {
      id: "compose-config",
      command: "docker",
      args: ["compose", ...composeArgs, "config"],
    },
    { id: "backend-production-parity-e2e", command: "pnpm", args: ["test:backend-production-parity"], env: e2eEnv },
    { id: "web-production-parity-e2e", command: "pnpm", args: ["test:web-production-parity"], env: e2eEnv },
  ];
}
