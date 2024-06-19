import path from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import copy from 'rollup-plugin-copy';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import tsconfigPaths from 'vite-tsconfig-paths';

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIRECTORY = 'lib';

export default defineConfig(({ mode }) => {
  const isPreview = mode === 'development';

  return {
    define: { global: 'window' },
    root: isPreview ? './preview' : '.',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      alias: {
        '@helsenorge/refero': path.resolve(__dirname, OUTPUT_DIRECTORY),
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@fromComponents': path.resolve(__dirname, 'src/components/fromComponents'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, OUTPUT_DIRECTORY),
      manifest: true,
      sourcemap: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        formats: ['es'],
        name: 'Refero',
        fileName: format => `refero.${format}.js`,
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          '@helsenorge/autosuggest',
          '@helsenorge/core-utils',
          '@helsenorge/date-time',
          '@helsenorge/file-upload',
          '@helsenorge/designsystem-react',
          'react-redux',
          'redux',
          'redux-thunk',
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'react/jsx-runtime',
            '@helsenorge/autosuggest': '@helsenorge/autosuggest',
            '@helsenorge/core-utils': '@helsenorge/core-utils',
            '@helsenorge/date-time': '@helsenorge/date-time',
            '@helsenorge/file-upload': '@helsenorge/file-upload',
            '@helsenorge/designsystem-react': '@helsenorge/designsystem-react',
            'react-redux': 'ReactRedux',
            redux: 'Redux',
            'redux-thunk': 'ReduxThunk',
          },
        },
      },
    },
    plugins: [
      tsconfigPaths({
        projects: [path.resolve(__dirname, 'tsconfig.build.json')],
      }),
      dts({
        tsconfigPath: path.resolve(__dirname, 'tsconfig.build.json'),
        outDir: path.resolve(__dirname, 'lib/types'),
        include: ['src'],
        exclude: ['__test__', '__mocks__', '__data__'],
      }),
      react(),
      libInjectCss(),
      copy({
        targets: [
          { src: 'LICENSE', dest: path.resolve(__dirname, OUTPUT_DIRECTORY) },
          { src: 'README.md', dest: path.resolve(__dirname, OUTPUT_DIRECTORY) },
          { src: 'CHANGE', dest: path.resolve(__dirname, OUTPUT_DIRECTORY) },
          { src: 'src/components/**/*.module.*', dest: OUTPUT_DIRECTORY },
        ],
        hook: 'writeBundle',
      }),
      generatePackageJson({
        outputFolder: path.resolve(__dirname, OUTPUT_DIRECTORY),
        baseContents: pkg => ({
          author: pkg.author,
          name: pkg.name,
          description: pkg.description,
          repository: pkg.repository,
          version: pkg.version,
          module: 'refero.es.js',
          types: 'types/index.d.ts',
          license: pkg.license,
          dependencies: pkg.dependencies,
          peerDependencies: pkg.peerDependencies,
          exports: {
            '.': {
              import: './refero.es.js',
            },
          },
        }),
      }),
    ],
  };
});
