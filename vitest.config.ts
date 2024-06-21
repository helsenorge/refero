import path from 'path';

import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default defineConfig(configEnv =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
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
            inline: ['@helsenorge/designsystem-react'],
          },
        },
        // coverage: {
        //   reporter: ['cobertura', 'json'],
        // },
        // reporters: ['default', 'junit'],
        // outputFile: {
        //   junit: 'test-report.xml',
        // },
      },
    })
  )
);
