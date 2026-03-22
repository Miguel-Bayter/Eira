import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'web',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/main.tsx'],
    },
    // Allow Vitest to access files above the app root (e.g. packages/shared)
    server: {
      fs: {
        allow: ['../..'],
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Resolve @eira/shared to the shared package source
      '@eira/shared': resolve(__dirname, '../../packages/shared/index.ts'),
      // Ensure deps of @eira/shared resolve from this app's node_modules
      // (zod lives in apps/web/node_modules because pnpm doesn't hoist it to root)
      'zod': resolve(__dirname, 'node_modules/zod'),
    },
  },
});
