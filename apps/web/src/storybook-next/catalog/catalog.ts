import {
  storybookCatalog,
} from './catalog.generated';

import type {
  CatalogEntryDefinition,
} from './types';

export {
  storybookCatalog,
} from './catalog.generated';

export function getCatalogEntry(
  id: string,
): CatalogEntryDefinition {
  const entry = storybookCatalog.find(
    (candidate) => candidate.id === id,
  );

  if (!entry) {
    throw new Error(
      `Nie znaleziono pozycji katalogu: ${id}`,
    );
  }

  return entry;
}
