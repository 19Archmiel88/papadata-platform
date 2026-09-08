import { useRegisterScreenContext } from './ScreenContextProvider';

/** Screens supply values from their own analytical model; never scrape visible DOM. */
export function useAssistantAnalysisContext(input: {
  title: string; route: string; readiness: string; source: string;
  metrics: Readonly<Record<string, number | string | null | undefined>>;
  filters?: Readonly<Record<string, string>>;
  tables?: readonly string[]; charts?: readonly string[];
}) {
  useRegisterScreenContext({
    title: input.title, route: input.route, readiness: input.readiness,
    summary: `Źródło: ${input.source}. Zakres zgodny z datami i filtrami ekranu.`,
    metrics: Object.entries(input.metrics).flatMap(([label, value]) => value === null || value === undefined ? [] : [{
      id: `${input.route}:${label}`, kind: 'metric' as const, label, value: String(value), source: input.source, status: input.readiness,
    }]),
    filters: Object.entries(input.filters ?? {}).map(([label, value]) => ({ id: `filter:${label}`, kind: 'filter' as const, label, value })),
    charts: (input.charts ?? []).map(label => ({ id: `${input.route}:chart:${label}`, kind: 'chart' as const, label, source: input.source })),
    tables: (input.tables ?? []).map(label => ({ id: `${input.route}:table:${label}`, kind: 'table' as const, label, source: input.source })),
  });
}
