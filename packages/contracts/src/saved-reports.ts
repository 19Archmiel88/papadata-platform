import { cleanProductContextPath } from './product-context.js';
export type ReportTemplateId = 'overview' | 'products' | 'inventory' | 'campaigns' | 'orders' | 'customers' | 'traffic';
export type ReportUnit = 'PLN' | '%' | 'szt.' | 'dni' | '×' | (string & {});
export type ReportContext = { sourcePath:string; conversationId?:string|null; caseThreadId?:string|null; decisionId?:string|null; budgetPlanId?:string|null };

export type ReportConfig = {
  timezone?: string;
  context?: ReportContext | null;
  title: string;
  question: string;
  template: ReportTemplateId;
  from: string;
  to: string;
  filter: string;
  metricIds: string[];
  chart: 'line' | 'bar' | 'none';
  notes: string;
};
export type ReportMetric = {
  id: string;
  label: string;
  value: number | null;
  unit: ReportUnit;
  definition: string;
};
export type ReportSource = { id: string; label: string; detail: string; path: string | null };
export type ReportSnapshot = {
  generatedAt: string;
  previewId?: string;
  mode: 'demo' | 'live' | 'imported';
  scopeLabel: string;
  currency: string;
  timezone: string;
  quality: 'complete' | 'partial' | 'empty';
  limitations: string[];
  metrics: ReportMetric[];
  series: { date: string; value: number | null }[];
  seriesMetric: string;
  columns: { id: string; label: string; unit?: ReportUnit }[];
  rows: { id: string; values: Record<string, string | number | null> }[];
  sources: ReportSource[];
};
export type ReportVersion = {
  number: number;
  createdAt: string;
  author: string;
  note: string;
  config: ReportConfig;
  snapshot: ReportSnapshot;
  restoredFrom?: number;
};
export type ReportDraft = {
  config: ReportConfig;
  updatedAt: string;
  baseVersion: number;
  author: string;
};
export type SavedReport = {
  id: string;
  revision: number;
  owner: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  archived: boolean;
  versions: ReportVersion[];
  draft: ReportDraft | null;
  external?: {
    name: string;
    description: string;
    currentVersion: number;
    visibility: string;
    status: string;
  };
};
export type ReportsStore = { schema: 1; workspace: string; reports: SavedReport[] };
export type ReportCommand =
  | { type: 'create'; id: string; config: ReportConfig }
  | { type: 'draft'; id: string; expectedRevision: number; config: ReportConfig }
  | {
      type: 'publish';
      id: string;
      expectedRevision: number;
      config: ReportConfig;
      snapshot: ReportSnapshot;
      note: string;
    }
  | { type: 'favorite' | 'archive' | 'unarchive' | 'discard'; id: string; expectedRevision: number }
  | { type: 'restore'; id: string; expectedRevision: number; version: number; note: string }
  | { type: 'duplicate'; id: string; version: number; newId: string }
  | { type: 'import'; report: SavedReport; newId: string };
export type ReportsActor = { id: string; name: string };
export const reportsActor: ReportsActor = { id: 'artur', name: 'Artur Wiśniewski' };
export const reportCollections = {
  all: 'Wszystkie raporty',
  favorites: 'Ulubione',
  mine: 'Moje raporty',
  drafts: 'Szkice',
  archive: 'Archiwum',
} as const;
export type ReportCollection = keyof typeof reportCollections;
export type ReportTemplate = {
  id: ReportTemplateId;
  label: string;
  description: string;
  domain: string;
  metricIds: string[];
  filters: { id: string; label: string }[];
};
export const reportTemplates: readonly ReportTemplate[] = [
  {id:'customers',label:'Portfel i retencja',domain:'Klienci',description:'Agregaty portfela na dzien i aktywnosc w okresie; bez danych osobowych.',metricIds:['customerCount','activeCustomers','newCustomers','observedLtv'],filters:[{id:'all',label:'Portfel w walucie workspace'}]},
  {id:'traffic',label:'Ruch i pomiar',domain:'Ruch',description:'Sesje, transakcje oraz jakosc pomiaru GA4 z kontekstem filtrow.',metricIds:['sessions','transactions','purchaseRate','engagement'],filters:[{id:'all',label:'Zakres z kontekstu analizy'}]},
  {
    id: 'overview',
    label: 'Wynik biznesu',
    domain: 'Przegląd',
    description: 'Wynik sprzedaży i jawne ograniczenia kosztów oraz marży.',
    metricIds: ['revenue', 'margin', 'marketingSpend', 'orders'],
    filters: [{ id: 'all', label: 'Cały sklep' }],
  },
  {
    id: 'products',
    label: 'Rentowność produktów',
    domain: 'Produkty',
    description: 'Wkład SKU w marżę z jawnymi brakami kosztów.',
    metricIds: ['revenue', 'knownMargin', 'costCoverage', 'units'],
    filters: [
      { id: 'all', label: 'Wszystkie kategorie' },
      { id: 'Beauty', label: 'Twarz' },
      { id: 'Hair', label: 'Włosy' },
      { id: 'Body', label: 'Ciało' },
      { id: 'Accessories', label: 'Akcesoria' },
    ],
  },
  {
    id: 'inventory',
    label: 'Zapasy i dostępność',
    domain: 'Produkty',
    description: 'Dostępny zapas, pokrycie i kapitał na konkretny dzień.',
    metricIds: ['available', 'capital', 'atRisk', 'unknown'],
    filters: [
      { id: 'all', label: 'Wszystkie kategorie' },
      { id: 'Beauty', label: 'Twarz' },
      { id: 'Hair', label: 'Włosy' },
      { id: 'Body', label: 'Ciało' },
      { id: 'Accessories', label: 'Akcesoria' },
    ],
  },
  {
    id: 'campaigns',
    label: 'Efektywność kampanii',
    domain: 'Kampanie',
    description: 'Wydatki i wynik przypisany do kampanii z definicją atrybucji.',
    metricIds: ['spend', 'revenue', 'roas', 'ncac'],
    filters: [
      { id: 'all', label: 'Wszystkie kanały' },
      { id: 'google_ads', label: 'Google Ads' },
      { id: 'meta_ads', label: 'Meta Ads' },
    ],
  },
  {
    id: 'orders',
    label: 'Realizacja zamówień',
    domain: 'Zamówienia',
    description: 'Wartość, realizacja i zamówienia wymagające uwagi.',
    metricIds: ['count', 'gross', 'late', 'refunded'],
    filters: [
      { id: 'all', label: 'Wszystkie źródła' },
      { id: 'WooCommerce', label: 'WooCommerce' },
      { id: 'BaseLinker', label: 'BaseLinker' },
    ],
  },
];
export const reportMetricLabels: Record<string, string> = {
 customerCount:'Klienci w portfelu',activeCustomers:'Aktywni klienci',newCustomers:'Nowi zaobserwowani klienci',observedLtv:'Wartosc zaobserwowana portfela',sessions:'Sesje',transactions:'Transakcje GA4',purchaseRate:'Transakcje / sesje',engagement:'Sesje zaangazowane / sesje',
  revenue: 'Sprzedaż według definicji źródła',
  margin: 'Marża po marketingu',
  marketingSpend: 'Koszt marketingu',
  orders: 'Zamówienia',
  knownMargin: 'Marża z rozliczonym kosztem',
  costCoverage: 'Pokrycie kosztem',
  units: 'Sprzedane sztuki',
  available: 'Dostępne sztuki',
  capital: 'Kapitał o znanym koszcie',
  atRisk: 'SKU zagrożone brakiem',
  unknown: 'SKU bez oceny pokrycia',
  spend: 'Koszt reklam',
  roas: 'ROAS',
  ncac: 'Koszt pozyskania',
  count: 'Liczba zamówień',
  gross: 'Wartość brutto',
  late: 'Po terminie wysyłki',
  refunded: 'Zwroty wartości',
};
export const reportTemplate = (id: ReportTemplateId) => reportTemplates.find((t) => t.id === id)!;
export const latestReportVersion = (report: SavedReport) => report.versions.at(-1) ?? null;
export const reportTitle = (report: SavedReport) =>
  report.draft?.config.title ||
  latestReportVersion(report)?.config.title ||
  report.external?.name ||
  'Raport bez tytułu';
export const defaultReportConfig = (template: ReportTemplateId = 'overview'): ReportConfig => ({
  title: reportTemplate(template).label,
  question: '',
  template,
  from: '2026-08-01',
  to: '2026-08-31',
  filter: 'all',
  metricIds: [...reportTemplate(template).metricIds],
  chart: template === 'inventory' ? 'none' : 'line',
  notes: '',
});

export function reportConfigError(config: ReportConfig): string | null {
  if(config.timezone!==undefined&&!validReportTimezone(config.timezone))return 'Nieprawidlowa strefa czasowa raportu.';
  if(config.context!=null&&!validReportContext(config.context))return 'Nieprawidlowy kontekst raportu.';
  if (!config.title.trim() || config.title.length > 160)
    return 'Podaj tytuł raportu (do 160 znaków).';
  const template = reportTemplate(config.template);
  if (!template) return 'Wybierz dostępny szablon.';
  if (
    ![config.from, config.to].every(
      (d) =>
        /^\d{4}-\d{2}-\d{2}$/.test(d) &&
        Number.isFinite(Date.parse(d)) &&
        new Date(d).toISOString().slice(0, 10) === d,
    )
  )
    return 'Podaj prawidłowe daty okresu.';
  const days = ((Date.parse(config.to) - Date.parse(config.from)) / 86400000 + 1);
  if (!Number.isFinite(days) || days < 1 || days > 366)
    return 'Wybierz poprawny okres od 1 do 366 dni.';
  if (!template.filters.some((f) => f.id === config.filter))
    return 'Wybierz filtr dostępny dla tego szablonu.';
  if (
    !config.metricIds.length ||
    config.metricIds.length > 4 ||
    new Set(config.metricIds).size !== config.metricIds.length ||
    config.metricIds.some((id) => !template.metricIds.includes(id))
  )
    return 'Wybierz od jednej do czterech różnych metryk.';
  if (
    !['line', 'bar', 'none'].includes(config.chart) ||
    config.notes.length > 12000 ||
    config.question.length > 1000
  )
    return 'Sprawdź układ i długość komentarza (do 12 000 znaków).';
  return null;
}
export const reportConfigKey = (config: ReportConfig) => JSON.stringify(config);

export const reportsStorageKey = 'papadata.reports.demo.commerce.v1';
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
export function applyReportCommand(
  store: ReportsStore,
  command: ReportCommand,
  actor: ReportsActor,
  now: string,
): ReportsStore {
  const next = clone(store);
  if (command.type === 'create') {
    if (next.reports.some((r) => r.id === command.id)) throw new Error('Ten raport już istnieje.');
    next.reports.unshift({
      id: command.id,
      revision: 1,
      owner: actor.name,
      ownerId: actor.id,
      createdAt: now,
      updatedAt: now,
      favorite: false,
      archived: false,
      versions: [],
      draft: { config: clone(command.config), updatedAt: now, baseVersion: 0, author: actor.name },
    });
    return next;
  }
  if (command.type === 'import') {
    if (next.reports.some((r) => r.id === command.newId))
      throw new Error('Identyfikator kopii jest już używany.');
    const report = clone(command.report);
    next.reports.unshift({
      ...report,
      id: command.newId,
      revision: 1,
      owner: actor.name,
      ownerId: actor.id,
      createdAt: now,
      updatedAt: now,
      favorite: false,
      archived: false,
      external: undefined,
    });
    return next;
  }
  const report = next.reports.find((r) => r.id === command.id);
  if (!report) throw new Error('Raport nie jest już dostępny. Wróć do biblioteki.');
  if (report.external) throw new Error('Ten raport jest dostępny tylko do odczytu.');
  if ('expectedRevision' in command && report.revision !== command.expectedRevision)
    throw new Error(
      'Raport zmieniono w innej karcie. Zachowano Twój formularz. Wczytaj aktualny zapis lub zapisz swoją kopię.',
    );
  if (command.type === 'duplicate') {
    if (next.reports.some((r) => r.id === command.newId))
      throw new Error('Identyfikator kopii jest już używany.');
    const config =
      command.version === 0
        ? report.draft?.config
        : report.versions.find((v) => v.number === command.version)?.config;
    if (!config) throw new Error('Nie znaleziono wersji do skopiowania.');
    return applyReportCommand(
      next,
      {
        type: 'create',
        id: command.newId,
        config: { ...config, title: `Kopia · ${config.title}`.slice(0, 160) },
      },
      actor,
      now,
    );
  }
  if (report.archived && !['unarchive', 'favorite'].includes(command.type))
    throw new Error('Przywróć raport z archiwum przed zmianą.');
  if (command.type === 'favorite') report.favorite = !report.favorite;
  if (command.type === 'archive') report.archived = true;
  if (command.type === 'unarchive') report.archived = false;
  if (command.type === 'draft')
    report.draft = {
      config: clone(command.config),
      baseVersion: latestReportVersion(report)?.number ?? 0,
      updatedAt: now,
      author: actor.name,
    };
  if (command.type === 'discard') {
    if (!report.versions.length) {
      next.reports = next.reports.filter((r) => r.id !== report.id);
      return next;
    }
    report.draft = null;
  }
  if (command.type === 'publish') {
    const error = reportConfigError(command.config);
    if (error) throw new Error(error);
    if (!validSnapshot(command.snapshot))
      throw new Error('Wynik raportu jest nieprawidłowy. Przelicz podgląd ponownie.');
    report.versions.push({
      number: (latestReportVersion(report)?.number ?? 0) + 1,
      createdAt: now,
      author: actor.name,
      note: command.note.trim().slice(0, 1000) || 'Zapis wyniku raportu',
      config: clone(command.config),
      snapshot: clone(command.snapshot),
    });
    report.draft = null;
  }
  if (command.type === 'restore') {
    if (report.draft) throw new Error('Najpierw zapisz lub odrzuć szkic.');
    const version = report.versions.find((v) => v.number === command.version);
    if (!version) throw new Error('Nie znaleziono wersji.');
    report.versions.push({
      ...clone(version),
      number: (latestReportVersion(report)?.number ?? 0) + 1,
      createdAt: now,
      author: actor.name,
      note: command.note || `Przywrócono wersję ${version.number}`,
      restoredFrom: version.number,
    });
  }
  report.revision++;
  report.updatedAt = now;
  return next;
}

const obj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, max = 12000): v is string => typeof v === 'string' && v.length <= max;
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const nullable = (v: unknown) => v === null || finite(v);
const list = (v: unknown, max: number, check: (v: unknown) => boolean): v is unknown[] =>
  Array.isArray(v) && v.length <= max && v.every(check);
const stamp = (v: unknown) => str(v, 40) && Number.isFinite(Date.parse(v));
const unit = (v: unknown) => typeof v==='string' && (/^[A-Z]{3}$/.test(v) || ['%', 'szt.', 'dni', '×'].includes(v));
export function validReportTimezone(value:unknown):value is string {
 if(typeof value!=='string'||value.length>100)return false;
 try{new Intl.DateTimeFormat('en',{timeZone:value}).format();return true;}catch{return false;}
}
export function validReportContext(value:unknown):value is ReportContext {
 if(!obj(value)||!str(value.sourcePath,4000)||cleanProductContextPath(value.sourcePath)!==value.sourcePath)return false;
 return ['conversationId','caseThreadId','decisionId','budgetPlanId'].every(key=>value[key]==null||(str(value[key],160)&&/^[A-Za-z0-9_.:-]+$/.test(value[key] as string)));
}

const day = (v: unknown) =>
  str(v, 10) &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
export function validReportConfig(v: unknown): v is ReportConfig {
  return (
    obj(v) &&
    str(v.title, 160) &&
    (v.timezone===undefined||validReportTimezone(v.timezone)) &&
    (v.context==null||validReportContext(v.context)) &&
    str(v.question, 1000) &&
    str(v.notes) &&
    reportTemplates.some((t) => t.id === v.template) &&
    str(v.from, 10) &&
    str(v.to, 10) &&
    str(v.filter, 100) &&
    list(v.metricIds, 4, (x) => str(x, 100)) &&
    ['line', 'bar', 'none'].includes(v.chart as string)
  );
}
const safeSourcePath = (v: unknown) =>
  v === null ||
  (str(v, 4000) && cleanProductContextPath(v)===v);
export function validSnapshot(v: unknown): v is ReportSnapshot {
  return (
    obj(v) &&
    stamp(v.generatedAt) &&
    ['demo', 'live', 'imported'].includes(v.mode as string) &&
    str(v.scopeLabel, 500) &&
    typeof v.currency==='string' && /^[A-Z]{3}$/.test(v.currency) &&
    validReportTimezone(v.timezone) &&
    ['complete', 'partial', 'empty'].includes(v.quality as string) &&
    list(v.limitations, 30, (x) => str(x)) &&
    list(
      v.metrics,
      4,
      (m) =>
        obj(m) &&
        str(m.id, 100) &&
        str(m.label, 200) &&
        nullable(m.value) &&
        unit(m.unit) &&
        str(m.definition, 2000),
    ) &&
    list(v.series, 366, (p) => obj(p) && day(p.date) && nullable(p.value)) &&
    str(v.seriesMetric, 200) &&
    list(
      v.columns,
      20,
      (c) =>
        obj(c) && str(c.id, 100) && str(c.label, 200) && (c.unit === undefined || unit(c.unit)),
    ) &&
    list(
      v.rows,
      2000,
      (r) =>
        obj(r) &&
        str(r.id, 200) &&
        obj(r.values) &&
        Object.keys(r.values).length <= 20 &&
        Object.values(r.values).every((x) => x === null || finite(x) || str(x, 2000)),
    ) &&
    list(
      v.sources,
      20,
      (s) =>
        obj(s) &&
        str(s.id, 100) &&
        str(s.label, 200) &&
        str(s.detail, 2000) &&
        safeSourcePath(s.path),
    )
  );
}
function validReport(v: unknown): v is SavedReport {
  if (
    !obj(v) ||
    !str(v.id, 200) ||
    !finite(v.revision) ||
    v.revision < 1 ||
    !Number.isInteger(v.revision) ||
    !str(v.owner, 200) ||
    !str(v.ownerId, 200) ||
    !stamp(v.createdAt) ||
    !stamp(v.updatedAt) ||
    typeof v.favorite !== 'boolean' ||
    typeof v.archived !== 'boolean' ||
    v.external !== undefined
  )
    return false;
  if (
    !list(
      v.versions,
      100,
      (x) =>
        obj(x) &&
        finite(x.number) &&
        Number.isInteger(x.number) &&
        x.number > 0 &&
        stamp(x.createdAt) &&
        str(x.author, 200) &&
        str(x.note, 1000) &&
        validReportConfig(x.config) &&
        !reportConfigError(x.config) &&
        validSnapshot(x.snapshot) &&
        (x.restoredFrom === undefined || finite(x.restoredFrom)),
    )
  )
    return false;
  if (v.versions.some((x, i) => !obj(x) || x.number !== i + 1)) return false;
  return (
    (v.draft === null && v.versions.length > 0) ||
    (obj(v.draft) &&
      validReportConfig(v.draft.config) &&
      stamp(v.draft.updatedAt) &&
      str(v.draft.author, 200) &&
      v.draft.baseVersion === v.versions.length)
  );
}
export function parseReportsStore(raw: string, workspace: string): ReportsStore {
  if (raw.length > 12_000_000) throw new Error('Biblioteka jest zbyt duża do wczytania.');
  const v: unknown = JSON.parse(raw);
  if (
    !obj(v) ||
    v.schema !== 1 ||
    v.workspace !== workspace ||
    !list(v.reports, 200, validReport) ||
    new Set(v.reports.map((r) => (r as SavedReport).id)).size !== v.reports.length
  )
    throw new Error('Nie można odczytać zapisu biblioteki. Zachowaliśmy oryginalne dane.');
  return v as ReportsStore;
}
export function parseReportImport(raw: string): SavedReport {
  if (raw.length > 4_000_000) throw new Error('Plik może mieć maksymalnie 4 MB.');
  const v: unknown = JSON.parse(raw);
  if (!obj(v) || v.format !== 'papadata-report' || v.schema !== 1 || !validReport(v.report))
    throw new Error('To nie jest poprawny plik raportu PapaData. Wybierz eksport JSON.');
  return v.report;
}

/** Validate the command boundary before any database mutation. */
export function parseReportCommand(value: unknown): ReportCommand {
  if (!obj(value) || JSON.stringify(value).length > 4_000_000)
    throw new Error('Nieprawidłowe polecenie raportu.');
  const id = (v: unknown) => str(v, 200) && /^[A-Za-z0-9_-]{1,200}$/.test(v);
  const revision = (v: unknown) => finite(v) && Number.isSafeInteger(v) && v >= 1;
  const version = (v: unknown) => finite(v) && Number.isSafeInteger(v) && v >= 0;
  const config = () => validReportConfig(value.config);
  let valid = false;
  switch (value.type) {
    case 'create': valid = id(value.id) && config(); break;
    case 'import': valid = id(value.newId) && validReport(value.report); break;
    case 'duplicate': valid = id(value.id) && id(value.newId) && version(value.version); break;
    case 'draft': valid = id(value.id) && revision(value.expectedRevision) && config(); break;
    case 'publish': valid = id(value.id) && revision(value.expectedRevision) && config() && validSnapshot(value.snapshot) && str(value.note, 1000); break;
    case 'restore': valid = id(value.id) && revision(value.expectedRevision) && version(value.version) && str(value.note, 1000); break;
    case 'favorite': case 'archive': case 'unarchive': case 'discard':
      valid = id(value.id) && revision(value.expectedRevision); break;
  }
  if (!valid) throw new Error('Nieprawidłowe polecenie raportu.');
  return value as ReportCommand;
}

export const reportDataLabel = (mode: ReportSnapshot['mode']) =>
  mode === 'demo' ? 'Dane przykładowe' : mode === 'imported' ? 'Dane z importu — niezweryfikowane' : 'Dane produkcyjne';
