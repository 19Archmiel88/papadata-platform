import type { Meta } from '@storybook/react-vite';

import {
  Result as ResultStory,
  Platforms as PlatformsStory,
  Risks as RisksStory,
  CampaignTable as CampaignTableStory,
  CreativeIntelligence as CreativeIntelligenceStory,
  AttributionAndOverlap as AttributionAndOverlapStory,
  BudgetPacing as BudgetPacingStory,
} from './PaidCampaignsBiPage.story-support';

const meta = {
  title: 'ANALIZA/Kampanie płatne/Sekcje',
} satisfies Meta;

export default meta;

export const Result = {
  ...ResultStory,
  name: 'Wynik kampanii',
};

export const Platforms = {
  ...PlatformsStory,
  name: 'Platformy i kampanie',
};

export const Risks = {
  ...RisksStory,
  name: 'Ryzyka i alerty',
};

export const CampaignTable = {
  ...CampaignTableStory,
  name: 'Analiza kampanii',
};

export const CreativeIntelligence = {
  ...CreativeIntelligenceStory,
  name: 'Kreacje reklamowe',
};

export const AttributionAndOverlap = {
  ...AttributionAndOverlapStory,
  name: 'Atrybucja i deduplikacja',
};

export const BudgetPacing = {
  ...BudgetPacingStory,
  name: 'Realizacja budżetu',
};
