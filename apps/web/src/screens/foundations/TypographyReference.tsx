import { useState } from 'react';

import { AppHeader } from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';

type TypographyTheme = 'light' | 'dark';

type TypographyReferenceProps = {
  initialTheme?: TypographyTheme;
};

type TypographyScaleItem = {
  className:
    | 'display'
    | 'page'
    | 'section'
    | 'element'
    | 'body'
    | 'interface'
    | 'label'
    | 'helper';
  lineHeight: string;
  role: string;
  sample: string;
  size: string;
  token: string;
  weight: string;
};

const typographyScale: readonly TypographyScaleItem[] = [
  {
    className: 'display',
    lineHeight: '1.15',
    role: 'Nagłówek główny',
    sample: 'Bezpieczny dostęp do danych',
    size: '36 px',
    token: '--pds-type-display',
    weight: '500',
  },
  {
    className: 'page',
    lineHeight: '1.20',
    role: 'Nagłówek strony',
    sample: 'Dashboard',
    size: '32 px',
    token: '--pds-type-page',
    weight: '500',
  },
  {
    className: 'section',
    lineHeight: '1.25',
    role: 'Nagłówek sekcji',
    sample: 'Potwierdź adres e-mail',
    size: '24 px',
    token: '--pds-type-section',
    weight: '500',
  },
  {
    className: 'element',
    lineHeight: '1.35',
    role: 'Nagłówek elementu',
    sample: 'Ostatnie zamówienia',
    size: '18 px',
    token: '--pds-type-element',
    weight: '500',
  },
  {
    className: 'body',
    lineHeight: '1.60',
    role: 'Tekst podstawowy',
    sample:
      'Dane obejmują zakończone zamówienia z ostatnich 30 dni.',
    size: '16 px',
    token: '--pds-type-body',
    weight: '400',
  },
  {
    className: 'interface',
    lineHeight: '1.50',
    role: 'Tekst interfejsu',
    sample: 'Dane z ostatniej synchronizacji',
    size: '14 px',
    token: '--pds-type-interface',
    weight: '400',
  },
  {
    className: 'label',
    lineHeight: '1.35',
    role: 'Etykieta',
    sample: 'Adres e-mail',
    size: '14 px',
    token: '--pds-type-label',
    weight: '500',
  },
  {
    className: 'helper',
    lineHeight: '1.45',
    role: 'Tekst pomocniczy',
    sample: 'Minimum 8 znaków',
    size: '12 px',
    token: '--pds-type-helper',
    weight: '400',
  },
];

function TypographyReference({
  initialTheme = 'dark',
}: TypographyReferenceProps) {
  return (
    <TypographyReferenceState
      initialTheme={initialTheme}
      key={initialTheme}
    />
  );
}

function TypographyReferenceState({
  initialTheme,
}: Required<TypographyReferenceProps>) {
  const [theme, setTheme] =
    useState<TypographyTheme>(initialTheme);

  return (
    <div
      className="pds-brand-surface pds-foundation-stage pds-typography-reference"
      data-theme={theme}
      lang="pl"
    >
      <AppHeader
        onThemeChange={setTheme}
        theme={theme}
      />

      <main className="pds-foundation-main pds-typography-main">
        <header className="pds-typography-hero">
          <span className="pds-foundation-kicker">
            Podstawy marki
          </span>

          <h1>Typografia</h1>

          <p>
            Kanoniczna skala tekstu używana w interfejsie,
            formularzach, stanach systemowych i danych
            analitycznych PapaData.
          </p>
        </header>

        <section
          aria-labelledby="typeface-title"
          className="pds-typography-typeface"
        >
          <div className="pds-typography-section-heading">
            <div>
              <span>Fundament</span>
              <h2 id="typeface-title">Krój podstawowy</h2>
            </div>

            <p>
              Jeden krój dla produktu, danych i dokumentacji
              interfejsu.
            </p>
          </div>

          <div className="pds-typography-typeface-grid">
            <div className="pds-typography-font-preview">
              <span>Inter</span>
              <p>Aa Bb Cc 0123456789</p>
            </div>

            <dl className="pds-typography-properties">
              <div>
                <dt>Rodzina</dt>
                <dd>Inter, system-ui, sans-serif</dd>
              </div>

              <div>
                <dt>Wagi podstawowe</dt>
                <dd>400 i 500</dd>
              </div>

              <div>
                <dt>Waga wyróżniająca</dt>
                <dd>600 wyłącznie dla wybranych danych</dd>
              </div>

              <div>
                <dt>Odstęp liter</dt>
                <dd>0 — bez ściskania tekstu</dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          aria-labelledby="scale-title"
          className="pds-typography-section"
        >
          <div className="pds-typography-section-heading">
            <div>
              <span>Skala</span>
              <h2 id="scale-title">Hierarchia tekstu</h2>
            </div>

            <p>
              Każda rola ma określony rozmiar, wagę i wysokość
              linii.
            </p>
          </div>

          <div className="pds-type-scale">
            {typographyScale.map((item) => (
              <article
                className="pds-type-scale__row"
                key={item.token}
              >
                <div className="pds-type-scale__identity">
                  <span>{item.role}</span>
                  <code>{item.token}</code>
                </div>

                <p
                  className={`pds-type-sample pds-type-sample--${item.className}`}
                >
                  {item.sample}
                </p>

                <dl className="pds-type-scale__metrics">
                  <div>
                    <dt>Rozmiar</dt>
                    <dd>{item.size}</dd>
                  </div>

                  <div>
                    <dt>Waga</dt>
                    <dd>{item.weight}</dd>
                  </div>

                  <div>
                    <dt>Linia</dt>
                    <dd>{item.lineHeight}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="numbers-title"
          className="pds-typography-section"
        >
          <div className="pds-typography-section-heading">
            <div>
              <span>Dane analityczne</span>
              <h2 id="numbers-title">
                Liczby, wartości i czas
              </h2>
            </div>

            <p>
              Cyfry tabelaryczne stabilizują kolumny, KPI i
              zmieniające się wartości.
            </p>
          </div>

          <div className="pds-typography-numbers">
            <div>
              <span>Przychód</span>
              <p>1 248 932,40 zł</p>
            </div>

            <div>
              <span>Zmiana dodatnia</span>
              <p>+18,7%</p>
            </div>

            <div>
              <span>Wolumen</span>
              <p>2 491 zamówień</p>
            </div>

            <div>
              <span>Aktualizacja</span>
              <p>12:48 · 19 lipca 2026</p>
            </div>
          </div>

          <p className="pds-typography-note">
            Kolor może wspierać interpretację, ale tekst, znak
            wartości i opis muszą samodzielnie przekazywać
            znaczenie.
          </p>
        </section>

        <section
          aria-labelledby="interface-title"
          className="pds-typography-section"
        >
          <div className="pds-typography-section-heading">
            <div>
              <span>Interfejs</span>
              <h2 id="interface-title">
                Formularze i komunikaty
              </h2>
            </div>

            <p>
              Przykłady pokazują wyłącznie hierarchię tekstową,
              bez duplikowania komponentów formularzy.
            </p>
          </div>

          <div className="pds-typography-interface">
            <div>
              <span className="pds-type-interface-role">
                Etykieta
              </span>
              <p className="pds-type-interface-label">
                Adres e-mail
              </p>
            </div>

            <div>
              <span className="pds-type-interface-role">
                Wartość
              </span>
              <p className="pds-type-interface-value">
                anna@northstar.example
              </p>
            </div>

            <div>
              <span className="pds-type-interface-role">
                Tekst pomocniczy
              </span>
              <p className="pds-type-interface-helper">
                Użyj adresu przypisanego do organizacji.
              </p>
            </div>

            <div>
              <span className="pds-type-interface-role">
                Błąd
              </span>
              <p className="pds-type-interface-error">
                Wprowadź prawidłowy adres e-mail.
              </p>
            </div>

            <div>
              <span className="pds-type-interface-role">
                Akcja tekstowa
              </span>
              <button
                className="pds-type-interface-action"
                type="button"
              >
                Nie pamiętam hasła
              </button>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="rules-title"
          className="pds-typography-section"
        >
          <div className="pds-typography-section-heading">
            <div>
              <span>Zasady</span>
              <h2 id="rules-title">Stosowanie typografii</h2>
            </div>

            <p>
              Ograniczony zestaw reguł zapobiega przypadkowemu
              różnicowaniu ekranów.
            </p>
          </div>

          <div className="pds-typography-rules">
            <div>
              <h3>Stosuj</h3>
              <ul>
                <li>Wagi 400 i 500 jako standard.</li>
                <li>Krótkie i jednoznaczne nagłówki.</li>
                <li>Naturalną wielkość liter.</li>
                <li>Maksymalnie 60–72 znaki w długiej linii.</li>
                <li>Minimum 12 px dla tekstu interfejsu.</li>
              </ul>
            </div>

            <div>
              <h3>Nie stosuj</h3>
              <ul>
                <li>Wersalików w całych nagłówkach.</li>
                <li>Wag 700, 800 ani 900.</li>
                <li>Ujemnego odstępu liter.</li>
                <li>Pogrubiania całych akapitów.</li>
                <li>Koloru jako jedynego nośnika znaczenia.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export { TypographyReference };
export type { TypographyReferenceProps };
