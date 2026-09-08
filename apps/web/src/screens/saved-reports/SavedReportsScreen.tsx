import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../design-system/components/Button';
import { Drawer } from '../../design-system/components/Drawer';
import {
  buildReportSnapshot,
  compareReportVersions,
  reportDate,
  reportNumber,
} from './SavedReports.build';
import { createReportsDemo } from './SavedReports.demo';
import { downloadReport, reportCsv, reportHtml, reportJson } from './SavedReports.export';
import {
  defaultReportConfig,
  latestReportVersion,
  reportCollections,
  reportTemplate,
  reportTemplates,
  reportTitle,
  reportsActor,
  type ReportCollection,
  type ReportCommand,
  type ReportConfig,
  type ReportSnapshot,
  type ReportsStore,
  type SavedReport,
} from './SavedReports.model';
import { parseReportImport, reportsStorageKey } from './SavedReports.store';
import { useReportsStore } from './useReportsStore';
import { ReportDocument } from './ReportDocument';
import { ReportEditor } from './ReportEditor';
import './SavedReports.css';

type Route = { id: string; version: number; edit: boolean };
type Props = {
  data?: ReportsStore;
  mode?: 'demo' | 'live';
  persistenceKey?: string | null;
  canManage?: boolean;
  state?: 'ready' | 'loading' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
  initialReportId?: string;
  initialVersion?: number;
  initialCollection?: ReportCollection;
  initialEdit?: boolean;
  build?: (c: ReportConfig) => Promise<ReportSnapshot>;
  onCommand?: (c: ReportCommand) => Promise<ReportsStore>;
};
const readRoute = (fallback: Route): Route => {
  const q = new URLSearchParams(location.search);
  return {
    id: q.get('reportId') ?? fallback.id,
    version: Number(q.get('reportVersion') ?? fallback.version) || 0,
    edit: q.has('reportMode') ? q.get('reportMode') === 'edit' : fallback.edit,
  };
};
export function SavedReportsScreen({
  data,
  mode = 'demo',
  persistenceKey = reportsStorageKey,
  canManage = true,
  state = 'ready',
  errorMessage,
  onRetry,
  initialReportId = '',
  initialVersion = 0,
  initialCollection = 'all',
  initialEdit = false,
  build = async (c) => buildReportSnapshot(c),
  onCommand,
}: Props) {
  const initial = useMemo(() => data ?? createReportsDemo(), [data]);
  const liveManageable = mode === 'live' && !!onCommand;
  const { store, commit, readError } = useReportsStore(
    initial,
    mode === 'demo' ? persistenceKey : null,
    canManage && (mode === 'demo' || liveManageable),
    liveManageable ? onCommand : undefined,
  );
  const [route, setRoute] = useState(() =>
    readRoute({ id: initialReportId, version: initialVersion, edit: initialEdit }),
  );
  const [collection, setCollection] = useState<ReportCollection>(() => {
    const v = new URLSearchParams(location.search).get('reportCollection');
    return v && v in reportCollections ? (v as ReportCollection) : initialCollection;
  });
  const [search, setSearch] = useState(
      () => new URLSearchParams(location.search).get('reportSearch') ?? '',
    ),
    [domain, setDomain] = useState('all'),
    [sort, setSort] = useState('updated');
  const [panel, setPanel] = useState<
      null | 'templates' | 'history' | 'export' | 'archive' | 'discard' | 'reload'
    >(null),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [compare, setCompare] = useState(1),
    [restoreNote, setRestoreNote] = useState(''),
    [editorKey, setEditorKey] = useState(0);
  const file = useRef<HTMLInputElement>(null),
    heading = useRef<HTMLDivElement>(null);
  const report = store.reports.find((r) => r.id === route.id),
    version = report?.versions.find(
      (v) => v.number === (route.version || latestReportVersion(report)?.number),
    );
  const editable =
    canManage && (mode === 'demo' || liveManageable) && !readError && !report?.external;
  useEffect(() => {
    const sync = () => {
      setRoute(readRoute({ id: '', version: 0, edit: false }));
      const q = new URLSearchParams(location.search),
        c = q.get('reportCollection');
      setCollection(c && c in reportCollections ? (c as ReportCollection) : 'all');
      setSearch(q.get('reportSearch') ?? '');
      setPanel(null);
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  const write = (patch: Record<string, string>, push = false) => {
    const url = new URL(location.href);
    Object.entries(patch).forEach(([key, value]) =>
      value ? url.searchParams.set(key, value) : url.searchParams.delete(key),
    );
    window.history[push ? 'pushState' : 'replaceState'](window.history.state, '', url);
  };
  const open = (id = '', v = 0, edit = false) => {
    setRoute({ id, version: v, edit });
    setPanel(null);
    setError('');
    write(
      { reportId: id, reportVersion: v ? String(v) : '', reportMode: edit ? 'edit' : '' },
      true,
    );
    requestAnimationFrame(() => {
      heading.current?.querySelector<HTMLElement>('h1')?.focus();
      heading.current?.scrollIntoView({ block: 'start' });
    });
  };
  const perform = async (c: ReportCommand, success: string) => {
    setPending(true);
    setError('');
    try {
      const next = await commit(c);
      setMessage(success);
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się zapisać zmiany.');
      return null;
    } finally {
      setPending(false);
    }
  };
  const create = async (config: ReportConfig) => {
    const id = `RAP-${crypto.randomUUID()}`;
    if (await perform({ type: 'create', id, config }, 'Utworzono szkic raportu.'))
      open(id, 0, true);
  };
  const duplicate = async () => {
    if (!report) return;
    const id = `RAP-${crypto.randomUUID()}`;
    if (
      await perform(
        { type: 'duplicate', id: report.id, version: version?.number ?? 0, newId: id },
        'Utworzono osobny szkic.',
      )
    )
      open(id, 0, true);
  };
  const updateCollection = (value: ReportCollection) => {
    setCollection(value);
    write({ reportCollection: value === 'all' ? '' : value });
  };
  const visible = store.reports
    .filter((r) => (collection === 'archive' ? r.archived : !r.archived))
    .filter((r) => collection !== 'favorites' || r.favorite)
    .filter((r) => collection !== 'mine' || r.ownerId === reportsActor.id)
    .filter((r) => collection !== 'drafts' || r.draft || r.external?.status === 'draft')
    .filter(
      (r) =>
        domain === 'all' ||
        (r.draft?.config.template ?? latestReportVersion(r)?.config.template) === domain,
    )
    .filter((r) =>
      `${reportTitle(r)} ${r.owner} ${r.id} ${latestReportVersion(r)?.config.question ?? ''}`
        .toLocaleLowerCase('pl')
        .includes(search.toLocaleLowerCase('pl')),
    )
    .sort((a, b) =>
      sort === 'title'
        ? reportTitle(a).localeCompare(reportTitle(b), 'pl')
        : sort === 'created'
          ? b.createdAt.localeCompare(a.createdAt)
          : b.updatedAt.localeCompare(a.updatedAt),
    );
  const activeCount = store.reports.filter((r) => !r.archived).length,
    drafts = store.reports.filter((r) => !r.archived && r.draft);
  const prior = report?.versions.find((v) => v.number === compare),
    comparison = prior && version ? compareReportVersions(prior, version) : null;
  const toolbar = (
    <div className="pd-reports-toolbar">
      <Button variant="ghost" onClick={() => open()}>
        ← Biblioteka
      </Button>
      <div className="pd-reports-actions">
        {report && !report.external && (
          <>
            <Button
              variant="ghost"
              disabled={!editable || pending}
              aria-pressed={report.favorite}
              onClick={() =>
                void perform(
                  { type: 'favorite', id: report.id, expectedRevision: report.revision },
                  report.favorite ? 'Usunięto z ulubionych.' : 'Dodano do ulubionych.',
                )
              }
            >
              {report.favorite ? '★ W ulubionych' : '☆ Dodaj do ulubionych'}
            </Button>
            {version && (
              <Button
                variant="secondary"
                onClick={() => {
                  setCompare(Math.max(1, version.number - 1));
                  setPanel('history');
                }}
              >
                Historia wersji ({report.versions.length})
              </Button>
            )}
            <Button
              variant="secondary"
              disabled={!editable || pending}
              onClick={() => void duplicate()}
            >
              Utwórz kopię
            </Button>
            {version && (
              <Button variant="secondary" onClick={() => setPanel('export')}>
                Eksportuj raport
              </Button>
            )}
            {!report.archived ? (
              <Button
                variant="primary"
                disabled={!editable}
                onClick={() => open(report.id, 0, true)}
              >
                {report.draft ? 'Kontynuuj szkic' : 'Przygotuj nową wersję'}
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={!editable || pending}
                onClick={() =>
                  void perform(
                    { type: 'unarchive', id: report.id, expectedRevision: report.revision },
                    'Przywrócono raport do biblioteki.',
                  )
                }
              >
                Przywróć z archiwum
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
  return (
    <div className="pd-reports" ref={heading}>
      <div className="pd-reports-mode" role="note">
        <span className="pd-reports-mode__dot" />
        {mode === 'demo'
          ? `Podgląd produktu · dane przykładowe · ${persistenceKey ? 'zapis w tej przeglądarce' : 'zmiany tylko w tej sesji podglądu'}`
          : 'Biblioteka raportów Twojego obszaru roboczego'}
      </div>
      {readError && (
        <div className="pd-reports-alert" role="alert">
          <strong>Nie udało się odczytać biblioteki</strong>
          <p>{readError} Edycja została zatrzymana, aby nie nadpisać zapisu.</p>
          {persistenceKey && (
            <Button
              variant="secondary"
              onClick={() => {
                const raw = localStorage.getItem(persistenceKey);
                if (raw)
                  downloadReport(raw, 'application/json', 'papadata-biblioteka-do-odzyskania.json');
              }}
            >
              Pobierz oryginalny zapis
            </Button>
          )}
        </div>
      )}
      {message && (
        <p className="pd-reports-status" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="pd-reports-alert" role="alert">
          {error}
        </p>
      )}
      {state === 'loading' ? (
        <div className="pd-reports-empty" role="status">
          <h1 tabIndex={-1}>Zapisane raporty</h1>
          <p>Wczytywanie biblioteki raportów…</p>
        </div>
      ) : state === 'error' ? (
        <div className="pd-reports-empty">
          <h1 tabIndex={-1}>Nie udało się wczytać raportów</h1>
          <p role="alert">{errorMessage || 'Sprawdź połączenie i spróbuj ponownie.'}</p>
          {onRetry && <Button onClick={onRetry}>Spróbuj ponownie</Button>}
        </div>
      ) : route.id ? (
        !report ? (
          <div className="pd-reports-empty">
            <h1 tabIndex={-1}>Nie znaleziono raportu</h1>
            <p>
              Link może wskazywać raport zapisany w innej przeglądarce. Możesz zaimportować
              otrzymany plik JSON.
            </p>
            <Button onClick={() => open()}>Wróć do biblioteki</Button>
          </div>
        ) : route.edit && editable && !report.archived ? (
          <ReportEditor
            key={`${report.id}-${editorKey}`}
            report={report}
            commit={commit}
            onDone={(v) => {
              setMessage(`Zapisano wersję ${v}. Poprzednie wersje pozostają w historii.`);
              open(report.id, v);
            }}
            onBack={() => open()}
            onCopy={(c) => void create({ ...c, title: `Kopia · ${c.title}`.slice(0, 160) })}
            onReload={() => setPanel('reload')}
            build={build}
          />
        ) : (
          <>
            {toolbar}
            <header className="pd-reports-reader-heading">
              <div>
                <div className="pd-reports-eyebrow">
                  {report.archived ? 'ARCHIWUM' : 'BIBLIOTEKA RAPORTÓW'} /{' '}
                  {report.id.startsWith('RAP-') && report.id.length < 15
                    ? report.id
                    : 'RAPORT WŁASNY'}
                </div>
                <h1 tabIndex={-1}>{version?.config.title ?? reportTitle(report)}</h1>
                <p>
                  {version
                    ? `Wersja ${version.number} z ${reportDate(version.createdAt)} · ${version.author}`
                    : `Właściciel: ${report.owner}`}
                </p>
              </div>
              <span className="pd-reports-version-seal">
                {version
                  ? `v${version.number}`
                  : report.external
                    ? `v${report.external.currentVersion}`
                    : 'Szkic'}
              </span>
            </header>
            {report.draft && (
              <div className="pd-reports-inline-note">
                Ten raport ma niezapisaną wersję roboczą. Czytasz ostatni zapisany wynik.
                {editable && !report.archived && (
                  <Button variant="ghost" onClick={() => open(report.id, 0, true)}>
                    Wróć do szkicu →
                  </Button>
                )}
              </div>
            )}
            {version ? (
              <ReportDocument
                key={`${report.id}-${version.number}`}
                config={version.config}
                snapshot={version.snapshot}
              />
            ) : (
              <div className="pd-reports-empty">
                <h2>
                  {report.external
                    ? 'Definicja raportu bez zapisanego wyniku'
                    : 'Ten raport jest jeszcze szkicem'}
                </h2>
                <p>
                  {report.external
                    ? report.external.description
                    : 'Otwórz szkic, przelicz dane i zapisz pierwszą wersję.'}
                </p>
                {report.external && (
                  <p>
                    Dostępne są nazwa, status i numer wersji. Ten zapis nie zawiera danych raportu
                    ani historii wyników do odczytania.
                  </p>
                )}
              </div>
            )}
            {editable && !report.archived && (
              <footer className="pd-reports-reader-footer">
                <span>Historia i źródła pozostają przy raporcie.</span>
                <Button variant="ghost" onClick={() => setPanel('archive')}>
                  Przenieś do archiwum
                </Button>
                {report.draft && (
                  <Button variant="ghost" onClick={() => setPanel('discard')}>
                    Odrzuć szkic
                  </Button>
                )}
              </footer>
            )}
          </>
        )
      ) : (
        <>
          <header className="pd-reports-header">
            <div>
              <div className="pd-reports-eyebrow">TWOJA WIEDZA, ZAPISANA</div>
              <h1 tabIndex={-1}>
                Zapisane raporty<span className="pd-reports-count">{activeCount}</span>
              </h1>
              <p>Wyniki, do których możesz wrócić. Z kontekstem, źródłami i historią zmian.</p>
            </div>
            <div className="pd-reports-actions">
              {editable && (
                <>
                  <input
                    ref={file}
                    type="file"
                    accept=".json,application/json"
                    className="pd-reports-file"
                    aria-label="Plik raportu JSON"
                    onChange={async (e) => {
                      const selected = e.target.files?.[0];
                      e.target.value = '';
                      if (!selected) return;
                      try {
                        if (selected.size > 4_000_000)
                          throw new Error('Plik może mieć maksymalnie 4 MB.');
                        const imported = parseReportImport(await selected.text()),
                          id = `RAP-${crypto.randomUUID()}`;
                        if (
                          await perform(
                            { type: 'import', report: imported, newId: id },
                            'Zaimportowano osobną kopię raportu.',
                          )
                        )
                          open(id);
                      } catch (e) {
                        setError(e instanceof Error ? e.message : 'Nie udało się wczytać pliku.');
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    disabled={!editable || pending}
                    onClick={() => file.current?.click()}
                  >
                    Importuj JSON
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!editable}
                    onClick={() => setPanel('templates')}
                  >
                    + Nowy raport
                  </Button>
                </>
              )}
            </div>
          </header>
          {mode === 'live' && !liveManageable && (
            <p className="pd-reports-inline-note">
              Dostępne definicje raportów są tylko do odczytu. Zapisywanie wyniku i historia wersji
              wymagają udostępnienia tych danych przez źródło.
            </p>
          )}
          {collection === 'all' && !search && domain === 'all' && drafts[0] && (
            <section className="pd-reports-resume" aria-label="Kontynuuj pracę">
              <div className="pd-reports-resume__icon" aria-hidden="true">
                ▤
              </div>
              <div>
                <span className="pd-reports-eyebrow">WRÓĆ DO ROZPOCZĘTEGO RAPORTU</span>
                <h2>{reportTitle(drafts[0])}</h2>
                <p>
                  Szkic · {drafts[0].draft?.author} · {reportDate(drafts[0].draft!.updatedAt)}
                </p>
              </div>
              <Button
                variant="secondary"
                disabled={!editable}
                onClick={() => open(drafts[0].id, 0, true)}
              >
                Kontynuuj szkic →
              </Button>
            </section>
          )}
          <nav className="pd-reports-collections" aria-label="Kolekcje raportów">
            {Object.entries(reportCollections).map(([id, label]) => (
              <button
                type="button"
                key={id}
                aria-current={collection === id ? 'page' : undefined}
                onClick={() => updateCollection(id as ReportCollection)}
              >
                {label}
                <span>
                  {
                    store.reports.filter((r) =>
                      id === 'archive'
                        ? r.archived
                        : !r.archived &&
                          (id === 'all' ||
                            (id === 'favorites' && r.favorite) ||
                            (id === 'mine' && r.ownerId === reportsActor.id) ||
                            (id === 'drafts' && (r.draft || r.external?.status === 'draft'))),
                    ).length
                  }
                </span>
              </button>
            ))}
          </nav>
          <div className="pd-reports-filters">
            <label className="pd-reports-search">
              Szukaj raportu
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  write({ reportSearch: e.target.value });
                }}
                placeholder="Tytuł, pytanie lub autor…"
              />
            </label>
            <label>
              Temat
              <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                <option value="all">Wszystkie tematy</option>
                {reportTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sortowanie
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="updated">Ostatnio zmienione</option>
                <option value="created">Najnowsze</option>
                <option value="title">Tytuł A–Z</option>
              </select>
            </label>
          </div>
          <div className="pd-reports-list-heading">
            <h2>{reportCollections[collection]}</h2>
            <span role="status">
              {visible.length} {visible.length === 1 ? 'raport' : 'raportów'}
            </span>
          </div>
          {visible.length ? (
            <ul className="pd-reports-list" aria-label="Raporty w bibliotece">
              {visible.map((r) => {
                const v = latestReportVersion(r),
                  t = r.draft?.config.template ?? v?.config.template;
                return (
                  <li key={r.id}>
                    <button
                      className="pd-reports-favorite"
                      disabled={!editable || !!r.external || pending}
                      aria-label={`${r.favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}: ${reportTitle(r)}`}
                      aria-pressed={r.favorite}
                      onClick={() =>
                        void perform(
                          { type: 'favorite', id: r.id, expectedRevision: r.revision },
                          r.favorite ? 'Usunięto z ulubionych.' : 'Dodano do ulubionych.',
                        )
                      }
                    >
                      {r.favorite ? '★' : '☆'}
                    </button>
                    <button
                      className="pd-reports-list__open"
                      onClick={() => open(r.id, 0, !v && !r.external)}
                    >
                      <div className="pd-reports-list__title">
                        <h3>{reportTitle(r)}</h3>
                        <span
                          className="pd-reports-tag"
                          data-tone={r.draft ? 'warning' : 'neutral'}
                        >
                          {r.draft
                            ? 'Szkic'
                            : r.external?.status === 'draft'
                              ? 'Szkic'
                              : `Wersja ${v?.number ?? r.external?.currentVersion ?? 1}`}
                        </span>
                      </div>
                      <p>
                        {r.draft?.config.question ||
                          v?.config.question ||
                          r.external?.description ||
                          'Raport oczekuje na uzupełnienie kontekstu.'}
                      </p>
                      <div className="pd-reports-list__meta">
                        <span>{t ? reportTemplate(t).label : 'Definicja raportu'}</span>
                        <span>{v?.snapshot.scopeLabel ?? 'Bez zapisanego wyniku'}</span>
                        {v?.snapshot.quality !== 'complete' && v && (
                          <span className="pd-reports-quality">
                            {v.snapshot.quality === 'empty'
                              ? 'Brak obserwacji'
                              : 'Z ograniczeniami'}
                          </span>
                        )}
                      </div>
                    </button>
                    <div className="pd-reports-list__author">
                      <strong>{r.owner}</strong>
                      <span>{reportDate(r.updatedAt)}</span>
                    </div>
                    <span className="pd-reports-list__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="pd-reports-empty">
              <span className="pd-reports-document-mark" aria-hidden="true">
                ▤
              </span>
              <h2>
                {search || domain !== 'all'
                  ? 'Brak pasujących raportów'
                  : collection === 'favorites'
                    ? 'Zapisz to, do czego wracasz'
                    : collection === 'archive'
                      ? 'Archiwum jest puste'
                      : collection === 'drafts'
                        ? 'Nie masz otwartych szkiców'
                        : 'Tutaj zaczyna się Twoja biblioteka'}
              </h2>
              <p>
                {search || domain !== 'all'
                  ? 'Zmień wyszukiwanie lub temat.'
                  : 'Raport zachowuje wynik, źródła i komentarz z chwili zapisu.'}
              </p>
              {search || domain !== 'all' ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setDomain('all');
                    write({ reportSearch: '' });
                  }}
                >
                  Wyczyść filtry
                </Button>
              ) : (
                editable && (
                  <Button variant="primary" onClick={() => setPanel('templates')}>
                    Utwórz raport z szablonu
                  </Button>
                )
              )}
            </div>
          )}
          <footer className="pd-reports-library-footer">
            <span>Wersja raportu = liczby + zakres + źródła + komentarz.</span>
            <span>Wynik pozostaje niezmienny do zapisu nowej wersji.</span>
          </footer>
        </>
      )}
      <Drawer
        open={panel !== null}
        dismissible={!pending}
        onOpenChange={() => setPanel(null)}
        title={
          {
            templates: 'Nowy raport',
            history: 'Historia i porównanie wersji',
            export: 'Eksport i udostępnianie',
            archive: 'Przenieś raport do archiwum',
            discard: 'Odrzuć zmiany w szkicu',
            reload: 'Wczytaj aktualny zapis',
          }[panel ?? 'templates']
        }
        side="right"
        width={620}
        className="pd-reports-drawer"
      >
        {panel === 'templates' && (
          <>
            <p>
              Wybierz pytanie, od którego chcesz zacząć. Zakres, metryki i komentarz dopracujesz w
              edytorze.
            </p>
            <div className="pd-reports-templates">
              {reportTemplates.map((t, i) => (
                <button
                  key={t.id}
                  disabled={pending}
                  onClick={() => void create(defaultReportConfig(t.id))}
                >
                  <span className="pd-reports-template-number">0{i + 1}</span>
                  <div>
                    <small>{t.domain}</small>
                    <h3>{t.label}</h3>
                    <p>{t.description}</p>
                  </div>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </>
        )}
        {panel === 'history' && report && version && (
          <>
            <p>
              Każda wersja zachowuje swój zakres, wynik i komentarz. Przywrócenie tworzy nowy zapis.
            </p>
            <ol className="pd-reports-history">
              {[...report.versions].reverse().map((v) => (
                <li key={v.number}>
                  <div>
                    <strong>
                      Wersja {v.number}
                      {v.number === version.number ? ' · czytasz tę wersję' : ''}
                    </strong>
                    <p>{v.note}</p>
                    <small>
                      {v.author} · {reportDate(v.createdAt)}
                    </small>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={v.number === version.number}
                    onClick={() => open(report.id, v.number)}
                  >
                    Otwórz
                  </Button>
                </li>
              ))}
            </ol>
            <label>
              Porównaj czytaną wersję {version.number} z wersją
              <select value={compare} onChange={(e) => setCompare(Number(e.target.value))}>
                {report.versions.map((v) => (
                  <option key={v.number} value={v.number}>
                    Wersja {v.number} · {v.snapshot.scopeLabel}
                  </option>
                ))}
              </select>
            </label>
            {comparison && (
              <>
                <p className="pd-reports-inline-note">
                  {compare === version.number
                    ? 'Wybrano tę samą wersję.'
                    : comparison.comparable
                      ? 'Ten sam okres, szablon i filtr. Różnica = wersja czytana minus porównywana.'
                      : 'Zakresy lub szablony są różne. Pokazujemy wartości bez wyliczania zmiany.'}
                </p>
                <div className="pd-reports-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Metryka</th>
                        <th>v{compare}</th>
                        <th>v{version.number}</th>
                        <th>Różnica</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.metrics.map((m) => (
                        <tr key={m.id}>
                          <th scope="row">{m.label}</th>
                          <td>{reportNumber(m.before, m.unit)}</td>
                          <td>{reportNumber(m.value, m.unit)}</td>
                          <td>
                            {reportNumber(m.delta, m.unit === '%' ? undefined : m.unit)}
                            {m.unit === '%' && m.delta !== null ? ' p.p.' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h3>Komentarz w porównywanej wersji</h3>
                <p className="pd-reports-preserve">{prior?.config.notes || 'Bez komentarza.'}</p>
              </>
            )}
            {editable &&
              !report.archived &&
              version.number !== latestReportVersion(report)?.number && (
                <>
                  <label>
                    Powód przywrócenia
                    <input
                      value={restoreNote}
                      maxLength={1000}
                      onChange={(e) => setRestoreNote(e.target.value)}
                    />
                  </label>
                  <Button
                    variant="primary"
                    disabled={pending || !!report.draft}
                    onClick={async () => {
                      const next = await perform(
                        {
                          type: 'restore',
                          id: report.id,
                          expectedRevision: report.revision,
                          version: version.number,
                          note: restoreNote,
                        },
                        'Przywrócono wynik jako nową wersję.',
                      );
                      if (next)
                        open(
                          report.id,
                          latestReportVersion(next.reports.find((r) => r.id === report.id)!)!
                            .number,
                        );
                    }}
                  >
                    Przywróć jako wersję {report.versions.length + 1}
                  </Button>
                  {report.draft && <p>Najpierw zapisz lub odrzuć otwarty szkic.</p>}
                </>
              )}
          </>
        )}
        {panel === 'export' && report && version && (
          <>
            <p>
              <strong>{version.config.title}</strong>
              <br />
              Wersja {version.number} · {version.snapshot.scopeLabel}
            </p>
            <div className="pd-reports-export-options">
              {[
                {
                  format: 'HTML',
                  text: 'Gotowy raport do otwarcia, wysłania lub wydruku do PDF.',
                  content: () => reportHtml(version),
                  mime: 'text/html',
                  ext: 'html',
                },
                {
                  format: 'CSV',
                  text: 'Metryki, dane tabeli, źródła i komentarz do arkusza.',
                  content: () => reportCsv(version),
                  mime: 'text/csv;charset=utf-8',
                  ext: 'csv',
                },
                {
                  format: 'JSON',
                  text: 'Kopia tej wersji do ponownego importu w PapaData.',
                  content: () => reportJson(report, version.number),
                  mime: 'application/json',
                  ext: 'json',
                },
              ].map((o) => (
                <div key={o.ext}>
                  <div>
                    <h3>{o.format}</h3>
                    <p>{o.text}</p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      downloadReport(
                        o.content(),
                        o.mime,
                        `papadata-raport-v${version.number}.${o.ext}`,
                      );
                      setMessage(`Przygotowano plik ${o.format}, wersja ${version.number}.`);
                    }}
                  >
                    Pobierz {o.format}
                  </Button>
                </div>
              ))}
            </div>
            <h3>Link do zapisanej wersji</h3>
            <p>
              {mode === 'demo'
                ? 'Link działa w tej przeglądarce z tą samą biblioteką. Aby przekazać raport innej osobie, pobierz HTML lub JSON.'
                : 'Dostęp wymaga uprawnień do tego obszaru roboczego.'}
            </p>
            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  const url = new URL(location.href);
                  url.searchParams.set('reportId', report.id);
                  url.searchParams.set('reportVersion', String(version.number));
                  url.searchParams.delete('reportMode');
                  await navigator.clipboard.writeText(url.toString());
                  setMessage('Skopiowano link do tej wersji.');
                } catch {
                  setError('Nie udało się skopiować linku. Użyj adresu z paska przeglądarki.');
                }
              }}
            >
              Kopiuj link do wersji {version.number}
            </Button>
            <p className="pd-reports-footnote">
              Pliki zawierają dane i komentarze tej wersji. HTML działa samodzielnie, bez połączenia
              z PapaData. PDF zapiszesz przez „Drukuj” w otwartym pliku HTML.
            </p>
          </>
        )}
        {(panel === 'archive' || panel === 'discard') && report && (
          <>
            <p>
              {panel === 'archive'
                ? 'Raport z całą historią trafi do Archiwum. Możesz go później przywrócić.'
                : report.versions.length
                  ? 'Usuniemy wyłącznie zmiany robocze. Zapisane wersje pozostają w historii.'
                  : 'Ten szkic nie ma zapisanej wersji. Odrzucenie usunie go z biblioteki.'}
            </p>
            <strong>{reportTitle(report)}</strong>
            <div className="pd-reports-actions">
              <Button variant="secondary" onClick={() => setPanel(null)}>
                Zachowaj raport
              </Button>
              <Button
                variant={panel === 'discard' ? 'danger' : 'primary'}
                disabled={pending}
                onClick={async () => {
                  if (
                    await perform(
                      {
                        type: panel === 'archive' ? 'archive' : 'discard',
                        id: report.id,
                        expectedRevision: report.revision,
                      },
                      panel === 'archive' ? 'Raport przeniesiono do archiwum.' : 'Odrzucono szkic.',
                    )
                  ) {
                    if (panel === 'archive') updateCollection('archive');
                    open();
                  }
                }}
              >
                {panel === 'archive' ? 'Przenieś do archiwum' : 'Odrzuć szkic'}
              </Button>
            </div>
          </>
        )}
        {panel === 'reload' && (
          <>
            <p>
              Twój otwarty formularz zostanie zastąpiony aktualnym zapisem biblioteki. Niezapisane
              zmiany z formularza przepadną.
            </p>
            <div className="pd-reports-actions">
              <Button variant="secondary" onClick={() => setPanel(null)}>
                Zachowaj formularz
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setEditorKey((n) => n + 1);
                  setPanel(null);
                }}
              >
                Wczytaj zapis
              </Button>
            </div>
          </>
        )}
        {error && panel && (
          <p role="alert" className="pd-reports-alert">
            {error}
          </p>
        )}
      </Drawer>
    </div>
  );
}
