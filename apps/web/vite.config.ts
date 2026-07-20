/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

function assertProductionMocksDisabled(command: string, mode: string): void {
  const productionBuild = command === 'build' && mode === 'production';
  const mockFlags = [
    process.env.VITE_ENABLE_MSW,
    process.env.VITE_ENABLE_MOCKS,
    process.env.VITE_MSW_ENABLED,
  ];

  if (productionBuild && mockFlags.some((value) => value === 'true')) {
    throw new Error('Production build cannot enable MSW or mock runtime flags.');
  }
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(({ command, mode }) => {
  assertProductionMocksDisabled(command, mode);

  return {
    build: {
      sourcemap: false,
    },
    optimizeDeps: {
      include: [
        '@radix-ui/react-checkbox',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-tooltip',
        'motion/react',
        'valibot',
      ],
    },
    plugins: [react(), tailwindcss()],
    test: {
      projects: [{
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config.
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium',
            }],
          },
        },
      }],
    },
  };
});
