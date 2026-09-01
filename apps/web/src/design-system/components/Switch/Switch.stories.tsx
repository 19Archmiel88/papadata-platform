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
  Switch,
} from './Switch';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/Switch',
  component: Switch,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    checked: true,
    label: 'Powiadomienia e-mail',
    onChange: fn(),
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    pending: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Switch>;

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
      className="pd-switch-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const stackStyle = { display: 'grid', gap: 'var(--pd-space-4)' } as const;

export const SwitchStory: Story = {
  name: 'Switch',
  render: (args) => (
    <StoryPresentationPage
      className="pd-switch-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Switch', en: 'Switch parameters' })}
          items={[
            { label: <Localized pl="Rola ARIA" en="ARIA role" />, value: 'switch' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="switch"
      summary={
        <Localized
          pl="Ustawienie, które działa natychmiast po przełączeniu — bez osobnego przycisku Zapisz. pending pokazuje, że zmiana jest w trakcie zapisu po stronie serwera."
          en="A setting that takes effect immediately on toggle — no separate Save button. pending shows that the change is being persisted server-side."
        />
      }
      title={<Localized pl="Zmiana, która dzieje się od razu." en="A change that happens immediately." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="switch-controlled">
          <Switch {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Stany" en="States" />}>
        <div data-testid="switch-states" style={stackStyle}>
          <Switch checked={false} label={copy({ pl: 'Wyłączony', en: 'Off' })} onChange={fn()} />
          <Switch checked helperText={copy({ pl: 'Zmiany zapisują się automatycznie.', en: 'Changes save automatically.' })} label={copy({ pl: 'Włączony z pomocą', en: 'On with helper' })} onChange={fn()} />
          <Switch checked pending label={copy({ pl: 'Zapisywanie…', en: 'Saving…' })} onChange={fn()} />
          <Switch checked disabled label={copy({ pl: 'Zablokowany', en: 'Disabled' })} onChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('switch-controlled').querySelector('input');
    await expect(controlled).toHaveAttribute('role', 'switch');
    await expect(controlled).toBeChecked();

    await expect(canvas.getByTestId('switch-states').children).toHaveLength(4);
  },
};
