import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Building2,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import {
  ActionArrow,
  AppHeader,
  Button,
  EmptyState,
  ErrorState,
  InlineNotice,
  PageHeader,
  PasswordField,
  ProviderButton,
  StatusBadge,
  Surface,
  TextField,
  VerificationCodeInput,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';

type PatternStageProps = {
  children?: ReactNode;
  theme: 'light' | 'dark';
};

function PatternStage({ children, theme }: PatternStageProps) {
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
  title: 'PapaData/03 Wzorce',
  component: PatternStage,
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
} satisfies Meta<typeof PatternStage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FormularzLogowania: Story = {
  name: 'Formularz logowania',
  render: (args) => (
    <PatternStage {...args}>
      <Surface style={{ display: 'grid', gap: '1rem', maxWidth: '28rem', padding: '1.25rem' }}>
        <PageHeader
          heading="h2"
          text="Użyj służbowego adresu e-mail lub konta firmowego."
          title="Zaloguj się do PapaData"
        />
        <TextField
          icon={<Mail aria-hidden="true" size={18} />}
          label="Adres e-mail"
          type="email"
        />
        <PasswordField label="Hasło" />
        <Button iconAfter={<ActionArrow />} type="submit" variant="primary">
          Zaloguj się
        </Button>
      </Surface>
    </PatternStage>
  ),
};

export const FormularzKoduJednorazowego: Story = {
  name: 'Formularz kodu jednorazowego',
  render: (args) => (
    <PatternStage {...args}>
      <Surface style={{ display: 'grid', gap: '1rem', maxWidth: '33rem', padding: '1.25rem' }}>
        <PageHeader
          heading="h2"
          text="Kod wysłaliśmy na a***@northstar.example."
          title="Potwierdź adres e-mail"
        />
        <CodePattern />
        <InlineNotice tone="info">Kod oczekuje na potwierdzenie.</InlineNotice>
        <Button iconAfter={<ActionArrow />} variant="primary">
          Potwierdź adres
        </Button>
      </Surface>
    </PatternStage>
  ),
};

export const WyborKontekstu: Story = {
  name: 'Wybór kontekstu',
  render: (args) => (
    <PatternStage {...args}>
      <PageHeader
        eyebrow="Kontekst"
        text="Użytkownik wybiera tylko dostępny tenant i workspace."
        title="Wybór kontekstu"
      />
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))' }}>
        <Surface style={{ display: 'grid', gap: '0.5rem', padding: '1rem' }}>
          <StatusBadge status="active" />
          <strong>Northstar Retail</strong>
          <span>Tenant aktywny</span>
        </Surface>
        <Surface style={{ display: 'grid', gap: '0.5rem', padding: '1rem' }}>
          <StatusBadge status="ready" />
          <strong>Northstar Commerce</strong>
          <span>Workspace gotowy</span>
        </Surface>
      </div>
    </PatternStage>
  ),
};

export const WyborDostawcy: Story = {
  name: 'Wybór dostawcy',
  render: (args) => (
    <PatternStage {...args}>
      <PageHeader
        eyebrow="Integracja"
        text="Dostawca pochodzi z katalogu MVP."
        title="Wybór dostawcy"
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <ProviderButton provider="google">Google</ProviderButton>
        <ProviderButton provider="microsoft">Microsoft</ProviderButton>
        <Button iconBefore={<Building2 size={16} />} variant="secondary">
          Shopify
        </Button>
      </div>
    </PatternStage>
  ),
};

export const PotwierdzenieOperacji: Story = {
  name: 'Potwierdzenie operacji',
  render: (args) => (
    <PatternStage {...args}>
      <Surface style={{ display: 'grid', gap: '1rem', maxWidth: '33rem', padding: '1.25rem' }}>
        <PageHeader
          heading="h2"
          text="Ponowne uwierzytelnienie dotyczy tylko bieżącego celu."
          title="Potwierdź wrażliwą akcję"
        />
        <PasswordField label="Hasło" />
        <InlineNotice tone="warning">
          Ta akcja wymaga świadomego potwierdzenia użytkownika.
        </InlineNotice>
        <Button iconAfter={<ActionArrow />} variant="primary">
          Potwierdź akcję
        </Button>
      </Surface>
    </PatternStage>
  ),
};

export const PustyStan: Story = {
  name: 'Pusty stan',
  render: (args) => (
    <PatternStage {...args}>
      <EmptyState
        action={<Button variant="secondary">Połącz źródło danych</Button>}
        text="Po pierwszej synchronizacji pokażemy KPI i ograniczenia."
        title="Brak danych"
      />
    </PatternStage>
  ),
};

export const StanBledu: Story = {
  name: 'Stan błędu',
  render: (args) => (
    <PatternStage {...args}>
      <ErrorState
        action={<Button variant="secondary">Spróbuj ponownie</Button>}
        text="Ostatnia synchronizacja nie zakończyła się powodzeniem."
        title="Błąd synchronizacji"
      />
    </PatternStage>
  ),
};

export const StanBrakuDostepu: Story = {
  name: 'Stan braku dostępu',
  render: (args) => (
    <PatternStage {...args}>
      <ErrorState
        icon={<ShieldAlert aria-hidden="true" size={28} />}
        text="Nie masz uprawnień do tego workspace."
        title="Brak dostępu"
      />
    </PatternStage>
  ),
};

function CodePattern() {
  const [value, setValue] = useState('123');

  return (
    <VerificationCodeInput
      hint="Wpisz dokładnie sześć cyfr."
      id="pattern-code"
      label="Kod weryfikacyjny"
      name="pattern-code"
      onChange={setValue}
      value={value}
    />
  );
}
