/// <reference types="vite/client" />

import type {
  Decorator,
  Preview,
} from '@storybook/react-vite';

import {
  applyPapaDataRuntimeGlobals,
  normalizePapaDataRuntimeGlobals,
} from '../src/design-system/foundations/runtime';
import '../src/design-system/foundations/foundations.css';

const withPapaDataRuntime: Decorator = (
  Story,
  context,
) => {
  const runtimeGlobals =
    normalizePapaDataRuntimeGlobals({
      theme: context.globals.theme,
      locale: context.globals.locale,
      density: context.globals.density,
      motion: context.globals.motion,
    });

  if (typeof document !== 'undefined') {
    applyPapaDataRuntimeGlobals(
      document.documentElement,
      runtimeGlobals,
    );
  }

  const canvasKey = [
    runtimeGlobals.theme,
    runtimeGlobals.locale,
    runtimeGlobals.density,
    runtimeGlobals.motion,
  ].join(':');

  return (
    <div
      className="pd-storybook-canvas"
      data-density={runtimeGlobals.density}
      data-locale={runtimeGlobals.locale}
      data-motion={runtimeGlobals.motion}
      data-theme={runtimeGlobals.theme}
      key={canvasKey}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [
    withPapaDataRuntime,
  ],

  globalTypes: {
    theme: {
      name: 'Motyw',
      description: 'Motyw interfejsu',
      toolbar: {
        icon: 'paintbrush',
        items: [
          {
            value: 'light',
            title: 'Jasny',
          },
          {
            value: 'dark',
            title: 'Ciemny',
          },
        ],
      },
    },

    locale: {
      name: 'Język',
      description: 'Język interfejsu',
      toolbar: {
        icon: 'globe',
        items: [
          {
            value: 'pl',
            title: 'PL',
          },
          {
            value: 'en',
            title: 'EN',
          },
        ],
      },
    },

    density: {
      name: 'Gęstość',
      description: 'Gęstość interfejsu',
      toolbar: {
        icon: 'sidebar',
        items: [
          {
            value: 'comfortable',
            title: 'Wygodna',
          },
          {
            value: 'compact',
            title: 'Kompaktowa',
          },
        ],
      },
    },

    motion: {
      name: 'Animacje',
      description: 'Poziom animacji',
      toolbar: {
        icon: 'play',
        items: [
          {
            value: 'full',
            title: 'Pełne',
          },
          {
            value: 'reduced',
            title: 'Ograniczone',
          },
        ],
      },
    },
  },

  initialGlobals: {
    theme: 'light',
    locale: 'pl',
    density: 'comfortable',
    motion: 'full',
  },

  parameters: {
    layout: 'fullscreen',

    a11y: {
      disable: true,
      test: "off",
    },

    options: {
      storySort: {
        order: [
          '00 Fundamenty',
          [
            '01 Fundamenty wizualne',
            [
              'Kierunek wizualny',
              'Kolory semantyczne',
              'Typografia',
              'Role semantyczne statusów',
              'Odstępy i siatka',
              'Promienie i geometria',
              'Linie i separacja',
              'Głębia i warstwy',
              'Ikonografia',
              'Animacje',
              'Dostępność',
            ],
            '02 Powierzchnie i komunikaty',
            [
              'Canvas, tło i powierzchnie',
              'Komunikat w kontekście',
              'Status obiektu',
              'Toast operacyjny',
              'Stany puste, błędy i blokady',
            ],
            '03 Marka',
            '04 Ikony',
            '05 Akcje i wejścia',
            [
              'Przyciski i akcje',
              'Pola tekstowe i formularzowe',
            ],
          ],
          '05 Laboratorium decyzji',
          '15 Wykresy i dane',
          '18 Wzorce interfejsu',
        ],
      },
    },

    viewport: {
      options: {
        desktopWide: {
          name: 'Duży ekran — 1920 × 1080',
          styles: {
            width: '1920px',
            height: '1080px',
          },
          type: 'desktop',
        },

        desktopReview: {
          name: 'Desktop — 1440 × 1600',
          styles: {
            width: '1440px',
            height: '1600px',
          },
          type: 'desktop',
        },

        tabletReview: {
          name: 'Tablet — 768 × 1400',
          styles: {
            width: '768px',
            height: '1400px',
          },
          type: 'tablet',
        },

        mobileReview: {
          name: 'Telefon — 390 × 1200',
          styles: {
            width: '390px',
            height: '1200px',
          },
          type: 'mobile',
        },
      },
    },
  },
};

export default preview;
