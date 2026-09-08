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
  BulkActionBar,
} from './BulkActionBar';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const actions = [
  { id: 'export', label: 'Eksportuj' },
  { id: 'archive', label: 'Archiwizuj' },
  { destructive: true, id: 'delete', label: 'Usuń' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Dane/BulkActionBar',
  component: BulkActionBar,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    availableActions: actions,
    busyActionId: null,
    onAction: fn(),
    onClearSelection: fn(),
    selectedCount: 12,
  },
} satisfies Meta<typeof BulkActionBar>;

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
      className="pd-bulk-action-bar-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const BulkActionBarStory: Story = {
  name: 'BulkActionBar',
  render: (args) => (
    <StoryPresentationPage
      className="pd-bulk-action-bar-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry BulkActionBar', en: 'BulkActionBar parameters' })}
          items={[
            { label: <Localized pl="Kontrakt" en="Contract" />, value: 'contracts/components/bulkactionbar' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="bulk-action-bar"
      summary={
        <Localized
          pl="Pasek akcji zbiorczych nad tabelą po zaznaczeniu wierszy. Akcje destructive renderują się jako danger. busyActionId blokuje resztę akcji na czas wykonania jednej z nich."
          en="A bulk-action bar above a table after selecting rows. destructive actions render as danger. busyActionId blocks the rest of the actions while one is running."
        />
      }
      title={<Localized pl="Akcje na wielu rekordach naraz." en="Actions on many records at once." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="bulk-controlled">
          <BulkActionBar {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="W trakcie wykonania / brak zaznaczenia" en="In progress / no selection" />}>
        <div data-testid="bulk-states" style={{ display: 'grid', gap: 'var(--pd-space-4)' }}>
          <BulkActionBar availableActions={actions} busyActionId="export" selectedCount={5} onAction={fn()} onClearSelection={fn()} />
          <BulkActionBar availableActions={actions} busyActionId={null} selectedCount={0} onAction={fn()} onClearSelection={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('bulk-controlled')).toHaveTextContent('12 zaznaczonych rekordów');

    await expect(canvas.getByTestId('bulk-states').children).toHaveLength(2);
  },
};
