import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  InlineNotice,
} from '../../design-system';
import {
  bffClient,
} from '../../shared/api/bffClient';
import {
  AnalyticsModuleWorkspace,
} from './AnalyticsModuleWorkspace';
import {
  analyticsModuleRootRoutes,
  createCampaignsRuntimeData,
  createCustomersRuntimeData,
  createOrdersRuntimeData,
  createProductsRuntimeData,
  createTrafficRuntimeData,
  findAnalyticsScreenDefinition,
} from './analyticsModuleData';
import type {
  AnalyticsModuleData,
  AnalyticsModuleGroup,
  AnalyticsScreenDefinition,
  CampaignsApiData,
  CustomersApiData,
  OrdersApiData,
  ProductsApiData,
  TrafficApiData,
} from './analyticsModuleData';

type RuntimeState = {
  readonly data: AnalyticsModuleData | null;
  readonly loading: boolean;
  readonly problem: string | null;
};

export type AnalyticsModuleScreenProps = {
  readonly group: AnalyticsModuleGroup;
  readonly path: string;
};

export function AnalyticsModuleScreen({
  group,
  path,
}: AnalyticsModuleScreenProps) {
  const definition = useMemo(
    () => resolveDefinition(group, path),
    [group, path],
  );
  const [state, setState] = useState<RuntimeState>({
    data: null,
    loading: true,
    problem: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!definition || definition.group !== group) {
      setState({
        data: null,
        loading: false,
        problem: 'Nie znaleziono kontraktu bieżącego ekranu.',
      });
      return;
    }

    let active = true;

    setState({
      data: null,
      loading: true,
      problem: null,
    });

    loadDefinition(definition)
      .then((data) => {
        if (!active) return;

        setState({
          data,
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
            : 'Nie udało się pobrać danych bieżącego modułu.',
        });
      });

    return () => {
      active = false;
    };
  }, [definition, group, refreshKey]);

  if (!definition || definition.group !== group) {
    return (
      <InlineNotice
        message="Trasa nie odpowiada żadnemu ekranowi runtime w tym module."
        title="Nieobsługiwany ekran"
        tone="critical"
      />
    );
  }

  return (
    <AnalyticsModuleWorkspace
      data={state.data}
      definition={definition}
      loading={state.loading}
      mode="runtime"
      path={path}
      problem={state.problem}
      onReload={() => {
        setRefreshKey((current) => current + 1);
      }}
    />
  );
}

function resolveDefinition(
  group: AnalyticsModuleGroup,
  path: string,
): AnalyticsScreenDefinition | null {
  const normalizedPath = path.split('?')[0] || analyticsModuleRootRoutes[group];
  const route = normalizedPath === `/app/${group}`
    ? analyticsModuleRootRoutes[group]
    : normalizedPath;
  const definition = findAnalyticsScreenDefinition(route);

  return definition?.group === group
    ? definition
    : null;
}

async function loadDefinition(
  definition: AnalyticsScreenDefinition,
): Promise<AnalyticsModuleData> {
  switch (definition.group) {
    case 'campaigns': {
      const response = await bffClient.readDomainScreen<CampaignsApiData>(
        definition.apiPath,
      );
      return createCampaignsRuntimeData(definition, response);
    }
    case 'orders': {
      const response = await bffClient.readDomainScreen<OrdersApiData>(
        definition.apiPath,
      );
      return createOrdersRuntimeData(definition, response);
    }
    case 'products': {
      const response = await bffClient.readDomainScreen<ProductsApiData>(
        definition.apiPath,
      );
      return createProductsRuntimeData(definition, response);
    }
    case 'customers': {
      const response = await bffClient.readDomainScreen<CustomersApiData>(
        definition.apiPath,
      );
      return createCustomersRuntimeData(definition, response);
    }
    case 'traffic': {
      const response = await bffClient.readDomainScreen<TrafficApiData>(
        definition.apiPath,
      );
      return createTrafficRuntimeData(definition, response);
    }
  }
}
