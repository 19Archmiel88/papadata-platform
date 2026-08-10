import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  CSSProperties,
  ReactNode,
} from 'react';
import {
  useState,
} from 'react';
import {
  expect,
  userEvent,
  waitFor,
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
  type SemanticStatusTone,
} from '../../../design-system/foundations';
import {
  Button,
} from '../../../design-system/components/Button';
import {
  Select,
} from '../../../design-system/components/Select';
import {
  StatusBadge,
} from '../../../design-system/components/StatusBadge';
import {
  Icon,
  PapaDataBrand,
  type PapaDataIconName,
} from '../../../design-system/icons';
import '../../presentation/story-presentation.css';
import './foundation-iconography.css';
import './foundation-geometry.css';
import './foundation-accessibility.css';
import './foundation-status-catalog.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../presentation/StoryPresentation';

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

function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
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
    <StoryPresentationPage
      headerAside={
        <StoryPresentationMeta
          ariaLabel={copy({
            pl: 'Parametry prezentacji',
            en: 'Presentation parameters',
          })}
          items={[
            { label: <Localized pl="Układ" en="Layout" />, value: <Localized pl="Systemowy" en="System" /> },
            { label: <Localized pl="Powierzchnia" en="Surface" />, value: <Localized pl="Neutralna" en="Neutral" /> },
            { label: <Localized pl="Gęstość" en="Density" />, value: <Localized pl="Sterowana globalnie" en="Global control" /> },
          ]}
        />
      }
      sectionCode="00"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationPage>
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
    <StoryPresentationSection
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
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
    <div className="pd-f0-theme-pair" data-reference="demo-only">
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
              <StatusBadge status={copy({ pl: 'Status', en: 'Status' })} text={copy({ pl: 'Stosujemy', en: 'Use' })} tone="success" />
              <p><Localized pl="Neutralne powierzchnie, separatory, lokalne akcenty i czytelny rytm danych." en="Neutral surfaces, separators, local accents and a readable data rhythm." /></p>
            </div>
            <div data-result="rejected">
              <StatusBadge status={copy({ pl: 'Status', en: 'Status' })} text={copy({ pl: 'Odrzucamy', en: 'Avoid' })} tone="critical" />
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
                <Button startIcon={<Icon decorative name="trend" size={16} />} variant="primary">
                  <Localized pl="Otwórz analizę" en="Open analysis" />
                </Button>
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
                <Button startIcon={<Icon decorative name="trend" size={16} />} variant="primary">
                  <Localized pl="Otwórz analizę" en="Open analysis" />
                </Button>
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
    tone: 'critical',
    label: { pl: 'Błąd', en: 'Error' },
    token: '--pd-status-danger',
    usage: { pl: 'Błąd, blokada albo nieodwracalny skutek.', en: 'Error, blocker or irreversible consequence.' },
  },
  {
    tone: 'processing',
    label: { pl: 'Przetwarzanie', en: 'Processing' },
    token: '--pd-status-info',
    usage: { pl: 'Operacja trwa i system oczekuje na jej wynik.', en: 'An operation is running and the system is awaiting its result.' },
  },
] as const satisfies readonly {
  readonly tone: SemanticStatusTone;
  readonly label: LocalizedCopy;
  readonly token: string;
  readonly usage: LocalizedCopy;
}[];

const statusContractExamples = [
  {
    key: 'example.ready',
    label: { pl: 'Gotowe', en: 'Ready' },
    tone: 'info',
    owner: { pl: 'domena produktu', en: 'product domain' },
  },
  {
    key: 'example.processing',
    label: { pl: 'Przetwarzanie', en: 'Processing' },
    tone: 'processing',
    owner: { pl: 'domena produktu', en: 'product domain' },
  },
  {
    key: 'example.success',
    label: { pl: 'Zakończone', en: 'Completed' },
    tone: 'success',
    owner: { pl: 'domena produktu', en: 'product domain' },
  },
  {
    key: 'example.warning',
    label: { pl: 'Wymaga uwagi', en: 'Needs attention' },
    tone: 'warning',
    owner: { pl: 'domena produktu', en: 'product domain' },
  },
  {
    key: 'example.critical',
    label: { pl: 'Zablokowane', en: 'Blocked' },
    tone: 'critical',
    owner: { pl: 'domena produktu', en: 'product domain' },
  },
  {
    key: 'example.neutral',
    label: { pl: 'Nieaktywne', en: 'Inactive' },
    tone: 'neutral',
    owner: { pl: 'domena produktu', en: 'product domain' },
  },
] as const satisfies readonly {
  readonly key: string;
  readonly label: LocalizedCopy;
  readonly tone: SemanticStatusTone;
  readonly owner: LocalizedCopy;
}[];


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
        <div
          className="pd-f0-mini-chart"
          role="img"
          aria-label={copy({
            pl: 'Przykład palety danych',
            en: 'Data palette example',
          })}
        >
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
              <StatusBadge status={copy({ pl: 'Ton semantyczny', en: 'Semantic tone' })} text={copy(item.label)} tone={item.tone} />
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
      title={<Localized pl="Model statusu systemowego" en="System status model" />}
      summary={<Localized pl="Fundament definiuje anatomię statusu i mapowanie na ton semantyczny. Konkretne klucze biznesowe należą do domen produktu, nie do design systemu." en="The foundation defines status anatomy and semantic-tone mapping. Concrete business keys belong to product domains, not the design system." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Kontrakt statusu" en="Status contract" />}
        summary={<Localized pl="Każdy status składa się ze stabilnego klucza domenowego, czytelnej etykiety i jednego tonu semantycznego." en="Every status consists of a stable domain key, a readable label, and one semantic tone." />}
      >
        <FoundationLedger label={copy({ pl: 'Przykłady mapowania statusu', en: 'Status mapping examples' })}>
          {statusContractExamples.map((status) => (
            <LedgerRow
              key={status.key}
              label={
                <StatusBadge
                  status={copy({ pl: 'Status', en: 'Status' })}
                  text={copy(status.label)}
                  tone={status.tone}
                />
              }
              preview={<span className="pd-f0-status-tone">{status.tone}</span>}
              value={<code>{status.key}</code>}
              detail={copy(status.owner)}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Granica odpowiedzialności" en="Ownership boundary" />}
        summary={<Localized pl="Design system nie utrzymuje katalogu statusów billingowych, security, commerce ani operacyjnych. Utrzymuje tylko role semantyczne i sposób ich prezentacji." en="The design system does not maintain billing, security, commerce, or operational status catalogs. It owns only semantic roles and their presentation." />}
      >
        <FoundationLedger label={copy({ pl: 'Własność statusów', en: 'Status ownership' })}>
          <LedgerRow
            label={<Localized pl="Fundamenty" en="Foundations" />}
            preview={<StatusBadge status={copy({ pl: 'Status', en: 'Status' })} text={copy({ pl: 'Ton', en: 'Tone' })} tone="warning" />}
            value={<code>SemanticStatusTone</code>}
            detail={copy({ pl: 'neutral / info / success / warning / critical / processing', en: 'neutral / info / success / warning / critical / processing' })}
          />
          <LedgerRow
            label={<Localized pl="Domena produktu" en="Product domain" />}
            preview={<code>order.paid</code>}
            value={<Localized pl="klucz + etykieta" en="key + label" />}
            detail={copy({ pl: 'Klucz biznesowy jest definiowany przy modelu domenowym.', en: 'The business key is defined next to the domain model.' })}
          />
          <LedgerRow
            label={<Localized pl="Komponent" en="Component" />}
            preview={<StatusBadge status={copy({ pl: 'Status', en: 'Status' })} text={copy({ pl: 'Opłacone', en: 'Paid' })} tone="success" />}
            value={<code>StatusBadge</code>}
            detail={copy({ pl: 'Komponent renderuje status, ale nie jest właścicielem słownika biznesowego.', en: 'The component renders a status but does not own the business vocabulary.' })}
          />
        </FoundationLedger>
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
        <div className="pd-f0-theme-pair" data-reference="demo-only">
          <ThemePreview
            theme={readTheme()}
            title={<Localized pl="Wygodna" en="Comfortable" />}
          >
            <div className="pd-f0-density-demo" data-density="comfortable">
              <div>
                <span><Localized pl="Źródło danych" en="Data source" /></span>
                <strong>Google Analytics 4</strong>
              </div>
              <div>
                <span><Localized pl="Status" en="Status" /></span>
                <StatusBadge
                  status={copy({ pl: 'Status', en: 'Status' })}
                  text={copy({ pl: 'Stabilne', en: 'Stable' })}
                  tone="success"
                />
              </div>
            </div>
          </ThemePreview>

          <ThemePreview
            theme={readTheme()}
            title={<Localized pl="Kompaktowa" en="Compact" />}
          >
            <div className="pd-f0-density-demo" data-density="compact">
              <div>
                <span><Localized pl="Źródło danych" en="Data source" /></span>
                <strong>Google Analytics 4</strong>
              </div>
              <div>
                <span><Localized pl="Status" en="Status" /></span>
                <StatusBadge
                  status={copy({ pl: 'Status', en: 'Status' })}
                  text={copy({ pl: 'Stabilne', en: 'Stable' })}
                  tone="success"
                />
              </div>
            </div>
          </ThemePreview>
        </div>
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
    token: '--pd-interactive',
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
    <div className="pd-f0-geometry-radius-preview" data-radius={name} aria-hidden="true">
      {name === 'control' ? (
        <span className="pd-f0-geometry-radius-control">
          <span />
          <span />
        </span>
      ) : null}
      {name === 'overlay' ? (
        <span className="pd-f0-geometry-radius-overlay">
          <span />
          <span />
        </span>
      ) : null}
      {name === 'pill' ? (
        <>
          <span className="pd-f0-geometry-pill-dot" />
          <span className="pd-f0-geometry-pill-badge">
            <Localized pl="Znacznik" en="Marker" />
          </span>
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
    <div className="pd-f0-geometry-border-preview" data-border={name} aria-hidden="true">
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
            <strong><Localized pl="Najwyższy poziom treści" en="Highest content level" /></strong>
          </div>
          <span><Localized pl="Poziom 03" en="Level 03" /></span>
        </header>
        <div>
          <p>
            <Localized
              pl="Overlay odcina kontekst bazowy i przejmuje najwyższy priorytet wizualny."
              en="The overlay separates the base context and takes the highest visual priority."
            />
          </p>
          <dl>
            <div>
              <dt><Localized pl="Warstwa" en="Layer" /></dt>
              <dd>modal</dd>
            </div>
            <div>
              <dt><Localized pl="Cień" en="Shadow" /></dt>
              <dd>overlay</dd>
            </div>
          </dl>
        </div>
        <footer>
          <span><Localized pl="Rola systemowa" en="System role" /></span>
          <span>--pd-shadow-overlay</span>
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
        <div className="pd-f0-geometry-grid" role="list" aria-label={copy({ pl: 'Role promieni', en: 'Radius roles' })}>
          {geometryRadiusRows.map((item) => (
            <article className="pd-f0-geometry-card" key={item.name} role="listitem">
              <GeometryRadiusPreview name={item.name} />
              <strong>{copy(item.label)}</strong>
              <code className="pd-f0-geometry-token">{item.token}</code>
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
            <article className="pd-f0-geometry-border-card" key={item.name} role="listitem">
              <GeometryBorderPreview name={item.name} />
              <strong>{copy(item.label)}</strong>
              <code className="pd-f0-geometry-token">{item.token}</code>
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
            <article className="pd-f0-geometry-border-card" key={item.name} role="listitem">
              <GeometryBorderPreview name={item.name} />
              <strong>{copy(item.label)}</strong>
              <code className="pd-f0-geometry-token">{item.token}</code>
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
            <article className="pd-f0-geometry-border-card" key={item.name} role="listitem">
              <GeometryBorderPreview name={item.name} />
              <strong>{copy(item.label)}</strong>
              <code className="pd-f0-geometry-token">{item.token}</code>
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
                <code className="pd-f0-geometry-token">{item.token}</code>
              </div>
              <p role="cell">{copy(item.allowed)}</p>
              <p role="cell">{copy(item.forbidden)}</p>
            </article>
          ))}
        </div>

        <p className="pd-f0-geometry-note">
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


const foundationIconPrinciples = [
  {
    rule: { pl: 'Geometria', en: 'Geometry' },
    value: '24 × 24 / stroke 1.75',
    detail: { pl: 'Wspólna geometria należy do komponentu Icon.', en: 'Shared geometry belongs to the Icon component.' },
  },
  {
    rule: { pl: 'Kolor', en: 'Color' },
    value: 'currentColor',
    detail: { pl: 'Ikona dziedziczy kolor z kontekstu zamiast definiować własny.', en: 'The icon inherits color from context instead of defining its own.' },
  },
  {
    rule: { pl: 'Rozmiar', en: 'Size' },
    value: '16 / 20 / 24',
    detail: { pl: 'Rozmiar wynika z roli kontrolki lub informacji.', en: 'Size follows the role of the control or information.' },
  },
  {
    rule: { pl: 'Znaczenie', en: 'Meaning' },
    value: 'label + context',
    detail: { pl: 'Ikona wspiera treść; nie tworzy osobnego słownika biznesowego.', en: 'The icon supports content; it does not create a separate business vocabulary.' },
  },
] as const;

const foundationIconRoleExamples = [
  { icon: 'home', role: { pl: 'Nawigacja', en: 'Navigation' }, rule: { pl: 'Wspiera nazwę miejsca.', en: 'Supports the destination label.' } },
  { icon: 'trend', role: { pl: 'Dane i analiza', en: 'Data and analytics' }, rule: { pl: 'Nie niesie własnego koloru serii.', en: 'Does not own a series color.' } },
  { icon: 'warning', role: { pl: 'Status', en: 'Status' }, rule: { pl: 'Towarzyszy etykiecie statusu.', en: 'Accompanies the status label.' } },
  { icon: 'assistant', role: { pl: 'System', en: 'System' }, rule: { pl: 'Identyfikuje funkcję, nie dekoruje powierzchni.', en: 'Identifies a function rather than decorating a surface.' } },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly role: LocalizedCopy;
  readonly rule: LocalizedCopy;
}[];

export const Ikonografia: Story = {
  name: 'Ikonografia',
  render: () => (
    <FoundationPage
      title={<Localized pl="Ikonografia" en="Iconography" />}
      summary={<Localized pl="Fundament określa reguły języka ikon. Pełny katalog nazw i wariantów jest własnością komponentu 00.13 — Ikony." en="The foundation defines icon-language rules. The complete name and variant catalog is owned by component 10.11 — Icons." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Reguły języka ikon" en="Icon-language rules" />}
        summary={<Localized pl="Tu definiujemy zasady, które każda ikona systemowa musi zachować." en="This is where the rules every system icon must preserve are defined." />}
      >
        <FoundationLedger label={copy({ pl: 'Reguły ikonografii', en: 'Iconography rules' })}>
          {foundationIconPrinciples.map((item) => (
            <LedgerRow
              key={item.value}
              label={copy(item.rule)}
              preview={<Icon decorative name="data" size={20} />}
              value={<code>{item.value}</code>}
              detail={copy(item.detail)}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Role reprezentatywne" en="Representative roles" />}
        summary={<Localized pl="Pokazujemy tylko role potrzebne do zrozumienia zasady. To nie jest drugi katalog ikon." en="Only roles needed to understand the rule are shown. This is not a second icon catalog." />}
      >
        <div className="pd-f0-iconography-role-list">
          {foundationIconRoleExamples.map((item) => (
            <article className="pd-f0-iconography-role" key={item.icon}>
              <div className="pd-f0-iconography-strip">
                <span>
                  <span className="pd-f0-iconography-preview">
                    <Icon decorative name={item.icon} size={20} />
                  </span>
                  <strong>{copy(item.role)}</strong>
                </span>
                <p>{copy(item.rule)}</p>
              </div>
            </article>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Własność katalogu" en="Catalog ownership" />}
        summary={<Localized pl="Nowa ikona trafia do publicznego rejestru Icon i do story 10.11. Fundamenty nie kopiują listy nazw." en="A new icon goes to the public Icon registry and story 10.11. Foundations do not copy the list of names." />}
      >
        <FoundationVariant
          title={<Localized pl="Jedno źródło prawdy" en="Single source of truth" />}
          description={<Localized pl="00.09 opisuje zasady. 00.13 dokumentuje komponent i pełny katalog. Provider marks oraz logo marki pozostają osobnymi rodzinami." en="00.09 defines rules. 00.13 documents the component and complete catalog. Provider marks and brand marks remain separate families." />}
          token={<code>10.11 / Icon</code>}
        >
          <div className="pd-f0-iconography-note">
            <p><Localized pl="Nie dodajemy lokalnych list ikon w Laboratorium ani w stories ekranów." en="Do not add local icon lists in the Laboratory or screen stories." /></p>
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
      <Button
        startIcon={<Icon decorative name="trend" size={16} />}
        onClick={() => {
          setRun(false);
          window.requestAnimationFrame(() => setRun(true));
        }}
        variant="primary"
      >
        <Localized pl="Uruchom zmianę" en="Run change" />
      </Button>
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

const accessibilitySelectOptions = [
  {
    value: 'crm',
    label: 'CRM',
  },
  {
    value: 'commerce',
    label: 'Commerce',
  },
  {
    value: 'analytics',
    label: 'Analityka',
  },
] as const;

function AccessibilitySelectDemo() {
  const [selected, setSelected] = useState('crm');

  const selectedLabel =
    accessibilitySelectOptions.find(
      (option) => option.value === selected,
    )?.label ?? 'CRM';

  return (
    <div className="pd-f0-accessibility-select-demo">
      <div className="pd-f0-accessibility-select-control">
        <Select
          helperText={copy({
            pl: 'Otwórz listę i wybierz kanał. Po zatwierdzeniu fokus wróci do kontrolki.',
            en: 'Open the list and choose a channel. After selection, focus returns to the control.',
          })}
          label={copy({
            pl: 'Kanał danych',
            en: 'Data channel',
          })}
          onChange={(event) => {
            setSelected(event.currentTarget.value);
          }}
          options={accessibilitySelectOptions}
          placeholder={copy({
            pl: 'Wybierz kanał',
            en: 'Select channel',
          })}
          value={selected}
        />
      </div>

      <div className="pd-f0-accessibility-feedback">
        <p>
          <strong>
            <Localized
              pl="Nazwa dostępna"
              en="Accessible name"
            />
          </strong>
          <span>
            <Localized
              pl="Kanał danych, wybrano"
              en="Data channel, selected"
            />
            : {selectedLabel}
          </span>
        </p>

        <p
          aria-live="polite"
          role="status"
        >
          <strong>
            <Localized
              pl="Status"
              en="Status"
            />
          </strong>
          <span>
            <Localized
              pl="Wybrano"
              en="Selected"
            />
            : {selectedLabel}
          </span>
        </p>

        <p>
          <strong>
            <Localized
              pl="Powrót fokusu"
              en="Focus return"
            />
          </strong>
          <span>
            <Localized
              pl="Po wyborze fokus wraca do kontrolki Kanał danych."
              en="After selection, focus returns to the Data channel control."
            />
          </span>
        </p>
      </div>
    </div>
  );
}

function AccessibilityEvidenceDemo() {
  const [nameChecked, setNameChecked] = useState(false);
  const [focusChecked, setFocusChecked] = useState(false);

  return (
    <div className="pd-f0-evidence">
      <div>
        <Button
          startIcon={<Icon decorative name="search" size={20} />}
          onClick={() => {
            setNameChecked((current) => !current);
          }}
          variant="secondary"
        >
          <Localized
            pl={nameChecked ? 'Ukryj przykład nazwy' : 'Sprawdź nazwę kontrolki'}
            en={nameChecked ? 'Hide name example' : 'Check control name'}
          />
        </Button>

        <div>
          <strong>
            <Localized
              pl="Nazwa kontrolki"
              en="Control name"
            />
          </strong>
          <p aria-live="polite">
            {nameChecked ? (
              <Localized
                pl="Ikona pozostaje dekoracyjna, a tekst przycisku przekazuje pełną nazwę akcji."
                en="The icon remains decorative while the button text provides the complete action name."
              />
            ) : (
              <Localized
                pl="Uruchom przykład, aby potwierdzić nazwę dostępną niezależną od ikony."
                en="Run the example to confirm an accessible name that does not depend on the icon."
              />
            )}
          </p>
        </div>
      </div>

      <div>
        <StatusBadge
          status={copy({ pl: 'Status', en: 'Status' })}
          text={copy({
            pl: 'Dane opóźnione',
            en: 'Data delayed',
          })}
          tone="warning"
        />

        <div>
          <strong>
            <Localized
              pl="Status tekstowy"
              en="Text status"
            />
          </strong>
          <p>
            <Localized
              pl="Kolor wspiera jednoznaczny tekst."
              en="Color supports explicit text."
            />
          </p>
        </div>
      </div>

      <div>
        <Button
          onClick={() => {
            setFocusChecked((current) => !current);
          }}
          variant="secondary"
        >
          <Localized
            pl="Sprawdź fokus"
            en="Check focus"
          />
        </Button>

        <div>
          <strong>
            <Localized
              pl="Widoczny fokus"
              en="Visible focus"
            />
          </strong>
          <p aria-live="polite">
            {focusChecked ? (
              <Localized
                pl="Fokus pozostał na aktywowanej kontrolce."
                en="Focus remained on the activated control."
              />
            ) : (
              <Localized
                pl="Aktywuj przycisk klawiaturą, aby sprawdzić zachowanie fokusu."
                en="Activate the button with the keyboard to verify focus behavior."
              />
            )}
          </p>
        </div>
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
          <AccessibilitySelectDemo />
        </FoundationVariant>
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Dowody w interfejsie" en="Evidence in the interface" />}
        summary={<Localized pl="Wizualna prezentacja pokazuje rzeczywiste zachowanie, nie techniczny debugger." en="The visual presentation shows real behavior, not a technical debugger." />}
      >
        <AccessibilityEvidenceDemo />
      </FoundationSection>
    </FoundationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', {
      name: /Kanał danych|Data channel/,
    });

    trigger.focus();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    const listbox = canvas.getByRole('listbox', {
      name: /Kanał danych|Data channel/,
    });
    await expect(listbox).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });

    await expect(
      canvas.queryByRole('listbox', {
        name: /Kanał danych|Data channel/,
      }),
    ).not.toBeInTheDocument();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });

    await expect(
      canvas.getByRole('status'),
    ).toHaveTextContent(/Commerce/);

    const focusButton = canvas.getByRole('button', {
      name: /Sprawdź fokus|Check focus/,
    });

    focusButton.focus();
    await expect(focusButton).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    await expect(focusButton).toHaveFocus();
    await expect(
      canvas.getByText(
        /Fokus pozostał na aktywowanej kontrolce|Focus remained on the activated control/,
      ),
    ).toBeInTheDocument();
  },
};
