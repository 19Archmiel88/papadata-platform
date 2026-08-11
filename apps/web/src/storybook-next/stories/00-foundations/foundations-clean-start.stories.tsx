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
  title: '00 Fundamenty/01 Fundamenty wizualne',
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
            { label: <Localized pl="Motyw" en="Theme" />, value: readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" /> },
            { label: <Localized pl="Język" en="Language" />, value: readLocale().toUpperCase() },
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

const foundationSequence = [
  {
    step: '01',
    title: {
      pl: 'Canvas i powierzchnie',
      en: 'Canvas and surfaces',
    },
    owner: '02',
    detail: {
      pl: 'Najpierw tło robocze, powierzchnia danych, warstwa pomocnicza i overlay.',
      en: 'Start with working background, data surface, supporting layer and overlay.',
    },
  },
  {
    step: '02',
    title: {
      pl: 'Kolor',
      en: 'Color',
    },
    owner: '00.03',
    detail: {
      pl: 'Kolor ma znaczenie: marka, interakcja, dane i status nie mieszają ról.',
      en: 'Color has meaning: brand, interaction, data and status do not mix roles.',
    },
  },
  {
    step: '03',
    title: {
      pl: 'Typografia',
      en: 'Typography',
    },
    owner: '00.02',
    detail: {
      pl: 'Tekst, liczby, waluty i zakresy czasu muszą być gotowe na PL i EN.',
      en: 'Copy, numbers, currency and date ranges must work in PL and EN.',
    },
  },
  {
    step: '04',
    title: {
      pl: 'Marka',
      en: 'Brand',
    },
    owner: '03',
    detail: {
      pl: 'Znak identyfikuje produkt. Nie definiuje palety danych ani wyglądu powierzchni.',
      en: 'The mark identifies the product. It does not define the data palette or surface look.',
    },
  },
  {
    step: '05',
    title: {
      pl: 'Ikonografia i katalog ikon',
      en: 'Iconography and icon catalog',
    },
    owner: '00.09 / 04',
    detail: {
      pl: 'Fundament opisuje zasady ikon, a pełny katalog należy do komponentu Icon.',
      en: 'The foundation defines icon rules, while the full catalog belongs to Icon.',
    },
  },
  {
    step: '06',
    title: {
      pl: 'Układ, forma i ruch',
      en: 'Layout, shape and motion',
    },
    owner: '00.05-00.11',
    detail: {
      pl: 'Odstęp, promień, separacja, głębia, motion i dostępność tworzą ramę pracy.',
      en: 'Spacing, radius, separation, depth, motion and accessibility create the work frame.',
    },
  },
  {
    step: '07',
    title: {
      pl: 'Akcje i wejścia',
      en: 'Actions and inputs',
    },
    owner: '05',
    detail: {
      pl: 'Przyciski i pola pokazują użycie fundamentów w kontrolkach, bez własnego języka wizualnego.',
      en: 'Buttons and fields show foundations in controls without creating a private visual language.',
    },
  },
] as const;

export const KierunekWizualny: Story = {
  name: 'Kierunek wizualny',
  render: () => (
    <FoundationPage
      title={<Localized pl="Start fundamentów wizualnych" en="Visual foundations start" />}
      summary={
        <Localized
          pl="Ta story ustawia kolejność czytania 00: od materiału interfejsu, przez kolor i typografię, do komponentów. Przyszłe biblioteki wykresów, kalendarzy i komunikatów mają konsumować te reguły."
          en="This story sets the reading order for 00: from interface material, through color and typography, to components. Future chart, calendar and messaging libraries should consume these rules."
        />
      }
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Kolejność czytania" en="Reading order" />}
        summary={
          <Localized
            pl="Fundamenty prowadzą od tła i znaczeń do konkretnych kontrolek. To jest mapa pracy dla 15 Wykresy i dane oraz 18 Wzorce interfejsu."
            en="Foundations move from background and meaning to concrete controls. This is the work map for 15 Charts and data and 18 Interface patterns."
          />
        }
      >
        <FoundationLedger label={copy({ pl: 'Chronologia fundamentów', en: 'Foundations chronology' })}>
          {foundationSequence.map((item) => (
            <LedgerRow
              detail={copy(item.detail)}
              key={item.step}
              label={copy(item.title)}
              preview={<span className="pd-f0-status-tone">{item.step}</span>}
              value={<code>{item.owner}</code>}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Materiał interfejsu" en="Interface material" />}
        summary={
          <Localized
            pl="Każdy motyw ma własny canvas i własne powierzchnie. Nie mieszamy jasnych tokenów z ciemnym tłem ani odwrotnie."
            en="Each theme has its own canvas and surfaces. Light tokens are not mixed with a dark background, or the reverse."
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

      <FoundationSection
        index="03"
        title={<Localized pl="Zasady projektowe" en="Design principles" />}
        summary={
          <Localized
            pl="Te same reguły obowiązują komponent, story, ekran produktu i bibliotekę zewnętrzną osadzoną w PapaData."
            en="The same rules apply to a component, a story, a product screen and an external library embedded in PapaData."
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

const TypografiaStory: Story = {
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

const actionColorRows = [
  {
    label: { pl: 'Komenda główna', en: 'Primary command' },
    token: '--pd-brand-action',
    color: 'brand-action',
    detail: {
      pl: 'Zapis, zatwierdzenie, publikacja albo uruchomienie przepływu.',
      en: 'Save, approve, publish or start a flow.',
    },
  },
  {
    label: { pl: 'Nawigacja', en: 'Navigation' },
    token: '--pd-interactive',
    color: 'interactive',
    detail: {
      pl: 'Przejście do raportu, rekordu, integracji albo szczegółu.',
      en: 'Move to a report, record, integration or detail.',
    },
  },
  {
    label: { pl: 'Akcja w danych', en: 'Data action' },
    token: '--pd-data-accent',
    color: 'data',
    detail: {
      pl: 'Eksploracja zakresu danych, serii, rekordu albo źródła.',
      en: 'Explore a data scope, series, record or source.',
    },
  },
  {
    label: { pl: 'Akcja destrukcyjna', en: 'Destructive action' },
    token: '--pd-status-danger',
    color: 'danger-action',
    detail: {
      pl: 'Usunięcie, odłączenie albo operacja z nieodwracalnym skutkiem.',
      en: 'Delete, disconnect or an operation with an irreversible effect.',
    },
  },
] as const;


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
        title={<Localized pl="Kolor akcji" en="Action color" />}
        summary={<Localized pl="Kolor akcji komunikuje rodzaj decyzji. Nie służy do ozdabiania przycisku ani wyróżniania lokalnego fragmentu UI." en="Action color communicates the type of decision. It is not for decorating a button or highlighting a local UI fragment." />}
      >
        <FoundationLedger label={copy({ pl: 'Kolory akcji', en: 'Action colors' })}>
          {actionColorRows.map((item) => (
            <LedgerRow
              detail={copy(item.detail)}
              key={item.token}
              label={copy(item.label)}
              preview={<span className="pd-f0-color-chip" data-color={item.color} />}
              value={<TokenCode>{item.token}</TokenCode>}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="03"
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
        index="04"
        title={<Localized pl="Role tonów semantycznych" en="Semantic tone roles" />}
        summary={<Localized pl="Ta story opisuje znaczenie tonów. UI komunikatu, badge'a i toasta jest kanonicznie w 00 / 02 Powierzchnie i komunikaty." en="This story describes tone meaning. Notice, badge and toast UI is canonical in 00 / 02 Surfaces and messaging." />}
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
              <span className="pd-f0-status-tone">{copy(item.label)}</span>
              <TokenCode>{item.token}</TokenCode>
              <p><Localized {...item.usage} /></p>
            </article>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Typografia = TypografiaStory;

export const StatusySystemowe: Story = {
  name: 'Role semantyczne statusów',
  render: () => (
    <FoundationPage
      title={<Localized pl="Role semantyczne statusów" en="Semantic status roles" />}
      summary={<Localized pl="Fundament definiuje znaczenie roli statusu i mapowanie na ton. Wygląd StatusBadge jest kanonicznie pokazany w 00 / 02 Powierzchnie i komunikaty." en="The foundation defines status-role meaning and tone mapping. StatusBadge appearance is canonical in 00 / 02 Surfaces and messaging." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Kontrakt statusu" en="Status contract" />}
        summary={<Localized pl="Każdy status składa się ze stabilnego klucza domenowego, czytelnej etykiety i jednego tonu semantycznego." en="Every status consists of a stable domain key, a readable label, and one semantic tone." />}
      >
        <FoundationLedger label={copy({ pl: 'Przykłady mapowania semantycznego', en: 'Semantic mapping examples' })}>
          {statusContractExamples.map((status) => (
            <LedgerRow
              key={status.key}
              label={copy(status.label)}
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
            preview={<span className="pd-f0-status-tone">warning</span>}
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
            preview={<span className="pd-f0-status-tone">success</span>}
            value={<code>00 / 02 Powierzchnie i komunikaty / StatusBadge</code>}
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

const layoutSpacingRows = [
  {
    label: { pl: 'Desktop', en: 'Desktop' },
    value: '12 columns / 64',
    detail: {
      pl: 'Sekcje analityczne oddziela duży rytm pionowy, a regiony pracy rozdziela linia.',
      en: 'Analytical sections use a large vertical rhythm, while work regions are separated by a line.',
    },
  },
  {
    label: { pl: 'Tablet', en: 'Tablet' },
    value: '8 columns / 40',
    detail: {
      pl: 'Panel boczny przechodzi pod treść albo w warstwę, ale kolejność informacji zostaje zachowana.',
      en: 'A side panel moves below content or into a layer, while information order is preserved.',
    },
  },
  {
    label: { pl: 'Mobile', en: 'Mobile' },
    value: '4 columns / 24',
    detail: {
      pl: 'Akcje i pola układają się pionowo. Nie dodajemy lokalnych kart, żeby odzyskać oddech.',
      en: 'Actions and fields stack vertically. Local cards are not added to regain breathing room.',
    },
  },
  {
    label: { pl: 'Tabela i formularz', en: 'Table and form' },
    value: '8 / 12 / 16',
    detail: {
      pl: 'Wiersz, helper text i komunikat używają mniejszych odstępów niż sekcja lub panel.',
      en: 'Rows, helper text and messages use smaller spacing than a section or panel.',
    },
  },
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
        title={<Localized pl="Rytm layoutu" en="Layout rhythm" />}
        summary={<Localized pl="Odstęp opisuje relację elementów: sekcja, panel, tabela, formularz i wąski ekran mają różny rytm." en="Spacing describes element relationships: section, panel, table, form and narrow screens use different rhythm." />}
      >
        <FoundationLedger label={copy({ pl: 'Rytm układu', en: 'Layout rhythm' })}>
          {layoutSpacingRows.map((item) => (
            <LedgerRow
              detail={copy(item.detail)}
              key={item.value}
              label={copy(item.label)}
              value={<code>{item.value}</code>}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="03"
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
        index="04"
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
    token: '--pd-radius-surface',
    label: { pl: 'Panel', en: 'Panel' },
    detail: {
      pl: 'Powierzchnia danych, sidecar, panel konfiguracji i stały inspector.',
      en: 'Data surface, sidecar, configuration panel and persistent inspector.',
    },
    contract: {
      pl: 'Panel jest funkcjonalnym regionem pracy, ale nie marketingową kartą.',
      en: 'A panel is a functional work region, not a marketing card.',
    },
    avoid: {
      pl: 'Nie opakowujemy nim każdego wiersza, przykładu ani małej sekcji.',
      en: 'Do not wrap every row, example or small section with it.',
    },
  },
  {
    name: 'modal',
    token: '--pd-radius-overlay',
    label: { pl: 'Overlay', en: 'Overlay' },
    detail: {
      pl: 'Modal, popover, toast i warstwa wymagająca czytelnego odcięcia.',
      en: 'Modal, popover, toast and a layer requiring clear separation.',
    },
    contract: {
      pl: 'Overlay tworzy tymczasowy poziom ponad canvasem i ma wyraźną ścieżkę powrotu.',
      en: 'Overlay creates a temporary level above the canvas and keeps a clear return path.',
    },
    avoid: {
      pl: 'Nie używamy overlay jako domyślnej powierzchni danych.',
      en: 'Do not use overlay as the default data surface.',
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
    label: { pl: 'Separator sekcji', en: 'Section separator' },
    detail: {
      pl: 'Topbar, granice canvasu i główne regiony aplikacji.',
      en: 'Topbar, canvas boundaries and main application regions.',
    },
  },
  {
    name: 'subtle',
    group: 'structure',
    token: '--pd-separator-subtle',
    label: { pl: 'Separator tabeli', en: 'Table separator' },
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

const separationDecisionRows = [
  {
    label: { pl: 'Ten sam kontekst', en: 'Same context' },
    value: { pl: 'linia', en: 'line' },
    detail: {
      pl: 'Sekcje, wiersze, grupy danych i nagłówki zostają na tym samym canvasie.',
      en: 'Sections, rows, data groups and headers stay on the same canvas.',
    },
  },
  {
    label: { pl: 'Nowy kontekst pracy', en: 'New work context' },
    value: { pl: 'powierzchnia', en: 'surface' },
    detail: {
      pl: 'Panel, sidecar, popover i modal dostają własną powierzchnię, bo zmieniają poziom pracy.',
      en: 'Panel, sidecar, popover and modal get their own surface because they change the work level.',
    },
  },
  {
    label: { pl: 'Aktywny wybór', en: 'Active selection' },
    value: { pl: 'lokalny akcent', en: 'local accent' },
    detail: {
      pl: 'Aktywna karta, zakładka albo filtr używa krótkiej linii, nie pełnej kolorowej ramki.',
      en: 'An active tab, filter or item uses a short line, not a fully colored frame.',
    },
  },
  {
    label: { pl: 'Status przy treści', en: 'Status near content' },
    value: { pl: 'linia statusu', en: 'status line' },
    detail: {
      pl: 'Komunikat przy danych ma tekst i semantyczną linię zamiast dużego kolorowego kontenera.',
      en: 'A data notice has text and a semantic line instead of a large colored container.',
    },
  },
] as const;

const separationBoundaryRows = [
  {
    title: { pl: 'Linia zachowuje ciągłość', en: 'Line preserves continuity' },
    detail: {
      pl: 'Używamy jej, gdy użytkownik nadal pracuje w tym samym obszarze danych.',
      en: 'Use it when the user remains in the same data work area.',
    },
    mode: 'line',
  },
  {
    title: { pl: 'Powierzchnia zmienia poziom', en: 'Surface changes level' },
    detail: {
      pl: 'Nową powierzchnię wprowadzamy dopiero dla panelu, overlayu albo niezależnego kontekstu.',
      en: 'Introduce a new surface only for a panel, overlay or independent context.',
    },
    mode: 'surface',
  },
] as const;

const geometryDepthRows = [
  {
    level: '00',
    name: 'none',
    token: '--pd-shadow-none',
    label: { pl: 'Canvas bazowy', en: 'Base canvas' },
    allowed: {
      pl: 'Canvas aplikacji, szeroka powierzchnia danych i zwykła sekcja robocza.',
      en: 'Application canvas, broad data surface and normal working section.',
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
      pl: 'Panel rekomendacji, assistant sidecar i stała warstwa wspierająca.',
      en: 'Recommendation panel, assistant sidecar and persistent support layer.',
    },
    forbidden: {
      pl: 'Nie zastępuje separatorów ani nie zasłania danych scrimem.',
      en: 'Does not replace separators or cover data with a scrim.',
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
      pl: 'Nie używamy go do assistant sidecar ani stałych regionów layoutu.',
      en: 'Do not use it for assistant sidecar or persistent layout regions.',
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
      pl: 'Nie jest trybem Papa Asystenta ani domyślnym cieniem zwykłych kart.',
      en: 'Is not the Papa Assistant mode or the default shadow for ordinary cards.',
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
      {name === 'modal' ? (
        <span className="pd-f0-geometry-radius-overlay" data-kind="modal">
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

function SeparationWorkspacePreview() {
  return (
    <div
      className="pd-f0-line-workspace"
      role="img"
      aria-label={copy({
        pl: 'Przykład użycia separatorów w obszarze danych: separator sekcji, separator tabeli, aktywny akcent i linia statusu.',
        en: 'Example of separators in a data workspace: section separator, table separator, active accent and status line.',
      })}
    >
      <header className="pd-f0-line-workspace__header">
        <div>
          <span><Localized pl="Powierzchnia danych" en="Data surface" /></span>
          <strong><Localized pl="Sprzedaż i koszt pozyskania" en="Sales and acquisition cost" /></strong>
        </div>
        <p><Localized pl="Ostatnie 30 dni" en="Last 30 days" /></p>
      </header>

      <div className="pd-f0-line-workspace__metrics" aria-hidden="true">
        <div>
          <span><Localized pl="Przychód" en="Revenue" /></span>
          <strong>1 248 590 zł</strong>
        </div>
        <div>
          <span>ROAS</span>
          <strong>4,9</strong>
        </div>
        <div>
          <span><Localized pl="Alerty" en="Alerts" /></span>
          <strong>3</strong>
        </div>
      </div>

      <div className="pd-f0-line-workspace__tabs" aria-hidden="true">
        <span data-active="true"><Localized pl="Wykres" en="Chart" /></span>
        <span><Localized pl="Tabela" en="Table" /></span>
        <span><Localized pl="Wniosek" en="Finding" /></span>
      </div>

      <div className="pd-f0-line-workspace__table" aria-hidden="true">
        <div data-head="true">
          <span><Localized pl="Kanał" en="Channel" /></span>
          <span><Localized pl="Przychód" en="Revenue" /></span>
          <span>ROAS</span>
          <span><Localized pl="Status" en="Status" /></span>
        </div>
        <div>
          <span>Commerce</span>
          <span>742 100 zł</span>
          <span>5,8</span>
          <span><Localized pl="Gotowe" en="Ready" /></span>
        </div>
        <div>
          <span>Meta Ads</span>
          <span>386 420 zł</span>
          <span>4,1</span>
          <span><Localized pl="Do uwagi" en="Needs review" /></span>
        </div>
        <div>
          <span>GA4</span>
          <span>120 070 zł</span>
          <span>3,7</span>
          <span><Localized pl="Gotowe" en="Ready" /></span>
        </div>
      </div>

      <aside className="pd-f0-line-workspace__status">
        <strong><Localized pl="Linia statusu" en="Status line" /></strong>
        <p><Localized pl="Koszt w Meta Ads rośnie szybciej niż przychód. Komunikat pozostaje w kontekście danych." en="Meta Ads cost is rising faster than revenue. The notice stays in the data context." /></p>
      </aside>
    </div>
  );
}

function DepthCanvas() {
  return (
    <div
      className="pd-f0-depth-stage__canvas"
      role="img"
      aria-label={copy({
        pl: 'Relacja pomiędzy canvasem aplikacji, powierzchnią danych, panelem rekomendacji, sidecarem Papa Asystenta, popoverem, toastem i modalem',
        en: 'Relationship between application canvas, data surface, recommendation panel, Papa Assistant sidecar, popover, toast and modal',
      })}
    >
      <div className="pd-f0-depth-stage__base" data-shadow="none">
        <div className="pd-f0-depth-stage__base-heading">
          <div>
            <span><Localized pl="Canvas aplikacji" en="Application canvas" /></span>
            <strong><Localized pl="Przychód, kampanie i decyzje" en="Revenue, campaigns and decisions" /></strong>
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

        <div className="pd-f0-depth-stage__workspace">
          <section className="pd-f0-depth-stage__data-surface" data-shadow="none">
            <header className="pd-f0-depth-stage__data-header">
              <div>
                <span><Localized pl="Powierzchnia danych" en="Data surface" /></span>
                <strong><Localized pl="Trend sprzedaży i kosztów" en="Sales and cost trend" /></strong>
              </div>

              <dl>
                <div>
                  <dt><Localized pl="Wykres" en="Chart" /></dt>
                  <dd>15.01 / ChartFrame</dd>
                </div>
                <div>
                  <dt><Localized pl="Tabela" en="Table" /></dt>
                  <dd>DataTable runtime / 18.04 workflow</dd>
                </div>
              </dl>
            </header>

            <div className="pd-f0-depth-stage__data-toolbar">
              <span><Localized pl="30 dni" en="30 days" /></span>
              <span>Meta Ads · GA4 · Commerce</span>
              <span><Localized pl="Dane gotowe" en="Data ready" /></span>
            </div>

            <div className="pd-f0-depth-stage__data-body">
              <div className="pd-f0-depth-stage__chart" aria-hidden="true">
                <span className="pd-f0-depth-stage__chart-grid" />
                <span className="pd-f0-depth-stage__chart-line" data-line="revenue" />
                <span className="pd-f0-depth-stage__chart-line" data-line="cost" />
                <span className="pd-f0-depth-stage__chart-point" data-point="one" />
                <span className="pd-f0-depth-stage__chart-point" data-point="two" />
                <span className="pd-f0-depth-stage__chart-point" data-point="three" />
              </div>

              <div className="pd-f0-depth-stage__table" aria-hidden="true">
                <div className="pd-f0-depth-stage__table-row" data-head="true">
                  <span><Localized pl="Kanał" en="Channel" /></span>
                  <span><Localized pl="Przychód" en="Revenue" /></span>
                  <span>ROAS</span>
                </div>
                <div className="pd-f0-depth-stage__table-row">
                  <span>Commerce</span>
                  <span>742 100 zł</span>
                  <span>5,8</span>
                </div>
                <div className="pd-f0-depth-stage__table-row">
                  <span>Meta Ads</span>
                  <span>386 420 zł</span>
                  <span>4,1</span>
                </div>
                <div className="pd-f0-depth-stage__table-row">
                  <span>GA4</span>
                  <span>120 070 zł</span>
                  <span>3,7</span>
                </div>
              </div>
            </div>

            <footer className="pd-f0-depth-stage__data-status">
              <span><Localized pl="Status danych" en="Data status" /></span>
              <strong><Localized pl="Gotowe do analizy bez dodatkowych ramek" en="Ready for analysis without extra frames" /></strong>
            </footer>
          </section>
        </div>
      </div>

      <div className="pd-f0-depth-stage__raised" data-shadow="raised">
        <span><Localized pl="Panel rekomendacji" en="Recommendation panel" /></span>
        <strong><Localized pl="Przenieś budżet z kosztownych kampanii" en="Shift budget from costly campaigns" /></strong>
        <p><Localized pl="Warstwa pomaga w decyzji, ale nie odcina użytkownika od wykresu ani tabeli." en="The layer supports the decision without cutting the user off from the chart or table." /></p>
      </div>

      <aside className="pd-f0-depth-stage__assistant" data-shadow="raised">
        <header className="pd-f0-depth-stage__assistant-header">
          <Icon decorative name="assistant" size={16} />
          <div>
            <span><Localized pl="Papa Asystent" en="Papa Assistant" /></span>
            <strong><Localized pl="Sidecar bez scrimu" en="Sidecar without scrim" /></strong>
          </div>
        </header>

        <div className="pd-f0-depth-stage__assistant-context">
          <span><Localized pl="Kontekst" en="Context" /></span>
          <strong>15.01 ChartFrame · DataTable runtime · 18.04</strong>
        </div>

        <div className="pd-f0-depth-stage__assistant-thread">
          <section>
            <span><Localized pl="Wniosek" en="Finding" /></span>
            <p><Localized pl="ROAS spada szybciej niż przychód w kampaniach prospectingowych." en="ROAS is dropping faster than revenue in prospecting campaigns." /></p>
          </section>
          <section>
            <span><Localized pl="Następny krok" en="Next step" /></span>
            <p><Localized pl="Porównaj segmenty kosztu z ostatnich 7 dni przed zmianą budżetu." en="Compare cost segments from the last 7 days before changing budget." /></p>
          </section>
        </div>

        <div className="pd-f0-depth-stage__assistant-composer">
          <span><Localized pl="Zapytaj o widoczny zakres danych" en="Ask about the visible data range" /></span>
          <strong><Localized pl="Wyślij" en="Send" /></strong>
        </div>
      </aside>

      <div className="pd-f0-depth-stage__toast" data-shadow="floating">
        <span className="pd-f0-depth-stage__toast-marker" />
        <div>
          <strong><Localized pl="Widok zapisany" en="View saved" /></strong>
          <p><Localized pl="Toast jest operacyjny i nie zmienia układu." en="The toast is operational and does not change the layout." /></p>
        </div>
      </div>

      <div className="pd-f0-depth-stage__popover" data-shadow="floating">
        <strong><Localized pl="Popover filtra" en="Filter popover" /></strong>
        <span><Localized pl="Zakres: ostatnie 30 dni" en="Range: last 30 days" /></span>
      </div>

      <div className="pd-f0-depth-stage__modal" data-shadow="overlay">
        <span><Localized pl="Overlay" en="Overlay" /></span>
        <strong><Localized pl="Potwierdź zmianę budżetu" en="Confirm budget change" /></strong>
        <p><Localized pl="Modal odcina kontekst tylko dla decyzji wymagającej uwagi." en="A modal cuts off context only for a decision requiring attention." /></p>
      </div>
    </div>
  );
}

export const PromienieIGeometria: Story = {
  name: 'Promienie i geometria',
  render: () => (
    <FoundationPage
      title={<Localized pl="Promienie i geometria" en="Radii and geometry" />}
      summary={<Localized pl="Cztery role geometryczne porządkują kontrolki, panele, overlay i małe znaczniki. Promień wynika z funkcji, nie z dekoracji." en="Four geometry roles organize controls, panels, overlays and compact markers. Radius follows function, not decoration." />}
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
      summary={<Localized pl="Linia jest narzędziem porządku w workspace: rozdziela, wskazuje aktywność albo komunikuje stan bez tworzenia kolejnej karty." en="A line is a workspace ordering tool: it separates, marks activity or communicates state without creating another card." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Kiedy linia zamiast karty" en="When a line replaces a card" />}
        summary={<Localized pl="PapaData ma czytać się jak ledger i przestrzeń decyzyjna. Nowa powierzchnia pojawia się dopiero wtedy, gdy zmienia się poziom pracy." en="PapaData should read like a ledger and decision workspace. A new surface appears only when the work level changes." />}
      >
        <FoundationLedger label={copy({ pl: 'Decyzje separacji', en: 'Separation decisions' })}>
          {separationDecisionRows.map((item) => (
            <LedgerRow
              detail={copy(item.detail)}
              key={item.label.pl}
              label={copy(item.label)}
              value={<code>{copy(item.value)}</code>}
            />
          ))}
        </FoundationLedger>
      </FoundationSection>

      <FoundationSection
        index="02"
        title={<Localized pl="Realny układ roboczy" en="Real workspace layout" />}
        summary={<Localized pl="Ten sam obszar danych używa separatora sekcji, separatorów tabeli, aktywnego akcentu i linii statusu bez budowania pudełek wokół każdego fragmentu." en="The same data area uses a section separator, table separators, an active accent and a status line without boxing every fragment." />}
      >
        <SeparationWorkspacePreview />
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Cztery role linii" en="Four line roles" />}
        summary={<Localized pl="Każda rola ma własny token i zakres. Nie mieszamy separatora tabeli z akcentem aktywnym ani linią statusu." en="Each role has its own token and scope. Table separators are not mixed with active accents or status lines." />}
      >
        <div className="pd-f0-separation-grid" data-columns="4" role="list">
          {geometryBorderRows.map((item) => (
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
        index="04"
        title={<Localized pl="Granica użycia" en="Usage boundary" />}
        summary={<Localized pl="Separator nie jest dekoracją ani zamiennikiem hierarchii. Jeśli element jest osobnym kontekstem, dostaje powierzchnię. Jeśli jest częścią tego samego kontekstu, wystarczy linia." en="A separator is not decoration or a replacement for hierarchy. If an element is a separate context, it gets a surface. If it belongs to the same context, a line is enough." />}
      >
        <div className="pd-f0-line-boundary-grid">
          {separationBoundaryRows.map((item) => (
            <article data-mode={item.mode} key={item.mode}>
              <span aria-hidden="true" />
              <div>
                <h3>{copy(item.title)}</h3>
                <p>{copy(item.detail)}</p>
              </div>
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
      summary={<Localized pl="Cień komunikuje zmianę poziomu. Warstwy pokazujemy w jednej relacji: canvas, powierzchnia danych, sidecar, popover, toast i modal." en="Shadow communicates a level change. Layers are shown in one relationship: canvas, data surface, sidecar, popover, toast and modal." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Hierarchia warstw" en="Layer hierarchy" />}
        summary={<Localized pl="Canvas, powierzchnia danych, panel rekomendacji, Papa Asystent, popover, toast i modal muszą być czytelne jako jeden system." en="Canvas, data surface, recommendation panel, Papa Assistant, popover, toast and modal must read as one system." />}
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
      summary={<Localized pl="Fundament określa reguły języka ikon. Pełny katalog nazw i wariantów jest własnością story 04 Ikony i komponentu Icon." en="The foundation defines icon-language rules. The complete name and variant catalog is owned by story 04 Icons and the Icon component." />}
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
        summary={<Localized pl="Nowa ikona trafia do publicznego rejestru Icon i do story 04 Ikony. Fundamenty nie kopiują listy nazw." en="A new icon goes to the public Icon registry and story 04 Icons. Foundations do not copy the list of names." />}
      >
        <FoundationVariant
          title={<Localized pl="Jedno źródło prawdy" en="Single source of truth" />}
          description={<Localized pl="00.09 opisuje zasady. 00.13 — Ikony dokumentuje komponent i pełny katalog. Provider marks oraz logo marki pozostają osobnymi rodzinami." en="00.09 defines rules. 00.13 - Icons documents the component and complete catalog. Provider marks and brand marks remain separate families." />}
          token={<code>00.13 / Icon</code>}
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

const motionUseRows = [
  {
    label: { pl: 'Hover', en: 'Hover' },
    value: 'color / line',
    detail: {
      pl: 'Wskazuje gotowość kontrolki do interakcji bez przesuwania layoutu.',
      en: 'Shows a control is ready for interaction without shifting layout.',
    },
  },
  {
    label: { pl: 'Focus', en: 'Focus' },
    value: ':focus-visible',
    detail: {
      pl: 'Fokus jest stanem systemowym, nie animacją dekoracyjną.',
      en: 'Focus is a system state, not decorative animation.',
    },
  },
  {
    label: { pl: 'Loading', en: 'Loading' },
    value: 'aria-busy',
    detail: {
      pl: 'Ruch może potwierdzać zajętość, ale stan musi być czytelny tekstowo.',
      en: 'Motion may confirm busy state, but the state must be text-readable.',
    },
  },
  {
    label: { pl: 'Enter / exit', en: 'Enter / exit' },
    value: 'layer relation',
    detail: {
      pl: 'Warstwa pokazuje relację z triggerem i zachowuje jasną ścieżkę powrotu.',
      en: 'A layer shows its relation to the trigger and keeps a clear return path.',
    },
  },
  {
    label: { pl: 'Reduced motion', en: 'Reduced motion' },
    value: 'no translation',
    detail: {
      pl: 'Rezultat pozostaje ten sam bez przesunięć, pulsowania i ciągłego ruchu.',
      en: 'The result remains the same without translation, pulsing or continuous movement.',
    },
  },
] as const;

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
        <FoundationLedger label={copy({ pl: 'Mapa ruchu funkcjonalnego', en: 'Functional motion map' })}>
          {motionUseRows.map((item) => (
            <LedgerRow
              detail={copy(item.detail)}
              key={item.value}
              label={copy(item.label)}
              value={<code>{item.value}</code>}
            />
          ))}
        </FoundationLedger>
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

const accessibilityRows = [
  { title: { pl: 'Fokus', en: 'Focus' }, detail: { pl: 'Każda kontrolka ma widoczny focus-visible bez przesuwania układu.', en: 'Every control has visible focus-visible without shifting layout.' }, token: ':focus-visible' },
  { title: { pl: 'Klawiatura', en: 'Keyboard' }, detail: { pl: 'Tab, Enter, Space, Escape i strzałki wynikają z roli komponentu.', en: 'Tab, Enter, Space, Escape and arrows come from the component role.' }, token: 'keyboard' },
  { title: { pl: 'Nazwa dostępna', en: 'Accessible name' }, detail: { pl: 'Nazwa opisuje akcję albo dane; ikona nie jest jedynym nośnikiem znaczenia.', en: 'The name describes the action or data; the icon is not the only carrier of meaning.' }, token: 'aria-label' },
  { title: { pl: 'Status live', en: 'Live status' }, detail: { pl: 'Zmiany asynchroniczne są ogłaszane bez kradzieży fokusu.', en: 'Async changes are announced without stealing focus.' }, token: 'aria-live' },
  { title: { pl: 'Status tekstowy', en: 'Text status' }, detail: { pl: 'Kolor ma zawsze tekstowy odpowiednik i nie działa samodzielnie.', en: 'Color always has a text equivalent and never works alone.' }, token: 'text + color' },
  { title: { pl: 'Zoom i reflow', en: 'Zoom and reflow' }, detail: { pl: 'Widok działa przy 200% i składa się bez poziomego scrolla strony.', en: 'The view works at 200% and reflows without page-level horizontal scroll.' }, token: '200%' },
  { title: { pl: 'Forced colors', en: 'Forced colors' }, detail: { pl: 'Obrys, tekst i stan pozostają rozpoznawalne w trybie wymuszonych kolorów.', en: 'Outline, text and state stay recognizable in forced-colors mode.' }, token: '@media forced-colors' },
] as const;

const accessibilityBehaviorRows = [
  {
    title: { pl: 'Pole i formularz', en: 'Field and form' },
    icon: 'data',
    detail: { pl: 'Label, helper, error, required i disabled muszą być czytelne bez znajomości koloru.', en: 'Label, helper, error, required and disabled must be readable without relying on color.' },
    requirement: { pl: 'nazwa + opis + stan', en: 'name + description + state' },
  },
  {
    title: { pl: 'Tabela i lista', en: 'Table and list' },
    icon: 'search',
    detail: { pl: 'Sortowanie, selekcja, puste wyniki i akcje w wierszu zachowują kolejność fokusu.', en: 'Sorting, selection, empty results and row actions preserve focus order.' },
    requirement: { pl: 'kolejność + status', en: 'order + status' },
  },
  {
    title: { pl: 'Wykres i dane', en: 'Chart and data' },
    icon: 'trend',
    detail: { pl: 'Wizualizacja dostaje alternatywny tekst, tabelę danych albo czytelny opis wyniku.', en: 'A visualization receives alt text, a data table or a readable result summary.' },
    requirement: { pl: 'alternatywa danych', en: 'data alternative' },
  },
  {
    title: { pl: 'Overlay i modal', en: 'Overlay and modal' },
    icon: 'integration',
    detail: { pl: 'Warstwa przejmuje fokus, zamyka się przewidywalnie i oddaje fokus do źródła.', en: 'The layer takes focus, closes predictably and returns focus to the source.' },
    requirement: { pl: 'pułapka + powrót fokusu', en: 'trap + focus return' },
  },
  {
    title: { pl: 'Toast i komunikat', en: 'Toast and notice' },
    icon: 'success',
    detail: { pl: 'Krótki status jest ogłaszany, ale nie zastępuje komunikatu przy błędzie formularza.', en: 'A short status is announced but does not replace a form-level error notice.' },
    requirement: { pl: 'aria-live + granica użycia', en: 'aria-live + usage boundary' },
  },
] satisfies ReadonlyArray<{
  readonly title: LocalizedCopy;
  readonly icon: PapaDataIconName;
  readonly detail: LocalizedCopy;
  readonly requirement: LocalizedCopy;
}>;

const accessibilityLibraryRows = [
  { title: { pl: 'Kalendarz', en: 'Calendar' }, detail: { pl: 'Biblioteka może być zewnętrzna, ale wybór daty musi mieć label, klawiaturę i status błędu.', en: 'The library may be external, but date selection needs a label, keyboard support and error status.' } },
  { title: { pl: 'Zaawansowana tabela', en: 'Advanced table' }, detail: { pl: 'Wirtualizacja nie może zgubić nazwy kolumny, fokusu ani statusu ładowania.', en: 'Virtualization must not lose column names, focus or loading status.' } },
  { title: { pl: 'Wykres', en: 'Chart' }, detail: { pl: 'Canvas lub SVG musi mieć tekstową interpretację danych i stanów.', en: 'Canvas or SVG must have a text interpretation of data and states.' } },
  { title: { pl: 'Popover', en: 'Popover' }, detail: { pl: 'Otwarcie, Escape, klik poza i powrót fokusu są częścią kontraktu.', en: 'Open, Escape, outside click and focus return are part of the contract.' } },
] as const;

function AccessibilityBehaviorGrid() {
  return (
    <div className="pd-f0-accessibility-behavior-grid">
      {accessibilityBehaviorRows.map((item) => (
        <article
          className="pd-f0-accessibility-behavior-card"
          key={item.title.pl}
        >
          <Icon decorative name={item.icon} size={20} />
          <div>
            <h3>{copy(item.title)}</h3>
            <p>{copy(item.detail)}</p>
            <code>{copy(item.requirement)}</code>
          </div>
        </article>
      ))}
    </div>
  );
}

function AccessibilityLibraryLedger() {
  return (
    <FoundationLedger label={copy({ pl: 'Zasady dla bibliotek zewnętrznych', en: 'Rules for external libraries' })}>
      {accessibilityLibraryRows.map((item) => (
        <LedgerRow
          key={item.title.pl}
          label={copy(item.title)}
          value={<Localized pl="nie narzucamy biblioteki" en="library agnostic" />}
          detail={copy(item.detail)}
        />
      ))}
    </FoundationLedger>
  );
}

export const Dostepnosc: Story = {
  name: 'Dostępność systemowa',
  render: () => (
    <FoundationPage
      title={<Localized pl="Dostępność systemowa" en="System accessibility" />}
      summary={<Localized pl="Praktyczny kontrakt dla komponentów: kontrolka ma nazwę, fokus, klawiaturę, status i czytelny reflow w każdym motywie oraz języku." en="A practical component contract: every control has a name, focus, keyboard behavior, status and readable reflow in every theme and language." />}
    >
      <FoundationSection
        index="01"
        title={<Localized pl="Warstwy kontraktu" en="Contract layers" />}
        summary={<Localized pl="To są wymagania projektowe dla komponentów, nie raport z testów." en="These are design requirements for components, not a test report." />}
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
        title={<Localized pl="Zachowania komponentów" en="Component behaviors" />}
        summary={<Localized pl="Ten sam kontrakt dotyczy pól, tabel, wykresów, overlayów i komunikatów." en="The same contract applies to fields, tables, charts, overlays and notices." />}
      >
        <AccessibilityBehaviorGrid />
      </FoundationSection>

      <FoundationSection
        index="03"
        title={<Localized pl="Przykład interaktywny" en="Interactive example" />}
        summary={<Localized pl="Demo pokazuje realną kontrolkę: etykietę, nazwę dostępną, status live i powrót fokusu." en="The demo shows a real control: label, accessible name, live status and focus return." />}
      >
        <FoundationVariant
          title={<Localized pl="Wybór kanału" en="Channel selection" />}
          description={<Localized pl="Ten sam wzorzec działa myszą i klawiaturą." en="The same pattern works with mouse and keyboard." />}
        >
          <AccessibilitySelectDemo />
        </FoundationVariant>
      </FoundationSection>

      <FoundationSection
        index="04"
        title={<Localized pl="Granice dla bibliotek" en="Boundaries for libraries" />}
        summary={<Localized pl="Fundament nie wybiera biblioteki wykresów, tabel ani kalendarza. Narzuca zachowanie, które każda z nich musi zachować." en="The foundation does not choose a chart, table or calendar library. It defines behavior every library must preserve." />}
      >
        <AccessibilityLibraryLedger />
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

    await expect(
      canvas.getByText(
        /label, klawiaturę i status błędu|label, keyboard support and error status/,
      ),
    ).toBeInTheDocument();
  },
};
