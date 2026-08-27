// PapaData Storybook core web-only whitelist.
// UI Storybook laduje tylko dopracowane sekcje web/runtime.
// Pozostale stories zostaja w repo jako material kontraktowy/checkowy.
import tailwindcss from '@tailwindcss/vite';
import type {
  StorybookConfig,
} from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/storybook-next/stories/20-product-shell/ProductShell.stories.tsx",
    "../src/storybook-next/stories/25-access-registration-onboarding/AuthSurfaces.stories.tsx",
    "../src/storybook-next/stories/30-command-center/CommandCenterLandingSections.stories.tsx",
    "../src/storybook-next/stories/40-integrations/Integrations.stories.tsx",
    "../src/storybook-next/stories/40-papa-assistant/*.stories.tsx",
    "../src/storybook-next/stories/50-papa-assistant/Papa.stories.tsx",
    "../src/storybook-next/stories/70-subscription-billing/Billing.stories.tsx",
    "../src/storybook-next/stories/90-papa-assistant-flows/*.stories.tsx",
  ],

  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  staticDirs: [
    '../public',
  ],
  viteFinal: async (config) => {
    config.build = {
      ...config.build,
      chunkSizeWarningLimit: 1500,
    };
    config.plugins = [
      ...(config.plugins ?? []),
      tailwindcss(),
    ];

    return config;
  },

};

export default config;
