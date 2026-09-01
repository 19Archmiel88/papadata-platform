/// <reference types="vite/client" />

import { StorybookProductViewCleanup } from './StorybookProductViewCleanup';

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
      <StorybookProductViewCleanup>
        <Story />
      </StorybookProductViewCleanup>
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

    // Project-wide default: the audit runs and is visible in the a11y panel
    // for every story, but doesn't hard-fail the build — most of the
    // catalog hasn't been individually verified against it yet. Areas that
    // have (e.g. Command Center, see CommandCenter.stories.tsx) opt into
    // `test: 'error'` themselves. New stories should not opt back out to
    // 'off'/disable — see docs/specyfikacja-docelowa for the accessibility
    // bar new work is expected to meet.
    a11y: {
      test: 'todo',
    },

    options: {
      // storySort must be written inline here as a fully self-contained
      // function: Storybook statically extracts just this AST node and
      // eval()s it in isolation to build the sidebar order, so it cannot
      // reference any identifier declared elsewhere in this module.
      storySort: (leftEntry, rightEntry) => {
        const rootOrder = [
          'ANALIZA',
          'AI',
          'DANE I INTEGRACJE',
          'ADMINISTRACJA',
          'WSPARCIE',
          'DESIGN SYSTEM',
          'PLATFORMA',
        ];

        const sectionOrder = {
          ANALIZA: [
            'Centrum Dowodzenia',
            'Kampanie płatne',
            'Zamówienia',
            'Produkty',
            'Klienci',
            'Ruch na stronie',
          ],
          AI: ['Laboratorium Papa Asystenta'],
          'DANE I INTEGRACJE': ['Integracje'],
          ADMINISTRACJA: ['Ustawienia', 'Subskrypcja i płatności'],
          WSPARCIE: ['Wsparcie w marketingu', 'Centrum Pomocy'],
          'DESIGN SYSTEM': ['Fundamenty', 'Komponenty', 'Wzorce interfejsu'],
          PLATFORMA: ['Powłoka produktu', 'Dostęp i onboarding'],
        };

        const storyCategoryOrder = ['Całość', 'Sekcje', 'Stany', 'Interakcje', 'Responsive'];

        const polishCollator = new Intl.Collator('pl', {
          numeric: true,
          sensitivity: 'base',
        });

        const normalizeStorySortEntry = (entry) => (Array.isArray(entry) ? entry[1] : entry);

        const configuredIndex = (value, order) => {
          const index = value ? order.indexOf(value) : -1;
          return index === -1 ? order.length : index;
        };

        const left = normalizeStorySortEntry(leftEntry);
        const right = normalizeStorySortEntry(rightEntry);
        const leftPath = (left.title ?? '').split('/');
        const rightPath = (right.title ?? '').split('/');
        const leftRoot = leftPath[0];
        const rightRoot = rightPath[0];

        const rootDifference = configuredIndex(leftRoot, rootOrder) - configuredIndex(rightRoot, rootOrder);
        if (rootDifference !== 0) return rootDifference;

        if (leftRoot === rightRoot && leftRoot) {
          const domainOrder = sectionOrder[leftRoot] ?? [];
          const domainDifference = configuredIndex(leftPath[1], domainOrder) - configuredIndex(rightPath[1], domainOrder);
          if (domainDifference !== 0) return domainDifference;
        }

        const categoryDifference = configuredIndex(leftPath[2], storyCategoryOrder)
          - configuredIndex(rightPath[2], storyCategoryOrder);
        if (categoryDifference !== 0) return categoryDifference;

        const titleDifference = polishCollator.compare(left.title ?? '', right.title ?? '');
        if (titleDifference !== 0) return titleDifference;

        return polishCollator.compare(left.name ?? '', right.name ?? '');
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
