import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';

import {
  formatPapaDataCurrency,
  formatPapaDataNumber,
  formatPapaDataPercent,
  type PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import {
  Icon,
  PapaDataBrand,
} from '../../../design-system/icons';
import '../foundations-demo.css';

const meta = {
  title: '05 Laboratorium decyzji/Tła i powierzchnie',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function Localized({
  pl,
  en,
}: {
  readonly pl: ReactNode;
  readonly en: ReactNode;
}) {
  return readLocale() === 'en' ? en : pl;
}

function LaboratoryPage({
  title,
  summary,
  children,
}: {
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-f0-page pd-f0-page--laboratory">
      <header className="pd-f0-page__header">
        <div>
          <p className="pd-f0-kicker">
            05 Laboratorium decyzji
          </p>
          <h1>{title}</h1>
        </div>
        <p className="pd-f0-page__summary">
          {summary}
        </p>
      </header>
      {children}
    </main>
  );
}

function Section({
  title,
  summary,
  children,
}: {
  readonly title: ReactNode;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="pd-f0-section">
      <header className="pd-f0-section__header">
        <h2>{title}</h2>
        {summary ? <p>{summary}</p> : null}
      </header>
      {children}
    </section>
  );
}

function TokenCode({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <code className="pd-f0-token-code">{children}</code>;
}

function Status({
  tone,
  children,
}: {
  readonly tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  readonly children: ReactNode;
}) {
  return (
    <span className="pd-f0-status" data-tone={tone}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

type AuthKind =
  | 'login'
  | 'register'
  | 'mfa'
  | 'reset'
  | 'invitation';

const authLabels = {
  login: {
    pl: ['Logowanie', 'Zaloguj się'],
    en: ['Sign in', 'Sign in'],
  },
  register: {
    pl: ['Utwórz konto', 'Przejdź dalej'],
    en: ['Create account', 'Continue'],
  },
  mfa: {
    pl: ['Kod bezpieczeństwa', 'Potwierdź kod'],
    en: ['Security code', 'Confirm code'],
  },
  reset: {
    pl: ['Odzyskaj dostęp', 'Wyślij instrukcję'],
    en: ['Recover access', 'Send instructions'],
  },
  invitation: {
    pl: ['Zaproszenie do workspace', 'Przyjmij zaproszenie'],
    en: ['Workspace invitation', 'Accept invitation'],
  },
} as const;

function getAuthActionIcon(kind: AuthKind) {
  switch (kind) {
    case 'login':
      return 'security';
    case 'register':
      return 'home';
    case 'mfa':
      return 'success';
    case 'reset':
      return 'search';
    case 'invitation':
      return 'integration';
  }
}

function AuthFormSample({
  kind,
  showBrand = true,
}: {
  readonly kind: AuthKind;
  readonly showBrand?: boolean;
}) {
  const locale = readLocale();
  const [title, action] = authLabels[kind][locale];

  return (
    <article
      className="pd-f0-auth-flow"
      data-auth-kind={kind}
    >
      <header className="pd-f0-auth-flow__header">
        {showBrand ? (
          <PapaDataBrand size="small" />
        ) : null}
        <div>
          <p className="pd-f0-kicker">PapaData</p>
          <h3>{title}</h3>
          <p>
            <Localized
              pl="Bezpieczny dostęp do danych i decyzji Twojej firmy."
              en="Secure access to your company data and decisions."
            />
          </p>
        </div>
      </header>

      <div className="pd-f0-auth-flow__fields">
        {kind === 'mfa' ? (
          <div
            aria-label={locale === 'en' ? 'Security code' : 'Kod bezpieczeństwa'}
            className="pd-f0-code-input"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index}>{index < 2 ? index + 2 : ''}</span>
            ))}
          </div>
        ) : (
          <label>
            <span><Localized pl="Adres e-mail" en="Email address" /></span>
            <input
              autoComplete="email"
              defaultValue="anna@firma.pl"
              type="email"
            />
          </label>
        )}

        {kind === 'login' || kind === 'register' ? (
          <label>
            <span><Localized pl="Hasło" en="Password" /></span>
            <input
              autoComplete={kind === 'login' ? 'current-password' : 'new-password'}
              defaultValue="••••••••••••"
              type="password"
            />
          </label>
        ) : null}
      </div>

      <div className="pd-f0-auth-flow__actions">
        <button
          className="pd-f0-action pd-f0-action--emphasis"
          data-interactive-tone="primary"
          type="button"
        >
          <Icon name={getAuthActionIcon(kind)} size={20} />
          {action}
        </button>

        {kind === 'login' ? (
          <button className="pd-f0-action" type="button">
            <Icon name="search" size={20} />
            <Localized pl="Odzyskaj dostęp" en="Recover access" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

function RegistrationStepper() {
  const steps = [
    {
      pl: 'Konto i autoryzacja',
      en: 'Account and authorization',
      state: 'done',
    },
    {
      pl: 'Kod bezpieczeństwa',
      en: 'Security code',
      state: 'done',
    },
    {
      pl: 'Firma i workspace',
      en: 'Company and workspace',
      state: 'active',
    },
    {
      pl: 'Gotowość do startu',
      en: 'Ready to start',
      state: 'upcoming',
    },
  ] as const;

  return (
    <ol className="pd-f0-auth-stepper">
      {steps.map((step, index) => (
        <li
          data-state={step.state}
          key={step.pl}
        >
          <span className="pd-f0-auth-stepper__index">
            {index + 1}
          </span>
          <div>
            <strong>
              <Localized pl={step.pl} en={step.en} />
            </strong>
            <p>
              {step.state === 'active' ? (
                <Localized
                  pl="Aktualny etap konfiguracji"
                  en="Current configuration step"
                />
              ) : step.state === 'done' ? (
                <Localized pl="Zakończono" en="Completed" />
              ) : (
                <Localized pl="Następny krok" en="Next step" />
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export const TloAuth: Story = {
  name: 'Tło Auth',
  render: () => (
    <LaboratoryPage
      title={<Localized pl="Powierzchnia Auth" en="Auth surface" />}
      summary={
        <Localized
          pl="Auth korzysta z jednej ścieżki uwagi i nie jest zamykany w układzie 50/50. Jedynym wyjątkiem jest rejestracja z krokomierzem."
          en="Auth uses a single attention path and is not enclosed in a 50/50 layout. Registration with a stepper is the only exception."
        />
      }
    >
      <Section
        title={<Localized pl="Logowanie bez splitu i bez karty" en="Sign-in without split or card" />}
        summary={
          <Localized
            pl="Marka, komunikat, pola i akcje tworzą jeden pionowy rytm. Przyciski pozostają poza blokiem pól."
            en="Brand, message, fields and actions form one vertical rhythm. Buttons remain outside the field block."
          />
        }
      >
        <div className="pd-f0-auth-stage">
          <div className="pd-f0-auth-stage__intro">
            <PapaDataBrand glow size="large" />
            <h2>
              <Localized
                pl="Bezpieczny dostęp i zarządzanie danymi Twojej firmy."
                en="Secure access and control over your company data."
              />
            </h2>
            <p>
              <Localized
                pl="Bez bocznego hero, bez ciężkiej ramki i bez dwóch równych połówek."
                en="No side hero, no heavy frame and no two equal halves."
              />
            </p>
          </div>

          <AuthFormSample kind="login" showBrand={false} />
        </div>
      </Section>

      <Section
        title={<Localized pl="Rejestracja z krokomierzem" en="Registration with a stepper" />}
        summary={
          <Localized
            pl="Krokomierz jest ważnym elementem procesu, ale nie tworzy dekoracyjnego panelu 50/50."
            en="The stepper is an important process element, but it does not create a decorative 50/50 panel."
          />
        }
      >
        <div className="pd-f0-auth-registration">
          <aside>
            <p className="pd-f0-kicker">
              <Localized pl="Postęp rejestracji" en="Registration progress" />
            </p>
            <RegistrationStepper />
          </aside>

          <AuthFormSample kind="register" showBrand={false} />
        </div>
      </Section>

      <Section
        title={<Localized pl="Pozostałe stany Auth" en="Remaining Auth states" />}
        summary={
          <Localized
            pl="MFA, odzyskiwanie i zaproszenia pozostają lekkimi sekcjami rozdzielonymi przestrzenią i separatorami."
            en="MFA, recovery and invitations remain lightweight sections separated by space and dividers."
          />
        }
      >
        <div className="pd-f0-auth-state-list">
          <AuthFormSample kind="mfa" />
          <AuthFormSample kind="reset" />
          <AuthFormSample kind="invitation" />
        </div>
      </Section>
    </LaboratoryPage>
  ),
};

const navigationItems = [
  {
    icon: 'home',
    labelPl: 'Centrum Dowodzenia',
    labelEn: 'Command Center',
  },
  {
    icon: 'trend',
    labelPl: 'Kampanie',
    labelEn: 'Campaigns',
  },
  {
    icon: 'data',
    labelPl: 'Zamówienia',
    labelEn: 'Orders',
  },
  {
    icon: 'integration',
    labelPl: 'Integracje',
    labelEn: 'Integrations',
  },
] as const;

function CommandCanvas({
  variant,
}: {
  readonly variant: 'sidebar' | 'plain' | 'assistant';
}) {
  const locale = readLocale();

  return (
    <article className="pd-f0-command-canvas" data-canvas-variant={variant}>
      {variant !== 'plain' ? (
        <aside className="pd-f0-command-sidebar">
          <PapaDataBrand showWordmark={false} size="small" />
          <nav aria-label={locale === 'en' ? 'Main navigation' : 'Główna nawigacja'}>
            <ul>
              {navigationItems.map((item, index) => {
                const label = locale === 'en' ? item.labelEn : item.labelPl;

                return (
                  <li key={item.icon}>
                    <a aria-current={index === 0 ? 'page' : undefined} href={`#${item.icon}`}>
                      <Icon name={item.icon} size={20} />
                      <span>{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      ) : null}

      <div className="pd-f0-command-workspace">
        <header className="pd-f0-command-topbar">
          <div>
            <strong>
              {locale === 'en' ? 'Command Center' : 'Centrum Dowodzenia'}
            </strong>
            <span>
              {locale === 'en' ? 'Last 30 days' : 'Ostatnie 30 dni'}
            </span>
          </div>
          <div>
            <button className="pd-f0-icon-action" aria-label={locale === 'en' ? 'Search' : 'Szukaj'} type="button">
              <Icon name="search" size={20} />
            </button>
            <Status tone="success">
              <Localized pl="Dane aktualne" en="Data current" />
            </Status>
          </div>
        </header>

        <main className="pd-f0-command-main">
          <section className="pd-f0-command-brief">
            <div>
              <p className="pd-f0-kicker">
                <Localized pl="Briefing" en="Briefing" />
              </p>
              <h3>
                <Localized
                  pl="Sprzedaż rośnie, ale koszt kampanii wymaga decyzji."
                  en="Sales are growing, but campaign cost needs a decision."
                />
              </h3>
            </div>
            <button className="pd-f0-action pd-f0-action--emphasis" data-interactive-tone="primary" type="button">
              <Icon name="trend" size={20} />
              <Localized pl="Otwórz analizę" en="Open analysis" />
            </button>
          </section>

          <div className="pd-f0-command-metrics">
            <article data-metric="revenue">
              <span><Localized pl="Przychód" en="Revenue" /></span>
              <strong>{formatPapaDataCurrency(1284930, locale)}</strong>
              <small>+{formatPapaDataPercent(0.124, locale)}</small>
            </article>
            <article data-metric="roas">
              <span>ROAS</span>
              <strong>{formatPapaDataNumber(4.82, locale)}</strong>
              <small>+{formatPapaDataNumber(0.36, locale)}</small>
            </article>
            <article data-metric="readiness">
              <span><Localized pl="Gotowość danych" en="Data readiness" /></span>
              <strong>{formatPapaDataPercent(0.968, locale)}</strong>
              <small><Localized pl="4 źródła" en="4 sources" /></small>
            </article>
          </div>

          <section className="pd-f0-command-chart">
            <header>
              <div>
                <h3><Localized pl="Wynik i plan" en="Actual and target" /></h3>
                <p><Localized pl="Dane dzienne · PLN" en="Daily data · PLN" /></p>
              </div>
              <TokenCode>--pd-surface-data</TokenCode>
            </header>
            <div
              aria-label={locale === 'en' ? 'Sales trend' : 'Trend sprzedaży'}
              className="pd-f0-chart-placeholder"
              role="img"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} style={{ height: `${28 + ((index * 17) % 62)}%` }} />
              ))}
            </div>
          </section>
        </main>
      </div>

      {variant === 'assistant' ? (
        <aside className="pd-f0-command-assistant">
          <Icon name="assistant" size={24} />
          <h3>Papa</h3>
          <p>
            <Localized
              pl="Największy wpływ na wynik ma wzrost konwersji marketplace."
              en="Marketplace conversion growth has the strongest impact on the result."
            />
          </p>
          <button className="pd-f0-action" type="button">
            <Icon name="search" size={20} />
            <Localized pl="Pokaż dowody" en="Show evidence" />
          </button>
        </aside>
      ) : null}
    </article>
  );
}

export const CanvasAplikacji: Story = {
  name: 'Canvas aplikacji',
  render: () => (
    <LaboratoryPage
      title={<Localized pl="Canvas aplikacji" en="Application canvas" />}
      summary={
        <Localized
          pl="Relacja shellu, sidebara, topbara, treści i powierzchni danych bez udawania gotowego produkcyjnego AppShella."
          en="The relationship between shell, sidebar, topbar, content and data surfaces without pretending that the production AppShell already exists."
        />
      }
    >
      <Section
        title={
          <Localized
            pl="Układ responsywny z nawigacją"
            en="Responsive layout with navigation"
          />
        }
      >
        <CommandCanvas variant="sidebar" />
      </Section>
      <Section title={<Localized pl="Układ bez sidebara" en="Layout without sidebar" />}>
        <CommandCanvas variant="plain" />
      </Section>
      <Section title={<Localized pl="Układ z panelem Papa" en="Layout with Papa panel" />}>
        <CommandCanvas variant="assistant" />
      </Section>
    </LaboratoryPage>
  ),
};

const dataRows = [
  {
    source: 'Allegro',
    ownerPl: 'Marketplace',
    ownerEn: 'Marketplace',
    freshnessMinutes: 3,
    match: 0.992,
    valuePl: '842 900 zł',
    valueEn: 'PLN 842,900',
    tone: 'success',
    statusPl: 'Stabilne',
    statusEn: 'Stable',
  },
  {
    source: 'Google Ads',
    ownerPl: 'Płatne media',
    ownerEn: 'Paid media',
    freshnessMinutes: 11,
    match: 0.968,
    valuePl: '118 430 zł',
    valueEn: 'PLN 118,430',
    tone: 'warning',
    statusPl: 'Koszt rośnie',
    statusEn: 'Cost rising',
  },
  {
    source: 'Shopify',
    ownerPl: 'Sprzedaż',
    ownerEn: 'Commerce',
    freshnessMinutes: 8,
    match: 0.987,
    valuePl: '291 640 zł',
    valueEn: 'PLN 291,640',
    tone: 'success',
    statusPl: 'Stabilne',
    statusEn: 'Stable',
  },
  {
    source: 'CRM',
    ownerPl: 'Klienci',
    ownerEn: 'Customers',
    freshnessMinutes: 42,
    match: 0.914,
    valuePl: '17 rekordów',
    valueEn: '17 records',
    tone: 'danger',
    statusPl: 'Do sprawdzenia',
    statusEn: 'Review required',
  },
] as const;

function DataTableSample() {
  const locale = readLocale();

  return (
    <div className="pd-f0-table-scroll">
      <table className="pd-f0-data-table">
        <caption className="pd-f0-sr-only">
          <Localized pl="Stan źródeł danych" en="Data-source status" />
        </caption>
        <thead>
          <tr>
            <th scope="col"><Localized pl="Źródło" en="Source" /></th>
            <th scope="col"><Localized pl="Obszar" en="Owner" /></th>
            <th scope="col"><Localized pl="Świeżość" en="Freshness" /></th>
            <th scope="col"><Localized pl="Dopasowanie" en="Match" /></th>
            <th scope="col"><Localized pl="Wartość" en="Value" /></th>
            <th scope="col"><Localized pl="Status" en="Status" /></th>
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row) => (
            <tr key={row.source}>
              <th scope="row">{row.source}</th>
              <td>{locale === 'en' ? row.ownerEn : row.ownerPl}</td>
              <td>
                {locale === 'en'
                  ? `${row.freshnessMinutes} min`
                  : `${row.freshnessMinutes} min`}
              </td>
              <td>{formatPapaDataPercent(row.match, locale)}</td>
              <td>{locale === 'en' ? row.valueEn : row.valuePl}</td>
              <td>
                <Status tone={row.tone}>
                  {locale === 'en' ? row.statusEn : row.statusPl}
                </Status>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const PowierzchniaDanych: Story = {
  name: 'Powierzchnia danych',
  render: () => {
    const locale = readLocale();

    return (
      <LaboratoryPage
        title={<Localized pl="Powierzchnia danych" en="Data surface" />}
        summary={
          <Localized
            pl="Jedna referencja pokazuje role przyszłych MetricCard, ChartFrame, DataTable, panelu szczegółów, drawera, dowodów, rekomendacji i statusu danych."
            en="One reference demonstrates the roles of future MetricCard, ChartFrame, DataTable, detail panel, drawer, evidence, recommendation and data-status surfaces."
          />
        }
      >
        <Section title={<Localized pl="MetricCard + DataStatus" en="MetricCard + DataStatus" />}>
          <div className="pd-f0-metric-grid">
            <article data-metric="revenue">
              <span><Localized pl="Przychód" en="Revenue" /></span>
              <strong>{formatPapaDataCurrency(1284930, locale)}</strong>
              <Status tone="success">+{formatPapaDataPercent(0.124, locale)}</Status>
            </article>
            <article data-metric="roas">
              <span>ROAS</span>
              <strong>{formatPapaDataNumber(4.82, locale)}</strong>
              <Status tone="warning">
                <Localized
                  pl={`Koszt +${formatPapaDataPercent(0.084, locale)}`}
                  en={`Cost +${formatPapaDataPercent(0.084, locale)}`}
                />
              </Status>
            </article>
            <article data-metric="readiness">
              <span><Localized pl="Gotowość danych" en="Data readiness" /></span>
              <strong>{formatPapaDataPercent(0.968, locale)}</strong>
              <Status tone="info"><Localized pl="4 źródła" en="4 sources" /></Status>
            </article>
          </div>
        </Section>

        <Section title="ChartFrame">
          <article className="pd-f0-chart-frame">
            <header>
              <div>
                <p className="pd-f0-kicker"><Localized pl="Pytanie biznesowe" en="Business question" /></p>
                <h3>
                  <Localized
                    pl="Które źródło napędza rentowny wzrost?"
                    en="Which source drives profitable growth?"
                  />
                </h3>
                <p>
                  <Localized
                    pl="Wynik, cel i prognoza · ostatnie 30 dni"
                    en="Actual, target and forecast · last 30 days"
                  />
                </p>
              </div>
              <Status tone="success"><Localized pl="Aktualne" en="Current" /></Status>
            </header>
            <div className="pd-f0-chart-frame__body">
              <div
                aria-label={locale === 'en'
                  ? 'Actual, target and forecast trend'
                  : 'Trend wyniku, celu i prognozy'}
                className="pd-f0-chart-placeholder"
                role="img"
              >
                {Array.from({ length: 16 }, (_, index) => (
                  <span key={index} style={{ height: `${24 + ((index * 23) % 68)}%` }} />
                ))}
              </div>
              <aside>
                <strong><Localized pl="Dowody" en="Evidence" /></strong>
                <p>
                  <Localized
                    pl="Konwersja marketplace wzrosła po uporządkowaniu feedu produktowego."
                    en="Marketplace conversion improved after product-feed cleanup."
                  />
                </p>
                <TokenCode>
                  <Localized pl="świeżość: 3 min" en="freshness: 3 min" />
                </TokenCode>
              </aside>
            </div>
            <footer>
              <p>
                <strong><Localized pl="Podsumowanie:" en="Summary:" /></strong>{' '}
                <Localized
                  pl="Marketplace odpowiada za 66% dodatkowego przychodu."
                  en="Marketplace contributes 66% of incremental revenue."
                />
              </p>
              <button className="pd-f0-action" type="button">
                <Icon name="data" size={20} />
                <Localized pl="Otwórz tabelę alternatywną" en="Open alternative table" />
              </button>
            </footer>
          </article>
        </Section>

        <Section title="DataTable">
          <DataTableSample />
        </Section>

        <Section title={<Localized pl="Panele kontekstowe" en="Context panels" />}>
          <div className="pd-f0-context-panel-grid">
            <article data-panel="detail">
              <Icon name="data" size={20} />
              <h3><Localized pl="Panel szczegółów" en="Detail panel" /></h3>
              <p><Localized pl="Kontekst rekordu bez opuszczania analizy." en="Record context without leaving the analysis." /></p>
            </article>
            <article data-panel="drawer">
              <Icon name="integration" size={20} />
              <h3>Drawer</h3>
              <p><Localized pl="Proces konfiguracji lub naprawy źródła." en="A source configuration or recovery process." /></p>
            </article>
            <article data-panel="evidence">
              <Icon name="search" size={20} />
              <h3><Localized pl="Dowody" en="Evidence" /></h3>
              <p><Localized pl="Źródło, świeżość i ograniczenia rekomendacji." en="Sources, freshness and recommendation limitations." /></p>
            </article>
            <article data-panel="recommendation">
              <Icon name="assistant" size={20} />
              <h3><Localized pl="Rekomendacja" en="Recommendation" /></h3>
              <p><Localized pl="Decyzja, uzasadnienie i następna akcja." en="Decision, rationale and next action." /></p>
            </article>
            <article data-panel="status">
              <Icon name="success" size={20} />
              <h3><Localized pl="Status danych" en="Data status" /></h3>
              <p>
                <Localized
                  pl="Gotowość, świeżość, dane częściowe i odzyskiwanie."
                  en="Readiness, freshness, partial data and recovery."
                />
              </p>
            </article>
          </div>
        </Section>
      </LaboratoryPage>
    );
  },
};

export const SeparatoryIObramowania: Story = {
  name: 'Separatory i obramowania',
  render: () => (
    <LaboratoryPage
      title={<Localized pl="Separatory i obramowania" en="Separators and borders" />}
      summary={
        <Localized
          pl="Porównanie mechanizmów podziału sekcji, tabel, topbara, sidebara, drawera i powierzchni sticky."
          en="A comparison of separation mechanisms for sections, tables, topbar, sidebar, drawer and sticky surfaces."
        />
      }
    >
      <Section title={<Localized pl="Pięć sposobów separacji" en="Five separation mechanisms" />}>
        <div className="pd-f0-separation-lab">
          <article data-separation="space">
            <strong><Localized pl="Odstęp" en="Whitespace" /></strong>
            <p><Localized pl="Podstawowe narzędzie podziału dużych sekcji." en="Primary tool for separating large sections." /></p>
          </article>
          <article data-separation="subtle">
            <strong><Localized pl="Subtelny separator" en="Subtle separator" /></strong>
            <TokenCode>--pd-separator-subtle</TokenCode>
          </article>
          <article data-separation="default">
            <strong><Localized pl="Standardowe obramowanie" en="Default border" /></strong>
            <TokenCode>--pd-separator</TokenCode>
          </article>
          <article data-separation="surface">
            <strong><Localized pl="Zmiana powierzchni" en="Surface change" /></strong>
            <TokenCode>--pd-surface-subtle</TokenCode>
          </article>
          <article data-separation="strong">
            <strong><Localized pl="Mocna granica" en="Strong boundary" /></strong>
            <TokenCode>--pd-separator-strong</TokenCode>
          </article>
        </div>
      </Section>

      <Section title={<Localized pl="Zastosowania" en="Applications" />}>
        <div className="pd-f0-border-application">
          <article data-application="topbar">
            <Icon name="search" size={20} />
            <span>Topbar</span>
          </article>
          <article data-application="sidebar">
            <Icon name="home" size={20} />
            <span>Sidebar</span>
          </article>
          <article data-application="table">
            <Icon name="data" size={20} />
            <span><Localized pl="Wiersze tabeli" en="Table rows" /></span>
          </article>
          <article data-application="drawer">
            <Icon name="integration" size={20} />
            <span>Drawer</span>
          </article>
          <article data-application="sticky">
            <Icon name="assistant" size={20} />
            <span><Localized pl="Powierzchnia sticky" en="Sticky surface" /></span>
          </article>
        </div>
      </Section>
    </LaboratoryPage>
  ),
};

export const GradientySwiatloISzklo: Story = {
  name: 'Gradienty, światło i szkło',
  render: () => (
    <LaboratoryPage
      title={<Localized pl="Gradienty, światło i szkło" en="Gradients, light and glass" />}
      summary={
        <Localized
          pl="Efekty są kontrolowanymi wariantami funkcjonalnych powierzchni. Canvas i zwykłe sekcje muszą działać także bez nich."
          en="Effects are controlled variants of functional surfaces. The canvas and ordinary sections must also work without them."
        />
      }
    >
      <Section title={<Localized pl="Wariant bez efektu" en="No-effect baseline" />}>
        <div className="pd-f0-effect-baseline">
          <PapaDataBrand size="medium" />
          <h3><Localized pl="Powierzchnia bazowa" en="Base surface" /></h3>
          <p><Localized pl="Czytelna hierarchia bez gradientu, szkła i glow." en="Readable hierarchy without gradient, glass or glow." /></p>
        </div>
      </Section>

      <Section title={<Localized pl="Dozwolone warianty" en="Allowed variants" />}>
        <div className="pd-f0-effect-grid">
          <article data-effect="premium">
            <PapaDataBrand glow size="small" />
            <h3><Localized pl="Światło premium" en="Premium light" /></h3>
            <TokenCode>--pd-gradient-premium</TokenCode>
          </article>
          <article data-effect="data">
            <Icon name="trend" size={24} />
            <h3><Localized pl="Gradient danych" en="Data gradient" /></h3>
            <TokenCode>--pd-gradient-data</TokenCode>
          </article>
          <article data-effect="glass">
            <Icon name="search" size={24} />
            <h3><Localized pl="Szkło warstwy" en="Overlay glass" /></h3>
            <TokenCode>--pd-glass-surface</TokenCode>
          </article>
          <article data-effect="scrim">
            <Icon name="security" size={24} />
            <h3><Localized pl="Przyciemnienie warstwy" en="Overlay scrim" /></h3>
            <TokenCode>--pd-overlay-scrim</TokenCode>
          </article>
        </div>
      </Section>

      <Section title={<Localized pl="Zakazane" en="Forbidden" />}>
        <div className="pd-f0-forbidden-effects">
          <span><Localized pl="Duże neonowe halo" en="Large neon halo" /></span>
          <span><Localized pl="Gradient zamiast canvasu" en="Gradient replacing canvas" /></span>
          <span><Localized pl="Szkło na każdej karcie" en="Glass on every card" /></span>
          <span><Localized pl="Kolorowy cień statusu" en="Color shadow for status" /></span>
        </div>
      </Section>
    </LaboratoryPage>
  ),
};
