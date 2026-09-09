import type { TrafficPortfolio, TrafficFrame, TrafficMeasures, TrafficDimensionRow, TrafficEventStep, TrafficFinding, TrafficAmount } from '@papadata/contracts';
import { isRevenueQualifyingStatus } from '../../metrics/metricEngineCore.ts';
import { dedupeGa4CanonicalRows, readEntity, readEntityNumber, readEntityString, type CommandCenterDataSource } from './command-center-metrics.real-source.ts';
import { resolveMetricWindow, type CommandCenterDateRangeInput } from './command-center-metrics.contract-data.ts';

type Row = Record<string, unknown>;
type Source = Pick<CommandCenterDataSource, 'listCanonicalRecords' | 'listConnections' | 'listSyncCheckpoints'>;
export type TrafficPortfolioFilters = { readonly sourceId?: string | null; readonly channel?: string | null; readonly device?: string | null; readonly country?: string | null; readonly compare?: boolean };
const day = 86400000;
const eventNames = ['session_start', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase'];
const text = (value: unknown) => typeof value === 'string' ? value : null;
const entity = (row: Row) => readEntity(row.canonical_payload);
const value = (row: Row, key: string) => readEntityString(entity(row), key);
const number = (row: Row, key: string) => { const n = readEntityNumber(entity(row), key); return n !== null && Number.isFinite(n) && n >= 0 ? n : null; };
const iso = (value: unknown) => { const parsed = value instanceof Date ? value.getTime() : typeof value === 'string' ? Date.parse(value) : NaN; return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null; };
function dateLabel(timestamp: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(timestamp));
  return `${parts.find(p => p.type === 'year')!.value}-${parts.find(p => p.type === 'month')!.value}-${parts.find(p => p.type === 'day')!.value}`;
}
function rowDate(row: Row): string | null { const date = value(row, 'date'); return date && /^\d{8}$/.test(date) ? `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}` : date?.slice(0,10) ?? null; }
function sum(rows: readonly Row[], key: string): number | null {
  if (!rows.length) return null;
  let total = 0;
  for (const row of rows) { const n = number(row, key); if (n === null) return null; total += n; }
  return total;
}
function amounts(rows: readonly Row[], key = 'revenue'): readonly TrafficAmount[] {
  const groups = new Map<string, Row[]>();
  for (const row of rows) { const currency = value(row, 'currency') ?? 'XXX'; const group = groups.get(currency) ?? []; group.push(row); groups.set(currency, group); }
  return [...groups.entries()].map(([currency, bucket]) => { const amount = sum(bucket, key); return { currency, amount: amount === null ? null : Math.round(amount * 100) / 100 }; }).sort((a,b) => a.currency.localeCompare(b.currency));
}
function measures(rows: readonly Row[]): TrafficMeasures {
  const sessions = sum(rows, 'sessions'), engagedSessions = sum(rows, 'engagedSessions'), transactions = sum(rows, 'transactions');
  return { sessions, engagedSessions, transactions, keyEvents: sum(rows, 'conversions'), uniqueUsers: null,
    purchasePerSession: sessions !== null && sessions > 0 && transactions !== null ? transactions / sessions : null,
    engagementRate: sessions !== null && sessions > 0 && engagedSessions !== null ? engagedSessions / sessions : null,
    revenue: amounts(rows) };
}
function group(rows: readonly Row[], field: string): readonly TrafficDimensionRow[] {
  const groups = new Map<string, Row[]>();
  for (const row of rows) { const key = field === 'date' ? rowDate(row) ?? '(not set)' : value(row, field) ?? '(not set)'; const bucket = groups.get(key) ?? []; bucket.push(row); groups.set(key,bucket); }
  return [...groups].map(([label, bucket]) => ({ ...measures(bucket), id: label, label, sourceRows: bucket.length }))
    .sort((a,b) => field === 'date' ? a.label.localeCompare(b.label) : (b.sessions ?? -1) - (a.sessions ?? -1) || a.label.localeCompare(b.label));
}
function eventSteps(rows: readonly Row[]): readonly TrafficEventStep[] {
  const count = (event: string) => sum(rows.filter(row => value(row, 'eventName') === event), 'eventCount');
  return eventNames.slice(0,-1).map((event,index) => {
    const nextEvent = eventNames[index + 1]!, current = count(event), nextCount = count(nextEvent);
    return { id: event, event, nextEvent, count: current, nextCount, eventRatio: current !== null && current > 0 && nextCount !== null ? nextCount / current : null,
      difference: current !== null && nextCount !== null ? current - nextCount : null, sequential: false as const, unit: 'events' as const };
  });
}
function sourceOrders(rows: readonly Row[]): TrafficFrame['orderSources'] {
  // Do not pretend that orders from two connectors are reconciled identities.
  // Keep provider + connection populations visibly separate until reconciled.
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    if (text(row.stream) !== 'orders' || !isRevenueQualifyingStatus(value(row, 'status'))) continue;
    const key = JSON.stringify([text(row.provider_id), text(row.connection_id)]);
    const bucket = groups.get(key) ?? []; bucket.push(row); groups.set(key,bucket);
  }
  return [...groups.values()].map(bucket => ({ provider: text(bucket[0]!.provider_id) ?? 'unknown', connectionId: text(bucket[0]!.connection_id) ?? '', orders: bucket.length, revenue: amounts(bucket, 'grossAmount') }));
}
export async function fetchTrafficPortfolio(options: {
  readonly dataSource: Source; readonly tenantId: string; readonly workspaceId: string; readonly generatedAt: string;
  readonly dateRange: CommandCenterDateRangeInput | null; readonly filters?: TrafficPortfolioFilters;
}): Promise<TrafficPortfolio> {
  const { dataSource, tenantId, workspaceId, generatedAt, dateRange } = options;
  const filters = options.filters ?? {};
  const window = resolveMetricWindow(generatedAt, dateRange, 30);
  const from = dateLabel(window.periodStart, window.timezone), to = dateLabel(new Date(Date.parse(window.periodEnd) - 1).toISOString(), window.timezone);
  const length = Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / day) + 1;
  const shift = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00Z`) + days * day).toISOString().slice(0,10);
  const priorFrom = shift(from, -length), priorTo = shift(from, -1);
  const first = filters.compare ? priorFrom : from;
  const [rows, connections, checkpoints] = await Promise.all([
    dataSource.listCanonicalRecords(tenantId, workspaceId, { streams: ['traffic','events','traffic_breakdown','event_breakdown','orders'],
      businessTimeFrom: new Date(Date.parse(`${first}T00:00:00Z`) - day).toISOString(),
      businessTimeTo: new Date(Date.parse(`${to}T00:00:00Z`) + 2 * day).toISOString() }),
    dataSource.listConnections(tenantId,workspaceId), dataSource.listSyncCheckpoints(tenantId,workspaceId),
  ]);
  const allGa4Connections = connections.filter(row => text(row.provider_id) === 'ga4');
  const ga4Connections = allGa4Connections.filter(row => !filters.sourceId || (text(row.id) ?? text(row.connection_id)) === filters.sourceId);
  const sourceRows = filters.sourceId ? rows.filter(row => text(row.provider_id) !== 'ga4' || text(row.connection_id) === filters.sourceId) : rows;
  const trafficOld = dedupeGa4CanonicalRows(sourceRows, 'traffic');
  const trafficNew = dedupeGa4CanonicalRows(sourceRows, 'traffic_breakdown');
  const eventsOld = dedupeGa4CanonicalRows(sourceRows, 'events');
  const eventsNew = dedupeGa4CanonicalRows(sourceRows, 'event_breakdown');
  const breakdownAvailable = trafficNew.length > 0;
  const eventBreakdownAvailable = eventsNew.length > 0;
  const needsBreakdown = Boolean(filters.device || filters.country);
  // Use exactly one grain. A breakdown backfill may not cover old history.
  const prefer = (primary: readonly Row[], fallback: readonly Row[]) => {
    const days = new Set(primary.map(row => `${text(row.connection_id)}:${rowDate(row)}`));
    return [...primary, ...fallback.filter(row => !days.has(`${text(row.connection_id)}:${rowDate(row)}`))];
  };
  const chosen = needsBreakdown ? trafficNew : prefer(trafficOld, trafficNew);
  const usedGrains = new Set(chosen.map(row => text(row.stream)));
  const grain: TrafficPortfolio['scope']['grain'] = usedGrains.size > 1 ? 'mixed' : usedGrains.has('traffic') ? 'traffic' : 'traffic_breakdown';
  const matches = (row: Row) => (!filters.channel || value(row, 'channel') === filters.channel)
    && (!filters.device || value(row, 'device') === filters.device) && (!filters.country || value(row, 'country') === filters.country);
  const within = (row: Row, start: string, end: string) => { const d = rowDate(row); return d !== null && d >= start && d <= end; };
  function frame(start: string, end: string): TrafficFrame {
    const traffic = chosen.filter(row => within(row,start,end) && matches(row));
    const detailed = trafficNew.filter(row => within(row,start,end) && matches(row));
    const requiresEventBreakdown = Boolean(filters.channel || needsBreakdown);
    const events = (requiresEventBreakdown ? eventsNew : prefer(eventsOld, eventsNew)).filter(row => within(row,start,end) && (!requiresEventBreakdown || matches(row)));
    const orderWindow = resolveMetricWindow(generatedAt, { from: start, to: end, timezone: window.timezone },30);
    const orders = rows.filter(row => { const time = iso(row.effective_time); return text(row.stream) === 'orders' && time !== null && time >= orderWindow.periodStart && time < orderWindow.periodEnd; });
    const trendByDay = new Map(group(traffic, 'date').map(row => [row.label,row]));
    const trend: TrafficDimensionRow[] = [];
    for (let date = start; date <= end; date = shift(date,1)) trend.push(trendByDay.get(date) ?? { ...measures([]), id: date, label: date, sourceRows: 0 });
    return { from: start, to: end, sourceRows: traffic.length, metrics: measures(traffic), channels: group(traffic, 'channel'),
      landingPages: group(traffic, 'landingPage'), devices: group(detailed, 'device'), countries: group(detailed, 'country'), trend,
      events: eventSteps(events), orderSources: sourceOrders(orders) };
  }
  const current = frame(from,to), previous = filters.compare ? frame(priorFrom,priorTo) : null;
  const propertyTimezones = [...new Set([...chosen,...trafficNew].map(row => value(row, 'propertyTimezone')).filter((v): v is string => Boolean(v)))];
  const latestByConnection = ga4Connections.map(connection => {
    const id = text(connection.id) ?? text(connection.connection_id);
    const times = checkpoints.filter(row => text(row.connection_id) === id && (grain === 'mixed' ? ['traffic','traffic_breakdown'].includes(text(row.stream) ?? '') : text(row.stream) === grain)).map(row => iso(row.updated_at)).filter((v): v is string => v !== null).sort();
    return times.at(0) ?? null;
  });
  const synchronizedAt = latestByConnection.length > 0 && latestByConnection.every(Boolean) ? [...latestByConnection].sort()[0]! : null;
  const findings: TrafficFinding[] = [];
  const add = (id: string, severity: TrafficFinding['severity'], messagePl: string, messageEn: string, target: TrafficFinding['target'] = 'integrations') => findings.push({id,severity,messagePl,messageEn,target});
  if (filters.sourceId && !ga4Connections.length) add('SOURCE_UNAVAILABLE','error','Wybrane zrodlo nie jest dostepne w tym workspace.','Selected source is unavailable in this workspace.');
  if (!current.sourceRows) add('NO_TRAFFIC', 'warning', 'Brak rekordow GA4 zgodnych z okresem i filtrami. Nie oznacza to zerowego ruchu.', 'No GA4 records match this period and filters. This does not mean zero traffic.');
  if (!breakdownAvailable) add('BREAKDOWN_NOT_IMPORTED','warning','Przekroje urzadzen i krajow wymagaja synchronizacji nowych strumieni GA4 oraz uzupelnienia historii.','Device and country breakdowns require the new GA4 streams and a historical backfill.');
  if ((filters.channel || needsBreakdown) && !eventBreakdownAvailable) add('EVENT_FILTER_UNAVAILABLE','warning','Brak przekroju zdarzen dla tych filtrow. Nie pokazujemy niefiltrowanego lejka jako filtrowanego.','There is no event breakdown for these filters. An unfiltered funnel is not presented as filtered.');
  add('NOT_SEQUENTIAL_FUNNEL','info','Zdarzenia sa niezaleznymi licznikami. Roznica nie jest odplywem osob; stosunek moze przekraczac 100%. Lejek sekwencyjny wymaga danych sesji/uzytkownikow.','Events are independent counts. A difference is not a count of people dropping out; the ratio can exceed 100%. A sequential funnel requires session/user-level data.','help');
  add('USERS_NOT_ADDITIVE','info','Unikalnych uzytkownikow okresu nie wyliczamy przez dodawanie dni lub przekrojow.','Period-unique users cannot be calculated by adding daily or dimensional counts.','help');
  add('ORDER_COMPARISON_SCOPE','info','Zamowienia pokazujemy osobno dla kazdego polaczenia, bez przypisania do urzadzenia lub kanalu GA4. Nie sumuj potencjalnie nakladajacych sie sklepow/integratorow.','Orders are shown separately per connection, without GA4 device/channel attribution. Do not sum potentially overlapping stores/integrators.','help');
  if (!propertyTimezones.length || propertyTimezones.some(zone => zone !== window.timezone)) add('PROPERTY_TIMEZONE','warning','GA4 grupuje dni wedlug strefy uslugi. Nie przeliczamy agregatow dziennych na strefe workspace; strefa czesci historii moze byc nieznana.','GA4 calendar days use the property timezone. Daily aggregates are not rebucketed into workspace time; some historical timezone metadata may be unknown.');
  if (grain === 'mixed') add('MIXED_HISTORY_GRAINS','info','Historia laczy rozne raporty GA4; dla kazdej uslugi i dnia wykorzystano tylko jeden przekroj.','History uses different GA4 reports, with exactly one grain per property and day.');
  if (ga4Connections.length > 1) add('MULTIPLE_PROPERTIES','warning','Wyniki obejmuja kilka polaczen GA4; ten sam ruch moze byc mierzony w wiecej niz jednej usludze.','Results include multiple GA4 connections; the same traffic may be measured in more than one property.');
  if (chosen.some(row => entity(row).subjectToThresholding === true || entity(row).sampled === true || entity(row).dataLossFromOtherRow === true)) add('GA4_REPORT_LIMITATIONS','warning','GA4 sygnalizuje progowanie prywatnosci, probkowanie lub agregacje (other).','GA4 reports privacy thresholding, sampling or (other) aggregation.');
  if (current.events.some(step => step.eventRatio !== null && step.eventRatio > 1)) add('EVENT_RATIO_ABOVE_ONE','warning','Licznik pozniejszego zdarzenia przekracza wczesniejszy. Sprawdz definicje, powtorzenia i zakres pomiaru.','A later event count exceeds the earlier count. Review definitions, duplicates and measurement scope.','decisions');
  add('HISTORY_COVERAGE_UNKNOWN','info','Checkpoint potwierdza wykonanie synchronizacji, nie kompletnosc calej historii. Odczyt nie uruchamia pobierania z Google.','A checkpoint confirms a synchronization, not complete historical coverage. Refreshing this view does not fetch from Google.');
  const unique = (field: string, source: readonly Row[]) => [...new Set(source.map(row => value(row,field)).filter((v): v is string => Boolean(v)))].sort();
  return { version: 'traffic.portfolio.v1', current, previous,
    scope: { timezone: window.timezone, propertyTimezones, calculatedAt: generatedAt, synchronizedAt, connectedSources: ga4Connections.length,
      sourceId: filters.sourceId ?? null, grain, breakdownAvailable, eventBreakdownAvailable, filtersSupported: !needsBreakdown || breakdownAvailable,
      channel: filters.channel ?? null, device: filters.device ?? null, country: filters.country ?? null },
    choices: { sources: allGa4Connections.map(row => ({id: text(row.id) ?? text(row.connection_id) ?? '', label: text(row.display_name) ?? text(row.name) ?? `GA4 ${text(row.id) ?? text(row.connection_id)}`})), channels: unique('channel',[...trafficOld,...trafficNew]), devices: unique('device',trafficNew), countries: unique('country',trafficNew) }, findings };
}
