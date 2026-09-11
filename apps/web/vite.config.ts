import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const alias = (packageName: string, relativeSourcePath: string): { find: string; replacement: string } => ({
  find: packageName,
  replacement: fileURLToPath(new URL(relativeSourcePath, import.meta.url)),
});

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],

  resolve: {
    alias: [
      alias('@papadata/contracts/saved-reports', '../../packages/contracts/src/saved-reports.ts'),
      alias('@papadata/contracts/decisions', '../../packages/contracts/src/decisions.ts'),
      alias('@papadata/contracts/campaign-growth', '../../packages/contracts/src/campaign-growth.ts'),
      alias('@papadata/contracts/report-projections', '../../packages/contracts/src/report-projections.ts'),
      alias('@papadata/contracts', '../../packages/contracts/src/index.ts'),
    ],
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:53001',
        changeOrigin: false,
        headers: {
          host: 'papadata.localhost:53001',
          origin: 'https://papadata.localhost',
        },
      },
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },

  build: {
    rolldownOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes('/node_modules/react') || id.includes('/node_modules/scheduler')) {
            return 'vendor-react';
          }

          if (
            id.includes('/node_modules/recharts')
            || id.includes('/node_modules/d3-')
            || id.includes('/node_modules/victory-vendor')
            || id.includes('/node_modules/lodash')
          ) {
            return 'vendor-charts';
          }

          return undefined;
        },
      },
    },
    sourcemap: true,
  },
});
