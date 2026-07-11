import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ jsc: { target: 'es2023' } }), tsconfigPaths()],
  test: {
    globals: true,
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    clearMocks: true,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
