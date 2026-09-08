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
  SortControl,
} from './SortControl';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const options = [
  { id: 'date', label: 'Data' },
  { id: 'revenue', label: 'Przychód' },
  { id: 'roas', label: 'ROAS' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/SortControl',
  component: SortControl,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    direction: 'desc',
    onDirectionChange: fn(),
    onSelectedIdChange: fn(),
    options,
    selectedId: 'date',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof SortControl>;

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
      className="pd-sort-control-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const SortControlStory: Story = {
  name: 'SortControl',
  render: (args) => (
    <StoryPresentationPage
      className="pd-sort-control-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry SortControl', en: 'SortControl parameters' })}
          items={[
            { label: <Localized pl="Zbudowany z" en="Composed of" />, value: 'Menu' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="sort-control"
      summary={
        <Localized
          pl="Lokalne sortowanie (jedno pole + kierunek) dla tabel i list, gdzie sortowanie nie wymaga zapytania do serwera. Zbudowany na kanonicznym Menu."
          en="Local sort (one field + direction) for tables and lists where sorting does not require a server round-trip. Built on the canonical Menu."
        />
      }
      title={<Localized pl="Sortowanie o jednym polu na raz." en="Sorting one field at a time." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="sort-controlled">
          <SortControl {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Bez wskaźnika kierunku / zablokowany" en="Without direction toggle / disabled" />}>
        <div data-testid="sort-states" style={{ display: 'flex', gap: 'var(--pd-space-6)', flexWrap: 'wrap' }}>
          <SortControl direction={null} options={options} selectedId="date" onSelectedIdChange={fn()} />
          <SortControl direction="asc" disabled options={options} selectedId="revenue" onDirectionChange={fn()} onSelectedIdChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId('sort-controlled').querySelector('.pd-sort-control__trigger');
    await expect(trigger).toBeInTheDocument();

    await expect(canvas.getByTestId('sort-states').children).toHaveLength(2);
  },
};
