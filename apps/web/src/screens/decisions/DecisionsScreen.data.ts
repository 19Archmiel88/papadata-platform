import { shiftOverviewDate } from '../command-center/CommandCenterScreen.data';
import {
  decisionDomains,
  type Decision,
  type DecisionEvent,
  type DecisionFilter,
  type DecisionStore,
  type DecisionsData,
} from './DecisionsScreen.model';

export const decisionDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${value}T12:00:00Z`))
    : 'Bez terminu';
export const decisionNumber = (value: number | null) =>
  value === null ? '—' : new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2 }).format(value);
export function validDecisionDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export const decisionLocalDay = (at: string | Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(at));
export const decisionToday = () => decisionLocalDay(new Date());
export const isOpenDecision = (d: Decision) => d.status !== 'completed' && d.status !== 'rejected';
export const isOverdueDecision = (d: Decision, today: string) =>
  isOpenDecision(d) && d.status !== 'measuring' && d.due !== null && d.due < today;
export const canMeasureDecision = (d: Decision, today: string) =>
  d.status === 'measuring' && d.measurement.endsOn !== null && today > d.measurement.endsOn;
export function filterDecisions(
  rows: readonly Decision[],
  filter: DecisionFilter,
  today = decisionToday(),
) {
  return rows.filter(
    (d) =>
      filter === 'all' ||
      (filter === 'overdue'
        ? isOverdueDecision(d, today)
        : filter === 'open'
          ? isOpenDecision(d)
          : filter === 'closed'
            ? !isOpenDecision(d)
            : d.status === filter),
  );
}
export function sortDecisions(rows: readonly Decision[], sort: 'priority' | 'due' = 'priority') {
  const priority = { high: 0, medium: 1, low: 2 };
  return [...rows].sort(
    (a, b) =>
      (sort === 'priority' ? priority[a.priority] - priority[b.priority] : 0) ||
      (a.due ?? '9999').localeCompare(b.due ?? '9999') ||
      a.id.localeCompare(b.id),
  );
}
export function decisionMeasurementDelta(d: Decision) {
  const { baseline, result } = d.measurement;
  if (baseline === null || result === null) return null;
  const absolute = result - baseline;
  return {
    absolute,
    relative: baseline <= 0 ? null : (absolute / Math.abs(baseline)) * 100,
    favorable:
      absolute === 0 ? null : d.measurement.direction === 'up' ? absolute > 0 : absolute < 0,
  };
}
const clean = (v: unknown, min = 1, max = 3000): v is string =>
  typeof v === 'string' && v.trim().length >= min && v.length <= max;
export function applyDecisionEvent(
  store: DecisionStore,
  event: DecisionEvent,
  canManage = true,
): { store: DecisionStore; error: string | null } {
  const fail = (error: string) => ({ store, error });
  if (!canManage) return fail('Masz dostęp tylko do odczytu.');
  if (
    !event ||
    !clean(event.id, 1, 120) ||
    !clean(event.decisionId, 1, 120) ||
    !clean(event.actor, 1, 120) ||
    !clean(event.at) ||
    !Number.isFinite(Date.parse(event.at)) ||
    !event.command
  )
    return fail('Nieprawidłowy zapis decyzji.');
  if (store.activity.some((a) => a.id === event.id)) return { store, error: null };
  const today = decisionLocalDay(event.at);
  const cmd = event.command;
  const current = store.decisions.find((d) => d.id === event.decisionId);
  let next: Decision;
  let label: string;
  let note = '';
  if (cmd.type === 'create') {
    if (current) return fail('Decyzja o tym identyfikatorze już istnieje.');
    if (
      !clean(cmd.metric, 3, 100) ||
      !['PLN', '%', 'szt.', 'dni'].includes(cmd.unit) ||
      !['up', 'down'].includes(cmd.direction) ||
      !Number.isInteger(cmd.days) ||
      cmd.days < 1 ||
      cmd.days > 90 ||
      (cmd.baseline !== null &&
        (!Number.isFinite(cmd.baseline) ||
          (cmd.unit !== 'PLN' && cmd.baseline < 0) ||
          (cmd.unit === '%' && cmd.baseline > 100)))
    )
      return fail('Uzupełnij metrykę, jednostkę i okno pomiaru od 1 do 90 dni.');
    if (
      !Object.hasOwn(decisionDomains, cmd.domain) ||
      !clean(cmd.title, 5, 160) ||
      !clean(cmd.observation, 10) ||
      !clean(cmd.source, 3, 300) ||
      !clean(cmd.period, 3, 100) ||
      !clean(cmd.action, 10) ||
      !clean(cmd.owner, 2, 80) ||
      !validDecisionDate(cmd.due) ||
      cmd.due < today
    )
      return fail(
        'Uzupełnij tytuł, obserwację, źródło, okres, działanie, osobę i przyszły termin.',
      );
    next = {
      id: event.decisionId,
      title: cmd.title.trim(),
      domain: cmd.domain,
      priority: 'medium',
      status: 'review',
      observation: cmd.observation.trim(),
      impact: 'Efekt do oszacowania po analizie',
      evidence: [
        { label: 'Obserwacja autora', value: cmd.observation.trim(), source: cmd.source.trim() },
      ],
      evidencePeriod: cmd.period.trim(),
      evidencePath: null,
      evidenceReady: true,
      limitation: 'Obserwacja wpisana ręcznie. Przed akceptacją sprawdź ją w podanym źródle.',
      options: [
        {
          id: 'proposed',
          title: cmd.action.trim(),
          description: 'Wariant zaproponowany przez autora decyzji.',
          tradeoff: 'Koszt i ryzyka do sprawdzenia przez osobę zatwierdzającą.',
          steps: [
            'Zweryfikuj obserwację w źródle',
            'Wykonaj opisane działanie i zachowaj potwierdzenie',
          ],
        },
      ],
      selectedOption: null,
      owner: cmd.owner.trim(),
      due: cmd.due,
      rationale: '',
      measurement: {
        metric: cmd.metric.trim(),
        unit: cmd.unit,
        direction: cmd.direction,
        baseline: cmd.baseline,
        baselineLabel:
          cmd.baseline === null
            ? 'Nie podano wartości bazowej; wynik będzie zapisem obserwacji.'
            : `Wartość wpisana przez autora · ${cmd.period.trim()} · ${cmd.source.trim()}`,
        days: cmd.days,
        startsOn: null,
        endsOn: null,
        result: null,
        source: null,
      },
      createdAt: event.at,
    };
    label = 'Dodano propozycję';
    note = cmd.observation.trim();
  } else {
    if (!current) return fail('Nie znaleziono decyzji.');
    if (!clean(cmd.note, cmd.type === 'comment' ? 1 : 5))
      return fail('Dodaj uzasadnienie lub potwierdzenie (co najmniej 5 znaków).');
    next = { ...current, measurement: { ...current.measurement } };
    note = cmd.note.trim();
    switch (cmd.type) {
      case 'approve':
        if (current.status !== 'review')
          return fail('Można zatwierdzić tylko decyzję oczekującą na ocenę.');
        if (!current.evidenceReady) return fail('Najpierw uzupełnij brakujące dane źródłowe.');
        if (
          !current.options.some((o) => o.id === cmd.optionId) ||
          !clean(cmd.owner, 2, 80) ||
          !validDecisionDate(cmd.due) ||
          cmd.due < today
        )
          return fail('Wybierz wariant, osobę odpowiedzialną i termin nie wcześniejszy niż dziś.');
        next = {
          ...next,
          status: 'approved',
          selectedOption: cmd.optionId,
          owner: cmd.owner.trim(),
          due: cmd.due,
          rationale: note,
        };
        label = 'Zatwierdzono plan';
        break;
      case 'block':
        if (current.status !== 'review' && current.status !== 'approved')
          return fail('Ta decyzja nie oczekuje na wyjaśnienie.');
        next.status = 'blocked';
        label = 'Zapisano potrzebę wyjaśnienia';
        break;
      case 'reject':
        if (!['review', 'blocked', 'approved'].includes(current.status))
          return fail('Nie można odrzucić wykonanego działania.');
        next.status = 'rejected';
        label = 'Odrzucono propozycję';
        break;
      case 'reopen':
        if (!['blocked', 'rejected'].includes(current.status))
          return fail('Ta decyzja nie wymaga ponownego otwarcia.');
        next.status = 'review';
        next.selectedOption = null;
        label = 'Przywrócono do oceny';
        break;
      case 'execute':
        if (current.status !== 'approved') return fail('Najpierw zatwierdź plan działania.');
        if (
          !validDecisionDate(cmd.date) ||
          cmd.date > today ||
          cmd.date <
            decisionLocalDay(
              store.activity
                .filter((a) => a.decisionId === current.id && a.label === 'Zatwierdzono plan')
                .at(-1)?.at ?? current.createdAt,
            )
        )
          return fail('Data wykonania musi przypadać po zatwierdzeniu i nie później niż dziś.');
        next.status = 'measuring';
        next.measurement.startsOn = cmd.date;
        next.measurement.endsOn = shiftOverviewDate(cmd.date, current.measurement.days - 1);
        label = 'Odnotowano wykonanie';
        break;
      case 'measure':
        if (!canMeasureDecision(current, today))
          return fail('Poczekaj na zakończenie okna pomiaru.');
        if (
          !Number.isFinite(cmd.value) ||
          (current.measurement.unit !== 'PLN' && cmd.value < 0) ||
          (current.measurement.unit === '%' && cmd.value > 100) ||
          !clean(cmd.source, 3, 300)
        )
          return fail(
            'Podaj poprawny wynik i jego źródło. Procent musi mieścić się w zakresie 0–100; tylko wynik kwotowy może być ujemny.',
          );
        next.status = 'completed';
        next.measurement.result = cmd.value;
        next.measurement.source = cmd.source.trim();
        label = 'Zapisano wynik obserwacji';
        break;
      case 'comment':
        label = 'Dodano notatkę';
        break;
      default:
        return fail('Nieznana operacja.');
    }
  }
  return {
    store: {
      decisions: current
        ? store.decisions.map((d) => (d.id === next.id ? next : d))
        : [next, ...store.decisions],
      activity: [
        ...store.activity,
        { id: event.id, decisionId: next.id, at: event.at, actor: event.actor.trim(), label, note },
      ],
    },
    error: null,
  };
}
export function restoreDecisionEvents(data: DecisionsData, raw: string | null) {
  let store: DecisionStore = { decisions: data.decisions, activity: data.activity };
  const events: DecisionEvent[] = [];
  if (!raw) return { store, events, warning: null };
  try {
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || parsed.dataset !== data.id || !Array.isArray(parsed.events))
      throw new Error('format');
    for (const item of parsed.events) {
      const result = applyDecisionEvent(store, item);
      if (result.error) throw new Error('event');
      store = result.store;
      events.push(item);
    }
    return { store, events, warning: null };
  } catch {
    return {
      store: { decisions: data.decisions, activity: data.activity },
      events: [],
      warning:
        'Nie udało się odczytać zapisu lokalnego. Wyświetlono dane początkowe. Poprzedni zapis pozostaje w przeglądarce.',
    };
  }
}
