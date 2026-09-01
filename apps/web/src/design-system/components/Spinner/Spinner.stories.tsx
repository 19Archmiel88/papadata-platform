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
  Spinner,
} from './Spinner';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/Spinner',
  component: Spinner,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Spinner sygnalizuje krótką, nieoznaczoną operację w toku (role="status", aria-live="polite"). Dla operacji z mierzalnym postępem albo dłuższych niż kilka sekund użyj ProgressIndicator zamiast Spinner.',
      },
    },
  },
  args: {
    delayMs: 0,
    inline: true,
    label: 'Ładowanie',
    showLabel: false,
    size: 20,
  },
  argTypes: {
    delayMs: { control: 'number' },
    inline: { control: 'boolean' },
    label: { control: 'text' },
    showLabel: { control: 'boolean' },
    size: { control: 'number' },
  },
} satisfies Meta<typeof Spinner>;

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
      className="pd-spinner-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const SpinnerStory: Story = {
  name: 'Spinner',
  render: (args) => (
    <StoryPresentationPage
      className="pd-spinner-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Spinner', en: 'Spinner parameters' })}
          items={[
            { label: <Localized pl="Rola ARIA" en="ARIA role" />, value: 'status' },
            { label: <Localized pl="aria-live" en="aria-live" />, value: 'polite' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="spinner"
      summary={
        <Localized
          pl="Etykieta jest zawsze obecna w DOM dla technologii asystujących — showLabel steruje tylko jej widocznością wizualną."
          en="The label is always present in the DOM for assistive technology — showLabel only controls its visual visibility."
        />
      }
      title={<Localized pl="Krótkie operacje bez mierzalnego postępu." en="Short operations without measurable progress." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Kontrolowany" en="Controlled" />}
      >
        <div data-testid="spinner-controlled">
          <Spinner {...args} />
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Rozmiary" en="Sizes" />}
      >
        <div className="pd-f0-icon-line" data-testid="spinner-sizes">
          <span>
            <Spinner delayMs={0} inline label={copy({ pl: 'Ładowanie', en: 'Loading' })} size={14} />
            14px
          </span>
          <span>
            <Spinner delayMs={0} inline label={copy({ pl: 'Ładowanie', en: 'Loading' })} size={20} />
            20px
          </span>
          <span>
            <Spinner delayMs={0} inline label={copy({ pl: 'Ładowanie', en: 'Loading' })} size={32} />
            32px
          </span>
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Z widoczną etykietą" en="With a visible label" />}
        summary={<Localized pl="Używane, gdy spinner stoi samodzielnie, bez sąsiadującego kontekstu tekstowego." en="Used when the spinner stands alone, without adjacent text context." />}
      >
        <div data-testid="spinner-labelled">
          <Spinner delayMs={0} inline={false} label={copy({ pl: 'Synchronizacja danych…', en: 'Syncing data…' })} showLabel size={20} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('spinner-controlled').querySelector('.pd-spinner');
    await expect(controlled).toHaveAttribute('role', 'status');
    await expect(controlled).toHaveAttribute('aria-live', 'polite');

    await expect(canvas.getByTestId('spinner-sizes').children).toHaveLength(3);

    const labelled = canvas.getByTestId('spinner-labelled').querySelector('.pd-spinner__label');
    await expect(labelled).not.toHaveClass('pd-visually-hidden');
  },
};
