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
  ComparisonChart,
} from './ComparisonChart';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const series = [
  { key: 'thisMonth', label: 'Ten miesiąc' },
  { key: 'lastMonth', label: 'Poprzedni miesiąc' },
];

const data = [
  { id: 'google-ads', label: 'Google Ads', values: { lastMonth: 8200, thisMonth: 9800 } },
  { id: 'meta-ads', label: 'Meta Ads', values: { lastMonth: 6100, thisMonth: 5400 } },
  { id: 'woocommerce', label: 'WooCommerce (organiczne)', values: { lastMonth: 11200, thisMonth: 12840 } },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/ComparisonChart',
  component: ComparisonChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    ariaLabel: 'Przychód wg kanału, ten miesiąc vs poprzedni',
    data,
    series,
    unit: 'zł',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['bar', 'grouped', 'ranking'] },
    visualStyle: { control: 'inline-radio', options: ['flat', 'vivid'] },
  },
} satisfies Meta<typeof ComparisonChart>;

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
      className="pd-comparison-chart-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ComparisonChartStory: Story = {
  name: 'ComparisonChart',
  render: (args) => (
    <StoryPresentationPage
      className="pd-comparison-chart-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ComparisonChart', en: 'ComparisonChart parameters' })}
          items={[
            { label: <Localized pl="visualStyle" en="visualStyle" />, value: 'flat (domyślny) / vivid' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="comparison-chart"
      summary={
        <Localized
          pl="Ranking kategorii wg jednej lub więcej serii — kanały, produkty, kampanie. benchmark dodaje pionową/poziomą linię odniesienia (np. cel)."
          en="A ranking of categories by one or more series — channels, products, campaigns. benchmark adds a reference line (e.g. a target)."
        />
      }
      title={<Localized pl="Ranking, który można porównać w czasie." en="A ranking you can compare over time." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="comparison-controlled" style={{ height: '280px' }}>
          <ComparisonChart {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Z linią odniesienia" en="With a reference line" />}>
        <div data-testid="comparison-benchmark" style={{ height: '280px' }}>
          <ComparisonChart ariaLabel={copy({ pl: 'Przychód wg kanału z celem', en: 'Revenue by channel with a target' })} benchmark={{ label: copy({ pl: 'Cel', en: 'Target' }), value: 9000 }} data={data} series={series} unit="zł" />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('comparison-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('comparison-benchmark')).toBeInTheDocument();
  },
};
