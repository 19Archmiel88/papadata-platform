import { describe, expect, it } from 'vitest';
import {
  applyDecisionEvent,
  canMeasureDecision,
  decisionMeasurementDelta,
  filterDecisions,
  isOverdueDecision,
  restoreDecisionEvents,
  sortDecisions,
  validDecisionDate,
} from './DecisionsScreen.data';
import { decisionsDemoData } from './DecisionsScreen.demo';
import type { DecisionCommand, DecisionEvent } from './DecisionsScreen.model';
const base = () => structuredClone(decisionsDemoData);
const event = (
  command: DecisionCommand,
  id = 'DEC-101',
  at = '2026-09-07T10:00:00Z',
): DecisionEvent => ({ id: crypto.randomUUID(), decisionId: id, at, actor: 'Test', command });
const approve: DecisionCommand = {
  type: 'approve',
  optionId: 'supplier',
  owner: 'Anna Kowalska',
  due: '2026-09-08',
  note: 'Zweryfikujemy aktualny zapas i termin.',
};
describe('Decision workflow and evidence integrity', () => {
  it('approval records the exact plan without pretending execution or an outcome', () => {
    const e = event(approve),
      r = applyDecisionEvent(base(), e);
    expect(r.error).toBeNull();
    const d = r.store.decisions[0];
    expect(d.status).toBe('approved');
    expect(d.selectedOption).toBe('supplier');
    expect(d.measurement.startsOn).toBeNull();
    expect(d.measurement.result).toBeNull();
    expect(r.store.activity.at(-1)).toMatchObject({
      id: e.id,
      label: 'Zatwierdzono plan',
      note: approve.note,
    });
  });
  it('denies mutations to readers without modifying the store', () => {
    const s = base(),
      r = applyDecisionEvent(s, event(approve), false);
    expect(r.error).toContain('odczytu');
    expect(r.store).toBe(s);
  });
  it('rejects approval without a valid owner, option, reason, or date', () => {
    for (const patch of [
      { owner: '' },
      { optionId: 'unknown' },
      { note: 'ok' },
      { due: '2026-09-06' },
      { due: '2026-02-30' },
    ])
      expect(applyDecisionEvent(base(), event({ ...approve, ...patch })).error).not.toBeNull();
  });
  it('reopening a missing-cost decision does not bypass the evidence gate', () => {
    const r = applyDecisionEvent(
      base(),
      event({ type: 'reopen', note: 'Ponowna kontrola kosztu.' }, 'DEC-103'),
    );
    expect(r.error).toBeNull();
    const result = applyDecisionEvent(r.store, event({ ...approve, optionId: 'price' }, 'DEC-103'));
    expect(result.error).toContain('brakujące dane');
    expect(result.store.decisions.find((d) => d.id === 'DEC-103')?.status).toBe('review');
  });
  it('cannot execute before approval, before its approval date, or in the future', () => {
    expect(
      applyDecisionEvent(
        base(),
        event({ type: 'execute', date: '2026-09-07', note: 'Potwierdzono w magazynie.' }),
      ).error,
    ).toContain('zatwierdź');
    const approved = applyDecisionEvent(base(), event(approve)).store;
    for (const date of ['2026-09-06', '2026-09-08'])
      expect(
        applyDecisionEvent(
          approved,
          event({ type: 'execute', date, note: 'Potwierdzono w magazynie.' }),
        ).error,
      ).not.toBeNull();
  });
  it('execution opens an inclusive observation window and keeps result absent', () => {
    const r = applyDecisionEvent(
      base(),
      event(
        { type: 'execute', date: '2026-09-07', note: 'Zweryfikowano status zamówień.' },
        'DEC-104',
      ),
    );
    expect(r.error).toBeNull();
    const d = r.store.decisions.find((d) => d.id === 'DEC-104')!;
    expect(d.status).toBe('measuring');
    expect(d.measurement).toMatchObject({
      startsOn: '2026-09-07',
      endsOn: '2026-09-13',
      result: null,
    });
    expect(canMeasureDecision(d, '2026-09-13')).toBe(false);
    expect(canMeasureDecision(d, '2026-09-14')).toBe(true);
  });
  it('cannot record a result before a complete observation window', () => {
    expect(
      applyDecisionEvent(
        base(),
        event(
          { type: 'measure', value: 4, source: 'Raport', note: 'Cały okres.' },
          'DEC-105',
          '2026-09-14T23:00:00+02:00',
        ),
      ).error,
    ).toContain('zakończenie');
  });
  it('records zero as a real outcome and preserves source and baseline', () => {
    const r = applyDecisionEvent(
      base(),
      event(
        {
          type: 'measure',
          value: 0,
          source: 'Raport: 0 / 1000 sesji',
          note: 'Porównano te same definicje i pełne okresy.',
        },
        'DEC-105',
        '2026-09-15T10:00:00Z',
      ),
    );
    expect(r.error).toBeNull();
    const d = r.store.decisions.find((d) => d.id === 'DEC-105')!;
    expect(d.measurement.result).toBe(0);
    expect(d.status).toBe('completed');
    expect(decisionMeasurementDelta(d)?.favorable).toBe(false);
  });
  it('rejects NaN, negative, out-of-range percentages and missing sources', () => {
    for (const patch of [{ value: NaN }, { value: -1 }, { value: 101 }, { source: '' }])
      expect(
        applyDecisionEvent(
          base(),
          event(
            { type: 'measure', value: 4, source: 'Raport', note: 'Pełne okno pomiaru.', ...patch },
            'DEC-105',
            '2026-09-15T10:00:00Z',
          ),
        ).error,
      ).not.toBeNull();
  });
  it('keeps measured outcomes distinct from rejection', () => {
    expect(
      applyDecisionEvent(base(), event({ type: 'reject', note: 'Odrzucono wynik.' }, 'DEC-106'))
        .error,
    ).not.toBeNull();
  });
  it('is idempotent for a retried event and rejects repeated approval with a new id', () => {
    const e = event(approve),
      first = applyDecisionEvent(base(), e).store;
    expect(applyDecisionEvent(first, e).store).toBe(first);
    expect(applyDecisionEvent(first, event(approve)).error).not.toBeNull();
  });
  it('reject/reopen retains reasoning and always requires fresh approval', () => {
    const rejected = applyDecisionEvent(
      base(),
      event({ type: 'reject', note: 'Koszt działania nie jest uzasadniony.' }),
    ).store;
    const reopened = applyDecisionEvent(
      rejected,
      event({ type: 'reopen', note: 'Nowa wycena od dostawcy.' }),
    ).store;
    expect(reopened.decisions[0].status).toBe('review');
    expect(reopened.decisions[0].selectedOption).toBeNull();
    expect(reopened.activity.slice(-2).map((a) => a.label)).toEqual([
      'Odrzucono propozycję',
      'Przywrócono do oceny',
    ]);
  });
  it('creates a proposal with manual evidence and no invented baseline or gain', () => {
    const r = applyDecisionEvent(
      base(),
      event(
        {
          type: 'create',
          metric: 'SKU z kosztem',
          unit: 'szt.',
          direction: 'up',
          baseline: null,
          days: 7,
          title: 'Sprawdź koszt produktu',
          domain: 'products',
          observation: 'Brak kosztu dla produktu ABC.',
          source: 'ERP ABC',
          period: 'Sierpień 2026',
          action: 'Potwierdź koszt z księgowością.',
          owner: 'Anna Kowalska',
          due: '2026-09-08',
        },
        'DEC-custom',
      ),
    );
    expect(r.error).toBeNull();
    expect(r.store.decisions[0]).toMatchObject({
      status: 'review',
      selectedOption: null,
      measurement: { baseline: null, result: null },
    });
  });
  it('replays persisted events, keeps a corrupt journal untouched and rejects mismatched datasets', () => {
    const e = event(approve),
      raw = JSON.stringify({ version: 1, dataset: decisionsDemoData.id, events: [e] });
    expect(restoreDecisionEvents(base(), raw).store.decisions[0].status).toBe('approved');
    for (const broken of [
      '{',
      JSON.stringify({ version: 1, dataset: 'other', events: [e] }),
      JSON.stringify({ version: 1, dataset: decisionsDemoData.id, events: [null] }),
    ]) {
      const r = restoreDecisionEvents(base(), broken);
      expect(r.warning).toContain('Poprzedni zapis');
      expect(r.store.decisions[0].status).toBe('review');
    }
  });
  it('never divides by zero and distinguishes percentage points from relative changes', () => {
    const d = base().decisions.find((d) => d.id === 'DEC-106')!;
    expect(decisionMeasurementDelta(d)).toEqual({ absolute: 2, relative: 25, favorable: true });
    d.measurement.baseline = 0;
    expect(decisionMeasurementDelta(d)?.relative).toBeNull();
    d.measurement.baseline = null;
    expect(decisionMeasurementDelta(d)).toBeNull();
  });
  it('filters counts from the exact queue and ignores closed dates for overdue status', () => {
    const d = base().decisions;
    expect(filterDecisions(d, 'open')).toHaveLength(5);
    expect(filterDecisions(d, 'blocked')).toHaveLength(1);
    expect(filterDecisions(d, 'closed')).toHaveLength(1);
    expect(sortDecisions(d, 'due')[0].id).toBe('DEC-106');
    expect(isOverdueDecision(d[3], '2026-09-07')).toBe(true);
    expect(isOverdueDecision(d[5], '2026-09-07')).toBe(false);
  });
  it('validates calendar days including leap years', () => {
    expect(validDecisionDate('2024-02-29')).toBe(true);
    expect(validDecisionDate('2026-02-29')).toBe(false);
    expect(validDecisionDate('n/a')).toBe(false);
  });
});
it('uses Warsaw calendar days for approvals around UTC midnight', () => {
  const approved = applyDecisionEvent(
    base(),
    event(approve, 'DEC-101', '2026-09-07T23:30:00Z'),
  ).store;
  const attempted = applyDecisionEvent(
    approved,
    event(
      { type: 'execute', date: '2026-09-07', note: 'Potwierdzono wykonanie.' },
      'DEC-101',
      '2026-09-08T10:00:00Z',
    ),
  );
  expect(attempted.error).toContain('po zatwierdzeniu');
});
it('records a monetary loss honestly and avoids relative growth from a negative baseline', () => {
  const s = base();
  const d = s.decisions.find((d) => d.id === 'DEC-105')!;
  d.measurement.unit = 'PLN';
  d.measurement.baseline = -40;
  const r = applyDecisionEvent(
    s,
    event(
      {
        type: 'measure',
        value: -20,
        source: 'Raport marży',
        note: 'Zaobserwowano mniejszą stratę.',
      },
      'DEC-105',
      '2026-09-15T10:00:00Z',
    ),
  );
  expect(r.error).toBeNull();
  const measured = r.store.decisions.find((d) => d.id === 'DEC-105')!;
  expect(measured.measurement.result).toBe(-20);
  expect(decisionMeasurementDelta(measured)).toEqual({
    absolute: 20,
    relative: null,
    favorable: true,
  });
});
