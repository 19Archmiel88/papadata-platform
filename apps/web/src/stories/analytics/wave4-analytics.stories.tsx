import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { CustomerWorkspaceScreen } from '../../features/analytics';
import {
  analyticsStoryFixtures,
  type AnalyticsFixtureId,
} from '../../features/analytics/analyticsFixtures';

type AnalyticsStoryArgs = {
  fixtureId: AnalyticsFixtureId;
  theme: 'light' | 'dark' | 'high-contrast';
};

function AnalyticsStory({ fixtureId, theme }: AnalyticsStoryArgs) {
  return (
    <CustomerWorkspaceScreen
      fixture={analyticsStoryFixtures[fixtureId]}
      theme={theme}
    />
  );
}

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Analytics Platform i Customer Workspace',
  component: AnalyticsStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    fixtureId: {
      control: 'select',
      options: Object.keys(analyticsStoryFixtures),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'high-contrast'],
    },
  },
  args: {
    fixtureId: 'default',
    theme: 'dark',
  },
} satisfies Meta<typeof AnalyticsStory>;

export default meta;

type Story = StoryObj<typeof meta>;

function story(fixtureId: AnalyticsFixtureId, name: string): Story {
  return {
    name,
    args: { fixtureId },
  };
}

export const Domyslny: Story = {
  ...story('default', 'Domyślny'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(/Analytics Platform/i)).resolves.toBeInTheDocument();
    await userEvent.click(await canvas.findAllByRole('button', { name: /Trust/i }).then((items) => items[0]));
    await expect(canvas.findByText(/Trust Drawer otwarty/i)).resolves.toBeInTheDocument();
    await userEvent.click(await canvas.findAllByRole('button', { name: /Drill-down/i }).then((items) => items[0]));
    await expect(canvas.findByText(/Drill-down otwarty/i)).resolves.toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: /Export/i }));
    await expect(canvas.findByText(/Eksport gotowy/i)).resolves.toBeInTheDocument();
  },
};

export const Ladowanie = story('loading', 'Loading');
export const EmptyConfirmed = story('empty_confirmed', 'Empty confirmed');
export const BrakDanych = story('missing_data', 'Missing data');
export const CzescDanych = story('partial', 'Partial');
export const NieSwieze = story('stale', 'Stale');
export const Nieprawidlowe = story('invalid', 'Invalid');
export const Zablokowane = story('blocked', 'Blocked');
export const Przetwarzanie = story('processing', 'Processing');
export const WymagaPrzeliczenia = story('recalculation', 'Recalculation');
export const BrakUprawnien = story('permission_denied', 'Permission denied');
export const WymaganyEntitlement = story('entitlement_required', 'Entitlement required');
export const BladOdzyskiwalny = story('recoverable_error', 'Recoverable error');
export const ProblemKrytyczny = story('critical_issue', 'Critical issue');
export const SnapshotHistoryczny = story('historical_snapshot', 'Historical snapshot');
export const DlugieTresci = story('long_content', 'Long content');
export const Desktop = story('desktop', 'Desktop');
export const Tablet = story('tablet', 'Tablet');
export const Mobile = story('mobile', 'Mobile');
export const NawigacjaKlawiatura = story('keyboard_navigation', 'Keyboard navigation');
export const ReducedMotion = story('reduced_motion', 'Reduced motion');
export const MotywJasny = {
  ...story('light', 'Light'),
  args: {
    fixtureId: 'light',
    theme: 'light',
  },
} satisfies Story;
export const MotywCiemny = story('dark', 'Dark');
export const WysokiKontrast = {
  ...story('high_contrast', 'High contrast'),
  args: {
    fixtureId: 'high_contrast',
    theme: 'high-contrast',
  },
} satisfies Story;
export const Zamowienia = story('orders', 'Zamówienia');
export const ProduktyGated = story('products_gated', 'Produkty gated');
export const KlienciGated = story('customers_gated', 'Klienci gated');
export const RuchGated = story('traffic_gated', 'Ruch gated');
export const KampaniePlatneGated = story('paid_campaigns_gated', 'Kampanie płatne gated');
export const D2C = story('d2c', 'D2C');
export const MarketplaceGated = story('marketplace_gated', 'Marketplace gated');
export const MarketingAtrybucjaGated = story(
  'marketing_attribution_gated',
  'Marketing i atrybucja gated',
);
export const RentownoscBlocked = story('profitability_blocked', 'Rentowność blocked');
export const DataTrust = story('data_trust', 'Data Trust');
export const Alerty = story('alerts', 'Alerty');
export const Zadania = story('tasks', 'Zadania');
export const ZmianaWorkspace = story('workspace_switch', 'Zmiana workspace');
