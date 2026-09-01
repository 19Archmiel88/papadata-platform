// PapaData Storybook core web-only whitelist.
// UI Storybook laduje tylko dopracowane sekcje web/runtime.
// Pozostale stories zostaja w repo jako material kontraktowy/checkowy.
import tailwindcss from '@tailwindcss/vite';
import type {
  StorybookConfig,
} from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/design-system/icons/*.stories.tsx",
    "../src/design-system/foundations/**/*.stories.tsx",
    "../src/design-system/components/**/*.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/PageSectionLayout.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/FeedbackStates.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/LoadingOperations.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/FilteredTableActions.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/DestructiveConfirmations.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/ApprovalProtection.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/DetailEvidenceRecommendationPanels.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/ComplexFormsWizards.stories.tsx",
    "../src/storybook-next/stories/18-cross-cutting-patterns/CrossStateMatrix.stories.tsx",
    "../src/storybook-next/stories/20-product-shell/ProductShell.stories.tsx",
    "../src/storybook-next/stories/25-access-registration-onboarding/AuthSurfaces.stories.tsx",
    "../src/storybook-next/stories/30-command-center/*.stories.tsx",
    "../src/storybook-next/stories/31-paid-campaigns/*.stories.tsx",
    "../src/storybook-next/stories/32-orders/*.stories.tsx",
    "../src/storybook-next/stories/33-products/*.stories.tsx",
    "../src/storybook-next/stories/34-customers/*.stories.tsx",
    "../src/storybook-next/stories/35-traffic-funnel/*.stories.tsx",
    "../src/storybook-next/stories/36-marketing-support/*.stories.tsx",
    "../src/storybook-next/stories/37-help-center/*.stories.tsx",
    "../src/storybook-next/stories/38-settings-governance/*.stories.tsx",
    "../src/storybook-next/stories/39-subscription-billing/*.stories.tsx",
    "../src/storybook-next/stories/40-integrations/*.stories.tsx",
    "../src/storybook-next/stories/40-papa-assistant/*.stories.tsx",
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
