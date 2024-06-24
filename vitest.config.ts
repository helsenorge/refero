import path from 'path';

import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default defineConfig(configEnv =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      root: path.resolve(__dirname, '.'),
      resolve: {
        alias: [
          {
            find: '@helsenorge/datepicker',
            replacement: path.resolve(__dirname, 'node_modules/@helsenorge/datepicker'),
          },
        ],
      },
      test: {
        testTimeout: 30000,
        include: ['src/**/*-spec.ts', 'src/**/*-spec.tsx'],
        globals: true,
        environment: 'jsdom',
        setupFiles: [path.resolve(__dirname, 'test/setup-test.ts')],
        css: {
          modules: {
            classNameStrategy: 'non-scoped',
          },
        },
        typecheck: {
          tsconfig: path.resolve(__dirname, 'tsconfig.test.json'),
        },
        server: {
          deps: {
            inline: ['@helsenorge/designsystem-react', '@helsenorge/datepicker'],
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
    })
  )
);
