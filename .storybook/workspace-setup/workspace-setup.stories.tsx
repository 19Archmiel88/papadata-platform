import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  FileCheck2,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Store,
  Waypoints,
} from 'lucide-react';
import type { ComponentType } from 'react';

import '../foundations/papadata-brand-surface.css';
import './workspace-setup.css';

type WorkspaceSurface =
  | 'selection'
  | 'creation'
  | 'company'
  | 'business'
  | 'dataSource'
  | 'status'
  | 'preparation'
  | 'blocked';

type WorkspaceSurfaceDefinition = {
  accent: string;
  action: string;
  cards: Array<{
    description: string;
    label: string;
    status: 'ready' | 'waiting' | 'blocked';
    title: string;
  }>;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  kicker: string;
  sideTitle: string;
  summary: string;
  title: string;
};

const workspaceSurfaces: Record<
  WorkspaceSurface,
  WorkspaceSurfaceDefinition
> = {
  selection: {
    accent: 'oklch(68% 0.13 188)',
    action: 'Wybierz workspace',
    icon: Waypoints,
    kicker: 'Wybór workspace',
    sideTitle: 'Kontekst decyzji',
    summary:
      'Użytkownik wybiera tylko workspace, do którego ma aktualne uprawnienie wejścia.',
    title: 'Wybierz aktywny workspace',
    cards: [
      {
        description: 'Pełna gotowość danych sprzedażowych.',
        label: 'ready',
        status: 'ready',
        title: 'Northstar Commerce',
      },
      {
        description: 'Czeka na administratora integracji.',
        label: 'waiting',
        status: 'waiting',
        title: 'Retail Lab EU',
      },
    ],
  },
  creation: {
    accent: 'oklch(62% 0.17 252)',
    action: 'Utwórz workspace',
    icon: Store,
    kicker: 'Utworzenie workspace',
    sideTitle: 'Zakres formularza',
    summary:
      'Powierzchnia zbiera tylko minimalne dane potrzebne do utworzenia workspace.',
    title: 'Utwórz roboczy workspace',
    cards: [
      {
        description: 'Nazwa unikalna w organizacji prawnej.',
        label: 'ready',
        status: 'ready',
        title: 'Nazwa workspace',
      },
      {
        description: 'Limit planu może dać stan gated zamiast płatności.',
        label: 'waiting',
        status: 'waiting',
        title: 'Eligibility planu',
      },
    ],
  },
  company: {
    accent: 'oklch(70% 0.13 74)',
    action: 'Potwierdź dane firmy',
    icon: Building2,
    kicker: 'Dane firmy',
    sideTitle: 'Dane prawne',
    summary:
      'Ekran rozdziela dane prawne od profilu działalności i nie ujawnia duplikatów.',
    title: 'Potwierdź dane organizacji',
    cards: [
      {
        description: 'Kraj, nazwa prawna i identyfikator rejestrowy.',
        label: 'ready',
        status: 'ready',
        title: 'Identyfikacja',
      },
      {
        description: 'Źródło danych rejestrowych wymaga potwierdzenia.',
        label: 'waiting',
        status: 'waiting',
        title: 'Weryfikacja',
      },
    ],
  },
  business: {
    accent: 'oklch(65% 0.16 295)',
    action: 'Zapisz profil',
    icon: FileCheck2,
    kicker: 'Profil działalności',
    sideTitle: 'Kontekst analityczny',
    summary:
      'Profil ustawia branżę, model biznesowy, rynek, walutę i strefę czasu.',
    title: 'Opisz działalność workspace',
    cards: [
      {
        description: 'Waluta i strefa czasu wpływają na KPI.',
        label: 'ready',
        status: 'ready',
        title: 'Raportowanie',
      },
      {
        description: 'Pola opcjonalne nie blokują dashboardu.',
        label: 'ready',
        status: 'ready',
        title: 'Dodatkowy kontekst',
      },
    ],
  },
  dataSource: {
    accent: 'oklch(68% 0.13 188)',
    action: 'Połącz źródło',
    icon: DatabaseZap,
    kicker: 'Połączenie źródła danych',
    sideTitle: 'Minimalny dataset',
    summary:
      'Provider, OAuth, test połączenia i walidacja danych należą do jednej powierzchni.',
    title: 'Połącz źródło sprzedaży',
    cards: [
      {
        description: 'OAuth preferowany; sekrety pozostają write-only.',
        label: 'ready',
        status: 'ready',
        title: 'Shopify',
      },
      {
        description: 'Pominięcie daje tylko ograniczoną powłokę.',
        label: 'waiting',
        status: 'waiting',
        title: 'Odroczenie',
      },
    ],
  },
  status: {
    accent: 'oklch(72% 0.14 76)',
    action: 'Oceń ponownie',
    icon: Gauge,
    kicker: 'Stan konfiguracji workspace',
    sideTitle: 'Wymagania',
    summary:
      'Ekran pokazuje aktualne wymagania ocenione przez runtime, właściciela akcji i wpływ.',
    title: 'Sprawdź, co blokuje pełną gotowość',
    cards: [
      {
        description: 'Profil działalności ukończony przez administratora.',
        label: 'ready',
        status: 'ready',
        title: 'Profil działalności',
      },
      {
        description: 'Integracja czeka na osobę z capability.',
        label: 'waiting',
        status: 'waiting',
        title: 'Źródło danych',
      },
    ],
  },
  preparation: {
    accent: 'oklch(62% 0.17 252)',
    action: 'Przejdź do dashboardu',
    icon: RefreshCw,
    kicker: 'Przygotowanie dashboardu',
    sideTitle: 'Proces bez fikcyjnego postępu',
    summary:
      'Powierzchnia pojawia się tylko przy realnej walidacji, imporcie albo synchronizacji.',
    title: 'Przygotowujemy pierwsze użyteczne dane',
    cards: [
      {
        description: 'Mapowanie zamówień i waluty.',
        label: 'ready',
        status: 'ready',
        title: 'Walidacja datasetu',
      },
      {
        description: 'Synchronizacja może przejść w delayed.',
        label: 'waiting',
        status: 'waiting',
        title: 'Import danych',
      },
    ],
  },
  blocked: {
    accent: 'oklch(63% 0.16 32)',
    action: 'Skontaktuj się ze wsparciem',
    icon: LockKeyhole,
    kicker: 'Dostęp zablokowany',
    sideTitle: 'Bezpieczna blokada',
    summary:
      'Widok nie ujawnia wrażliwej przyczyny blokady konta, membershipu ani workspace.',
    title: 'Ten workspace wymaga wyjaśnienia',
    cards: [
      {
        description: 'Brak bezpiecznej ścieżki self-service.',
        label: 'blocked',
        status: 'blocked',
        title: 'Membership',
      },
      {
        description: 'Dostępna jest kontrolowana eskalacja.',
        label: 'waiting',
        status: 'waiting',
        title: 'Support',
      },
    ],
  },
};

type WorkspaceSetupStoryProps = {
  surface: WorkspaceSurface;
  theme: 'light' | 'dark';
};

function WorkspaceSetupStory({
  surface,
  theme,
}: WorkspaceSetupStoryProps) {
  const definition = workspaceSurfaces[surface];
  const Icon = definition.icon;

  return (
    <div
      className="pds-brand-surface pdw-shell"
      data-theme={theme}
      lang="pl"
      style={
        {
          '--pdw-accent': definition.accent,
        } as React.CSSProperties & Record<'--pdw-accent', string>
      }
    >
      <main className="pdw-main">
        <header className="pdw-header">
          <div className="pdw-heading">
            <span className="pdw-kicker">
              {definition.kicker}
            </span>
            <h1>{definition.title}</h1>
            <p>{definition.summary}</p>
          </div>

          <span className="pdw-status">
            <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
            PROPOSED
          </span>
        </header>

        <section className="pdw-layout" aria-label={definition.kicker}>
          <div className="pdw-panel">
            <div className="pdw-panel-header">
              <h2>Aktualna powierzchnia</h2>
              <span className="pdw-chip pdw-chip--ready">
                {definition.kicker}
              </span>
            </div>

            <div className="pdw-grid">
              {definition.cards.map((card) => (
                <article className="pdw-card" key={card.title}>
                  <div className="pdw-card-header">
                    <h3>{card.title}</h3>
                    <span className={`pdw-chip pdw-chip--${card.status}`}>
                      {card.label}
                    </span>
                  </div>
                  <p>{card.description}</p>
                </article>
              ))}
            </div>

            <div className="pdw-form-grid">
              <div className="pdw-field">
                <span>Capability</span>
                <strong>Sprawdzana po stronie runtime</strong>
              </div>
              <div className="pdw-field">
                <span>Źródło prawdy</span>
                <strong>Stan serwerowy, nie URL</strong>
              </div>
              <div className="pdw-field">
                <span>Recovery</span>
                <strong>Retry, prośba admina albo support</strong>
              </div>
              <div className="pdw-field">
                <span>Sekrety</span>
                <strong>Nigdy nieodtwarzane w formularzu</strong>
              </div>
            </div>

            <div className="pdw-actions">
              <button className="pdw-button" type="button">
                {definition.action}
                <ArrowRight aria-hidden="true" size={16} />
              </button>
              <button
                className="pdw-button pdw-button--secondary"
                type="button"
              >
                Poproś administratora
              </button>
            </div>
          </div>

          <aside className="pdw-side-panel" aria-label={definition.sideTitle}>
            <div className="pdw-card-header">
              <h3>{definition.sideTitle}</h3>
              <ShieldCheck aria-hidden="true" size={18} />
            </div>
            <p>
              Ten widok projektuje zadanie użytkownika bez
              implementowania runtime, routingu ani prawdziwego API.
            </p>

            <ol className="pdw-requirements">
              <li>
                <CheckCircle2 aria-hidden="true" size={16} />
                <span>Jedno główne działanie i jasny wpływ biznesowy.</span>
              </li>
              <li>
                <Clock3 aria-hidden="true" size={16} />
                <span>Stany waiting i delayed nie udają postępu.</span>
              </li>
              <li>
                <AlertTriangle aria-hidden="true" size={16} />
                <span>Braki uprawnień nie ujawniają danych wrażliwych.</span>
              </li>
            </ol>
          </aside>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/Konfiguracja workspace',
  component: WorkspaceSetupStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    surface: {
      control: 'select',
      options: Object.keys(workspaceSurfaces),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof WorkspaceSetupStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WyborWorkspace: Story = {
  name: 'Wybór workspace',
  args: { surface: 'selection', theme: 'dark' },
};

export const UtworzenieWorkspace: Story = {
  name: 'Utworzenie workspace',
  args: { surface: 'creation', theme: 'dark' },
};

export const DaneFirmy: Story = {
  name: 'Dane firmy',
  args: { surface: 'company', theme: 'dark' },
};

export const ProfilDzialalnosci: Story = {
  name: 'Profil działalności',
  args: { surface: 'business', theme: 'dark' },
};

export const PolaczenieZrodlaDanych: Story = {
  name: 'Połączenie źródła danych',
  args: { surface: 'dataSource', theme: 'dark' },
};

export const StanKonfiguracjiWorkspace: Story = {
  name: 'Stan konfiguracji workspace',
  args: { surface: 'status', theme: 'dark' },
};

export const PrzygotowanieDashboardu: Story = {
  name: 'Przygotowanie dashboardu',
  args: { surface: 'preparation', theme: 'dark' },
};

export const DostepZablokowany: Story = {
  name: 'Dostęp zablokowany',
  args: { surface: 'blocked', theme: 'dark' },
};
