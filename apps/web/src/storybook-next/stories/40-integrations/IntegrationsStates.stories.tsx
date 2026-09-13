import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import {
  IntegrationOperationsDemo,
} from '../../../fixtures/platform-operations/IntegrationOperationsDemo';
import type {
  OperationsScenarioProps,
} from '../../../fixtures/platform-operations/OperationsScenarios';
import {
  ProviderOutageStory as ProviderOutageStoryStory,
} from './Integrations.story-support';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Stany',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function renderOperationsState(props: OperationsScenarioProps) {
  return (
    <StorybookProductShellFrame activePath="/app/integrations">
      <IntegrationOperationsDemo {...props} />
    </StorybookProductShellFrame>
  );
}

export const ProviderOutageStory: Story = {
  ...ProviderOutageStoryStory,
  name: 'Awaria providera',
};

export const LoadingStory: Story = {
  name: 'Ładowanie',
  render: () => renderOperationsState({ state: 'loading' }),
};

export const EmptyStory: Story = {
  name: 'Brak źródeł',
  render: () => renderOperationsState({ empty: true }),
};

export const ReadOnlyStory: Story = {
  name: 'Tylko odczyt',
  render: () => renderOperationsState({ readonly: true }),
};

export const ErrorStory: Story = {
  name: 'Błąd odczytu',
  render: () => renderOperationsState({ state: 'error' }),
};

export const OfflineStory: Story = {
  name: 'Offline',
  render: () => renderOperationsState({ state: 'offline' }),
};

export const ForbiddenStory: Story = {
  name: 'Brak uprawnień',
  render: () => renderOperationsState({ state: 'forbidden' }),
};
