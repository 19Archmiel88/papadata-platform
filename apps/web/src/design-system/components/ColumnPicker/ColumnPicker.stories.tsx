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
  ColumnPicker,
} from './ColumnPicker';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const columns = [
  { id: 'order', label: 'Zamówienie', required: true, visible: true },
  { id: 'customer', label: 'Klient', required: false, visible: true },
  { id: 'status', label: 'Status', required: false, visible: true },
  { id: 'roas', label: 'ROAS', required: false, visible: false },
  { id: 'cac', label: 'CAC', required: false, visible: false },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/ColumnPicker',
  component: ColumnPicker,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    columns,
    label: 'Widoczne kolumny',
    maxVisible: null,
    onColumnVisibilityChange: fn(),
  },
} satisfies Meta<typeof ColumnPicker>;

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
      className="pd-column-picker-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ColumnPickerStory: Story = {
  name: 'ColumnPicker',
  render: (args) => (
    <StoryPresentationPage
      className="pd-column-picker-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ColumnPicker', en: 'ColumnPicker parameters' })}
          items={[
            { label: <Localized pl="Kolumny wymagane" en="Required columns" />, value: String(columns.filter((c) => c.required).length) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="column-picker"
      summary={
        <Localized
          pl="Lista Checkboxów sterujących widocznością kolumn tabeli. Kolumny required nie da się odznaczyć; maxVisible blokuje zaznaczanie kolejnych po osiągnięciu limitu."
          en="A list of Checkboxes controlling table column visibility. required columns cannot be unchecked; maxVisible blocks further selection once the limit is reached."
        />
      }
      title={<Localized pl="Kolumny, które użytkownik wybiera sam." en="Columns the user chooses for themselves." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="column-picker-controlled" style={{ maxWidth: '320px' }}>
          <ColumnPicker {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Z limitem widocznych kolumn" en="With a visible-column limit" />} summary={<Localized pl="Po osiągnięciu maxVisible pozostałe niewybrane kolumny są zablokowane." en="Once maxVisible is reached, remaining unselected columns are blocked." />}>
        <div data-testid="column-picker-limit" style={{ maxWidth: '320px' }}>
          <ColumnPicker columns={columns} label={copy({ pl: 'Maksymalnie 3 kolumny', en: 'Up to 3 columns' })} maxVisible={3} onColumnVisibilityChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('column-picker-controlled').querySelector('fieldset')).toBeInTheDocument();
    await expect(canvas.getByTestId('column-picker-limit')).toBeInTheDocument();
  },
};
