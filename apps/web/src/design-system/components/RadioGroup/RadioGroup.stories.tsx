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
  RadioGroup,
} from './RadioGroup';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const options = [
  { label: 'WooCommerce', value: 'woocommerce' },
  { label: 'Shopify', value: 'shopify' },
  { label: 'BaseLinker', helperText: 'Wymaga klucza API', value: 'baselinker' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    label: 'Źródło danych',
    onValueChange: fn(),
    options,
    value: 'woocommerce',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof RadioGroup>;

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
      className="pd-radio-group-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const stackStyle = { display: 'grid', gap: 'var(--pd-space-6)', maxWidth: '420px' } as const;

export const RadioGroupStory: Story = {
  name: 'RadioGroup',
  render: (args) => (
    <StoryPresentationPage
      className="pd-radio-group-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry RadioGroup', en: 'RadioGroup parameters' })}
          items={[
            { label: <Localized pl="Element" en="Element" />, value: '<fieldset>' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="radio-group"
      summary={
        <Localized
          pl="Wybór dokładnie jednej opcji z zamkniętego, widocznego zestawu. Gdy opcji jest dużo albo trzeba je wyszukać, użyj Select albo Combobox."
          en="Exactly one choice from a closed, always-visible set. When there are many options or they need to be searched, use Select or Combobox instead."
        />
      }
      title={<Localized pl="Jedna z kilku, zawsze widocznych opcji." en="One of a few, always visible options." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="radio-controlled" style={stackStyle}>
          <RadioGroup {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany" en="States" />}>
        <div data-testid="radio-states" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--pd-space-6)' }}>
          <RadioGroup invalid label={copy({ pl: 'Wymagany wybór', en: 'Required choice' })} message={copy({ pl: 'Wybierz jedną opcję.', en: 'Choose one option.' })} options={options} value={null} onValueChange={fn()} />
          <RadioGroup disabled label={copy({ pl: 'Zablokowana grupa', en: 'Disabled group' })} options={options} value="woocommerce" onValueChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('radio-controlled').querySelector('fieldset');
    await expect(controlled).toBeInTheDocument();
    await expect(canvas.getAllByRole('radio')).toHaveLength(options.length * 3);
  },
};
