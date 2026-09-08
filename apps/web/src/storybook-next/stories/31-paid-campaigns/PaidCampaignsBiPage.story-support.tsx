import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fireEvent, userEvent, within } from 'storybook/test';

import {
  PaidCampaignsAttribution,
  PaidCampaignsBudgetPacing,
  PaidCampaignsBudgetSimulator,
  PaidCampaignsCampaignTable,
  PaidCampaignsCreativeIntelligence,
  PaidCampaignsPlatformsSection,
  PaidCampaignsResultSection,
  PaidCampaignsRisksSection,
  PaidCampaignsScreen,
} from '../../../screens/paid-campaigns/PaidCampaignsScreen';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'INTERNAL STORY SUPPORT/ANALIZA/Kampanie płatne',
  component: PaidCampaignsScreen,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PaidCampaignsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({ children }: { readonly children: ReactNode }) {
  return (
    <StorybookProductShellFrame activePath="/app/campaigns">
      <div className="pd-pcbi">{children}</div>
    </StorybookProductShellFrame>
  );
}

export const Overview: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/campaigns">
      <PaidCampaignsScreen />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'Kampanie płatne', level: 1 }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Kampanie', level: 2 })).toBeInTheDocument();
    await expect(canvas.getByRole('navigation', { name: 'Widoki kampanii' })).toBeInTheDocument();
  },
};

export const Result: Story = {
  name: 'Sekcje — Wynik kampanii',
  render: () => (
    <StoryFrame>
      <PaidCampaignsResultSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('region', { name: 'Efektywność kampanii' })).toBeInTheDocument();
    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: 'Miara trendu kampanii' }),
      'roas',
    );
    await expect(canvas.getByText('Linia przerywana: cel 3,10×')).toBeInTheDocument();
  },
};

export const Platforms: Story = {
  name: 'Sekcje — Platformy i kampanie',
  render: () => (
    <StoryFrame>
      <PaidCampaignsPlatformsSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: 'Platformy i kampanie' }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText('Liderzy i Wypalające się Kampanie')).toBeInTheDocument();
  },
};

export const Risks: Story = {
  name: 'Sekcje — Ryzyka i alerty',
  render: () => (
    <StoryFrame>
      <PaidCampaignsRisksSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: 'Ryzyka i alerty' }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText('Creative Fatigue Spike')).toBeInTheDocument();
  },
};

export const CampaignTable: Story = {
  name: 'Sekcje — Analiza kampanii',
  render: () => (
    <StoryFrame>
      <PaidCampaignsCampaignTable />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: 'Kampanie', level: 2 }),
    ).toBeInTheDocument();
    await userEvent.type(
      await canvas.findByRole('searchbox', { name: 'Szukaj nazwy lub ID kampanii' }),
      'retargeting',
    );
    await expect(await canvas.findByText('Retargeting Dynamic Catalog')).toBeInTheDocument();
    await expect(canvas.queryByText('Performance Max All-Products')).not.toBeInTheDocument();
  },
};

export const CreativeIntelligence: Story = {
  name: 'Sekcje — Kreacje reklamowe',
  render: () => (
    <StoryFrame>
      <PaidCampaignsCreativeIntelligence />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: 'Kreacje reklamowe' }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText('WYPALENIE (FATIGUE)')).toBeInTheDocument();
    await expect(await canvas.findByText('Meta — Social Proof / UGC Reviews')).toBeInTheDocument();
  },
};

export const AttributionAndOverlap: Story = {
  name: 'Sekcje — Atrybucja i deduplikacja',
  render: () => (
    <StoryFrame>
      <PaidCampaignsAttribution />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: 'Atrybucja i deduplikacja' }),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText('Commerce Reality Gap (Deduplikacja Sprzedaży)'),
    ).toBeInTheDocument();
    await expect(await canvas.findByText('+28.0% Overlap')).toBeInTheDocument();
  },
};

export const BudgetPacing: Story = {
  name: 'Sekcje — Realizacja budżetu',
  render: () => (
    <StoryFrame>
      <PaidCampaignsBudgetPacing />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: 'Budżet i pacing' }),
    ).toBeInTheDocument();
    await expect(await canvas.findByText('Wydano', { exact: true })).toBeInTheDocument();
  },
};

export const BudgetSimulator: Story = {
  name: 'Interakcje — Symulator budżetu',
  render: () => (
    <StoryFrame>
      <PaidCampaignsBudgetSimulator />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { name: 'Symulator budżetu' }),
    ).toBeInTheDocument();
    const slider = canvas.getByRole('slider', { name: 'Zmiana wydatków w wariancie' });
    fireEvent.change(slider, { target: { value: '-10' } });
    await expect(canvas.getByText('228 578 zł', { exact: true })).toBeInTheDocument();
  },
};

export const EvidenceAndBudget: Story = {
  name: 'Dowody i wariant budżetu',
  render: () => (
    <StorybookProductShellFrame activePath="/app/campaigns">
      <PaidCampaignsScreen />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getAllByRole('button', { name: 'Sprawdź dowody →' })[0]!);
    const dialog = await body.findByRole('dialog', { name: 'Retargeting Dynamic Catalog' });
    await expect(within(dialog).getByText('82%', { exact: true })).toBeInTheDocument();
    const slider = within(dialog).getByRole('slider', { name: 'Zmiana wydatków w wariancie' });
    fireEvent.change(slider, { target: { value: '-10' } });
    await expect(within(dialog).getByText(/Wariant nie zmienia budżetu/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(
      body.queryByRole('dialog', { name: 'Retargeting Dynamic Catalog' }),
    ).not.toBeInTheDocument();
  },
};
