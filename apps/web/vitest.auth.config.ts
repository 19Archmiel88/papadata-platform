import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'src/auth/**/*.test.ts',
      'src/auth/**/*.integration.test.ts',
      'src/auth/**/*.e2e.test.ts',
      'src/features/**/*.test.ts',
      'src/shared/**/*.test.ts',
      'src/server/auth/**/*.test.ts',
      'src/shell/**/*.test.ts',
    ],
    name: 'auth',
  },
});
