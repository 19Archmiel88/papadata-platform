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
  Combobox,
} from './Combobox';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const options = [
  { label: 'Polska', value: 'pl' },
  { label: 'Niemcy', value: 'de' },
  { label: 'Francja', value: 'fr' },
  { label: 'Hiszpania', disabled: true, value: 'es' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/Combobox',
  component: Combobox,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    label: 'Kraj wysyłki',
    options,
    placeholder: 'Wybierz kraj',
    value: 'pl',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
    readOnly: { control: 'boolean' },
  },
} satisfies Meta<typeof Combobox>;

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
      className="pd-combobox-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const stackStyle = { display: 'grid', gap: 'var(--pd-space-6)', maxWidth: '320px' } as const;

export const ComboboxStory: Story = {
  name: 'Combobox',
  render: (args) => (
    <StoryPresentationPage
      className="pd-combobox-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Combobox', en: 'Combobox parameters' })}
          items={[
            { label: <Localized pl="Rola ARIA" en="ARIA role" />, value: 'combobox + listbox' },
            { label: <Localized pl="Klawiatura" en="Keyboard" />, value: '↑ ↓ Enter Esc' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="combobox"
      summary={
        <Localized
          pl="Select + filtrowanie tekstem. Gdy nie trzeba wyszukiwać wśród opcji, użyj zwykłego Select — Combobox niesie dodatkowy koszt interakcji."
          en="Select + text filtering. When searching among options is unnecessary, use plain Select instead — Combobox carries extra interaction cost."
        />
      }
      title={<Localized pl="Wybór, który można przefiltrować pisaniem." en="A choice you can filter by typing." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="combobox-controlled" style={stackStyle}>
          <Combobox {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany" en="States" />}>
        <div data-testid="combobox-states" style={stackStyle}>
          <Combobox invalid label={copy({ pl: 'Wymagany kraj', en: 'Required country' })} message={copy({ pl: 'Wybierz kraj z listy.', en: 'Choose a country from the list.' })} options={options} placeholder={copy({ pl: 'Wybierz kraj', en: 'Choose country' })} value={null} />
          <Combobox disabled label={copy({ pl: 'Zablokowany', en: 'Disabled' })} options={options} placeholder={copy({ pl: 'Wybierz kraj', en: 'Choose country' })} value="pl" />
          <Combobox label={copy({ pl: 'Brak wyników', en: 'No results' })} options={[]} placeholder={copy({ pl: 'Wybierz kraj', en: 'Choose country' })} value={null} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByTestId('combobox-controlled').querySelector('input[role="combobox"]');
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await expect(canvas.getByTestId('combobox-states').children).toHaveLength(3);
  },
};
