import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';

/**
 * The three business perspectives on the revenue/cost floor of the one-page.
 * Picking one rebuilds the chart, the driver analysis and the AI
 * recommendations shown underneath.
 */
export type CommandLens =
  | 'cost'
  | 'volume'
  | 'efficiency';

export type CommandLensDefinition = {
  /** Metrics this lens is about — also used to filter AI recommendations. */
  readonly metricIds: readonly string[];
  readonly label: string;
  readonly question: string;
  readonly value: CommandLens;
};

export const commandLensDefinitions: readonly CommandLensDefinition[] = [
  {
    label: 'Przychód vs koszty',
    metricIds: [
      'command-kpi-revenue',
      'command-kpi-ad-cost',
      'command-kpi-gross-margin',
    ],
    question: 'Czy sprzedaż rośnie szybciej niż koszt pozyskania.',
    value: 'cost',
  },
  {
    label: 'Zamówienia vs AOV',
    metricIds: [
      'command-kpi-orders',
      'command-kpi-aov',
      'command-kpi-conversion',
    ],
    question: 'Ile wzrostu przychodu pochodzi z liczby zamówień, a ile z wartości koszyka.',
    value: 'volume',
  },
  {
    label: 'Koszt vs przychód z reklam',
    metricIds: [
      'command-kpi-ad-cost',
      'command-kpi-roas',
      'command-kpi-cpa',
    ],
    question: 'Czy dodatkowy wydatek na reklamę realnie przekłada się na przychód z reklam.',
    value: 'efficiency',
  },
];

export const defaultCommandLens: CommandLens = 'cost';

function isCommandLens(value: string | null): value is CommandLens {
  return commandLensDefinitions.some((lens) => lens.value === value);
}

export function findCommandLens(value: CommandLens): CommandLensDefinition {
  return commandLensDefinitions.find((lens) => lens.value === value)
    ?? commandLensDefinitions[0] as CommandLensDefinition;
}

/**
 * A lens without any backing metric would render an empty chart, so it is
 * offered as disabled rather than silently removed from the control.
 */
export function isCommandLensAvailable(
  lens: CommandLensDefinition,
  records: readonly CommandCenterRecord[],
): boolean {
  return lens.metricIds.some((metricId) => (
    records.some((record) => record.metricId === metricId)
  ));
}

function readLensFromLocation(): CommandLens {
  if (typeof window === 'undefined') {
    return defaultCommandLens;
  }

  const value = new URLSearchParams(window.location.search).get('lens');

  return isCommandLens(value) ? value : defaultCommandLens;
}

/**
 * The active lens is part of the addressable view state — the section 30 spec
 * requires filters to survive a refresh and to be shareable as a link.
 */
export function useCommandLens(): readonly [
  CommandLens,
  (next: CommandLens) => void,
] {
  const [lens, setLens] = useState<CommandLens>(readLensFromLocation);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncFromLocation = () => {
      setLens(readLensFromLocation());
    };

    window.addEventListener('popstate', syncFromLocation);

    return () => {
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, []);

  const selectLens = useCallback((next: CommandLens) => {
    setLens(next);

    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);

    url.searchParams.set('lens', next);
    window.history.replaceState(window.history.state, '', url);
  }, []);

  return [lens, selectLens] as const;
}
