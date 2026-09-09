import type { Meta, StoryObj } from '@storybook/react-vite';

import { trafficPortfolioFixture } from '../../../fixtures/traffic/trafficPortfolioFixture';
import {
  TrafficPortfolioView,
  type TrafficPortfolioViewProps,
} from '../../../screens/traffic/TrafficPortfolioView';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';

const meta = {
  id: 'papadata-traffic-portfolio',
  title: 'ANALIZA/Ruch na stronie/Dane rzeczywiste',
  component: TrafficPortfolioView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    data: trafficPortfolioFixture,
    demo: true,
    state: 'ready',
  },
} satisfies Meta<typeof TrafficPortfolioView>;

export default meta;

type Story = StoryObj<typeof meta>;

function renderStory(args: TrafficPortfolioViewProps) {
  return (
    <StorybookProductShellFrame activePath="/app/traffic">
      <TrafficPortfolioView {...args} />
    </StorybookProductShellFrame>
  );
}

export const Overview: Story = {
  name: 'Przegląd',
  render: renderStory,
};

export const Loading: Story = {
  name: 'Ładowanie',
  render: renderStory,
  args: {
    data: null,
    state: 'loading',
  },
};

export const Error: Story = {
  name: 'Błąd',
  render: renderStory,
  args: {
    data: null,
    state: 'error',
    problem: 'Scenariusz demonstracyjny: dane ruchu są chwilowo niedostępne.',
  },
};
