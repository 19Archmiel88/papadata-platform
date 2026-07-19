import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  CalendarDays,
  CreditCard,
  Mail,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';

import {
  ActionArrow,
  AppHeader,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  PasswordField,
  ProviderButton,
  StatusBadge,
  StepIndicator,
  Surface,
  TextField,
  VerificationCodeInput,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';

type ComponentStageProps = {
  children?: ReactNode;
  theme: 'light' | 'dark';
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
};

const rowStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

function ComponentStage({ children, theme }: ComponentStageProps) {
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
  title: 'PapaData/02 Komponenty',
  component: ComponentStage,
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
} satisfies Meta<typeof ComponentStage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Przyciski: Story = {
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Komponenty"
        text="Jeden zestaw akcji: primary, secondary, ghost i danger."
        title="Przyciski"
      />
      <div style={rowStyle}>
        <Button iconAfter={<ActionArrow />} variant="primary">
          Kontynuuj
        </Button>
        <Button iconBefore={<RefreshCw size={16} />} variant="secondary">
          Odśwież
        </Button>
        <Button variant="ghost">Anuluj</Button>
        <Button variant="danger">Usuń dostęp</Button>
        <Button disabled variant="primary">
          Nieaktywny
        </Button>
        <Button loading variant="primary">
          Przetwarzanie
        </Button>
      </div>
    </ComponentStage>
  ),
};

export const PolaFormularzy: Story = {
  name: 'Pola formularzy',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Formularze"
        text="Pola tekstowe mają wspólną wysokość, focus i komunikat walidacji."
        title="Pola formularzy"
      />
      <div style={gridStyle}>
        <TextField
          defaultValue="anna@northstar.example"
          icon={<Mail size={18} />}
          label="Adres e-mail"
          type="email"
        />
        <TextField
          helper="Użyj nazwy widocznej dla zespołu."
          label="Nazwa workspace"
          placeholder="Northstar Commerce"
        />
        <TextField
          invalid
          label="Domena"
          validationMessage="Domena musi należeć do organizacji."
        />
      </div>
    </ComponentStage>
  ),
};

export const PasswordFieldStory: Story = {
  name: 'Pole hasła',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Formularze"
        text="Pole hasła korzysta z tej samej ramy kontrolki i ma dostępny przełącznik widoczności."
        title="Pole hasła"
      />
      <div style={gridStyle}>
        <PasswordField
          autoComplete="current-password"
          label="Hasło"
        />
        <PasswordField
          autoComplete="new-password"
          helper="Minimum wynika z polityki workspace."
          label="Nowe hasło"
        />
      </div>
    </ComponentStage>
  ),
};

export const KodJednorazowy: Story = {
  name: 'Kod jednorazowy',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Formularze"
        text="Sześć segmentów kodu jest jedyną geometrią używaną w auth."
        title="Kod jednorazowy"
      />
      <div style={gridStyle}>
        <CodeExample id="code-empty" label="Kod pusty" value="" />
        <CodeExample id="code-partial" label="Kod częściowy" value="123" />
        <CodeExample id="code-invalid" invalid label="Kod błędny" value="" />
      </div>
    </ComponentStage>
  ),
};

export const StatusyIOdznaki: Story = {
  name: 'Statusy i odznaki',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Status"
        text="Każdy status ma ikonę i tekst, więc kolor nie jest jedynym nośnikiem znaczenia."
        title="Statusy i odznaki"
      />
      <div style={rowStyle}>
        <StatusBadge status="active" />
        <StatusBadge status="ready" />
        <StatusBadge status="pending" />
        <StatusBadge status="inProgress" />
        <StatusBadge status="delayed" />
        <StatusBadge status="warning" />
        <StatusBadge status="error" />
        <StatusBadge status="blocked" />
        <StatusBadge status="inactive" />
        <StatusBadge status="noData" />
      </div>
    </ComponentStage>
  ),
};

export const Nawigacja: Story = {
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Nawigacja"
        text="Kontrolki nawigacyjne używają tych samych tokenów focus, promienia i obramowań."
        title="Nawigacja"
      />
      <div style={rowStyle}>
        <Button iconBefore={<Search size={16} />} variant="secondary">
          Szukaj
        </Button>
        <Button iconBefore={<CalendarDays size={16} />} variant="secondary">
          Ostatnie 30 dni
        </Button>
        <Button iconBefore={<Bell size={16} />} variant="ghost">
          Alerty
        </Button>
        <Button iconBefore={<Settings size={16} />} variant="ghost">
          Ustawienia
        </Button>
      </div>
    </ComponentStage>
  ),
};

export const HeadersStory: Story = {
  name: 'Nagłówki',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Nagłówek strony"
        text="Nagłówki ekranów i wzorców mają tę samą hierarchię oraz bezpieczne łamanie długiego tekstu."
        title="Potwierdź adres e-mail"
      />
      <PageHeader
        heading="h2"
        text="Kompaktowy nagłówek do formularzy i paneli."
        title="Sekcja formularza"
      />
    </ComponentStage>
  ),
};

export const KartyIPowierzchnie: Story = {
  name: 'Karty i powierzchnie',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Powierzchnie"
        text="Karty są używane dla powtarzalnych elementów i paneli, bez ciężkich cieni."
        title="Karty i powierzchnie"
      />
      <div style={gridStyle}>
        <Surface style={{ display: 'grid', gap: '0.5rem', padding: '1rem' }}>
          <StatusBadge status="ready" />
          <strong>Northstar Commerce</strong>
          <span>Dane sprzedażowe kompletne dla zakresu.</span>
        </Surface>
        <Surface
          style={{ display: 'grid', gap: '0.5rem', padding: '1rem' }}
          variant="subtle"
        >
          <StatusBadge status="warning" />
          <strong>Kampanie płatne</strong>
          <span>Brak jednego źródła wpływa na interpretację.</span>
        </Surface>
      </div>
    </ComponentStage>
  ),
};

export const WskaznikiPostepu: Story = {
  name: 'Wskaźniki postępu',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Postęp"
        text="Wskaźnik obsługuje krok gotowy, aktywny i oczekujący."
        title="Wskaźniki postępu"
      />
      <StepIndicator
        currentIndex={1}
        steps={[
          {
            icon: <UserRoundCheck aria-hidden="true" size={15} />,
            key: 'konto',
            label: 'Konto',
          },
          {
            icon: <ShieldCheck aria-hidden="true" size={15} />,
            key: 'weryfikacja',
            label: 'Weryfikacja',
          },
          {
            icon: <CreditCard aria-hidden="true" size={15} />,
            key: 'dostep',
            label: 'Dostęp',
          },
        ]}
      />
    </ComponentStage>
  ),
};

export const StanyLadowania: Story = {
  name: 'Stany ładowania',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Stany"
        text="Stany systemowe mają wspólny układ i pozostają czytelne w light oraz dark."
        title="Stany ładowania"
      />
      <div style={gridStyle}>
        <LoadingState
          text="Sprawdzamy gotowość danych dla wybranego workspace."
          title="Trwa sprawdzanie"
        />
        <EmptyState
          text="Po połączeniu źródła danych pokażemy pierwsze KPI."
          title="Brak danych"
        />
        <ErrorState
          action={<Button variant="secondary">Spróbuj ponownie</Button>}
          text="Synchronizacja nie zakończyła się powodzeniem."
          title="Nie udało się pobrać danych"
        />
      </div>
    </ComponentStage>
  ),
};

export const PrzyciskiDostawcow: Story = {
  name: 'Wybór dostawcy',
  render: (args) => (
    <ComponentStage {...args}>
      <PageHeader
        eyebrow="Dostawcy"
        text="Google i Microsoft używają jednego komponentu przycisku dostawcy."
        title="Wybór dostawcy"
      />
      <div style={rowStyle}>
        <ProviderButton provider="google">Google</ProviderButton>
        <ProviderButton provider="microsoft">Microsoft</ProviderButton>
      </div>
    </ComponentStage>
  ),
};

function CodeExample({
  id,
  invalid = false,
  label,
  value: initialValue,
}: {
  id: string;
  invalid?: boolean;
  label: string;
  value: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <VerificationCodeInput
      errorMessage={invalid ? 'Kod jest nieprawidłowy.' : undefined}
      hint={invalid ? undefined : 'Wpisz dokładnie sześć cyfr.'}
      id={id}
      invalid={invalid}
      label={label}
      name={id}
      onChange={setValue}
      value={value}
    />
  );
}
