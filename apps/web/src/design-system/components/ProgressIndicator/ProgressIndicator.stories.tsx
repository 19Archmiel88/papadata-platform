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
  ProgressIndicator,
} from './ProgressIndicator';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/ProgressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'ProgressIndicator dokumentuje mierzalny postęp (role="progressbar") — z wartością albo w trybie indeterminate, gdy postęp jest znany, ale wartość jeszcze nie.',
      },
    },
  },
  args: {
    description: null,
    indeterminate: false,
    label: 'Import zamówień',
    max: 100,
    showValue: true,
    tone: 'neutral',
    value: 62,
  },
  argTypes: {
    description: { control: 'text' },
    indeterminate: { control: 'boolean' },
    label: { control: 'text' },
    max: { control: 'number' },
    showValue: { control: 'boolean' },
    tone: { control: 'inline-radio', options: ['neutral', 'success', 'warning', 'critical'] },
    value: { control: 'number' },
  },
} satisfies Meta<typeof ProgressIndicator>;

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
      className="pd-progress-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ProgressIndicatorStory: Story = {
  name: 'ProgressIndicator',
  render: (args) => (
    <StoryPresentationPage
      className="pd-progress-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ProgressIndicator', en: 'ProgressIndicator parameters' })}
          items={[
            { label: <Localized pl="Rola ARIA" en="ARIA role" />, value: 'progressbar' },
            { label: <Localized pl="Odcienie" en="Tones" />, value: 'neutral / success / warning / critical' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="progress-indicator"
      summary={
        <Localized
          pl="Dla synchronizacji, importów i backfilli, gdzie znamy skalę operacji. Gdy skala nie jest znana, użyj trybu indeterminate zamiast zgadywać wartość."
          en="For syncs, imports and backfills where the scale of the operation is known. When the scale is unknown, use indeterminate mode instead of guessing a value."
        />
      }
      title={<Localized pl="Postęp, który można zmierzyć." en="Progress you can measure." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Kontrolowany" en="Controlled" />}
      >
        <div data-testid="progress-controlled" style={{ maxWidth: '420px' }}>
          <ProgressIndicator {...args} />
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Odcienie" en="Tones" />}
        summary={<Localized pl="Odcień odzwierciedla wynik operacji, nie jej ważność." en="Tone reflects the operation's outcome, not its importance." />}
      >
        <div data-testid="progress-tones" style={{ display: 'grid', gap: 'var(--pd-space-4)', maxWidth: '420px' }}>
          <ProgressIndicator description={null} indeterminate={false} label={copy({ pl: 'Synchronizacja', en: 'Sync' })} max={100} showValue tone="neutral" value={44} />
          <ProgressIndicator description={null} indeterminate={false} label={copy({ pl: 'Import zakończony', en: 'Import complete' })} max={100} showValue tone="success" value={100} />
          <ProgressIndicator description={copy({ pl: '189 rekordów odrzuconych', en: '189 records rejected' })} indeterminate={false} label={copy({ pl: 'Walidacja z ostrzeżeniami', en: 'Validation with warnings' })} max={1030} showValue tone="warning" value={841} />
          <ProgressIndicator description={copy({ pl: 'Provider nie odpowiada', en: 'Provider is not responding' })} indeterminate={false} label={copy({ pl: 'Pobranie przerwane', en: 'Fetch interrupted' })} max={100} showValue tone="critical" value={18} />
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Indeterminate" en="Indeterminate" />}
        summary={<Localized pl="Postęp trwa, ale wartość liczbowa nie jest jeszcze znana." en="Progress is happening, but a numeric value is not known yet." />}
      >
        <div data-testid="progress-indeterminate" style={{ maxWidth: '420px' }}>
          <ProgressIndicator description={null} indeterminate label={copy({ pl: 'Łączenie z Google Ads…', en: 'Connecting to Google Ads…' })} max={100} showValue={false} tone="neutral" value={null} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const track = canvas.getByTestId('progress-controlled').querySelector('[role="progressbar"]');
    await expect(track).toHaveAttribute('aria-valuenow', '62');
    await expect(track).toHaveAttribute('aria-valuemax', '100');

    await expect(canvas.getByTestId('progress-tones').children).toHaveLength(4);

    const indeterminateTrack = canvas.getByTestId('progress-indeterminate').querySelector('[role="progressbar"]');
    await expect(indeterminateTrack).not.toHaveAttribute('aria-valuenow');
  },
};
