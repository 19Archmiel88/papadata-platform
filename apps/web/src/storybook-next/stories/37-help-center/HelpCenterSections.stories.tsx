import type {
  Meta,
} from '@storybook/react-vite';

import {
  HeaderAndSearch as HeaderAndSearchStory,
  KnowledgeBaseAndCopilot as KnowledgeBaseAndCopilotStory,
  TruthEngineRuntime as TruthEngineRuntimeStory,
  ContextPackAndEscalation as ContextPackAndEscalationStory,
  DomainRoadmapAndCharts as DomainRoadmapAndChartsStory,
  NavigationStrip as NavigationStripStory,
  TruthMatrixStandalone as TruthMatrixStandaloneStory,
  AnalyticsChartsStandalone as AnalyticsChartsStandaloneStory,
} from './HelpCenterBiPage.story-support';

const meta = {
  title: 'WSPARCIE/Centrum Pomocy/Sekcje',
} satisfies Meta;

export default meta;

export const HeaderAndSearch = {
  ...HeaderAndSearchStory,
  name: 'Wyszukiwarka i kontekst',
};

export const KnowledgeBaseAndCopilot = {
  ...KnowledgeBaseAndCopilotStory,
  name: 'Baza wiedzy i Asystent',
};

export const TruthEngineRuntime = {
  ...TruthEngineRuntimeStory,
  name: 'Wiarygodność odpowiedzi',
};

export const ContextPackAndEscalation = {
  ...ContextPackAndEscalationStory,
  name: 'Kontekst i prywatność',
};

export const DomainRoadmapAndCharts = {
  ...DomainRoadmapAndChartsStory,
  name: 'Obszary pomocy i statystyki',
};

export const NavigationStrip = {
  ...NavigationStripStory,
  name: 'Nawigacja kontekstowa',
};

export const TruthMatrixStandalone = {
  ...TruthMatrixStandaloneStory,
  name: 'Źródła informacji',
};

export const AnalyticsChartsStandalone = {
  ...AnalyticsChartsStandaloneStory,
  name: 'Statystyki pomocy',
};
