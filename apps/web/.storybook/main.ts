// PapaData Storybook core web-only whitelist.
// UI Storybook laduje tylko dopracowane sekcje web/runtime.
// Pozostale stories zostaja w repo jako material kontraktowy/checkowy.
import type {
  StorybookConfig,
} from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/storybook-next/stories/25-access-registration-onboarding/AuthSurfaces.stories.tsx",
    "../src/storybook-next/stories/30-command-center/CommandCenterLandingSections.stories.tsx",
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

    return config;
  },

};

export default config;
