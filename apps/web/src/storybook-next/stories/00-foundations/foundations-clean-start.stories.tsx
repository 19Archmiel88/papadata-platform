import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  CSSProperties,
  ReactNode,
} from 'react';
import {
  useId,
  useRef,
  useState,
} from 'react';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  formatPapaDataCurrency,
  formatPapaDataDateRange,
  formatPapaDataNumber,
  formatPapaDataPercent,
  formatPapaDataRelativeTime,
  motionTokens,
  type PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import {
  Icon,
  PapaDataBrand,
  type PapaDataIconName,
} from '../../../design-system/icons';
import '../foundations-demo.css';
import './foundation-iconography-no-containers.css';
import {
  ArrowNorthEastIcon,
  GlobeIcon,
  MoonStarIcon,
} from '../story-icons';
import './foundation-lab-alignment.css';
import './foundation-geometry-lab-only.css';
import './foundation-select-target.css';
import './foundation-status-catalog.css';

const meta = {
  title: '00 Fundamenty/Podstawy',
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

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

function Localized({
  pl,
  en,
}: LocalizedCopy) {
  return <>{readLocale() === 'en' ? en : pl}</>;
}

function FoundationPage({
  title,
  summary,
  children,
}: {
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-f0-page">
      <div className="pd-f0-page__inner">
        <header className="pd-f0-page__header">
          <div className="pd-f0-page__label">
            <span>00</span>
            <span>
              <Localized pl="Fundamenty" en="Foundations" />
            </span>
          </div>
          <div className="pd-f0-page__heading">
            <h1>{title}</h1>
            <p>{summary}</p>
          </div>
          <dl className="pd-f0-page__meta" aria-label={copy({
            pl: 'Parametry prezentacji',
            en: 'Presentation parameters',
          })}>
            <div>
              <dt><Localized pl="Układ" en="Layout" /></dt>
              <dd><Localized pl="Systemowy" en="System" /></dd>
            </div>
            <div>
              <dt><Localized pl="Powierzchnia" en="Surface" /></dt>
              <dd><Localized pl="Neutralna" en="Neutral" /></dd>
            </div>
            <div>
              <dt><Localized pl="Gęstość" en="Density" /></dt>
              <dd><Localized pl="Sterowana globalnie" en="Global control" /></dd>
            </div>
          </dl>
        </header>
        {children}
      </div>
    </main>
  );
}

function FoundationSection({
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
      <div className="pd-f0-section__content">
        {children}
      </div>
    </section>
  );
}

function FoundationVariant({
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
    <article className="pd-f0-variant" data-surface={surface}>
      <header className="pd-f0-variant__header">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        {token ? <code>{token}</code> : null}
      </header>
      <div className="pd-f0-variant__body">
        {children}
      </div>
    </article>
  );
}

function FoundationLedger({
  children,
  label,
}: {
  readonly children: ReactNode;
  readonly label: string;
}) {
  return (
    <div className="pd-f0-ledger" role="list" aria-label={label}>
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
    <article className="pd-f0-theme-preview" data-theme={theme}>
      <header>
        <span>{theme === 'light'
          ? <Localized pl="Tryb jasny" en="Light mode" />
          : <Localized pl="Tryb ciemny" en="Dark mode" />}</span>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="pd-f0-theme-preview__body">
        {children}
      </div>
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
    <div className="pd-f0-theme-pair">
      {light}
      {dark}
    </div>
  );
}

function TokenCode({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <code className="pd-f0-token">{children}</code>;
}

function FoundationButton({
  children,
  tone = 'secondary',
  icon,
  onClick,
  type = 'button',
}: {
  readonly children: ReactNode;
  readonly tone?: 'primary' | 'secondary' | 'quiet';
  readonly icon?: PapaDataIconName;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit';
}) {
  return (
    <button
      className="pd-f0-button"
      data-tone={tone}
      onClick={onClick}
      type={type}
    >
      {icon ? <Icon decorative name={icon} size={16} /> : null}
      <span>{children}</span>
    </button>
  );
}

type FoundationStatusTone = 'success' | 'warning' | 'danger' | 'critical' | 'neutral' | 'info' | 'processing' | 'muted';

function StatusBadge({
  tone,
  children,
}: {
  readonly tone: FoundationStatusTone;
  readonly children: ReactNode;
}) {
  return (
    <span className="pd-f0-status" data-tone={tone}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

const visualPrinciples = [
  {
    number: '01',
    title: {
      pl: 'Decyzja przed dekoracją',
      en: 'Decision before decoration',
    },
    description: {
      pl: 'Dane, hierarchia i następna akcja mają pierwszeństwo przed efektem wizualnym.',
      en: 'Data, hierarchy and the next action come before visual effects.',
    },
  },
  {
    number: '02',
    title: {
      pl: 'Premium przez precyzję',
      en: 'Premium through precision',
    },
    description: {
      pl: 'Jakość budują proporcje, rytm i czytelność, nie poświaty ani ciężkie cienie.',
      en: 'Quality comes from proportion, rhythm and clarity, not glow or heavy shadows.',
    },
  },
  {
    number: '03',
    title: {
      pl: 'Mniej kontenerów, więcej struktury',
      en: 'Fewer containers, stronger structure',
    },
    description: {
      pl: 'Sekcje rozdzielają odstęp i linia. Powierzchnia pojawia się tylko tam, gdzie niesie funkcję.',
      en: 'Spacing and separators structure sections. A surface appears only when it has a function.',
    },
  },
] as const;

export const KierunekWizualny: Story = {
  name: 'Kierunek wizualny',
  render: () => (
    <FoundationPage
      title={<Localized pl="Kierunek wizualny" en="Visual direction" />}
      summary={
        <Localized
          pl="Jedna zasada prezentacji dla całego systemu: spokojny canvas, precyzyjne separatory i lokalny akcent marki."
          en="One presentation rule for the entire system: calm canvas, precise separators and a local brand accent."
        />
      }
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Tożsamość marki" en="Brand identity" />}
        summary={
          <Localized
            pl="Marka identyfikuje produkt. Kolor danych i statusu zachowuje własne znaczenie."
            en="Brand identifies the product. Data and status colors retain their own meaning."
          />
        }
      >
        <FoundationVariant
          title={<Localized pl="Logo pełne" en="Full logo" />}
          description={
            <Localized
              pl="Sygnet i logotyp występują bez dekoracyjnego glow. Wolna przestrzeń buduje rangę znaku."
              en="Mark and wordmark appear without decorative glow. Clear space gives the identity its weight."
            />
          }
          token="--pd-brand"
        >
          <div className="pd-f0-brand-lockup-demo">
            <PapaDataBrand label="PapaData logo" size="large" />
            <p>
              <Localized
                pl="Bursztyn pozostaje akcentem marki, nie kolorem całego interfejsu."
                en="Amber remains a brand accent, not the color of the entire interface."
              />
            </p>
          </div>
        </FoundationVariant>

        <FoundationVariant
          title={<Localized pl="Role semantyczne" en="Semantic roles" />}
          description={
            <Localized
              pl="Każdy kolor ma jedną odpowiedzialność i nie przejmuje roli innego obszaru."
              en="Each color has one responsibility and does not take over another area."
            />
          }
        >
          <FoundationLedger label={copy({ pl: 'Role kolorów', en: 'Color roles' })}>
            <LedgerRow
              label={<Localized pl="Marka" en="Brand" />}
              preview={<span className="pd-f0-swatch" data-color="brand" />}
              value={<TokenCode>--pd-brand</TokenCode>}
              detail={<Localized pl="Logo i główne akcje marki" en="Logo and primary brand actions" />}
            />
            <LedgerRow
              label={<Localized pl="Interakcja" en="Interaction" />}
              preview={<span className="pd-f0-swatch" data-color="interactive" />}
              value={<TokenCode>--pd-interactive</TokenCode>}
              detail={<Localized pl="Linki, fokus i aktywne kontrolki" en="Links, focus and active controls" />}
            />
            <LedgerRow
              label={<Localized pl="Dane" en="Data" />}
              preview={<span className="pd-f0-swatch" data-color="data" />}
              value={<TokenCode>--pd-data-accent</TokenCode>}
              detail={<Localized pl="Wykresy i informacja analityczna" en="Charts and analytical information" />}
            />
            <LedgerRow
              label={<Localized pl="Status" en="Status" />}
              preview={<span className="pd-f0-swatch" data-color="status" />}
              value={<TokenCode>--pd-status-*</TokenCode>}
              detail={<Localized pl="Stan procesu i walidacja" en="Process state and validation" />}
            />
          </FoundationLedger>
        </FoundationVariant>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Zasady projektowe" en="Design principles" />}
        summary={
          <Localized
            pl="Te same reguły obowiązują komponent, story i ekran produktu."
            en="The same rules apply to a component, a story and a product screen."
          />
        }
      >
        <div className="pd-f0-principles">
          {visualPrinciples.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <div>
                <h3>{copy(principle.title)}</h3>
                <p>{copy(principle.description)}</p>
              </div>
            </article>
          ))}
        </div>

        <FoundationVariant
          title={<Localized pl="Kierunek akceptowany i odrzucony" en="Accepted and rejected direction" />}
          description={
            <Localized
              pl="Porównanie nie jest kartą demonstracyjną. To prosta lista decyzji."
              en="The comparison is not a demo card. It is a direct decision list."
            />
          }
        >
          <div className="pd-f0-decision-list">
            <div data-result="accepted">
              <StatusBadge tone="success"><Localized pl="Stosujemy" en="Use" /></StatusBadge>
              <p><Localized pl="Neutralne powierzchnie, separatory, lokalne akcenty i czytelny rytm danych." en="Neutral surfaces, separators, local accents and a readable data rhythm." /></p>
            </div>
            <div data-result="rejected">
              <StatusBadge tone="danger"><Localized pl="Odrzucamy" en="Avoid" /></StatusBadge>
              <p><Localized pl="Glow, ciężkie cienie, przypadkowe gradienty i osobną kartę dla każdego przykładu." en="Glow, heavy shadows, arbitrary gradients and a separate card for every example." /></p>
            </div>
          </div>
        </FoundationVariant>
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Motyw jasny i ciemny" en="Light and dark theme" />}
        summary={
          <Localized
            pl="Każdy motyw ma własną pełną powierzchnię. Nie mieszamy jasnych tokenów z ciemnym canvasem."
            en="Each theme has its own complete surface. Light tokens are never mixed with a dark canvas."
          />
        }
      >
        <ThemePair
          light={
            <ThemePreview
              theme="light"
              title={<Localized pl="Spokojna powierzchnia robocza" en="Calm working surface" />}
              description={<Localized pl="Kontrast wynika z hierarchii, nie z mocnego cienia." en="Contrast comes from hierarchy, not a strong shadow." />}
            >
              <div className="pd-f0-theme-sample">
                <div>
                  <span><Localized pl="Przychód netto" en="Net revenue" /></span>
                  <strong>1 248 590 zł</strong>
                </div>
                <FoundationButton icon="trend" tone="primary">
                  <Localized pl="Otwórz analizę" en="Open analysis" />
                </FoundationButton>
              </div>
            </ThemePreview>
          }
          dark={
            <ThemePreview
              theme="dark"
              title={<Localized pl="Czytelność bez neonów" en="Readable without neon" />}
              description={<Localized pl="Głębię buduje powierzchnia i separator, nie poświata." en="Surface and separator create depth, not glow." />}
            >
              <div className="pd-f0-theme-sample">
                <div>
                  <span><Localized pl="Przychód netto" en="Net revenue" /></span>
                  <strong>1 248 590 zł</strong>
                </div>
                <FoundationButton icon="trend" tone="primary">
                  <Localized pl="Otwórz analizę" en="Open analysis" />
                </FoundationButton>
              </div>
            </ThemePreview>
          }
        />
      </FoundationSection>
    </FoundationPage>
  ),
};

const typographyRows = [
  { token: '--pd-type-size-page', role: { pl: 'Tytuł strony', en: 'Page title' }, sample: { pl: 'Przegląd danych', en: 'Data overview' }, kind: 'page' },
  { token: '--pd-type-size-section', role: { pl: 'Tytuł sekcji', en: 'Section title' }, sample: { pl: 'Źródła danych', en: 'Data sources' }, kind: 'section' },
  { token: '--pd-type-size-body-large', role: { pl: 'Wprowadzenie', en: 'Introduction' }, sample: { pl: 'Najważniejszy kontekst operacyjny.', en: 'The most important operational context.' }, kind: 'lead' },
  { token: '--pd-type-size-body', role: { pl: 'Tekst roboczy', en: 'Working copy' }, sample: { pl: 'Dane pozostają czytelne przy codziennej pracy.', en: 'Data remains readable in daily work.' }, kind: 'body' },
  { token: '--pd-type-size-body-small', role: { pl: 'Opis pomocniczy', en: 'Supporting copy' }, sample: { pl: 'Aktualizacja 4 min temu', en: 'Updated 4 min ago' }, kind: 'small' },
  { token: '--pd-type-size-caption', role: { pl: 'Metadane', en: 'Metadata' }, sample: { pl: 'Źródło: GA4', en: 'Source: GA4' }, kind: 'caption' },
] as const;

export const Typografia: Story = {
  name: 'Typografia',
  render: () => {
    const locale = readLocale();
    const rangeStart = new Date('2026-07-01T08:00:00Z');
    const rangeEnd = new Date('2026-07-31T08:00:00Z');
    const alignedValues = [
      {
        label: { pl: 'Przychód', en: 'Revenue' },
        value: formatPapaDataCurrency(1248590.42, locale),
      },
      {
        label: { pl: 'Koszt', en: 'Cost' },
        value: formatPapaDataCurrency(28400, locale),
      },
      {
        label: { pl: 'Korekta', en: 'Adjustment' },
        value: formatPapaDataCurrency(950.8, locale),
      },
    ] as const;

    return (
      <FoundationPage
        title={<Localized pl="Typografia i formatowanie danych" en="Typography and data formatting" />}
        summary={<Localized pl="Typografia ma wspierać skanowanie danych. Waga i skala wynikają z roli, nie z dekoracji." en="Typography supports data scanning. Weight and scale follow the role, not decoration." />}
      >
        <FoundationSection
          index="01"
          title={<Localized pl="Hierarchia tekstu" en="Text hierarchy" />}
          summary={<Localized pl="Jedna drabina typograficzna działa w jasnym i ciemnym motywie." en="One type scale works in light and dark themes." />}
        >
          <FoundationLedger label={copy({ pl: 'Skala typograficzna', en: 'Type scale' })}>
            {typographyRows.map((row) => (
              <LedgerRow
                key={row.token}
                label={copy(row.role)}
                preview={<span className="pd-f0-type-sample" data-kind={row.kind}>{copy(row.sample)}</span>}
                value={<TokenCode>{row.token}</TokenCode>}
              />
            ))}
          </FoundationLedger>
        </FoundationSection>

        <FoundationSection
          index="02"
          title={<Localized pl="Dane i liczby" en="Data and numbers" />}
          summary={<Localized pl="Liczby, waluty i daty korzystają z jednego runtime locale." en="Numbers, currency and dates use one runtime locale." />}
        >
          <div className="pd-f0-metric-strip">
            <div>
              <span><Localized pl="Liczba" en="Number" /></span>
              <strong>{formatPapaDataNumber(1284590.42, locale)}</strong>
            </div>
            <div>
              <span><Localized pl="Waluta" en="Currency" /></span>
              <strong>{formatPapaDataCurrency(248950.8, locale)}</strong>
            </div>
            <div>
              <span><Localized pl="Wynik" en="Result" /></span>
              <strong>{formatPapaDataPercent(0.186, locale)}</strong>
            </div>
            <div>
              <span><Localized pl="Aktualność" en="Freshness" /></span>
              <strong>{formatPapaDataRelativeTime(-4, 'minute', locale)}</strong>
            </div>
          </div>

          <div className="pd-f0-format-grid">
            <article className="pd-f0-format-example">
              <header>
                <h3><Localized pl="Zakres dat" en="Date range" /></h3>
                <p><Localized pl="Format jest lokalny, a układ i hierarchia pozostają stałe." en="The format is locale-aware while layout and hierarchy remain stable." /></p>
              </header>
              <div className="pd-f0-date-format">
                <div className="pd-f0-inline-value">
                  <Icon decorative name="data" size={20} />
                  <strong>{formatPapaDataDateRange(rangeStart, rangeEnd, locale)}</strong>
                </div>
                <dl>
                  <div>
                    <dt><Localized pl="Format lokalny" en="Locale format" /></dt>
                    <dd><Localized pl="dzień – miesiąc – rok" en="month – day – year" /></dd>
                  </div>
                  <div>
                    <dt><Localized pl="Zasada" en="Rule" /></dt>
                    <dd><Localized pl="Bez ręcznego składania dat" en="Never assemble dates manually" /></dd>
                  </div>
                </dl>
              </div>
            </article>

            <article className="pd-f0-format-example">
              <header>
                <h3><Localized pl="Wyrównanie liczb" en="Numeric alignment" /></h3>
                <p><Localized pl="Cyfry tabelaryczne stabilizują kolumny kwot i KPI." en="Tabular figures stabilize amount and KPI columns." /></p>
              </header>
              <div
                className="pd-f0-number-alignment"
                role="table"
                aria-label={copy({ pl: 'Przykład wyrównania kwot', en: 'Amount alignment example' })}
              >
                {alignedValues.map((item) => (
                  <div role="row" key={item.label.pl}>
                    <span role="cell">{copy(item.label)}</span>
                    <strong role="cell">{item.value}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </FoundationSection>

        <FoundationSection
          index="03"
          title={<Localized pl="Długie treści" en="Long content" />}
          summary={<Localized pl="Tekst zawija się naturalnie i nie wymusza poziomego scrolla strony." en="Text wraps naturally and never forces page-level horizontal scrolling." />}
        >
          <div className="pd-f0-long-content-grid">
            <article>
              <header>
                <h3><Localized pl="Rekomendacja biznesowa" en="Business recommendation" /></h3>
                <p><Localized pl="Dłuższy akapit sprawdza rytm, szerokość i czytelność treści roboczej." en="A longer paragraph verifies rhythm, measure and working-copy readability." /></p>
              </header>
              <div className="pd-f0-long-copy">
                <p>
                  <Localized
                    pl="Wstrzymaj automatyczną publikację raportu do czasu potwierdzenia kompletności danych ze wszystkich kanałów reklamowych, ponownego przeliczenia atrybucji dla ostatnich siedmiu dni oraz zatwierdzenia różnic pomiędzy przychodem raportowanym a wartością zamówień zapisaną w systemie źródłowym."
                    en="Pause automatic report publication until data completeness is confirmed across all advertising channels, attribution is recalculated for the last seven days, and differences between reported revenue and source-system order value are approved."
                  />
                </p>
                <p>
                  <Localized
                    pl="Po spełnieniu tych warunków system może wznowić harmonogram bez ręcznej zmiany konfiguracji kampanii."
                    en="Once these conditions are met, the system may resume the schedule without a manual campaign-configuration change."
                  />
                </p>
              </div>
            </article>

            <article>
              <header>
                <h3><Localized pl="Tekst techniczny" en="Technical text" /></h3>
                <p><Localized pl="Identyfikator nie może rozszerzać kolumny ani całej strony." en="An identifier must not widen its column or the page." /></p>
              </header>
              <code className="pd-f0-breakable-code">
                source_authority.reconciliation.candidate_resolution.window_2026_07_31
              </code>
            </article>
          </div>
        </FoundationSection>
      </FoundationPage>
    );
  },
};

const semanticColors = [
  { role: { pl: 'Canvas', en: 'Canvas' }, token: '--pd-canvas', color: 'canvas' },
  { role: { pl: 'Powierzchnia', en: 'Surface' }, token: '--pd-surface', color: 'surface' },
  { role: { pl: 'Tekst', en: 'Text' }, token: '--pd-text', color: 'text' },
  { role: { pl: 'Tekst pomocniczy', en: 'Secondary text' }, token: '--pd-text-secondary', color: 'secondary' },
  { role: { pl: 'Separator', en: 'Separator' }, token: '--pd-separator', color: 'separator' },
  { role: { pl: 'Interakcja', en: 'Interaction' }, token: '--pd-interactive', color: 'interactive' },
  { role: { pl: 'Dane', en: 'Data' }, token: '--pd-data-accent', color: 'data' },
  { role: { pl: 'Fokus', en: 'Focus' }, token: '--pd-focus-visible', color: 'focus' },
] as const;

const dataSeries = ['1', '2', '3', '4', '5', '6'] as const;


const semanticTones = [
  {
    tone: 'neutral',
    label: { pl: 'Neutralny', en: 'Neutral' },
    token: '--pd-status-neutral',
    usage: { pl: 'Brak oceny, stan nieaktywny lub informacja pomocnicza.', en: 'No evaluation, inactive state or supporting information.' },
  },
  {
    tone: 'info',
    label: { pl: 'Informacyjny', en: 'Informational' },
    token: '--pd-status-info',
    usage: { pl: 'Informacja, która nie wymaga natychmiastowej reakcji.', en: 'Information that does not require immediate action.' },
  },
  {
    tone: 'success',
    label: { pl: 'Sukces', en: 'Success' },
    token: '--pd-status-success',
    usage: { pl: 'Potwierdzone zakończenie lub poprawny wynik.', en: 'Confirmed completion or a valid result.' },
  },
  {
    tone: 'warning',
    label: { pl: 'Ostrzeżenie', en: 'Warning' },
    token: '--pd-status-warning',
    usage: { pl: 'Ryzyko, opóźnienie lub stan wymagający uwagi.', en: 'Risk, delay or a state requiring attention.' },
  },
  {
    tone: 'danger',
    label: { pl: 'Błąd', en: 'Error' },
    token: '--pd-status-danger',
    usage: { pl: 'Błąd, blokada albo nieodwracalny skutek.', en: 'Error, blocker or irreversible consequence.' },
  },
  {
    tone: 'processing',
    label: { pl: 'Przetwarzanie', en: 'Processing' },
    token: '--pd-brand-accent',
    usage: { pl: 'Operacja trwa i system oczekuje na jej wynik.', en: 'An operation is running and the system is awaiting its result.' },
  },
] as const satisfies readonly {
  readonly tone: FoundationStatusTone;
  readonly label: LocalizedCopy;
  readonly token: string;
  readonly usage: LocalizedCopy;
}[];

const statusToneLabels: Record<FoundationStatusTone, LocalizedCopy> = {
  success: { pl: 'Sukces', en: 'Success' },
  warning: { pl: 'Ostrzeżenie', en: 'Warning' },
  danger: { pl: 'Błąd', en: 'Error' },
  critical: { pl: 'Krytyczny', en: 'Critical' },
  neutral: { pl: 'Neutralny', en: 'Neutral' },
  info: { pl: 'Informacyjny', en: 'Informational' },
  processing: { pl: 'Przetwarzanie', en: 'Processing' },
  muted: { pl: 'Wyciszony', en: 'Muted' },
};

type ProjectStatusItem = {
  readonly key: string;
  readonly label: LocalizedCopy;
  readonly tone: FoundationStatusTone;
};

type ProjectStatusGroup = {
  readonly title: LocalizedCopy;
  readonly description: LocalizedCopy;
  readonly statuses: readonly ProjectStatusItem[];
};

const projectStatusGroups = [
  {
    title: { pl: 'Bazowe stany systemu', en: 'Base system states' },
    description: { pl: 'Statusy przekrojowe dla usług, sekcji, kart i widoków danych.', en: 'Cross-product states for services, sections, cards and data views.' },
    statuses: [
      { key: 'ready', label: { pl: 'Gotowe', en: 'Ready' }, tone: 'info' },
      { key: 'processing', label: { pl: 'Przetwarzanie', en: 'Processing' }, tone: 'processing' },
      { key: 'running', label: { pl: 'W toku', en: 'Running' }, tone: 'processing' },
      { key: 'queued', label: { pl: 'W kolejce', en: 'Queued' }, tone: 'processing' },
      { key: 'retry_wait', label: { pl: 'Czeka na ponowienie', en: 'Waiting for retry' }, tone: 'warning' },
      { key: 'partial', label: { pl: 'Częściowe', en: 'Partial' }, tone: 'warning' },
      { key: 'no_data', label: { pl: 'Brak danych', en: 'No data' }, tone: 'neutral' },
      { key: 'stale', label: { pl: 'Nieaktualne', en: 'Stale' }, tone: 'warning' },
      { key: 'delayed', label: { pl: 'Opóźnione', en: 'Delayed' }, tone: 'warning' },
      { key: 'invalid', label: { pl: 'Nieprawidłowe', en: 'Invalid' }, tone: 'danger' },
      { key: 'conflicting', label: { pl: 'Konflikt', en: 'Conflict' }, tone: 'danger' },
      { key: 'resync_required', label: { pl: 'Wymaga synchronizacji', en: 'Resync required' }, tone: 'warning' },
      { key: 'manual_review_required', label: { pl: 'Wymaga sprawdzenia', en: 'Manual review required' }, tone: 'warning' },
      { key: 'succeeded', label: { pl: 'Zakończone', en: 'Succeeded' }, tone: 'success' },
      { key: 'failed', label: { pl: 'Błąd', en: 'Failed' }, tone: 'danger' },
      { key: 'cancelled', label: { pl: 'Anulowane', en: 'Cancelled' }, tone: 'muted' },
      { key: 'blocked', label: { pl: 'Zablokowane', en: 'Blocked' }, tone: 'danger' },
      { key: 'unknown', label: { pl: 'Nieznane', en: 'Unknown' }, tone: 'neutral' },
      { key: 'unavailable', label: { pl: 'Niedostępne', en: 'Unavailable' }, tone: 'neutral' },
    ],
  },
  {
    title: { pl: 'Dostęp, konto i workspace', en: 'Access, account and workspace' },
    description: { pl: 'Statusy tenantów, workspace, członkostw, zaproszeń i onboardingu.', en: 'Tenant, workspace, membership, invitation and onboarding states.' },
    statuses: [
      { key: 'active', label: { pl: 'Aktywne', en: 'Active' }, tone: 'success' },
      { key: 'pending_verification', label: { pl: 'Czeka na weryfikację', en: 'Pending verification' }, tone: 'warning' },
      { key: 'archived', label: { pl: 'Zarchiwizowane', en: 'Archived' }, tone: 'muted' },
      { key: 'invited', label: { pl: 'Zaproszony', en: 'Invited' }, tone: 'info' },
      { key: 'revoked', label: { pl: 'Cofnięte', en: 'Revoked' }, tone: 'muted' },
      { key: 'pending', label: { pl: 'Oczekuje', en: 'Pending' }, tone: 'warning' },
      { key: 'accepted', label: { pl: 'Przyjęte', en: 'Accepted' }, tone: 'success' },
      { key: 'missing', label: { pl: 'Brakujące', en: 'Missing' }, tone: 'neutral' },
      { key: 'deleted', label: { pl: 'Usunięte', en: 'Deleted' }, tone: 'muted' },
      { key: 'completed', label: { pl: 'Ukończone', en: 'Completed' }, tone: 'success' },
      { key: 'not_started', label: { pl: 'Nie rozpoczęto', en: 'Not started' }, tone: 'neutral' },
      { key: 'in_progress', label: { pl: 'W trakcie', en: 'In progress' }, tone: 'processing' },
      { key: 'satisfied', label: { pl: 'Spełnione', en: 'Satisfied' }, tone: 'success' },
    ],
  },
  {
    title: { pl: 'Operacje i joby', en: 'Operations and jobs' },
    description: { pl: 'Statusy pipeline, workera, importów, synców i zadań w tle.', en: 'Pipeline, worker, import, sync and background-job states.' },
    statuses: [
      { key: 'leased', label: { pl: 'Przypisane do workera', en: 'Leased' }, tone: 'processing' },
      { key: 'fetching', label: { pl: 'Pobieranie', en: 'Fetching' }, tone: 'processing' },
      { key: 'persisting_source', label: { pl: 'Zapis źródła', en: 'Persisting source' }, tone: 'processing' },
      { key: 'normalizing', label: { pl: 'Normalizacja', en: 'Normalizing' }, tone: 'processing' },
      { key: 'writing_canonical', label: { pl: 'Zapis kanoniczny', en: 'Writing canonical' }, tone: 'processing' },
      { key: 'reconciling', label: { pl: 'Uzgadnianie', en: 'Reconciling' }, tone: 'processing' },
      { key: 'retryable_failed', label: { pl: 'Błąd możliwy do ponowienia', en: 'Retryable failure' }, tone: 'warning' },
      { key: 'terminal_failed', label: { pl: 'Błąd końcowy', en: 'Terminal failure' }, tone: 'danger' },
      { key: 'dead_lettered', label: { pl: 'W kolejce błędów', en: 'Dead-lettered' }, tone: 'danger' },
      { key: 'dlq', label: { pl: 'Wymaga obsługi technicznej', en: 'Requires technical handling' }, tone: 'danger' },
      { key: 'cancel_requested', label: { pl: 'Żądanie anulowania', en: 'Cancel requested' }, tone: 'warning' },
      { key: 'not_leased', label: { pl: 'Nieprzypisane', en: 'Not leased' }, tone: 'neutral' },
    ],
  },
  {
    title: { pl: 'Dane, metryki i readiness', en: 'Data, metrics and readiness' },
    description: { pl: 'Statusy jakości obliczeń, integracji, źródeł i zależności usług.', en: 'Calculation quality, integration, source and service-dependency states.' },
    statuses: [
      { key: 'ok', label: { pl: 'Poprawne', en: 'OK' }, tone: 'success' },
      { key: 'zero', label: { pl: 'Zero', en: 'Zero' }, tone: 'neutral' },
      { key: 'not_configured', label: { pl: 'Nie skonfigurowano', en: 'Not configured' }, tone: 'neutral' },
      { key: 'not_supported', label: { pl: 'Nieobsługiwane', en: 'Not supported' }, tone: 'neutral' },
      { key: 'syncing', label: { pl: 'Synchronizacja', en: 'Syncing' }, tone: 'processing' },
      { key: 'needs_reauth', label: { pl: 'Wymaga ponownego połączenia', en: 'Needs reauth' }, tone: 'warning' },
      { key: 'permission_error', label: { pl: 'Brak uprawnień', en: 'Permission error' }, tone: 'danger' },
      { key: 'network_error', label: { pl: 'Błąd sieci', en: 'Network error' }, tone: 'danger' },
      { key: 'provider_error', label: { pl: 'Błąd dostawcy', en: 'Provider error' }, tone: 'danger' },
      { key: 'error', label: { pl: 'Błąd', en: 'Error' }, tone: 'danger' },
      { key: 'passed', label: { pl: 'Zgodne', en: 'Passed' }, tone: 'success' },
      { key: 'mismatch', label: { pl: 'Niezgodność', en: 'Mismatch' }, tone: 'danger' },
    ],
  },
  {
    title: { pl: 'Commerce, płatności i zwroty', en: 'Commerce, payments and returns' },
    description: { pl: 'Statusy zamówień, płatności, faktur, zwrotów i refundacji.', en: 'Order, payment, invoice, return and refund states.' },
    statuses: [
      { key: 'confirmed', label: { pl: 'Potwierdzone', en: 'Confirmed' }, tone: 'success' },
      { key: 'paid', label: { pl: 'Opłacone', en: 'Paid' }, tone: 'success' },
      { key: 'shipped', label: { pl: 'Wysłane', en: 'Shipped' }, tone: 'info' },
      { key: 'delivered', label: { pl: 'Dostarczone', en: 'Delivered' }, tone: 'success' },
      { key: 'refunded', label: { pl: 'Zwrócone', en: 'Refunded' }, tone: 'muted' },
      { key: 'partially_refunded', label: { pl: 'Częściowy zwrot', en: 'Partially refunded' }, tone: 'warning' },
      { key: 'returned', label: { pl: 'Zwrócone przez klienta', en: 'Returned' }, tone: 'muted' },
      { key: 'authorized', label: { pl: 'Autoryzowana', en: 'Authorized' }, tone: 'info' },
      { key: 'captured', label: { pl: 'Pobrana', en: 'Captured' }, tone: 'success' },
      { key: 'open', label: { pl: 'Otwarta', en: 'Open' }, tone: 'info' },
      { key: 'past_due', label: { pl: 'Po terminie', en: 'Past due' }, tone: 'danger' },
      { key: 'requested', label: { pl: 'Zgłoszone', en: 'Requested' }, tone: 'info' },
      { key: 'received', label: { pl: 'Odebrane', en: 'Received' }, tone: 'info' },
    ],
  },
  {
    title: { pl: 'Billing i KSeF', en: 'Billing and KSeF' },
    description: { pl: 'Statusy subskrypcji, faktur oraz komunikacji z KSeF.', en: 'Subscription, invoice and KSeF communication states.' },
    statuses: [
      { key: 'trial', label: { pl: 'Okres próbny', en: 'Trial' }, tone: 'info' },
      { key: 'draft', label: { pl: 'Szkic', en: 'Draft' }, tone: 'neutral' },
      { key: 'ready_for_ksef', label: { pl: 'Gotowa do KSeF', en: 'Ready for KSeF' }, tone: 'info' },
      { key: 'submitted', label: { pl: 'Wysłana', en: 'Submitted' }, tone: 'processing' },
      { key: 'rejected', label: { pl: 'Odrzucone', en: 'Rejected' }, tone: 'danger' },
      { key: 'offline_pending', label: { pl: 'Oczekuje offline', en: 'Offline pending' }, tone: 'warning' },
      { key: 'correction_required', label: { pl: 'Wymaga korekty', en: 'Correction required' }, tone: 'warning' },
    ],
  },
  {
    title: { pl: 'Security, MFA i uprawnienia', en: 'Security, MFA and permissions' },
    description: { pl: 'Statusy tokenów, dostępu tymczasowego, zatwierdzeń i wygasania.', en: 'Token, temporary access, approval and expiry states.' },
    statuses: [
      { key: 'approved', label: { pl: 'Zatwierdzone', en: 'Approved' }, tone: 'success' },
      { key: 'expired', label: { pl: 'Wygasłe', en: 'Expired' }, tone: 'muted' },
      { key: 'expiring', label: { pl: 'Wygasa', en: 'Expiring' }, tone: 'warning' },
    ],
  },
  {
    title: { pl: 'Privacy, retencja i żądania użytkownika', en: 'Privacy, retention and user requests' },
    description: { pl: 'Statusy weryfikacji tożsamości, retencji, usunięć i legal hold.', en: 'Identity verification, retention, deletion and legal-hold states.' },
    statuses: [
      { key: 'identity_verification_pending', label: { pl: 'Czeka na weryfikację tożsamości', en: 'Identity verification pending' }, tone: 'warning' },
      { key: 'blocked_by_legal_hold', label: { pl: 'Zablokowane prawnie', en: 'Blocked by legal hold' }, tone: 'danger' },
      { key: 'verification_pending', label: { pl: 'Czeka na weryfikację', en: 'Verification pending' }, tone: 'warning' },
      { key: 'verified', label: { pl: 'Zweryfikowane', en: 'Verified' }, tone: 'success' },
      { key: 'not_applicable', label: { pl: 'Nie dotyczy', en: 'Not applicable' }, tone: 'neutral' },
      { key: 'not_found', label: { pl: 'Nie znaleziono', en: 'Not found' }, tone: 'neutral' },
    ],
  },
  {
    title: { pl: 'Uzgadnianie i reguły źródeł', en: 'Reconciliation and source rules' },
    description: { pl: 'Statusy deduplikacji, source authority, kandydatów i reguł.', en: 'Deduplication, source-authority, candidate and rule states.' },
    statuses: [
      { key: 'automatic_match', label: { pl: 'Dopasowane automatycznie', en: 'Automatic match' }, tone: 'success' },
      { key: 'manual_review', label: { pl: 'Do ręcznego sprawdzenia', en: 'Manual review' }, tone: 'warning' },
      { key: 'retired', label: { pl: 'Wycofane', en: 'Retired' }, tone: 'muted' },
    ],
  },
  {
    title: { pl: 'Dokumentacja, Storybook i projekt', en: 'Documentation, Storybook and project' },
    description: { pl: 'Statusy rejestrów, kontraktów, macierzy testów i backlogu projektowego.', en: 'Registry, contract, test-matrix and project backlog states.' },
    statuses: [
      { key: 'specified', label: { pl: 'Wyspecyfikowane', en: 'Specified' }, tone: 'info' },
      { key: 'planned', label: { pl: 'Zaplanowane', en: 'Planned' }, tone: 'neutral' },
      { key: 'implemented', label: { pl: 'Zaimplementowane', en: 'Implemented' }, tone: 'success' },
      { key: 'passing', label: { pl: 'Przechodzi testy', en: 'Passing' }, tone: 'success' },
      { key: 'approved-target', label: { pl: 'Zatwierdzony cel', en: 'Approved target' }, tone: 'success' },
      { key: 'required', label: { pl: 'Wymagane', en: 'Required' }, tone: 'warning' },
      { key: 'used', label: { pl: 'Używane', en: 'Used' }, tone: 'info' },
    ],
  },
] as const satisfies readonly ProjectStatusGroup[];


export const KolorySemantyczne: Story = {
  name: 'Kolory semantyczne',
  render: () => (
    <FoundationPage
      title={<Localized pl="Kolory semantyczne" en="Semantic colors" />}
      summary={<Localized pl="Paleta nie służy do dekoracji. Każdy token odpowiada za konkretną informację lub warstwę." en="The palette is not decorative. Each token owns a specific information or surface role." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Role interfejsu" en="Interface roles" />}
        summary={<Localized pl="Kolory są prezentowane jako rejestr, nie zbiór osobnych kart." en="Colors are shown as a ledger, not a collection of separate cards." />}
      >
        <FoundationLedger label={copy({ pl: 'Kolory interfejsu', en: 'Interface colors' })}>
          {semanticColors.map((item) => (
            <LedgerRow
              key={item.token}
              label={copy(item.role)}
              preview={<span className="pd-f0-color-chip" data-color={item.color} />}
              value={<TokenCode>{item.token}</TokenCode>}
              detail={<span className="pd-f0-color-value">var({item.token})</span>}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Paleta danych" en="Data palette" />}
        summary={<Localized pl="Serie są rozróżnialne, ale pozostają spokojne na analitycznym canvasie." en="Series remain distinguishable while staying calm on an analytical canvas." />}
      >
        <div className="pd-f0-series">
          {dataSeries.map((series) => (
            <div key={series}>
              <span data-series={series} />
              <div>
                <strong><Localized pl={`Seria ${series}`} en={`Series ${series}`} /></strong>
                <TokenCode>{`--pd-data-series-${series}`}</TokenCode>
              </div>
            </div>
          ))}
        </div>
        <div className="pd-f0-mini-chart" aria-label={copy({ pl: 'Przykład palety danych', en: 'Data palette example' })}>
          <span data-series="1" style={{ '--value': '68%' } as CSSProperties} />
          <span data-series="2" style={{ '--value': '44%' } as CSSProperties} />
          <span data-series="3" style={{ '--value': '57%' } as CSSProperties} />
          <span data-series="4" style={{ '--value': '32%' } as CSSProperties} />
          <span data-series="5" style={{ '--value': '76%' } as CSSProperties} />
          <span data-series="6" style={{ '--value': '49%' } as CSSProperties} />
        </div>
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Tony komunikatów" en="Message tones" />}
        summary={<Localized pl="Kolor wspiera tekst, ikonę lub stan. Nigdy nie jest jedynym nośnikiem znaczenia." en="Color supports text, icon or state. It is never the only carrier of meaning." />}
      >
        <p className="pd-f0-status-rule">
          <Localized
            pl="Środek komunikatu pozostaje neutralny. Ton semantyczny pojawia się jako lokalny akcent i zawsze towarzyszy mu czytelna etykieta."
            en="The message interior stays neutral. Semantic tone appears as a local accent and is always paired with a readable label."
          />
        </p>
        <div className="pd-f0-tone-register">
          {semanticTones.map((item) => (
            <article key={item.tone}>
              <StatusBadge tone={item.tone}><Localized {...item.label} /></StatusBadge>
              <TokenCode>{item.token}</TokenCode>
              <p><Localized {...item.usage} /></p>
            </article>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const StatusySystemowe: Story = {
  name: 'Statusy systemowe',
  render: () => (
    <FoundationPage
      title={<Localized pl="Statusy systemowe" en="System statuses" />}
      summary={<Localized pl="Katalog oddziela znaczenie biznesowe od tonu wizualnego. Każdy status ma nazwę, stabilny klucz i przypisany ton." en="The catalog separates business meaning from visual tone. Every status has a name, stable key and assigned tone." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Kategorie katalogu" en="Catalog categories" />}
        summary={<Localized pl="Statusy są pogrupowane według obszaru produktu, a nie według koloru." en="Statuses are grouped by product domain, not by color." />}
      >
        <div className="pd-f0-status-index">
          {projectStatusGroups.map((group, groupIndex) => (
            <article key={group.title.pl}>
              <span>{String(groupIndex + 1).padStart(2, '0')}</span>
              <div>
                <h3><Localized {...group.title} /></h3>
                <p><Localized {...group.description} /></p>
              </div>
              <strong>
                <Localized
                  pl={`${group.statuses.length} statusów`}
                  en={`${group.statuses.length} statuses`}
                />
              </strong>
            </article>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Katalog domenowy" en="Domain catalog" />}
        summary={<Localized pl="Rozwiń kategorię, aby sprawdzić etykietę, klucz techniczny i ton każdego stanu." en="Expand a category to inspect each state's label, technical key and tone." />}
      >
        <p className="pd-f0-status-rule">
          <Localized
            pl="Kolor nie definiuje statusu. Status definiują jego nazwa i klucz, a ton jedynie wspiera priorytet komunikatu."
            en="Color does not define a status. Its name and key do; tone only supports message priority."
          />
        </p>
        <div className="pd-f0-status-register">
          {projectStatusGroups.map((group, groupIndex) => (
            <details
              className="pd-f0-status-group"
              key={group.title.pl}
              open={groupIndex === 0}
            >
              <summary>
                <span>
                  <strong><Localized {...group.title} /></strong>
                  <small><Localized {...group.description} /></small>
                </span>
                <span className="pd-f0-status-count">
                  <Localized
                    pl={`${group.statuses.length} statusów`}
                    en={`${group.statuses.length} statuses`}
                  />
                </span>
              </summary>
              <div className="pd-f0-status-table" role="table">
                <div className="pd-f0-status-table__header" role="row">
                  <span role="columnheader"><Localized pl="Etykieta" en="Label" /></span>
                  <span role="columnheader"><Localized pl="Klucz techniczny" en="Technical key" /></span>
                  <span role="columnheader"><Localized pl="Ton" en="Tone" /></span>
                </div>
                {group.statuses.map((status) => (
                  <div className="pd-f0-status-item" role="row" key={`${group.title.pl}-${status.key}`}>
                    <span role="cell">
                      <StatusBadge tone={status.tone}><Localized {...status.label} /></StatusBadge>
                    </span>
                    <code role="cell">{status.key}</code>
                    <span className="pd-f0-status-tone" role="cell">
                      {copy(statusToneLabels[status.tone])}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
};

const spacingScale = [
  { token: '--pd-space-0', value: 0 },
  { token: '--pd-space-1', value: 4 },
  { token: '--pd-space-2', value: 8 },
  { token: '--pd-space-3', value: 12 },
  { token: '--pd-space-4', value: 16 },
  { token: '--pd-space-5', value: 20 },
  { token: '--pd-space-6', value: 24 },
  { token: '--pd-space-8', value: 32 },
  { token: '--pd-space-10', value: 40 },
  { token: '--pd-space-12', value: 48 },
  { token: '--pd-space-16', value: 64 },
] as const;

export const SpacingIGrid: Story = {
  name: 'Odstępy i siatka',
  render: () => (
    <FoundationPage
      title={<Localized pl="Odstępy, gęstość i siatka" en="Spacing, density and grid" />}
      summary={<Localized pl="Układ jest oparty na stałej skali i elastycznej siatce. Nie projektujemy lokalnych wyjątków dla każdej story." en="Layout uses a fixed scale and a flexible grid. Stories do not invent local exceptions." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Skala odstępów" en="Spacing scale" />}
        summary={<Localized pl="Każda wartość ma nazwę tokenu i widoczny wymiar." en="Every value has a token name and a visible dimension." />}
      >
        <div className="pd-f0-spacing-scale">
          {spacingScale.map((item) => (
            <div key={item.token}>
              <code>{item.token}</code>
              <span>{item.value}px</span>
              <i style={{ width: `${Math.max(item.value, 1)}px` }} />
            </div>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Gęstość" en="Density" />}
        summary={<Localized pl="Wariant kompaktowy zmienia rytm, ale nie zmienia hierarchii ani wyglądu komponentu." en="Compact density changes rhythm without changing hierarchy or component identity." />}
      >
        <ThemePair
          light={
            <ThemePreview theme="light" title={<Localized pl="Wygodna" en="Comfortable" />}>
              <div className="pd-f0-density-demo" data-density="comfortable">
                <div><span><Localized pl="Źródło danych" en="Data source" /></span><strong>Google Analytics 4</strong></div>
                <div><span><Localized pl="Status" en="Status" /></span><StatusBadge tone="success"><Localized pl="Stabilne" en="Stable" /></StatusBadge></div>
              </div>
            </ThemePreview>
          }
          dark={
            <ThemePreview theme="dark" title={<Localized pl="Kompaktowa" en="Compact" />}>
              <div className="pd-f0-density-demo" data-density="compact">
                <div><span><Localized pl="Źródło danych" en="Data source" /></span><strong>Google Analytics 4</strong></div>
                <div><span><Localized pl="Status" en="Status" /></span><StatusBadge tone="success"><Localized pl="Stabilne" en="Stable" /></StatusBadge></div>
              </div>
            </ThemePreview>
          }
        />
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Responsywna siatka" en="Responsive grid" />}
        summary={<Localized pl="Kolumny zmieniają liczbę, ale zawartość zachowuje kolejność i minimalną szerokość." en="Column count changes while content preserves order and minimum width." />}
      >
        <div className="pd-f0-grid-demo" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => <span key={index}>{index + 1}</span>)}
        </div>
        <FoundationLedger label={copy({ pl: 'Punkty siatki', en: 'Grid breakpoints' })}>
          <LedgerRow label="1440 px" value={<Localized pl="12 kolumn" en="12 columns" />} detail={<Localized pl="Pełny układ analityczny" en="Full analytical layout" />} />
          <LedgerRow label="768 px" value={<Localized pl="8 kolumn" en="8 columns" />} detail={<Localized pl="Sekcje przechodzą do jednego przepływu" en="Sections move to one flow" />} />
          <LedgerRow label="390 px" value={<Localized pl="4 kolumny" en="4 columns" />} detail={<Localized pl="Komponent i opis układają się pionowo" en="Component and description stack vertically" />} />
        </FoundationLedger>
      </FoundationSection>
    </FoundationPage>
  ),
};

const geometryRadiusRows = [
  {
    name: 'control',
    token: '--pd-radius-control',
    label: { pl: 'Kontrolka', en: 'Control' },
    detail: {
      pl: 'Select, input, zakres dat i lokalne akcje.',
      en: 'Select, input, date range and local actions.',
    },
    contract: {
      pl: 'Promień opisuje element wejściowy lub akcję o stałej wysokości.',
      en: 'The radius identifies an input or action with a fixed control height.',
    },
    avoid: {
      pl: 'Nie stosujemy go do dużych powierzchni i całych sekcji.',
      en: 'Do not use it for large surfaces or entire sections.',
    },
  },
  {
    name: 'overlay',
    token: '--pd-radius-overlay',
    label: { pl: 'Powierzchnia', en: 'Surface' },
    detail: {
      pl: 'Panel, modal, drawer, toast i inne rzeczywiste warstwy.',
      en: 'Panel, modal, drawer, toast and other real layers.',
    },
    contract: {
      pl: 'Promień pojawia się tylko wtedy, gdy element tworzy odrębną powierzchnię.',
      en: 'The radius appears only when the element creates a distinct surface.',
    },
    avoid: {
      pl: 'Nie opakowujemy nim każdego fragmentu dokumentacji.',
      en: 'Do not wrap every documentation fragment with it.',
    },
  },
  {
    name: 'pill',
    token: '--pd-radius-pill',
    label: { pl: 'Mikroznacznik', en: 'Micro marker' },
    detail: {
      pl: 'Status, badge, kropka aktywności i uchwyt scrollbara.',
      en: 'Status, badge, activity dot and scrollbar thumb.',
    },
    contract: {
      pl: 'Pełne zaokrąglenie jest zarezerwowane dla małych znaczników.',
      en: 'Full rounding is reserved for compact markers.',
    },
    avoid: {
      pl: 'Nie używamy go jako domyślnego promienia przycisków i kart.',
      en: 'Do not use it as the default radius for buttons or cards.',
    },
  },
] as const;

const geometryBorderRows = [
  {
    name: 'structure',
    group: 'structure',
    token: '--pd-separator',
    label: { pl: 'Linia strukturalna', en: 'Structural line' },
    detail: {
      pl: 'Topbar, granice canvasu i główne regiony aplikacji.',
      en: 'Topbar, canvas boundaries and main application regions.',
    },
  },
  {
    name: 'subtle',
    group: 'structure',
    token: '--pd-separator-subtle',
    label: { pl: 'Separator wewnętrzny', en: 'Internal separator' },
    detail: {
      pl: 'Wiersze danych, nagłówki paneli, listy zmian i sekcje pomocnicze.',
      en: 'Data rows, panel headers, change lists and supporting sections.',
    },
  },
  {
    name: 'accent',
    group: 'interaction',
    token: '--pd-brand-accent',
    label: { pl: 'Akcent aktywny', en: 'Active accent' },
    detail: {
      pl: 'Aktywna kontrolka, nawigacja i znacznik wybranej opcji.',
      en: 'Active control, navigation and selected option marker.',
    },
  },
  {
    name: 'left-accent',
    group: 'communication',
    token: '--pd-status-*',
    label: { pl: 'Linia statusu', en: 'Status line' },
    detail: {
      pl: 'Feedback i alert używają lokalnej linii semantycznej zamiast pełnego wypełnienia.',
      en: 'Feedback and alerts use a local semantic line instead of a full fill.',
    },
  },
] as const;

const geometryDepthRows = [
  {
    level: '00',
    name: 'none',
    token: '--pd-shadow-none',
    label: { pl: 'Canvas bazowy', en: 'Base canvas' },
    allowed: {
      pl: 'Canvas, region danych, tabela i zwykła sekcja robocza.',
      en: 'Canvas, data region, table and normal working section.',
    },
    forbidden: {
      pl: 'Nie służy do modali ani elementów ponad treścią.',
      en: 'Not for modals or elements above content.',
    },
  },
  {
    level: '01',
    name: 'raised',
    token: '--pd-shadow-raised',
    label: { pl: 'Panel uniesiony', en: 'Raised panel' },
    allowed: {
      pl: 'Panel wspierający, notification rail i lokalna powierzchnia robocza.',
      en: 'Supporting panel, notification rail and local working surface.',
    },
    forbidden: {
      pl: 'Nie zastępuje separatorów wewnątrz panelu.',
      en: 'Does not replace separators inside the panel.',
    },
  },
  {
    level: '02',
    name: 'floating',
    token: '--pd-shadow-floating',
    label: { pl: 'Element pływający', en: 'Floating element' },
    allowed: {
      pl: 'Dropdown, popover, toast i krótka warstwa operacyjna.',
      en: 'Dropdown, popover, toast and short-lived operational layer.',
    },
    forbidden: {
      pl: 'Nie używamy go do stałych regionów layoutu.',
      en: 'Do not use it for persistent layout regions.',
    },
  },
  {
    level: '03',
    name: 'overlay',
    token: '--pd-shadow-overlay',
    label: { pl: 'Overlay', en: 'Overlay' },
    allowed: {
      pl: 'Modal, formularz auth i najwyższa warstwa wymagająca uwagi.',
      en: 'Modal, auth form and top attention layer.',
    },
    forbidden: {
      pl: 'Nie może stać się domyślnym cieniem zwykłych kart.',
      en: 'Must not become the default shadow for ordinary cards.',
    },
  },
] as const;

function GeometryRadiusPreview({
  name,
}: {
  readonly name: (typeof geometryRadiusRows)[number]['name'];
}) {
  return (
    <div className="pd-f0-lab-radius-preview" data-radius={name} aria-hidden="true">
      {name === 'control' ? (
        <span className="pd-f0-lab-radius-control">
          <span>Commerce</span>
          <span>⌄</span>
        </span>
      ) : null}
      {name === 'overlay' ? (
        <span className="pd-f0-lab-radius-overlay">
          <span />
          <span />
        </span>
      ) : null}
      {name === 'pill' ? (
        <>
          <span className="pd-f0-lab-pill-dot" />
          <span className="pd-f0-lab-pill-badge">Active</span>
        </>
      ) : null}
    </div>
  );
}

function GeometryBorderPreview({
  name,
}: {
  readonly name: (typeof geometryBorderRows)[number]['name'];
}) {
  return (
    <div className="pd-f0-lab-border-preview" data-border={name} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function DepthCanvas() {
  return (
    <div
      className="pd-f0-depth-stage__canvas"
      role="img"
      aria-label={copy({
        pl: 'Relacja pomiędzy bazą, panelem uniesionym, elementem pływającym i overlayem',
        en: 'Relationship between the base, raised panel, floating element and overlay',
      })}
    >
      <div className="pd-f0-depth-stage__base" data-shadow="none">
        <div className="pd-f0-depth-stage__base-heading">
          <div>
            <span><Localized pl="Warstwa bazowa" en="Base layer" /></span>
            <strong><Localized pl="Przychód i kampanie" en="Revenue and campaigns" /></strong>
          </div>
          <span><Localized pl="Aktualizacja 2 min temu" en="Updated 2 min ago" /></span>
        </div>
        <div className="pd-f0-depth-stage__metrics">
          <div>
            <span><Localized pl="Przychód" en="Revenue" /></span>
            <strong>1 248 590 zł</strong>
          </div>
          <div>
            <span><Localized pl="Marża" en="Margin" /></span>
            <strong>24,8%</strong>
          </div>
          <div>
            <span><Localized pl="Alerty" en="Alerts" /></span>
            <strong>3</strong>
          </div>
        </div>
      </div>

      <div className="pd-f0-depth-stage__raised" data-shadow="raised">
        <span><Localized pl="Panel uniesiony" en="Raised panel" /></span>
        <strong><Localized pl="Rekomendacje" en="Recommendations" /></strong>
        <p><Localized pl="Wspiera analizę, ale pozostaje częścią canvasu." en="Supports analysis while remaining part of the canvas." /></p>
      </div>

      <div className="pd-f0-depth-stage__floating" data-shadow="floating">
        <span><Localized pl="Element pływający" en="Floating element" /></span>
        <strong><Localized pl="Źródła danych" en="Data sources" /></strong>
        <p>Meta Ads · GA4 · Commerce</p>
      </div>

      <div className="pd-f0-depth-stage__overlay" data-shadow="overlay">
        <header>
          <div>
            <span><Localized pl="Warstwa wymagająca uwagi" en="Attention layer" /></span>
            <strong><Localized pl="Zastosować rekomendację?" en="Apply recommendation?" /></strong>
          </div>
          <span><Localized pl="Zamknij" en="Close" /></span>
        </header>
        <div>
          <p><Localized pl="Zmiana nie zostanie wykonana bez potwierdzenia użytkownika." en="The change will not be applied without user confirmation." /></p>
          <dl>
            <div>
              <dt><Localized pl="Wpływ" en="Impact" /></dt>
              <dd>+7,80%</dd>
            </div>
            <div>
              <dt><Localized pl="Pewność" en="Confidence" /></dt>
              <dd><Localized pl="Wysoka" en="High" /></dd>
            </div>
          </dl>
        </div>
        <footer>
          <span><Localized pl="Anuluj" en="Cancel" /></span>
          <strong><Localized pl="Zatwierdź zmianę" en="Approve change" /></strong>
        </footer>
      </div>

      <div className="pd-f0-depth-stage__toast" data-shadow="floating">
        <span className="pd-f0-depth-stage__toast-marker" />
        <div>
          <strong><Localized pl="Rekomendacja przygotowana" en="Recommendation prepared" /></strong>
          <p><Localized pl="Zapisano jako wersję roboczą." en="Saved as a draft." /></p>
        </div>
      </div>
    </div>
  );
}

export const PromienieIGeometria: Story = {
  name: 'Promienie i geometria',
  render: () => (
    <FoundationPage
      title={<Localized pl="Promienie i geometria" en="Radii and geometry" />}
      summary={<Localized pl="Trzy role geometryczne porządkują kontrolki, rzeczywiste powierzchnie i małe znaczniki. Promień wynika z funkcji, nie z dekoracji." en="Three geometry roles organize controls, real surfaces and compact markers. Radius follows function, not decoration." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Role geometryczne" en="Geometry roles" />}
        summary={<Localized pl="Każda rola ma jeden przykład, jeden token i jasno określony zakres użycia." en="Each role has one example, one token and a clearly defined scope." />}
      >
        <div className="pd-f0-lab-only-grid" role="list" aria-label={copy({ pl: 'Role promieni', en: 'Radius roles' })}>
          {geometryRadiusRows.map((item) => (
            <article className="pd-f0-lab-only-card" key={item.name} role="listitem">
              <GeometryRadiusPreview name={item.name} />
              <strong>{copy(item.label)}</strong>
              <code className="pd-f0-lab-only-token">{item.token}</code>
              <p>{copy(item.detail)}</p>
            </article>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Kontrakt użycia" en="Usage contract" />}
        summary={<Localized pl="Ten sam promień nie może opisywać wszystkich elementów interfejsu." en="The same radius must not describe every interface element." />}
      >
        <div className="pd-f0-geometry-contract" role="list">
          {geometryRadiusRows.map((item, index) => (
            <article key={item.name} role="listitem">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{copy(item.label)}</strong>
                <p>{copy(item.contract)}</p>
              </div>
              <div>
                <span><Localized pl="Nie używamy" en="Avoid" /></span>
                <p>{copy(item.avoid)}</p>
              </div>
            </article>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const LinieISeparacja: Story = {
  name: 'Linie i separacja',
  render: () => (
    <FoundationPage
      title={<Localized pl="Linie i separacja" en="Lines and separation" />}
      summary={<Localized pl="Linie są uporządkowane według trzech funkcji: struktury, interakcji i komunikacji. Nie tworzymy dekoracyjnej palety ramek." en="Lines are organized by three functions: structure, interaction and communication. We do not create a decorative border palette." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Struktura" en="Structure" />}
        summary={<Localized pl="Główne granice i wewnętrzne podziały mają różną wagę i nie są zamienne." en="Main boundaries and internal divisions have different weight and are not interchangeable." />}
      >
        <div className="pd-f0-separation-grid" data-columns="2" role="list">
          {geometryBorderRows.filter((item) => item.group === 'structure').map((item) => (
            <article className="pd-f0-lab-border-card" key={item.name} role="listitem">
              <GeometryBorderPreview name={item.name} />
              <strong>{copy(item.label)}</strong>
              <code className="pd-f0-lab-only-token">{item.token}</code>
              <p>{copy(item.detail)}</p>
            </article>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Interakcja" en="Interaction" />}
        summary={<Localized pl="Akcent pojawia się lokalnie i wskazuje wybrany lub aktywny element." en="The accent appears locally and identifies a selected or active element." />}
      >
        <div className="pd-f0-separation-grid" data-columns="1" role="list">
          {geometryBorderRows.filter((item) => item.group === 'interaction').map((item) => (
            <article className="pd-f0-lab-border-card" key={item.name} role="listitem">
              <GeometryBorderPreview name={item.name} />
              <strong>{copy(item.label)}</strong>
              <code className="pd-f0-lab-only-token">{item.token}</code>
              <p>{copy(item.detail)}</p>
            </article>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Komunikacja" en="Communication" />}
        summary={<Localized pl="Status używa semantycznej linii i tekstu zamiast pełnego kolorowego kontenera." en="Status uses a semantic line and text instead of a fully colored container." />}
      >
        <div className="pd-f0-separation-grid" data-columns="1" role="list">
          {geometryBorderRows.filter((item) => item.group === 'communication').map((item) => (
            <article className="pd-f0-lab-border-card" key={item.name} role="listitem">
              <GeometryBorderPreview name={item.name} />
              <strong>{copy(item.label)}</strong>
              <code className="pd-f0-lab-only-token">{item.token}</code>
              <p>{copy(item.detail)}</p>
            </article>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const GlebiaIWarstwy: Story = {
  name: 'Głębia i warstwy',
  render: () => (
    <FoundationPage
      title={<Localized pl="Głębia i warstwy" en="Depth and layers" />}
      summary={<Localized pl="Cień komunikuje zmianę poziomu. Wszystkie warstwy pokazujemy w jednej relacji, a ich kontrakt zapisujemy w stałej kolejności od canvasu do overlayu." en="Shadow communicates a level change. All layers are shown in one relationship and their contract follows a fixed order from canvas to overlay." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Hierarchia warstw" en="Layer hierarchy" />}
        summary={<Localized pl="Canvas, panel, element pływający i overlay muszą być czytelne jako jeden system." en="Canvas, panel, floating element and overlay must read as one system." />}
      >
        <div className="pd-f0-depth-stage">
          <DepthCanvas />
        </div>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Kontrakt poziomów" en="Level contract" />}
        summary={<Localized pl="Każdy poziom ma dozwolone zastosowanie i jednoznaczne ograniczenie." en="Each level has an allowed use and an explicit restriction." />}
      >
        <div className="pd-f0-depth-contract" role="table" aria-label={copy({ pl: 'Kontrakt poziomów głębi', en: 'Depth level contract' })}>
          <div className="pd-f0-depth-contract__header" role="row">
            <span role="columnheader"><Localized pl="Poziom" en="Level" /></span>
            <span role="columnheader"><Localized pl="Rola i token" en="Role and token" /></span>
            <span role="columnheader"><Localized pl="Dozwolone" en="Allowed" /></span>
            <span role="columnheader"><Localized pl="Niedozwolone" en="Not allowed" /></span>
          </div>
          {geometryDepthRows.map((item) => (
            <article key={item.name} role="row" data-shadow={item.name}>
              <span className="pd-f0-depth-contract__level" role="cell">{item.level}</span>
              <div role="cell">
                <strong>{copy(item.label)}</strong>
                <code className="pd-f0-lab-only-token">{item.token}</code>
              </div>
              <p role="cell">{copy(item.allowed)}</p>
              <p role="cell">{copy(item.forbidden)}</p>
            </article>
          ))}
        </div>

        <p className="pd-f0-lab-only-note">
          <Icon decorative name="warning" size={16} />
          <Localized
            pl="Struktura wewnątrz panelu nadal wynika z powierzchni, rytmu i separatorów. Cień nie może zastępować hierarchii."
            en="Structure inside a panel still comes from surfaces, rhythm and separators. Shadow must not replace hierarchy."
          />
        </p>
      </FoundationSection>
    </FoundationPage>
  ),
};


type FoundationProjectGraphicKey =
  | PapaDataIconName
  | 'arrow-north-east'
  | 'globe'
  | 'moon-star';

type FoundationProjectGraphic = {
  readonly key: FoundationProjectGraphicKey;
  readonly label: LocalizedCopy;
  readonly category: LocalizedCopy;
  readonly source: LocalizedCopy;
  readonly underline: boolean;
  readonly note: LocalizedCopy;
};

const foundationProjectGraphics = [
  {
    key: 'home',
    label: { pl: 'Home', en: 'Home' },
    category: { pl: 'Nawigacja', en: 'Navigation' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Ikona nawigacyjna bez dodatkowego akcentu.', en: 'Navigation icon without an additional accent.' },
  },
  {
    key: 'search',
    label: { pl: 'Search', en: 'Search' },
    category: { pl: 'Akcja', en: 'Action' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Akcja pomocnicza bez kreski pod symbolem.', en: 'Auxiliary action without an underline beneath the symbol.' },
  },
  {
    key: 'integration',
    label: { pl: 'Integration', en: 'Integration' },
    category: { pl: 'Akcja', en: 'Action' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Ikona połączenia lub przejścia do integracji.', en: 'Connection or integration entry icon.' },
  },
  {
    key: 'arrow-north-east',
    label: { pl: 'ArrowNorthEast', en: 'ArrowNorthEast' },
    category: { pl: 'Grafika pomocnicza', en: 'Supporting graphic' },
    source: { pl: 'storybook-next/stories/story-icons.tsx', en: 'storybook-next/stories/story-icons.tsx' },
    underline: false,
    note: { pl: 'Zewnętrzne przejście lub link bez dodatkowej kreski.', en: 'External transition or link without an additional underline.' },
  },
  {
    key: 'data',
    label: { pl: 'Data', en: 'Data' },
    category: { pl: 'Dane', en: 'Data' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Zbiór danych, warstwa danych lub zakres.', en: 'Dataset, data layer, or data scope.' },
  },
  {
    key: 'trend',
    label: { pl: 'Trend', en: 'Trend' },
    category: { pl: 'Analiza', en: 'Analytics' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Wykres i kierunek zmiany bez dekoracyjnej kreski.', en: 'Chart and change direction without a decorative underline.' },
  },
  {
    key: 'billing',
    label: { pl: 'Billing', en: 'Billing' },
    category: { pl: 'Finanse', en: 'Finance' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Płatności, rozliczenia i plan subskrypcji.', en: 'Payments, billing, and subscription plans.' },
  },
  {
    key: 'security',
    label: { pl: 'Security', en: 'Security' },
    category: { pl: 'System', en: 'System' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Bezpieczeństwo, zgodność i zaufanie bez kreski sygnałowej.', en: 'Security, compliance, and trust without a signal underline.' },
  },
  {
    key: 'assistant',
    label: { pl: 'Assistant', en: 'Assistant' },
    category: { pl: 'System', en: 'System' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Papa Asystent jako znak systemowy, bez linii pod spodem.', en: 'Papa Assistant as a system sign, without an underline.' },
  },
  {
    key: 'success',
    label: { pl: 'Success', en: 'Success' },
    category: { pl: 'Status', en: 'Status' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: false,
    note: { pl: 'Status sukcesu pozostaje czystą ikoną liniową.', en: 'Success status remains a clean line icon.' },
  },
  {
    key: 'warning',
    label: { pl: 'Warning', en: 'Warning' },
    category: { pl: 'Status / sygnał', en: 'Status / signal' },
    source: { pl: 'design-system/icons/Icon.tsx', en: 'design-system/icons/Icon.tsx' },
    underline: true,
    note: { pl: 'Wariant sygnałowy ostrzeżenia używa akcentowej kreski pod symbolem.', en: 'The warning signal variant uses an accent underline beneath the symbol.' },
  },
  {
    key: 'globe',
    label: { pl: 'Globe', en: 'Globe' },
    category: { pl: 'Grafika pomocnicza', en: 'Supporting graphic' },
    source: { pl: 'storybook-next/stories/story-icons.tsx', en: 'storybook-next/stories/story-icons.tsx' },
    underline: false,
    note: { pl: 'Przełączanie języka lub zasięg, bez kreski.', en: 'Locale switch or scope, without an underline.' },
  },
  {
    key: 'moon-star',
    label: { pl: 'MoonStar', en: 'MoonStar' },
    category: { pl: 'Grafika pomocnicza', en: 'Supporting graphic' },
    source: { pl: 'storybook-next/stories/story-icons.tsx', en: 'storybook-next/stories/story-icons.tsx' },
    underline: false,
    note: { pl: 'Tryb motywu lub nocny, bez kreski pod ikoną.', en: 'Theme or night mode, without a line beneath the icon.' },
  },
] as const satisfies readonly FoundationProjectGraphic[];

const foundationProjectGraphicGroups: ReadonlyArray<{
  readonly title: LocalizedCopy;
  readonly description: LocalizedCopy;
  readonly keys: readonly FoundationProjectGraphicKey[];
}> = [
  {
    title: { pl: 'Nawigacja i akcje', en: 'Navigation and actions' },
    description: { pl: 'Ikony akcji i przejścia nie dostają osobnych kontenerów. Pokazujemy je jako lekkie elementy liniowe wspierające etykietę.', en: 'Action and transition icons do not get separate containers. We present them as lightweight line elements that support the label.' },
    keys: ['home', 'search', 'integration', 'arrow-north-east'],
  },
  {
    title: { pl: 'Dane i analiza', en: 'Data and analytics' },
    description: { pl: 'Ikony danych zachowują wspólną geometrię i nie są opakowane w karty ani boxy.', en: 'Data icons keep a shared geometry and are not wrapped in cards or boxes.' },
    keys: ['data', 'trend', 'billing'],
  },
  {
    title: { pl: 'System i status', en: 'System and status' },
    description: { pl: 'Status zawsze ma tekst. Dodatkowa kreska pod ikoną jest wyjątkiem zarezerwowanym tylko dla wariantu ostrzeżenia.', en: 'Status always includes text. The extra underline below the icon is an exception reserved only for the warning variant.' },
    keys: ['security', 'assistant', 'success', 'warning'],
  },
  {
    title: { pl: 'Grafiki środowiska', en: 'Environment graphics' },
    description: { pl: 'Pomocnicze grafiki Storybooka dla globali: język i motyw. Również bez kontenerów i bez kreski.', en: 'Supporting Storybook graphics for globals: locale and theme. Also without containers and without an underline.' },
    keys: ['globe', 'moon-star'],
  },
];

function findFoundationProjectGraphic(
  key: FoundationProjectGraphicKey,
) {
  return foundationProjectGraphics.find((item) => item.key === key)!;
}

function FoundationProjectGraphicSvg({
  item,
}: {
  readonly item: FoundationProjectGraphic;
}) {
  switch (item.key) {
    case 'arrow-north-east':
      return <ArrowNorthEastIcon />;
    case 'globe':
      return <GlobeIcon />;
    case 'moon-star':
      return <MoonStarIcon />;
    default:
      return <Icon decorative name={item.key} size={20} />;
  }
}

function FoundationProjectGraphicPreview({
  item,
}: {
  readonly item: FoundationProjectGraphic;
}) {
  return (
    <span
      className="pd-f0-iconography-preview"
      data-underline={item.underline ? 'true' : 'false'}
      aria-hidden="true"
    >
      <FoundationProjectGraphicSvg item={item} />
    </span>
  );
}

export const Ikonografia: Story = {
  name: 'Ikonografia',
  render: () => (
    <FoundationPage
      title={<Localized pl="Ikonografia" en="Iconography" />}
      summary={<Localized pl="Fundamenty pokazują pełny katalog ikon i grafik używanych w projekcie. Bez dodatkowych kontenerów, bez przesuwania treści w prawo i z jasnym rozróżnieniem, gdzie pojawia się kreska pod symbolem." en="Foundations show the full catalog of icons and graphics used in the project. Without extra containers, without pushing content to the right, and with a clear distinction of where the underline appears beneath the symbol." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Komplet używanych ikon i grafik" en="Complete set of used icons and graphics" />}
        summary={<Localized pl="To jest aktualny katalog źródeł występujących w projekcie: ikony z design systemu oraz dodatkowe grafiki pomocnicze Storybooka." en="This is the current source catalog used in the project: icons from the design system and supporting Storybook graphics." />}
      >
        <FoundationLedger label={copy({ pl: 'Katalog ikon i grafik projektu', en: 'Project icon and graphic catalog' })}>
          {foundationProjectGraphics.map((item) => (
            <LedgerRow
              key={item.key}
              label={(
                <div className="pd-f0-iconography-label">
                  <strong>{copy(item.label)}</strong>
                  <span>{copy(item.note)}</span>
                </div>
              )}
              preview={<FoundationProjectGraphicPreview item={item} />}
              value={(
                <div className="pd-f0-iconography-meta">
                  <strong>{copy(item.category)}</strong>
                  <span>{copy(item.source)}</span>
                </div>
              )}
              detail={(
                <div className="pd-f0-iconography-detail">
                  <strong><Localized pl="Kreska pod spodem" en="Underline" /></strong>
                  <span>{copy(item.underline ? { pl: 'Tak', en: 'Yes' } : { pl: 'Nie', en: 'No' })}</span>
                </div>
              )}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Role i zasady użycia" en="Roles and usage rules" />}
        summary={<Localized pl="Ikony i grafiki pozostają częścią układu listowego. Nie budujemy z nich osobnych kafli ani kart." en="Icons and graphics remain part of a list-based layout. We do not turn them into separate tiles or cards." />}
      >
        <div className="pd-f0-iconography-role-list">
          {foundationProjectGraphicGroups.map((group) => (
            <article className="pd-f0-iconography-role" key={group.title.pl}>
              <header>
                <h3>{copy(group.title)}</h3>
                <p>{copy(group.description)}</p>
              </header>
              <div className="pd-f0-iconography-strip">
                {group.keys.map((key) => {
                  const item = findFoundationProjectGraphic(key);
                  return (
                    <span key={item.key}>
                      <FoundationProjectGraphicPreview item={item} />
                      <strong>{copy(item.label)}</strong>
                    </span>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Kiedy pojawia się kreska" en="When the underline appears" />}
        summary={<Localized pl="Kreska pod symbolem jest wyjątkiem, a nie stałą dekoracją całej ikonografii." en="The underline beneath a symbol is an exception, not a default decoration for the whole iconography." />}
      >
        <FoundationVariant
          title={<Localized pl="Wariant sygnałowy vs. zwykły" en="Signal variant vs. regular" />}
          description={<Localized pl="Pokazujemy to na prostych wierszach: ostrzeżenie ma kreskę, pozostałe symbole nie." en="We show it in simple rows: warning uses the underline, the remaining symbols do not." />}
        >
          <div className="pd-f0-iconography-note">
            <p>
              <Localized
                pl="W projekcie kreska pod ikoną jest dozwolona tylko dla przygotowanego wariantu sygnałowego. Nie dokładamy jej do wszystkich ikon systemowych."
                en="In this project, the underline beneath the icon is allowed only for the prepared signal variant. We do not add it to all system icons."
              />
            </p>
            <FoundationLedger label={copy({ pl: 'Porównanie wariantów ikonografii', en: 'Iconography variant comparison' })}>
              {(['warning', 'success', 'assistant', 'security'] as const satisfies readonly FoundationProjectGraphicKey[]).map((key) => {
                const item = findFoundationProjectGraphic(key);
                return (
                  <LedgerRow
                    key={item.key}
                    label={<strong>{copy(item.label)}</strong>}
                    preview={<FoundationProjectGraphicPreview item={item} />}
                    value={copy(item.underline ? { pl: 'wariant sygnałowy', en: 'signal variant' } : { pl: 'wariant standardowy', en: 'standard variant' })}
                    detail={copy(item.underline ? { pl: 'kreska: tak', en: 'underline: yes' } : { pl: 'kreska: nie', en: 'underline: no' })}
                  />
                );
              })}
            </FoundationLedger>
          </div>
        </FoundationVariant>
      </FoundationSection>
    </FoundationPage>
  ),
};

function MotionDemo({
  reduced,
}: {
  readonly reduced: boolean;
}) {
  const [run, setRun] = useState(false);

  return (
    <div className="pd-f0-motion-demo" data-motion={reduced ? 'reduced' : 'full'}>
      <div className="pd-f0-motion-demo__track" aria-hidden="true">
        <span data-run={run ? 'true' : 'false'} />
      </div>
      <FoundationButton
        icon="trend"
        onClick={() => {
          setRun(false);
          window.requestAnimationFrame(() => setRun(true));
        }}
      >
        <Localized pl="Uruchom zmianę" en="Run change" />
      </FoundationButton>
      <p role="status">
        {run
          ? <Localized pl="Stan został zaktualizowany." en="State updated." />
          : <Localized pl="Gotowe do demonstracji." en="Ready to demonstrate." />}
      </p>
    </div>
  );
}

function MotionModePreview({
  index,
  reduced,
  title,
  description,
}: {
  readonly index: string;
  readonly reduced: boolean;
  readonly title: ReactNode;
  readonly description: ReactNode;
}) {
  return (
    <article
      className="pd-f0-motion-mode"
      data-motion={reduced ? 'reduced' : 'full'}
    >
      <header>
        <span>{index}</span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </header>
      <MotionDemo reduced={reduced} />
    </article>
  );
}

export const MotionIReducedMotion: Story = {
  name: 'Motion i ograniczenie ruchu',
  render: () => (
    <FoundationPage
      title={<Localized pl="Motion i ograniczenie ruchu" en="Motion and reduced motion" />}
      summary={<Localized pl="Ruch potwierdza zmianę stanu. Nie jest tłem, ozdobą ani warunkiem zrozumienia interfejsu." en="Motion confirms a state change. It is not background decoration or required for understanding." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Kiedy ruch jest dozwolony" en="When motion is allowed" />}
        summary={<Localized pl="Animacja musi mieć funkcję, krótki czas i odpowiednik bez ruchu." en="Animation needs a function, short duration and a non-motion equivalent." />}
      >
        <div className="pd-f0-principles">
          <article><span>01</span><div><h3><Localized pl="Zmiana stanu" en="State change" /></h3><p><Localized pl="Potwierdza wykonanie akcji lub aktualizację danych." en="Confirms an action or data update." /></p></div></article>
          <article><span>02</span><div><h3><Localized pl="Wejście warstwy" en="Layer entry" /></h3><p><Localized pl="Pokazuje relację triggera z dialogiem lub popoverem." en="Shows the relationship between a trigger and a dialog or popover." /></p></div></article>
          <article><span>03</span><div><h3><Localized pl="Zmiana priorytetu" en="Priority change" /></h3><p><Localized pl="Kieruje uwagę bez pulsowania i ciągłego ruchu." en="Guides attention without pulsing or continuous motion." /></p></div></article>
        </div>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Pełny ruch i redukcja" en="Full and reduced motion" />}
        summary={<Localized pl="Oba warianty dziedziczą bieżący motyw, przekazują ten sam rezultat i zachowują ten sam układ." en="Both variants inherit the current theme, communicate the same result and preserve the same layout." />}
      >
        <div className="pd-f0-motion-comparison">
          <MotionModePreview
            index="01"
            reduced={false}
            title={<Localized pl="Ruch standardowy" en="Standard motion" />}
            description={<Localized pl="Krótka animacja pokazuje kierunek i potwierdza zmianę stanu." en="A short animation shows direction and confirms the state change." />}
          />
          <MotionModePreview
            index="02"
            reduced
            title={<Localized pl="Ruch ograniczony" en="Reduced motion" />}
            description={<Localized pl="Rezultat pojawia się natychmiast, bez przesunięcia i bez utraty informacji." en="The result appears immediately, without movement or information loss." />}
          />
        </div>
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Tokeny ruchu" en="Motion tokens" />}
        summary={<Localized pl="Czas i easing są wspólne dla systemu." en="Duration and easing are shared across the system." />}
      >
        <div className="pd-f0-motion-token-groups">
          <section>
            <h3><Localized pl="Czas" en="Duration" /></h3>
            <FoundationLedger label={copy({ pl: 'Tokeny czasu ruchu', en: 'Motion duration tokens' })}>
              <LedgerRow label={<Localized pl="Natychmiast" en="Instant" />} value={<TokenCode>{motionTokens.duration.instant}</TokenCode>} detail="70 ms" />
              <LedgerRow label={<Localized pl="Szybko" en="Fast" />} value={<TokenCode>{motionTokens.duration.fast}</TokenCode>} detail="110 ms" />
              <LedgerRow label={<Localized pl="Standard" en="Standard" />} value={<TokenCode>{motionTokens.duration.standard}</TokenCode>} detail="180 ms" />
              <LedgerRow label={<Localized pl="Celowo" en="Deliberate" />} value={<TokenCode>{motionTokens.duration.deliberate}</TokenCode>} detail="240 ms" />
            </FoundationLedger>
          </section>
          <section>
            <h3><Localized pl="Easing" en="Easing" /></h3>
            <FoundationLedger label={copy({ pl: 'Tokeny easing', en: 'Easing tokens' })}>
              <LedgerRow
                label={<Localized pl="Standardowy" en="Standard" />}
                value={<TokenCode>{motionTokens.easing.standard}</TokenCode>}
                detail="cubic-bezier(0.2, 0, 0, 1)"
              />
              <LedgerRow
                label={<Localized pl="Wzmocniony" en="Emphasized" />}
                value={<TokenCode>{motionTokens.easing.emphasized}</TokenCode>}
                detail="cubic-bezier(0.16, 1, 0.3, 1)"
              />
            </FoundationLedger>
          </section>
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
};

function AccessibleChoice() {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const options = ['CRM', 'Commerce', 'Analityka'] as const;
  const [selected, setSelected] = useState<(typeof options)[number]>('CRM');

  const focusOption = (index: number) => {
    const boundedIndex = Math.max(
      0,
      Math.min(index, options.length - 1),
    );

    optionRefs.current[boundedIndex]?.focus();
  };

  const openList = (index: number) => {
    setOpen(true);
    window.requestAnimationFrame(() => focusOption(index));
  };

  const closeList = (returnFocus = true) => {
    setOpen(false);

    if (returnFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  const selectOption = (option: typeof options[number]) => {
    setSelected(option);
    closeList();
  };

  return (
    <div className="pd-f0-choice">
      <label id={`${id}-label`}><Localized pl="Kanał danych" en="Data channel" /></label>
      <p className="pd-f0-choice__help" id={`${id}-help`}>
        <Localized
          pl="Otwórz listę i wybierz kanał. Po zatwierdzeniu fokus wróci do przycisku."
          en="Open the list and choose a channel. After selection, focus returns to the trigger."
        />
      </p>
      <div className="pd-f0-choice__control">
        <button
          ref={triggerRef}
          aria-controls={`${id}-listbox`}
          aria-describedby={`${id}-help`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-labelledby={`${id}-label ${id}-value`}
          className="pd-f0-choice__trigger"
          onClick={() => {
            if (open) {
              closeList(false);
            } else {
              openList(options.indexOf(selected));
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              openList(options.indexOf(selected));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              openList(options.length - 1);
            } else if (event.key === 'Escape' && open) {
              event.preventDefault();
              closeList();
            }
          }}
          type="button"
        >
          <span id={`${id}-value`}>{selected}</span>
          <span aria-hidden="true">⌄</span>
        </button>
        {open ? (
          <div
            className="pd-f0-choice__list"
            id={`${id}-listbox`}
            role="listbox"
            aria-labelledby={`${id}-label`}
          >
            {options.map((option, index) => (
              <button
                aria-selected={selected === option}
                key={option}
                onClick={() => selectOption(option)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    focusOption((index + 1) % options.length);
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    focusOption((index - 1 + options.length) % options.length);
                  } else if (event.key === 'Home') {
                    event.preventDefault();
                    focusOption(0);
                  } else if (event.key === 'End') {
                    event.preventDefault();
                    focusOption(options.length - 1);
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    closeList();
                  } else if (event.key === 'Tab') {
                    closeList(false);
                  }
                }}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                type="button"
              >
                <span>{option}</span>
                {selected === option ? <span aria-hidden="true">✓</span> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="pd-f0-choice__feedback">
        <p>
          <strong><Localized pl="Nazwa dostępna" en="Accessible name" /></strong>
          <span><Localized pl="Kanał danych, wybrano" en="Data channel, selected" />: {selected}</span>
        </p>
        <p aria-live="polite" role="status">
          <strong><Localized pl="Status" en="Status" /></strong>
          <span><Localized pl="Wybrano" en="Selected" />: {selected}</span>
        </p>
        <p>
          <strong><Localized pl="Powrót fokusu" en="Focus return" /></strong>
          <span><Localized pl="Po wyborze fokus wraca do przycisku Kanał danych." en="After selection, focus returns to the Data channel trigger." /></span>
        </p>
      </div>
    </div>
  );
}

const accessibilityRows = [
  { title: { pl: 'Fokus', en: 'Focus' }, detail: { pl: 'Widoczny focus-visible na każdej kontrolce.', en: 'Visible focus-visible on every control.' }, token: ':focus-visible' },
  { title: { pl: 'Klawiatura', en: 'Keyboard' }, detail: { pl: 'Tab, Enter, Space, Escape i strzałki zgodnie z rolą.', en: 'Tab, Enter, Space, Escape and arrows follow the role.' }, token: 'keyboard' },
  { title: { pl: 'Nazwa', en: 'Name' }, detail: { pl: 'Nazwa opisuje akcję, nie wygląd ikony.', en: 'The name describes the action, not the icon appearance.' }, token: 'aria-label' },
  { title: { pl: 'Komunikat', en: 'Announcement' }, detail: { pl: 'Zmiana asynchroniczna jest ogłaszana bez przenoszenia fokusu.', en: 'Async change is announced without moving focus.' }, token: 'aria-live' },
  { title: { pl: 'Status', en: 'Status' }, detail: { pl: 'Kolor zawsze ma tekstowy odpowiednik.', en: 'Color always has a textual equivalent.' }, token: 'text + color' },
  { title: { pl: 'Reflow', en: 'Reflow' }, detail: { pl: 'Interfejs działa przy 200% bez poziomego scrolla strony.', en: 'The interface works at 200% without page-level horizontal scrolling.' }, token: '200%' },
] as const;

export const Dostepnosc: Story = {
  name: 'Dostępność systemowa',
  render: () => (
    <FoundationPage
      title={<Localized pl="Dostępność systemowa" en="System accessibility" />}
      summary={<Localized pl="Dostępność jest częścią kontraktu komponentu, a nie osobną warstwą dodawaną po projekcie." en="Accessibility is part of the component contract, not a layer added after design." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Kontrakt" en="Contract" />}
        summary={<Localized pl="Każdy komponent przechodzi przez te same sześć warstw." en="Every component passes through the same six layers." />}
      >
        <FoundationLedger label={copy({ pl: 'Kontrakt dostępności', en: 'Accessibility contract' })}>
          {accessibilityRows.map((item) => (
            <LedgerRow
              key={item.token}
              label={copy(item.title)}
              value={<TokenCode>{item.token}</TokenCode>}
              detail={copy(item.detail)}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Przykład interaktywny" en="Interactive example" />}
        summary={<Localized pl="Kontrolka ma widoczną etykietę, nazwę dostępną, status i powrót fokusu." en="The control has a visible label, accessible name, status and focus return." />}
      >
        <FoundationVariant
          title={<Localized pl="Wybór kanału" en="Channel selection" />}
          description={<Localized pl="Ten sam wzorzec działa myszą i klawiaturą." en="The same pattern works with mouse and keyboard." />}
          surface="subtle"
        >
          <AccessibleChoice />
        </FoundationVariant>
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Dowody w interfejsie" en="Evidence in the interface" />}
        summary={<Localized pl="Wizualna prezentacja pokazuje rzeczywiste zachowanie, nie techniczny debugger." en="The visual presentation shows real behavior, not a technical debugger." />}
      >
        <div className="pd-f0-evidence">
          <div>
            <button className="pd-f0-icon-button" aria-label={copy({ pl: 'Szukaj w danych', en: 'Search data' })} type="button">
              <Icon decorative name="search" size={20} />
            </button>
            <div><strong><Localized pl="Nazwa kontrolki" en="Control name" /></strong><p><Localized pl="Ikona nie jest jedynym źródłem znaczenia." en="The icon is not the only source of meaning." /></p></div>
          </div>
          <div>
            <StatusBadge tone="warning"><Localized pl="Dane opóźnione" en="Data delayed" /></StatusBadge>
            <div><strong><Localized pl="Status tekstowy" en="Text status" /></strong><p><Localized pl="Kolor wspiera jednoznaczny tekst." en="Color supports explicit text." /></p></div>
          </div>
          <div>
            <span className="pd-f0-focus-sample" tabIndex={0}><Localized pl="Element fokusowalny" en="Focusable element" /></span>
            <div><strong><Localized pl="Widoczny fokus" en="Visible focus" /></strong><p><Localized pl="Obrys jest czytelny w obu motywach." en="The outline remains clear in both themes." /></p></div>
          </div>
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: /Kanał danych CRM|Data channel CRM/,
    });

    await userEvent.click(trigger);
    const listbox = canvas.getByRole('listbox', {
      name: /Kanał danych|Data channel/,
    });
    await expect(listbox).toBeInTheDocument();

    const commerce = canvas.getByRole('option', {
      name: 'Commerce',
    });
    await userEvent.click(commerce);
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent(/Commerce/);
  },
};
