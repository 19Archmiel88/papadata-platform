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
  Select,
} from './Select';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const shortOptions = [
  { label: 'Ostatnie 7 dni', value: '7d' },
  { label: 'Ostatnie 30 dni', value: '30d' },
  { label: 'Ostatnie 90 dni', value: '90d' },
];

const longOptions = Array.from({ length: 24 }, (_, index) => ({
  label: `Kampania ${String(index + 1).padStart(2, '0')}`,
  value: `campaign-${index + 1}`,
}));

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/Select',
  component: Select,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    label: 'Zakres dat',
    options: shortOptions,
    placeholder: 'Wybierz zakres',
    value: '30d',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
    searchable: { control: 'boolean' },
  },
} satisfies Meta<typeof Select>;

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
      className="pd-select-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const stackStyle = { display: 'grid', gap: 'var(--pd-space-6)', maxWidth: '320px' } as const;

export const SelectStory: Story = {
  name: 'Select',
  render: (args) => (
    <StoryPresentationPage
      className="pd-select-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Select', en: 'Select parameters' })}
          items={[
            { label: <Localized pl="searchable" en="searchable" />, value: copy({ pl: 'włącza się automatycznie przy wielu opcjach', en: 'auto-enables with many options' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="select"
      summary={
        <Localized
          pl="Wybór dokładnie jednej wartości z zamkniętej listy. searchable dodaje pole filtrowania wewnątrz listy — przydatne, gdy opcji jest wiele, jak w wariancie z długą listą poniżej."
          en="Exactly one value from a closed list. searchable adds an in-list filter field — useful when there are many options, like the long-list variant below."
        />
      }
      title={<Localized pl="Jedna wartość z zamkniętej listy." en="One value from a closed list." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="select-controlled" style={stackStyle}>
          <Select {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Długa lista z wyszukiwaniem" en="Long list with search" />}>
        <div data-testid="select-searchable" style={stackStyle}>
          <Select label={copy({ pl: 'Kampania', en: 'Campaign' })} options={longOptions} placeholder={copy({ pl: 'Wybierz kampanię', en: 'Choose campaign' })} searchable value="campaign-3" />
        </div>
      </StorySection>

      <StorySection index="03" title={<Localized pl="Stany" en="States" />}>
        <div data-testid="select-states" style={stackStyle}>
          <Select invalid label={copy({ pl: 'Wymagany zakres', en: 'Required range' })} message={copy({ pl: 'Wybierz zakres dat.', en: 'Choose a date range.' })} options={shortOptions} placeholder={copy({ pl: 'Wybierz zakres', en: 'Choose range' })} value={null} />
          <Select disabled label={copy({ pl: 'Zablokowany', en: 'Disabled' })} options={shortOptions} placeholder={copy({ pl: 'Wybierz zakres', en: 'Choose range' })} value="30d" />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('select-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('select-searchable')).toBeInTheDocument();
    await expect(canvas.getByTestId('select-states').children).toHaveLength(2);
  },
};
