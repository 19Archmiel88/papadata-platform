import { useEffect, useMemo, useRef, useState } from 'react';
import { updateProductQuery, useProductQuery } from '../../runtime/app/routing/productRoutes';
import type { DecisionContext } from '@papadata/contracts/decisions';
import { Button, Drawer } from '../../design-system';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { safeRandomUUID } from '../../runtime/shared/id/safeRandomUUID';
import { DecisionDetail, DecisionMeasurementSummary, DecisionTimeline } from './DecisionDetail';
import { DecisionCreate } from './DecisionCreate';
import { decisionsDemoData } from './DecisionsScreen.demo';
import {
  applyDecisionEvent,
  canMeasureDecision,
  decisionDate,
  decisionToday,
  filterDecisions,
  isOpenDecision,
  isOverdueDecision,
  restoreDecisionEvents,
  sortDecisions,
} from './DecisionsScreen.data';
import {
  decisionDomains,
  decisionFilters,
  decisionPriorities,
  decisionStatuses,
  decisionViews,
  type Decision,
  type DecisionCommand,
  type DecisionDomain,
  type DecisionEvent,
  type DecisionFilter,
  type DecisionsData,
  type DecisionView,
} from './DecisionsScreen.model';
import './DecisionsScreen.css';

const param = (key: string) =>
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(key);
function writeParam(key: string, value: string | null) { updateProductQuery({[key]:value}); }
const emptyData: DecisionsData = {
  id: 'empty',
  sourceDate: '2026-08-31',
  decisions: [],
  activity: [],
};
export function DecisionsScreen({
  data = decisionsDemoData,
  state = 'ready',
  onRetry,
  initialView,
  initialDecisionId,
  canManage = true,
  persistenceKey = 'papadata.decisions.demo.commerce.v1',
  today = decisionToday(),
  onCommand, canApprove = canManage, canExport = true, context, initialDraft,
}: {
  data?: DecisionsData | null;
  state?: 'ready' | 'loading' | 'error';
  onRetry?: () => void;
  initialView?: DecisionView;
  initialDecisionId?: string;
  canManage?: boolean;
  persistenceKey?: string | null;
  today?: string;
  onCommand?: (decisionId: string, command: DecisionCommand, context?: DecisionContext | null) => Promise<DecisionsData>;
  canApprove?: boolean;
  canExport?: boolean;
  context?: DecisionContext | null;
  initialDraft?: Partial<Extract<DecisionCommand, {type:'create'}>>;
} = {}) {
  const navigate = useShellNavigate();
  const { location } = useProductQuery();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const createId = useRef(safeRandomUUID());
  const source = data ?? emptyData;
  const hydrate = () => {
    try {
      return restoreDecisionEvents(
        source,
        persistenceKey ? localStorage.getItem(persistenceKey) : null,
      );
    } catch {
      return {
        ...restoreDecisionEvents(source, null),
        warning:
          'Zapis lokalny jest niedostępny. Zmiany pozostaną tylko do zamknięcia tego widoku.',
      };
    }
  };
  const [saved, setSaved] = useState(hydrate);
  const savedRef = useRef(saved);
  savedRef.current = saved;
  const sourceRef = useRef({ source, persistenceKey });
  useEffect(() => {
    if (sourceRef.current.source === source && sourceRef.current.persistenceKey === persistenceKey)
      return;
    sourceRef.current = { source, persistenceKey };
    const next = hydrate();
    savedRef.current = next;
    setSaved(next);
    setStorageWarning(next.warning);
  }, [source, persistenceKey]);
  const [view, setView] = useState<DecisionView>(
    initialView ??
      (Object.hasOwn(decisionViews, param('decisionView') ?? '')
        ? (param('decisionView') as DecisionView)
        : 'queue'),
  );
  const [filter, setFilter] = useState<DecisionFilter>(
    Object.hasOwn(decisionFilters, param('decisionFilter') ?? '')
      ? (param('decisionFilter') as DecisionFilter)
      : 'open',
  );
  const [domain, setDomain] = useState<DecisionDomain | 'all'>(
    Object.hasOwn(decisionDomains, param('decisionDomain') ?? '')
      ? (param('decisionDomain') as DecisionDomain)
      : 'all',
  );
  const [owner, setOwner] = useState(param('decisionOwner') ?? 'all');
  const [query, setQuery] = useState(param('decisionSearch') ?? '');
  const [sort, setSort] = useState<'priority' | 'due'>(
    param('decisionSort') === 'due' ? 'due' : 'priority',
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    initialDecisionId ?? param('decisionId'),
  );
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    setView(Object.hasOwn(decisionViews, param('decisionView') ?? '') ? param('decisionView') as DecisionView : initialView ?? 'queue');
    setFilter(Object.hasOwn(decisionFilters, param('decisionFilter') ?? '') ? param('decisionFilter') as DecisionFilter : 'open');
    setDomain(Object.hasOwn(decisionDomains, param('decisionDomain') ?? '') ? param('decisionDomain') as DecisionDomain : 'all');
    setOwner(param('decisionOwner') ?? 'all'); setQuery(param('decisionSearch') ?? '');
    setSort(param('decisionSort') === 'due' ? 'due' : 'priority'); setSelectedId(param('decisionId') ?? initialDecisionId ?? null);
  }, [location, initialView, initialDecisionId]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [storageWarning, setStorageWarning] = useState(saved.warning);
  useEffect(() => {
    if (!persistenceKey) return;
    const update = (event: StorageEvent) => {
      if (event.key !== persistenceKey || event.storageArea !== localStorage) return;
      const next = restoreDecisionEvents(source, event.newValue);
      savedRef.current = next;
      setSaved(next);
      setStorageWarning(next.warning);
      setMessage('Zaktualizowano decyzje po zmianie w innej karcie.');
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [persistenceKey, source]);
  const { decisions, activity } = saved.store;
  const owners = [...new Set(decisions.flatMap((d) => (d.owner ? [d.owner] : [])))].sort();
  const scoped = useMemo(
    () =>
      decisions.filter(
        (d) =>
          (domain === 'all' || d.domain === domain) &&
          (owner === 'all' || (owner === 'unassigned' ? d.owner === null : d.owner === owner)) &&
          `${d.title} ${d.id} ${d.observation} ${d.owner ?? ''}`
            .toLocaleLowerCase('pl')
            .includes(query.toLocaleLowerCase('pl')),
      ),
    [decisions, domain, owner, query],
  );
  const counts = Object.fromEntries(
    Object.keys(decisionFilters).map((f) => [
      f,
      filterDecisions(scoped, f as DecisionFilter, today).length,
    ]),
  ) as Record<DecisionFilter, number>;
  const rows = sortDecisions(filterDecisions(scoped, filter, today), sort);
  const overdue = scoped.filter((d) => isOverdueDecision(d, today));
  const needsOwner = scoped.filter((d) => isOpenDecision(d) && !d.owner);
  const measurements = scoped.filter((d) => d.status === 'measuring' || d.status === 'completed');
  const selected = decisions.find((d) => d.id === selectedId);
  const scopeIds = new Set(scoped.map((d) => d.id));
  const history = activity.filter((a) => scopeIds.has(a.decisionId));
  const first = sortDecisions(scoped.filter((d) => d.status === 'review'))[0];
  const select = (id: string | null) => {
    setSelectedId(id);
    writeParam('decisionId', id);
    setError(null);
  };
  const changeView = (next: DecisionView) => {
    setView(next);
    writeParam('decisionView', next);
  };
  const changeFilter = (next: DecisionFilter) => {
    setFilter(next);
    writeParam('decisionFilter', next);
    changeView('queue');
  };
  const clearFilters = () => {
    setQuery('');
    setOwner('all');
    setDomain('all');
    setFilter('open');
    for (const key of ['decisionSearch', 'decisionOwner', 'decisionDomain', 'decisionFilter'])
      writeParam(key, null);
  };
  async function dispatch(command: DecisionCommand, decisionId = selectedId): Promise<boolean> {
    if (!decisionId || pendingRef.current || !canManage) return false;
    if (onCommand) {
      pendingRef.current = true; setPending(true); setError(null); setMessage('');
      try {
        const confirmed = await onCommand(decisionId, command, command.type === 'create' ? context : null);
        const next = restoreDecisionEvents(confirmed, null);
        savedRef.current = next; setSaved(next); setStorageWarning(null);
        setMessage('Operacja potwierdzona przez serwer. Nie wykonano automatycznie zmian u zewnętrznego dostawcy.');
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nie udało się zapisać decyzji.');
        return false;
      } finally { pendingRef.current = false; setPending(false); }
    }
    const event: DecisionEvent = {
      id: safeRandomUUID(),
      decisionId,
      command,
      actor: 'Ty · podgląd lokalny',
      at: new Date().toISOString(),
    };
    // Merge the most recent tab's history before a command; a stale approval cannot execute twice.
    let current = savedRef.current;
    if (persistenceKey && !storageWarning) {
      try {
        const raw = localStorage.getItem(persistenceKey);
        if (raw) current = restoreDecisionEvents(source, raw);
      } catch {
        /* The write below reports unavailable storage without discarding the user's action. */
      }
    }
    const applied = applyDecisionEvent(current.store, event, canManage);
    if (applied.error) {
      setError(applied.error);
      return false;
    }
    const next = {
      store: applied.store,
      events: [...current.events, event],
      warning: current.warning,
    };
    let persisted = false;
    if (persistenceKey && !storageWarning && !current.warning) {
      try {
        localStorage.setItem(
          persistenceKey,
          JSON.stringify({ version: 1, dataset: source.id, events: next.events }),
        );
        persisted = true;
      } catch {
        setStorageWarning(
          'Nie udało się zapisać zmian w przeglądarce. Zachowano je w tym widoku; pobierz rejestr przed zamknięciem.',
        );
      }
    }
    savedRef.current = next;
    setSaved(next);
    setError(null);
    setMessage(
      `${applied.store.activity.at(-1)?.label}. ${persisted ? 'Zapisano lokalnie w tej przeglądarce.' : 'Zachowano w tym widoku.'}`,
    );
    return true;
  }
  const exportRegistry = () => {
    if (!canExport) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            mode: onCommand ? 'server' : 'demo',
            exportedAt: new Date().toISOString(),
            dataset: source.id,
            filters: { domain, owner, query },
            decisions: scoped,
            activity: history,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob),
      link = document.createElement('a');
    link.href = url;
    link.download = 'papadata-rejestr-decyzji.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`Pobrano rejestr: ${scoped.length} decyzji i ${history.length} wpisów historii.`);
  };
  return (
    <div className="pd-decisions" data-testid="decisions-screen">
      <header className="pd-decisions__header">
        <div>
          <h1>Decyzje</h1>
          <p>Od sygnału w danych do działania i sprawdzonego wyniku.</p>
        </div>
        <Button
          onClick={() => {
            createId.current = safeRandomUUID();
            setCreating(true);
            setError(null);
          }}
          disabled={pending || !canManage || state !== 'ready' || !data}
        >
          + Nowa decyzja
        </Button>
      </header>
      <nav className="pd-decisions__tabs" aria-label="Widoki decyzji">
        {Object.entries(decisionViews).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-current={view === id ? 'page' : undefined}
            onClick={() => changeView(id as DecisionView)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="pd-decisions__context">
        <span>
          {onCommand ? 'Rejestr serwerowy · bieżący workspace' : 'Dane przykładowe · zapis lokalny'}
          {data ? ` · źródła do ${decisionDate(data.sourceDate)}` : ''}
        </span>
        <span>Każda decyzja zachowuje własny okres dowodów</span>
      </div>
      <output className="pd-decisions__feedback" aria-live="polite">
        {message}
      </output>
      {storageWarning && (
        <p className="pd-decisions__notice" role="alert">
          {storageWarning}
        </p>
      )}
      {!canManage && (
        <p className="pd-decisions__notice">
          Dostęp tylko do odczytu. Możesz przeglądać dowody i historię.
        </p>
      )}
      {state === 'loading' ? (
        <section className="pd-decisions__empty" role="status">
          <h2>Wczytywanie decyzji…</h2>
          <p>Przygotowujemy kolejkę i historię działań.</p>
        </section>
      ) : state === 'error' || !data ? (
        <section className="pd-decisions__empty" role="alert">
          <h2>Nie udało się wczytać decyzji</h2>
          <p>Kolejka i jej statusy nie są teraz dostępne.</p>
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Spróbuj ponownie
            </Button>
          )}
        </section>
      ) : (
        <>
          {view === 'queue' && filter === 'open' && first && !query && (
            <section className="pd-decisions__focus" aria-label="Najbliższa decyzja">
              <div>
                <span className="pd-decisions__eyebrow">
                  Zacznij od tego · priorytet {decisionPriorities[first.priority].toLowerCase()}
                </span>
                <h2>{first.title}</h2>
                <p>{first.observation}</p>
                <Button variant="primary" onClick={() => select(first.id)}>
                  Oceń decyzję <span aria-hidden="true">→</span>
                </Button>
              </div>
              <aside>
                <span>Do dopilnowania w tym widoku</span>
                <button
                  type="button"
                  onClick={() => {
                    setSort('due');
                    writeParam('decisionSort', 'due');
                    changeFilter('overdue');
                  }}
                >
                  <strong>{overdue.length}</strong>
                  <span>po terminie działania</span>
                  <span aria-hidden="true">↗</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOwner('unassigned');
                    writeParam('decisionOwner', 'unassigned');
                  }}
                >
                  <strong>{needsOwner.length}</strong>
                  <span>bez przypisanej osoby</span>
                  <span aria-hidden="true">↗</span>
                </button>
                <p>Otwórz decyzję, aby sprawdzić dowody i uzgodniony plan.</p>
              </aside>
            </section>
          )}
          {view === 'queue' && (
            <div className="pd-decisions__summary" aria-label="Stan kolejki">
              {(
                [
                  ['review', 'Do decyzji', 'Oceń dowody i wybierz plan'],
                  ['approved', 'Do wykonania', 'Zatwierdzone, czekają na działanie'],
                  ['measuring', 'W pomiarze', 'Obserwuj wynik po wykonaniu'],
                  ['blocked', 'Wymaga wyjaśnienia', 'Uzupełnij brakujące informacje'],
                ] as const
              ).map(([id, label, hint]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => changeFilter(id)}
                  aria-pressed={filter === id}
                >
                  <span>{label}</span>
                  <strong>{counts[id]}</strong>
                  <small>{hint}</small>
                </button>
              ))}
            </div>
          )}
          <div className="pd-decisions__filters">
            <label className="pd-decisions__search">
              <input
                type="search"
                aria-label="Szukaj decyzji"
                placeholder="Szukaj decyzji, osoby lub numeru…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  writeParam('decisionSearch', e.target.value);
                }}
              />
            </label>
            <label>
              Obszar
              <select
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value as DecisionDomain | 'all');
                  writeParam('decisionDomain', e.target.value);
                }}
              >
                <option value="all">Wszystkie obszary</option>
                {Object.entries(decisionDomains).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Osoba
              <select
                value={owner}
                onChange={(e) => {
                  setOwner(e.target.value);
                  writeParam('decisionOwner', e.target.value);
                }}
              >
                <option value="all">Wszyscy</option>
                <option value="unassigned">Nieprzypisane</option>
                {owners.map((name) => (
                  <option key={name}>{name}</option>
                ))}
                {owner !== 'all' && owner !== 'unassigned' && !owners.includes(owner) && (
                  <option value={owner}>{owner}</option>
                )}
              </select>
            </label>
            {(domain !== 'all' || owner !== 'all' || query) && (
              <Button variant="ghost" size="small" onClick={clearFilters}>
                Wyczyść filtry
              </Button>
            )}
          </div>
          {view === 'queue' && (
            <>
              <div className="pd-decisions__queue-heading">
                <div>
                  <h2>
                    Kolejka działań <span>{rows.length}</span>
                  </h2>
                  <p>Każdy status oznacza osobny etap pracy.</p>
                </div>
                <label>
                  Sortowanie
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value as 'priority' | 'due');
                      writeParam('decisionSort', e.target.value);
                    }}
                  >
                    <option value="priority">Priorytet</option>
                    <option value="due">Termin działania</option>
                  </select>
                </label>
              </div>
              <div className="pd-decisions__pills" aria-label="Filtr statusu">
                {Object.entries(decisionFilters).map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    aria-pressed={filter === id}
                    onClick={() => changeFilter(id as DecisionFilter)}
                  >
                    {label}
                    <span>{counts[id as DecisionFilter]}</span>
                  </button>
                ))}
              </div>
              {rows.length ? (
                <ol className="pd-decisions__queue" aria-label="Decyzje w kolejce">
                  {rows.map((d) => (
                    <DecisionRow
                      key={d.id}
                      decision={d}
                      today={today}
                      onOpen={() => select(d.id)}
                    />
                  ))}
                </ol>
              ) : (
                <section className="pd-decisions__empty">
                  <h3>
                    {decisions.length ? 'Brak decyzji pasujących do filtrów' : 'Kolejka jest pusta'}
                  </h3>
                  <p>
                    {decisions.length
                      ? 'Zmień status, obszar lub osobę, aby zobaczyć pozostałe decyzje.'
                      : 'Dodaj pierwszą obserwację i proponowane działanie.'}
                  </p>
                  {decisions.length ? (
                    <Button variant="secondary" onClick={clearFilters}>
                      Pokaż otwarte decyzje
                    </Button>
                  ) : (
                    <Button disabled={!canManage} onClick={() => setCreating(true)}>
                      Dodaj pierwszą decyzję
                    </Button>
                  )}
                </section>
              )}
            </>
          )}
          {view === 'measurement' && (
            <section>
              <div className="pd-decisions__queue-heading">
                <div>
                  <h2>Co zmieniło się po działaniu</h2>
                  <p>
                    Każdy pomiar ma własną bazę i pełne okno obserwacji. To zmiana zaobserwowana,
                    bez potwierdzenia przyczynowości.
                  </p>
                </div>
              </div>
              {measurements.length ? (
                <div className="pd-decisions__measurements">
                  {measurements.map((d) => (
                    <article key={d.id}>
                      <header>
                        <span className="pd-decisions__status" data-status={d.status}>
                          {decisionStatuses[d.status]}
                        </span>
                        <span>
                          {d.id} · {d.owner}
                        </span>
                      </header>
                      <h2>
                        <button type="button" onClick={() => select(d.id)}>
                          {d.title} <span aria-hidden="true">↗</span>
                        </button>
                      </h2>
                      <DecisionMeasurementSummary decision={d} />
                      <Button variant="secondary" onClick={() => select(d.id)}>
                        {canMeasureDecision(d, today)
                          ? 'Uzupełnij wynik'
                          : d.status === 'completed'
                            ? 'Sprawdź pomiar i źródła'
                            : 'Zobacz plan pomiaru'}
                      </Button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="pd-decisions__empty">
                  <h3>Brak pomiarów w tym widoku</h3>
                  <p>Pomiar zaczyna się po odnotowaniu wykonania zatwierdzonego planu.</p>
                </div>
              )}
            </section>
          )}
          {view === 'history' && (
            <section>
              <div className="pd-decisions__queue-heading">
                <div>
                  <h2>Historia decyzji i odpowiedzialności</h2>
                  <p>
                    {scoped.length} decyzji · {history.length} zapisanych zdarzeń · zgodnie z
                    filtrami obszaru, osoby i wyszukiwania
                  </p>
                </div>
                <Button variant="secondary" onClick={exportRegistry} disabled={!canExport}>
                  Pobierz rejestr JSON
                </Button>
              </div>
              <div className="pd-decisions__registry">
                {sortDecisions(scoped).map((d) => (
                  <article key={d.id}>
                    <div>
                      <span>
                        {d.id} · {decisionDomains[d.domain]}
                      </span>
                      <h3>
                        <button type="button" onClick={() => select(d.id)}>
                          {d.title} <span aria-hidden="true">↗</span>
                        </button>
                      </h3>
                      <p>
                        {d.owner ?? 'Nieprzypisana osoba'} · {decisionStatuses[d.status]}
                      </p>
                    </div>
                    <DecisionTimeline activity={history.filter((a) => a.decisionId === d.id)} />
                  </article>
                ))}
              </div>
              {!scoped.length && (
                <p className="pd-decisions__empty">Brak decyzji pasujących do filtrów.</p>
              )}
            </section>
          )}
        </>
      )}
      <Drawer
        open={Boolean(selectedId) && state === 'ready'}
        onOpenChange={(open) => {
          if (!open) select(null);
        }}
        title={selected?.title ?? 'Nie znaleziono decyzji'}
        description={
          selected
            ? `${selected.id} · ${onCommand ? 'zapis serwerowy' : 'zapis demonstracyjny'}`
            : 'Identyfikator z adresu nie odpowiada decyzji w tym zbiorze.'
        }
        dismissible
        side="right"
        width={760}
      >
        {selected ? (
          <DecisionDetail
            key={`${selected.id}:${selected.status}`}
            decision={selected}
            activity={activity.filter((a) => a.decisionId === selected.id)}
            today={today}
            canManage={canManage && !pending}
            canApprove={canApprove && !pending}
            pending={pending}
            onCommand={dispatch}
            onEvidence={navigate}
            error={error}
          />
        ) : (
          <p>Wróć do kolejki i wybierz dostępną decyzję.</p>
        )}
      </Drawer>
      <Drawer
        open={creating}
        onOpenChange={(open) => { if (!pending) { setCreating(open); if (!open) setError(null); } }}
        title="Nowa decyzja"
        description="Obserwacja, działanie i odpowiedzialność"
        dismissible
        side="right"
        width={680}
      >
        <DecisionCreate
          key={createId.current}
          today={today}
          initialDraft={initialDraft}
          pending={pending}
          error={error}
          onCreate={async (command) => {
            const id = createId.current;
            if (await dispatch(command, id)) {
              setCreating(false);
              clearFilters();
              changeView('queue');
              select(id);
            }
          }}
        />
      </Drawer>
    </div>
  );
}
function DecisionRow({
  decision: d,
  today,
  onOpen,
}: {
  decision: Decision;
  today: string;
  onOpen: () => void;
}) {
  return (
    <li className="pd-decisions__row">
      <div className="pd-decisions__row-main">
        <div className="pd-decisions__row-meta">
          <span className="pd-decisions__priority" data-priority={d.priority}>
            <i aria-hidden="true" />
            {decisionPriorities[d.priority]}
          </span>
          <span>{decisionDomains[d.domain]}</span>
          <span>{d.id}</span>
        </div>
        <h3>
          <button type="button" onClick={onOpen}>
            {d.title}
            <span aria-hidden="true"> ↗</span>
          </button>
        </h3>
        <p>{d.impact}</p>
      </div>
      <div className="pd-decisions__row-owner">
        <strong>{d.owner ?? 'Nieprzypisana osoba'}</strong>
        <span data-overdue={isOverdueDecision(d, today) || undefined}>
          {d.status === 'measuring'
            ? `Pomiar: ${decisionDate(d.measurement.endsOn)}`
            : `${isOverdueDecision(d, today) ? 'Po terminie · ' : ''}${decisionDate(d.due)}`}
        </span>
      </div>
      <span className="pd-decisions__status" data-status={d.status}>
        {decisionStatuses[d.status]}
      </span>
    </li>
  );
}
