/** Preserve numeric cells; neutralize spreadsheet formulas in text cells. */
export function escapeCsvCell(value: number | string): string {
  const text = String(value);
  const safe = typeof value === 'string' && /^[\s\u0000-\u001f]*[=+@-]/u.test(text)
    ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

const csvByteOrderMark = String.fromCharCode(0xfeff);

export function downloadCsv(
  filename: string,
  columns: readonly string[],
  rows: readonly (readonly (number | string)[])[],
): void {
  if (typeof document === 'undefined') return;

  const content = [columns, ...rows]
    .map((row) => row.map(escapeCsvCell).join(';'))
    .join('\n');
  const blob = new Blob([csvByteOrderMark + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const diacriticsPattern = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  'g',
);

// Polish letters like ł/ż have no canonical NFD decomposition into base +
// combining mark, so the generic diacritics strip below would otherwise
// drop them as stray non-ASCII characters and mangle the word around them.
const polishLetterMap: Readonly<Record<string, string>> = {
  Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z',
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

export function slugifyFilename(label: string): string {
  return label
    .replace(/[ĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, (letter) => polishLetterMap[letter] ?? letter)
    .normalize('NFD')
    .replace(diacriticsPattern, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '') || 'eksport';
}
