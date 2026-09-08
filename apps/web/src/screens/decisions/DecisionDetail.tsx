import { useState } from 'react';
import { Button } from '../../design-system';
import {
  canMeasureDecision,
  decisionDate,
  decisionMeasurementDelta,
  decisionNumber,
} from './DecisionsScreen.data';
import {
  decisionDomains,
  decisionPriorities,
  decisionStatuses,
  type Decision,
  type DecisionActivity,
  type DecisionCommand,
} from './DecisionsScreen.model';

export function DecisionTimeline({ activity }: { activity: readonly DecisionActivity[] }) {
  return activity.length ? (
    <ol className="pd-decisions__timeline">
      {[...activity]
        .sort((a, b) => b.at.localeCompare(a.at))
        .map((entry) => (
          <li key={entry.id}>
            <span className="pd-decisions__timeline-dot" aria-hidden="true" />
            <div>
              <strong>{entry.label}</strong>
              <p>{entry.note}</p>
              <small>
                {entry.actor} ·{' '}
                <time dateTime={entry.at}>
                  {new Intl.DateTimeFormat('pl-PL', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Warsaw',
                  }).format(new Date(entry.at))}
                </time>
              </small>
            </div>
          </li>
        ))}
    </ol>
  ) : (
    <p>Brak dodatkowych wpisów w historii tej decyzji.</p>
  );
}
export function DecisionMeasurementSummary({ decision }: { decision: Decision }) {
  const m = decision.measurement,
    delta = decisionMeasurementDelta(decision);
  return (
    <>
      <h3>{m.metric}</h3>
      <div className="pd-decisions__measurement-values">
        <div>
          <span>Wartość bazowa</span>
          <strong>
            {decisionNumber(m.baseline)}
            {m.baseline !== null && ` ${m.unit}`}
          </strong>
          <p>{m.baselineLabel}</p>
        </div>
        <div>
          <span>Wynik obserwacji</span>
          <strong>
            {decisionNumber(m.result)}
            {m.result !== null && ` ${m.unit}`}
          </strong>
          <p>
            {m.result === null
              ? m.endsOn
                ? `Pomiar po zakończeniu ${decisionDate(m.endsOn)}`
                : 'Okno zacznie się po odnotowaniu wykonania.'
              : m.source}
          </p>
        </div>
      </div>
      {delta ? (
        <div
          className="pd-decisions__delta"
          data-tone={
            delta.favorable === null ? 'neutral' : delta.favorable ? 'positive' : 'negative'
          }
        >
          <strong>
            {delta.absolute > 0 ? '+' : ''}
            {decisionNumber(delta.absolute)} {m.unit === '%' ? 'p.p.' : m.unit}
          </strong>
          <span>
            Zmiana zaobserwowana
            {delta.relative === null
              ? ' · brak podstaw do zmiany procentowej'
              : ` · ${delta.relative > 0 ? '+' : ''}${decisionNumber(delta.relative)}% względem bazy`}
          </span>
        </div>
      ) : null}
      <p className="pd-decisions__caveat">
        Porównanie przed/po. Bez grupy kontrolnej nie przypisujemy zmiany temu działaniu.
      </p>
    </>
  );
}

export function DecisionDetail({
  decision: d,
  activity,
  today,
  canManage,
  onCommand,
  onEvidence,
  error,
}: {
  decision: Decision;
  activity: readonly DecisionActivity[];
  today: string;
  canManage: boolean;
  onCommand: (command: DecisionCommand) => boolean;
  onEvidence: (path: string) => void;
  error: string | null;
}) {
  const [tab, setTab] = useState<'evidence' | 'plan' | 'measurement' | 'history'>(
    d.status === 'approved'
      ? 'plan'
      : ['measuring', 'completed'].includes(d.status)
        ? 'measurement'
        : 'evidence',
  );
  const [optionId, setOptionId] = useState(d.selectedOption ?? d.options[0]?.id ?? '');
  const [owner, setOwner] = useState(d.owner ?? '');
  const [due, setDue] = useState(d.due && d.due >= today ? d.due : today);
  const [note, setNote] = useState('');
  const [secondaryAction, setSecondaryAction] = useState<'reject' | 'block' | 'reopen' | null>(
    null,
  );
  const [executionDate, setExecutionDate] = useState(today);
  const [checked, setChecked] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [source, setSource] = useState('');
  const option = d.options.find(
    (o) =>
      o.id ===
      (d.status === 'approved' || d.status === 'measuring' || d.status === 'completed'
        ? d.selectedOption
        : optionId),
  );
  const steps = ['Ocena', 'Plan', 'Wykonanie', 'Pomiar'];
  const stage =
    d.status === 'completed' ? 4 : d.status === 'measuring' ? 3 : d.status === 'approved' ? 2 : 0;
  const submit = (command: DecisionCommand) => {
    if (onCommand(command)) {
      setNote('');
      setSecondaryAction(null);
    }
  };
  return (
    <div className="pd-decisions pd-decisions--detail">
      <div className="pd-decisions__detail-meta">
        <span>
          {decisionDomains[d.domain]} · priorytet {decisionPriorities[d.priority].toLowerCase()}
        </span>
        <span className="pd-decisions__status" data-status={d.status}>
          {decisionStatuses[d.status]}
        </span>
      </div>
      <p className="pd-decisions__detail-observation">{d.observation}</p>
      <ol className="pd-decisions__stages" aria-label="Etapy decyzji">
        {steps.map((step, i) => (
          <li
            key={step}
            data-state={i < stage ? 'done' : i === stage ? 'current' : 'waiting'}
            aria-current={i === stage ? 'step' : undefined}
          >
            <span aria-hidden="true">{i < stage ? '✓' : i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <nav className="pd-decisions__tabs" aria-label="Szczegóły decyzji">
        {(
          [
            ['evidence', 'Dowody'],
            ['plan', 'Plan działania'],
            ['measurement', 'Pomiar'],
            ['history', 'Historia'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => {
              setTab(id);
              setNote('');
              setSecondaryAction(null);
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <p role="alert" className="pd-decisions__notice">
          {error}
        </p>
      )}
      {!canManage && (
        <p className="pd-decisions__notice">
          Masz dostęp do odczytu. Zatwierdzanie i zmiany wymagają uprawnienia do zarządzania
          decyzjami.
        </p>
      )}
      {tab === 'evidence' && (
        <section className="pd-decisions__detail-section">
          <span className="pd-decisions__eyebrow">Podstawa rekomendacji</span>
          <h3>Co wiemy z danych</h3>
          <p>{d.evidencePeriod}</p>
          <dl className="pd-decisions__evidence">
            {d.evidence.map((e, i) => (
              <div key={`${e.label}-${i}`}>
                <dt>
                  {e.label}
                  <small>{e.source}</small>
                </dt>
                <dd>{e.value}</dd>
              </div>
            ))}
          </dl>
          <div className="pd-decisions__notice">
            <strong>
              {d.evidenceReady
                ? 'Co trzeba sprawdzić przed działaniem'
                : 'Brak danych potrzebnych do akceptacji'}
            </strong>
            <p>{d.limitation}</p>
          </div>
          <div className="pd-decisions__actions">
            {d.evidencePath && (
              <Button variant="secondary" onClick={() => onEvidence(d.evidencePath!)}>
                Otwórz analizę źródłową ↗
              </Button>
            )}
            <Button variant="primary" onClick={() => setTab('plan')}>
              Przejdź do planu
            </Button>
          </div>
        </section>
      )}
      {tab === 'plan' && (
        <section className="pd-decisions__detail-section">
          <h3>
            {['approved', 'measuring', 'completed'].includes(d.status)
              ? 'Zatwierdzony plan'
              : 'Wybierz działanie i odpowiedzialność'}
          </h3>
          {d.status === 'review' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit({ type: 'approve', optionId, owner, due, note });
              }}
            >
              <fieldset disabled={!canManage}>
                <legend>Wariant działania</legend>
                <div className="pd-decisions__options">
                  {d.options.map((o) => (
                    <label className="pd-decisions__option" key={o.id}>
                      <input
                        type="radio"
                        name="decision-option"
                        checked={optionId === o.id}
                        onChange={() => setOptionId(o.id)}
                        value={o.id}
                      />
                      <span>
                        <strong>{o.title}</strong>
                        <span>{o.description}</span>
                        <small>{o.tradeoff}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="pd-decisions__form-grid">
                <label>
                  Osoba odpowiedzialna
                  <input
                    required
                    minLength={2}
                    maxLength={80}
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    disabled={!canManage}
                    placeholder="Imię i nazwisko"
                  />
                </label>
                <label>
                  Termin działania
                  <input
                    type="date"
                    required
                    min={today}
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    disabled={!canManage}
                  />
                </label>
              </div>
              <label>
                Uzasadnienie decyzji
                <textarea
                  required
                  minLength={5}
                  maxLength={3000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!canManage}
                  placeholder="Dlaczego wybierasz ten wariant? Jakie warunki trzeba spełnić?"
                />
              </label>
              {!d.evidenceReady && (
                <p className="pd-decisions__notice">
                  Brak kosztu źródłowego blokuje akceptację. Uzupełnij dane i ponownie zweryfikuj
                  rekomendację.
                </p>
              )}
              <p className="pd-decisions__caveat">
                Zatwierdzenie zapisuje plan w tym podglądzie. Działanie w sklepie lub systemie
                reklamowym wymaga osobnego wykonania.
              </p>
              <div className="pd-decisions__actions">
                <Button type="submit" disabled={!canManage || !d.evidenceReady}>
                  Zatwierdź plan
                </Button>
              </div>
            </form>
          )}
          {['approved', 'measuring', 'completed'].includes(d.status) && (
            <>
              <div className="pd-decisions__selected-plan">
                <strong>{option?.title}</strong>
                <p>
                  {d.owner ?? 'Nieprzypisana osoba'} · termin {decisionDate(d.due)}
                </p>
                <p>{d.rationale}</p>
              </div>
              {d.status === 'approved' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit({ type: 'execute', date: executionDate, note });
                  }}
                >
                  <fieldset disabled={!canManage}>
                    <legend>Potwierdź wykonane kroki</legend>
                    {option?.steps.map((step, i) => (
                      <label className="pd-decisions__check" key={step}>
                        <input
                          type="checkbox"
                          required
                          checked={checked.includes(String(i))}
                          onChange={(e) =>
                            setChecked((current) =>
                              e.target.checked
                                ? [...current, String(i)]
                                : current.filter((id) => id !== String(i)),
                            )
                          }
                        />
                        {step}
                      </label>
                    ))}
                  </fieldset>
                  <label>
                    Data wykonania
                    <input
                      type="date"
                      required
                      max={today}
                      value={executionDate}
                      onChange={(e) => setExecutionDate(e.target.value)}
                      disabled={!canManage}
                    />
                  </label>
                  <label>
                    Potwierdzenie wykonania
                    <textarea
                      required
                      minLength={5}
                      maxLength={3000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      disabled={!canManage}
                      placeholder="Opisz wykonanie i wskaż dokument lub potwierdzenie."
                    />
                  </label>
                  <p className="pd-decisions__caveat">
                    To ręczny zapis wykonania. Rozpocznie {d.measurement.days}-dniowe okno
                    obserwacji; wynik pozostanie pusty do pomiaru.
                  </p>
                  <Button
                    type="submit"
                    disabled={!canManage || !option || checked.length !== option.steps.length}
                  >
                    Odnotuj wykonanie
                  </Button>
                </form>
              ) : (
                <ol className="pd-decisions__plain-list">
                  {option?.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </>
          )}
          {['blocked', 'rejected'].includes(d.status) && (
            <div className="pd-decisions__notice">
              <strong>{decisionStatuses[d.status]}</strong>
              <p>{d.limitation}</p>
              <p>
                Przywrócenie otworzy ponowną ocenę. Nie zatwierdzi planu ani nie zmieni danych
                źródłowych.
              </p>
            </div>
          )}
          {canManage && ['review', 'approved', 'blocked', 'rejected'].includes(d.status) && (
            <div className="pd-decisions__secondary-actions">
              {['review', 'approved'].includes(d.status) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSecondaryAction('block');
                    setNote('');
                  }}
                >
                  Wymaga wyjaśnienia
                </Button>
              )}
              {d.status !== 'rejected' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSecondaryAction('reject');
                    setNote('');
                  }}
                >
                  Odrzuć propozycję
                </Button>
              )}
              {['blocked', 'rejected'].includes(d.status) && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSecondaryAction('reopen');
                    setNote('');
                  }}
                >
                  Przywróć do oceny
                </Button>
              )}
            </div>
          )}
          {secondaryAction && (
            <form
              className="pd-decisions__notice"
              onSubmit={(e) => {
                e.preventDefault();
                submit({ type: secondaryAction, note });
              }}
            >
              <label>
                {secondaryAction === 'reject'
                  ? 'Powód odrzucenia'
                  : secondaryAction === 'block'
                    ? 'Co wymaga wyjaśnienia?'
                    : 'Powód ponownej oceny'}
                <textarea
                  autoFocus
                  required
                  minLength={5}
                  maxLength={3000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <div className="pd-decisions__actions">
                <Button type="submit" variant={secondaryAction === 'reject' ? 'danger' : 'primary'}>
                  Zapisz uzasadnienie
                </Button>
                <Button variant="ghost" onClick={() => setSecondaryAction(null)}>
                  Anuluj
                </Button>
              </div>
              {secondaryAction === 'block' && (
                <p>Wyjaśnienie trafi do historii decyzji w tym podglądzie.</p>
              )}
            </form>
          )}
        </section>
      )}
      {tab === 'measurement' && (
        <section className="pd-decisions__detail-section">
          <DecisionMeasurementSummary decision={d} />
          {d.measurement.startsOn && (
            <p>
              Okno obserwacji: {decisionDate(d.measurement.startsOn)} –{' '}
              {decisionDate(d.measurement.endsOn)} · {d.measurement.days} dni
            </p>
          )}
          {d.status === 'measuring' &&
            (canMeasureDecision(d, today) ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit({ type: 'measure', value: Number(result), source, note });
                }}
              >
                <h3>Zapisz wynik z pełnego okresu</h3>
                <label>
                  Wynik ({d.measurement.unit})
                  <input
                    type="number"
                    min={d.measurement.unit === 'PLN' ? undefined : 0}
                    max={d.measurement.unit === '%' ? 100 : undefined}
                    step="any"
                    required
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    disabled={!canManage}
                  />
                </label>
                <label>
                  Źródło wyniku
                  <input
                    required
                    minLength={3}
                    maxLength={300}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    disabled={!canManage}
                    placeholder="Raport, okres, identyfikator analizy"
                  />
                </label>
                <label>
                  Komentarz do pomiaru
                  <textarea
                    required
                    minLength={5}
                    maxLength={3000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={!canManage}
                    placeholder="Czy okresy i sposób obliczenia są porównywalne?"
                  />
                </label>
                <Button type="submit" disabled={!canManage}>
                  Zapisz wynik obserwacji
                </Button>
              </form>
            ) : (
              <p className="pd-decisions__notice">
                Okno pomiaru jeszcze trwa. Wynik można zapisać po jego zakończeniu.
              </p>
            ))}
        </section>
      )}
      {tab === 'history' && (
        <section className="pd-decisions__detail-section">
          <h3>Historia i uzasadnienia</h3>
          <DecisionTimeline activity={activity} />
          {canManage && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit({ type: 'comment', note });
              }}
            >
              <label>
                Notatka do decyzji
                <textarea
                  required
                  maxLength={3000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <Button type="submit" variant="secondary">
                Dodaj notatkę
              </Button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
