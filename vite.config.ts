import path from 'path';

import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import copy from 'rollup-plugin-copy';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

import { externalizeDeps } from './vite-plugins/ext-deps.ts';

const OUTPUT_DIRECTORY = 'lib';

export default defineConfig(({ command, isPreview }): UserConfig => {
  const dev = command === 'serve' && !isPreview;

  return {
    root: dev ? path.resolve(import.meta.dirname, './preview') : path.resolve(import.meta.dirname, ''),
    base: './',
    server: {
      port: 3000,
    },
    worker: {
      plugins: () => [
        replace({
          preventAssignment: true,
          values: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
            'process.env': '{}',
          },
        }),
      ],
      format: 'es',
    },
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [path.resolve(import.meta.dirname, 'node_modules')],
        },
      },
      postcss: {
        plugins: [autoprefixer(), cssnano({ preset: 'default' })],
      },
    },
    resolve: {
      tsconfigPaths: true,
      extensions: ['.ts', '.tsx', '.js', '.json', '.scss', '.css'],
      alias: [
        { find: '@helsenorge/refero', replacement: path.resolve(import.meta.dirname, OUTPUT_DIRECTORY) },
        { find: '@', replacement: path.resolve(import.meta.dirname, 'src') },
        { find: '@components', replacement: path.resolve(import.meta.dirname, 'src/components') },
        { find: '@formcomponents', replacement: path.resolve(import.meta.dirname, 'src/components/formcomponents') },
        { find: '@constants', replacement: path.resolve(import.meta.dirname, 'src/constants') },
        { find: '@test', replacement: path.resolve(import.meta.dirname, 'test') },
        { find: '@workers', replacement: path.resolve(import.meta.dirname, 'src/workers') },
        { find: /^~(.*)$/, replacement: '$1' },
      ],
    },

    build: {
      outDir: path.resolve(import.meta.dirname, OUTPUT_DIRECTORY),
      // Set manifest to false, as we no longer need to read it.
      manifest: false,
      sourcemap: false,

      lib: {
        entry: path.resolve(import.meta.dirname, 'src/index.ts'),
        formats: ['es'],
        name: 'Refero',
        fileName: 'refero.es',
      },
    },
    plugins: [
      visualizer({ filename: './bundle-stats.html' }),
      externalizeDeps({
        peerDeps: true,
        deps: false,
      }),
      dts({
        tsconfigPath: path.resolve(import.meta.dirname, 'tsconfig.dts.json'),
        entryRoot: path.resolve(import.meta.dirname, 'src'),
        include: ['src'],
        exclude: ['**/__tests__/**', '**/__mocks__/**', '**/__data__/**'],
        outDirs: [path.resolve(import.meta.dirname, OUTPUT_DIRECTORY, 'types')],
      }),
      react(),
      libInjectCss(),
      copy({
        targets: [{ src: '*.md', dest: path.resolve(import.meta.dirname, OUTPUT_DIRECTORY) }],
        hook: 'writeBundle',
      }),
      generatePackageJson({
        outputFolder: path.resolve(import.meta.dirname, OUTPUT_DIRECTORY),
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
              types: './types/index.d.ts',
            },
            './worker': {
              import: './fhirpath-rpc.worker.js',
            },
          },
        }),
      }),
    ],
  };
});
