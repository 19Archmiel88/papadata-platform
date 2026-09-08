import { describe, expect, it } from 'vitest';
import {
  buildReportSnapshot,
  compareReportVersions,
  reportConfigError,
} from './SavedReports.build';
import { createReportsDemo } from './SavedReports.demo';
import { reportCsv, reportHtml, reportJson } from './SavedReports.export';
import { defaultReportConfig, reportsActor, reportTemplates } from './SavedReports.model';
import { applyReportCommand, parseReportImport, parseReportsStore } from './SavedReports.store';
import { deriveOverview } from '../command-center/CommandCenterScreen.data';
import { commandCenterDemoSeed } from '../../fixtures/command-center/commandCenterDemoSeed';
const now = '2026-09-07T12:00:00Z';
describe('zapisany wynik raportu', () => {
  it.each(reportTemplates.map((t) => t.id))(
    'wylicza i odtwarza szablon %s bez błędów schematu',
    (template) => {
      const config = defaultReportConfig(template),
        snapshot = buildReportSnapshot(config, now);
      const store = applyReportCommand(
        { schema: 1, workspace: 'commerce', reports: [] },
        { type: 'create', id: 'new', config },
        reportsActor,
        now,
      );
      const published = applyReportCommand(
        store,
        { type: 'publish', id: 'new', expectedRevision: 1, config, snapshot, note: 'Test zapisu' },
        reportsActor,
        now,
      );
      expect(parseReportsStore(JSON.stringify(published), 'commerce')).toEqual(published);
    },
  );
  it('zachowuje zgodność metryk ze źródłowym Przeglądem', () => {
    const config = defaultReportConfig(),
      snapshot = buildReportSnapshot(config, now),
      source = deriveOverview(
        commandCenterDemoSeed,
        { ...config, preset: 'custom', timezone: 'Europe/Warsaw' },
        'previous_period',
      );
    expect(snapshot.metrics.find((m) => m.id === 'revenue')?.value).toBe(source.current.revenue);
    expect(snapshot.metrics.find((m) => m.id === 'margin')?.value).toBe(source.current.margin);
    expect(snapshot.rows).toHaveLength(31);
  });
  it('nie zamienia braku obserwacji na zerowy wynik', () => {
    const s = buildReportSnapshot(
      { ...defaultReportConfig(), from: '2028-01-01', to: '2028-01-31' },
      now,
    );
    expect(s.quality).toBe('empty');
    expect(s.metrics.every((m) => m.value === null)).toBe(true);
    expect(s.series.every((p) => p.value === null)).toBe(true);
  });
  it('wykazuje nieznaną marżę SKU i ograniczenia próbki', () => {
    const s = buildReportSnapshot(defaultReportConfig('products'), now);
    expect(s.quality).toBe('partial');
    expect(s.rows.some((r) => r.values.margin === null)).toBe(true);
    expect(s.limitations.some((l) => l.includes('koszt'))).toBe(true);
  });
  it('filtruje kanał zamówień, nie sumuje całej próbki', () => {
    const all = buildReportSnapshot(defaultReportConfig('orders')),
      woo = buildReportSnapshot({ ...defaultReportConfig('orders'), filter: 'WooCommerce' });
    expect(all.rows).toHaveLength(6);
    expect(woo.rows).toHaveLength(4);
    expect(woo.quality).toBe('partial');
  });
  it.each([
    { from: '2026-02-31' },
    { from: '2026-09-01', to: '2026-08-01' },
    { from: '', to: '' },
    { metricIds: [] },
    { metricIds: ['revenue', 'revenue'] },
    { filter: 'unknown' },
  ])('odrzuca niepoprawną konfigurację %j', (patch) =>
    expect(reportConfigError({ ...defaultReportConfig(), ...patch })).toBeTruthy(),
  );
});
describe('historia i trwałość biblioteki', () => {
  it('publikacja nie mutuje poprzedniej wersji ani wejściowego wyniku', () => {
    const store = createReportsDemo(),
      before = JSON.stringify(store),
      config = { ...store.reports[0].versions[1].config, notes: 'Nowy komentarz' },
      snapshot = buildReportSnapshot(config, now);
    const next = applyReportCommand(
      store,
      {
        type: 'publish',
        id: 'RAP-001',
        expectedRevision: 2,
        config,
        snapshot,
        note: 'Nowa wersja',
      },
      reportsActor,
      now,
    );
    snapshot.metrics[0].value = -999;
    config.title = 'Zmieniony obiekt';
    expect(JSON.stringify(store)).toBe(before);
    expect(next.reports[0].versions).toHaveLength(3);
    expect(next.reports[0].versions[2].snapshot.metrics[0].value).not.toBe(-999);
    expect(next.reports[0].versions[2].config.title).not.toBe('Zmieniony obiekt');
  });
  it('przywraca historyczny wynik jako kolejną wersję bez przeliczenia', () => {
    const store = createReportsDemo(),
      next = applyReportCommand(
        store,
        { type: 'restore', id: 'RAP-001', expectedRevision: 2, version: 1, note: 'Powrót' },
        reportsActor,
        now,
      );
    expect(next.reports[0].versions[2].snapshot).toEqual(store.reports[0].versions[0].snapshot);
    expect(next.reports[0].versions[2].restoredFrom).toBe(1);
  });
  it('chroni przed nadpisaniem przez nieaktualnego edytora', () => {
    const store = createReportsDemo();
    expect(() =>
      applyReportCommand(
        store,
        { type: 'draft', id: 'RAP-001', expectedRevision: 1, config: defaultReportConfig() },
        reportsActor,
        now,
      ),
    ).toThrow('innej karcie');
  });
  it('pozwala zapisać niekompletny szkic, ale nie opublikować go', () => {
    const store = createReportsDemo(),
      config = { ...defaultReportConfig(), from: '', title: '', metricIds: [] };
    const next = applyReportCommand(
      store,
      { type: 'draft', id: 'RAP-001', expectedRevision: 2, config },
      reportsActor,
      now,
    );
    expect(parseReportsStore(JSON.stringify(next), 'commerce').reports[0].draft?.config).toEqual(
      config,
    );
    expect(() =>
      applyReportCommand(
        next,
        {
          type: 'publish',
          id: 'RAP-001',
          expectedRevision: 3,
          config,
          snapshot: store.reports[0].versions[0].snapshot,
          note: '',
        },
        reportsActor,
        now,
      ),
    ).toThrow();
  });
  it('blokuje edycję archiwum i przywracanie z otwartym szkicem', () => {
    const store = createReportsDemo();
    expect(() =>
      applyReportCommand(
        store,
        { type: 'draft', id: 'RAP-006', expectedRevision: 1, config: defaultReportConfig() },
        reportsActor,
        now,
      ),
    ).toThrow('archiwum');
    expect(() =>
      applyReportCommand(
        store,
        { type: 'restore', id: 'RAP-004', expectedRevision: 1, version: 1, note: '' },
        reportsActor,
        now,
      ),
    ).toThrow('szkic');
  });
  it('kopiuje konfigurację do osobnego szkicu bez podszywania się pod nowy wynik', () => {
    const next = applyReportCommand(
      createReportsDemo(),
      { type: 'duplicate', id: 'RAP-001', version: 1, newId: 'copy' },
      reportsActor,
      now,
    );
    expect(next.reports[0].versions).toHaveLength(0);
    expect(next.reports[0].draft?.config.title).toMatch(/^Kopia/);
  });
  it('nie wylicza różnicy między nieporównywalnymi zakresami', () => {
    const a = createReportsDemo().reports[0].versions[0],
      b = structuredClone(a);
    b.config.from = '2026-08-15';
    const diff = compareReportVersions(a, b);
    expect(diff.comparable).toBe(false);
    expect(diff.metrics.every((m) => m.delta === null)).toBe(true);
  });
  it('odróżnia zmianę równą zero od nieznanej wartości', () => {
    const a = createReportsDemo().reports[0].versions[0];
    expect(compareReportVersions(a, a).metrics[0].delta).toBe(0);
    a.snapshot.metrics[0].value = null;
    expect(compareReportVersions(a, a).metrics[0].delta).toBeNull();
  });
});
describe('przenoszenie raportów', () => {
  it('eksportuje i importuje całą historię oraz wybraną wersję', () => {
    const report = createReportsDemo().reports[0];
    expect(parseReportImport(reportJson(report))).toEqual(report);
    const single = parseReportImport(reportJson(report, 2));
    expect(single.versions).toHaveLength(1);
    expect(single.versions[0].snapshot).toEqual(report.versions[1].snapshot);
  });
  it('import zawsze tworzy osobny raport', () => {
    const store = createReportsDemo(),
      next = applyReportCommand(
        store,
        { type: 'import', report: store.reports[0], newId: 'imported' },
        reportsActor,
        now,
      );
    expect(next.reports).toHaveLength(7);
    expect(next.reports.find((r) => r.id === 'RAP-001')).toEqual(store.reports[0]);
  });
  it('odrzuca uszkodzony zapis, inne workspace i niebezpieczne linki', () => {
    const store = createReportsDemo();
    expect(() => parseReportsStore(JSON.stringify(store), 'other')).toThrow();
    store.reports[0].versions[0].snapshot.sources[0].path = 'javascript:alert(1)';
    expect(() => parseReportsStore(JSON.stringify(store), 'commerce')).toThrow();
    expect(() => parseReportImport('{')).toThrow();
  });
  it('odrzuca zduplikowane numery wersji i niefinitywne wartości', () => {
    const store = createReportsDemo();
    store.reports[0].versions[1].number = 1;
    expect(() => parseReportsStore(JSON.stringify(store), 'commerce')).toThrow();
  });
  it('HTML nie uruchamia komentarza jako kodu, CSV chroni komórki formuł', () => {
    const v = createReportsDemo().reports[0].versions[0];
    v.config.notes = '<script>alert(1)</script>';
    v.config.title = '=HYPERLINK("https://evil")';
    const html = reportHtml(v),
      csv = reportCsv(v);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(csv).toContain('"\'=HYPERLINK');
  });
});
