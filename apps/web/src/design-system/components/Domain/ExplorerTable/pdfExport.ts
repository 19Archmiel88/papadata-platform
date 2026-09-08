function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function printTableAsPdf({
  headers,
  rows,
  title,
}: {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly (number | string)[])[];
  readonly title: string;
}): boolean {
  if (typeof window === 'undefined') return false;

  const printWindow = window.open('', '_blank', 'width=1280,height=900');
  if (!printWindow) return false;

  const head = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
  const body = rows.map((row) => (
    `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
  )).join('');

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111827; font: 12px/1.45 Inter, Arial, sans-serif; }
    header { display: flex; align-items: baseline; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
    h1 { margin: 0; font-size: 18px; }
    small { color: #6b7280; }
    table { width: 100%; border-collapse: collapse; table-layout: auto; }
    th, td { padding: 7px 8px; border-bottom: 1px solid #d1d5db; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
    th { color: #4b5563; font-size: 10px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <small>Wygenerowano w PapaData · ${escapeHtml(new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()))}</small>
  </header>
  <table aria-label="${escapeHtml(title)}">
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>`);
  printWindow.document.close();

  window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 120);

  return true;
}
