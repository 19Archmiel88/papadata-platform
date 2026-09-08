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
  InlineNotice,
} from './InlineNotice';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/InlineNotice',
  component: InlineNotice,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'InlineNotice osadza komunikat w treści strony (nie znika samoczynnie) — w przeciwieństwie do Toast, który jest tymczasowy i pojawia się globalnie. Odcień (tone) automatycznie ustawia rolę ARIA: warning/critical → alert, info/success → status.',
      },
    },
  },
  args: {
    actionLabel: null,
    dismissible: false,
    message: 'GA4 nadal pobiera historię danych — może to potrwać do 24 godzin.',
    onAction: fn(),
    onDismiss: fn(),
    title: null,
    tone: 'info',
  },
  argTypes: {
    actionLabel: { control: 'text' },
    dismissible: { control: 'boolean' },
    message: { control: 'text' },
    title: { control: 'text' },
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'critical'] },
  },
} satisfies Meta<typeof InlineNotice>;

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
      className="pd-inline-notice-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const InlineNoticeStory: Story = {
  name: 'InlineNotice',
  render: (args) => (
    <StoryPresentationPage
      className="pd-inline-notice-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry InlineNotice', en: 'InlineNotice parameters' })}
          items={[
            { label: <Localized pl="Odcienie" en="Tones" />, value: 'info / success / warning / critical' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="inline-notice"
      summary={
        <Localized
          pl="Trwały komunikat osadzony w treści — nagłówek karty, panel workspace'a albo baner integracji."
          en="A persistent message embedded in content — a card header, workspace panel, or integration banner."
        />
      }
      title={<Localized pl="Kontekst, który zostaje w widoku." en="Context that stays in view." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Kontrolowany" en="Controlled" />}
      >
        <div data-testid="notice-controlled" style={{ maxWidth: '520px' }}>
          <InlineNotice {...args} />
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Odcienie" en="Tones" />}
      >
        <div data-testid="notice-tones" style={{ display: 'grid', gap: 'var(--pd-space-4)', maxWidth: '520px' }}>
          <InlineNotice dismissible={false} message={copy({ pl: 'GA4 nadal pobiera historię danych.', en: 'GA4 is still backfilling history.' })} title={null} tone="info" />
          <InlineNotice dismissible={false} message={copy({ pl: 'Synchronizacja WooCommerce zakończona.', en: 'WooCommerce sync completed.' })} title={null} tone="success" />
          <InlineNotice dismissible={false} message={copy({ pl: 'Kompletność danych spadła poniżej 90%.', en: 'Data completeness dropped below 90%.' })} title={null} tone="warning" />
          <InlineNotice dismissible={false} message={copy({ pl: 'Google Ads wymaga ponownej autoryzacji.', en: 'Google Ads requires reauthorization.' })} onAction={fn()} actionLabel={copy({ pl: 'Połącz ponownie', en: 'Reconnect' })} title={null} tone="critical" />
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Z tytułem, akcją i zamknięciem" en="With title, action and dismiss" />}
      >
        <div data-testid="notice-full" style={{ maxWidth: '520px' }}>
          <InlineNotice actionLabel={copy({ pl: 'Napraw problem', en: 'Fix issue' })} dismissible onAction={fn()} onDismiss={fn()} message={copy({ pl: 'Google Ads wymaga ponownej autoryzacji. Nowe dane nie są pobierane od 08:21.', en: 'Google Ads requires reauthorization. New data has not been fetched since 08:21.' })} title={copy({ pl: '1 źródło wymaga akcji', en: '1 source needs action' })} tone="critical" />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('notice-controlled').querySelector('.pd-feedback-surface');
    await expect(controlled).toHaveAttribute('role', 'status');
    await expect(controlled).toHaveAttribute('data-tone', 'info');

    await expect(canvas.getByTestId('notice-tones').children).toHaveLength(4);

    const full = canvas.getByTestId('notice-full').querySelector('.pd-feedback-surface');
    await expect(full).toHaveAttribute('role', 'alert');
    await expect(full).toHaveAttribute('data-dismissible', 'true');
  },
};
