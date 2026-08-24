import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  InlineNotice,
} from '../design-system';
import {
  bffClient,
} from '../shared/api/bffClient';
import {
  useShellDateRange,
} from '../shell/app-shell';
import {
  BusinessScreen,
} from './business/BusinessScreen';
import {
  commandCenterOnePageDataScreenIds,
  createCommandCenterBusinessData,
  findBusinessScreenDefinition,
  mergeCommandCenterOnePageApiData,
} from './business/businessData';
import type {
  BusinessScreenData,
  CommandCenterApiData,
} from './business/businessData';

type RuntimeState =
  | {
      readonly data: BusinessScreenData | null;
      readonly loading: boolean;
      readonly problem: string | null;
    };

export type CommandCenterScreenProps = {
  readonly path?: string;
};

export function CommandCenterScreen({
  path = '/app/command-center',
}: CommandCenterScreenProps) {
  const {
    dateRange,
    dateRangeKey,
  } = useShellDateRange();
  const definition = useMemo(
    () => (
      path === '/app' || path === '/app/command-center' || path === '/app/command-center/'
        ? findBusinessScreenDefinition('30.01')
        : findBusinessScreenDefinition(path)
    ),
    [path],
  );
  const [state, setState] = useState<RuntimeState>({
    data: null,
    loading: true,
    problem: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!definition || definition.group !== 'command-center') {
      setState({
        data: null,
        loading: false,
        problem: 'Nie znaleziono widoku Centrum Dowodzenia.',
      });
      return;
    }

    let active = true;

    // Keep the previous payload on screen while refetching, so a date-range
    // change animates from the old values to the new ones instead of dropping
    // every chart to a skeleton. Only the first load has nothing to show.
    setState((previous) => ({
      data: previous.data,
      loading: true,
      problem: null,
    }));

    const dataDefinitions = commandCenterOnePageDataScreenIds.map((screenId) => (
      findBusinessScreenDefinition(screenId)
    ));

    if (
      dataDefinitions.some((item) => !item || item.group !== 'command-center')
    ) {
      setState({
        data: null,
        loading: false,
        problem: 'Brakuje kontraktów danych wymaganych przez landing Centrum Dowodzenia.',
      });
      return () => {
        active = false;
      };
    }

    Promise.all(
      dataDefinitions.map((item) => (
        bffClient.readDomainScreen<CommandCenterApiData>(item!.apiPath, { dateRange })
      )),
    )
      .then(([
        kpiData,
        planData,
        driversData,
        trafficData,
        productsData,
        customersData,
        funnelData,
        recommendationsData,
        waterfallData,
      ]) => {
        if (!active) return;

        if (
          !isCommandCenterApiData(kpiData)
          || !isCommandCenterApiData(planData)
          || !isCommandCenterApiData(driversData)
          || !isCommandCenterApiData(trafficData)
          || !isCommandCenterApiData(productsData)
          || !isCommandCenterApiData(customersData)
          || !isCommandCenterApiData(funnelData)
          || !isCommandCenterApiData(recommendationsData)
          || !isCommandCenterApiData(waterfallData)
        ) {
          setState({
            data: null,
            loading: false,
            problem: 'Centrum Dowodzenia zwróciło dane w nieobsługiwanym formacie.',
          });
          return;
        }

        const data = mergeCommandCenterOnePageApiData(
          kpiData,
          planData,
          driversData,
          trafficData,
          productsData,
          customersData,
          funnelData,
          recommendationsData,
          waterfallData,
        );

        setState({
          data: createCommandCenterBusinessData(definition, data),
          loading: false,
          problem: null,
        });
      })
      .catch((cause) => {
        if (!active) return;

        setState({
          data: null,
          loading: false,
          problem: cause instanceof Error
            ? cause.message
            : 'Nie udało się pobrać danych Centrum Dowodzenia.',
        });
      });

    return () => {
      active = false;
    };
  }, [definition, refreshKey, dateRange, dateRangeKey]);

  if (!definition || definition.group !== 'command-center') {
    return (
      <InlineNotice
        message="Routing wskazuje ekran spoza zakresu P1 dla sekcji 30."
        title="Nieobsługiwany ekran"
        tone="critical"
      />
    );
  }

  return (
    <BusinessScreen
      data={state.data}
      definition={definition}
      loading={state.loading}
      problem={state.problem}
      onReload={() => {
        setRefreshKey((current) => current + 1);
      }}
    />
  );
}

function isCommandCenterApiData(value: unknown): value is CommandCenterApiData {
  if (!isRecord(value)) return false;
  return Array.isArray(value.records)
    && isRecord(value.pageInfo)
    && isRecord(value.summary)
    && typeof value.summary.updatedAt === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
