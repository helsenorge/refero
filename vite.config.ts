import path from 'path';

import react from '@vitejs/plugin-react';
import copy from 'rollup-plugin-copy';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const isPreview = mode === 'development';

  // Plugin definitions

  return {
    define: {global: 'window'},
    root: isPreview ? './preview' : '.',
    resolve: {
      alias: {
        '@helsenorge/refero': path.resolve(__dirname, 'lib'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'lib'),
      manifest: true,
      sourcemap: isPreview,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      emptyOutDir: true,
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        formats: ['es'],
        name: 'Refero',
        fileName: (format): string => `refero.${format}.js`,
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
          format: 'es',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'react/jsx-runtime',
            '@helsenorge/autosuggest': 'HelsenorgeAutoSuggest',
            '@helsenorge/core-utils': 'HelsenorgeCoreUtils',
            '@helsenorge/date-time': 'HelsenorgeDateTime',
            '@helsenorge/file-upload': 'HelsenorgeFileUpload',
            '@helsenorge/designsystem-react': 'HelsenorgeDesignSystemReact',
            'react-redux': 'reactRedux',
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
        exclude: ['**/*-spec.*'],
      }),
      react(),
      libInjectCss(),
      copy({
        targets: [
          { src: 'LICENSE', dest: path.resolve(__dirname, 'lib') },
          { src: 'README.md', dest: path.resolve(__dirname, 'lib') },
          { src: 'CHANGE', dest: path.resolve(__dirname, 'lib') },
        ],
        hook: 'writeBundle',
      }),
      generatePackageJson({
        outputFolder: path.resolve(__dirname, 'lib'),
        baseContents: pkg => ({
          author: pkg.author,
          name: pkg.name,
          version: pkg.version,
          main: 'refero.umd.js',
          module: 'refero.es.js',
          types: 'types/index.d.ts',
          license: pkg.license,
          dependencies: pkg.dependencies,
          peerDependencies: pkg.peerDependencies,
          exports: {
            '.': {
              require: './refero.umd.js',
              import: './refero.es.js',
            },
          },
        }),
      }),
    ],
  };
});
