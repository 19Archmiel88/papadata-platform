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
  SearchField,
} from './SearchField';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/SearchField',
  component: SearchField,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    debounceMs: 250,
    label: 'Szukaj zamówień',
    loading: false,
    onQueryChange: fn(),
    placeholder: 'Numer zamówienia, klient…',
    query: '',
    resultCount: null,
  },
  argTypes: {
    debounceMs: { control: 'number' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    loading: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof SearchField>;

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
      className="pd-search-field-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const stackStyle = { display: 'grid', gap: 'var(--pd-space-4)', maxWidth: '360px' } as const;

export const SearchFieldStory: Story = {
  name: 'SearchField',
  render: (args) => (
    <StoryPresentationPage
      className="pd-search-field-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry SearchField', en: 'SearchField parameters' })}
          items={[
            { label: <Localized pl="Debounce" en="Debounce" />, value: `${args.debounceMs}ms` },
            { label: <Localized pl="Rozmiary" en="Sizes" />, value: 'default / compact' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="search-field"
      summary={
        <Localized
          pl="onQueryChange odpala się po debounceMs od ostatniego wpisu. onChange (surowy event) i onClear pozwalają na integrację z lokalnym stanem draft."
          en="onQueryChange fires debounceMs after the last keystroke. onChange (raw event) and onClear allow integration with local draft state."
        />
      }
      title={<Localized pl="Wyszukiwanie, które czeka, aż skończysz pisać." en="Search that waits until you stop typing." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="search-controlled" style={stackStyle}>
          <SearchField {...args} onClear={fn()} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany" en="States" />}>
        <div data-testid="search-states" style={stackStyle}>
          <SearchField debounceMs={250} label={copy({ pl: 'Wyniki', en: 'Results' })} loading={false} placeholder={copy({ pl: 'Szukaj…', en: 'Search…' })} query="WooCommerce" resultCount={12} onClear={fn()} onQueryChange={fn()} />
          <SearchField debounceMs={250} label={copy({ pl: 'Wyszukiwanie w toku', en: 'Search in progress' })} loading placeholder={copy({ pl: 'Szukaj…', en: 'Search…' })} query="Google" resultCount={null} onClear={fn()} onQueryChange={fn()} />
          <SearchField debounceMs={250} disabled label={copy({ pl: 'Zablokowane', en: 'Disabled' })} loading={false} placeholder={copy({ pl: 'Szukaj…', en: 'Search…' })} query="" resultCount={null} onClear={fn()} onQueryChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByTestId('search-controlled').querySelector('input[type="search"]');
    await expect(input).toBeInTheDocument();

    await expect(canvas.getByTestId('search-states').children).toHaveLength(3);
  },
};
