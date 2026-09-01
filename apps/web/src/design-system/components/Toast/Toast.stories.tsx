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
  Toast,
} from './Toast';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Toast to tymczasowy, globalny komunikat o wyniku akcji użytkownika — renderowany przez warstwę powiadomień powłoki produktu (layer: toast), nie osadzony w treści strony. Dla trwałego kontekstu użyj InlineNotice.',
      },
    },
  },
  args: {
    actionLabel: null,
    dismissible: true,
    durationMs: 5000,
    message: 'Zmiany zostały zapisane.',
    onAction: fn(),
    onDismiss: fn(),
    title: null,
    toastId: 'toast-demo-1',
    tone: 'success',
  },
  argTypes: {
    actionLabel: { control: 'text' },
    dismissible: { control: 'boolean' },
    durationMs: { control: 'number' },
    message: { control: 'text' },
    title: { control: 'text' },
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'critical'] },
  },
} satisfies Meta<typeof Toast>;

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
      className="pd-toast-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const ToastStory: Story = {
  name: 'Toast',
  render: (args) => (
    <StoryPresentationPage
      className="pd-toast-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Toast', en: 'Toast parameters' })}
          items={[
            { label: <Localized pl="Warstwa" en="Layer" />, value: 'toast (z-index 40)' },
            { label: <Localized pl="Odcienie" en="Tones" />, value: 'info / success / warning / critical' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="toast"
      summary={
        <Localized
          pl="Toast potwierdza wynik akcji, którą użytkownik właśnie wykonał. Nie używaj go do informacji, które muszą pozostać widoczne — do tego służy InlineNotice."
          en="Toast confirms the outcome of an action the user just took. Do not use it for information that must stay visible — that is what InlineNotice is for."
        />
      }
      title={<Localized pl="Potwierdzenie, które nie zostaje na stałe." en="Confirmation that does not stay forever." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Kontrolowany" en="Controlled" />}
      >
        <div data-testid="toast-controlled" style={{ maxWidth: '380px' }}>
          <Toast {...args} />
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Odcienie" en="Tones" />}
      >
        <div data-testid="toast-tones" style={{ display: 'grid', gap: 'var(--pd-space-3)', maxWidth: '380px' }}>
          <Toast dismissible durationMs={4000} message={copy({ pl: 'Synchronizacja zaplanowana.', en: 'Sync scheduled.' })} onDismiss={fn()} title={null} toastId="toast-info" tone="info" />
          <Toast dismissible durationMs={4000} message={copy({ pl: 'Zmiany zostały zapisane.', en: 'Changes saved.' })} onDismiss={fn()} title={null} toastId="toast-success" tone="success" />
          <Toast dismissible durationMs={null} message={copy({ pl: 'Część rekordów wymaga przeglądu.', en: 'Some records need review.' })} onDismiss={fn()} title={null} toastId="toast-warning" tone="warning" />
          <Toast dismissible durationMs={null} message={copy({ pl: 'Nie udało się zapisać zmian.', en: 'Failed to save changes.' })} onAction={fn()} actionLabel={copy({ pl: 'Ponów', en: 'Retry' })} onDismiss={fn()} title={null} toastId="toast-critical" tone="critical" />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('toast-controlled').querySelector('.pd-toast');
    await expect(controlled).toHaveAttribute('data-toast-id', 'toast-demo-1');
    await expect(controlled).toHaveAttribute('data-duration-ms', '5000');
    await expect(controlled).toHaveAttribute('data-dismissible', 'true');

    await expect(canvas.getByTestId('toast-tones').children).toHaveLength(4);
  },
};
