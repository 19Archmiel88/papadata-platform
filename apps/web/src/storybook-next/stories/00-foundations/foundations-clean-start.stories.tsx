import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  KeyboardEvent,
  ReactNode,
} from 'react';
import {
  useEffect,
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

const meta = {
  title: '00 Fundamenty/Podstawy',
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

function Page({
  eyebrow,
  title,
  summary,
  children,
}: {
  readonly eyebrow: ReactNode;
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-f0-page">
      <header className="pd-f0-page__header">
        <div>
          <p className="pd-f0-kicker">
            {eyebrow}
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
  eyebrow,
  title,
  summary,
  children,
}: {
  readonly eyebrow?: ReactNode;
  readonly title: ReactNode;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="pd-f0-section">
      <header className="pd-f0-section__header">
        {eyebrow ? (
          <p className="pd-f0-kicker">{eyebrow}</p>
        ) : null}
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
  return (
    <code className="pd-f0-token-code">
      {children}
    </code>
  );
}

function StatusPill({
  tone,
  children,
}: {
  readonly tone:
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'info';
  readonly children: ReactNode;
}) {
  return (
    <span
      className="pd-f0-status"
      data-tone={tone}
    >
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

const visualPrinciples = [
  {
    titlePl: 'Decyzja przed dekoracją',
    titleEn: 'Decision before decoration',
    textPl:
      'Hierarchia informacji, dane i następna akcja mają pierwszeństwo przed efektami.',
    textEn:
      'Information hierarchy, data and the next action come before decorative effects.',
  },
  {
    titlePl: 'Premium przez precyzję',
    titleEn: 'Premium through precision',
    textPl:
      'Marka jest lokalnym akcentem. Powierzchnie pozostają spokojne, analityczne i czytelne.',
    textEn:
      'Brand is a local accent. Surfaces remain calm, analytical and readable.',
  },
  {
    titlePl: 'Mniej kart, więcej struktury',
    titleEn: 'Fewer cards, stronger structure',
    textPl:
      'Separatory, odstęp i zmiana powierzchni budują układ bez kart w kartach.',
    textEn:
      'Spacing, separators and surface changes structure the interface without nested cards.',
  },
] as const;

export const KierunekWizualny: Story = {
  name: 'Kierunek wizualny',
  render: () => {
    const locale = readLocale();

    return (
      <Page
        eyebrow="00 Fundamenty"
        title={
          locale === 'en'
            ? 'Visual direction'
            : 'Kierunek wizualny'
        }
        summary={
          locale === 'en'
            ? 'One target language for the entire product: analytical clarity, controlled depth and a distinctive brand accent.'
            : 'Jeden docelowy język całego produktu: analityczna czytelność, kontrolowana głębia i rozpoznawalny akcent marki.'
        }
      >
        <Section
          eyebrow={
            locale === 'en'
              ? 'PapaData identity'
              : 'Tożsamość PapaData'
          }
          title={
            locale === 'en'
              ? 'The brand identifies. UI semantics explain.'
              : 'Marka identyfikuje. Semantyka UI wyjaśnia.'
          }
          summary={
            locale === 'en'
              ? 'Dark amber connects the PD logo, wordmark and primary brand actions. Cyan serves analytical data and status colors keep operational meaning.'
              : 'Ciemny bursztyn spina logo PD, logotyp i główne akcje marki. Cyan obsługuje dane analityczne, a kolory statusów zachowują znaczenie operacyjne.'
          }
        >
          <div className="pd-f0-brand-system">
            <article className="pd-f0-brand-hero">
              <PapaDataBrand
                className="pd-f0-brand-hero__logo"
                glow
                size="large"
              />
              <p>
                <Localized
                  pl="Logo pełne jest pierwszym sygnałem marki. Ciemny bursztyn prowadzi identyfikację i główne akcje, ale nie zastępuje danych ani statusów."
                  en="The full logo is the first brand signal. Dark amber anchors identity and primary brand actions without replacing data or status colors."
                />
              </p>
            </article>

            <div className="pd-f0-brand-anatomy">
              <article>
                <span>
                  <Localized pl="Sygnet" en="Mark" />
                </span>
                <PapaDataBrand
                  glow
                  label="PapaData sygnet"
                  showWordmark={false}
                  size="large"
                />
                <p>
                  <Localized
                    pl="Monogram PD z ambientem i kreską rozchodzącą się od środka. Używany w ciasnych miejscach."
                    en="The PD monogram with ambient light and a center-out accent line. Used in compact spaces."
                  />
                </p>
              </article>
              <article>
                <span>
                  <Localized pl="Logotyp" en="Wordmark" />
                </span>
                <PapaDataBrand
                  label="PapaData logotyp"
                  showMark={false}
                  size="large"
                />
                <p>
                  <Localized
                    pl="Sam napis działa tylko wtedy, gdy kontekst już niesie znak marki."
                    en="The wordmark alone works only when the context already carries the brand mark."
                  />
                </p>
              </article>
              <article data-brand-emphasis="full">
                <span>
                  <Localized pl="Logo pełne" en="Full logo" />
                </span>
                <PapaDataBrand
                  glow
                  label="PapaData logo"
                  size="large"
                />
                <p>
                  <Localized
                    pl="Sygnet i logotyp razem. Ten sam komponent działa w jasnym i ciemnym motywie."
                    en="Mark and wordmark together. The same component works in light and dark themes."
                  />
                </p>
              </article>
            </div>

            <div className="pd-f0-brand-semantics">
              <article data-brand-role="identity">
                <span aria-hidden="true" />
                <div>
                  <strong>
                    <Localized pl="Marka" en="Brand" />
                  </strong>
                  <TokenCode>--pd-brand</TokenCode>
                  <p>
                    <Localized
                      pl="Logo PD, sygnet i główny bursztynowy akcent."
                      en="PD logo, mark and the main amber brand accent."
                    />
                  </p>
                </div>
              </article>
              <article data-brand-role="action">
                <span aria-hidden="true" />
                <div>
                  <strong>
                    <Localized pl="CTA marki" en="Brand CTA" />
                  </strong>
                  <TokenCode>--pd-brand-action</TokenCode>
                  <p>
                    <Localized
                      pl="Najważniejsze przyciski i wejścia w przepływ."
                      en="Primary buttons and entry points into the flow."
                    />
                  </p>
                </div>
              </article>
              <article data-brand-role="data">
                <span aria-hidden="true" />
                <div>
                  <strong>
                    <Localized pl="Dane" en="Data" />
                  </strong>
                  <TokenCode>--pd-data-accent</TokenCode>
                  <p>
                    <Localized
                      pl="Wykresy, metryki i elementy analityczne."
                      en="Charts, metrics and analytical elements."
                    />
                  </p>
                </div>
              </article>
              <article data-brand-role="status">
                <span aria-hidden="true" />
                <div>
                  <strong>
                    <Localized pl="Status" en="Status" />
                  </strong>
                  <TokenCode>--pd-status-*</TokenCode>
                  <p>
                    <Localized
                      pl="Stan systemu, alerty i walidacja."
                      en="System state, alerts and validation."
                    />
                  </p>
                </div>
              </article>
            </div>

            <div className="pd-f0-brand-usage">
              <article data-example="brand">
                <PapaDataBrand
                  glow
                  showWordmark={false}
                  size="small"
                />
                <strong>
                  <Localized pl="Identyfikacja" en="Identity" />
                </strong>
                <p>
                  <Localized
                    pl="Bursztyn nie udaje CTA ani statusu."
                    en="Amber does not act as CTA or status."
                  />
                </p>
              </article>
              <article data-example="action">
                <button
                  data-interactive-tone="primary"
                  type="button"
                >
                  <Localized pl="Połącz źródło" en="Connect source" />
                </button>
                <strong>
                  <Localized pl="Akcja" en="Action" />
                </strong>
                <p>
                  <Localized
                    pl="Bursztyn prowadzi główną akcję marki."
                    en="Amber leads the primary brand action."
                  />
                </p>
              </article>
              <article data-example="data">
                <div aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <strong>
                  <Localized pl="Dane" en="Data" />
                </strong>
                <p>
                  <Localized
                    pl="Cyan opisuje warstwę analityczną."
                    en="Cyan describes the analytical layer."
                  />
                </p>
              </article>
              <article data-example="status">
                <StatusPill tone="success">
                  <Localized pl="Aktywne" en="Active" />
                </StatusPill>
                <strong>
                  <Localized pl="Status" en="Status" />
                </strong>
                <p>
                  <Localized
                    pl="Status komunikuje stan, nie dekorację."
                    en="Status communicates state, not decoration."
                  />
                </p>
              </article>
            </div>
          </div>
        </Section>

        <Section
          title={
            locale === 'en'
              ? 'Three governing principles'
              : 'Trzy zasady nadrzędne'
          }
        >
          <div className="pd-f0-principle-grid">
            {visualPrinciples.map((item, index) => (
              <article key={item.titlePl}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>
                  {locale === 'en'
                    ? item.titleEn
                    : item.titlePl}
                </h3>
                <p>
                  {locale === 'en'
                    ? item.textEn
                    : item.textPl}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          title={
            locale === 'en'
              ? 'Accepted and rejected direction'
              : 'Kierunek przyjęty i odrzucony'
          }
        >
          <div className="pd-f0-do-dont">
            <article data-result="accepted">
              <StatusPill tone="success">
                <Localized pl="Przyjęte" en="Accepted" />
              </StatusPill>
              <h3>
                <Localized
                  pl="Neutralne powierzchnie, lokalny akcent"
                  en="Neutral surfaces, local accent"
                />
              </h3>
              <p>
                <Localized
                  pl="Spokojny canvas, precyzyjne separatory, duża czytelność danych i bursztyn używany oszczędnie."
                  en="A calm canvas, precise separators, readable data and restrained use of amber."
                />
              </p>
            </article>
            <article data-result="rejected">
              <StatusPill tone="danger">
                <Localized pl="Odrzucone" en="Rejected" />
              </StatusPill>
              <h3>
                <Localized
                  pl="Neonowe halo i nadmiar kart"
                  en="Neon halo and excessive cards"
                />
              </h3>
              <p>
                <Localized
                  pl="Duże poświaty, generyczny SaaS, przypadkowe gradienty i każda sekcja zamknięta w osobnej ramce."
                  en="Large glows, generic SaaS styling, random gradients and every section boxed into a card."
                />
              </p>
            </article>
          </div>
        </Section>
      </Page>
    );
  },
};

const typographyRows = [
  {
    labelPl: 'Nagłówek ekspozycyjny',
    labelEn: 'Display',
    token: '--pd-type-size-display',
  },
  {
    labelPl: 'Tytuł strony',
    labelEn: 'Page title',
    token: '--pd-type-size-page',
  },
  {
    labelPl: 'Tytuł sekcji',
    labelEn: 'Section title',
    token: '--pd-type-size-section',
  },
  {
    labelPl: 'Tekst duży',
    labelEn: 'Body large',
    token: '--pd-type-size-body-large',
  },
  {
    labelPl: 'Tekst podstawowy',
    labelEn: 'Body',
    token: '--pd-type-size-body',
  },
  {
    labelPl: 'Tekst mały',
    labelEn: 'Body small',
    token: '--pd-type-size-body-small',
  },
  {
    labelPl: 'Podpis',
    labelEn: 'Caption',
    token: '--pd-type-size-caption',
  },
  {
    labelPl: 'Metryka',
    labelEn: 'Metric',
    token: '--pd-type-size-metric',
  },
  {
    labelPl: 'Dane techniczne',
    labelEn: 'Technical data',
    token: '--pd-font-mono',
  },
] as const;

export const Typografia: Story = {
  name: 'Typografia',
  render: () => {
    const locale = readLocale();
    const dateStart = new Date('2026-06-01T12:00:00Z');
    const dateEnd = new Date('2026-06-30T12:00:00Z');
    const copy = locale === 'en'
      ? {
          title: 'Typography and data formatting',
          summary:
            'Inter supports the interface and long-form reading. JetBrains Mono is reserved for identifiers, metrics and technical data.',
          sample: 'A decision model for profitable growth',
          paragraph:
            'The interface prioritizes readable analysis, concrete recommendations and a clear next action without excessive bold text.',
        }
      : {
          title: 'Typografia i formatowanie danych',
          summary:
            'Inter obsługuje interfejs i dłuższe treści. JetBrains Mono jest zarezerwowany dla identyfikatorów, metryk i danych technicznych.',
          sample: 'Model decyzyjny rentownego wzrostu',
          paragraph:
            'Interfejs stawia na czytelną analizę, konkretne rekomendacje i jasną następną akcję bez nadmiaru pogrubień.',
        };

    return (
      <Page
        eyebrow="00 Fundamenty"
        title={copy.title}
        summary={copy.summary}
      >
        <Section title={copy.sample}>
          <div className="pd-f0-type-ledger">
            {typographyRows.map((item, index) => (
              <article key={item.token}>
                <div>
                  <strong>
                    {locale === 'en' ? item.labelEn : item.labelPl}
                  </strong>
                  <TokenCode>{item.token}</TokenCode>
                </div>
                <p data-type-row={index}>
                  {index === 7
                    ? formatPapaDataCurrency(
                        1284930.42,
                        locale,
                      )
                    : index === 8
                      ? 'SKU-PL-2394 · ROAS 4.82'
                      : index === 0
                        ? copy.sample
                        : copy.paragraph}
                </p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          title={
            locale === 'en'
              ? 'Locale changes real content and formats'
              : 'Locale zmienia realną treść i formaty'
          }
        >
          <div className="pd-f0-format-grid">
            <article>
              <span>
                <Localized pl="Liczba" en="Number" />
              </span>
              <strong>
                {formatPapaDataNumber(1284930.42, locale)}
              </strong>
            </article>
            <article>
              <span>
                <Localized pl="Waluta" en="Currency" />
              </span>
              <strong>
                {formatPapaDataCurrency(842900, locale)}
              </strong>
            </article>
            <article>
              <span>
                <Localized pl="Procent" en="Percent" />
              </span>
              <strong>
                {formatPapaDataPercent(0.842, locale)}
              </strong>
            </article>
            <article>
              <span>
                <Localized pl="Zakres dat" en="Date range" />
              </span>
              <strong>
                {formatPapaDataDateRange(
                  dateStart,
                  dateEnd,
                  locale,
                )}
              </strong>
            </article>
            <article>
              <span>
                <Localized pl="Czas względny" en="Relative time" />
              </span>
              <strong>
                {formatPapaDataRelativeTime(-14, 'minute', locale)}
              </strong>
            </article>
            <article>
              <span>
                <Localized pl="Długi tekst" en="Long content" />
              </span>
              <strong className="pd-f0-wrap-sample">
                <Localized
                  pl="Rekomendacja dotycząca ponownego połączenia źródła danych marketplace"
                  en="Recommendation for reconnecting the marketplace data source"
                />
              </strong>
            </article>
          </div>
        </Section>
      </Page>
    );
  },
};

const semanticColors = [
  ['Canvas', '--pd-canvas', 'canvas'],
  ['Surface', '--pd-surface', 'surface'],
  ['Surface subtle', '--pd-surface-subtle', 'surface-subtle'],
  ['Surface raised', '--pd-surface-raised', 'surface-raised'],
  ['Surface active', '--pd-surface-active', 'surface-active'],
  ['Surface data', '--pd-surface-data', 'surface-data'],
  ['Text', '--pd-text', 'text'],
  ['Text secondary', '--pd-text-secondary', 'text-secondary'],
  ['Text muted', '--pd-text-muted', 'text-muted'],
  ['Separator', '--pd-separator', 'separator'],
  ['Interactive', '--pd-interactive', 'interactive'],
  ['Data accent', '--pd-data-accent', 'data-accent'],
  ['Focus', '--pd-focus-visible', 'focus'],
  ['Success', '--pd-status-success', 'success'],
  ['Warning', '--pd-status-warning', 'warning'],
  ['Danger', '--pd-status-danger', 'danger'],
  ['Neutral', '--pd-status-neutral', 'neutral'],
] as const;

const dataPalette = [
  '--pd-data-series-1',
  '--pd-data-series-2',
  '--pd-data-series-3',
  '--pd-data-series-4',
  '--pd-data-series-5',
  '--pd-data-series-6',
] as const;

export const KolorySemantyczne: Story = {
  name: 'Kolory semantyczne',
  render: () => (
    <Page
      eyebrow="00 Fundamenty"
      title={
        <Localized
          pl="Marka, semantyka i dane"
          en="Brand, semantics and data"
        />
      }
      summary={
        <Localized
          pl="Jedno źródło tokenów rozdziela tożsamość marki, akcje, dane, fokus i statusy."
          en="One token source separates brand identity, actions, data, focus and operational statuses."
        />
      }
    >
      <Section
        title={
          <Localized
            pl="Kolory marki"
            en="Brand colors"
          />
        }
      >
        <div className="pd-f0-brand-token-grid">
          <article>
            <PapaDataBrand size="large" />
            <TokenCode>--pd-brand</TokenCode>
          </article>
          <article data-brand-emphasis="highlight">
            <PapaDataBrand glow size="large" />
            <TokenCode>--pd-brand-highlight</TokenCode>
          </article>
          <article data-brand-emphasis="line">
            <span
              aria-hidden="true"
              className="pd-f0-brand-line-sample"
            />
            <TokenCode>--pd-brand-line</TokenCode>
          </article>
          <article>
            <button
              data-interactive-tone="primary"
              type="button"
            >
              <Localized pl="Główna akcja" en="Primary action" />
            </button>
            <TokenCode>--pd-brand-action</TokenCode>
          </article>
        </div>
      </Section>

      <Section
        title={
          <Localized
            pl="Role semantyczne"
            en="Semantic roles"
          />
        }
      >
        <div className="pd-f0-color-ledger">
          {semanticColors.map(([label, token, role]) => (
            <article key={token}>
              <span
                aria-hidden="true"
                data-color-role={role}
              />
              <div>
                <strong>{label}</strong>
                <TokenCode>{token}</TokenCode>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title={
          <Localized
            pl="Paleta danych"
            en="Data palette"
          />
        }
        summary={
          <Localized
            pl="Serie danych nie korzystają przypadkowo z bursztynu marki ani kolorów statusów."
            en="Data series do not randomly reuse brand amber or status colors."
          />
        }
      >
        <div className="pd-f0-data-palette">
          {dataPalette.map((token, index) => (
            <article key={token}>
              <span
                aria-hidden="true"
                style={{
                  background: `var(${token})`,
                }}
              />
              <strong>
                <Localized pl="Seria" en="Series" /> {index + 1}
              </strong>
              <TokenCode>{token}</TokenCode>
            </article>
          ))}
        </div>
        <div className="pd-f0-data-contract">
          <article data-data-role="actual">
            <strong>
              <Localized pl="Wynik" en="Actual" />
            </strong>
            <TokenCode>--pd-data-actual</TokenCode>
          </article>
          <article data-data-role="target">
            <strong>
              <Localized pl="Cel" en="Target" />
            </strong>
            <TokenCode>--pd-data-target</TokenCode>
          </article>
          <article data-data-role="forecast">
            <strong>
              <Localized pl="Prognoza" en="Forecast" />
            </strong>
            <TokenCode>--pd-data-forecast</TokenCode>
          </article>
          <article data-data-role="uncertainty">
            <strong>
              <Localized pl="Niepewność" en="Uncertainty" />
            </strong>
            <TokenCode>--pd-data-uncertainty</TokenCode>
          </article>
        </div>
      </Section>

      <Section
        title={
          <Localized
            pl="Status wymaga tekstu"
            en="Status requires text"
          />
        }
      >
        <div className="pd-f0-status-row">
          <StatusPill tone="success">
            <Localized pl="Stabilne" en="Stable" />
          </StatusPill>
          <StatusPill tone="warning">
            <Localized pl="Do sprawdzenia" en="Review required" />
          </StatusPill>
          <StatusPill tone="danger">
            <Localized pl="Błąd synchronizacji" en="Sync failed" />
          </StatusPill>
          <StatusPill tone="neutral">
            <Localized pl="Nie rozpoczęto" en="Not started" />
          </StatusPill>
          <StatusPill tone="info">
            <Localized pl="Przetwarzanie" en="Processing" />
          </StatusPill>
        </div>
      </Section>
    </Page>
  ),
};

const spacingTokens = [
  '--pd-space-1',
  '--pd-space-2',
  '--pd-space-3',
  '--pd-space-4',
  '--pd-space-6',
  '--pd-space-8',
  '--pd-space-12',
] as const;

function DensityTable({
  density,
}: {
  readonly density: 'comfortable' | 'compact';
}) {
  const locale = readLocale();
  const densityLabel = density === 'comfortable'
    ? locale === 'en' ? 'comfortable' : 'wygodna'
    : locale === 'en' ? 'compact' : 'kompaktowa';

  return (
    <article
      className="pd-f0-density-sample"
      data-density={density}
    >
      <header>
        <h3>{densityLabel}</h3>
        <TokenCode>data-density="{density}"</TokenCode>
      </header>
      <table>
        <thead>
          <tr>
            <th scope="col">
              <Localized pl="Źródło" en="Source" />
            </th>
            <th scope="col">
              <Localized pl="Status" en="Status" />
            </th>
            <th scope="col">
              <Localized pl="Wartość" en="Value" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Marketplace</td>
            <td><Localized pl="Stabilne" en="Stable" /></td>
            <td>{formatPapaDataPercent(0.992, locale)}</td>
          </tr>
          <tr>
            <td><Localized pl="Kampanie" en="Campaigns" /></td>
            <td><Localized pl="Do sprawdzenia" en="Review" /></td>
            <td>+{formatPapaDataPercent(0.084, locale)}</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

export const SpacingIGrid: Story = {
  name: 'Odstępy i siatka',
  render: () => (
    <Page
      eyebrow="00 Fundamenty"
      title={
        <Localized
          pl="Odstępy, gęstość i responsywna siatka"
          en="Spacing, density and responsive grid"
        />
      }
      summary={
        <Localized
          pl="Skala 4 px, dwie gęstości i realny reflow dla 12, 8 i 4 kolumn."
          en="A 4 px scale, two density modes and real reflow across 12, 8 and 4 columns."
        />
      }
    >
      <Section
        title={
          <Localized pl="Skala odstępów" en="Spacing scale" />
        }
      >
        <div className="pd-f0-spacing-scale">
          {spacingTokens.map((token) => (
            <article key={token}>
              <TokenCode>{token}</TokenCode>
              <span
                aria-hidden="true"
                style={{ width: `var(${token})` }}
              />
            </article>
          ))}
        </div>
      </Section>

      <Section
        title={
          <Localized pl="Gęstość" en="Density" />
        }
      >
        <div className="pd-f0-two-column">
          <DensityTable density="comfortable" />
          <DensityTable density="compact" />
        </div>
      </Section>

      <Section
        title={
          <Localized
            pl="Siatka adaptuje się, nie skaluje"
            en="The grid reflows instead of scaling"
          />
        }
      >
        <div
          aria-label={readLocale() === 'en'
            ? 'Responsive grid demonstration'
            : 'Demonstracja responsywnej siatki'}
          className="pd-f0-responsive-grid"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <dl className="pd-f0-breakpoint-ledger">
          <div>
            <dt><Localized pl="Szeroki desktop" en="Wide desktop" /></dt>
            <dd><Localized pl="12 kolumn" en="12 columns" /></dd>
          </div>
          <div>
            <dt>Tablet</dt>
            <dd><Localized pl="8 kolumn" en="8 columns" /></dd>
          </div>
          <div>
            <dt><Localized pl="Telefon" en="Mobile" /></dt>
            <dd><Localized pl="4 kolumny" en="4 columns" /></dd>
          </div>
          <div>
            <dt><Localized pl="Powiększenie 200%" en="Zoom 200%" /></dt>
            <dd><Localized pl="reflow treści" en="content reflow" /></dd>
          </div>
        </dl>
      </Section>
    </Page>
  ),
};

const radiusDefinitions = [
  {
    role: 'none',
    token: '--pd-radius-none',
    labelPl: 'Brak promienia',
    labelEn: 'No radius',
    usePl: 'Tabele i separatory',
    useEn: 'Tables and separators',
  },
  {
    role: 'subtle',
    token: '--pd-radius-subtle',
    labelPl: 'Subtelny',
    labelEn: 'Subtle',
    usePl: 'Słupki i drobne znaczniki',
    useEn: 'Bars and small markers',
  },
  {
    role: 'small',
    token: '--pd-radius-small',
    labelPl: 'Mały',
    labelEn: 'Small',
    usePl: 'Próbki i elementy danych',
    useEn: 'Samples and data elements',
  },
  {
    role: 'control',
    token: '--pd-radius-control',
    labelPl: 'Kontrolka',
    labelEn: 'Control',
    usePl: 'Przycisk, pole i menu',
    useEn: 'Button, field and menu',
  },
  {
    role: 'surface',
    token: '--pd-radius-surface',
    labelPl: 'Powierzchnia',
    labelEn: 'Surface',
    usePl: 'Panel danych i sekcja',
    useEn: 'Data panel and section',
  },
  {
    role: 'overlay',
    token: '--pd-radius-overlay',
    labelPl: 'Warstwa nad treścią',
    labelEn: 'Overlay',
    usePl: 'Dialog, popover i drawer',
    useEn: 'Dialog, popover and drawer',
  },
  {
    role: 'pill',
    token: '--pd-radius-pill',
    labelPl: 'Pastylka',
    labelEn: 'Pill',
    usePl: 'Status i filtr',
    useEn: 'Status and filter',
  },
] as const;

export const PromienieObramowaniaICienie: Story = {
  name: 'Promienie, obramowania i cienie',
  render: () => {
    const locale = readLocale();

    return (
      <Page
        eyebrow="00 Fundamenty"
        title={
          <Localized
            pl="Geometria i głębia"
            en="Geometry and depth"
          />
        }
        summary={
          <Localized
            pl="Promień wynika z roli elementu, obramowanie buduje hierarchię, a cień jest zarezerwowany dla rzeczywiście wyniesionych warstw."
            en="Radius follows component role, borders establish hierarchy and shadows are reserved for genuinely elevated layers."
          />
        }
      >
        <Section title={<Localized pl="Promienie i zastosowanie" en="Radius and usage" />}>
          <div className="pd-f0-radius-grid">
            {radiusDefinitions.map((item) => (
              <article
                data-radius={item.role}
                key={item.token}
              >
                <div
                  aria-hidden="true"
                  className="pd-f0-radius-sample"
                >
                  <span />
                  <span />
                  <span />
                </div>
                <div>
                  <strong>
                    {locale === 'en' ? item.labelEn : item.labelPl}
                  </strong>
                  <p>
                    {locale === 'en' ? item.useEn : item.usePl}
                  </p>
                  <TokenCode>{item.token}</TokenCode>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section title={<Localized pl="Obramowania" en="Borders" />}>
          <div className="pd-f0-border-grid">
            <article data-border="subtle">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Subtelne" en="Subtle" /></strong>
                <p><Localized pl="Podział w tabeli i spokojnych listach." en="Division inside tables and calm lists." /></p>
                <TokenCode>--pd-separator-subtle</TokenCode>
              </div>
            </article>
            <article data-border="default">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Standardowe" en="Default" /></strong>
                <p><Localized pl="Granica panelu lub grupy ustawień." en="Boundary for panels or settings groups." /></p>
                <TokenCode>--pd-separator</TokenCode>
              </div>
            </article>
            <article data-border="strong">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Mocne" en="Strong" /></strong>
                <p><Localized pl="Krawędź drawera, sticky panelu lub ważnej sekcji." en="Edge for drawers, sticky panels or important sections." /></p>
                <TokenCode>--pd-separator-strong</TokenCode>
              </div>
            </article>
            <article data-border="interactive">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Interaktywne" en="Interactive" /></strong>
                <p><Localized pl="Tylko stan wejścia lub elementu aktywnego." en="Only for input state or active elements." /></p>
                <TokenCode>--pd-border-interactive</TokenCode>
              </div>
            </article>
            <article data-border="danger">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Błąd" en="Danger" /></strong>
                <p><Localized pl="Walidacja i ryzykowne decyzje." en="Validation and risky decisions." /></p>
                <TokenCode>--pd-border-danger</TokenCode>
              </div>
            </article>
          </div>
        </Section>

        <Section title={<Localized pl="Głębia" en="Elevation" />}>
          <div className="pd-f0-shadow-grid">
            <article data-shadow="none">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Powierzchnia bazowa" en="Base surface" /></strong>
                <p><Localized pl="Sekcja w przepływie strony." en="Section in the page flow." /></p>
                <TokenCode>--pd-shadow-none</TokenCode>
              </div>
            </article>
            <article data-shadow="control">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Kontrolka" en="Control" /></strong>
                <p><Localized pl="Pole, select lub małe menu." en="Field, select or small menu." /></p>
                <TokenCode>--pd-shadow-control</TokenCode>
              </div>
            </article>
            <article data-shadow="raised">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Powierzchnia wyniesiona" en="Raised surface" /></strong>
                <p><Localized pl="Panel narzędziowy nad tłem." en="Tool panel above the background." /></p>
                <TokenCode>--pd-shadow-raised</TokenCode>
              </div>
            </article>
            <article data-shadow="floating">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Kontrolka pływająca" en="Floating control" /></strong>
                <p><Localized pl="Popover, menu kontekstowe lub szybka akcja." en="Popover, context menu or quick action." /></p>
                <TokenCode>--pd-shadow-floating</TokenCode>
              </div>
            </article>
            <article data-shadow="overlay">
              <span aria-hidden="true" />
              <div>
                <strong><Localized pl="Warstwa nad treścią" en="Overlay" /></strong>
                <p><Localized pl="Dialog, drawer i blokujące warstwy." en="Dialog, drawer and blocking layers." /></p>
                <TokenCode>--pd-shadow-overlay</TokenCode>
              </div>
            </article>
          </div>
        </Section>

        <Section
          title={
            <Localized
              pl="Separacja bez kart w kartach"
              en="Separation without nested cards"
            />
          }
        >
          <div className="pd-f0-structure-sample">
            <header>
              <h3><Localized pl="Wyniki kanałów" en="Channel results" /></h3>
              <StatusPill tone="success">
                <Localized pl="Aktualne" en="Current" />
              </StatusPill>
            </header>
            <div>
              <article>
                <span>Marketplace</span>
                <strong>842 900 zł</strong>
              </article>
              <article>
                <span><Localized pl="Płatne media" en="Paid media" /></span>
                <strong>118 430 zł</strong>
              </article>
              <article>
                <span>CRM</span>
                <strong><Localized pl="17 rekordów" en="17 records" /></strong>
              </article>
            </div>
          </div>
        </Section>
      </Page>
    );
  },
};

const iconCategoryLabels = {
  home: { pl: 'Strona główna', en: 'Home' },
  search: { pl: 'Wyszukiwanie', en: 'Search' },
  trend: { pl: 'Trend', en: 'Trend' },
  data: { pl: 'Dane', en: 'Data' },
  integration: { pl: 'Integracja', en: 'Integration' },
  assistant: { pl: 'Asystent', en: 'Assistant' },
  security: { pl: 'Bezpieczeństwo', en: 'Security' },
  billing: { pl: 'Płatności', en: 'Billing' },
  success: { pl: 'Sukces', en: 'Success' },
  warning: { pl: 'Ostrzeżenie', en: 'Warning' },
} as const;

const iconLanguageRules = [
  {
    labelPl: 'Geometria',
    labelEn: 'Geometry',
    value: '24x24',
    token: 'viewBox="0 0 24 24"',
  },
  {
    labelPl: 'Linia',
    labelEn: 'Stroke',
    value: '1.75',
    token: 'strokeWidth',
  },
  {
    labelPl: 'Zakończenia',
    labelEn: 'Caps',
    value: 'round',
    token: 'strokeLinecap',
  },
  {
    labelPl: 'Kolor',
    labelEn: 'Color',
    value: 'currentColor',
    token: 'inherit',
  },
] as const;

const iconSemanticRoles: readonly {
  readonly key:
    | 'navigation'
    | 'action'
    | 'data'
    | 'status'
    | 'security'
    | 'assistant';
  readonly titlePl: string;
  readonly titleEn: string;
  readonly descriptionPl: string;
  readonly descriptionEn: string;
  readonly token: string;
  readonly icons: readonly PapaDataIconName[];
}[] = [
  {
    key: 'navigation',
    titlePl: 'Nawigacja',
    titleEn: 'Navigation',
    descriptionPl:
      'Ikony prowadzą po strukturze produktu i pozostają podporządkowane tekstowi.',
    descriptionEn:
      'Navigation icons guide the product structure and stay subordinate to text.',
    token: '--pd-text-secondary',
    icons: ['home', 'search'],
  },
  {
    key: 'action',
    titlePl: 'Akcja markowa',
    titleEn: 'Brand action',
    descriptionPl:
      'Ikona w przycisku dziedziczy kolor akcji, więc bursztyn marki pojawia się tylko tam, gdzie użytkownik działa.',
    descriptionEn:
      'An icon inside a button inherits the action color, so brand amber appears where the user acts.',
    token: '--pd-brand-action',
    icons: ['search', 'integration'],
  },
  {
    key: 'data',
    titlePl: 'Analityka',
    titleEn: 'Analytics',
    descriptionPl:
      'Dane używają cyjanu i nie konkurują z bursztynem identyfikacji.',
    descriptionEn:
      'Data uses cyan and does not compete with identity amber.',
    token: '--pd-data-accent',
    icons: ['trend', 'data'],
  },
  {
    key: 'status',
    titlePl: 'Status',
    titleEn: 'Status',
    descriptionPl:
      'Sukces i ostrzeżenie mają własne znaczenie operacyjne, niezależne od marki.',
    descriptionEn:
      'Success and warning keep their own operational meaning, separate from the brand.',
    token: '--pd-status-*',
    icons: ['success', 'warning'],
  },
  {
    key: 'security',
    titlePl: 'Zaufanie',
    titleEn: 'Trust',
    descriptionPl:
      'Bezpieczeństwo pozostaje neutralne lub interaktywne, zależnie od kontekstu.',
    descriptionEn:
      'Security stays neutral or interactive depending on context.',
    token: '--pd-interactive',
    icons: ['security'],
  },
  {
    key: 'assistant',
    titlePl: 'Asystent',
    titleEn: 'Assistant',
    descriptionPl:
      'Asystent może korzystać z bursztynu jako sygnału produktu, ale nie zastępuje statusów.',
    descriptionEn:
      'Assistant can use amber as a product signal, but never replaces statuses.',
    token: '--pd-brand-strong',
    icons: ['assistant'],
  },
];

const iconDomainGroups: readonly {
  readonly key: string;
  readonly titlePl: string;
  readonly titleEn: string;
  readonly descriptionPl: string;
  readonly descriptionEn: string;
  readonly icons: readonly PapaDataIconName[];
}[] = [
  {
    key: 'navigation',
    titlePl: 'Nawigacja',
    titleEn: 'Navigation',
    descriptionPl: 'Wejście, orientacja i szybkie odnalezienie miejsca.',
    descriptionEn: 'Entry points, orientation and quick wayfinding.',
    icons: ['home', 'search'],
  },
  {
    key: 'analytics',
    titlePl: 'Analityka',
    titleEn: 'Analytics',
    descriptionPl: 'Wykresy, źródła danych i sygnały pomiarowe.',
    descriptionEn: 'Charts, data sources and measurement signals.',
    icons: ['trend', 'data'],
  },
  {
    key: 'integration',
    titlePl: 'Integracje',
    titleEn: 'Integrations',
    descriptionPl: 'Połączenia między systemami i przepływami.',
    descriptionEn: 'Connections between systems and workflows.',
    icons: ['integration'],
  },
  {
    key: 'operations',
    titlePl: 'Operacje',
    titleEn: 'Operations',
    descriptionPl: 'Płatności, rozliczenia, uprawnienia i zaufanie.',
    descriptionEn: 'Payments, billing, permissions and trust.',
    icons: ['billing', 'security'],
  },
  {
    key: 'status',
    titlePl: 'Statusy',
    titleEn: 'Statuses',
    descriptionPl: 'Krótka informacja o wyniku lub ryzyku.',
    descriptionEn: 'Short feedback about outcome or risk.',
    icons: ['success', 'warning'],
  },
  {
    key: 'assistant',
    titlePl: 'Asystent',
    titleEn: 'Assistant',
    descriptionPl: 'Wsparcie, automatyzacja i sugestie systemu.',
    descriptionEn: 'Support, automation and system suggestions.',
    icons: ['assistant'],
  },
];

export const Ikonografia: Story = {
  name: 'Ikonografia',
  render: () => {
    const locale = readLocale();

    return (
      <Page
        eyebrow="00 Fundamenty"
        title={<Localized pl="Ikonografia" en="Iconography" />}
        summary={
          <Localized
            pl="Ikony dziedziczą kolor z kontekstu: marka prowadzi akcje, dane zostają cyjanowe, a statusy zachowują własne znaczenie."
            en="Icons inherit color from context: brand leads actions, data stays cyan, and statuses keep their own meaning."
          />
        }
      >
        <Section
          title={<Localized pl="Język ikon" en="Icon language" />}
          summary={
            <Localized
              pl="Jedna geometria i jedna grubość linii dla całego produktu."
              en="One geometry and one stroke weight across the product."
            />
          }
        >
          <div className="pd-f0-icon-language">
            <div className="pd-f0-icon-language__sample">
              <div className="pd-f0-icon-strip" aria-hidden="true">
                <Icon name="home" size={24} />
                <Icon name="search" size={24} />
                <Icon name="trend" size={24} />
                <Icon name="data" size={24} />
              </div>
              <p>
                <Localized
                  pl="Ikona nie niesie własnego koloru. Znaczenie wynika z roli, przycisku, statusu albo kontekstu danych."
                  en="The icon does not carry its own color. Meaning comes from role, button, status or data context."
                />
              </p>
            </div>
            <dl className="pd-f0-icon-specs">
              {iconLanguageRules.map((rule) => (
                <div key={rule.token}>
                  <dt>{locale === 'en' ? rule.labelEn : rule.labelPl}</dt>
                  <dd>
                    <strong>{rule.value}</strong>
                    <TokenCode>{rule.token}</TokenCode>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section
          title={<Localized pl="Role semantyczne" en="Semantic roles" />}
          summary={
            <Localized
              pl="Ten sam symbol może zmienić barwę tylko przez kontekst, nigdy przez ręczny wariant dekoracyjny."
              en="The same symbol changes color through context, never through a manual decorative variant."
            />
          }
        >
          <div className="pd-f0-icon-role-grid">
            {iconSemanticRoles.map((role) => (
              <article key={role.key} data-icon-role={role.key}>
                <div className="pd-f0-icon-role-sample" aria-hidden="true">
                  {role.icons.map((name) => (
                    <Icon
                      className={`pd-f0-icon-preview pd-f0-icon-preview--${name}`}
                      key={name}
                      name={name}
                      size={24}
                    />
                  ))}
                </div>
                <div>
                  <strong>{locale === 'en' ? role.titleEn : role.titlePl}</strong>
                  <p>
                    {locale === 'en'
                      ? role.descriptionEn
                      : role.descriptionPl}
                  </p>
                  <TokenCode>{role.token}</TokenCode>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section
          title={<Localized pl="Rejestr domenowy" en="Domain registry" />}
          summary={
            <Localized
              pl="Ikony są grupowane według zadania, nie według wyglądu."
              en="Icons are grouped by job, not appearance."
            />
          }
        >
          <div className="pd-f0-icon-domain-grid">
            {iconDomainGroups.map((group) => (
              <article key={group.key} data-icon-domain={group.key}>
                <header>
                  <strong>{locale === 'en' ? group.titleEn : group.titlePl}</strong>
                  <p>
                    {locale === 'en'
                      ? group.descriptionEn
                      : group.descriptionPl}
                  </p>
                </header>
                <div className="pd-f0-icon-domain-list">
                  {group.icons.map((name) => {
                    const label = iconCategoryLabels[name];

                    return (
                      <span key={name}>
                        <Icon name={name} size={20} />
                        <span>{locale === 'en' ? label.en : label.pl}</span>
                        <TokenCode>{name}</TokenCode>
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section
          title={
            <Localized
              pl="Rozmiary w realnym użyciu"
              en="Sizes in real usage"
            />
          }
        >
          <div className="pd-f0-icon-size-ledger">
            <article>
              <div className="pd-f0-icon-size-sample pd-f0-icon-size-sample--meta">
                <Icon name="data" size={16} />
                <span>CRM</span>
                <TokenCode>12 rekordów</TokenCode>
              </div>
              <div>
                <strong>16 px</strong>
                <p>
                  <Localized
                    pl="Metadane, drobne etykiety i informacje pomocnicze."
                    en="Metadata, small labels and supporting information."
                  />
                </p>
              </div>
            </article>
            <article>
              <div className="pd-f0-icon-size-sample pd-f0-icon-size-sample--button">
                <button data-interactive-tone="primary" type="button">
                  <Icon name="integration" size={20} />
                  <Localized pl="Połącz" en="Connect" />
                </button>
              </div>
              <div>
                <strong>20 px</strong>
                <p>
                  <Localized
                    pl="Przyciski, pozycje menu, listy i nawigacja boczna."
                    en="Buttons, menu items, lists and side navigation."
                  />
                </p>
              </div>
            </article>
            <article>
              <div className="pd-f0-icon-size-sample pd-f0-icon-size-sample--heading">
                <Icon name="assistant" size={24} />
                <span><Localized pl="Asystent" en="Assistant" /></span>
              </div>
              <div>
                <strong>24 px</strong>
                <p>
                  <Localized
                    pl="Nagłówki paneli, landmarki i ważne punkty orientacyjne."
                    en="Panel headings, landmarks and important orientation points."
                  />
                </p>
              </div>
            </article>
          </div>
        </Section>

        <Section
          title={
            <Localized
              pl="Dostępność i nazwy"
              en="Accessibility and names"
            />
          }
        >
          <div className="pd-f0-icon-a11y">
            <article>
              <Icon name="trend" size={20} />
              <div>
                <strong>
                  <Localized pl="Dekoracyjna" en="Decorative" />
                </strong>
                <p>
                  <Localized
                    pl="Przy tekście ikona jest ukryta dla czytnika."
                    en="Next to text, the icon is hidden from screen readers."
                  />
                </p>
                <TokenCode>aria-hidden</TokenCode>
              </div>
            </article>
            <article>
              <button
                className="pd-f0-icon-action"
                aria-label={locale === 'en'
                  ? 'Open security settings'
                  : 'Otwórz ustawienia bezpieczeństwa'}
                type="button"
              >
                <Icon name="security" size={20} />
              </button>
              <div>
                <strong>
                  <Localized pl="Samodzielny przycisk" en="Icon-only button" />
                </strong>
                <p>
                  <Localized
                    pl="Przycisk z samą ikoną ma nazwę akcji na przycisku."
                    en="An icon-only button gets the action name on the button."
                  />
                </p>
                <TokenCode>aria-label</TokenCode>
              </div>
            </article>
            <article>
              <Icon
                label={locale === 'en'
                  ? 'Integration connected'
                  : 'Integracja połączona'}
                name="integration"
                size={20}
              />
              <div>
                <strong>
                  <Localized pl="Informacyjna" en="Informative" />
                </strong>
                <p>
                  <Localized
                    pl="Jeśli ikona sama przekazuje stan, dostaje własną nazwę."
                    en="When the icon itself communicates state, it gets its own name."
                  />
                </p>
                <TokenCode>{'<title>'}</TokenCode>
              </div>
            </article>
          </div>
        </Section>
      </Page>
    );
  },
};

type MotionMode = 'full' | 'reduced';

const motionDecisionRows = [
  {
    key: 'feedback',
    titlePl: 'Feedback po akcji',
    titleEn: 'Action feedback',
    descriptionPl:
      'Krótki sygnał potwierdza, że system przyjął zmianę.',
    descriptionEn:
      'A short signal confirms that the system accepted the change.',
    token: '--pd-motion-duration-fast',
  },
  {
    key: 'state',
    titlePl: 'Zmiana stanu',
    titleEn: 'State change',
    descriptionPl:
      'Ruch pomaga zrozumieć, skąd przyszła aktualizacja lub gdzie trafia fokus.',
    descriptionEn:
      'Motion helps explain where an update came from or where focus moved.',
    token: '--pd-motion-duration-standard',
  },
  {
    key: 'overlay',
    titlePl: 'Warstwa nad treścią',
    titleEn: 'Overlay layer',
    descriptionPl:
      'Dialog, popover i drawer mogą użyć wolniejszego wejścia tylko dla orientacji.',
    descriptionEn:
      'Dialog, popover and drawer may use a slower entrance only for orientation.',
    token: '--pd-motion-duration-deliberate',
  },
  {
    key: 'avoid',
    titlePl: 'Bez ruchu dekoracyjnego',
    titleEn: 'No decorative motion',
    descriptionPl:
      'Nie animujemy tła, metryk i danych tylko po to, żeby ekran wyglądał żywiej.',
    descriptionEn:
      'Backgrounds, metrics and data are not animated just to make the screen feel lively.',
    token: 'no-loop',
  },
] as const;

const motionReductionRows = [
  {
    step: '1',
    titlePl: 'System operacyjny',
    titleEn: 'Operating system',
    descriptionPl:
      'Preferencja reduce zawsze wygrywa z lokalną próbą uruchomienia pełnego ruchu.',
    descriptionEn:
      'The reduce preference always wins over a local full-motion request.',
    token: 'prefers-reduced-motion',
  },
  {
    step: '2',
    titlePl: 'Runtime produktu',
    titleEn: 'Product runtime',
    descriptionPl:
      'Aplikacja publikuje efektywny tryb na atrybucie dokumentu.',
    descriptionEn:
      'The app publishes the effective mode on the document attribute.',
    token: 'data-motion',
  },
  {
    step: '3',
    titlePl: 'Komponent',
    titleEn: 'Component',
    descriptionPl:
      'Komponent może prosić o ruch, ale musi umieć przejść w stan natychmiastowy.',
    descriptionEn:
      'A component can request motion, but must support an instant state change.',
    token: 'data-motion-requested',
  },
] as const;

function MotionExample({
  mode,
}: {
  readonly mode: MotionMode;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [run, setRun] = useState(0);
  const [effectiveMode, setEffectiveMode] = useState<MotionMode>(mode);
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const syncMotionState = () => {
      const rootMode = document.documentElement.dataset.motion === 'reduced'
        ? 'reduced'
        : 'full';
      const nextEffectiveMode = mode === 'reduced' || rootMode === 'reduced'
        ? 'reduced'
        : 'full';

      setEffectiveMode(nextEffectiveMode);
      setDuration(
        nextEffectiveMode === 'reduced'
          ? '1ms'
          : getComputedStyle(cardRef.current ?? document.documentElement)
              .getPropertyValue('--pd-motion-duration-standard')
              .trim(),
      );
    };

    syncMotionState();

    const observer = new MutationObserver(syncMotionState);
    observer.observe(
      document.documentElement,
      {
        attributeFilter: ['data-motion'],
        attributes: true,
      },
    );

    return () => observer.disconnect();
  }, [mode]);

  return (
    <article
      className="pd-f0-motion-example"
      data-effective-motion={effectiveMode}
      data-local-motion={mode}
      ref={cardRef}
    >
      <header>
        <div>
          <h3>
            {mode === 'full'
              ? <Localized pl="Pełny ruch" en="Full motion" />
              : <Localized pl="Ograniczony ruch" en="Reduced motion" />}
          </h3>
          <p>
            <Localized pl="Żądany" en="Requested" />: {mode}
            {' · '}
            <Localized pl="Efektywny" en="Effective" />: {effectiveMode}
          </p>
        </div>
        <TokenCode>{duration || motionTokens.duration.standard}</TokenCode>
      </header>
      <button
        className="pd-f0-motion-trigger pd-f0-action pd-f0-action--emphasis"
        data-interactive-tone="primary"
        onClick={() => setRun((value) => value + 1)}
        type="button"
      >
        <Icon name="trend" size={20} />
        <Localized pl="Uruchom przykład" en="Run example" />
      </button>
      <div aria-live="polite" className="pd-f0-motion-live">
        {run > 0 ? (
          <Localized
            pl={`Aktualizacja ${run} zakończona`}
            en={`Update ${run} completed`}
          />
        ) : (
          <Localized pl="Gotowe" en="Ready" />
        )}
      </div>
      <div aria-hidden="true" className="pd-f0-motion-track">
        <span key={run} data-run={run > 0 ? 'true' : 'false'} />
      </div>
    </article>
  );
}

export const MotionIReducedMotion: Story = {
  name: 'Animacje i ograniczenie ruchu',
  render: () => (
    <Page
      eyebrow="00 Fundamenty"
      title={<Localized pl="Motion i ograniczenie ruchu" en="Motion and reduced motion" />}
      summary={
        <Localized
          pl="Ruch informuje o zmianie, nie jest ozdobą. Preferencja systemowa reduced motion ma pierwszeństwo przed globalem Storybooka."
          en="Motion communicates change rather than decoration. The operating-system reduced-motion preference takes priority over the Storybook global."
        />
      }
    >
      <Section
        title={
          <Localized
            pl="Kiedy ruch jest dozwolony"
            en="When motion is allowed"
          />
        }
        summary={
          <Localized
            pl="Ruch ma pomagać w orientacji albo potwierdzeniu zmiany. Nie jest warstwą marki."
            en="Motion should help orientation or confirm change. It is not a brand layer."
          />
        }
      >
        <div className="pd-f0-motion-priority-grid">
          {motionDecisionRows.map((row) => (
            <article key={row.key} data-motion-purpose={row.key}>
              <span aria-hidden="true" />
              <div>
                <strong>{readLocale() === 'en' ? row.titleEn : row.titlePl}</strong>
                <p>
                  {readLocale() === 'en'
                    ? row.descriptionEn
                    : row.descriptionPl}
                </p>
                <TokenCode>{row.token}</TokenCode>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title={<Localized pl="Pełny ruch kontra redukcja" en="Full motion versus reduction" />}
        summary={
          <Localized
            pl="Ten sam komponent pokazuje żądany tryb i efektywny wynik po uwzględnieniu preferencji użytkownika."
            en="The same component shows the requested mode and the effective result after user preferences are applied."
          />
        }
      >
        <div className="pd-f0-motion-comparison">
          <MotionExample mode="full" />
          <MotionExample mode="reduced" />
        </div>
      </Section>

      <Section
        title={<Localized pl="Priorytet redukcji" en="Reduction priority" />}
        summary={
          <Localized
            pl="Redukcja ruchu jest kontraktem dostępności, nie wariantem estetycznym."
            en="Reduced motion is an accessibility contract, not an aesthetic variant."
          />
        }
      >
        <div className="pd-f0-motion-reduction-grid">
          {motionReductionRows.map((row) => (
            <article key={row.step}>
              <span>{row.step}</span>
              <div>
                <strong>{readLocale() === 'en' ? row.titleEn : row.titlePl}</strong>
                <p>
                  {readLocale() === 'en'
                    ? row.descriptionEn
                    : row.descriptionPl}
                </p>
                <TokenCode>{row.token}</TokenCode>
              </div>
            </article>
          ))}
        </div>

        <dl className="pd-f0-motion-token-ledger">
          <div><dt>instant</dt><dd><TokenCode>--pd-motion-duration-instant</TokenCode></dd></div>
          <div><dt>fast</dt><dd><TokenCode>--pd-motion-duration-fast</TokenCode></dd></div>
          <div><dt>standard</dt><dd><TokenCode>--pd-motion-duration-standard</TokenCode></dd></div>
          <div><dt>deliberate</dt><dd><TokenCode>--pd-motion-duration-deliberate</TokenCode></dd></div>
          <div><dt>easing</dt><dd><TokenCode>--pd-motion-easing-standard</TokenCode></dd></div>
          <div><dt>distance</dt><dd><TokenCode>--pd-motion-distance</TokenCode></dd></div>
        </dl>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button', {
      name: /Uruchom przykład|Run example/,
    });

    await userEvent.click(triggers[0]);
    await expect(
      canvas.getByText(/Aktualizacja 1 zakończona|Update 1 completed/),
    ).toBeInTheDocument();
  },
};

type DropdownValue = 'marketplace' | 'paid' | 'crm';

const dropdownOptions = [
  ['marketplace', 'Marketplace'],
  ['paid', 'Paid media'],
  ['crm', 'CRM'],
] as const satisfies readonly [DropdownValue, string][];

function AccessibleListbox() {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<DropdownValue>('crm');
  const [active, setActive] = useState<DropdownValue>('marketplace');
  const [shouldFocusList, setShouldFocusList] = useState(false);

  const move = (offset: number) => {
    const index = dropdownOptions.findIndex(([value]) => value === active);
    const next = (index + offset + dropdownOptions.length) % dropdownOptions.length;
    setActive(dropdownOptions[next][0]);
  };

  const openList = (nextActive: DropdownValue = selected) => {
    setActive(nextActive);
    setOpen(true);
    setShouldFocusList(true);
  };

  const close = (restore = true) => {
    setOpen(false);
    setShouldFocusList(false);
    if (restore) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  useEffect(() => {
    if (!open || !shouldFocusList) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      listRef.current?.focus();
      setShouldFocusList(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, shouldFocusList]);

  const handleListKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(dropdownOptions[0][0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(dropdownOptions.at(-1)?.[0] ?? 'crm');
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelected(active);
      close();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close(false);
    }
  };

  const selectedLabel = dropdownOptions.find(([value]) => value === selected)?.[1];

  return (
    <div className="pd-f0-listbox-demo">
      <button
        className="pd-f0-control-trigger"
        aria-controls={`${id}-listbox`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (open) {
            close(false);
          } else {
            openList();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openList(selected);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            openList(dropdownOptions.at(-1)?.[0] ?? selected);
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <span>
          <Localized pl="Kanał" en="Channel" />
        </span>
        <strong>{selectedLabel}</strong>
      </button>

      {open ? (
        <div
          aria-activedescendant={`${id}-option-${active}`}
          aria-label={readLocale() === 'en' ? 'Data channel' : 'Kanał danych'}
          className="pd-f0-listbox-demo__menu"
          id={`${id}-listbox`}
          onKeyDown={handleListKey}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
        >
          {dropdownOptions.map(([value, label]) => (
            <div
              aria-selected={selected === value}
              data-active={active === value}
              id={`${id}-option-${value}`}
              key={value}
              onClick={() => {
                setActive(value);
                setSelected(value);
                close();
              }}
              role="option"
            >
              <span>{label}</span>
              {selected === value ? (
                <span aria-hidden="true">✓</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <p className="pd-f0-listbox-demo__status" role="status">
        <Localized pl="Wybrano" en="Selected" />: {selectedLabel}
      </p>
    </div>
  );
}

function FocusActions() {
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  return (
    <div className="pd-f0-focus-actions">
      <button
        className="pd-f0-action pd-f0-action--emphasis"
        data-interactive-tone="primary"
        ref={primaryRef}
        type="button"
      >
        <Icon name="search" size={20} />
        <Localized pl="Zastosuj filtr" en="Apply filter" />
      </button>
      <button className="pd-f0-action" type="button">
        <Icon name="data" size={20} />
        <Localized pl="Eksportuj dane" en="Export data" />
      </button>
      <a href="#screen-reader-contract">
        <Localized pl="Przejdź do zasad" en="Go to guidance" />
      </a>
    </div>
  );
}

const accessibilityLayerRows = [
  {
    key: 'focus',
    titlePl: 'Fokus',
    titleEn: 'Focus',
    descriptionPl:
      'Każdy element interaktywny ma widoczny, tokenowy focus-visible.',
    descriptionEn:
      'Every interactive element has visible token-driven focus-visible.',
    token: '--pd-focus-visible',
  },
  {
    key: 'keyboard',
    titlePl: 'Klawiatura',
    titleEn: 'Keyboard',
    descriptionPl:
      'Złożone kontrolki rozdzielają fokus, aktywną opcję i wybór.',
    descriptionEn:
      'Complex controls separate focus, active option and selection.',
    token: 'aria-activedescendant',
  },
  {
    key: 'names',
    titlePl: 'Nazwy',
    titleEn: 'Names',
    descriptionPl:
      'Kontrolka z ikoną ma nazwę akcji, a nie opis grafiki.',
    descriptionEn:
      'An icon control is named by the action, not by the graphic.',
    token: 'aria-label',
  },
  {
    key: 'announcements',
    titlePl: 'Komunikaty',
    titleEn: 'Announcements',
    descriptionPl:
      'Zmiany asynchroniczne są ogłaszane bez przenoszenia fokusu.',
    descriptionEn:
      'Async changes are announced without moving focus.',
    token: 'aria-live="polite"',
  },
  {
    key: 'status',
    titlePl: 'Status',
    titleEn: 'Status',
    descriptionPl:
      'Kolor nigdy nie jest jedynym nośnikiem informacji.',
    descriptionEn:
      'Color is never the only information carrier.',
    token: 'text + color',
  },
  {
    key: 'reflow',
    titlePl: 'Reflow',
    titleEn: 'Reflow',
    descriptionPl:
      'Tekst i układy działają przy powiększeniu bez poziomego scrolla strony.',
    descriptionEn:
      'Text and layouts work under zoom without page-level horizontal scroll.',
    token: '200%',
  },
] as const;

export const Dostepnosc: Story = {
  name: 'Dostępność systemowa',
  render: () => (
    <Page
      eyebrow="00 Fundamenty"
      title={
        <Localized
          pl="Dostępność systemowa"
          en="System accessibility"
        />
      }
      summary={
        <Localized
          pl="Dostępność jest kontraktem komponentu: fokus, klawiatura, nazwa, komunikat, status i reflow muszą działać razem."
          en="Accessibility is a component contract: focus, keyboard, name, announcement, status and reflow must work together."
        />
      }
    >
      <Section
        title={
          <Localized
            pl="Warstwa operacyjna"
            en="Operational layer"
          />
        }
        summary={
          <Localized
            pl="Te przykłady są interaktywne i testowane: fokus startowy, akcje, link oraz listbox z aktywną opcją."
            en="These examples are interactive and tested: initial focus, actions, link and listbox with active option."
          />
        }
      >
        <div className="pd-f0-accessibility-lab">
          <article>
            <header>
              <h3>
                <Localized
                  pl="Focus-visible na kontrolkach"
                  en="Focus-visible on controls"
                />
              </h3>
              <p>
                <Localized
                  pl="Fokus jest widoczny tylko wtedy, gdy użytkownik porusza się klawiaturą lub technologią wspierającą."
                  en="Focus is visible when the user navigates with keyboard or assistive technology."
                />
              </p>
              <TokenCode>:focus-visible</TokenCode>
            </header>
            <FocusActions />
          </article>

          <article>
            <header>
              <h3>
                <Localized
                  pl="Listbox z aktywną opcją"
                  en="Listbox with active option"
                />
              </h3>
              <p>
                <Localized
                  pl="Wybrany element i aktywny element klawiatury są pokazane osobno."
                  en="Selected item and keyboard-active item are represented separately."
                />
              </p>
              <TokenCode>role="listbox"</TokenCode>
            </header>
            <AccessibleListbox />
          </article>
        </div>
      </Section>

      <Section
        title={
          <Localized
            pl="Kontrakt systemowy"
            en="System contract"
          />
        }
        summary={
          <Localized
            pl="Każda nowa kontrolka przechodzi przez te warstwy zanim trafi do wzorców produktu."
            en="Every new control passes through these layers before it enters product patterns."
          />
        }
      >
        <div className="pd-f0-accessibility-layer-grid" id="screen-reader-contract">
          {accessibilityLayerRows.map((row) => (
            <article key={row.key} data-a11y-layer={row.key}>
              <span aria-hidden="true" />
              <div>
                <strong>{readLocale() === 'en' ? row.titleEn : row.titlePl}</strong>
                <p>
                  {readLocale() === 'en'
                    ? row.descriptionEn
                    : row.descriptionPl}
                </p>
                <TokenCode>{row.token}</TokenCode>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title={
          <Localized
            pl="Dowody w komponentach"
            en="Evidence in components"
          />
        }
        summary={
          <Localized
            pl="Kontrakt jest widoczny w realnych fragmentach UI, nie tylko w opisie."
            en="The contract appears in real UI fragments, not only in copy."
          />
        }
      >
        <div className="pd-f0-accessibility-evidence">
          <article>
            <h3>
              <Localized pl="Nazwy kontrolek" en="Control names" />
            </h3>
            <button
              className="pd-f0-icon-action"
              aria-label={readLocale() === 'en'
                ? 'Search Help Center'
                : 'Szukaj w Centrum Pomocy'}
              type="button"
            >
              <Icon name="search" size={20} />
            </button>
            <p>
              <Localized
                pl="Icon-only action ma jawną nazwę dostępną."
                en="An icon-only action has an explicit accessible name."
              />
            </p>
          </article>
          <article>
            <h3>
              <Localized pl="Komunikat dynamiczny" en="Dynamic announcement" />
            </h3>
            <div aria-live="polite" role="status">
              <Localized
                pl="Synchronizacja zakończona. Zaktualizowano 128 rekordów."
                en="Synchronization completed. 128 records updated."
              />
            </div>
          </article>
          <article>
            <h3>
              <Localized pl="Status tekstowy" en="Text status" />
            </h3>
            <StatusPill tone="warning">
              <Localized pl="Dane opóźnione" en="Data delayed" />
            </StatusPill>
            <p>
              <Localized
                pl="Kolor wspiera tekst, ale go nie zastępuje."
                en="Color supports the text but does not replace it."
              />
            </p>
          </article>
          <article>
            <h3>Reflow 200%</h3>
            <p className="pd-f0-reflow-copy">
              <Localized
                pl="Bardzo długa rekomendacja biznesowa pozostaje czytelna bez poziomego skalowania całego interfejsu."
                en="A very long business recommendation remains readable without horizontally scaling the entire interface."
              />
            </p>
          </article>
        </div>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const primary = canvas.getByRole('button', {
      name: /Zastosuj filtr|Apply filter/,
    });

    await expect(primary).toHaveFocus();

    const channelTrigger = canvas.getByRole('button', {
      name: /Kanał\s+CRM|Channel\s+CRM/,
    });

    await userEvent.click(channelTrigger);
    await expect(
      canvas.queryByRole('listbox', {
        name: /Kanał danych|Data channel/,
      }),
    ).not.toBeInTheDocument();

    await userEvent.click(channelTrigger);

    const listbox = canvas.getByRole('listbox', {
      name: /Kanał danych|Data channel/,
    });

    await expect(listbox).toHaveFocus();
    await expect(listbox).toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(channelTrigger).toHaveFocus();

    primary.focus();
    await expect(primary).toHaveFocus();
  },
};
