import type {
  CommandCenterRecord,
  ReadinessStatus,
} from '../../../../../../contracts/api-schemas';
import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import type {
  BusinessScreenData,
} from '../businessData';
import {
  formatInteger,
  formatMetricValue,
  formatPercent as formatWorkspacePercent,
  formatSignedPercent,
  resolveUnitLabel as resolveWorkspaceUnitLabel,
} from '../commandCenterWorkspaceFormatters';

export type CommandCenterData = Extract<
  BusinessScreenData,
  { readonly group: 'command-center' }
>;

export type CommandOnePageIssue = {
  readonly id: string;
  readonly label: string;
  readonly severity: 'critical' | 'warning';
};

export type CommandOnePageDecision = {
  readonly metricLabel: string;
};

export const sourceColumns: readonly DataColumn[] = [
  { id: 'source', label: 'Nazwa źródła ruchu', sortable: true, width: 240 },
  { align: 'right', id: 'sessions', label: 'Ilość sesji', sortable: true, width: 150 },
  { align: 'right', id: 'users', label: 'Ilość użytkowników', sortable: true, width: 170 },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true, width: 160 },
  { align: 'right', id: 'cr', label: 'CR', sortable: true, width: 120 },
  { align: 'right', id: 'ctr', label: 'CTR', sortable: true, width: 120 },
];

export const customerColumns: readonly DataColumn[] = [
  { id: 'segment', label: 'Segment', sortable: true, width: 220 },
  { align: 'right', id: 'customers', label: 'Liczba klientów', sortable: true, width: 160 },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true, width: 160 },
  { align: 'right', id: 'productsPerOrder', label: 'Śr. produktów', sortable: true, width: 160 },
  { align: 'right', id: 'arpu', label: 'ARPU', sortable: true, width: 140 },
  { align: 'right', id: 'frequency', label: 'Częstotliwość', sortable: true, width: 160 },
];

export const productColumns: readonly DataColumn[] = [
  { id: 'product', label: 'Produkt', sortable: true, width: 260 },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true, width: 160 },
  { align: 'right', id: 'newRevenue', label: 'Przychód nowi klienci', sortable: true, width: 210 },
  { align: 'right', id: 'returningRevenue', label: 'Przychód powracający', sortable: true, width: 220 },
  { align: 'right', id: 'quantity', label: 'Ilość', sortable: true, width: 120 },
  { align: 'right', id: 'change', label: 'Zmiana', sortable: true, width: 120 },
];

export const commandColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Obszar', sortable: true, width: 260 },
  { align: 'right', id: 'value', label: 'Wynik', sortable: true, width: 150 },
  { align: 'right', id: 'target', label: 'Cel', sortable: true, width: 150 },
  { align: 'right', id: 'delta', label: 'Zmiana', sortable: true, width: 120 },
  { id: 'impact', label: 'Wpływ', sortable: true, width: 240 },
  { id: 'nextAction', label: 'Następny krok', width: 300 },
  { id: 'owner', label: 'Właściciel', sortable: true, width: 220 },
  { id: 'readinessLabel', label: 'Stan danych', sortable: true, width: 160 },
];

/**
 * Executive KPI set for the one-page.
 *
 * Only metrics that are present in the contract, or that follow from present
 * metrics by real arithmetic (AOV = revenue / orders, ad cost = revenue / ROAS,
 * CPA = ad cost / orders), are emitted. Nothing is invented: a metric without
 * backing simply does not appear, and the sections fall back to their empty
 * states instead of showing a plausible-looking constant.
 *
 * The demo variant used by fixtures lives in {@link buildDemoExecutiveKpiRecords}.
 */
export function buildExecutiveKpiRecords(
  records: readonly CommandCenterRecord[],
): readonly CommandCenterRecord[] {
  const revenue = findRecordByLabel(records, ['przychod'])
    ?? records.find((record) => record.unit === 'currency')
    ?? null;
  const roas = findRecordByLabel(records, ['roas']) ?? null;
  const orders = findRecordByLabel(records, ['zakup', 'zamowien', 'orders']) ?? null;
  const conversion = findRecordByLabel(records, ['konwersja', 'cvr', 'koszyk']) ?? null;
  const margin = findRecordByLabel(records, ['marza', 'margin']) ?? null;

  const derived: CommandCenterRecord[] = [];

  const pushMapped = (
    source: CommandCenterRecord | null,
    metricId: string,
    label: string,
  ) => {
    if (!source) {
      return;
    }

    derived.push({
      ...source,
      label,
      metricId,
    });
  };

  pushMapped(revenue, 'command-kpi-revenue', 'Przychód');
  pushMapped(orders, 'command-kpi-orders', 'Liczba zakupów');
  pushMapped(margin, 'command-kpi-gross-margin', 'Marża brutto');
  pushMapped(conversion, 'command-kpi-conversion', 'Konwersja');
  pushMapped(roas, 'command-kpi-roas', 'ROAS');

  // AOV, ad cost and CPA are identities, not estimates — safe to derive.
  if (revenue && orders && orders.value > 0) {
    derived.push(makeCommandRecord(
      'command-kpi-aov',
      'AOV',
      revenue.value / orders.value,
      'currency',
      null,
      null,
      resolveDerivedReadiness(revenue.readiness, orders.readiness),
    ));
  }

  const adCostValue = revenue && roas && roas.value > 0
    ? revenue.value / roas.value
    : null;

  if (adCostValue !== null) {
    derived.push(makeCommandRecord(
      'command-kpi-ad-cost',
      'Koszt reklamy',
      adCostValue,
      'currency',
      null,
      null,
      resolveDerivedReadiness(revenue?.readiness, roas?.readiness),
    ));

    if (orders && orders.value > 0) {
      derived.push(makeCommandRecord(
        'command-kpi-cpa',
        'Koszt zakupu',
        adCostValue / orders.value,
        'currency',
        null,
        null,
        resolveDerivedReadiness(revenue?.readiness, roas?.readiness, orders.readiness),
      ));
    }
  }

  // Anything the contract carries but the mapping above did not claim stays
  // visible in the supporting strip rather than being silently dropped.
  const claimed = new Set([revenue, orders, margin, conversion, roas]
    .filter(isCommandCenterRecord)
    .map((record) => record.metricId));

  const passthrough = records.filter((record) => !claimed.has(record.metricId));

  return [...derived, ...passthrough];
}

function isCommandCenterRecord(
  record: CommandCenterRecord | null,
): record is CommandCenterRecord {
  return record !== null;
}

/**
 * Demo KPI set — plausible constants for Storybook fixtures and the localhost
 * dev fallback. Never reachable from a deployed runtime.
 */
export function buildDemoExecutiveKpiRecords(
  records: readonly CommandCenterRecord[],
): readonly CommandCenterRecord[] {
  const revenue = findRecordByLabel(records, ['przychod'])
    ?? records.find((record) => record.unit === 'currency')
    ?? null;
  const roas = findRecordByLabel(records, ['roas']) ?? null;
  const conversion = findRecordByLabel(records, ['konwersja', 'cvr', 'koszyk']) ?? null;
  const freshness = findRecordByLabel(records, ['swiezosc', 'event', 'ga4']) ?? null;
  const revenueValue = revenue?.value ?? 0;
  const roasValue = roas?.value ?? 4.1;
  const ordersValue = Math.max(Math.round(revenueValue / 168.65), 0);
  const aovValue = ordersValue > 0 ? revenueValue / ordersValue : 0;
  const adCostValue = roasValue > 0 ? revenueValue / roasValue : 0;
  const cpaValue = ordersValue > 0 ? adCostValue / ordersValue : 0;
  const cvrValue = conversion?.value ?? 0.031;
  const clicksValue = cvrValue > 0 ? Math.round(ordersValue / cvrValue) : 0;
  const ctrValue = 0.0162;
  const impressionsValue = ctrValue > 0 ? Math.round(clicksValue / ctrValue) : 0;

  return [
    makeCommandRecord('command-kpi-revenue', 'Przychód', revenueValue, 'currency', revenue?.delta ?? 0.12, revenue?.target ?? revenueValue * 1.08, revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-orders', 'Liczba zakupów', ordersValue, 'number', 0.08, Math.round(ordersValue * 1.05), revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-gross-margin', 'Marża brutto', 0.317, 'ratio', -0.024, 0.34, revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-conversion', 'Konwersja', 0.038, 'ratio', -0.011, 0.045, revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-aov', 'AOV', aovValue, 'currency', 0.037, aovValue * 1.04, revenue?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-ad-cost', 'Koszt reklamy', adCostValue, 'currency', -0.07, adCostValue * 0.94, resolveDerivedReadiness(roas?.readiness, revenue?.readiness)),
    makeCommandRecord('command-kpi-roas', 'ROAS', roasValue, 'ratio', roas?.delta ?? 0.18, roas?.target ?? 4.1, roas?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-cpa', 'Koszt zakupu', cpaValue, 'currency', -0.04, cpaValue * 0.92, resolveDerivedReadiness(roas?.readiness, revenue?.readiness)),
    makeCommandRecord('command-kpi-impressions', 'Wyświetlenia', impressionsValue, 'number', -0.12, impressionsValue * 1.08, freshness?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-clicks', 'Kliknięcia', clicksValue, 'number', -0.14, clicksValue * 1.06, freshness?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-ctr', 'CTR', ctrValue, 'percent', -0.03, 0.018, freshness?.readiness ?? 'partial'),
    makeCommandRecord('command-kpi-cvr', 'CVR', cvrValue, 'percent', conversion?.delta ?? -0.07, conversion?.target ?? 0.035, conversion?.readiness ?? 'partial'),
  ];
}

export function makeCommandRecord(
  metricId: string,
  label: string,
  value: number,
  unit: CommandCenterRecord['unit'],
  delta: number | null,
  target: number | null,
  readiness: ReadinessStatus,
): CommandCenterRecord {
  return {
    delta,
    label,
    metricId,
    readiness,
    target,
    unit,
    value,
  };
}

export function findRecordById(
  records: readonly CommandCenterRecord[],
  metricId: string,
): CommandCenterRecord | null {
  return records.find((record) => record.metricId === metricId) ?? null;
}

export function findRecordByLabel(
  records: readonly CommandCenterRecord[],
  keywords: readonly string[],
): CommandCenterRecord | null {
  return records.find((record) => {
    const label = normalizeLabel(record.label);

    return keywords.some((keyword) => label.includes(normalizeLabel(keyword)));
  }) ?? null;
}

export function resolveDerivedReadiness(
  ...statuses: readonly (ReadinessStatus | undefined)[]
): ReadinessStatus {
  if (statuses.includes('unavailable')) return 'unavailable';
  if (statuses.includes('stale')) return 'stale';
  if (statuses.includes('partial')) return 'partial';

  return 'ready';
}

export function buildDemoCommandSourceRows(records: readonly CommandCenterRecord[]): readonly DataRow[] {
  const revenue = findRecordById(records, 'command-kpi-revenue')?.value ?? 0;
  const model = [
    ['google', 'Google Ads / Search', 0.34, 0.041, 0.062],
    ['meta', 'Meta Ads', 0.28, 0.034, 0.038],
    ['organic', 'Organic Search', 0.24, 0.028, 0.047],
    ['newsletter', 'Newsletter', 0.08, 0.056, 0.091],
    ['tiktok', 'TikTok Ads', 0.06, 0.024, 0.029],
  ] as const;

  return model.map(([id, source, share, cr, ctr], index) => {
    const rawRevenue = revenue * share;
    const sessions = Math.max(Math.round(rawRevenue / Math.max(5.8 * (1 + index * 0.12), 1)), 0);

    return {
      cr: formatPercent(cr),
      ctr: formatPercent(ctr),
      id,
      rawRevenue,
      revenue: formatMetricValue(rawRevenue, 'currency'),
      sessions: formatInteger(sessions),
      share,
      source,
      users: formatInteger(Math.round(sessions * 0.79)),
    };
  });
}

export function buildDemoCommandCustomerRows(records: readonly CommandCenterRecord[]): readonly DataRow[] {
  const revenue = findRecordById(records, 'command-kpi-revenue')?.value ?? 0;
  const orders = findRecordById(records, 'command-kpi-orders')?.value ?? 0;
  const returningRevenue = revenue * 0.47;
  const newRevenue = revenue - returningRevenue;
  const returningCustomers = Math.max(Math.round(orders * 0.38), 1);
  const newCustomers = Math.max(Math.round(orders * 0.62), 1);

  return [
    {
      arpu: formatMetricValue(returningRevenue / returningCustomers, 'currency'),
      customers: formatInteger(returningCustomers),
      frequency: '1,86',
      id: 'returning',
      productsPerOrder: '2,6',
      rawRevenue: returningRevenue,
      revenue: formatMetricValue(returningRevenue, 'currency'),
      segment: 'Powracający klienci',
    },
    {
      arpu: formatMetricValue(newRevenue / newCustomers, 'currency'),
      customers: formatInteger(newCustomers),
      frequency: '1,08',
      id: 'new',
      productsPerOrder: '1,9',
      rawRevenue: newRevenue,
      revenue: formatMetricValue(newRevenue, 'currency'),
      segment: 'Nowi klienci',
    },
  ];
}

export function buildDemoCommandProductRows(records: readonly CommandCenterRecord[]): readonly DataRow[] {
  const revenue = findRecordById(records, 'command-kpi-revenue')?.value ?? 0;
  const products = [
    ['smartfon-x12', 'Smartfon X12', 0.18, 250, 0.15],
    ['laptop-pro', 'Laptop Pro', 0.24, 105, 0.08],
    ['sluchawki', 'Słuchawki bezprzewodowe', 0.09, 500, 0.23],
    ['tablet-air', 'Tablet Air', 0.11, 175, -0.05],
    ['smartwatch', 'Smartwatch Sport', 0.08, 280, 0.18],
    ['kamera', 'Kamera bezpieczeństwa', 0.06, 140, 0.02],
    ['glosnik', 'Głośnik Bluetooth', 0.05, 190, -0.03],
    ['powerbank', 'Powerbank 20000mAh', 0.04, 360, 0.12],
    ['drukarka', 'Drukarka laserowa', 0.07, 85, -0.07],
    ['monitor', 'Monitor 4K', 0.08, 125, 0.1],
  ] as const;

  return products.map(([id, product, share, quantity, change], index) => {
    const rawRevenue = revenue * share;
    const returningShare = 0.52 + (index % 3) * 0.04;

    return {
      change: formatSignedPercent(change),
      id,
      newRevenue: formatMetricValue(rawRevenue * (1 - returningShare), 'currency'),
      product,
      quantity: formatInteger(quantity),
      rawRevenue,
      returningRevenue: formatMetricValue(rawRevenue * returningShare, 'currency'),
      revenue: formatMetricValue(rawRevenue, 'currency'),
    };
  });
}

/**
 * `RecommendationView` carries no metric reference, so the link to a KPI has to
 * be inferred from the recommendation text. Matching on the lens metrics is
 * still far better than the previous positional binding, which paired a
 * recommendation with whatever record happened to share its index.
 */
export function resolveRecommendationRecordForLens(
  records: readonly CommandCenterRecord[],
  recommendation: CommandCenterData['recommendations'][number],
  lensMetricIds: readonly string[],
): CommandCenterRecord | null {
  const lensRecords = lensMetricIds
    .map((metricId) => findRecordById(records, metricId))
    .filter((record): record is CommandCenterRecord => record !== null);

  const haystack = normalizeLabel(`${recommendation.title} ${recommendation.rationale}`);

  const mentioned = lensRecords.find((record) => (
    haystack.includes(normalizeLabel(record.label))
  ));

  return mentioned ?? lensRecords[0] ?? null;
}

/** True when the recommendation text names any metric owned by the lens. */
export function isRecommendationInLens(
  records: readonly CommandCenterRecord[],
  recommendation: CommandCenterData['recommendations'][number],
  lensMetricIds: readonly string[],
): boolean {
  const haystack = normalizeLabel(`${recommendation.title} ${recommendation.rationale}`);

  return lensMetricIds.some((metricId) => {
    const record = findRecordById(records, metricId);

    return record !== null && haystack.includes(normalizeLabel(record.label));
  });
}

export function resolveRecommendationRecord(
  records: readonly CommandCenterRecord[],
  decisions: readonly CommandOnePageDecision[],
  index: number,
): CommandCenterRecord | null {
  const decision = decisions[index] ?? decisions[0] ?? null;

  if (decision) {
    const matchingRecord = records.find((record) => record.label === decision.metricLabel);

    if (matchingRecord) {
      return matchingRecord;
    }
  }

  const comparable = chooseComparableRecords(records);

  return comparable[index % Math.max(comparable.length, 1)]
    ?? records[index % Math.max(records.length, 1)]
    ?? null;
}

export function resolveRecommendationProjectedValue(
  record: CommandCenterRecord,
  recommendation: CommandCenterData['recommendations'][number],
): number {
  const impactMultiplier = recommendation.impact === 'high'
    ? 0.12
    : recommendation.impact === 'medium'
      ? 0.07
      : 0.035;
  const confidenceMultiplier = Math.max(Math.min(recommendation.confidence, 1), 0.35);
  const adjustment = impactMultiplier * confidenceMultiplier;

  return isLowerBetterMetric(record)
    ? record.value * (1 - adjustment)
    : record.value * (1 + adjustment);
}

export function buildRecordSparklinePoints(
  record: CommandCenterRecord,
  pointCount: number,
): readonly number[] {
  const delta = record.delta ?? 0;
  const start = record.value / Math.max(0.22, 1 + delta);
  const amplitude = Math.max(Math.abs(record.value) * 0.035, 0.01);

  return Array.from({ length: pointCount }, (_, index) => {
    const ratio = pointCount <= 1 ? 1 : index / (pointCount - 1);
    const baseline = interpolateNumber(start, record.value, ratio);
    const wave = Math.sin((index + 1) * 1.41) * amplitude;

    return index === pointCount - 1
      ? record.value
      : clampMetricValue(baseline + wave, record.unit);
  });
}

export function resolveRuntimeForecastValue(record: CommandCenterRecord): number {
  const delta = record.delta ?? 0;
  const targetPressure = record.target === null
    ? 0
    : (record.target - record.value) * 0.34;

  return clampMetricValue(
    record.value * (1 + Math.max(Math.min(delta, 0.16), -0.16) * 0.42) + targetPressure,
    record.unit,
  );
}

export function chooseComparableRecords(records: readonly CommandCenterRecord[]): readonly CommandCenterRecord[] {
  const comparable = records.filter((record) => record.target !== null || record.delta !== null);

  return comparable.length > 0 ? comparable : records;
}

export function resolveMetricSignal(record: CommandCenterRecord): 'negative' | 'neutral' | 'positive' | 'warning' {
  if (record.readiness !== 'ready') return 'warning';
  if (isMetricWorse(record)) return 'negative';
  if ((record.delta ?? 0) > 0) return isLowerBetterMetric(record) ? 'warning' : 'positive';

  return 'neutral';
}

export function resolveMetricEmphasis(record: CommandCenterRecord): 'alert' | 'default' | 'recommendation' {
  if (record.readiness !== 'ready' || isMetricWorse(record)) return 'alert';
  if ((record.delta ?? 0) > 0.08) return 'recommendation';

  return 'default';
}

export function resolveMetricRiskLabel(record: CommandCenterRecord): string | null {
  if (record.readiness === 'unavailable') return 'AI: blokada źródła danych';
  if (record.readiness === 'stale') return 'AI: ryzyko nieświeżych danych';
  if (record.readiness === 'partial') return 'AI: analiza częściowa';
  if (isMetricWorse(record)) return 'AI: wykryty spadek lub ryzyko';
  if (Math.abs(record.delta ?? 0) >= 0.15) return 'AI: anomalia dodatnia do potwierdzenia';

  return null;
}

export function resolveMetricStateMessage(record: CommandCenterRecord): string | null {
  const riskLabel = resolveMetricRiskLabel(record);

  return riskLabel ? `${riskLabel}. Zweryfikuj źródło i wpływ na wynik.` : null;
}

export function resolveMetricDeviationLabel(record: CommandCenterRecord): string | null {
  if (record.target === null) return null;

  const difference = record.value - record.target;
  const sign = difference > 0 ? '+' : difference < 0 ? '-' : '';

  return `${sign}${formatMetricValue(Math.abs(difference), record.unit)}`;
}

export function resolveMetricFreshnessLabel(record: CommandCenterRecord): string {
  switch (record.readiness) {
    case 'ready':
      return 'świeże źródła';
    case 'partial':
      return 'częściowa synchronizacja';
    case 'stale':
      return 'wymaga odświeżenia';
    case 'unavailable':
      return 'źródło niedostępne';
    default:
      return 'status nieznany';
  }
}

export function resolveMetricSourceLabel(record: CommandCenterRecord): string {
  const label = normalizeLabel(record.label);

  if (label.includes('ga4') || label.includes('event') || label.includes('ruch')) return 'GA4';
  if (label.includes('meta')) return 'Meta Ads';
  if (label.includes('google') || label.includes('search') || label.includes('roas')) return 'Google Ads';
  if (label.includes('produkt') || label.includes('marza') || label.includes('bestseller')) return 'Shopify / katalog';
  if (label.includes('klien') || label.includes('repeat')) return 'CRM';

  return 'PapaData analytics';
}

export function isLowerBetterMetric(record: CommandCenterRecord): boolean {
  const label = normalizeLabel(record.label);

  return label.includes('koszt')
    || label.includes('cpa')
    || label.includes('odplyw')
    || label.includes('porzuc')
    || label.includes('brak')
    || label.includes('ryzyko');
}

export function isMetricWorse(record: CommandCenterRecord): boolean {
  if (record.delta === null) return false;

  return isLowerBetterMetric(record)
    ? record.delta > 0
    : record.delta < 0;
}

export function openPapaAssistantForElement(elementId: string): void {
  openPapaAssistant({ elementId });
}

export function openPapaAssistant({
  elementId,
}: {
  readonly elementId: string;
}): void {
  window.dispatchEvent(new CustomEvent('papadata:papa-assistant-open', {
    detail: {
      elementId,
      source: 'command-center',
    },
  }));
}

/*
 * Formatters and readiness resolvers are owned by
 * `commandCenterWorkspaceFormatters.ts`. The one-page re-exports them so both
 * render paths format identically; only the two behavioural differences the
 * one-page relies on are wrapped below.
 */
export {
  formatInteger,
  formatMetricValue,
  formatShortTime,
  formatSignedPercent,
  mapReadinessToAnalyticsState,
  resolveDataStateLabel,
  resolveImpactLabel,
  resolveReadinessLabel,
} from '../commandCenterWorkspaceFormatters';

/** Charts need a printable unit, so the nullable workspace label is flattened. */
export function resolveUnitLabel(unit: CommandCenterRecord['unit']): string {
  return resolveWorkspaceUnitLabel(unit) ?? '';
}

/** Ratios reaching the one-page can be non-finite; never print "NaN%". */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return '\u2014';
  }

  return formatWorkspacePercent(value);
}

export function shortenMetricLabel(label: string): string {
  return label
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+vs\s+/gi, ' / ')
    .trim();
}

export function interpolateNumber(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio;
}

export function clampMetricValue(value: number, unit: CommandCenterRecord['unit']): number {
  if (!Number.isFinite(value)) return 0;
  if (unit === 'percent') return Math.max(Math.min(value, 1), 0);
  if (unit === 'ratio') return Math.max(value, 0);

  return Math.max(value, 0);
}

export function normalizeLabel(value: string): string {
  return value
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');
}
