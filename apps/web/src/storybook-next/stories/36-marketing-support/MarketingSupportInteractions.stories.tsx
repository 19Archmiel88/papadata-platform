import type {
  Meta,
} from '@storybook/react-vite';

import {
  BriefWizard as BriefWizardStory,
  QuoteWorkflow as QuoteWorkflowStory,
} from './MarketingSupportBiPage.story-support';

const meta = {
  title: 'WSPARCIE/Wsparcie w marketingu/Interakcje',
} satisfies Meta;

export default meta;

export const BriefWizard = {
  ...BriefWizardStory,
  name: 'Kreator briefu',
};

export const QuoteWorkflow = {
  ...QuoteWorkflowStory,
  name: 'Wycena i role',
};
