import type { ReportUnit, ReportConfig, ReportSnapshot } from './saved-reports.js';
export const reportNumber = (value: number | null, unit?: ReportUnit) =>
  value === null
    ? '—'
    : `${new Intl.NumberFormat('pl-PL', { maximumFractionDigits: unit === 'szt.' ? 0 : 2 }).format(value)}${unit ? ' ' + unit : ''}`;
export const reportDate = (value: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Warsaw',
  }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
export function compareReportVersions(
  a: { config: ReportConfig; snapshot: ReportSnapshot },
  b: { config: ReportConfig; snapshot: ReportSnapshot },
) {
  const comparable =
    a.config.template === b.config.template &&
    a.config.filter === b.config.filter &&
    a.config.from === b.config.from &&
    a.config.to === b.config.to &&
    a.snapshot.currency === b.snapshot.currency && a.snapshot.timezone === b.snapshot.timezone &&
    JSON.stringify(a.config.context??null) === JSON.stringify(b.config.context??null);
  return {
    comparable,
    metrics: b.snapshot.metrics.map((m) => {
      const before = a.snapshot.metrics.find((n) => n.id === m.id && n.unit === m.unit);
      return {
        ...m,
        before: before?.value ?? null,
        delta:
          comparable && before?.value !== null && before?.value !== undefined && m.value !== null
            ? m.value - before.value
            : null,
      };
    }),
  };
}
