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
  DataList,
} from './DataList';
import {
  TextAction,
} from '../Button';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const items = [
  { description: 'Sklep Polska · D2C', icon: 'integration' as const, id: 'woocommerce', meta: ['18 min temu', '98% kompletności'], status: { status: 'ready', text: 'Gotowe', tone: 'success' as const }, title: 'WooCommerce' },
  { action: <TextAction size="small">Otwórz</TextAction>, description: 'Paid Search PL', icon: 'trend' as const, id: 'google-ads', meta: ['6 h temu'], status: { status: 'action_required', text: 'Wymaga działania', tone: 'critical' as const }, title: 'Google Ads' },
  { description: 'Śledzenie ruchu', icon: 'data' as const, id: 'ga4', meta: ['Trwa pierwsze pobranie'], status: { status: 'syncing', text: 'Synchronizacja', tone: 'processing' as const }, title: 'Google Analytics 4' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Dane/DataList',
  component: DataList,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    items,
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
  },
} satisfies Meta<typeof DataList>;

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
      className="pd-data-list-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const DataListStory: Story = {
  name: 'DataList',
  render: (args) => (
    <StoryPresentationPage
      className="pd-data-list-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry DataList', en: 'DataList parameters' })}
          items={[
            { label: <Localized pl="Wykorzystuje" en="Uses" />, value: 'StatusBadge, Icon' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="data-list"
      summary={
        <Localized
          pl="Lista rekordów z ikoną, opisem, metadanymi, statusem i opcjonalną akcją — np. lista źródeł integracji. Gdy dane mają realne kolumny do porównania, użyj Table/DataTable zamiast listy."
          en="A record list with icon, description, metadata, status and an optional action — e.g. a list of integration sources. When data has real columns to compare, use Table/DataTable instead of a list."
        />
      }
      title={<Localized pl="Rekordy, które opowiadają o sobie same." en="Records that describe themselves." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="data-list-controlled" style={{ maxWidth: '520px' }}>
          <DataList {...args} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('data-list-controlled').querySelectorAll('li')).toHaveLength(items.length);
  },
};
