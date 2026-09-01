import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  PaginationNav,
} from './PaginationNav';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Nawigacja/PaginationNav',
  component: PaginationNav,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    cursor: 'evt_9284',
    loading: false,
    nextCursor: 'evt_9310',
    onNavigate: fn(),
    previousCursor: 'evt_9256',
    summary: '25 zdarzeń w bieżącym zakresie',
  },
  argTypes: {
    loading: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof PaginationNav>;

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
      className="pd-pagination-nav-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const PaginationNavStory: Story = {
  name: 'PaginationNav',
  render: (args) => (
    <StoryPresentationPage
      className="pd-pagination-nav-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry PaginationNav', en: 'PaginationNav parameters' })}
          items={[
            { label: <Localized pl="Model" en="Model" />, value: copy({ pl: 'kursor poprzedni/następny', en: 'previous/next cursor' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="pagination-nav"
      summary={
        <Localized
          pl="Nawigacja po zbiorach bez policzalnego total (logi synchronizacji, strumienie zdarzeń). Gdy total jest znany i policzalny, użyj Pagination."
          en="Navigation over datasets without a countable total (sync logs, event streams). When the total is known and countable, use Pagination."
        />
      }
      title={<Localized pl="Zakres bez znanego końca." en="A range without a known end." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="pagination-nav-controlled">
          <PaginationNav {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Ładowanie / brak dalszych wyników" en="Loading / no further results" />}>
        <div data-testid="pagination-nav-states" style={{ display: 'grid', gap: 'var(--pd-space-4)' }}>
          <PaginationNav cursor="evt_100" loading nextCursor="evt_120" previousCursor={null} onNavigate={fn()} />
          <PaginationNav cursor="evt_900" loading={false} nextCursor={null} previousCursor="evt_850" summary={copy({ pl: 'Ostatnia strona wyników', en: 'Last page of results' })} onNavigate={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nav = canvas.getByTestId('pagination-nav-controlled').querySelector('nav');
    await expect(nav).toBeInTheDocument();

    await expect(canvas.getByTestId('pagination-nav-states').children).toHaveLength(2);
  },
};
