import type {
  Meta,
} from '@storybook/react-vite';

import {
  OverviewAndDistribution as OverviewAndDistributionStory,
  WorkspaceMasterDetail as WorkspaceMasterDetailStory,
  OutcomesMeasurement as OutcomesMeasurementStory,
  ArchitectureAndRbac as ArchitectureAndRbacStory,
  CaseTypeChart as CaseTypeChartStory,
} from './MarketingSupportBiPage.story-support';

const meta = {
  title: 'WSPARCIE/Wsparcie w marketingu/Sekcje',
} satisfies Meta;

export default meta;

export const OverviewAndDistribution = {
  ...OverviewAndDistributionStory,
  name: 'Centrum wsparcia i rozkład spraw',
};

export const WorkspaceMasterDetail = {
  ...WorkspaceMasterDetailStory,
  name: 'Sprawy i rekomendacje',
};

export const OutcomesMeasurement = {
  ...OutcomesMeasurementStory,
  name: 'Wyniki i historia rekomendacji',
};

export const ArchitectureAndRbac = {
  ...ArchitectureAndRbacStory,
  name: 'Zasady dostępu',
};

export const CaseTypeChart = {
  ...CaseTypeChartStory,
  name: 'Typy spraw',
};
