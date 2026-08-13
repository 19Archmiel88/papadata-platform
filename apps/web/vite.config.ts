import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
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
