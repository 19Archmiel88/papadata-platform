import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';
import {
  expect,
  fireEvent,
  userEvent,
  within,
} from 'storybook/test';

import {
  PaidCampaignsAttribution,
  PaidCampaignsBiPage,
  PaidCampaignsBudgetPacing,
  PaidCampaignsBudgetSimulator,
  PaidCampaignsCampaignTable,
  PaidCampaignsCreativeIntelligence,
  PaidCampaignsPlatformsSection,
  PaidCampaignsResultSection,
  PaidCampaignsRisksSection,
} from './PaidCampaignsBiPage';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '31 Kampanie Płatne',
  component: PaidCampaignsBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PaidCampaignsBiPage>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-pcbi">
      <div className="pd-pcbi__content">
        {children}
      </div>
    </main>
  );
}

export const Overview: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/campaigns">
      <PaidCampaignsBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Wynik kampanii' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Analiza kampanii' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Kreacje reklamowe' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'Symulator budżetu' })).toBeInTheDocument();
  },
};

export const Result: Story = {
  name: 'Wynik kampanii',
  render: () => (
    <StoryFrame>
      <PaidCampaignsResultSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Wynik kampanii' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Efektywność (ROAS)' }));
    await expect(await canvas.findByText('Target ROAS (3.80)')).toBeInTheDocument();
  },
};

export const Platforms: Story = {
  name: 'Platformy i kampanie',
  render: () => (
    <StoryFrame>
      <PaidCampaignsPlatformsSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Platformy i kampanie' })).toBeInTheDocument();
    await expect(await canvas.findByText('Liderzy i Wypalające się Kampanie')).toBeInTheDocument();
  },
};

export const Risks: Story = {
  name: 'Ryzyka i alerty',
  render: () => (
    <StoryFrame>
      <PaidCampaignsRisksSection />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Ryzyka i alerty' })).toBeInTheDocument();
    await expect(await canvas.findByText('Creative Fatigue Spike')).toBeInTheDocument();
  },
};

export const CampaignTable: Story = {
  name: 'Analiza kampanii',
  render: () => (
    <StoryFrame>
      <PaidCampaignsCampaignTable />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Analiza kampanii' })).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Szukaj nazwy lub ID kampanii' }), 'retargeting');
    await expect(await canvas.findByText('Meta — Retargeting Dynamic Catalog')).toBeInTheDocument();
    await expect(canvas.queryByText('Google — Performance Max All-Products')).not.toBeInTheDocument();
  },
};

export const CreativeIntelligence: Story = {
  name: 'Kreacje reklamowe',
  render: () => (
    <StoryFrame>
      <PaidCampaignsCreativeIntelligence />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Kreacje reklamowe' })).toBeInTheDocument();
    await expect(await canvas.findByText('WYPALENIE (FATIGUE)')).toBeInTheDocument();
    await expect(await canvas.findByText('Meta — Social Proof / UGC Reviews')).toBeInTheDocument();
  },
};

export const AttributionAndOverlap: Story = {
  name: 'Atrybucja i deduplikacja',
  render: () => (
    <StoryFrame>
      <PaidCampaignsAttribution />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Atrybucja i deduplikacja' })).toBeInTheDocument();
    await expect(await canvas.findByText('Commerce Reality Gap (Deduplikacja Sprzedaży)')).toBeInTheDocument();
    await expect(await canvas.findByText('+28.0% Overlap')).toBeInTheDocument();
  },
};

export const BudgetPacing: Story = {
  name: 'Budżet i pacing',
  render: () => (
    <StoryFrame>
      <PaidCampaignsBudgetPacing />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Budżet i pacing' })).toBeInTheDocument();
    await expect(await canvas.findByText(/Wydano:/u)).toBeInTheDocument();
  },
};

export const BudgetSimulator: Story = {
  name: 'Symulator budżetu',
  render: () => (
    <StoryFrame>
      <PaidCampaignsBudgetSimulator />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Symulator budżetu' })).toBeInTheDocument();
    const googleSlider = await canvas.findByRole('slider', { name: '🔵 Google Ads Budżet' });
    fireEvent.change(googleSlider, { target: { value: '45000' } });
    await expect(await canvas.findByText('45 000 zł')).toBeInTheDocument();
  },
};

export const PapaAiInteractions: Story = {
  name: 'Interakcje Papa AI',
  render: () => (
    <StorybookProductShellFrame activePath="/app/campaigns">
      <PaidCampaignsBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: /POMIAR/u }));
    await expect(await canvas.findByRole('dialog', { name: 'Data Lineage' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij provenance' }));

    await userEvent.click(await canvas.findAllByRole('button', { name: 'Drill-down ➔' }).then((buttons) => buttons[0]));
    await expect(await canvas.findByRole('dialog', { name: 'Campaign drill-down' })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: /Zapytaj Papa Asystenta/u }));
    await expect(await canvas.findByRole('dialog', { name: 'Papa Asystent Decyzyjny' })).toBeInTheDocument();
    await expect(await canvas.findByText('1. OBSERWACJA')).toBeInTheDocument();
  },
};
