import path from 'path';

import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from '../../vite.config.ts';

// Separate from the unit tests: these fill in every form in test/form-comparison/forms, take a while, and are started by run.mjs.
export default defineConfig(configEnv =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      root: path.resolve(import.meta.dirname, '../..'),
      test: {
        include: ['test/form-comparison/*.forms.ts'],
        globals: true,
        environment: 'jsdom',
        testTimeout: 30 * 60 * 1000,
        hookTimeout: 60 * 1000,
        pool: 'threads',
        // One line per form with the time it took, so a long run shows where it is.
        reporters: ['verbose'],
        // A calculation that throws does so in a debounced callback; the recorder notes it and carries on.
        dangerouslyIgnoreUnhandledErrors: true,
        server: {
          deps: {
            inline: [
              '@helsenorge/designsystem-react',
              '@helsenorge/datepicker',
              '@helsenorge/core-utils',
              '@helsenorge/file-upload',
              '@helsenorge/autosuggest',
            ],
          },
        },
      },
    })
  )
);
