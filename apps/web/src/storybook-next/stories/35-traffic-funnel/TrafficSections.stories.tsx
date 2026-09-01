import type {
  Meta,
} from '@storybook/react-vite';

import {
  Result as ResultStory,
  Channels as ChannelsStory,
  EntryPages as EntryPagesStory,
  Funnel as FunnelStory,
  DeviceGeo as DeviceGeoStory,
  DataQuality as DataQualityStory,
  PapaDiagnostics as PapaDiagnosticsStory,
} from './TrafficBiPage.story-support';

const meta = {
  title: 'ANALIZA/Ruch na stronie/Sekcje',
} satisfies Meta;

export default meta;

export const Result = {
  ...ResultStory,
  name: 'Wynik ruchu',
};

export const Channels = {
  ...ChannelsStory,
  name: 'Kanały ruchu',
};

export const EntryPages = {
  ...EntryPagesStory,
  name: 'Strony wejścia',
};

export const Funnel = {
  ...FunnelStory,
  name: 'Lejek konwersji',
};

export const DeviceGeo = {
  ...DeviceGeoStory,
  name: 'Urządzenia i geografia',
};

export const DataQuality = {
  ...DataQualityStory,
  name: 'Jakość danych',
};

export const PapaDiagnostics = {
  ...PapaDiagnosticsStory,
  name: 'Diagnostyka Papa AI',
};
