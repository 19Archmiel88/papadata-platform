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
  Checkbox,
} from './Checkbox';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    checked: false,
    label: 'Zaakceptuj regulamin',
    onChange: fn(),
    value: 'accept',
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Checkbox>;

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
      className="pd-checkbox-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const stackStyle = { display: 'grid', gap: 'var(--pd-space-4)' } as const;

export const CheckboxStory: Story = {
  name: 'Checkbox',
  render: (args) => (
    <StoryPresentationPage
      className="pd-checkbox-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Checkbox', en: 'Checkbox parameters' })}
          items={[
            { label: <Localized pl="Stany" en="States" />, value: 'default / error / valid / disabled / indeterminate' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="checkbox"
      summary={
        <Localized
          pl="Pojedynczy wybór tak/nie w kontekście formularza. indeterminate jest stanem czysto wizualnym — sterowanym imperatywnie przez ref, nie przez atrybut checked."
          en="A single yes/no choice inside a form. indeterminate is a purely visual state — driven imperatively via ref, not the checked attribute."
        />
      }
      title={<Localized pl="Wybór, który zawsze wie, czy jest zaznaczony." en="A choice that always knows if it is checked." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="checkbox-controlled">
          <Checkbox {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany" en="States" />} summary={<Localized pl="Komunikaty helper/message towarzyszą kontroli tak samo jak w innych polach formularza." en="Helper/message copy follows the same contract as other form fields." />}>
        <div data-testid="checkbox-states" style={stackStyle}>
          <Checkbox checked={false} label={copy({ pl: 'Domyślny', en: 'Default' })} value="default" onChange={fn()} />
          <Checkbox checked helperText={copy({ pl: 'Możesz to zmienić w każdej chwili.', en: 'You can change this anytime.' })} label={copy({ pl: 'Zaznaczony z pomocą', en: 'Checked with helper' })} value="helper" onChange={fn()} />
          <Checkbox checked={false} invalid label={copy({ pl: 'Wymagane', en: 'Required' })} message={copy({ pl: 'To pole jest wymagane.', en: 'This field is required.' })} value="error" onChange={fn()} />
          <Checkbox checked indeterminate label={copy({ pl: 'Zaznacz wszystko (częściowo)', en: 'Select all (partial)' })} value="indeterminate" onChange={fn()} />
          <Checkbox checked disabled label={copy({ pl: 'Zablokowany', en: 'Disabled' })} value="disabled" onChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('checkbox-controlled').querySelector('input');
    await expect(controlled).toHaveAttribute('type', 'checkbox');

    await expect(canvas.getByTestId('checkbox-states').children).toHaveLength(5);
  },
};
