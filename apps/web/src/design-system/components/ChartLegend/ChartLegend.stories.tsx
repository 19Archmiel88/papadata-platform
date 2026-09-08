import {
  useState,
} from 'react';
import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  ChartLegend,
} from './ChartLegend';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const items = [
  { color: 'var(--pd-data-series-1)', id: 'actual', label: 'Wynik', valueLabel: '284 120 zł' },
  { color: 'var(--pd-data-series-2)', id: 'plan', label: 'Plan', lineStyle: 'dashed' as const, valueLabel: '260 000 zł' },
  { color: 'var(--pd-data-series-3)', id: 'previous', label: 'Poprzedni okres', valueLabel: '241 800 zł' },
  { color: 'var(--pd-data-series-4)', disabled: true, id: 'forecast', label: 'Prognoza', valueLabel: null },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/ChartLegend',
  component: ChartLegend,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    ariaLabel: 'Legenda serii wykresu',
    items,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof ChartLegend>;

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
      className="pd-chart-legend-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function ToggleableLegend() {
  const [hidden, setHidden] = useState<readonly string[]>([]);

  return (
    <ChartLegend
      ariaLabel={copy({ pl: 'Legenda z przełączaniem widoczności', en: 'Legend with visibility toggle' })}
      isVisible={(id) => !hidden.includes(id)}
      items={items}
      onToggle={(id) => {
        setHidden((current) => (
          current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
        ));
      }}
    />
  );
}

export const ChartLegendStory: Story = {
  name: 'ChartLegend',
  render: (args) => (
    <StoryPresentationPage
      className="pd-chart-legend-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ChartLegend', en: 'ChartLegend parameters' })}
          items={[
            { label: <Localized pl="onToggle" en="onToggle" />, value: copy({ pl: 'pokaż/ukryj serię', en: 'show/hide a series' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="chart-legend"
      summary={
        <Localized
          pl="Legenda serii z opcjonalnym przełączaniem widoczności per seria (kliknij pozycję). readonly blokuje interakcję dla serii, które nie powinny być ukrywane."
          en="A series legend with optional per-series visibility toggling (click an entry). readonly blocks interaction for series that should not be hidden."
        />
      }
      title={<Localized pl="Klucz do serii, które można wyłączyć." en="A key to series you can turn off." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany (statyczny)" en="Controlled (static)" />}>
        <div data-testid="legend-controlled">
          <ChartLegend {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Z przełączaniem widoczności" en="With visibility toggling" />}>
        <div data-testid="legend-toggleable">
          <ToggleableLegend />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('legend-controlled').querySelectorAll('li')).toHaveLength(items.length);

    const firstToggle = canvas.getByTestId('legend-toggleable').querySelector('button');
    if (firstToggle) {
      await userEvent.click(firstToggle);
    }
  },
};
