import type { CSSProperties } from 'react';
import { useState } from 'react';

import { AppHeader } from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';
import './spacing-geometry-reference.css';

type SpacingGeometryTheme = 'light' | 'dark';

type SpacingGeometryReferenceProps = {
  initialTheme?: SpacingGeometryTheme;
};

type SpacingToken = {
  description: string;
  pixels: string;
  token: string;
  value: string;
};

type RadiusToken = {
  description: string;
  label: string;
  pixels: string;
  token: string;
  value: string;
};

type ControlHeight = {
  description: string;
  label: string;
  pixels: string;
  value: string;
};

type LayoutWidth = {
  description: string;
  label: string;
  percent: string;
  token: string;
  value: string;
};

const spacingTokens: readonly SpacingToken[] = [
  {
    description: 'Resetowanie odstępu',
    pixels: '0 px',
    token: '--pds-space-0',
    value: '0rem',
  },
  {
    description: 'Korekta optyczna i mały odstęp',
    pixels: '2 px',
    token: '--pds-space-1',
    value: '0.125rem',
  },
  {
    description: 'Minimalny odstęp elementów powiązanych',
    pixels: '4 px',
    token: '--pds-space-2',
    value: '0.25rem',
  },
  {
    description: 'Ikona i tekst lub zwarte elementy',
    pixels: '8 px',
    token: '--pds-space-3',
    value: '0.5rem',
  },
  {
    description: 'Elementy jednej grupy interfejsu',
    pixels: '12 px',
    token: '--pds-space-4',
    value: '0.75rem',
  },
  {
    description: 'Podstawowy odstęp komponentu',
    pixels: '16 px',
    token: '--pds-space-5',
    value: '1rem',
  },
  {
    description: 'Pola, sekcje formularza i grupy akcji',
    pixels: '24 px',
    token: '--pds-space-6',
    value: '1.5rem',
  },
  {
    description: 'Oddzielenie większych bloków treści',
    pixels: '32 px',
    token: '--pds-space-7',
    value: '2rem',
  },
  {
    description: 'Rytm głównych sekcji strony',
    pixels: '48 px',
    token: '--pds-space-8',
    value: '3rem',
  },
];

const radiusTokens: readonly RadiusToken[] = [
  {
    description: 'Tabele, linie danych i obszary bez obudowy',
    label: 'Bez promienia',
    pixels: '0 px',
    token: '0',
    value: '0',
  },
  {
    description: 'Małe elementy, przełączniki i zwarte akcje',
    label: 'Mały',
    pixels: '6 px',
    token: '--pds-radius-sm',
    value: '0.375rem',
  },
  {
    description: 'Pola formularzy i podstawowe powierzchnie',
    label: 'Podstawowy',
    pixels: '10 px',
    token: '--pds-radius-md',
    value: '0.625rem',
  },
  {
    description: 'Statusy, awatary i elementy kapsułowe',
    label: 'Pełny',
    pixels: 'pełny',
    token: '--pds-radius-full',
    value: '999rem',
  },
];

const controlHeights: readonly ControlHeight[] = [
  {
    description: 'Ikony i drugorzędne akcje o małej gęstości',
    label: 'Kompaktowa',
    pixels: '36 px',
    value: '2.25rem',
  },
  {
    description: 'Akcje procesowe i elementy nawigacji',
    label: 'Procesowa',
    pixels: '44 px',
    value: '2.75rem',
  },
  {
    description: 'Pola formularzy i główne przyciski',
    label: 'Podstawowa',
    pixels: '48 px',
    value: '3rem',
  },
];

const layoutWidths: readonly LayoutWidth[] = [
  {
    description: 'Formularze, komunikaty i pojedyncze zadania',
    label: 'Wąska treść',
    percent: '36.7%',
    token: '--pds-content-width-narrow',
    value: '33rem',
  },
  {
    description: 'Standardowa zawartość ekranu produktu',
    label: 'Treść',
    percent: '80%',
    token: '--pds-content-width',
    value: '72rem',
  },
  {
    description: 'Dashboard i rozbudowane analizy',
    label: 'Szeroka treść',
    percent: '91.1%',
    token: '--pds-content-width-wide',
    value: '82rem',
  },
  {
    description: 'Maksymalna szerokość powłoki strony',
    label: 'Strona',
    percent: '100%',
    token: '--pds-max-width-page',
    value: '90rem',
  },
];

function SpacingGeometryReference({
  initialTheme = 'dark',
}: SpacingGeometryReferenceProps) {
  return (
    <SpacingGeometryReferenceState
      initialTheme={initialTheme}
      key={initialTheme}
    />
  );
}

function SpacingGeometryReferenceState({
  initialTheme,
}: Required<SpacingGeometryReferenceProps>) {
  const [theme, setTheme] =
    useState<SpacingGeometryTheme>(initialTheme);

  return (
    <div
      className="pds-brand-surface pds-foundation-stage pds-spacing-reference"
      data-theme={theme}
      lang="pl"
    >
      <AppHeader
        onThemeChange={setTheme}
        theme={theme}
      />

      <main className="pds-foundation-main pds-spacing-main">
        <header className="pds-spacing-hero">
          <span className="pds-foundation-kicker">
            Podstawy marki
          </span>

          <h1>Odstępy i geometria</h1>

          <p>
            Kanoniczny rytm przestrzeni, promienie, wysokości
            kontrolek i szerokości układu stosowane w interfejsie
            PapaData.
          </p>
        </header>

        <section
          aria-labelledby="spacing-scale-title"
          className="pds-spacing-section"
        >
          <div className="pds-spacing-section-heading">
            <div>
              <span>Rytm</span>
              <h2 id="spacing-scale-title">
                Skala odstępów
              </h2>
            </div>

            <p>
              Skala oparta na małych, przewidywalnych krokach.
              Większe wartości powstają przez łączenie tokenów.
            </p>
          </div>

          <div className="pds-spacing-scale">
            {spacingTokens.map((item) => (
              <article
                className="pds-spacing-scale__row"
                key={item.token}
              >
                <div className="pds-spacing-scale__identity">
                  <code>{item.token}</code>
                  <span>{item.description}</span>
                </div>

                <div
                  aria-hidden="true"
                  className="pds-spacing-scale__visual"
                >
                  <span
                    className={
                      item.value === '0rem'
                        ? 'is-zero'
                        : undefined
                    }
                    style={
                      {
                        '--pds-spacing-demo': item.value,
                      } as CSSProperties
                    }
                  />
                </div>

                <dl className="pds-spacing-scale__metrics">
                  <div>
                    <dt>Rem</dt>
                    <dd>{item.value}</dd>
                  </div>

                  <div>
                    <dt>Piksele</dt>
                    <dd>{item.pixels}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="radius-title"
          className="pds-spacing-section"
        >
          <div className="pds-spacing-section-heading">
            <div>
              <span>Kształt</span>
              <h2 id="radius-title">Promienie</h2>
            </div>

            <p>
              Promień określa funkcję elementu. Nie powinien być
              dobierany przypadkowo dla pojedynczego ekranu.
            </p>
          </div>

          <div className="pds-radius-scale">
            {radiusTokens.map((item) => (
              <article
                className="pds-radius-scale__item"
                key={item.token}
              >
                <div
                  aria-hidden="true"
                  className="pds-radius-scale__sample"
                  style={
                    {
                      '--pds-radius-demo': item.value,
                    } as CSSProperties
                  }
                />

                <div className="pds-radius-scale__content">
                  <span>{item.label}</span>
                  <code>{item.token}</code>
                  <p>{item.description}</p>
                  <small>{item.pixels}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="controls-title"
          className="pds-spacing-section"
        >
          <div className="pds-spacing-section-heading">
            <div>
              <span>Kontrolki</span>
              <h2 id="controls-title">
                Wysokości interakcji
              </h2>
            </div>

            <p>
              Wysokość wynika z priorytetu, gęstości oraz sposobu
              obsługi elementu.
            </p>
          </div>

          <div className="pds-control-height-scale">
            {controlHeights.map((item) => (
              <article
                className="pds-control-height-scale__row"
                key={item.label}
              >
                <div>
                  <span>{item.label}</span>
                  <p>{item.description}</p>
                </div>

                <div
                  aria-hidden="true"
                  className="pds-control-height-scale__visual"
                  style={
                    {
                      '--pds-control-demo': item.value,
                    } as CSSProperties
                  }
                >
                  <span />
                </div>

                <dl>
                  <div>
                    <dt>Wartość</dt>
                    <dd>{item.value}</dd>
                  </div>

                  <div>
                    <dt>Piksele</dt>
                    <dd>{item.pixels}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <p className="pds-spacing-note">
            Wartość 48 px jest standardem pól formularzy i głównych
            akcji. Niższe warianty należy stosować tylko w
            kontrolowanym, zwartym kontekście.
          </p>
        </section>

        <section
          aria-labelledby="layout-title"
          className="pds-spacing-section"
        >
          <div className="pds-spacing-section-heading">
            <div>
              <span>Układ</span>
              <h2 id="layout-title">
                Szerokości zawartości
              </h2>
            </div>

            <p>
              Szerokość zależy od rodzaju zadania, nie od dostępnego
              miejsca w oknie.
            </p>
          </div>

          <div className="pds-layout-width-scale">
            {layoutWidths.map((item) => (
              <article
                className="pds-layout-width-scale__row"
                key={item.token}
              >
                <div className="pds-layout-width-scale__identity">
                  <span>{item.label}</span>
                  <code>{item.token}</code>
                  <p>{item.description}</p>
                </div>

                <div
                  aria-hidden="true"
                  className="pds-layout-width-scale__track"
                >
                  <span
                    style={
                      {
                        '--pds-layout-demo': item.percent,
                      } as CSSProperties
                    }
                  />
                </div>

                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="geometry-rules-title"
          className="pds-spacing-section"
        >
          <div className="pds-spacing-section-heading">
            <div>
              <span>Zasady</span>
              <h2 id="geometry-rules-title">
                Stosowanie geometrii
              </h2>
            </div>

            <p>
              Wspólny rytm jest ważniejszy niż lokalne dopasowanie
              pojedynczego elementu.
            </p>
          </div>

          <div className="pds-spacing-rules">
            <div>
              <h3>Stosuj</h3>
              <ul>
                <li>Tokeny odstępów jako pierwszy wybór.</li>
                <li>Jeden rytm pionowy w obrębie sekcji.</li>
                <li>48 px dla podstawowych kontrolek formularza.</li>
                <li>Promień wynikający z funkcji elementu.</li>
                <li>Węższą treść dla zadań wymagających skupienia.</li>
              </ul>
            </div>

            <div>
              <h3>Nie stosuj</h3>
              <ul>
                <li>Przypadkowych wartości między tokenami.</li>
                <li>Innego promienia na każdym ekranie.</li>
                <li>Dużych odstępów wewnątrz jednej grupy.</li>
                <li>Pełnej szerokości dla krótkich formularzy.</li>
                <li>Kart wyłącznie do tworzenia odstępu.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export { SpacingGeometryReference };
export type { SpacingGeometryReferenceProps };
