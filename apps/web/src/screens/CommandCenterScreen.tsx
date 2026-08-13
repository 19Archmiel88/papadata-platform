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
  BusinessScreen,
} from './business/BusinessScreen';
import {
  createCommandCenterBusinessData,
  findBusinessScreenDefinition,
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
  path = '/app/command-center/widok-glowny',
}: CommandCenterScreenProps) {
  const definition = useMemo(
    () => (
      findBusinessScreenDefinition(
        path === '/app/command-center'
          ? '/app/command-center/widok-glowny'
          : path,
      )
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
        problem: 'Nie znaleziono kontraktu ekranu Centrum Dowodzenia.',
      });
      return;
    }

    let active = true;

    setState({
      data: null,
      loading: true,
      problem: null,
    });

    bffClient
      .readDomainScreen<CommandCenterApiData>(definition.apiPath)
      .then((data) => {
        if (!active) return;

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
  }, [definition, refreshKey]);

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
