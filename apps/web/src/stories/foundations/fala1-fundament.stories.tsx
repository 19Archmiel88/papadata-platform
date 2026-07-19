import type { Meta, StoryObj } from '@storybook/react-vite';

import { ReferenceSliceScreen } from '../../features/reference-slice';
import { SessionContextProvider } from '../../shell';
import {
  canonicalStoryFixtures,
  type CanonicalStoryFixtureId,
} from '../../shared/test';

type FoundationStoryArgs = {
  fixtureId: CanonicalStoryFixtureId;
  theme: 'light' | 'dark';
};

function FoundationStory({ fixtureId, theme }: FoundationStoryArgs) {
  const fixture = canonicalStoryFixtures[fixtureId];

  return (
    <SessionContextProvider initialContext={fixture.context}>
      <ReferenceSliceScreen fixture={fixture} theme={theme} />
    </SessionContextProvider>
  );
}

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Fundament projektu',
  component: FoundationStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    fixtureId: {
      control: 'select',
      options: Object.keys(canonicalStoryFixtures),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
  args: {
    fixtureId: 'ctx_owner_ready',
    theme: 'dark',
  },
} satisfies Meta<typeof FoundationStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PionReferencyjny: Story = {
  name: 'Pion referencyjny',
};

export const CzesciowyDataset: Story = {
  name: 'Częściowy dataset',
  args: {
    fixtureId: 'ctx_admin_partial',
  },
};

export const BrakUprawnien: Story = {
  name: 'Brak uprawnień',
  args: {
    fixtureId: 'ctx_viewer_forbidden',
  },
};

export const RetrySynchronizacji: Story = {
  name: 'Retry synchronizacji',
  args: {
    fixtureId: 'sync_retry_wait',
  },
};

export const AiWymagaPrzegladu: Story = {
  name: 'AI wymaga przeglądu',
  args: {
    fixtureId: 'ai_needs_review',
  },
};

export const JasnyMotyw: Story = {
  name: 'Jasny motyw',
  args: {
    theme: 'light',
  },
};
