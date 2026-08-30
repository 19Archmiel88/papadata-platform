import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  DateRange,
} from '../../../../../../../contracts/ui-contract-types';
import {
  InlineNotice,
} from '../../../../design-system/index';
import {
  bffClient,
} from '../../shared/api/bffClient';
import {
  useShellDateRange,
} from '../../shell/app-shell';
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
  const { dateRange, dateRangeKey } = useShellDateRange();
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
        problem: 'Nie znaleziono widoku dla bieżącej sekcji.',
      });
      return;
    }

    let active = true;

    setState({
      data: null,
      loading: true,
      problem: null,
    });

    loadDefinition(definition, path, dateRange)
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
  }, [dateRange, dateRangeKey, definition, group, path, refreshKey]);

  if (!definition || definition.group !== group) {
    return (
      <InlineNotice
        message="Ten adres nie odpowiada żadnemu widokowi w bieżącym module."
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
  path: string,
  dateRange: DateRange,
): Promise<AnalyticsModuleData> {
  const query = resourceQueryForDefinition(definition, path);
  const options = { dateRange, query };

  switch (definition.group) {
    case 'campaigns': {
      const response = await bffClient.readDomainScreen<CampaignsApiData>(
        definition.apiPath,
        options,
      );
      return createCampaignsRuntimeData(definition, response);
    }
    case 'orders': {
      const response = await bffClient.readDomainScreen<OrdersApiData>(
        definition.apiPath,
        options,
      );
      return createOrdersRuntimeData(definition, response);
    }
    case 'products': {
      const response = await bffClient.readDomainScreen<ProductsApiData>(
        definition.apiPath,
        options,
      );
      return createProductsRuntimeData(definition, response);
    }
    case 'customers': {
      const response = await bffClient.readDomainScreen<CustomersApiData>(
        definition.apiPath,
        options,
      );
      return createCustomersRuntimeData(definition, response);
    }
    case 'traffic': {
      const response = await bffClient.readDomainScreen<TrafficApiData>(
        definition.apiPath,
        options,
      );
      return createTrafficRuntimeData(definition, response);
    }
  }
}

function resourceQueryForDefinition(
  definition: AnalyticsScreenDefinition,
  path: string,
): Readonly<Record<string, string>> | undefined {
  if (!definition.requiresResourceId) return undefined;

  const pathname = path.split('?')[0] ?? path;
  const prefix = `${definition.routeBase}/`;
  if (!pathname.startsWith(prefix)) {
    throw new Error('Brakuje identyfikatora zasobu w adresie widoku szczegółowego.');
  }
  const rawResourceId = pathname.slice(prefix.length).split('/')[0];
  if (!rawResourceId) {
    throw new Error('Brakuje identyfikatora zasobu w adresie widoku szczegółowego.');
  }
  const resourceId = decodeURIComponent(rawResourceId);

  if (definition.group === 'campaigns') return { campaignId: resourceId };
  if (definition.group === 'orders') return { orderId: resourceId };
  if (definition.group === 'products') return { productId: resourceId };
  if (definition.group === 'customers') return { customerPseudonym: resourceId };
  if (definition.group === 'traffic') return { stepId: resourceId };
  return undefined;
}
