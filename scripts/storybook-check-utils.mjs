import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

export const root = path.resolve(scriptDirectory, '..');

export function resolveFromRoot(...segments) {
  return path.join(root, ...segments);
}

export function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function readText(...segments) {
  const filePath = resolveFromRoot(...segments);
  ensure(existsSync(filePath), `Missing file: ${filePath}`);
  return readFileSync(filePath, 'utf8');
}

export function readJson(...segments) {
  return JSON.parse(readText(...segments));
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function getContract() {
  return readJson('apps/web/src/storybook-next/storybook-contract.json');
}

export function getCatalogEntries() {
  const catalogSource = readText(
    'apps/web/src/storybook-next/catalog/catalog.generated.ts',
  );
  const match = catalogSource.match(
    /export const storybookCatalog = ([\s\S]*?) as const satisfies/,
  );

  ensure(match, 'Unable to read generated Storybook catalog.');
  return JSON.parse(match[1]);
}

export function implementedEntries(contract = getContract()) {
  return contract.entries.filter((entry) => entry.storyStatus === 'implemented');
}

export function visibleEntries(contract = getContract()) {
  return contract.entries.filter((entry) => entry.storyVisibility === 'visible');
}

export function uniqueStoryFiles(entries) {
  return new Set(entries.map((entry) => entry.storyFile).filter(Boolean));
}

