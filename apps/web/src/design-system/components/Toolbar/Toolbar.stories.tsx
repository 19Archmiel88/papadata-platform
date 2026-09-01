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
  Toolbar,
} from './Toolbar';
import {
  Button,
} from '../Button';
import {
  SearchField,
} from '../SearchField';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Dane/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    description: 'Ostatnia aktualizacja: 18 min temu',
    title: 'Zamówienia',
  },
  argTypes: {
    compact: { control: 'boolean' },
    description: { control: 'text' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof Toolbar>;

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
      className="pd-toolbar-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ToolbarStory: Story = {
  name: 'Toolbar',
  render: (args) => (
    <StoryPresentationPage
      className="pd-toolbar-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Toolbar', en: 'Toolbar parameters' })}
          items={[
            { label: <Localized pl="Sloty" en="Slots" />, value: 'start / end' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="toolbar"
      summary={
        <Localized
          pl="Nagłówek sekcji z tytułem, opisem i dwoma slotami na akcje (start/end) — nad tabelą, listą albo panelem. Nie zawiera własnej logiki filtrów; do tego służy FilterBar."
          en="A section header with title, description and two action slots (start/end) — above a table, list or panel. Carries no filtering logic of its own; that is what FilterBar is for."
        />
      }
      title={<Localized pl="Nagłówek sekcji z miejscem na akcje." en="A section header with room for actions." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="toolbar-controlled">
          <Toolbar
            {...args}
            end={<Button size="small" variant="primary">{copy({ pl: 'Eksportuj', en: 'Export' })}</Button>}
            start={<SearchField debounceMs={250} label={copy({ pl: 'Szukaj', en: 'Search' })} loading={false} placeholder={copy({ pl: 'Szukaj…', en: 'Search…' })} query="" resultCount={null} size="compact" onQueryChange={fn()} />}
          />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Kompaktowy, bez tytułu" en="Compact, no title" />}>
        <div data-testid="toolbar-compact">
          <Toolbar compact end={<Button size="small" variant="ghost">{copy({ pl: 'Odśwież', en: 'Refresh' })}</Button>} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('toolbar-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('toolbar-compact')).toBeInTheDocument();
  },
};
