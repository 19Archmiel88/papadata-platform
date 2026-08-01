export function findEnabledIndex<
  T extends {
    readonly disabled?: boolean;
  },
>(
  items: readonly T[],
  startIndex: number,
  direction: 1 | -1,
) {
  if (items.length === 0) {
    return -1;
  }

  let index = startIndex;

  for (let attempt = 0; attempt < items.length; attempt += 1) {
    index =
      (index + direction + items.length)
      % items.length;

    if (!items[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

export function findFirstEnabledIndex<
  T extends {
    readonly disabled?: boolean;
  },
>(
  items: readonly T[],
) {
  return items.findIndex((item) => !item.disabled);
}

export function buildPaginationModel(
  page: number,
  totalPages: number,
  maxVisible = 7,
) {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= maxVisible) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  const siblings = 1;
  const start = Math.max(
    2,
    page - siblings,
  );
  const end = Math.min(
    totalPages - 1,
    page + siblings,
  );
  const model: Array<number | 'ellipsis'> = [
    1,
  ];

  if (start > 2) {
    model.push('ellipsis');
  }

  for (let value = start; value <= end; value += 1) {
    model.push(value);
  }

  if (end < totalPages - 1) {
    model.push('ellipsis');
  }

  model.push(totalPages);

  return model;
}

export function clampPage(
  page: number,
  totalPages: number,
) {
  if (totalPages <= 0) {
    return 1;
  }

  return Math.min(
    Math.max(page, 1),
    totalPages,
  );
}
