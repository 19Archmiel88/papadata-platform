import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { Select, type StatusBadgeTone } from '../../../design-system/components';
import { Icon, PapaDataBrand, type PapaDataIconName } from '../../../design-system/icons';
import '../foundations-demo.css';
import '../00-foundations/foundation-lab-alignment.css';
import './surfaces-laboratory.css';

const meta = {
  title: '05 Laboratorium decyzji/Tła i powierzchnie',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

type StatusTone = StatusBadgeTone;

function readLocale() {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en' ? 'en' : 'pl';
}

function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

function Localized({ pl, en }: LocalizedCopy) {
  return <>{readLocale() === 'en' ? en : pl}</>;
}

function TokenCode({ children }: { readonly children: ReactNode }) {
  return <code className="pd-f0-token">{children}</code>;
}

function SurfacePage({
  title,
  summary,
  meta,
  className,
  children,
}: {
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly meta: ReadonlyArray<{
    readonly label: ReactNode;
    readonly value: ReactNode;
  }>;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <main className={['pd-f0-page', 'pd-s5-page', className].filter(Boolean).join(' ')}>
      <div className="pd-f0-page__inner">
        <header className="pd-f0-page__header">
          <div className="pd-f0-page__label">
            <span>05</span>
            <span>
              <Localized pl="Laboratorium decyzji" en="Decision laboratory" />
            </span>
          </div>
          <div className="pd-f0-page__heading">
            <h1>{title}</h1>
            <p>{summary}</p>
          </div>
          <dl className="pd-f0-page__meta" aria-label={copy({
            pl: 'Parametry kontraktu powierzchni',
            en: 'Surface contract parameters',
          })}>
            {meta.map((item, index) => (
              <div key={index}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </header>
        {children}
      </div>
    </main>
  );
}

function SurfaceSection({
  index,
  title,
  summary,
  children,
}: {
  readonly index: string;
  readonly title: ReactNode;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="pd-f0-section">
      <header className="pd-f0-section__header">
        <span className="pd-f0-section__index" aria-hidden="true">
          {index}
        </span>
        <div>
          <h2>{title}</h2>
          {summary ? <p>{summary}</p> : null}
        </div>
      </header>
      <div className="pd-f0-section__content">{children}</div>
    </section>
  );
}

function SurfaceVariant({
  title,
  description,
  token,
  children,
  surface = 'plain',
}: {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly token?: ReactNode;
  readonly children: ReactNode;
  readonly surface?: 'plain' | 'subtle' | 'data';
}) {
  return (
    <article className="pd-f0-variant" data-reference="demo-only" data-surface={surface}>
      <header className="pd-f0-variant__header">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        {token ? <code>{token}</code> : null}
      </header>
      <div className="pd-f0-variant__body">{children}</div>
    </article>
  );
}

function SurfaceLedger({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="pd-f0-ledger" data-reference="demo-only" role="list" aria-label={label}>
      {children}
    </div>
  );
}

function LedgerRow({
  label,
  value,
  detail,
  preview,
}: {
  readonly label: ReactNode;
  readonly value?: ReactNode;
  readonly detail?: ReactNode;
  readonly preview?: ReactNode;
}) {
  return (
    <div className="pd-f0-ledger__row" role="listitem">
      <div className="pd-f0-ledger__label">{label}</div>
      {preview ? <div className="pd-f0-ledger__preview">{preview}</div> : null}
      {value ? <div className="pd-f0-ledger__value">{value}</div> : null}
      {detail ? <div className="pd-f0-ledger__detail">{detail}</div> : null}
    </div>
  );
}

// Storybook reference helper only; status API is owned by StatusBadgeTone.
function StatusBadge({
  tone,
  children,
}: {
  readonly tone: StatusTone;
  readonly children: ReactNode;
}) {
  return (
    <span className="pd-f0-status" data-reference="demo-only" data-tone={tone}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

// Storybook reference helper only; not a public Button API.
function FoundationButton({
  children,
  tone = 'secondary',
  icon,
  disabled = false,
  onClick,
}: {
  readonly children: ReactNode;
  readonly tone?: 'primary' | 'secondary' | 'quiet';
  readonly icon?: PapaDataIconName;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
}) {
  return (
    <button className="pd-f0-button" data-reference="demo-only" data-tone={tone} disabled={disabled} onClick={onClick} type="button">
      {icon ? <Icon decorative name={icon} size={16} /> : null}
      <span>{children}</span>
    </button>
  );
}

function ThemePreview({
  theme,
  title,
  description,
  children,
}: {
  readonly theme: 'light' | 'dark';
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <article className="pd-f0-theme-preview" data-reference="demo-only" data-theme={theme}>
      <header>
        <span>
          {theme === 'light' ? (
            <Localized pl="Tryb jasny" en="Light mode" />
          ) : (
            <Localized pl="Tryb ciemny" en="Dark mode" />
          )}
        </span>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="pd-f0-theme-preview__body">{children}</div>
    </article>
  );
}

function ThemePair({
  light,
  dark,
}: {
  readonly light: ReactNode;
  readonly dark: ReactNode;
}) {
  return (
    <div className="pd-f0-theme-pair" data-reference="demo-only">
      {light}
      {dark}
    </div>
  );
}

function ContractMeta({
  id,
  variants,
  behavior,
}: {
  readonly id: string;
  readonly variants: ReactNode;
  readonly behavior?: ReactNode;
}) {
  const items = [
    {
      label: <Localized pl="Kontrakt" en="Contract" />,
      value: id,
    },
    {
      label: <Localized pl="Warianty" en="Variants" />,
      value: variants,
    },
    {
      label: <Localized pl="Źródło UI" en="UI source" />,
      value: <Localized pl="00 Fundamenty" en="00 Foundations" />,
    },
  ];

  if (behavior) {
    items.splice(2, 0, {
      label: <Localized pl="Właściciel scrolla" en="Scroll owner" />,
      value: behavior,
    });
  }

  return items;
}

function MetaVariantList({
  items,
}: {
  readonly items: ReadonlyArray<ReactNode>;
}) {
  return (
    <span className="pd-s5-meta-list">
      {items.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </span>
  );
}

function DecisionList({
  accepted,
  rejected,
}: {
  readonly accepted: ReactNode;
  readonly rejected: ReactNode;
}) {
  return (
    <div className="pd-f0-decision-list">
      <div data-result="accepted">
        <StatusBadge tone="success">
          <Localized pl="Stosujemy" en="Use" />
        </StatusBadge>
        <p>{accepted}</p>
      </div>
      <div data-result="rejected">
        <StatusBadge tone="critical">
          <Localized pl="Odrzucamy" en="Avoid" />
        </StatusBadge>
        <p>{rejected}</p>
      </div>
    </div>
  );
}

function AuthFieldDemo({
  label,
  short = false,
}: {
  readonly label: ReactNode;
  readonly short?: boolean;
}) {
  return (
    <div className="pd-s5-field-demo">
      <span>{label}</span>
      <i data-short={short ? 'true' : 'false'} />
    </div>
  );
}

function AuthCard({
  mode,
  title,
  helper,
  status,
}: {
  readonly mode: 'login' | 'register' | 'mfa' | 'reset' | 'invite' | 'mobile';
  readonly title: ReactNode;
  readonly helper: ReactNode;
  readonly status?: ReactNode;
}) {
  const fieldLabels = {
    login: [
      <Localized key="email" pl="Adres e-mail" en="Email address" />,
      <Localized key="password" pl="Hasło" en="Password" />,
    ],
    register: [
      <Localized key="email" pl="Adres e-mail" en="Email address" />,
      <Localized key="workspace" pl="Nazwa workspace" en="Workspace name" />,
    ],
    mfa: [
      <Localized key="code" pl="Kod MFA" en="MFA code" />,
      <Localized key="device" pl="Zaufane urządzenie" en="Trusted device" />,
      <Localized key="backup" pl="Kod zapasowy" en="Backup code" />,
    ],
    reset: [
      <Localized key="email" pl="Adres e-mail" en="Email address" />,
      <Localized key="confirm" pl="Potwierdzenie adresu" en="Address confirmation" />,
    ],
    invite: [
      <Localized key="email" pl="Adres e-mail" en="Email address" />,
      <Localized key="role" pl="Rola w workspace" en="Workspace role" />,
    ],
    mobile: [
      <Localized key="email" pl="Adres e-mail" en="Email address" />,
      <Localized key="password" pl="Hasło" en="Password" />,
    ],
  } satisfies Record<typeof mode, ReadonlyArray<ReactNode>>;

  return (
    <article className="pd-s5-auth-card" data-mode={mode}>
      <header>
        <PapaDataBrand size={mode === 'mobile' ? 'small' : 'medium'} />
        {status ? <StatusBadge tone="success">{status}</StatusBadge> : null}
      </header>
      <div className="pd-s5-auth-card__copy">
        <span><Localized pl="Dostęp" en="Access" /></span>
        <h3>{title}</h3>
        <p>{helper}</p>
      </div>
      <div className="pd-s5-form-lines" aria-label={copy({
        pl: 'Nieinteraktywna demonstracja pól formularza',
        en: 'Non-interactive form field demonstration',
      })}>
        {fieldLabels[mode].map((label, index) => (
          <AuthFieldDemo
            key={index}
            label={label}
            short={mode === 'mfa' && index === 2}
          />
        ))}
      </div>
      {mode === 'mobile' ? (
        <div className="pd-s5-mobile-rule" aria-hidden="true">
          <span>16 px gutter</span>
          <span>width: 100%</span>
        </div>
      ) : null}
      <footer>
        <FoundationButton tone="primary" icon="security">
          <Localized pl="Kontynuuj" en="Continue" />
        </FoundationButton>
        <FoundationButton tone="quiet">
          <Localized pl="Pomoc" en="Help" />
        </FoundationButton>
      </footer>
    </article>
  );
}

function RejectedAuthExample() {
  return (
    <div className="pd-s5-auth-rejected" role="img" aria-label={copy({
      pl: 'Antyprzykład auth hero 50/50 z dekoracyjnym glassmorphism',
      en: 'Anti-example of a 50/50 auth hero with decorative glassmorphism',
    })}>
      <section>
        <span><Localized pl="Hero 50/50" en="50/50 hero" /></span>
        <strong><Localized pl="Dekoracja przejmuje uwagę" en="Decoration takes attention" /></strong>
        <p><Localized pl="Tło walczy z formularzem i nie niesie roli systemowej." en="The background competes with the form and has no system role." /></p>
      </section>
      <aside>
        <div>
          <span />
          <span />
          <span />
        </div>
      </aside>
    </div>
  );
}

function AuthMatrix() {
  return (
    <div className="pd-s5-auth-matrix">
      <AuthCard
        mode="login"
        title={<Localized pl="Logowanie" en="Sign in" />}
        helper={<Localized pl="Jedna powierzchnia formularza nad spokojnym canvasem." en="One form surface above a calm canvas." />}
        status={<Localized pl="Bezpieczna sesja" en="Secure session" />}
      />
      <AuthCard
        mode="register"
        title={<Localized pl="Rejestracja" en="Registration" />}
        helper={<Localized pl="Ta sama geometria, inny krok dostępu." en="The same geometry, a different access step." />}
      />
      <AuthCard
        mode="mfa"
        title={<Localized pl="MFA" en="MFA" />}
        helper={<Localized pl="Kod jest treścią interaktywną, nie osobną dekoracją." en="The code is interactive content, not separate decoration." />}
      />
      <AuthCard
        mode="reset"
        title={<Localized pl="Reset hasła" en="Password reset" />}
        helper={<Localized pl="Komunikat statusu pozostaje lokalny i czytelny." en="Status feedback stays local and readable." />}
      />
      <AuthCard
        mode="invite"
        title={<Localized pl="Zaproszenie" en="Invitation" />}
        helper={<Localized pl="Kontekst workspace wspiera decyzję o wejściu." en="Workspace context supports the access decision." />}
      />
      <AuthCard
        mode="mobile"
        title={<Localized pl="Mobile" en="Mobile" />}
        helper={<Localized pl="Pełna szerokość z gutterem, bez desktopowej wysokości." en="Full width with gutter, without desktop-locked height." />}
      />
    </div>
  );
}

function AppShellPreview({
  variant,
}: {
  readonly variant: 'sidebar' | 'no-sidebar' | 'papa' | 'compact' | 'scroll';
}) {
  const hasSidebar = variant !== 'no-sidebar';
  const hasPapaLayer = variant === 'papa';
  const isCompact = variant === 'compact';
  const isScroll = variant === 'scroll';

  return (
    <div className="pd-s5-app-shell" data-variant={variant}>
      <header className="pd-s5-app-shell__topbar">
        <PapaDataBrand size="small" />
        <span><Localized pl="Sticky topbar" en="Sticky topbar" /></span>
        <StatusBadge tone={variant === 'scroll' ? 'info' : 'success'}>
          {variant === 'scroll' ? (
            <Localized pl="Scroll: content" en="Scroll: content" />
          ) : (
            <Localized pl="Dane aktualne" en="Fresh data" />
          )}
        </StatusBadge>
      </header>
      <div className="pd-s5-app-shell__body">
        {hasSidebar ? (
          <aside aria-label={copy({ pl: 'Sidebar modułów', en: 'Module sidebar' })}>
            {isCompact ? (
              <div className="pd-s5-app-shell__rail" aria-label={copy({
                pl: 'Nawigacja ikonowa',
                en: 'Icon navigation',
              })}>
                <button aria-label={copy({ pl: 'Dashboard', en: 'Dashboard' })} type="button">
                  <Icon decorative name="home" size={20} />
                </button>
                <button aria-label={copy({ pl: 'Trendy', en: 'Trends' })} type="button">
                  <Icon decorative name="trend" size={20} />
                </button>
                <button aria-label={copy({ pl: 'Dane', en: 'Data' })} type="button">
                  <Icon decorative name="data" size={20} />
                </button>
                <button aria-label={copy({ pl: 'Szukaj', en: 'Search' })} type="button">
                  <Icon decorative name="search" size={20} />
                </button>
              </div>
            ) : (
              <>
                <span><Localized pl="Dashboard" en="Dashboard" /></span>
                <span><Localized pl="Kampanie" en="Campaigns" /></span>
                <span><Localized pl="Zamówienia" en="Orders" /></span>
                <span><Localized pl="Klienci" en="Customers" /></span>
              </>
            )}
          </aside>
        ) : null}
        <section className="pd-s5-app-shell__content" aria-label={copy({
          pl: 'Region treści',
          en: 'Content region',
        })} data-scroll-owner={isScroll ? 'content' : undefined}>
          <header>
            <div>
              <span><Localized pl="Region treści" en="Content region" /></span>
              <h3><Localized pl="Centrum dowodzenia" en="Command center" /></h3>
            </div>
            <FoundationButton tone="secondary" icon="data">
              <Localized pl="Zakres dat" en="Date range" />
            </FoundationButton>
          </header>
          <div className="pd-s5-metric-row">
            <div>
              <span><Localized pl="Przychód" en="Revenue" /></span>
              <strong>248 420 zł</strong>
            </div>
            <div>
              <span>ROAS</span>
              <strong>4,82</strong>
            </div>
            <div>
              <span><Localized pl="Alerty" en="Alerts" /></span>
              <strong>3</strong>
            </div>
          </div>
          <div className="pd-s5-content-owner">
            <strong><Localized pl="Właściciel scrolla" en="Scroll owner" /></strong>
            <p>
              {variant === 'scroll' ? (
                <Localized
                  pl="Przewija się region treści; topbar i sidebar zostają stabilne."
                  en="The content region scrolls; topbar and sidebar remain stable."
                />
              ) : (
                <Localized
                  pl="Canvas oddziela powłokę od zadania bez dodatkowych kart."
                  en="The canvas separates shell from task without extra cards."
                />
              )}
            </p>
          </div>
          {isScroll ? (
            <div className="pd-s5-scroll-content" aria-label={copy({
              pl: 'Przewijany region treści',
              en: 'Scrollable content region',
            })}>
              <span>scroll: content</span>
              <div>
                <strong><Localized pl="Priorytety operacyjne" en="Operational priorities" /></strong>
                <p><Localized pl="Lista pozostaje w regionie treści, bez przesuwania topbaru i sidebara." en="The list stays in the content region without moving the topbar or sidebar." /></p>
              </div>
              <div>
                <strong><Localized pl="Alert kosztów" en="Cost alert" /></strong>
                <p><Localized pl="Kampanie z przekroczonym CPA wymagają decyzji właściciela konta." en="Campaigns above the CPA threshold require the account owner's decision." /></p>
              </div>
              <div>
                <strong><Localized pl="Jakość danych" en="Data quality" /></strong>
                <p><Localized pl="Dwa źródła mają opóźnienie synchronizacji i zostają widoczne niżej." en="Two sources are delayed and remain visible further down." /></p>
              </div>
              <div>
                <strong><Localized pl="Rekomendacje Papa" en="Papa recommendations" /></strong>
                <p><Localized pl="Dodatkowa treść udowadnia, że scroll należy do contentu." en="Additional content proves that scroll belongs to the content region." /></p>
              </div>
              <div>
                <strong><Localized pl="Historia zmian" en="Change history" /></strong>
                <p><Localized pl="Niższe wiersze są dostępne po przewinięciu tylko środka powłoki." en="Lower rows are reached by scrolling only the middle shell region." /></p>
              </div>
            </div>
          ) : null}
        </section>
        {hasPapaLayer ? (
          <aside className="pd-s5-app-shell__assistant" aria-label={copy({
            pl: 'Warstwa operacyjna powłoki',
            en: 'Operational shell layer',
          })}>
            <header>
              <span><Localized pl="Panel Papa" en="Papa panel" /></span>
              <strong><Localized pl="Kontekst" en="Context" /></strong>
            </header>
            <p><Localized pl="Własna rola i stała szerokość, oddzielone separatorem od canvasu." en="Own role and fixed width, separated from the canvas by a divider." /></p>
            <div aria-hidden="true">
              <span />
              <span />
            </div>
          </aside>
        ) : null}
        {hasSidebar ? (
          <div className="pd-s5-app-shell__mobile-drawer" aria-hidden="true">
            <span><Localized pl="Drawer nawigacji" en="Navigation drawer" /></span>
          </div>
        ) : null}
        {hasPapaLayer ? (
          <div className="pd-s5-app-shell__mobile-papa" aria-hidden="true">
            <span><Localized pl="Dolny panel Papa" en="Papa bottom panel" /></span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ShellVariant({
  title,
  children,
}: {
  readonly title: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <article className="pd-s5-shell-variant">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function ContentWidthDemo() {
  return (
    <div className="pd-s5-width-demo">
      <section data-width="wide">
        <span><Localized pl="Analiza" en="Analysis" /></span>
        <strong><Localized pl="Szeroki region treści" en="Wide content region" /></strong>
        <div className="pd-s5-metric-row">
          <div>
            <span>ROAS</span>
            <strong>4,82</strong>
          </div>
          <div>
            <span><Localized pl="Przychód" en="Revenue" /></span>
            <strong>248 420 zł</strong>
          </div>
          <div>
            <span><Localized pl="Marża" en="Margin" /></span>
            <strong>31,7%</strong>
          </div>
        </div>
      </section>
      <section data-width="form">
        <span><Localized pl="Formularz" en="Form" /></span>
        <strong><Localized pl="Ograniczona szerokość" en="Constrained width" /></strong>
        <div className="pd-s5-form-lines" aria-hidden="true">
          <AuthFieldDemo label={<Localized pl="Nazwa raportu" en="Report name" />} />
          <AuthFieldDemo label={<Localized pl="Zakres" en="Range" />} />
        </div>
      </section>
    </div>
  );
}

type DataColumn = {
  readonly id: string;
  readonly label: string;
  readonly required: boolean;
  readonly align?: 'left' | 'right';
};

type DataRow = {
  readonly id: string;
  readonly product: string;
  readonly sku: string;
  readonly orders: number;
  readonly revenue: number;
  readonly margin: string;
  readonly adCost: number;
  readonly status: string;
};

type ExportMode = 'visible' | 'all';
type SortDirection = 'asc' | 'desc';
type LaboratoryState = 'loading' | 'empty' | 'partial' | 'stale' | 'error';

type TableSort = {
  readonly columnId: string;
  readonly direction: SortDirection;
};

const dataColumns: ReadonlyArray<DataColumn> = [
  { id: 'product', label: 'Nazwa produktu', required: true },
  { id: 'sku', label: 'SKU', required: false },
  { id: 'orders', label: 'Zamówienia', required: false, align: 'right' },
  { id: 'revenue', label: 'Przychód', required: true, align: 'right' },
  { id: 'margin', label: 'Marża', required: false, align: 'right' },
  { id: 'adCost', label: 'Koszt reklamy', required: false, align: 'right' },
  { id: 'status', label: 'Status', required: false },
];

const tableRows: ReadonlyArray<DataRow> = [
  { id: 'row-1', product: 'Zestaw premium', sku: 'PD-PRE-01', orders: 128, revenue: 84200, margin: '34%', adCost: 18400, status: 'ready' },
  { id: 'row-2', product: 'Pakiet startowy', sku: 'PD-STA-02', orders: 96, revenue: 51600, margin: '29%', adCost: 12200, status: 'partial' },
  { id: 'row-3', product: 'Subskrypcja Pro', sku: 'PD-PRO-03', orders: 74, revenue: 68800, margin: '41%', adCost: 9800, status: 'ready' },
  { id: 'row-4', product: 'Dodatek analityczny', sku: 'PD-ANA-04', orders: 42, revenue: 23100, margin: '37%', adCost: 4400, status: 'stale' },
  { id: 'row-5', product: 'Migracja danych', sku: 'PD-MIG-05', orders: 21, revenue: 19500, margin: '33%', adCost: 2600, status: 'ready' },
];

const kpiVariants = [
  {
    id: 'basic',
    title: { pl: 'Podstawowy', en: 'Basic' },
    metric: { pl: 'Przychód', en: 'Revenue' },
    value: '248 420',
    unit: 'zł',
    note: { pl: 'Źródło: Commerce', en: 'Source: Commerce' },
    trend: 'none',
    microchart: false,
  },
  {
    id: 'trend',
    title: { pl: 'Z trendem', en: 'With trend' },
    metric: { pl: 'Zamówienia', en: 'Orders' },
    value: '1 284',
    unit: '',
    note: { pl: '+12,4% vs poprzedni okres', en: '+12.4% vs previous period' },
    trend: 'up',
    microchart: false,
  },
  {
    id: 'target',
    title: { pl: 'Z celem', en: 'With target' },
    metric: { pl: 'ROAS', en: 'ROAS' },
    value: '4,82',
    unit: '',
    note: { pl: 'Cel: 4,50, realizacja 107%', en: 'Target: 4.50, 107% reached' },
    trend: 'flat',
    microchart: false,
  },
  {
    id: 'deviation',
    title: { pl: 'Z odchyleniem', en: 'With deviation' },
    metric: { pl: 'Koszt zakupu', en: 'Cost per purchase' },
    value: '38,20',
    unit: 'zł',
    note: { pl: '-6,1% poniżej planu', en: '-6.1% below plan' },
    trend: 'down',
    microchart: false,
  },
  {
    id: 'microchart',
    title: { pl: 'Z mikrochartem', en: 'With microchart' },
    metric: { pl: 'AOV', en: 'AOV' },
    value: '193',
    unit: 'zł',
    note: { pl: 'Mikrotrend z subtelnym wypełnieniem', en: 'Microtrend with subtle fill' },
    trend: 'up',
    microchart: true,
  },
  {
    id: 'alert',
    title: { pl: 'Alarmowy', en: 'Alert' },
    metric: { pl: 'Koszt reklamy', en: 'Ad cost' },
    value: '46 800',
    unit: 'zł',
    note: { pl: 'Alarm: +18,2% ponad plan', en: 'Alert: +18.2% above plan' },
    trend: 'unknown',
    microchart: false,
  },
] as const;

const chartFamilies = [
  { id: 'trend', family: 'TrendChart', use: { pl: 'Trend w czasie, linia bazowa i opcjonalne punkty.', en: 'Trend over time, baseline and optional points.' }, kind: 'line' },
  { id: 'comparison', family: 'ComparisonChart', use: { pl: 'Porównanie kategorii, okresów albo stacked kategorii.', en: 'Comparison of categories, periods or stacked categories.' }, kind: 'bars' },
  { id: 'share', family: 'ShareChart', use: { pl: 'Udział w całości: kołowy, donut, bar albo stacked.', en: 'Share of whole: pie, donut, bar or stacked.' }, kind: 'donut' },
  { id: 'correlation', family: 'CorrelationChart', use: { pl: 'Zależność dwóch miar z linią trendu.', en: 'Relationship of two measures with trend line.' }, kind: 'scatter' },
  { id: 'forecast', family: 'ForecastChart', use: { pl: 'Wynik rzeczywisty, prognoza i zakres pewności.', en: 'Actual value, forecast and confidence range.' }, kind: 'forecast' },
  { id: 'waterfall', family: 'WaterfallChart', use: { pl: 'Składowe zmiany wyniku od startu do końca.', en: 'Contributors from start to final value.' }, kind: 'waterfall' },
  { id: 'funnel', family: 'FunnelChart', use: { pl: 'Konwersja etapów i spadki między krokami.', en: 'Stage conversion and drop-off between steps.' }, kind: 'funnel' },
] as const;

const chartFamilySemantics = {
  trend: {
    question: { pl: 'Czy tempo wzrostu utrzymuje się po zmianie budżetu?', en: 'Does growth pace hold after the budget change?' },
    xAxis: { pl: 'dzień', en: 'day' },
    yAxis: { pl: 'przychód', en: 'revenue' },
    layers: { pl: 'linia, baseline, punkt anomalii', en: 'line, baseline, anomaly point' },
    zoom: '125%',
  },
  comparison: {
    question: { pl: 'Który kanał odpowiada za zmianę wyniku?', en: 'Which channel accounts for the result change?' },
    xAxis: { pl: 'kanał', en: 'channel' },
    yAxis: { pl: 'wartość', en: 'value' },
    layers: { pl: 'słupki, stacked segment, benchmark', en: 'bars, stacked segment, benchmark' },
    zoom: '100%',
  },
  share: {
    question: { pl: 'Jak zmienił się udział źródeł w całości?', en: 'How did source share change within the whole?' },
    xAxis: { pl: 'kategoria', en: 'category' },
    yAxis: { pl: 'udział', en: 'share' },
    layers: { pl: 'donut, legenda, selected segment', en: 'donut, legend, selected segment' },
    zoom: '110%',
  },
  correlation: {
    question: { pl: 'Czy koszt i konwersja mają zależność operacyjną?', en: 'Do cost and conversion have an operational relationship?' },
    xAxis: { pl: 'koszt', en: 'cost' },
    yAxis: { pl: 'konwersja', en: 'conversion' },
    layers: { pl: 'punkty, regresja, outlier', en: 'points, regression, outlier' },
    zoom: '140%',
  },
  forecast: {
    question: { pl: 'Jaki zakres wyniku jest realistyczny do końca okresu?', en: 'What result range is realistic by period end?' },
    xAxis: { pl: 'czas', en: 'time' },
    yAxis: { pl: 'prognoza', en: 'forecast' },
    layers: { pl: 'actual, forecast, confidence band', en: 'actual, forecast, confidence band' },
    zoom: '90%',
  },
  waterfall: {
    question: { pl: 'Które czynniki budują zmianę wyniku?', en: 'Which factors build the result change?' },
    xAxis: { pl: 'czynnik', en: 'factor' },
    yAxis: { pl: 'zmiana', en: 'change' },
    layers: { pl: 'start, delta, total, negative delta', en: 'start, delta, total, negative delta' },
    zoom: '100%',
  },
  funnel: {
    question: { pl: 'Na którym etapie odpada największy wolumen?', en: 'At which stage does the largest volume drop?' },
    xAxis: { pl: 'etap', en: 'stage' },
    yAxis: { pl: 'wolumen', en: 'volume' },
    layers: { pl: 'stage width, drop-off, conversion label', en: 'stage width, drop-off, conversion label' },
    zoom: '115%',
  },
} satisfies Record<(typeof chartFamilies)[number]['id'], {
  readonly question: LocalizedCopy;
  readonly xAxis: LocalizedCopy;
  readonly yAxis: LocalizedCopy;
  readonly layers: LocalizedCopy;
  readonly zoom: string;
}>;

const laboratoryStateMap: Record<LaboratoryState, LocalizedCopy> = {
  loading: { pl: 'loading -> processing', en: 'loading -> processing' },
  empty: { pl: 'empty -> no data', en: 'empty -> no data' },
  partial: { pl: 'partial -> partial', en: 'partial -> partial' },
  stale: { pl: 'stale -> stale', en: 'stale -> stale' },
  error: { pl: 'error -> provider error', en: 'error -> provider error' },
};

function formatCell(columnId: string, row: DataRow) {
  const value = row[columnId as keyof DataRow];

  if (typeof value === 'number' && (columnId === 'revenue' || columnId === 'adCost')) {
    return `${value.toLocaleString('pl-PL')} zł`;
  }

  return String(value);
}

function DataSurface({
  kind,
  state = 'ready',
}: {
  readonly kind: 'kpi' | 'chart' | 'table' | 'detail' | 'drawer' | 'evidence' | 'recommendation' | 'status';
  readonly state?: 'ready' | LaboratoryState;
}) {
  const titles = {
    kpi: { pl: 'KPI', en: 'KPI' },
    chart: { pl: 'Wykres', en: 'Chart' },
    table: { pl: 'Tabela', en: 'Table' },
    detail: { pl: 'Szczegóły', en: 'Details' },
    drawer: { pl: 'Drawer', en: 'Drawer' },
    evidence: { pl: 'Dowody', en: 'Evidence' },
    recommendation: { pl: 'Rekomendacja', en: 'Recommendation' },
    status: { pl: 'Status danych', en: 'Data status' },
  } satisfies Record<typeof kind, LocalizedCopy>;

  const stateTone: Record<typeof state, StatusTone> = {
    ready: 'success',
    loading: 'info',
    empty: 'neutral',
    partial: 'warning',
    stale: 'warning',
    error: 'critical',
  };

  const title = copy(titles[kind]);

  return (
    <article className="pd-s5-data-surface" data-kind={kind} data-state={state}>
      <header>
        <div>
          <span><Localized pl="Powierzchnia danych" en="Data surface" /></span>
          <h3>{title}</h3>
        </div>
        <StatusBadge tone={stateTone[state]}>{state}</StatusBadge>
      </header>
      {kind === 'kpi' ? <DataKpiBody /> : null}
      {kind === 'chart' ? <DataChartBody state={state} /> : null}
      {kind === 'table' ? <DataTableBody state={state} /> : null}
      {kind === 'detail' ? <DataDetailBody /> : null}
      {kind === 'drawer' ? <DataDrawerBody /> : null}
      {kind === 'evidence' ? <DataEvidenceBody /> : null}
      {kind === 'recommendation' ? <DataRecommendationBody /> : null}
      {kind === 'status' ? <DataStatusBody /> : null}
      <DataMeta />
    </article>
  );
}

function DataMeta() {
  return (
    <footer className="pd-s5-data-meta">
      <span><Localized pl="Źródło: Commerce" en="Source: Commerce" /></span>
      <span><Localized pl="Zakres: 1-31 lip 2026" en="Range: Jul 1-31, 2026" /></span>
      <span><Localized pl="Aktualizacja: 2 min temu" en="Updated: 2 min ago" /></span>
    </footer>
  );
}

function TrendIndicator({
  trend,
}: {
  readonly trend: string;
}) {
  const label = {
    up: { pl: 'Trend wzrostowy', en: 'Up trend' },
    down: { pl: 'Trend spadkowy', en: 'Down trend' },
    flat: { pl: 'Trend płaski', en: 'Flat trend' },
    unknown: { pl: 'Trend nieustalony', en: 'Unknown trend' },
    none: { pl: 'Bez trendu', en: 'No trend' },
  }[trend] ?? { pl: 'Bez trendu', en: 'No trend' };

  const symbol = trend === 'up' ? '+' : trend === 'down' ? '-' : trend === 'flat' ? '=' : trend === 'unknown' ? '?' : 'i';

  return (
    <span className="pd-s5-kpi-trend" data-trend={trend} aria-label={copy(label)}>
      <span aria-hidden="true">{symbol}</span>
      {copy(label)}
    </span>
  );
}

function DataKpiBody() {
  return (
    <div className="pd-s5-data-surface__body pd-s5-kpi-body">
      <span><Localized pl="Przychód" en="Revenue" /></span>
      <strong>248 420 zł</strong>
      <p><Localized pl="+12,4% względem planu" en="+12.4% versus plan" /></p>
    </div>
  );
}

function KpiVariantMetric({
  variant,
}: {
  readonly variant: (typeof kpiVariants)[number];
}) {
  return (
    <article className="pd-s5-kpi-metric" data-variant={variant.id}>
      <header>
        <span>{copy(variant.title)}</span>
        <TrendIndicator trend={variant.trend} />
      </header>
      <div className="pd-s5-kpi-metric__value">
        <strong>{variant.value}</strong>
        {variant.unit ? <span>{variant.unit}</span> : null}
      </div>
      <p>{copy(variant.metric)}</p>
      {variant.microchart ? (
        <div className="pd-s5-kpi-metric__microchart" aria-label={copy({ pl: 'Mikrotrend AOV rośnie w drugiej połowie okresu', en: 'AOV microtrend grows in the second half of the period' })}>
          <span style={{ height: '36%' }} />
          <span style={{ height: '42%' }} />
          <span style={{ height: '54%' }} />
          <span style={{ height: '68%' }} />
          <span style={{ height: '76%' }} />
        </div>
      ) : null}
      <footer>
        <span>{copy(variant.note)}</span>
        <span><Localized pl="Zakres: 1-31 lip 2026" en="Range: Jul 1-31, 2026" /></span>
        <span><Localized pl="Aktualizacja: 2 min temu" en="Updated: 2 min ago" /></span>
      </footer>
    </article>
  );
}

function KpiVariantsSection() {
  return (
    <div className="pd-s5-kpi-variants">
      {kpiVariants.map((variant) => (
        <KpiVariantMetric key={variant.id} variant={variant} />
      ))}
    </div>
  );
}

function DataChartBody({
  state = 'ready',
}: {
  readonly state?: 'ready' | 'loading' | 'empty' | 'partial' | 'stale' | 'error';
}) {
  return (
    <div className="pd-s5-data-surface__body pd-s5-chart-frame" data-state={state}>
      <div className="pd-s5-chart-frame__header">
        <span><Localized pl="Przychód dzienny" en="Daily revenue" /></span>
        <span><Localized pl="sort: data" en="sort: data" /></span>
      </div>
      <div className="pd-s5-mini-chart" aria-hidden="true">
        <span style={{ height: state === 'empty' ? '0%' : '42%' }} />
        <span style={{ height: state === 'empty' ? '0%' : '70%' }} />
        <span style={{ height: state === 'empty' ? '0%' : state === 'partial' ? '24%' : '54%' }} />
        <span style={{ height: state === 'empty' ? '0%' : state === 'error' ? '18%' : '88%' }} />
        <span style={{ height: state === 'empty' ? '0%' : state === 'stale' ? '48%' : '64%' }} />
      </div>
      <p>
        {state === 'loading' ? <Localized pl="Ładowanie danych w tej samej ramie wykresu." en="Loading data in the same chart frame." /> : null}
        {state === 'empty' ? <Localized pl="Brak punktów po zastosowaniu filtrów." en="No points after filters." /> : null}
        {state === 'partial' ? <Localized pl="Część punktów pochodzi z opóźnionego źródła." en="Some points come from a delayed source." /> : null}
        {state === 'stale' ? <Localized pl="Dane są starsze niż oczekiwany próg świeżości." en="Data is older than the freshness threshold." /> : null}
        {state === 'error' ? <Localized pl="Błąd źródła nie zmienia geometrii wykresu." en="Source error does not change chart geometry." /> : null}
        {state === 'ready' ? <Localized pl="ChartFrame utrzymuje szerokość analityczną." en="ChartFrame keeps analytical width." /> : null}
      </p>
    </div>
  );
}

function DataTableBody({
  state = 'ready',
}: {
  readonly state?: 'ready' | 'loading' | 'empty' | 'partial' | 'stale' | 'error';
}) {
  return (
    <div className="pd-s5-data-surface__body pd-s5-table-frame" data-state={state}>
      <table>
        <thead>
          <tr>
            <th><Localized pl="Kanał" en="Channel" /></th>
            <th><Localized pl="Przychód" en="Revenue" /></th>
            <th>ROAS</th>
            <th><Localized pl="Status" en="Status" /></th>
          </tr>
        </thead>
        <tbody>
          {state === 'empty' ? (
            <tr>
              <td colSpan={4}><Localized pl="Brak danych dla wybranego zakresu." en="No data for the selected range." /></td>
            </tr>
          ) : (
            <>
              <tr data-selected="true">
                <td>Meta Ads</td>
                <td>124 800 zł</td>
                <td>4,91</td>
                <td><Localized pl="OK" en="OK" /></td>
              </tr>
              <tr>
                <td>Google Ads</td>
                <td>88 120 zł</td>
                <td>4,42</td>
                <td>{state === 'stale' ? <Localized pl="stale" en="stale" /> : <Localized pl="OK" en="OK" />}</td>
              </tr>
              <tr>
                <td>Organic</td>
                <td>{state === 'loading' ? '...' : '35 500 zł'}</td>
                <td>{state === 'error' ? '-' : '6,20'}</td>
                <td>{state === 'partial' ? <Localized pl="partial" en="partial" /> : <Localized pl="OK" en="OK" />}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ChartFamilyPreview({
  family,
}: {
  readonly family: (typeof chartFamilies)[number];
}) {
  const semantics = chartFamilySemantics[family.id];

  return (
    <article className="pd-s5-chart-family" data-chart-kind={family.kind}>
      <header>
        <span><Localized pl="Rodzina wykresu" en="Chart family" /></span>
        <h3>{family.family}</h3>
        <p>{copy(semantics.question)}</p>
      </header>
      <div className="pd-s5-chart-family__frame">
        <div className="pd-s5-chart-family__toolbar" aria-label={copy({ pl: 'Narzędzia wykresu', en: 'Chart tools' })}>
          <button type="button" aria-label={copy({ pl: 'Powiększ zakres', en: 'Zoom range' })}>
            <Icon decorative name="search" size={16} />
          </button>
          <button type="button" aria-label={copy({ pl: 'Pokaż dane źródłowe', en: 'Show source data' })}>
            <Icon decorative name="data" size={16} />
          </button>
          <button type="button" aria-label={copy({ pl: 'Wyjaśnij wykres', en: 'Explain chart' })}>
            <Icon decorative name="assistant" size={16} />
          </button>
          <output>{semantics.zoom}</output>
        </div>
        <div className="pd-s5-chart-family__visual" role="img" aria-label={`${family.family}: ${copy(family.use)} ${copy(semantics.layers)}`}>
          <svg viewBox="0 0 320 150">
            <defs>
              <filter id={`pd-s5-chart-shadow-${family.id}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="currentColor" floodOpacity="0.18" />
              </filter>
            </defs>
            <g className="pd-s5-chart-grid">
              <line x1="28" y1="24" x2="300" y2="24" />
              <line x1="28" y1="62" x2="300" y2="62" />
              <line x1="28" y1="100" x2="300" y2="100" />
              <line x1="28" y1="132" x2="300" y2="132" />
              <line x1="28" y1="20" x2="28" y2="132" />
            </g>
            {family.kind === 'line' ? (
              <g>
                <path className="pd-s5-chart-range" d="M34 104 C84 82 118 90 158 68 S232 48 292 28 L292 58 C226 70 194 92 154 100 S82 114 34 124 Z" />
                <path className="pd-s5-chart-primary" d="M34 112 C84 86 118 92 158 70 S232 50 292 34" filter={`url(#pd-s5-chart-shadow-${family.id})`} />
                <path className="pd-s5-chart-secondary" d="M34 122 C92 116 128 112 168 96 S236 78 292 70" />
                <circle className="pd-s5-chart-focus-point" cx="232" cy="50" r="5" />
              </g>
            ) : null}
            {family.kind === 'bars' ? (
              <g>
                <rect className="pd-s5-chart-bar" x="48" y="76" width="26" height="56" />
                <rect className="pd-s5-chart-bar" x="92" y="50" width="26" height="82" />
                <rect className="pd-s5-chart-bar" x="136" y="92" width="26" height="40" />
                <rect className="pd-s5-chart-bar pd-s5-chart-bar--secondary" x="180" y="62" width="26" height="70" />
                <rect className="pd-s5-chart-bar pd-s5-chart-bar--secondary" x="224" y="36" width="26" height="96" />
                <line className="pd-s5-chart-benchmark" x1="40" y1="64" x2="270" y2="64" />
              </g>
            ) : null}
            {family.kind === 'donut' ? (
              <g>
                <circle className="pd-s5-chart-donut-base" cx="110" cy="76" r="42" />
                <path className="pd-s5-chart-donut-active" d="M110 34 A42 42 0 0 1 148 94" />
                <rect className="pd-s5-chart-legend-bar" x="184" y="48" width="72" height="8" />
                <rect className="pd-s5-chart-legend-bar" x="184" y="72" width="48" height="8" />
                <rect className="pd-s5-chart-legend-bar" x="184" y="96" width="60" height="8" />
              </g>
            ) : null}
            {family.kind === 'scatter' ? (
              <g>
                <path className="pd-s5-chart-secondary" d="M52 116 L266 36" />
                <circle className="pd-s5-chart-dot" cx="70" cy="106" r="5" />
                <circle className="pd-s5-chart-dot" cx="106" cy="96" r="5" />
                <circle className="pd-s5-chart-dot" cx="154" cy="78" r="5" />
                <circle className="pd-s5-chart-dot" cx="202" cy="62" r="5" />
                <circle className="pd-s5-chart-focus-point" cx="248" cy="42" r="6" />
              </g>
            ) : null}
            {family.kind === 'forecast' ? (
              <g>
                <path className="pd-s5-chart-range" d="M156 72 L288 42 L288 92 L156 102 Z" />
                <path className="pd-s5-chart-primary" d="M40 112 C88 96 116 88 156 72" />
                <path className="pd-s5-chart-primary pd-s5-chart-primary--projected" d="M156 72 C204 54 238 48 288 42" />
                <path className="pd-s5-chart-secondary pd-s5-chart-primary--projected" d="M156 102 C208 102 242 96 288 92" />
              </g>
            ) : null}
            {family.kind === 'waterfall' ? (
              <g>
                <rect className="pd-s5-chart-bar" x="48" y="86" width="30" height="46" />
                <rect className="pd-s5-chart-bar pd-s5-chart-bar--secondary" x="98" y="58" width="30" height="28" />
                <rect className="pd-s5-chart-bar pd-s5-chart-bar--negative" x="148" y="86" width="30" height="22" />
                <rect className="pd-s5-chart-bar" x="198" y="40" width="30" height="92" />
                <line className="pd-s5-chart-benchmark" x1="44" y1="86" x2="232" y2="86" />
              </g>
            ) : null}
            {family.kind === 'funnel' ? (
              <g>
                <path className="pd-s5-chart-funnel" d="M52 34 H268 L242 62 H78 Z" />
                <path className="pd-s5-chart-funnel pd-s5-chart-funnel--secondary" d="M82 70 H238 L212 98 H108 Z" />
                <path className="pd-s5-chart-funnel pd-s5-chart-funnel--tertiary" d="M116 106 H204 L188 128 H132 Z" />
              </g>
            ) : null}
            <rect className="pd-s5-chart-brush" x="196" y="18" width="72" height="116" />
          </svg>
          <span className="pd-s5-chart-family__tooltip"><Localized pl="insight + punkt + źródło" en="insight + point + source" /></span>
        </div>
      </div>
      <dl className="pd-s5-chart-family__semantics">
        <div><dt>X</dt><dd>{copy(semantics.xAxis)}</dd></div>
        <div><dt>Y</dt><dd>{copy(semantics.yAxis)}</dd></div>
        <div><dt><Localized pl="Warstwy" en="Layers" /></dt><dd>{copy(semantics.layers)}</dd></div>
        <div><dt><Localized pl="Fallback" en="Fallback" /></dt><dd><Localized pl="tabela alternatywna" en="alternative table" /></dd></div>
      </dl>
    </article>
  );
}

function ChartFamiliesSection() {
  return (
    <div className="pd-s5-chart-family-grid">
      {chartFamilies.map((family) => (
        <ChartFamilyPreview key={family.id} family={family} />
      ))}
    </div>
  );
}

function FullChartFrameDemo() {
  return (
    <article className="pd-s5-full-chartframe">
      <header>
        <div>
          <span><Localized pl="Pytanie biznesowe" en="Business question" /></span>
          <h3><Localized pl="Czy przychód rośnie szybciej niż koszt reklamy?" en="Is revenue growing faster than ad cost?" /></h3>
          <p><Localized pl="Porównanie kanałów sprzedaży dla aktywnego zakresu i poprzedniego okresu." en="Sales-channel comparison for the active range and previous period." /></p>
        </div>
        <div className="pd-s5-chartframe-state">
          <StatusBadge tone="success"><Localized pl="ready" en="ready" /></StatusBadge>
          <span><Localized pl="zoom 125%" en="zoom 125%" /></span>
        </div>
      </header>
      <dl className="pd-s5-chartframe-contract">
        <div><dt><Localized pl="Zakres" en="Range" /></dt><dd>1-31 lip 2026</dd></div>
        <div><dt><Localized pl="Porównanie" en="Compare" /></dt><dd><Localized pl="poprzedni okres" en="previous period" /></dd></div>
        <div><dt><Localized pl="Metryka" en="Metric" /></dt><dd><Localized pl="przychód vs koszt" en="revenue vs cost" /></dd></div>
        <div><dt><Localized pl="Źródło" en="Source" /></dt><dd>Commerce + Ads</dd></div>
      </dl>
      <div className="pd-s5-chartframe-workbench">
        <div className="pd-s5-chartframe-toolbar" aria-label={copy({ pl: 'Narzędzia ChartFrame', en: 'ChartFrame tools' })}>
          <button type="button" aria-label={copy({ pl: 'Powiększ zakres wykresu', en: 'Zoom chart range' })}>
            <Icon decorative name="search" size={16} />
          </button>
          <button type="button" aria-label={copy({ pl: 'Pokaż tabelę alternatywną', en: 'Show alternative table' })}>
            <Icon decorative name="data" size={16} />
          </button>
          <button type="button" aria-label={copy({ pl: 'Wyjaśnij przez Papa', en: 'Explain with Papa' })}>
            <Icon decorative name="assistant" size={16} />
          </button>
          <output><Localized pl="brush: 18-28 lip" en="brush: Jul 18-28" /></output>
        </div>
        <div className="pd-s5-chartframe-main">
          <div className="pd-s5-chartframe-axis" aria-hidden="true">
            <span>300k</span>
            <span>225k</span>
            <span>150k</span>
            <span>75k</span>
            <span>0</span>
          </div>
          <div className="pd-s5-chartframe-plot" role="img" aria-label={copy({ pl: 'Wykres liniowy pokazuje przychód powyżej kosztu reklamy, zakres ufności, brush zoom i adnotację po zmianie budżetu', en: 'Line chart shows revenue above ad cost, confidence range, zoom brush and annotation after budget change' })}>
            <svg viewBox="0 0 640 260">
              <defs>
                <filter id="pd-s5-full-chartframe-shadow" x="-16%" y="-16%" width="132%" height="132%">
                  <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="currentColor" floodOpacity="0.18" />
                </filter>
              </defs>
              <g className="pd-s5-chartframe-grid" aria-hidden="true">
                <line x1="54" y1="34" x2="610" y2="34" />
                <line x1="54" y1="82" x2="610" y2="82" />
                <line x1="54" y1="130" x2="610" y2="130" />
                <line x1="54" y1="178" x2="610" y2="178" />
                <line x1="54" y1="226" x2="610" y2="226" />
                <line x1="54" y1="34" x2="54" y2="226" />
                <line x1="190" y1="34" x2="190" y2="226" />
                <line x1="326" y1="34" x2="326" y2="226" />
                <line x1="462" y1="34" x2="462" y2="226" />
                <line x1="598" y1="34" x2="598" y2="226" />
              </g>
              <path className="pd-s5-chartframe-band" d="M64 184 C142 154 190 168 254 126 S384 92 586 58 L586 94 C402 114 360 142 262 156 S150 194 64 208 Z" />
              <rect className="pd-s5-chartframe-brush" x="354" y="28" width="154" height="204" />
              <path className="pd-s5-chartframe-line pd-s5-chartframe-line--revenue" d="M64 196 C142 158 190 170 254 128 S384 94 586 66" filter="url(#pd-s5-full-chartframe-shadow)" />
              <path className="pd-s5-chartframe-line pd-s5-chartframe-line--cost" d="M64 214 C148 198 206 202 284 174 S424 152 586 126" />
              <path className="pd-s5-chartframe-line pd-s5-chartframe-line--benchmark" d="M64 168 C158 164 238 160 326 154 S492 140 586 132" />
              <line className="pd-s5-chartframe-threshold" x1="54" y1="118" x2="610" y2="118" />
              <circle className="pd-s5-chartframe-point" cx="402" cy="94" r="6" />
              <circle className="pd-s5-chartframe-point pd-s5-chartframe-point--cost" cx="402" cy="152" r="5" />
              <line className="pd-s5-chartframe-annotation-line" x1="402" y1="94" x2="492" y2="50" />
            </svg>
            <div className="pd-s5-chartframe-tooltip">
              <strong>18 lip</strong>
              <span><Localized pl="Przychód: 12 800 zł" en="Revenue: PLN 12,800" /></span>
              <span><Localized pl="Koszt: 4 200 zł" en="Cost: PLN 4,200" /></span>
              <span><Localized pl="ROAS: 3,05" en="ROAS: 3.05" /></span>
            </div>
            <span className="pd-s5-chartframe-annotation"><Localized pl="Wzrost po zmianie budżetu" en="Lift after budget change" /></span>
          </div>
        </div>
        <div className="pd-s5-chartframe-zoomrail" aria-label={copy({ pl: 'Zakres zoomu', en: 'Zoom range' })}>
          <span />
          <span data-active="true" />
          <span data-active="true" />
          <span />
        </div>
      </div>
      <footer className="pd-s5-chartframe-footer">
        <div className="pd-s5-chartframe-legend">
          <span><i data-series="revenue" /> <Localized pl="Przychód" en="Revenue" /></span>
          <span><i data-series="cost" /> <Localized pl="Koszt reklamy" en="Ad cost" /></span>
          <span><i data-series="benchmark" /> <Localized pl="Benchmark" en="Benchmark" /></span>
        </div>
        <p><Localized pl="Narracja: wzrost przychodu jest stabilny, ale dwa kanały wymagają kontroli kosztu." en="Narrative: revenue growth is stable, but two channels need cost control." /></p>
      </footer>
      <div className="pd-s5-chartframe-alt-table">
        <span><Localized pl="Tabela alternatywna" en="Alternative table" /></span>
        <table>
          <tbody>
            <tr><td>Meta Ads</td><td>124 800 zł</td><td>4,91 ROAS</td></tr>
            <tr><td>Google Ads</td><td>88 120 zł</td><td>4,42 ROAS</td></tr>
          </tbody>
        </table>
      </div>
      <DataMeta />
    </article>
  );
}

function FullChartFrameSection() {
  return <FullChartFrameDemo />;
}

type SurfaceSelectOption = {
  readonly label: string;
  readonly value: string;
};

function SurfaceSelect({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: ReadonlyArray<SurfaceSelectOption>;
  readonly onChange: (value: string) => void;
}) {
  return (
    <Select
      className="pd-s5-surface-select"
      label={label}
      onChange={(event) => onChange(event.target.value)}
      options={options}
      placeholder={label}
      value={value}
    />
  );
}

function TableToolButton({
  label,
  icon,
  onClick,
  disabled = false,
}: {
  readonly label: string;
  readonly icon: PapaDataIconName;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className="pd-s5-table-tool-button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon decorative name={icon} size={16} />
    </button>
  );
}

function ColumnPickerDemo({
  columns,
  visibleColumnIds,
  onToggle,
}: {
  readonly columns: ReadonlyArray<DataColumn>;
  readonly visibleColumnIds: ReadonlyArray<string>;
  readonly onToggle: (columnId: string) => void;
}) {
  return (
    <fieldset className="pd-s5-column-picker">
      <legend><Localized pl="Kolumny" en="Columns" /></legend>
      {columns.map((column) => {
        const checked = column.required || visibleColumnIds.includes(column.id);

        return (
          <label key={column.id} data-required={column.required ? 'true' : 'false'}>
            <input
              type="checkbox"
              checked={checked}
              disabled={column.required}
              onChange={() => onToggle(column.id)}
            />
            <span>{column.label}</span>
            {column.required ? <em>required</em> : null}
          </label>
        );
      })}
    </fieldset>
  );
}

function ExportPreview({
  exportMode,
  exportColumns,
  filter,
  sort,
  rowCount,
}: {
  readonly exportMode: ExportMode;
  readonly exportColumns: ReadonlyArray<DataColumn>;
  readonly filter: string;
  readonly sort: TableSort;
  readonly rowCount: number;
}) {
  return (
    <aside className="pd-s5-export-preview">
      <header>
        <span><Localized pl="Panel roboczy" en="Work panel" /></span>
        <h3><Localized pl="Podgląd eksportu" en="Export preview" /></h3>
      </header>
      <dl>
        <div><dt><Localized pl="Opcja" en="Option" /></dt><dd>{exportMode === 'visible' ? 'Eksportuj widoczne kolumny' : 'Eksportuj wszystkie kolumny'}</dd></div>
        <div><dt><Localized pl="Kolumny" en="Columns" /></dt><dd>{exportColumns.map((column) => column.label).join(', ')}</dd></div>
        <div><dt><Localized pl="Filtr" en="Filter" /></dt><dd>{filter || 'brak'}</dd></div>
        <div><dt><Localized pl="Sortowanie" en="Sort" /></dt><dd>{sort.columnId} {sort.direction}</dd></div>
        <div><dt><Localized pl="Rekordy" en="Rows" /></dt><dd>{rowCount}</dd></div>
        <div><dt><Localized pl="Zakres" en="Range" /></dt><dd>1-31 lip 2026</dd></div>
      </dl>
      <p><Localized pl="To jest podgląd eksportu; plik nie został wygenerowany." en="This is an export preview; no file has been generated." /></p>
    </aside>
  );
}

function TableSystemDemo({
  visibleColumnIds,
  setVisibleColumnIds,
  filter,
  setFilter,
  sort,
  setSort,
  selectedRowIds,
  setSelectedRowIds,
  page,
  setPage,
  pageSize,
  setPageSize,
  isCollapsedToOneRow,
  setIsCollapsedToOneRow,
  openDetailRowId,
  setOpenDetailRowId,
  exportMode,
  setExportMode,
}: {
  readonly visibleColumnIds: ReadonlyArray<string>;
  readonly setVisibleColumnIds: (value: string[]) => void;
  readonly filter: string;
  readonly setFilter: (value: string) => void;
  readonly sort: TableSort;
  readonly setSort: (value: TableSort) => void;
  readonly selectedRowIds: ReadonlyArray<string>;
  readonly setSelectedRowIds: (value: string[]) => void;
  readonly page: number;
  readonly setPage: (value: number) => void;
  readonly pageSize: number;
  readonly setPageSize: (value: number) => void;
  readonly isCollapsedToOneRow: boolean;
  readonly setIsCollapsedToOneRow: (value: boolean) => void;
  readonly openDetailRowId: string | null;
  readonly setOpenDetailRowId: (value: string | null) => void;
  readonly exportMode: ExportMode;
  readonly setExportMode: (value: ExportMode) => void;
}) {
  const requiredColumnIds = dataColumns.filter((column) => column.required).map((column) => column.id);
  const normalizedVisibleIds = Array.from(new Set([...requiredColumnIds, ...visibleColumnIds]));
  const visibleColumns = dataColumns.filter((column) => normalizedVisibleIds.includes(column.id));

  const filteredRows = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();

    if (!normalizedFilter) {
      return tableRows;
    }

    return tableRows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(normalizedFilter)));
  }, [filter]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const first = a[sort.columnId as keyof DataRow];
      const second = b[sort.columnId as keyof DataRow];
      const result = typeof first === 'number' && typeof second === 'number'
        ? first - second
        : String(first).localeCompare(String(second), 'pl');

      if (result === 0) {
        return a.id.localeCompare(b.id);
      }

      return sort.direction === 'asc' ? result : -result;
    });
  }, [filteredRows, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pagedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const displayRows = isCollapsedToOneRow ? pagedRows.slice(0, 1) : pagedRows;
  const exportColumns = exportMode === 'visible' ? visibleColumns : dataColumns;
  const openDetailRow = openDetailRowId ? filteredRows.find((row) => row.id === openDetailRowId) : null;
  const rangeStart = sortedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, sortedRows.length);
  const [showColumnControls, setShowColumnControls] = useState(false);

  function toggleColumn(columnId: string) {
    if (requiredColumnIds.includes(columnId)) {
      return;
    }

    const next = normalizedVisibleIds.includes(columnId)
      ? normalizedVisibleIds.filter((id) => id !== columnId)
      : [...normalizedVisibleIds, columnId];

    setVisibleColumnIds(Array.from(new Set([...requiredColumnIds, ...next])));
  }

  function toggleSort(columnId: string) {
    setSort({
      columnId,
      direction: sort.columnId === columnId && sort.direction === 'asc' ? 'desc' : 'asc',
    });
  }

  function toggleSelected(rowId: string) {
    setSelectedRowIds(selectedRowIds.includes(rowId)
      ? selectedRowIds.filter((id) => id !== rowId)
      : [...selectedRowIds, rowId]);
  }

  return (
    <div className="pd-s5-table-demo">
      <article className="pd-s5-table-system">
        <dl className="pd-s5-table-contract" aria-label={copy({ pl: 'Kontrakt tabeli', en: 'Table contract' })}>
          <div><dt><Localized pl="Widok" en="View" /></dt><dd><Localized pl="Produkty" en="Products" /></dd></div>
          <div><dt><Localized pl="Rekordy" en="Rows" /></dt><dd>{sortedRows.length}</dd></div>
          <div><dt><Localized pl="Sort" en="Sort" /></dt><dd>{sort.columnId} {sort.direction}</dd></div>
          <div><dt><Localized pl="Zaznaczone" en="Selected" /></dt><dd>{selectedRowIds.length}</dd></div>
        </dl>
        <div className="pd-s5-table-toolbar" aria-label={copy({ pl: 'Toolbar tabeli', en: 'Table toolbar' })}>
          <div className="pd-s5-table-toolbar__group" data-group="search">
            <label>
              <span><Localized pl="Szukaj" en="Search" /></span>
              <input
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setPage(1);
                }}
              />
            </label>
            <TableToolButton
              icon="search"
              label={copy({ pl: 'Wyczyść filtry', en: 'Clear filters' })}
              onClick={() => {
                setFilter('');
                setPage(1);
              }}
            />
          </div>
          <div className="pd-s5-table-toolbar__group" data-group="scope">
            <span className="pd-s5-table-static-field">
              <span><Localized pl="Zakres" en="Range" /></span>
              <strong>1-31 lip 2026</strong>
            </span>
            <span className="pd-s5-table-static-field">
              <span><Localized pl="Filtry" en="Filters" /></span>
              <strong>1</strong>
            </span>
          </div>
          <div className="pd-s5-table-toolbar__group" data-group="view">
            <TableToolButton
              icon="data"
              label={copy(showColumnControls
                ? { pl: 'Ukryj wybór kolumn', en: 'Hide column picker' }
                : { pl: 'Pokaż wybór kolumn', en: 'Show column picker' })}
              onClick={() => setShowColumnControls(!showColumnControls)}
            />
            <span className="pd-s5-table-static-field">
              <span><Localized pl="Kolumny" en="Columns" /></span>
              <strong>{visibleColumns.length}/{dataColumns.length}</strong>
            </span>
            <div className="pd-s5-table-segment" aria-label={copy({ pl: 'Gęstość tabeli', en: 'Table density' })}>
              <button type="button" data-active="true">compact</button>
              <button type="button">comfortable</button>
            </div>
          </div>
          <div className="pd-s5-table-toolbar__group" data-group="actions">
            <TableToolButton
              icon="data"
              label={copy(isCollapsedToOneRow
                ? { pl: 'Pokaż pełną tabelę', en: 'Show full table' }
                : { pl: 'Zwiń do 1 wiersza', en: 'Collapse to 1 row' })}
              onClick={() => setIsCollapsedToOneRow(!isCollapsedToOneRow)}
            />
            <div className="pd-s5-table-segment" aria-label={copy({ pl: 'Tryb eksportu', en: 'Export mode' })}>
              <button type="button" data-active={exportMode === 'visible' ? 'true' : undefined} onClick={() => setExportMode('visible')}>
                <Localized pl="widoczne" en="visible" />
              </button>
              <button type="button" data-active={exportMode === 'all' ? 'true' : undefined} onClick={() => setExportMode('all')}>
                <Localized pl="wszystkie" en="all" />
              </button>
            </div>
          </div>
        </div>
        {showColumnControls ? (
          <div className="pd-s5-column-strip">
            <ColumnPickerDemo columns={dataColumns} visibleColumnIds={normalizedVisibleIds} onToggle={toggleColumn} />
          </div>
        ) : null}

        <div className="pd-s5-table-frame pd-s5-table-frame--system">
          {selectedRowIds.length > 0 ? (
            <div className="pd-s5-bulk-action-bar">
              <strong>{selectedRowIds.length}</strong>
              <span><Localized pl="zaznaczone rekordy" en="selected rows" /></span>
              <TableToolButton icon="trend" label={copy({ pl: 'Porównaj zaznaczone rekordy', en: 'Compare selected rows' })} />
            </div>
          ) : null}
          <table>
            <thead>
              <tr>
                <th><Localized pl="Wybór" en="Select" /></th>
                {visibleColumns.map((column) => (
                  <th key={column.id} data-align={column.align ?? 'left'}>
                    <button type="button" onClick={() => toggleSort(column.id)}>
                      <span>{column.label}</span>
                      {sort.columnId === column.id ? <span>{sort.direction}</span> : null}
                    </button>
                  </th>
                ))}
                <th><Localized pl="Akcja" en="Action" /></th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={row.id} data-selected={selectedRowIds.includes(row.id) ? 'true' : 'false'}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRowIds.includes(row.id)}
                      onChange={() => toggleSelected(row.id)}
                      aria-label={`${copy({ pl: 'Zaznacz', en: 'Select' })} ${row.product}`}
                    />
                  </td>
                  {visibleColumns.map((column) => (
                    <td key={column.id} data-align={column.align ?? 'left'}>{formatCell(column.id, row)}</td>
                  ))}
                  <td>
                    <TableToolButton
                      icon="data"
                      label={`${copy({ pl: 'Pokaż szczegóły', en: 'Show details' })}: ${row.product}`}
                      onClick={() => setOpenDetailRowId(row.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="pd-s5-table-pagination">
          <span>{`${rangeStart}-${rangeEnd} z ${sortedRows.length}`}</span>
          <div className="pd-s5-table-segment" aria-label="page size">
            {[2, 3, 5].map((size) => (
              <button
                key={size}
                type="button"
                data-active={pageSize === size ? 'true' : undefined}
                onClick={() => {
                  setPageSize(size);
                  setPage(1);
                }}
              >
                {size}
              </button>
            ))}
          </div>
          <TableToolButton
            disabled={currentPage === 1}
            icon="trend"
            label={copy({ pl: 'Poprzednia strona', en: 'Previous page' })}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
          />
          <span>{`${currentPage}/${totalPages}`}</span>
          <TableToolButton
            disabled={currentPage === totalPages}
            icon="trend"
            label={copy({ pl: 'Następna strona', en: 'Next page' })}
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          />
        </footer>
      </article>

      <div className="pd-s5-table-side-panel">
        <ExportPreview exportMode={exportMode} exportColumns={exportColumns} filter={filter} sort={sort} rowCount={sortedRows.length} />
        <aside className="pd-s5-table-detail">
          <header>
            <span><Localized pl="Panel roboczy" en="Work panel" /></span>
            <h3><Localized pl="Panel szczegółów" en="Detail panel" /></h3>
          </header>
          {openDetailRow ? (
            <dl>
              <div><dt><Localized pl="Produkt" en="Product" /></dt><dd>{openDetailRow.product}</dd></div>
              <div><dt>SKU</dt><dd>{openDetailRow.sku}</dd></div>
              <div><dt><Localized pl="Przychód" en="Revenue" /></dt><dd>{formatCell('revenue', openDetailRow)}</dd></div>
            </dl>
          ) : (
            <p><Localized pl="Wybierz rekord w tabeli, aby zobaczyć szczegóły." en="Select a row in the table to see details." /></p>
          )}
        </aside>
      </div>
    </div>
  );
}

function TableSystemSection() {
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(dataColumns.map((column) => column.id));
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<TableSort>({ columnId: 'revenue', direction: 'desc' });
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['row-1']);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [isCollapsedToOneRow, setIsCollapsedToOneRow] = useState(false);
  const [openDetailRowId, setOpenDetailRowId] = useState<string | null>('row-1');
  const [exportMode, setExportMode] = useState<ExportMode>('visible');

  return (
    <TableSystemDemo
      visibleColumnIds={visibleColumnIds}
      setVisibleColumnIds={setVisibleColumnIds}
      filter={filter}
      setFilter={setFilter}
      sort={sort}
      setSort={setSort}
      selectedRowIds={selectedRowIds}
      setSelectedRowIds={setSelectedRowIds}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      isCollapsedToOneRow={isCollapsedToOneRow}
      setIsCollapsedToOneRow={setIsCollapsedToOneRow}
      openDetailRowId={openDetailRowId}
      setOpenDetailRowId={setOpenDetailRowId}
      exportMode={exportMode}
      setExportMode={setExportMode}
    />
  );
}

function DataDetailBody() {
  return (
    <div className="pd-s5-data-surface__body pd-s5-detail-body">
      <dl>
        <div><dt><Localized pl="Kanał" en="Channel" /></dt><dd>Meta Ads</dd></div>
        <div><dt>ROAS</dt><dd>4,91</dd></div>
        <div><dt><Localized pl="Zmiana" en="Change" /></dt><dd>+8,2%</dd></div>
      </dl>
    </div>
  );
}

function DataDrawerBody() {
  return (
    <div className="pd-s5-data-surface__body pd-s5-drawer-stage">
      <div className="pd-s5-drawer-stage__canvas" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <aside>
        <button type="button" aria-label={copy({ pl: 'Zamknij drawer', en: 'Close drawer' })}>X</button>
        <strong><Localized pl="Szczegóły kampanii" en="Campaign details" /></strong>
        <p><Localized pl="Czasowa warstwa nad treścią z technicznym oddzieleniem." en="Temporary layer above content with technical separation." /></p>
      </aside>
    </div>
  );
}

function DataEvidenceBody() {
  return (
    <div className="pd-s5-data-surface__body pd-s5-evidence-body">
      <div><strong>Commerce export</strong><span>1-31 lip 2026 · <Localized pl="zgodne" en="valid" /></span></div>
      <div><strong>GA4 revenue report</strong><span>1-31 lip 2026 · <Localized pl="częściowe" en="partial" /></span></div>
      <div><strong>Orders reconciliation</strong><span>31 lip 2026 · <Localized pl="OK" en="OK" /></span></div>
    </div>
  );
}

function DataRecommendationBody() {
  return (
    <div className="pd-s5-data-surface__body pd-s5-recommendation-body">
      <strong><Localized pl="Przesuń 12% budżetu do kampanii premium." en="Move 12% of budget to premium campaigns." /></strong>
      <p><Localized pl="Wniosek wynika ze wzrostu ROAS i stabilnej marży w trzech źródłach." en="The conclusion comes from ROAS growth and stable margin across three sources." /></p>
      <div>
        <span><Localized pl="Pewność" en="Confidence" /></span>
        <strong>82%</strong>
      </div>
      <footer>
        <button type="button" aria-label={copy({ pl: 'Pokaż dowody', en: 'Show evidence' })}>
          <Icon decorative name="data" size={16} />
        </button>
        <button type="button" aria-label={copy({ pl: 'Przygotuj wariant', en: 'Prepare variant' })}>
          <Icon decorative name="trend" size={16} />
        </button>
      </footer>
    </div>
  );
}

function DataStatusBody() {
  return (
    <div className="pd-s5-data-surface__body pd-s5-status-body">
      <div><span>Commerce</span><strong><Localized pl="aktualne" en="fresh" /></strong></div>
      <div><span>GA4</span><strong><Localized pl="2 min temu" en="2 min ago" /></strong></div>
      <div><span>CRM</span><strong><Localized pl="kolejka" en="queued" /></strong></div>
    </div>
  );
}

function SurfaceStatePreview({
  surface,
  state,
}: {
  readonly surface: 'kpi' | 'chart' | 'table';
  readonly state: LaboratoryState;
}) {
  return (
    <article className="pd-s5-state-preview" data-surface={surface} data-state={state}>
      <header>
        <span>{surface}</span>
        <StatusBadge tone={state === 'error' ? 'critical' : state === 'empty' ? 'neutral' : state === 'loading' ? 'info' : 'warning'}>{state}</StatusBadge>
      </header>
      <div className="pd-s5-state-preview__frame">
        {surface === 'kpi' ? <KpiVariantMetric variant={kpiVariants[state === 'empty' ? 0 : state === 'error' ? 5 : 1]} /> : null}
        {surface === 'chart' ? <DataChartBody state={state} /> : null}
        {surface === 'table' ? <DataTableBody state={state} /> : null}
      </div>
      <footer>{copy(laboratoryStateMap[state])}</footer>
    </article>
  );
}

function SurfaceStatesSection() {
  const states: ReadonlyArray<LaboratoryState> = ['loading', 'empty', 'partial', 'stale', 'error'];
  const groups: ReadonlyArray<{
    readonly surface: 'kpi' | 'chart' | 'table';
    readonly title: LocalizedCopy;
    readonly description: LocalizedCopy;
  }> = [
    {
      surface: 'kpi',
      title: { pl: 'KPI', en: 'KPI' },
      description: { pl: 'Ten sam blok metryki zachowuje miejsce nazwy stanu, wartości i metadanych.', en: 'The same metric block keeps state name, value and metadata placement.' },
    },
    {
      surface: 'chart',
      title: { pl: 'ChartFrame', en: 'ChartFrame' },
      description: { pl: 'Nagłówek, status i geometria wykresu pozostają stabilne.', en: 'Header, status and chart geometry remain stable.' },
    },
    {
      surface: 'table',
      title: { pl: 'Tabela', en: 'Table' },
      description: { pl: 'Tabela zachowuje nagłówki, wiersze zastępcze i komunikat konkretnej przyczyny.', en: 'The table keeps headers, placeholder rows and a concrete cause message.' },
    },
  ];

  return (
    <div className="pd-s5-state-groups">
      {groups.map((group) => (
        <section key={group.surface} className="pd-s5-state-group">
          <header>
            <h3>{copy(group.title)}</h3>
            <p>{copy(group.description)}</p>
          </header>
          <div className="pd-s5-state-matrix">
            {states.map((state) => (
              <SurfaceStatePreview key={`${group.surface}-${state}`} surface={group.surface} state={state} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function WorkPanelsContextDemo() {
  return (
    <div className="pd-s5-work-context">
      <section className="pd-s5-work-context__canvas">
        <header>
          <h3><Localized pl="Tabela produktów" en="Product table" /></h3>
          <StatusBadge tone="info"><Localized pl="wybrany wiersz" en="selected row" /></StatusBadge>
        </header>
        <DataTableBody />
      </section>
      <aside className="pd-s5-work-context__panel">
        <header>
          <span><Localized pl="Panel roboczy" en="Work panel" /></span>
          <h3><Localized pl="Szczegóły" en="Details" /></h3>
        </header>
        <DataDetailBody />
      </aside>
      <aside className="pd-s5-work-context__panel">
        <header>
          <span><Localized pl="Panel roboczy" en="Work panel" /></span>
          <h3><Localized pl="Dowody" en="Evidence" /></h3>
        </header>
        <DataEvidenceBody />
      </aside>
      <aside className="pd-s5-work-context__panel pd-s5-work-context__panel--wide">
        <header>
          <span><Localized pl="Panel roboczy" en="Work panel" /></span>
          <h3><Localized pl="Rekomendacja" en="Recommendation" /></h3>
        </header>
        <DataRecommendationBody />
      </aside>
      <aside className="pd-s5-work-context__panel">
        <header>
          <span><Localized pl="Panel roboczy" en="Work panel" /></span>
          <h3><Localized pl="Status danych" en="Data status" /></h3>
        </header>
        <DataStatusBody />
      </aside>
    </div>
  );
}

function WorkPanelsContextSection() {
  return <WorkPanelsContextDemo />;
}

const surfaceRoles = [
  {
    id: 'kpi',
    name: { pl: 'KPI', en: 'KPI' },
    category: { pl: 'Powierzchnia główna', en: 'Main surface' },
    responsibility: { pl: 'Pojedyncza metryka i jej znaczenie operacyjne.', en: 'Single metric and its operational meaning.' },
    allowed: { pl: 'Tylko gdy metryka ma własną nazwę, wartość, zakres i świeżość.', en: 'Only when the metric owns a name, value, range and freshness.' },
    metadata: { pl: 'Źródło, zakres, aktualizacja, trend lub cel.', en: 'Source, range, update time, trend or target.' },
  },
  {
    id: 'chart',
    name: { pl: 'Wykres', en: 'Chart' },
    category: { pl: 'Powierzchnia główna', en: 'Main surface' },
    responsibility: { pl: 'Odpowiada na pytanie analityczne wizualizacją danych.', en: 'Answers an analytical question with data visualization.' },
    allowed: { pl: 'Tylko gdy ma pytanie, serię danych i alternatywę tabelaryczną.', en: 'Only when it has a question, data series and table alternative.' },
    metadata: { pl: 'Źródło, zakres, metryka, porównanie, świeżość.', en: 'Source, range, metric, comparison, freshness.' },
  },
  {
    id: 'table',
    name: { pl: 'Tabela', en: 'Table' },
    category: { pl: 'Powierzchnia główna', en: 'Main surface' },
    responsibility: { pl: 'Prezentuje zbiór rekordów i operacje na widoku danych.', en: 'Presents records and operations on a data view.' },
    allowed: { pl: 'Tylko gdy użytkownik sortuje, filtruje, wybiera lub eksportuje dane.', en: 'Only when the user sorts, filters, selects or exports data.' },
    metadata: { pl: 'Zakres, widoczne kolumny, liczba rekordów, status danych.', en: 'Range, visible columns, row count, data status.' },
  },
  {
    id: 'detail',
    name: { pl: 'Panel szczegółów', en: 'Detail panel' },
    category: { pl: 'Panel roboczy', en: 'Work panel' },
    responsibility: { pl: 'Pokazuje szczegół wybranego rekordu bez zmiany kontekstu.', en: 'Shows selected record detail without changing context.' },
    allowed: { pl: 'Tylko gdy istnieje wybrany rekord albo jasny stan braku wyboru.', en: 'Only when a selected record or clear no-selection state exists.' },
    metadata: { pl: 'Identyfikator rekordu, źródło, aktualizacja.', en: 'Record identifier, source, update time.' },
  },
  {
    id: 'drawer',
    name: { pl: 'Drawer', en: 'Drawer' },
    category: { pl: 'Warstwa czasowa', en: 'Temporary layer' },
    responsibility: { pl: 'Wynosi czasową pracę nad treść bez utraty tła zadania.', en: 'Raises temporary work above content without losing task context.' },
    allowed: { pl: 'Tylko dla własnego cyklu otwarcia, zamknięcia i focus restore.', en: 'Only for its own open, close and focus-restore cycle.' },
    metadata: { pl: 'Nazwa warstwy, powód otwarcia, stan zapisu.', en: 'Layer name, opening reason, save state.' },
  },
  {
    id: 'evidence',
    name: { pl: 'Panel dowodów', en: 'Evidence panel' },
    category: { pl: 'Panel roboczy', en: 'Work panel' },
    responsibility: { pl: 'Porządkuje źródła, potwierdzenia i kompletność danych.', en: 'Organizes sources, confirmations and data completeness.' },
    allowed: { pl: 'Tylko gdy dowody wpływają na ocenę wyniku lub decyzję.', en: 'Only when evidence affects result assessment or decision.' },
    metadata: { pl: 'Źródło, okres, zgodność, kompletność.', en: 'Source, period, validity, completeness.' },
  },
  {
    id: 'recommendation',
    name: { pl: 'Panel rekomendacji', en: 'Recommendation panel' },
    category: { pl: 'Panel roboczy', en: 'Work panel' },
    responsibility: { pl: 'Łączy wniosek, uzasadnienie i możliwe działanie.', en: 'Connects conclusion, rationale and possible action.' },
    allowed: { pl: 'Tylko gdy rekomendacja ma uzasadnienie i przypisane akcje.', en: 'Only when recommendation has rationale and assigned actions.' },
    metadata: { pl: 'Pewność, dowody, właściciel działania, wpływ.', en: 'Confidence, evidence, action owner, impact.' },
  },
  {
    id: 'status',
    name: { pl: 'Panel statusu danych', en: 'Data status panel' },
    category: { pl: 'Panel roboczy', en: 'Work panel' },
    responsibility: { pl: 'Wyjaśnia świeżość, kompletność i konkretną przyczynę problemu.', en: 'Explains freshness, completeness and concrete problem cause.' },
    allowed: { pl: 'Tylko gdy status zmienia zaufanie do widocznych danych.', en: 'Only when status changes trust in visible data.' },
    metadata: { pl: 'System, ostatnia synchronizacja, przyczyna, następny krok.', en: 'System, last sync, cause, next step.' },
  },
] as const;

function DataSurfaceGrid() {
  return (
    <div className="pd-s5-role-ledger" role="list" aria-label={copy({ pl: 'Role powierzchni danych', en: 'Data surface roles' })}>
      <p className="pd-s5-role-ledger__intro">
        <Localized
          pl="Panel istnieje tylko wtedy, gdy ma własną rolę, stan albo cykl interakcji. Podział ról jest pokazany liniami i hierarchią, bez kafli demonstracyjnych."
          en="A panel exists only when it has its own role, state or interaction cycle. Role division is shown through lines and hierarchy, without demo tiles."
        />
      </p>
      <div className="pd-s5-role-list">
        {surfaceRoles.map((role) => (
          <article key={role.id} className="pd-s5-role-row" role="listitem">
            <header>
              <span>{copy(role.category)}</span>
              <h3>{copy(role.name)}</h3>
            </header>
            <p>{copy(role.responsibility)}</p>
            <dl>
              <div>
                <dt><Localized pl="Wolno użyć gdy" en="Allowed when" /></dt>
                <dd>{copy(role.allowed)}</dd>
              </div>
              <div>
                <dt><Localized pl="Metadane" en="Metadata" /></dt>
                <dd>{copy(role.metadata)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

function DataAntiPatternComparison() {
  return (
    <div className="pd-s5-data-antipattern">
      <article data-result="rejected">
        <header>
          <StatusBadge tone="critical"><Localized pl="Antyprzykład" en="Anti-example" /></StatusBadge>
          <h3><Localized pl="Karty bez roli" en="Cards without role" /></h3>
        </header>
        <div>
          <section>
            <span />
            <div><span /><span /></div>
          </section>
          <section>
            <span />
            <div><span /><span /></div>
          </section>
          <section>
            <span />
            <div><span /><span /></div>
          </section>
        </div>
        <p><Localized pl="Metadane są ukryte, wykres nie ma pytania, tabela nie ma filtrów ani paginacji, a error nie wskazuje przyczyny." en="Metadata is hidden, the chart has no question, the table has no filters or pagination and error has no cause." /></p>
      </article>
      <article data-result="accepted">
        <header>
          <StatusBadge tone="success"><Localized pl="Poprawnie" en="Correct" /></StatusBadge>
          <h3><Localized pl="Jedna rola, jawne metadane" en="One role, visible metadata" /></h3>
        </header>
        <div className="pd-s5-decision-table">
          <dl>
            <div><dt><Localized pl="Rola" en="Role" /></dt><dd><Localized pl="Tabela produktów" en="Product table" /></dd></div>
            <div><dt><Localized pl="Zakres" en="Range" /></dt><dd>1-31 lip 2026</dd></div>
            <div><dt><Localized pl="Źródło" en="Source" /></dt><dd>Commerce</dd></div>
            <div><dt><Localized pl="Aktualizacja" en="Updated" /></dt><dd><Localized pl="2 min temu" en="2 min ago" /></dd></div>
          </dl>
          <DataTableBody />
        </div>
      </article>
    </div>
  );
}

function DataDecisionComparison() {
  return <DataAntiPatternComparison />;
}

function DataLaboratoryDemo() {
  return (
    <>
      <SurfaceSection
        index="01"
        title={<Localized pl="Role powierzchni" en="Surface roles" />}
      >
        <DataSurfaceGrid />
      </SurfaceSection>

      <SurfaceSection
        index="02"
        title={<Localized pl="Warianty KPI" en="KPI variants" />}
      >
        <KpiVariantsSection />
      </SurfaceSection>

      <SurfaceSection
        index="03"
        title={<Localized pl="Rodziny wykresów" en="Chart families" />}
      >
        <ChartFamiliesSection />
      </SurfaceSection>

      <SurfaceSection
        index="04"
        title={<Localized pl="Pełny ChartFrame" en="Full ChartFrame" />}
      >
        <FullChartFrameSection />
      </SurfaceSection>

      <SurfaceSection
        index="05"
        title={<Localized pl="System tabeli" en="Table system" />}
      >
        <TableSystemSection />
      </SurfaceSection>

      <SurfaceSection
        index="06"
        title={<Localized pl="Stany powierzchni" en="Surface states" />}
      >
        <SurfaceStatesSection />
      </SurfaceSection>

      <SurfaceSection
        index="07"
        title={<Localized pl="Panele robocze w kontekście" en="Work panels in context" />}
      >
        <WorkPanelsContextSection />
      </SurfaceSection>

      <SurfaceSection
        index="08"
        title={<Localized pl="Decyzja i antyprzykład" en="Decision and anti-example" />}
      >
        <DecisionList
          accepted={<Localized pl="Powierzchnia ma jedną odpowiedzialność, jawne metadane i działania przypisane do właściwego regionu." en="A surface has one responsibility, visible metadata and actions assigned to the right region." />}
          rejected={<Localized pl="Karty wewnątrz kart, ukryta świeżość danych, ogólny error i dekoracyjne panele bez odpowiedzialności." en="Cards inside cards, hidden freshness, generic error and decorative panels without responsibility." />}
        />
        <DataDecisionComparison />
      </SurfaceSection>
    </>
  );
}

function SeparatorPreview({
  level,
}: {
  readonly level: 'subtle' | 'default' | 'strong' | 'focus' | 'active' | 'danger';
}) {
  return (
    <div className="pd-s5-separator-preview" data-level={level} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function SeparatorMap() {
  return (
    <div className="pd-s5-separator-map">
      <div className="pd-s5-separator-map__topbar">
        <PapaDataBrand size="small" />
        <span><Localized pl="Topbar" en="Topbar" /></span>
      </div>
      <div className="pd-s5-separator-map__body">
        <aside>
          <span data-active="true"><Localized pl="Źródła" en="Sources" /></span>
          <span><Localized pl="Jakość" en="Quality" /></span>
          <span><Localized pl="Historia" en="History" /></span>
        </aside>
        <section>
          <header>
            <h3><Localized pl="Tabela i karta danych" en="Table and data card" /></h3>
            <StatusBadge tone="warning"><Localized pl="Wymaga uwagi" en="Needs attention" /></StatusBadge>
          </header>
          <div className="pd-s5-mini-table">
            <span />
            <span />
            <span />
            <span />
          </div>
        </section>
        <aside data-drawer="true">
          <h3>Drawer</h3>
          <p><Localized pl="Osobna granica regionu." en="Separate region boundary." /></p>
        </aside>
      </div>
    </div>
  );
}

function GradientUse({
  kind,
}: {
  readonly kind: 'brand' | 'light' | 'premium' | 'depth' | 'scrim' | 'chaos';
}) {
  const isRejected = kind === 'chaos';
  const title: Record<typeof kind, LocalizedCopy> = {
    brand: { pl: 'Gradient kontrolowany', en: 'Controlled gradient' },
    light: { pl: 'Subtelne światło', en: 'Subtle light' },
    premium: { pl: 'Powierzchnia premium', en: 'Premium surface' },
    depth: { pl: 'Techniczna głębia', en: 'Technical depth' },
    scrim: { pl: 'Overlay i scrim', en: 'Overlay and scrim' },
    chaos: { pl: 'Dekoracyjny chaos', en: 'Decorative chaos' },
  };

  return (
    <article className="pd-s5-gradient-use" data-kind={kind}>
      <div className="pd-s5-gradient-use__preview" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <header>
        <StatusBadge tone={isRejected ? 'critical' : 'success'}>
          {isRejected ? <Localized pl="Zakaz" en="Forbidden" /> : <Localized pl="Dopuszczone" en="Allowed" />}
        </StatusBadge>
        <h3>{copy(title[kind])}</h3>
      </header>
      <p>
        {isRejected ? (
          <Localized
            pl="Poświaty, przypadkowe halo i szklane dekoracje nie są częścią AppShell."
            en="Glow, arbitrary halo and glass decoration are not part of AppShell."
          />
        ) : (
          <Localized
            pl="Efekt ma konkretną rolę: marka, wizualizacja, scrim albo warstwa operacyjna."
            en="The effect has a concrete role: brand, visualization, scrim or operational layer."
          />
        )}
      </p>
    </article>
  );
}

export const TloAuth: Story = {
  name: 'Tło Auth',
  render: () => (
    <SurfacePage
      title={<Localized pl="Tło Auth" en="Auth background" />}
      summary={
        <Localized
          pl="Jedna spokojna powierzchnia publiczna z czytelnym panelem formularza. Warianty pokazują decyzję powierzchni, nie osobne ekrany marketingowe."
          en="One calm public surface with a readable form panel. Variants show the surface decision, not separate marketing screens."
        />
      }
      meta={ContractMeta({ id: '05.01', variants: 'login, register, MFA, reset, invite, mobile' })}
    >
      <SurfaceSection
        index="01"
        title={<Localized pl="Warianty wymagane przez kontrakt" en="Required contract variants" />}
        summary={<Localized pl="Geometria i focus pozostają zgodne z Fundamentami." en="Geometry and focus remain aligned with Foundations." />}
      >
        <AuthMatrix />
      </SurfaceSection>

      <SurfaceSection
        index="02"
        title={<Localized pl="Light i dark bez zmiany geometrii" en="Light and dark without geometry changes" />}
      >
        <ThemePair
          light={
            <ThemePreview theme="light" title={<Localized pl="Panel 380-440 px" en="380-440 px panel" />}>
              <AuthCard
                mode="login"
                title={<Localized pl="Logowanie" en="Sign in" />}
                helper={<Localized pl="Neutralny canvas, jedna warstwa formularza." en="Neutral canvas, one form layer." />}
              />
            </ThemePreview>
          }
          dark={
            <ThemePreview theme="dark" title={<Localized pl="Ta sama struktura" en="Same structure" />}>
              <AuthCard
                mode="login"
                title={<Localized pl="Logowanie" en="Sign in" />}
                helper={<Localized pl="Kontrast nie zależy od dekoracyjnego szkła." en="Contrast does not depend on decorative glass." />}
              />
            </ThemePreview>
          }
        />
      </SurfaceSection>

      <SurfaceSection
        index="03"
        title={<Localized pl="Decyzja i antyprzykład" en="Decision and anti-example" />}
      >
        <DecisionList
          accepted={<Localized pl="Spokojny canvas, jedna powierzchnia zadania i lokalny status bezpieczeństwa." en="Calm canvas, one task surface and local security status." />}
          rejected={<Localized pl="Hero 50/50, dekoracyjne glassmorphism i tło obniżające kontrast formularza." en="50/50 hero, decorative glassmorphism and a background that lowers form contrast." />}
        />
        <SurfaceVariant
          title={<Localized pl="Antyprzykład wizualny" en="Visual anti-example" />}
          description={<Localized pl="Pokazuje odrzucony kierunek bez tworzenia nowego wzorca UI." en="Shows the rejected direction without creating a new UI pattern." />}
          token="rejected"
        >
          <RejectedAuthExample />
        </SurfaceVariant>
      </SurfaceSection>
    </SurfacePage>
  ),
};

export const CanvasAplikacji: Story = {
  name: 'Tło aplikacji',
  render: () => (
    <SurfacePage
      className="pd-s5-page--app-background"
      title={<Localized pl="Tło aplikacji" en="Application background" />}
      summary={
        <Localized
          pl="Tło aplikacji jest tym samym canvasem. Nawigacja, panel i sticky topbar są częścią struktury, nie dekoracyjnymi kartami."
          en="The application background is the same canvas. Navigation, panel and sticky topbar are structure, not decorative cards."
        />
      }
      meta={ContractMeta({
        id: '05.02',
        variants: (
          <MetaVariantList
            items={[
              <Localized key="sidebar" pl="Z sidebarem" en="With sidebar" />,
              <Localized key="no-sidebar" pl="Bez sidebara" en="No sidebar" />,
              <Localized key="papa" pl="Z panelem Papa" en="With Papa panel" />,
              <Localized key="compact" pl="Compact" en="Compact" />,
            ]}
          />
        ),
        behavior: <Localized pl="Scroll: content" en="Scroll: content" />,
      })}
    >
      <SurfaceSection
        index="01"
        title={<Localized pl="Układy powłoki" en="Shell layouts" />}
        summary={<Localized pl="Każdy wariant używa tych samych granic, separatorów i statusów." en="Each variant uses the same boundaries, separators and statuses." />}
      >
        <div className="pd-s5-shell-grid">
          <ShellVariant title={<Localized pl="Z sidebarem" en="With sidebar" />}>
            <AppShellPreview variant="sidebar" />
          </ShellVariant>
          <ShellVariant title={<Localized pl="Bez sidebara" en="No sidebar" />}>
            <AppShellPreview variant="no-sidebar" />
          </ShellVariant>
          <ShellVariant title={<Localized pl="Z panelem Papa" en="With Papa panel" />}>
            <AppShellPreview variant="papa" />
          </ShellVariant>
          <ShellVariant title={<Localized pl="Compact" en="Compact" />}>
            <AppShellPreview variant="compact" />
          </ShellVariant>
        </div>
      </SurfaceSection>

      <SurfaceSection
        index="02"
        title={<Localized pl="Właściciel scrolla" en="Scroll owner" />}
      >
        <div className="pd-s5-scroll-owner-demo">
          <header>
            <h3><Localized pl="Jawny region przewijania" en="Explicit scroll region" /></h3>
            <p><Localized pl="Topbar pozostaje sticky na nieprzezroczystej powierzchni." en="Topbar remains sticky on an opaque surface." /></p>
            <code>overflow: content region</code>
          </header>
          <div>
            <AppShellPreview variant="scroll" />
          </div>
        </div>
      </SurfaceSection>

      <SurfaceSection
        index="03"
        title={<Localized pl="Szerokość treści" en="Content width" />}
        summary={<Localized pl="Analiza i formularz używają tego samego canvasu, ale innej szerokości roboczej." en="Analysis and form use the same canvas but different working widths." />}
      >
        <ContentWidthDemo />
      </SurfaceSection>
    </SurfacePage>
  ),
};

export const PowierzchniaDanych: Story = {
  name: 'Powierzchnie danych',
  render: () => (
    <div className="pd-s5-data-lab" data-lab-section="05.03">
      <SurfacePage
        title={<Localized pl="Powierzchnie danych" en="Data surfaces" />}
        summary={
          <Localized
            pl="Panel istnieje tylko wtedy, gdy ma własną rolę, stan albo cykl interakcji. Stany danych zachowują geometrię powierzchni."
            en="A panel exists only when it has its own role, state or interaction cycle. Data states keep surface geometry."
          />
        }
        meta={ContractMeta({
          id: '05.03',
          variants: (
            <MetaVariantList
              items={[
                <Localized key="roles" pl="Role powierzchni" en="Surface roles" />,
                <Localized key="kpi" pl="Warianty KPI" en="KPI variants" />,
                <Localized key="charts" pl="Rodziny wykresów" en="Chart families" />,
                <Localized key="table" pl="System tabeli" en="Table system" />,
                <Localized key="states" pl="Stany: loading, empty, partial, stale, error" en="States: loading, empty, partial, stale, error" />,
              ]}
            />
          ),
        })}
      >
        <DataLaboratoryDemo />
      </SurfacePage>
    </div>
  ),
};

export const SeparatoryIObramowania: Story = {
  name: 'Separatory i obramowania',
  render: () => (
    <SurfacePage
      title={<Localized pl="Separatory i obramowania" en="Separators and borders" />}
      summary={
        <Localized
          pl="Hairline divider jest podstawowym narzędziem hierarchii. Active, focus i danger mają osobne role i nie zastępują zwykłego borderu."
          en="Hairline divider is the primary hierarchy tool. Active, focus and danger have separate roles and do not replace an ordinary border."
        />
      }
      meta={ContractMeta({ id: '05.04', variants: 'subtle/default/strong/focus/active/danger' })}
    >
      <SurfaceSection
        index="01"
        title={<Localized pl="Poziomy i role linii" en="Line levels and roles" />}
      >
        <SurfaceLedger label={copy({ pl: 'Role separatorów', en: 'Separator roles' })}>
          <LedgerRow
            label={<Localized pl="Subtle" en="Subtle" />}
            preview={<SeparatorPreview level="subtle" />}
            value={<TokenCode>--pd-separator-subtle</TokenCode>}
            detail={<Localized pl="Wiersze, nagłówki i podziały wewnętrzne." en="Rows, headers and internal divisions." />}
          />
          <LedgerRow
            label={<Localized pl="Default" en="Default" />}
            preview={<SeparatorPreview level="default" />}
            value={<TokenCode>--pd-separator</TokenCode>}
            detail={<Localized pl="Topbar, sidebar, drawer i główne regiony." en="Topbar, sidebar, drawer and main regions." />}
          />
          <LedgerRow
            label={<Localized pl="Strong" en="Strong" />}
            preview={<SeparatorPreview level="strong" />}
            value={<TokenCode>--pd-border-strong</TokenCode>}
            detail={<Localized pl="Granica ważnej powierzchni, nie stały styl kart." en="Important surface boundary, not a permanent card style." />}
          />
          <LedgerRow
            label="Focus"
            preview={<SeparatorPreview level="focus" />}
            value={<TokenCode>--pd-focus-visible</TokenCode>}
            detail={<Localized pl="Osobna rola dostępności." en="Separate accessibility role." />}
          />
          <LedgerRow
            label="Active"
            preview={<SeparatorPreview level="active" />}
            value={<TokenCode>--pd-brand-accent</TokenCode>}
            detail={<Localized pl="Aktywna nawigacja lub kontrolka." en="Active navigation or control." />}
          />
          <LedgerRow
            label="Danger"
            preview={<SeparatorPreview level="danger" />}
            value={<TokenCode>--pd-status-danger</TokenCode>}
            detail={<Localized pl="Status ryzyka, nie zwykły active border." en="Risk status, not an ordinary active border." />}
          />
        </SurfaceLedger>
      </SurfaceSection>

      <SurfaceSection
        index="02"
        title={<Localized pl="Mapa separacji w aplikacji" en="Application separation map" />}
      >
        <SeparatorMap />
      </SurfaceSection>

      <SurfaceSection
        index="03"
        title={<Localized pl="Decyzja i antyprzykład" en="Decision and anti-example" />}
      >
        <DecisionList
          accepted={<Localized pl="Linia opisuje hierarchię regionów, a status i focus mają własne tokeny." en="A line describes region hierarchy while status and focus own their tokens." />}
          rejected={<Localized pl="Każdy element ma mocną ramkę, a danger, active i focus wyglądają identycznie." en="Every element gets a strong frame and danger, active and focus look identical." />}
        />
      </SurfaceSection>
    </SurfacePage>
  ),
};

export const GradientySwiatloISzklo: Story = {
  name: 'Gradienty, światło i szkło',
  render: () => (
    <SurfacePage
      title={<Localized pl="Gradienty, światło i szkło" en="Gradients, light and glass" />}
      summary={
        <Localized
          pl="Efekty wizualne są dopuszczalne tylko wtedy, gdy mają funkcję: marka, wizualizacja, scrim albo kontrolowana głębia. Dekoracyjny chaos pozostaje zakazany."
          en="Visual effects are allowed only when they have a function: brand, visualization, scrim or controlled depth. Decorative chaos remains forbidden."
        />
      }
      meta={ContractMeta({ id: '05.05', variants: 'gradient/light/premium/depth/scrim/light-dark' })}
    >
      <SurfaceSection
        index="01"
        title={<Localized pl="Dozwolone i zakazane zastosowania" en="Allowed and forbidden uses" />}
      >
        <div className="pd-s5-gradient-grid">
          <GradientUse kind="brand" />
          <GradientUse kind="light" />
          <GradientUse kind="premium" />
          <GradientUse kind="depth" />
          <GradientUse kind="scrim" />
          <GradientUse kind="chaos" />
        </div>
      </SurfaceSection>

      <SurfaceSection
        index="02"
        title={<Localized pl="Light i dark" en="Light and dark" />}
      >
        <ThemePair
          light={
            <ThemePreview
              theme="light"
              title={<Localized pl="Powierzchnia bez halo" en="Surface without halo" />}
              description={<Localized pl="Głębia wynika z separatora i cienia systemowego." en="Depth comes from separator and system shadow." />}
            >
              <GradientUse kind="premium" />
            </ThemePreview>
          }
          dark={
            <ThemePreview
              theme="dark"
              title={<Localized pl="Czytelność bez neonów" en="Readable without neon" />}
              description={<Localized pl="Tło nie obniża kontrastu ani focus ring." en="Background does not lower contrast or the focus ring." />}
            >
              <GradientUse kind="scrim" />
            </ThemePreview>
          }
        />
      </SurfaceSection>

      <SurfaceSection
        index="03"
        title={<Localized pl="Decyzja docelowa" en="Target decision" />}
      >
        <DecisionList
          accepted={<Localized pl="Kontrolowany gradient zasobu marki lub wizualizacji, scrim i techniczny cień overlay." en="Controlled brand or visualization gradient, scrim and technical overlay shadow." />}
          rejected={<Localized pl="Glassmorphism, przypadkowe glow, halo i gradient jako domyślne tło AppShell." en="Glassmorphism, arbitrary glow, halo and gradient as AppShell default background." />}
        />
      </SurfaceSection>
    </SurfacePage>
  ),
};
