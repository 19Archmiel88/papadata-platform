import type {
  Meta,
} from '@storybook/react-vite';

import {
  Result as ResultStory,
  Retention as RetentionStory,
  Segmentation as SegmentationStory,
  Value as ValueStory,
  Acquisition as AcquisitionStory,
  ProductPreferences as ProductPreferencesStory,
  Explorer as ExplorerStory,
  PapaSummary as PapaSummaryStory,
} from './CustomersBiPage.story-support';

const meta = {
  title: 'ANALIZA/Klienci/Sekcje',
} satisfies Meta;

export default meta;

export const Result = {
  ...ResultStory,
  name: 'Wynik klientów',
};

export const Retention = {
  ...RetentionStory,
  name: 'Retencja klientów',
};

export const Segmentation = {
  ...SegmentationStory,
  name: 'Segmentacja klientów',
};

export const Value = {
  ...ValueStory,
  name: 'Wartość klienta',
};

export const Acquisition = {
  ...AcquisitionStory,
  name: 'Pozyskanie klientów',
};

export const ProductPreferences = {
  ...ProductPreferencesStory,
  name: 'Preferencje produktowe',
};

export const Explorer = {
  ...ExplorerStory,
  name: 'Eksplorator klientów',
};

export const PapaSummary = {
  ...PapaSummaryStory,
  name: 'Podsumowanie Papa AI',
};
