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

export const Ladowanie = story('loading', 'Ładowanie');
export const EmptyConfirmed = story('empty_confirmed', 'Pusty stan potwierdzony');
export const BrakDanych = story('missing_data', 'Brak danych');
export const CzescDanych = story('partial', 'Częściowe dane');
export const NieSwieze = story('stale', 'Nieświeże dane');
export const Nieprawidlowe = story('invalid', 'Nieprawidłowe dane');
export const Zablokowane = story('blocked', 'Zablokowane');
export const Przetwarzanie = story('processing', 'Przetwarzanie');
export const WymagaPrzeliczenia = story('recalculation', 'Wymaga przeliczenia');
export const BrakUprawnien = story('permission_denied', 'Brak uprawnień');
export const WymaganyEntitlement = story('entitlement_required', 'Wymagany entitlement');
export const BladOdzyskiwalny = story('recoverable_error', 'Błąd odzyskiwalny');
export const ProblemKrytyczny = story('critical_issue', 'Problem krytyczny');
export const SnapshotHistoryczny = story('historical_snapshot', 'Snapshot historyczny');
export const DlugieTresci = story('long_content', 'Długie treści');
export const Desktop = story('desktop', 'Desktop');
export const Tablet = story('tablet', 'Tablet');
export const Mobile = story('mobile', 'Mobile');
export const NawigacjaKlawiatura = story('keyboard_navigation', 'Nawigacja klawiaturą');
export const ReducedMotion = story('reduced_motion', 'Ograniczony ruch');
export const MotywJasny = {
  ...story('light', 'Motyw jasny'),
  args: {
    fixtureId: 'light',
    theme: 'light',
  },
} satisfies Story;
export const MotywCiemny = story('dark', 'Motyw ciemny');
export const WysokiKontrast = {
  ...story('high_contrast', 'Wysoki kontrast'),
  args: {
    fixtureId: 'high_contrast',
    theme: 'high-contrast',
  },
} satisfies Story;
export const Zamowienia = story('orders', 'Zamówienia');
export const ProduktyGated = story('products_gated', 'Produkty za bramą');
export const KlienciGated = story('customers_gated', 'Klienci za bramą');
export const RuchGated = story('traffic_gated', 'Ruch za bramą');
export const KampaniePlatneGated = story('paid_campaigns_gated', 'Kampanie płatne za bramą');
export const D2C = story('d2c', 'D2C');
export const MarketplaceGated = story('marketplace_gated', 'Marketplace za bramą');
export const MarketingAtrybucjaGated = story(
  'marketing_attribution_gated',
  'Marketing i atrybucja za bramą',
);
export const RentownoscBlocked = story('profitability_blocked', 'Rentowność zablokowana');
export const DataTrust = story('data_trust', 'Zaufanie do danych');
export const Alerty = story('alerts', 'Alerty');
export const Zadania = story('tasks', 'Zadania');
export const ZmianaWorkspace = story('workspace_switch', 'Zmiana workspace');
