import { reportDate, reportNumber } from './SavedReports.build';
import type { ReportVersion, SavedReport } from './SavedReports.model';

export const escapeReportHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const csvCell = (v: unknown) => {
  const value = typeof v === 'string' && /^[\s]*[=+@\-]/.test(v) ? `'${v}` : String(v ?? '');
  return `"${value.replaceAll('"', '""')}"`;
};
export function reportCsv(v: ReportVersion) {
  const s = v.snapshot;
  return (
    '\ufeff' +
    [
      ['Raport', v.config.title],
      ['Wersja', v.number],
      ['Dane', s.mode === 'demo' ? 'Przykładowe' : 'Produkcyjne'],
      ['Zakres', s.scopeLabel],
      ['Przeliczono', s.generatedAt],
      [],
      ['Metryka', 'Wartość', 'Jednostka', 'Definicja'],
      ...s.metrics.map((m) => [m.label, m.value, m.unit, m.definition]),
      [],
      s.columns.map((c) => c.label + (c.unit ? ` (${c.unit})` : '')),
      ...s.rows.map((r) => s.columns.map((c) => r.values[c.id])),
      [],
      ['Ograniczenia'],
      ...s.limitations.map((l) => [l]),
      [],
      ['Źródło', 'Opis'],
      ...s.sources.map((s) => [s.label, s.detail]),
      [],
      ['Komentarz autora', v.config.notes],
    ]
      .map((row) => row.map(csvCell).join(';'))
      .join('\r\n')
  );
}
export function reportHtml(v: ReportVersion) {
  const e = escapeReportHtml,
    s = v.snapshot;
  return `<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(v.config.title)} · PapaData</title><style>body{font:15px/1.6 system-ui,sans-serif;color:#2b1d22;background:#faf7ef;max-width:1080px;margin:40px auto;padding:24px}header{border-bottom:3px solid #781f3d}h1{font-size:36px;line-height:1.2}h2{margin-top:36px}small{color:#654951}.metrics{display:flex;flex-wrap:wrap;gap:24px;margin:28px 0}.metric{flex:1;min-width:180px;background:white;padding:20px;border:1px solid #dacdd0}.metric strong{display:block;font-size:26px;color:#781f3d}table{border-collapse:collapse;width:100%;font-size:13px}td,th{padding:10px;text-align:left;border-bottom:1px solid #dacdd0}th{background:#ece5da}p{white-space:pre-wrap}aside{padding:18px;background:#eef2db} @media print{body{background:white;margin:0;padding:0}tr,.metric{break-inside:avoid}h2{break-after:avoid}}</style><header><b>PAPADATA / ZAPISANE RAPORTY</b><h1>${e(v.config.title)}</h1><p>${e(v.config.question)}</p><p>${e(s.scopeLabel)} · wersja ${v.number}</p><small>${s.mode === 'demo' ? 'Dane przykładowe' : 'Dane produkcyjne'} · przeliczono ${e(reportDate(s.generatedAt))} · ${e(v.author)} · ${e(s.timezone)}</small></header><section class="metrics">${s.metrics.map((m) => `<div class="metric">${e(m.label)}<strong>${e(reportNumber(m.value, m.unit))}</strong><small>${e(m.definition)}</small></div>`).join('')}</section>${v.config.notes ? `<h2>Komentarz autora</h2><p>${e(v.config.notes)}</p>` : ''}<h2>Dane raportu</h2><table><thead><tr>${s.columns.map((c) => `<th>${e(c.label)}${c.unit ? ` (${e(c.unit)})` : ''}</th>`).join('')}</tr></thead><tbody>${s.rows.map((r) => `<tr>${s.columns.map((c) => `<td>${e(typeof r.values[c.id] === 'number' ? reportNumber(r.values[c.id] as number, c.unit) : (r.values[c.id] ?? '—'))}</td>`).join('')}</tr>`).join('')}</tbody></table>${s.series.length ? `<h2>${e(s.seriesMetric)} · obserwacje dzienne</h2><table><thead><tr><th>Dzień</th><th>Wartość</th></tr></thead><tbody>${s.series.map((p) => `<tr><td>${e(p.date)}</td><td>${e(reportNumber(p.value))}</td></tr>`).join('')}</tbody></table>` : ''}<h2>Źródła i ograniczenia</h2>${s.sources.map((s) => `<p><b>${e(s.label)}</b><br>${e(s.detail)}</p>`).join('')}<aside>${s.limitations.length ? `<ul>${s.limitations.map((l) => `<li>${e(l)}</li>`).join('')}</ul>` : 'Kompletny zakres obserwacji w tym zbiorze.'}<p>Brak danych oznaczono „—”. Zapisany wynik nie odświeża się automatycznie. ${e(v.note)}</p></aside></html>`;
}
export function reportJson(report: SavedReport, version?: number) {
  const selected = version ? report.versions.find((v) => v.number === version) : null;
  const exported = selected
    ? {
        ...report,
        versions: [
          {
            ...selected,
            number: 1,
            note: `Eksport wersji ${selected.number}. ${selected.note}`,
            restoredFrom: undefined,
          },
        ],
        draft: null,
      }
    : report;
  return JSON.stringify({ format: 'papadata-report', schema: 1, report: exported }, null, 2);
}
export function downloadReport(content: string, mime: string, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime })),
    link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
