import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Mirrors tsconfig.base.json's path aliases so workspace packages resolve
// straight to source. Without this, Vitest falls back to each package's
// package.json `exports` (dist/index.js), which doesn't exist yet on a
// fresh checkout before anything has been built -- the
// unit-integration-tests gate step deliberately runs before the build
// step (tools/verify-backend-gate.mjs), so relying on a prior build here
// would make step order load-bearing for no good reason. Confirmed this
// really happens in CI: passed locally (this session had already built
// packages/contracts earlier) but failed on a clean GitHub Actions
// checkout with "Failed to resolve entry for package '@papadata/contracts'".
const alias = (packageName: string, relativeSourcePath: string): { readonly find: string; readonly replacement: string } => ({
  find: packageName,
  replacement: fileURLToPath(new URL(relativeSourcePath, import.meta.url)),
});

export default defineConfig({
  resolve: {
    alias: [
      alias("@papadata/contracts", "./packages/contracts/src/index.ts"),
      alias("@papadata/database", "./packages/database/src/index.ts"),
      alias("@papadata/testing", "./packages/testing/src/index.ts"),
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
});
