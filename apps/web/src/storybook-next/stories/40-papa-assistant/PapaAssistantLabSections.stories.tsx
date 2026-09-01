import type {
  Meta,
} from '@storybook/react-vite';

import {
  WynikAnalizy as WynikAnalizyStory,
  PorownanieWariantow as PorownanieWariantowStory,
  StudioWykresow as StudioWykresowStory,
  Biblioteka as BibliotekaStory,
  DokumentacjaArchitektura as DokumentacjaArchitekturaStory,
  AssistantShell as AssistantShellStory,
  ContextBasket as ContextBasketStory,
  DecisionQueue as DecisionQueueStory,
  EvidenceAndRefusals as EvidenceAndRefusalsStory,
  ReportBuilder as ReportBuilderStory,
  CausalSimulator as CausalSimulatorStory,
  ReportsAndAiAct as ReportsAndAiActStory,
} from './PapaAssistantLabPage.story-support';

const meta = {
  title: 'AI/Laboratorium Papa Asystenta/Sekcje',
} satisfies Meta;

export default meta;

export const WynikAnalizy = {
  ...WynikAnalizyStory,
  name: 'Wynik analizy',
};

export const PorownanieWariantow = {
  ...PorownanieWariantowStory,
  name: 'Porównanie wariantów',
};

export const StudioWykresow = {
  ...StudioWykresowStory,
  name: 'Studio wykresów',
};

export const Biblioteka = {
  ...BibliotekaStory,
  name: 'Biblioteka',
};

export const DokumentacjaArchitektura = {
  ...DokumentacjaArchitekturaStory,
  name: 'Informacje o działaniu',
};

export const AssistantShell = {
  ...AssistantShellStory,
  name: 'Powłoka Asystenta',
};

export const ContextBasket = {
  ...ContextBasketStory,
  name: 'Koszyk kontekstu',
};

export const DecisionQueue = {
  ...DecisionQueueStory,
  name: 'Kolejka decyzji',
};

export const EvidenceAndRefusals = {
  ...EvidenceAndRefusalsStory,
  name: 'Dowody i odmowy',
};

export const ReportBuilder = {
  ...ReportBuilderStory,
  name: 'Kreator wykresów',
};

export const CausalSimulator = {
  ...CausalSimulatorStory,
  name: 'Symulator wariantów',
};

export const ReportsAndAiAct = {
  ...ReportsAndAiActStory,
  name: 'Biblioteka i zgodność',
};
