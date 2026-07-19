import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  AppHeader,
  Button,
  InlineNotice,
  PageHeader,
  Surface,
  TextField,
  ValidationMessage,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';

type MessageStageProps = {
  children?: ReactNode;
  theme: 'light' | 'dark';
};

function MessageStage({ children, theme }: MessageStageProps) {
  return (
    <div
      className="pds-brand-surface pds-foundation-stage"
      data-theme={theme}
      lang="pl"
    >
      <AppHeader />
      <main className="pds-foundation-main">
        {children}
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/02 Komponenty/Komunikaty',
  component: MessageStage,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
  args: {
    theme: 'dark',
  },
} satisfies Meta<typeof MessageStage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Informacyjne: Story = {
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Komunikat informacyjny" />
      <InlineNotice title="Dane są sprawdzane" tone="info">
        PapaData pokaże KPI po zakończeniu oceny gotowości danych.
      </InlineNotice>
    </MessageStage>
  ),
};

export const Sukces: Story = {
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Komunikat sukcesu" />
      <InlineNotice title="Kod potwierdzony" tone="success">
        Adres e-mail został potwierdzony i proces może przejść dalej.
      </InlineNotice>
    </MessageStage>
  ),
};

export const Ostrzezenia: Story = {
  name: 'Ostrzeżenia',
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Ostrzeżenie" />
      <InlineNotice title="Dane są częściowe" tone="warning">
        Brak jednego źródła wpływa na interpretację wyniku.
      </InlineNotice>
    </MessageStage>
  ),
};

export const ErrorMessages: Story = {
  name: 'Błędy',
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Błąd" />
      <InlineNotice title="Nie udało się zsynchronizować danych" tone="error">
        Możesz bezpiecznie ponowić próbę, ponieważ operacja jest idempotentna.
      </InlineNotice>
    </MessageStage>
  ),
};

export const ValidationMessages: Story = {
  name: 'Komunikaty walidacji',
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Błąd walidacji pola" />
      <TextField
        invalid
        label="Adres e-mail"
        type="email"
        validationMessage="Podaj adres w domenie organizacji."
      />
    </MessageStage>
  ),
};

export const KomunikatPodFormularzem: Story = {
  name: 'Komunikat pod formularzem',
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Komunikat pod formularzem" />
      <Surface style={{ display: 'grid', gap: '1rem', maxWidth: '33rem', padding: '1rem' }}>
        <TextField label="Workspace" />
        <InlineNotice tone="warning">
          Nazwa jest dostępna, ale konfiguracja wymaga potwierdzenia administratora.
        </InlineNotice>
        <Button variant="primary">Kontynuuj</Button>
      </Surface>
    </MessageStage>
  ),
};

export const KomunikatGlobalny: Story = {
  name: 'Komunikat globalny',
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Komunikat globalny" />
      <InlineNotice title="Sesja wygasła" tone="warning">
        Zaloguj się ponownie, aby wykonać wrażliwą operację.
      </InlineNotice>
    </MessageStage>
  ),
};

export const StanZIkona: Story = {
  name: 'Stan z ikoną',
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Stan z ikoną" />
      <InlineNotice title="Gotowe" tone="success">
        Dashboard może zostać otwarty.
      </InlineNotice>
    </MessageStage>
  ),
};

export const StanBezIkony: Story = {
  name: 'Stan bez ikony',
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Stan bez ikony" />
      <InlineNotice icon={false} tone="info">
        Krótki komunikat może działać bez ikony, jeśli kontekst jest oczywisty.
      </InlineNotice>
    </MessageStage>
  ),
};

export const ShortAndLongContent: Story = {
  name: 'Krótka i długa treść',
  render: (args) => (
    <MessageStage {...args}>
      <PageHeader title="Krótka i długa treść" />
      <InlineNotice tone="info">Kod został wysłany.</InlineNotice>
      <InlineNotice title="Dłuższy komunikat" tone="warning">
        Brak części danych reklamowych wpływa na interpretację marży, ale nie
        blokuje przeglądania zamówień i produktów z gotowych źródeł.
      </InlineNotice>
      <ValidationMessage tone="error">
        Ten kod wygasł. Wyślij nowy kod, aby kontynuować.
      </ValidationMessage>
    </MessageStage>
  ),
};
