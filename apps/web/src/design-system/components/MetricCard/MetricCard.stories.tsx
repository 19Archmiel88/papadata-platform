import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  MetricCard,
} from './MetricCard';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Dane/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    comparison: { direction: 'up', label: '+9,2% d/d' },
    freshnessLabel: 'Zaktualizowano 18 min temu',
    label: 'Przychód',
    metricId: 'revenue',
    signal: 'positive',
    sourceLabel: 'WooCommerce, Google Ads',
    sparklinePoints: [38, 44, 41, 52, 49, 61, 58, 70],
    status: 'ready',
    statusLabel: 'Dane gotowe',
    unit: 'zł',
    value: '284 120',
  },
  argTypes: {
    depth: { control: 'inline-radio', options: ['default', 'flat', 'hero'] },
    density: { control: 'inline-radio', options: ['regular', 'compact'] },
    emphasis: { control: 'inline-radio', options: ['default', 'alert', 'recommendation'] },
    layout: { control: 'inline-radio', options: ['default', 'sparkline-aside'] },
    signal: { control: 'inline-radio', options: ['positive', 'negative', 'neutral', 'warning'] },
  },
} satisfies Meta<typeof MetricCard>;

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
      className="pd-metric-card-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const gridStyle = { display: 'grid', gap: 'var(--pd-space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' } as const;

export const MetricCardStory: Story = {
  name: 'MetricCard',
  render: (args) => (
    <StoryPresentationPage
      className="pd-metric-card-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry MetricCard', en: 'MetricCard parameters' })}
          items={[
            { label: <Localized pl="status (AnalyticsDataState)" en="status (AnalyticsDataState)" />, value: '13 wartości' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="metric-card"
      summary={
        <Localized
          pl="Metryka biznesowa niesie własną gotowość danych przez AnalyticsDataState (ready/loading/partial/stale/error/…) — użytkownik ma wiedzieć nie tylko wartość, ale też czy może jej ufać."
          en="A business metric carries its own data readiness via AnalyticsDataState (ready/loading/partial/stale/error/…) — the user should know not just the value, but whether they can trust it."
        />
      }
      title={<Localized pl="Liczba, która wie, czy można jej ufać." en="A number that knows if you can trust it." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="metric-controlled" style={{ maxWidth: '340px' }}>
          <MetricCard {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany gotowości danych" en="Data readiness states" />}>
        <div data-testid="metric-states" style={gridStyle}>
          <MetricCard label={copy({ pl: 'Ładowanie', en: 'Loading' })} metricId="loading" status="loading" statusLabel={copy({ pl: 'Ładowanie…', en: 'Loading…' })} value={null} />
          <MetricCard freshnessLabel={copy({ pl: 'Dane nieaktualne od 08:21', en: 'Data stale since 08:21' })} label={copy({ pl: 'ROAS (nieaktualne)', en: 'ROAS (stale)' })} metricId="roas-stale" signal="warning" status="stale" statusLabel={copy({ pl: 'Dane nieaktualne', en: 'Data stale' })} unit="x" value="3,1" />
          <MetricCard label={copy({ pl: 'CAC (błąd)', en: 'CAC (error)' })} metricId="cac-error" signal="negative" status="error" statusLabel={copy({ pl: 'Błąd pobrania', en: 'Fetch error' })} value={null} />
          <MetricCard label={copy({ pl: 'Brak danych', en: 'No data' })} metricId="empty" status="noData" statusLabel={copy({ pl: 'Brak danych w zakresie', en: 'No data in range' })} value={null} />
        </div>
      </StorySection>

      <StorySection index="03" title={<Localized pl="Emphasis" en="Emphasis" />} summary={<Localized pl="alert i recommendation podnoszą wizualny priorytet karty na dashboardzie." en="alert and recommendation raise the card's visual priority on a dashboard." />}>
        <div data-testid="metric-emphasis" style={gridStyle}>
          <MetricCard comparison={{ direction: 'down', label: '-14% d/d' }} emphasis="alert" label={copy({ pl: 'ROAS poniżej celu', en: 'ROAS below target' })} metricId="roas-alert" signal="negative" status="ready" statusLabel={copy({ pl: 'Gotowe', en: 'Ready' })} unit="x" value="1,8" />
          <MetricCard emphasis="recommendation" label={copy({ pl: 'Sugerowane działanie', en: 'Suggested action' })} metricId="recommendation" status="ready" statusLabel={copy({ pl: 'Gotowe', en: 'Ready' })} value={copy({ pl: 'Przesuń budżet', en: 'Reallocate budget' })} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('metric-controlled')).toHaveTextContent('Przychód');

    await expect(canvas.getByTestId('metric-states').children).toHaveLength(4);
    await expect(canvas.getByTestId('metric-emphasis').children).toHaveLength(2);
  },
};
