import type {
  Meta,
} from '@storybook/react-vite';

import {
  Result as ResultStory,
  Explorer as ExplorerStory,
  Portfolio as PortfolioStory,
  Inventory as InventoryStory,
  PromotionsAndBasket as PromotionsAndBasketStory,
  Lifecycle as LifecycleStory,
  PapaSummary as PapaSummaryStory,
} from './ProductsBiPage.story-support';

const meta = {
  title: 'ANALIZA/Produkty/Sekcje',
} satisfies Meta;

export default meta;

export const Result = {
  ...ResultStory,
  name: 'Wynik produktowy',
};

export const Explorer = {
  ...ExplorerStory,
  name: 'Eksplorator produktów',
};

export const Portfolio = {
  ...PortfolioStory,
  name: 'Portfolio produktów',
};

export const Inventory = {
  ...InventoryStory,
  name: 'Zapasy i kapitał',
};

export const PromotionsAndBasket = {
  ...PromotionsAndBasketStory,
  name: 'Promocje i koszyk',
};

export const Lifecycle = {
  ...LifecycleStory,
  name: 'Cykl życia produktów',
};

export const PapaSummary = {
  ...PapaSummaryStory,
  name: 'Podsumowanie Papa AI',
};
