import type {
  Meta,
} from '@storybook/react-vite';

import {
  CatalogStory as CatalogStoryStory,
  DataQualityStory as DataQualityStoryStory,
  WorkspaceConfigStory as WorkspaceConfigStoryStory,
  WorkspaceDataStory as WorkspaceDataStoryStory,
  WorkspaceOverviewStory as WorkspaceOverviewStoryStory,
  WorkspaceSyncRunStory as WorkspaceSyncRunStoryStory,
  WorkspaceSyncStory as WorkspaceSyncStoryStory,
} from './Integrations.story-support';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Sekcje',
} satisfies Meta;

export default meta;

export const CatalogStory = {
  ...CatalogStoryStory,
  name: 'Katalog',
};

export const DataQualityStory = {
  ...DataQualityStoryStory,
  name: 'Jakość danych',
};

export const WorkspaceOverviewStory = {
  ...WorkspaceOverviewStoryStory,
  name: 'Szczegóły integracji — Przegląd',
};

export const WorkspaceDataStory = {
  ...WorkspaceDataStoryStory,
  name: 'Szczegóły integracji — Dane',
};

export const WorkspaceSyncStory = {
  ...WorkspaceSyncStoryStory,
  name: 'Szczegóły integracji — Synchronizacja',
};

export const WorkspaceConfigStory = {
  ...WorkspaceConfigStoryStory,
  name: 'Szczegóły integracji — Konfiguracja',
};

export const WorkspaceSyncRunStory = {
  ...WorkspaceSyncRunStoryStory,
  name: 'Szczegóły runu',
};
