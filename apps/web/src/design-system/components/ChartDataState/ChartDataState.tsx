import type {
  HTMLAttributes,
} from 'react';

import type {
  AnalyticsAction,
  AnalyticsDataState,
} from '../Analytics';
import {
  analyticsStateIsLoading,
  analyticsStateRequiresAssertiveNotice,
  normalizeAnalyticsDataState,
} from '../Analytics';
import { TextAction } from '../Button';
import { joinClassNames } from '../Field/fieldUtils';
import { Skeleton } from '../Skeleton';
import './chart-data-state.css';

export type ChartDataStateLabels = {
  readonly blocked: string;
  readonly delayed: string;
  readonly empty: string;
  readonly error: string;
  readonly loading: string;
  readonly noData: string;
  readonly partial: string;
  readonly ready: string;
  readonly stale: string;
  readonly unavailable: string;
};

export type ChartDataStateProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'title'
> & {
  readonly action?: AnalyticsAction | null;
  readonly labels?: Partial<ChartDataStateLabels>;
  readonly message?: string | null;
  readonly state: AnalyticsDataState;
  readonly title?: string | null;
};

const defaultLabels: ChartDataStateLabels = {
  blocked: 'Dane zablokowane',
  delayed: 'Dane opóźnione',
  empty: 'Brak wyników',
  error: 'Błąd danych',
  loading: 'Ładowanie danych',
  noData: 'Brak danych',
  partial: 'Dane częściowe',
  ready: 'Dane aktualne',
  stale: 'Dane nieaktualne',
  unavailable: 'Dane niedostępne',
};

const defaultMessages: ChartDataStateLabels = {
  blocked:
    'Dostęp do danych jest zablokowany. Zachowujemy pytanie i kontekst wykresu, ale nie pokazujemy niepewnej wizualizacji.',
  delayed:
    'Źródło danych raportuje opóźnienie. Wykres może pozostać widoczny, ale decyzja powinna uwzględnić opóźniony sygnał.',
  empty:
    'Wybrany filtr nie zwraca wyników. To stan pusty, a nie awaria źródła.',
  error:
    'Nie udało się pobrać danych dla tej wizualizacji. Użytkownik potrzebuje jasnej naprawy lub ścieżki obejścia.',
  loading:
    'Pobieramy dane i utrzymujemy stabilny układ wykresu, żeby nie zmieniać kontekstu decyzji.',
  noData:
    'Źródło nie ma danych dla tej metryki albo zakresu. Nie tworzymy zastępczej wizualizacji.',
  partial:
    'Część danych jest dostępna, ale wynik wymaga oznaczenia zakresu braków.',
  ready:
    'Dane są aktualne i mogą zasilać wizualizację.',
  stale:
    'Dane są starsze niż oczekiwano. Wykres może być pokazany, ale status musi być widoczny.',
  unavailable:
    'Usługa lub źródło jest niedostępne. Wykres pozostaje w stanie informacyjnym.',
};

export function ChartDataState({
  action = null,
  className,
  labels,
  message = null,
  state,
  title = null,
  ...props
}: ChartDataStateProps) {
  const canonicalState = normalizeAnalyticsDataState(state);
  const resolvedLabels: ChartDataStateLabels = {
    ...defaultLabels,
    ...labels,
  };
  const stateTitle = title ?? resolvedLabels[canonicalState];
  const stateMessage = message ?? defaultMessages[canonicalState];
  const isLoading = analyticsStateIsLoading(state);
  const assertive = analyticsStateRequiresAssertiveNotice(state);

  if (isLoading) {
    return (
      <div
        {...props}
        aria-label={stateTitle}
        className={joinClassNames(
          'pd-chart-data-state',
          'pd-chart-data-state--loading',
          className,
        )}
        data-chart-data-state={canonicalState}
        role="status"
      >
        <div className="pd-chart-data-state__loading-toolbar">
          <Skeleton
            animated
            height="2rem"
            lines={1}
            shape="rect"
            width="10rem"
          />

          <Skeleton
            animated
            height="2rem"
            lines={1}
            shape="rect"
            width="7rem"
          />
        </div>

        <Skeleton
          animated
          height="12rem"
          lines={1}
          shape="rect"
          width="100%"
        />

        <div className="pd-chart-data-state__loading-summary">
          <Skeleton
            animated
            height="0.8rem"
            lines={1}
            shape="text"
            width="34%"
          />

          <Skeleton
            animated
            height="0.9rem"
            lines={2}
            shape="text"
            width="78%"
          />
        </div>

        <p className="pd-visually-hidden">{stateMessage}</p>
      </div>
    );
  }

  return (
    <div
      {...props}
      aria-live={assertive ? 'assertive' : 'polite'}
      className={joinClassNames(
        'pd-chart-data-state',
        className,
      )}
      data-chart-data-state={canonicalState}
      role={assertive ? 'alert' : 'status'}
    >
      <strong>{stateTitle}</strong>

      <p>{stateMessage}</p>

      {action ? (
        <TextAction
          onClick={action.onAction}
          size="small"
        >
          {action.label}
        </TextAction>
      ) : null}
    </div>
  );
}
