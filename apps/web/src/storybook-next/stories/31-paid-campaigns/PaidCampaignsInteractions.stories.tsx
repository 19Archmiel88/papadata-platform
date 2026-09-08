import type { Meta } from '@storybook/react-vite';

import {
  BudgetSimulator as BudgetSimulatorStory,
  EvidenceAndBudget as EvidenceAndBudgetStory,
} from './PaidCampaignsBiPage.story-support';

const meta = {
  title: 'ANALIZA/Kampanie płatne/Interakcje',
} satisfies Meta;

export default meta;

export const BudgetSimulator = {
  ...BudgetSimulatorStory,
  name: 'Symulator budżetu',
};

export const EvidenceAndBudget = {
  ...EvidenceAndBudgetStory,
  name: 'Dowody i wariant budżetu',
};
