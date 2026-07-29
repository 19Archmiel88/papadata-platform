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

  return <Story />;
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
      name: 'Jezyk',
      description: 'Jezyk interfejsu',
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
      name: 'Gestosc',
      description: 'Gestosc interfejsu',
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
            title: 'Pelne',
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
      test: 'error',
    },

    viewport: {
      options: {
        desktopWide: {
          name: 'Duzy ekran',
          styles: {
            width: '1920px',
            height: '1080px',
          },
          type: 'desktop',
        },

        desktopStandard: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '1024px',
          },
          type: 'desktop',
        },

        tablet: {
          name: 'Tablet',
          styles: {
            width: '834px',
            height: '1194px',
          },
          type: 'tablet',
        },

        mobile: {
          name: 'Telefon',
          styles: {
            width: '390px',
            height: '844px',
          },
          type: 'mobile',
        },
      },
    },
  },
};

export default preview;
