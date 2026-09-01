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
  Pagination,
} from './Pagination';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Nawigacja/Pagination',
  component: Pagination,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    onPageChange: fn(),
    page: 3,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    total: 248,
  },
  argTypes: {
    page: { control: 'number' },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    total: { control: 'number' },
  },
} satisfies Meta<typeof Pagination>;

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
      className="pd-pagination-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const PaginationStory: Story = {
  name: 'Pagination',
  render: (args) => (
    <StoryPresentationPage
      className="pd-pagination-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Pagination', en: 'Pagination parameters' })}
          items={[
            { label: <Localized pl="Model" en="Model" />, value: copy({ pl: 'numerowane strony', en: 'numbered pages' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="pagination"
      summary={
        <Localized
          pl="Numerowana paginacja dla znanego, policzalnego total. Dla wyników opartych na kursorze (np. strumienie zdarzeń) użyj PaginationNav zamiast liczenia stron."
          en="Numbered pagination for a known, countable total. For cursor-based results (e.g. event streams), use PaginationNav instead of counting pages."
        />
      }
      title={<Localized pl="Strony, które można policzyć." en="Pages you can count." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="pagination-controlled">
          <Pagination {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Nieznany total / pierwsza strona" en="Unknown total / first page" />}>
        <div data-testid="pagination-unknown" style={{ display: 'grid', gap: 'var(--pd-space-4)' }}>
          <Pagination page={1} pageSize={25} pageSizeOptions={[25]} total={null} onPageChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nav = canvas.getByTestId('pagination-controlled').querySelector('nav');
    await expect(nav).toHaveAttribute('aria-label', 'Nawigacja stron');
    await expect(canvas.getByRole('button', { name: 'Strona 3' })).toHaveAttribute('aria-current', 'page');

    await expect(canvas.getByTestId('pagination-unknown')).toBeInTheDocument();
  },
};
