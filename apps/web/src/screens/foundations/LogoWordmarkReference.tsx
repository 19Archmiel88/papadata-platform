import type { CSSProperties } from 'react';
import { useState } from 'react';

import {
  AppHeader,
  PapaDataBrand,
  PapaDataSignet,
  PapaDataWordmark,
} from '../../design-system';

import '../../design-system/foundations/papadata-brand-surface.css';
import './logo-wordmark-reference.css';

type LogoReferenceTheme = 'light' | 'dark';

type LogoWordmarkReferenceProps = {
  initialTheme?: LogoReferenceTheme;
};

function LogoWordmarkReference({
  initialTheme = 'light',
}: LogoWordmarkReferenceProps) {
  return (
    <LogoWordmarkReferenceState
      initialTheme={initialTheme}
      key={initialTheme}
    />
  );
}

function LogoWordmarkReferenceState({
  initialTheme,
}: Required<LogoWordmarkReferenceProps>) {
  const [theme, setTheme] =
    useState<LogoReferenceTheme>(initialTheme);

  return (
    <div
      className="pds-brand-surface pds-foundation-stage pds-final-brand-reference"
      data-theme={theme}
      lang="pl"
    >
      <AppHeader
        onThemeChange={setTheme}
        theme={theme}
      />

      <main className="pds-foundation-main pds-final-brand-main">
        <header className="pds-final-brand-hero">
          <span className="pds-foundation-kicker">
            Podstawy marki
          </span>

          <h1>Logo i znak</h1>

          <p>
            Finalna konstrukcja marki PapaData: segmentowa litera P,
            trzy rosnące słupki danych i dwuczęściowy wordmark.
          </p>
        </header>

        <section
          aria-labelledby="final-lockup-title"
          className="pds-final-brand-section"
        >
          <div className="pds-final-brand-heading">
            <div>
              <span>Logo podstawowe</span>
              <h2 id="final-lockup-title">
                Znak poziomy
              </h2>
            </div>

            <p>
              Podstawowy wariant przeznaczony do aplikacji,
              dokumentów, prezentacji i komunikacji marki.
            </p>
          </div>

          <div className="pds-final-brand-lockup-stage">
            <PapaDataBrand className="pds-brand pds-final-brand-lockup" />
          </div>
        </section>

        <section
          aria-labelledby="elements-title"
          className="pds-final-brand-section"
        >
          <div className="pds-final-brand-heading">
            <div>
              <span>Budowa</span>
              <h2 id="elements-title">
                Elementy systemu
              </h2>
            </div>

            <p>
              Sygnet i wordmark mogą działać wspólnie albo jako
              niezależne elementy identyfikacji.
            </p>
          </div>

          <div className="pds-final-brand-elements">
            <article>
              <span>Sygnet</span>

              <PapaDataSignet className="pds-final-brand-signet" />

              <p>
                Segmentowe P reprezentuje strukturę danych. Trzy
                słupki komunikują skalę, wynik i wzrost.
              </p>
            </article>

            <article>
              <span>Wordmark</span>

              <PapaDataWordmark className="pds-wordmark pds-final-brand-wordmark" />

              <p>
                Papa zachowuje ciemny, stabilny charakter. Data
                otrzymuje turkusowy akcent analityczny.
              </p>
            </article>
          </div>
        </section>

        <section
          aria-labelledby="sizes-title"
          className="pds-final-brand-section"
        >
          <div className="pds-final-brand-heading">
            <div>
              <span>Skala</span>
              <h2 id="sizes-title">
                Czytelność sygnetu
              </h2>
            </div>

            <p>
              Wariant micro jest używany od 16 do 32 px.
              Pełna geometria pozostaje dla większych zastosowań.
            </p>
          </div>

          <div className="pds-final-brand-sizes">
            {[16, 24, 32, 48, 72, 112].map((size) => (
              <div key={size}>
                <span>{size} px</span>

                <div
                  className="pds-final-brand-size-wrapper"
                  style={{
                    '--pds-final-logo-size': `${size}px`,
                  } as CSSProperties}
                >
                  <PapaDataSignet
                    className="pds-final-brand-size"
                    variant={size <= 32 ? 'micro' : 'full'}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="variants-title"
          className="pds-final-brand-section"
        >
          <div className="pds-final-brand-heading">
            <div>
              <span>Warianty</span>
              <h2 id="variants-title">
                Kolor i redukcja
              </h2>
            </div>

            <p>
              Wersja monochromatyczna zachowuje pełną geometrię
              sygnetu i hierarchię znaku tekstowego.
            </p>
          </div>

          <div className="pds-final-brand-variants">
            <article>
              <span>Podstawowy</span>
              <PapaDataBrand />
            </article>

            <article className="pds-final-brand-variant-mono">
              <span>Monochromatyczny</span>
              <PapaDataBrand tone="monochrome" />
            </article>

            <article className="pds-final-brand-variant-inverse">
              <span>Odwrócony</span>
              <PapaDataBrand />
            </article>
          </div>
        </section>

        <section
          aria-labelledby="rules-title"
          className="pds-final-brand-section"
        >
          <div className="pds-final-brand-heading">
            <div>
              <span>Zasady</span>
              <h2 id="rules-title">
                Stosowanie logo
              </h2>
            </div>

            <p>
              Logo pozostaje płaskim znakiem wektorowym. Efekty
              przestrzenne dotyczą wyłącznie konstrukcji słupków.
            </p>
          </div>

          <div className="pds-final-brand-rules">
            <div>
              <h3>Stosuj</h3>

              <ul>
                <li>Oryginalne proporcje sygnetu i znaku tekstowego.</li>
                <li>Wariant dopasowany do kontrastu tła.</li>
                <li>Wersję monochromatyczną przy jednym kolorze.</li>
                <li>Minimalną przestrzeń ochronną równą szerokości słupka.</li>
              </ul>
            </div>

            <div>
              <h3>Nie stosuj</h3>

              <ul>
                <li>Zmiany proporcji albo obracania znaku.</li>
                <li>Dodawania strzałek i dodatkowych symboli.</li>
                <li>Zmiany kolejności kolorów słupków.</li>
                <li>Dodawania cienia do całego logotypu.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export { LogoWordmarkReference };
export type { LogoWordmarkReferenceProps };
