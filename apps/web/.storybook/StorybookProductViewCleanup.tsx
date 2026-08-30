import {
  type ReactNode,
  useLayoutEffect,
} from 'react';

type StorybookProductViewCleanupProps = {
  children: ReactNode;
};

const HIDDEN_ATTRIBUTE =
  'data-pd-storybook-product-chrome-hidden';

const CANDIDATE_SELECTOR = [
  'header',
  'nav',
  'footer',
  'aside',
  'section',
  'article',
  'div',
  '[role="alert"]',
  '[role="status"]',
  '[role="navigation"]',
].join(',');

/**
 * Każda grupa opisuje jeden techniczny/demo element UI.
 *
 * Wszystkie markery z grupy muszą wystąpić w tym samym kontenerze,
 * dzięki czemu nie chowamy właściwej zawartości biznesowej tylko
 * dlatego, że używa np. tekstu "Wsparcie w marketingu".
 */
const CHROME_GROUPS: readonly string[][] = [
  /**
   * Kampanie / marketing:
   * opisowy hero Centrum Zarządzania Kapitałem Marketingowym.
   *
   * Funkcjonalność, dane, KPI i właściwa sekcja pozostają.
   * Chowamy wyłącznie banner wprowadzający.
   */
  [
    'Centrum Zarządzania Kapitałem Marketingowym',
    'Ile wydajemy',
    'Break-even ROAS',
    'Target ROAS',
  ],

  /**
   * Ruch / Traffic:
   * demonstracyjny pasek filtrowania widoku.
   *
   * Chowamy tylko ten wrapper na canvasie.
   * Dane i właściwa zawartość modułu zostają.
   */
  [
    'Okres:',
    'Porównanie:',
    'Kanał:',
    'Urządzenie:',
  ],

  /**
   * Ruch / Traffic:
   * demonstracyjny opis zakresu modułu.
   */
  [
    'Zakres:',
    'Analiza zachowania Onsite (GA4)',
    'Kampanie Płatne (ID-2)',
  ],

  /**
   * Ruch / Traffic:
   * techniczny nagłówek modułu.
   */
  [
    'Ruch na stronie',
    'GA4 Status:',
    'Pokrycie zakupów:',
  ],

  /**
   * Ruch / Traffic:
   * techniczny provenance banner.
   */
  [
    'Website & Commerce Traffic Intelligence (ID-6)',
    'Data Provenance:',
  ],

  /**
   * Wsparcie w marketingu:
   * demonstracyjne menu sekcji.
   */
  [
    'Centrum Dowodzenia',
    'Aktywne Sprawy',
    'Nowy Brief',
    'Wyniki & Rekomendacje',
    'Specyfikacja & RBAC',
  ],

  /**
   * Wsparcie w marketingu:
   * techniczny nagłówek środowiska/workspace.
   */
  [
    'Wsparcie w marketingu',
    'ID-11',
    'Marketing Advisory & Execution Support',
    'Rola:',
  ],

  /**
   * Wsparcie w marketingu:
   * hero/intro sekcji widoczny na canvasie.
   *
   * Sama sekcja i jej funkcjonalnosc pozostaja.
   */
  [
    'Wsparcie w marketingu',
    'Uzyskaj ustrukturyzowaną rekomendację',
    'Poproś o rekomendację',
  ],

  /**
   * Ustawienia:
   * demonstracyjna nawigacja wszystkich sekcji ustawień.
   *
   * Sekcje pozostają w Storybooku i kodzie.
   * Chowamy wyłącznie poziomy pasek nawigacyjny na canvasie.
   */
  [
    'KONTO:',
    'Moje konto',
    'Bezpieczeństwo',
    'WORKSPACE:',
    'Firma i workspace',
    'Zespół i uprawnienia',
    'Analityka i cele',
    'Papa AI',
  ],

  /**
   * Ustawienia:
   * techniczny header canonical/workspace.
   */
  [
    'Ustawienia Workspace & Governance Center',
    'ID-9 Canonical',
    'Workspace:',
    'rev:',
  ],

  /**
   * Ustawienia:
   * pasek audytowy / architektoniczny.
   */
  [
    'AUDYT AUD-2026',
    'Ground Truth Policy Active',
    'Zobacz Raport Audytu',
  ],

  /**
   * Integracje:
   * techniczny status SSE / limit źródeł.
   */
  [
    'Konsola SSE Stream',
    'Limit planu:',
    'Odśwież status',
  ],

  /**
   * Integracje:
   * stopka specyfikacji technicznej.
   */
  [
    'Specyfikacja Integracji ID-8 target-state',
    'Architektura API:',
  ],

  /**
   * Papa Asystent:
   * header laboratorium / buildera.
   */
  [
    'Papa Asystent',
    'AI Analytics & Builder',
    'Studio Wykresów: Gotowe do projektowania',
  ],

  /**
   * Papa Asystent:
   * pozioma lista sekcji laboratorium.
   */
  [
    'Koncepcja',
    'AssistantShell (UI)',
    'Context Basket',
    'DecisionQueue',
    'Pewność & Odmowy',
    'Studio Wykresów',
  ],

  /**
   * Papa Asystent:
   * techniczna stopka modułu.
   */
  [
    'PapaData Platform',
    '2026 Papa Asystent Module',
    'EU AI Act Article 50',
    'Recharts Storybook',
  ],
];

/**
 * Samodzielne komunikaty/toasty widoczne na screenach.
 */
const SINGLE_CHROME_MARKERS: readonly string[] = [
  'Sekcja Ruch na stronie gotowa',
  'Wygenerowano pełną analizę Papa AI dla mobile drop',
  'Sekcja Wsparcie w marketingu gotowa',
  'Centrum Pomocy gotowe',
];

function normalizeText(
  value: string | null | undefined,
): string {
  return (value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('pl');
}

function getText(
  element: HTMLElement,
): string {
  return normalizeText(
    element.textContent,
  );
}

function containsMarker(
  text: string,
  marker: string,
): boolean {
  return text.includes(
    normalizeText(marker),
  );
}

function containsAllMarkers(
  element: HTMLElement,
  markers: readonly string[],
): boolean {
  const text = getText(
    element,
  );

  if (!text) {
    return false;
  }

  return markers.every(
    (marker) =>
      containsMarker(
        text,
        marker,
      ),
  );
}

function isCanvasRoot(
  element: HTMLElement,
): boolean {
  return element.classList.contains(
    'pd-storybook-canvas',
  );
}

/**
 * Znajduje najmniejszy kontener, który zawiera cały zestaw markerów.
 *
 * Następnie rozszerza go o wrappery mające dokładnie tę samą treść,
 * żeby nie został pusty border/background po ukryciu wewnętrznego DIV-a.
 */
function findGroupContainer(
  root: HTMLElement,
  markers: readonly string[],
): HTMLElement | null {
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(
      CANDIDATE_SELECTOR,
    ),
  )
    .filter(
      (element) =>
        !isCanvasRoot(element) &&
        containsAllMarkers(
          element,
          markers,
        ),
    )
    .sort(
      (left, right) => {
        const leftText =
          getText(left);

        const rightText =
          getText(right);

        return (
          leftText.length -
          rightText.length
        );
      },
    );

  let current =
    candidates[0] ?? null;

  if (!current) {
    return null;
  }

  const initialText =
    getText(current);

  while (
    current.parentElement &&
    current.parentElement !== root
  ) {
    const parent =
      current.parentElement;

    if (
      !(parent instanceof HTMLElement)
    ) {
      break;
    }

    if (
      isCanvasRoot(parent)
    ) {
      break;
    }

    if (
      getText(parent) !==
      initialText
    ) {
      break;
    }

    current = parent;
  }

  return current;
}

function findSingleMarkerContainer(
  root: HTMLElement,
  marker: string,
): HTMLElement | null {
  const normalizedMarker =
    normalizeText(marker);

  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(
      CANDIDATE_SELECTOR,
    ),
  )
    .filter(
      (element) => {
        if (
          isCanvasRoot(element)
        ) {
          return false;
        }

        const text =
          getText(element);

        if (
          !text.includes(
            normalizedMarker,
          )
        ) {
          return false;
        }

        /**
         * Toast/komunikat powinien być małym kontenerem.
         * Chroni to przed wybraniem całej strony, która również
         * pośrednio zawiera dany tekst.
         */
        return (
          text.length <=
          normalizedMarker.length +
            180
        );
      },
    )
    .sort(
      (left, right) =>
        getText(left).length -
        getText(right).length,
    );

  let current =
    candidates[0] ?? null;

  if (!current) {
    return null;
  }

  const initialText =
    getText(current);

  while (
    current.parentElement &&
    current.parentElement !== root
  ) {
    const parent =
      current.parentElement;

    if (
      !(parent instanceof HTMLElement)
    ) {
      break;
    }

    if (
      isCanvasRoot(parent)
    ) {
      break;
    }

    const parentText =
      getText(parent);

    if (
      parentText !== initialText
    ) {
      break;
    }

    current = parent;
  }

  return current;
}

function markHidden(
  element: HTMLElement,
): void {
  element.setAttribute(
    HIDDEN_ATTRIBUTE,
    'true',
  );
}

function hideExactTechnicalMessage(
  root: HTMLElement,
  marker: string,
): void {
  const expected =
    normalizeText(marker);

  const elements = Array.from(
    root.querySelectorAll<HTMLElement>(
      '*',
    ),
  );

  for (const element of elements) {
    if (
      isCanvasRoot(element)
    ) {
      continue;
    }

    if (
      getText(element) !==
      expected
    ) {
      continue;
    }

    let target =
      element;

    let depth = 0;

    while (
      target.parentElement &&
      target.parentElement !== root &&
      depth < 4 &&
      getText(
        target.parentElement,
      ) === expected
    ) {
      target =
        target.parentElement;

      depth += 1;
    }

    markHidden(
      target,
    );

    return;
  }
}

function clearPreviousMarks(
  root: HTMLElement,
): void {
  root
    .querySelectorAll<HTMLElement>(
      `[${HIDDEN_ATTRIBUTE}]`,
    )
    .forEach(
      (element) => {
        element.removeAttribute(
          HIDDEN_ATTRIBUTE,
        );
      },
    );
}

function ensureStyle(): void {
  const id =
    'pd-storybook-product-view-cleanup-style';

  if (
    document.getElementById(id)
  ) {
    return;
  }

  const style =
    document.createElement(
      'style',
    );

  style.id = id;

  style.textContent = `
    [${HIDDEN_ATTRIBUTE}="true"] {
      display: none !important;
    }
  `;

  document.head.appendChild(
    style,
  );
}

function cleanStorybookProductView(): void {
  const root =
    document.querySelector<HTMLElement>(
      '.pd-storybook-canvas',
    );

  if (!root) {
    return;
  }

  clearPreviousMarks(
    root,
  );

  for (
    const markers
    of CHROME_GROUPS
  ) {
    const container =
      findGroupContainer(
        root,
        markers,
      );

    if (container) {
      markHidden(
        container,
      );
    }
  }

  for (
    const marker
    of SINGLE_CHROME_MARKERS
  ) {
    hideExactTechnicalMessage(
      root,
      marker,
    );
  }
}

export function StorybookProductViewCleanup({
  children,
}: StorybookProductViewCleanupProps) {
  useLayoutEffect(
    () => {
      ensureStyle();

      let frame = 0;

      const scheduleCleanup = () => {
        window.cancelAnimationFrame(
          frame,
        );

        frame =
          window.requestAnimationFrame(
            () => {
              cleanStorybookProductView();
            },
          );
      };

      scheduleCleanup();

      const observer =
        new MutationObserver(
          () => {
            scheduleCleanup();
          },
        );

      observer.observe(
        document.body,
        {
          childList: true,
          subtree: true,
          characterData: true,
        },
      );

      return () => {
        observer.disconnect();

        window.cancelAnimationFrame(
          frame,
        );
      };
    },
    [],
  );

  return children;
}
