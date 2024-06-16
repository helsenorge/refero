import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/util/tests/setup-test.ts'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    coverage: {
      reporter: ['cobertura', 'json'],
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'test-report.xml',
    },
  },
});
