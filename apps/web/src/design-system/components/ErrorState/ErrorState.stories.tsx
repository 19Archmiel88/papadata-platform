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
  ErrorState,
} from './ErrorState';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'ErrorState (role="alert") opisuje, że coś naprawdę się nie udało — z kodem błędu do diagnostyki i, jeśli recoverable, akcją ponowienia. Dla braku danych bez błędu użyj EmptyState.',
      },
    },
  },
  args: {
    correlationId: 'req_8f21ac',
    errorCode: 'INTEGRATION_AUTH_EXPIRED',
    message: 'Autoryzacja Google Ads wygasła. Nowe dane nie są pobierane od 08:21.',
    onRetry: fn(),
    onSupport: fn(),
    recoverable: true,
    retryLabel: 'Połącz ponownie',
    supportLabel: 'Skontaktuj się ze wsparciem',
    title: 'Wymaga działania',
    variant: 'integration',
  },
  argTypes: {
    correlationId: { control: 'text' },
    errorCode: { control: 'text' },
    message: { control: 'text' },
    recoverable: { control: 'boolean' },
    retryLabel: { control: 'text' },
    supportLabel: { control: 'text' },
    title: { control: 'text' },
    variant: { control: 'inline-radio', options: ['data', 'permission', 'integration', 'system'] },
  },
} satisfies Meta<typeof ErrorState>;

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
      className="pd-error-state-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ErrorStateStory: Story = {
  name: 'ErrorState',
  render: (args) => (
    <StoryPresentationPage
      className="pd-error-state-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry ErrorState', en: 'ErrorState parameters' })}
          items={[
            { label: <Localized pl="Rola ARIA" en="ARIA role" />, value: 'alert' },
            { label: <Localized pl="Warianty" en="Variants" />, value: 'data / permission / integration / system' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="error-state"
      summary={
        <Localized
          pl="Każdy ErrorState niesie kod błędu do diagnostyki. Akcja ponowienia pojawia się tylko, gdy błąd jest recoverable."
          en="Every ErrorState carries an error code for diagnostics. The retry action only appears when the error is recoverable."
        />
      }
      title={<Localized pl="Błąd, który mówi co dalej." en="An error that says what happens next." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Kontrolowany" en="Controlled" />}
      >
        <div data-testid="error-state-controlled">
          <ErrorState {...args} />
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Warianty" en="Variants" />}
      >
        <div className="pd-f0-icon-groups" data-testid="error-state-variants">
          <article>
            <h3><Localized pl="data — problem z danymi" en="data — data problem" /></h3>
            <div>
              <ErrorState correlationId={null} errorCode="DATA_VALIDATION_FAILED" message={copy({ pl: '189 rekordów odrzuconych podczas walidacji.', en: '189 records rejected during validation.' })} onRetry={fn()} recoverable retryLabel={copy({ pl: 'Ponów zakres', en: 'Retry range' })} title={copy({ pl: 'Walidacja nie powiodła się', en: 'Validation failed' })} variant="data" />
            </div>
          </article>
          <article>
            <h3><Localized pl="permission — brak dostępu" en="permission — no access" /></h3>
            <div>
              <ErrorState correlationId={null} errorCode="ACCESS_DENIED" message={copy({ pl: 'Nie masz uprawnień do tego workspace.', en: 'You do not have access to this workspace.' })} onSupport={fn()} recoverable={false} title={copy({ pl: 'Brak dostępu', en: 'Access denied' })} variant="permission" />
            </div>
          </article>
          <article>
            <h3><Localized pl="system — błąd terminalny" en="system — terminal error" /></h3>
            <div>
              <ErrorState correlationId="req_11a0" errorCode="SYSTEM_UNAVAILABLE" message={copy({ pl: 'Usługa jest chwilowo niedostępna.', en: 'The service is temporarily unavailable.' })} onSupport={fn()} recoverable={false} title={copy({ pl: 'Błąd systemu', en: 'System error' })} variant="system" />
            </div>
          </article>
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('error-state-controlled').querySelector('[role="alert"]');
    await expect(controlled).toHaveAttribute('data-variant', 'integration');
    await expect(canvas.getByText(/Kod błędu: INTEGRATION_AUTH_EXPIRED/)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Połącz ponownie' })).toBeInTheDocument();

    await expect(canvas.getByTestId('error-state-variants').children).toHaveLength(3);
  },
};
