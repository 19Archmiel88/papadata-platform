import { useState } from 'react';
import { Button } from '../../design-system';
import {
  decisionDomains,
  type DecisionCommand,
  type DecisionDomain,
  type DecisionMeasurement,
} from './DecisionsScreen.model';

export function DecisionCreate({
  today,
  onCreate,
  error,
}: {
  today: string;
  onCreate: (command: Extract<DecisionCommand, { type: 'create' }>) => void;
  error: string | null;
}) {
  const [metric, setMetric] = useState('');
  const [unit, setUnit] = useState<DecisionMeasurement['unit']>('szt.');
  const [direction, setDirection] = useState<DecisionMeasurement['direction']>('up');
  const [baseline, setBaseline] = useState('');
  const [days, setDays] = useState(7);
  const [draft, setDraft] = useState({
    title: '',
    domain: 'products' as DecisionDomain,
    observation: '',
    source: '',
    period: '',
    action: '',
    owner: '',
    due: today,
  });
  const update = (key: keyof typeof draft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  return (
    <form
      className="pd-decisions pd-decisions--detail pd-decisions__create"
      onSubmit={(e) => {
        e.preventDefault();
        onCreate({
          type: 'create',
          ...draft,
          metric,
          unit,
          direction,
          baseline: baseline === '' ? null : Number(baseline),
          days,
        });
      }}
    >
      <p>Połącz obserwację z proponowanym działaniem. Propozycja trafi do kolejki „Do decyzji”.</p>
      {error && (
        <p role="alert" className="pd-decisions__notice">
          {error}
        </p>
      )}
      <label>
        Tytuł decyzji
        <input
          autoFocus
          required
          minLength={5}
          maxLength={160}
          value={draft.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Jaką decyzję trzeba podjąć?"
        />
      </label>
      <label>
        Obszar
        <select value={draft.domain} onChange={(e) => update('domain', e.target.value)}>
          {Object.entries(decisionDomains).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Obserwacja z danych
        <textarea
          required
          minLength={10}
          maxLength={3000}
          value={draft.observation}
          onChange={(e) => update('observation', e.target.value)}
          placeholder="Co się wydarzyło? Podaj wartości i obiekt analizy."
        />
      </label>
      <div className="pd-decisions__form-grid">
        <label>
          Źródło obserwacji
          <input
            required
            minLength={3}
            maxLength={300}
            value={draft.source}
            onChange={(e) => update('source', e.target.value)}
            placeholder="Nazwa raportu lub identyfikator"
          />
        </label>
        <label>
          Okres lub data danych
          <input
            required
            minLength={3}
            maxLength={100}
            value={draft.period}
            onChange={(e) => update('period', e.target.value)}
            placeholder="np. 1–31 sierpnia 2026"
          />
        </label>
      </div>
      <label>
        Proponowane działanie
        <textarea
          required
          minLength={10}
          maxLength={3000}
          value={draft.action}
          onChange={(e) => update('action', e.target.value)}
          placeholder="Co należy zrobić i jaki będzie zakres działania?"
        />
      </label>
      <div className="pd-decisions__form-grid">
        <label>
          Osoba odpowiedzialna
          <input
            required
            minLength={2}
            maxLength={80}
            value={draft.owner}
            onChange={(e) => update('owner', e.target.value)}
          />
        </label>
        <label>
          Termin działania
          <input
            required
            type="date"
            min={today}
            value={draft.due}
            onChange={(e) => update('due', e.target.value)}
          />
        </label>
      </div>
      <fieldset>
        <legend>Jak sprawdzisz wynik?</legend>
        <label>
          Metryka wyniku
          <input
            required
            minLength={3}
            maxLength={100}
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="np. Liczba SKU z uzupełnionym kosztem"
          />
        </label>
        <div className="pd-decisions__form-grid">
          <label>
            Jednostka
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as DecisionMeasurement['unit'])}
            >
              {['szt.', '%', 'PLN', 'dni'].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
          <label>
            Pożądany kierunek
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as DecisionMeasurement['direction'])}
            >
              <option value="up">Wzrost</option>
              <option value="down">Spadek</option>
            </select>
          </label>
        </div>
        <div className="pd-decisions__form-grid">
          <label>
            Wartość bazowa (opcjonalna)
            <input
              type="number"
              min={unit === 'PLN' ? undefined : 0}
              max={unit === '%' ? 100 : undefined}
              step="any"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              placeholder="Brak danych"
            />
          </label>
          <label>
            Okno pomiaru (dni)
            <input
              type="number"
              min="1"
              max="90"
              required
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </label>
        </div>
      </fieldset>
      <p className="pd-decisions__caveat">
        Zapis lokalny w podglądzie. Obserwacja jest wpisana ręcznie; propozycja wymaga osobnej
        oceny.
      </p>
      <Button type="submit">Dodaj do kolejki</Button>
    </form>
  );
}
