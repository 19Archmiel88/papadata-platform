import { readdir } from "node:fs/promises";
import { join } from "node:path";

const EXCLUDED_DIR_NAMES = new Set([
  "node_modules",
  "dist",
  ".turbo",
  "storybook-static",
  "scripts",
  "__tests__",
]);

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mjs", ".js"];
const TEST_FILE_PATTERN = /\.(test|spec)\.[jt]sx?$/u;

// Recursively lists source files under `root` (an absolute path), skipping
// node_modules/dist/build-output/test-fixture directories, ops scripts/
// directories (manually-run tooling, never the deployed container's CMD),
// and *.test.*/*.spec.* files. Returns absolute paths.
export async function listSourceFiles(root) {
  const results = [];
  async function walk(dir) {
    let dirents;
    try {
      dirents = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (error && error.code === "ENOENT") return;
      throw error;
    }
    for (const dirent of dirents) {
      if (dirent.isDirectory()) {
        if (EXCLUDED_DIR_NAMES.has(dirent.name)) continue;
        await walk(join(dir, dirent.name));
        continue;
      }
      if (!SOURCE_EXTENSIONS.some((ext) => dirent.name.endsWith(ext))) continue;
      if (TEST_FILE_PATTERN.test(dirent.name)) continue;
      results.push(join(dir, dirent.name));
    }
  }
  await walk(root);
  return results;
}
