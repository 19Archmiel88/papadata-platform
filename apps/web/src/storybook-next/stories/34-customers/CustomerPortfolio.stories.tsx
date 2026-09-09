import type { Meta, StoryObj } from '@storybook/react-vite';

import { customerPortfolioFixture } from '../../../fixtures/customers/customerPortfolioFixture';
import {
  CustomerPortfolioView,
  type CustomerPortfolioViewProps,
} from '../../../screens/customers/CustomerPortfolioView';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';

const meta = {
  id: 'papadata-customer-portfolio',
  title: 'ANALIZA/Klienci/Dane rzeczywiste',
  component: CustomerPortfolioView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    data: customerPortfolioFixture,
    demo: true,
    state: 'ready',
  },
} satisfies Meta<typeof CustomerPortfolioView>;

export default meta;

type Story = StoryObj<typeof meta>;

function renderStory(args: CustomerPortfolioViewProps) {
  return (
    <StorybookProductShellFrame activePath="/app/customers">
      <CustomerPortfolioView {...args} />
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
    problem: 'Scenariusz demonstracyjny: dane klientów są chwilowo niedostępne.',
  },
};
