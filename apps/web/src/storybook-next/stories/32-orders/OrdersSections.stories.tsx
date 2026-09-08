import type {
  Meta,
} from '@storybook/react-vite';

import {
  Result as ResultStory,
  Lifecycle as LifecycleStory,
  Explorer as ExplorerStory,
  PaymentsAndShipping as PaymentsAndShippingStory,
  DiscountsAndReturns as DiscountsAndReturnsStory,
  Funnel as FunnelStory,
  PapaSummary as PapaSummaryStory,
} from './OrdersBiPage.story-support';

const meta = {
  title: 'ANALIZA/Zamówienia/Sekcje',
} satisfies Meta;

export default meta;

export const Result = {
  ...ResultStory,
  name: 'Wynik operacyjny',
};

export const Lifecycle = {
  ...LifecycleStory,
  name: 'Realizacja zamówień',
};

export const Explorer = {
  ...ExplorerStory,
  name: 'Eksplorator zamówień',
};

export const PaymentsAndShipping = {
  ...PaymentsAndShippingStory,
  name: 'Płatności i dostawa',
};

export const DiscountsAndReturns = {
  ...DiscountsAndReturnsStory,
  name: 'Rabaty i zwroty',
};

export const Funnel = {
  ...FunnelStory,
  name: 'Lejek zakupowy',
};

export const PapaSummary = {
  ...PapaSummaryStory,
  name: 'Podsumowanie Papa AI',
};
