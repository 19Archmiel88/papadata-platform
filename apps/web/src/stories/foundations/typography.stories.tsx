import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  AppHeader,
  PageHeader,
  Surface,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';

function TypographyReference() {
  return (
    <div
      className="pds-brand-surface pds-foundation-stage"
      data-theme="dark"
      lang="pl"
    >
      <AppHeader />
      <main className="pds-foundation-main">
        <PageHeader
          eyebrow="Podstawy marki"
          text="Skala typografii jest spokojna, czytelna i bez ujemnych odstępów liter."
          title="Typografia"
        />
        <Surface style={{ display: 'grid', gap: '1rem', padding: '1.25rem' }}>
          <PageHeader
            text="Nagłówek strony dla ekranów i najważniejszych wzorców."
            title="Dashboard"
          />
          <PageHeader
            heading="h2"
            text="Nagłówek sekcji dla paneli, formularzy i stanów."
            title="Potwierdź adres e-mail"
          />
          <p style={{ color: 'var(--pds-text-muted)', lineHeight: 1.65, margin: 0 }}>
            Tekst akapitowy opisuje wpływ, ograniczenia i następny krok bez
            pokazywania szczegółów technicznych użytkownikowi.
          </p>
        </Surface>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/01 Podstawy marki/Typografia',
  component: TypographyReference,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TypographyReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SkalaTypografii: Story = {
  name: 'Skala typografii',
};
