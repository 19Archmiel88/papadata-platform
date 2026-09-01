import type {
  ReactNode,
} from 'react';
import type {
  TooltipPayloadEntry,
} from 'recharts';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  ChartCrosshairTooltip,
  ChartMarkTooltip,
} from './ChartTooltip';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/ChartTooltip',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;


function StorySection({
  children,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-chart-tooltip-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function buildPayload(entries: ReadonlyArray<{
  readonly color: string;
  readonly dataKey: string;
  readonly name: string;
  readonly value: number;
}>): TooltipPayloadEntry[] {
  return entries.map((entry) => ({
    color: entry.color,
    dataKey: entry.dataKey,
    name: entry.name,
    payload: {},
    stroke: entry.color,
    value: entry.value,
  })) as unknown as TooltipPayloadEntry[];
}

const crosshairPayload = buildPayload([
  { color: 'var(--pd-data-series-1)', dataKey: 'actual', name: 'Wynik', value: 12840 },
  { color: 'var(--pd-data-series-2)', dataKey: 'plan', name: 'Plan', value: 11200 },
]);

const markPayload = buildPayload([
  { color: 'var(--pd-data-series-3)', dataKey: 'value', name: 'WooCommerce', value: 62 },
]);

export const ChartTooltipStory: Story = {
  name: 'ChartTooltip',
  render: () => (
    <StoryPresentationPage
      className="pd-chart-tooltip-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ChartTooltip', en: 'ChartTooltip parameters' })}
          items={[
            { label: <Localized pl="Warianty" en="Variants" />, value: 'ChartCrosshairTooltip / ChartMarkTooltip' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="chart-tooltip"
      summary={
        <Localized
          pl="Treść przekazywana do Recharts jako content={'<ChartCrosshairTooltip .../>'} — nie samodzielny overlay. Crosshair pokazuje wszystkie widoczne serie w punkcie X (linie/obszary); Mark pokazuje tylko najechany punkt (słupki/kołowy/scatter). To osobny wzorzec od ogólnego Tooltip UI."
          en="Content passed to Recharts as content={'<ChartCrosshairTooltip .../>'} — not a standalone overlay. Crosshair shows every visible series at an X point (line/area charts); Mark shows only the hovered point (bar/pie/scatter). This is a separate pattern from the general-purpose UI Tooltip."
        />
      }
      title={<Localized pl="Zawartość podpowiedzi wykresu, nie sam overlay." en="Chart tooltip content, not the overlay itself." />}
    >
      <StorySection index="01" title={<Localized pl="ChartCrosshairTooltip" en="ChartCrosshairTooltip" />} summary={<Localized pl="Linie/obszary: jeden wiersz na każdą widoczną serię przy najechanym X." en="Line/area charts: one row per visible series at the hovered X." />}>
        <div data-testid="tooltip-crosshair" style={{ position: 'relative', minHeight: '80px' }}>
          <ChartCrosshairTooltip accessibilityLayer={false} active activeIndex={undefined} coordinate={undefined} label="18 sie" payload={crosshairPayload} valueFormatter={(value) => `${value.toLocaleString('pl-PL')} zł`} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="ChartMarkTooltip" en="ChartMarkTooltip" />} summary={<Localized pl="Słupki/kołowy/scatter: tylko najechany punkt, bez krzyżyka." en="Bar/pie/scatter charts: only the hovered point, no crosshair." />}>
        <div data-testid="tooltip-mark" style={{ position: 'relative', minHeight: '80px' }}>
          <ChartMarkTooltip accessibilityLayer={false} active activeIndex={undefined} coordinate={undefined} payload={markPayload} valueFormatter={(value) => `${value}%`} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('tooltip-crosshair')).toHaveTextContent('Wynik');
    await expect(canvas.getByTestId('tooltip-mark')).toHaveTextContent('WooCommerce');
  },
};
