import { useEffect, useRef, useState } from 'react';
import { Button } from '../../design-system/components/Button';
import { buildReportSnapshot, reportConfigError, reportConfigKey } from './SavedReports.build';
import {
  defaultReportConfig,
  latestReportVersion,
  reportMetricLabels,
  reportTemplate,
  reportTemplates,
  type ReportCommand,
  type ReportConfig,
  type ReportSnapshot,
  type ReportsStore,
  type SavedReport,
} from './SavedReports.model';
import { downloadReport, reportJson } from './SavedReports.export';
import { ReportDocument } from './ReportDocument';

type Props = {
  report: SavedReport;
  commit: (c: ReportCommand) => Promise<ReportsStore>;
  onDone: (version: number) => void;
  onBack: () => void;
  onCopy: (config: ReportConfig) => void;
  onReload: () => void;
  build?: (c: ReportConfig) => Promise<ReportSnapshot>;
};
export function ReportEditor({
  report,
  commit,
  onDone,
  onBack,
  onCopy,
  onReload,
  build = async (c) => buildReportSnapshot(c),
}: Props) {
  const [config, setConfig] = useState(() =>
    structuredClone(report.draft?.config ?? latestReportVersion(report)!.config),
  );
  const [saved, setSaved] = useState(report.draft ? 'Szkic zapisany' : 'Nowa wersja'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [publishing, setPublishing] = useState(false),
    [note, setNote] = useState('');
  const [preview, setPreview] = useState<{ key: string; snapshot: ReportSnapshot } | null>(null);
  const revision = useRef(report.revision),
    lastSaved = useRef(reportConfigKey(config)),
    pending = useRef<Promise<unknown>>(Promise.resolve()),
    generation = useRef(0),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, []);
  const configRef = useRef(config);
  configRef.current = config;
  const save = (next: ReportConfig) => {
    const task = pending.current
      .catch(() => {})
      .then(async () => {
        if (lastSaved.current === reportConfigKey(next)) return;
        if (mounted.current) setSaved('Zapisywanie szkicu…');
        try {
          const result = await commit({
            type: 'draft',
            id: report.id,
            expectedRevision: revision.current,
            config: next,
          });
          revision.current = result.reports.find((r) => r.id === report.id)!.revision;
          lastSaved.current = reportConfigKey(next);
          if (mounted.current) {
            setSaved(
              lastSaved.current === reportConfigKey(configRef.current)
                ? 'Szkic zapisany'
                : 'Niezapisane zmiany',
            );
            setError('');
          }
        } catch (e) {
          if (mounted.current) {
            setSaved('Szkic niezapisany');
            setError(e instanceof Error ? e.message : 'Nie udało się zapisać.');
          }
          throw e;
        }
      });
    pending.current = task;
    return task;
  };
  useEffect(() => {
    if (lastSaved.current !== reportConfigKey(config)) void save(config).catch(() => {});
  }, [config]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (lastSaved.current !== reportConfigKey(configRef.current)) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, []);
  const change = (patch: Partial<ReportConfig>) => {
    setConfig((c) => ({ ...c, ...patch }));
    setError('');
    generation.current++;
    setBusy(false);
  };
  const calculate = async () => {
    const invalid = reportConfigError(config);
    if (invalid) {
      setError(invalid);
      return;
    }
    const token = ++generation.current,
      key = reportConfigKey(config);
    setBusy(true);
    setError('');
    try {
      const snapshot = await build(structuredClone(config));
      if (token === generation.current && mounted.current) setPreview({ key, snapshot });
    } catch (e) {
      if (token === generation.current)
        setError(
          e instanceof Error ? e.message : 'Przeliczenie nie powiodło się. Spróbuj ponownie.',
        );
    } finally {
      if (token === generation.current) setBusy(false);
    }
  };
  const publish = async () => {
    if (!preview || preview.key !== reportConfigKey(config)) return;
    setPublishing(true);
    try {
      await save(config);
      const result = await commit({
        type: 'publish',
        id: report.id,
        expectedRevision: revision.current,
        config,
        snapshot: preview.snapshot,
        note,
      });
      revision.current = result.reports.find((r) => r.id === report.id)!.revision;
      onDone(latestReportVersion(result.reports.find((r) => r.id === report.id)!)!.number);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Zapis wersji nie powiódł się.');
    } finally {
      setPublishing(false);
    }
  };
  const back = async () => {
    try {
      await save(config);
      onBack();
    } catch {
      /* Keep the unsaved form open. */
    }
  };
  const template = reportTemplate(config.template),
    validPreview = preview?.key === reportConfigKey(config);
  return (
    <div className="pd-reports-editor">
      <div className="pd-reports-toolbar">
        <Button variant="ghost" onClick={() => void back()}>
          ← Biblioteka
        </Button>
        <span role="status">{saved}</span>
        <div className="pd-reports-actions">
          <Button
            variant="secondary"
            disabled={publishing}
            onClick={() => void save(config).catch(() => {})}
          >
            Zapisz szkic
          </Button>
          <Button
            variant="primary"
            disabled={!validPreview || busy || publishing}
            onClick={() => void publish()}
          >
            {publishing
              ? 'Zapisywanie…'
              : 'Zapisz wersję ' + ((latestReportVersion(report)?.number ?? 0) + 1)}
          </Button>
        </div>
      </div>
      {error && (
        <div className="pd-reports-alert" role="alert">
          <p>{error}</p>
          <div className="pd-reports-actions">
            <Button variant="secondary" onClick={() => onCopy(config)}>
              Zapisz jako osobny raport
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                downloadReport(
                  reportJson({
                    ...report,
                    draft: {
                      config,
                      baseVersion: report.versions.length,
                      updatedAt: new Date().toISOString(),
                      author: report.owner,
                    },
                  }),
                  'application/json',
                  `${report.id}-szkic.json`,
                )
              }
            >
              Pobierz kopię szkicu
            </Button>
            <Button variant="ghost" onClick={onReload}>
              Wczytaj aktualny zapis
            </Button>
          </div>
        </div>
      )}
      <div className="pd-reports-editor__grid">
        <section className="pd-reports-form" aria-label="Ustawienia raportu" inert={publishing}>
          <div className="pd-reports-eyebrow">
            EDYTOR / WERSJA {(latestReportVersion(report)?.number ?? 0) + 1}
          </div>
          <h1 tabIndex={-1}>Ułóż raport wokół pytania</h1>
          <p className="pd-reports-muted">
            Szkic zapisuje się podczas pracy. Wersję zapiszesz po przeliczeniu podglądu.
          </p>
          <label>
            Tytuł raportu
            <input
              maxLength={160}
              value={config.title}
              onChange={(e) => change({ title: e.target.value })}
            />
          </label>
          <label>
            Pytanie biznesowe <small>opcjonalne</small>
            <textarea
              maxLength={1000}
              rows={2}
              value={config.question}
              onChange={(e) => change({ question: e.target.value })}
              placeholder="Na jakie pytanie ma odpowiedzieć ten raport?"
            />
          </label>
          <label>
            Szablon
            <select
              value={config.template}
              onChange={(e) => {
                const next = defaultReportConfig(e.target.value as ReportConfig['template']);
                change({
                  template: next.template,
                  metricIds: next.metricIds,
                  filter: next.filter,
                  chart: next.chart,
                });
              }}
            >
              {reportTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          {config.template === 'inventory' ? (
            <p className="pd-reports-inline-note">
              Migawka magazynu: 31 sierpnia 2026. Popyt: poprzednie 30 dni.
            </p>
          ) : (
            <fieldset>
              <legend>Okres danych</legend>
              <div className="pd-reports-date-fields">
                <label>
                  Od
                  <input
                    type="date"
                    value={config.from}
                    onChange={(e) => change({ from: e.target.value })}
                  />
                </label>
                <label>
                  Do
                  <input
                    type="date"
                    value={config.to}
                    onChange={(e) => change({ to: e.target.value })}
                  />
                </label>
              </div>
            </fieldset>
          )}
          <label>
            Zakres
            <select value={config.filter} onChange={(e) => change({ filter: e.target.value })}>
              {template.filters.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Metryki w podsumowaniu</legend>
            {template.metricIds.map((id) => (
              <label className="pd-reports-check" key={id}>
                <input
                  type="checkbox"
                  checked={config.metricIds.includes(id)}
                  onChange={(e) =>
                    change({
                      metricIds: e.target.checked
                        ? [...config.metricIds, id]
                        : config.metricIds.filter((x) => x !== id),
                    })
                  }
                />
                {id === 'revenue' && config.template === 'campaigns'
                  ? 'Przychód przypisany'
                  : reportMetricLabels[id]}
              </label>
            ))}
          </fieldset>
          {!['orders', 'inventory'].includes(config.template) && (
            <label>
              Wykres
              <select
                value={config.chart}
                onChange={(e) => change({ chart: e.target.value as ReportConfig['chart'] })}
              >
                <option value="line">Liniowy · przebieg w czasie</option>
                <option value="bar">Słupkowy · porównanie dni</option>
                <option value="none">Bez wykresu</option>
              </select>
            </label>
          )}
          <label>
            Komentarz autora <small>opcjonalny</small>
            <textarea
              rows={5}
              maxLength={12000}
              value={config.notes}
              onChange={(e) => change({ notes: e.target.value })}
              placeholder="Wnioski, ustalenia i kontekst do liczb…"
            />
          </label>
          <label>
            Opis tej wersji <small>opcjonalny</small>
            <input
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Np. uzupełnienie komentarza do budżetu"
            />
          </label>
          <Button variant="primary" disabled={busy || publishing} onClick={() => void calculate()}>
            {busy ? 'Przeliczanie…' : 'Przelicz podgląd'}
          </Button>
          {busy && (
            <Button
              variant="ghost"
              onClick={() => {
                generation.current++;
                setBusy(false);
              }}
            >
              Anuluj przeliczanie
            </Button>
          )}
        </section>
        <section className="pd-reports-preview" aria-label="Podgląd przed zapisaniem">
          <div className="pd-reports-preview__bar">
            <strong>Podgląd wyniku</strong>
            <span>
              {validPreview
                ? 'Gotowy do zapisu'
                : preview
                  ? 'Wymaga przeliczenia'
                  : 'Jeszcze nieprzeliczony'}
            </span>
          </div>
          {preview ? (
            <>
              <div
                inert={!validPreview}
                className={validPreview ? '' : 'pd-reports-preview--stale'}
              >
                <ReportDocument
                  key={preview.key}
                  config={JSON.parse(preview.key) as ReportConfig}
                  snapshot={preview.snapshot}
                  preview
                />
              </div>
              {!validPreview && (
                <p className="pd-reports-inline-note">
                  Ustawienia się zmieniły. Przelicz podgląd, zanim zapiszesz wersję.
                </p>
              )}
            </>
          ) : (
            <div className="pd-reports-empty">
              <span className="pd-reports-document-mark" aria-hidden="true">
                ▤
              </span>
              <h2>Najpierw pytanie. Potem liczby.</h2>
              <p>
                Wybierz zakres i metryki, a następnie przelicz podgląd. Zobaczysz dokładnie to, co
                zostanie zapisane.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
