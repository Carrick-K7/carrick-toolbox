import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.js',
        '**/*.spec.js',
        '**/*.config.js',
        'test-setup.js'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    },
    include: ['tests/**/*.{test,spec}.{js,ts}', 'utils/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/', 'dist/']
  }
});
