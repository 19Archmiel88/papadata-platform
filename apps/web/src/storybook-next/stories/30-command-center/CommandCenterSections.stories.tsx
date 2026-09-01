import type {
  Meta,
} from '@storybook/react-vite';

import {
  Kpi as KpiStory,
  Guardian as GuardianStory,
  Plan as PlanStory,
  Drivers as DriversStory,
  Risks as RisksStory,
  Funnel as FunnelStory,
  Sources as SourcesStory,
  Products as ProductsStory,
  Customers as CustomersStory,
  DataHealth as DataHealthStory,
} from './CommandCenterBiPage.story-support';

const meta = {
  title: 'ANALIZA/Centrum Dowodzenia/Sekcje',
} satisfies Meta;

export default meta;

export const Kpi = {
  ...KpiStory,
  name: 'KPI',
};

export const Guardian = {
  ...GuardianStory,
  name: 'Guardian',
};

export const Plan = {
  ...PlanStory,
  name: 'Plan i wynik',
};

export const Drivers = {
  ...DriversStory,
  name: 'Czynniki wyniku',
};

export const Risks = {
  ...RisksStory,
  name: 'Ryzyka i alerty',
};

export const Funnel = {
  ...FunnelStory,
  name: 'Lejek konwersji',
};

export const Sources = {
  ...SourcesStory,
  name: 'Źródła przychodu',
};

export const Products = {
  ...ProductsStory,
  name: 'Produkty',
};

export const Customers = {
  ...CustomersStory,
  name: 'Struktura klientów',
};

export const DataHealth = {
  ...DataHealthStory,
  name: 'Stan integracji i pochodzenie danych',
};
