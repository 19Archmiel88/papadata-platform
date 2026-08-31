import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = (
  packageName: string,
  relativeSourcePath: string,
): {
  readonly find: string;
  readonly replacement: string;
} => ({
  find: packageName,
  replacement: fileURLToPath(new URL(relativeSourcePath, import.meta.url)),
});

export default defineConfig({
  resolve: {
    alias: [
      alias("@papadata/contracts", "./packages/contracts/src/index.ts"),
      alias("@papadata/database", "./packages/database/src/index.ts"),
      alias("@papadata/integrations", "./packages/integrations/src/index.ts"),
      alias("@papadata/storage", "./packages/storage/src/index.ts"),
      alias("@papadata/ai-runtime", "./packages/ai-runtime/src/index.ts"),
      alias("@papadata/testing", "./packages/testing/src/index.ts"),
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
});
