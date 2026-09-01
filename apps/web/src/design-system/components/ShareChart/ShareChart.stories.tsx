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
  ShareChart,
} from './ShareChart';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const segments = [
  { id: 'organic', label: 'Organiczne', percent: 0.46, value: 130432 },
  { id: 'google-ads', label: 'Google Ads', percent: 0.31, value: 88080 },
  { id: 'meta-ads', label: 'Meta Ads', percent: 0.15, value: 42600 },
  { id: 'other', label: 'Pozostałe', percent: 0.08, value: 22720 },
];

const total = segments.reduce((sum, segment) => sum + segment.value, 0);

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Wykresy i analityka/ShareChart',
  component: ShareChart,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    ariaLabel: 'Udział przychodu wg źródła',
    segments,
    total,
  },
  argTypes: {
    display: { control: 'inline-radio', options: ['donut', 'bar', 'stacked'] },
    maxSegments: { control: 'number' },
  },
} satisfies Meta<typeof ShareChart>;

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
      className="pd-share-chart-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ShareChartStory: Story = {
  name: 'ShareChart',
  render: (args) => (
    <StoryPresentationPage
      className="pd-share-chart-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ShareChart', en: 'ShareChart parameters' })}
          items={[
            { label: <Localized pl="display" en="display" />, value: 'donut / bar / stacked' },
            { label: <Localized pl="maxSegments" en="maxSegments" />, value: copy({ pl: 'nadmiar zwija się do „Pozostałe”', en: 'overflow collapses into "Other"' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="share-chart"
      summary={
        <Localized
          pl="Udział procentowy segmentów w całości — źródła przychodu, kanały, kategorie produktów. Gdy segmentów jest więcej niż maxSegments, nadwyżka zwija się w jeden segment „Pozostałe”."
          en="The percentage share of segments in a whole — revenue sources, channels, product categories. When there are more segments than maxSegments, the overflow collapses into one “Other” segment."
        />
      }
      title={<Localized pl="Całość podzielona na części." en="A whole divided into parts." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany (donut)" en="Controlled (donut)" />}>
        <div data-testid="share-donut" style={{ height: '280px' }}>
          <ShareChart {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Wariant bar" en="Bar variant" />}>
        <div data-testid="share-bar" style={{ height: '160px' }}>
          <ShareChart ariaLabel={copy({ pl: 'Udział, wariant paskowy', en: 'Share, bar variant' })} display="bar" segments={segments} total={total} />
        </div>
      </StorySection>

      <StorySection index="03" title={<Localized pl="Z limitem segmentów" en="With a segment limit" />}>
        <div data-testid="share-limited" style={{ height: '280px' }}>
          <ShareChart ariaLabel={copy({ pl: 'Udział, maksymalnie 2 segmenty', en: 'Share, at most 2 segments' })} maxSegments={2} segments={segments} total={total} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('share-donut')).toBeInTheDocument();
    await expect(canvas.getByTestId('share-bar')).toBeInTheDocument();
    await expect(canvas.getByTestId('share-limited')).toBeInTheDocument();
  },
};
