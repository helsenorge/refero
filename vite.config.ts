import path from 'path';

import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import copy from 'rollup-plugin-copy';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import tsconfigPaths from 'vite-tsconfig-paths';

import { externalizeDeps } from './vite-plugins/ext-deps';

const OUTPUT_DIRECTORY = 'lib';

export default defineConfig(({ command, isPreview }): UserConfig => {
  const dev = command === 'serve' && !isPreview;

  return {
    root: dev ? path.resolve(__dirname, './preview') : path.resolve(__dirname, ''),
    base: './',
    server: {
      port: 3000,
    },
    worker: {
      plugins: () => [
        tsconfigPaths({
          projects: [path.resolve(__dirname, 'tsconfig.build.json')],
        }),
      ],
      format: 'es',
    },
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [path.resolve(__dirname, 'node_modules')],
        },
      },
      postcss: {
        plugins: [autoprefixer(), cssnano({ preset: 'default' })],
      },
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.scss', '.css'],
      alias: [
        { find: '@helsenorge/refero', replacement: path.resolve(__dirname, OUTPUT_DIRECTORY) },
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
        { find: '@formcomponents', replacement: path.resolve(__dirname, 'src/components/formcomponents') },
        { find: '@constants', replacement: path.resolve(__dirname, 'src/constants') },
        { find: '@test', replacement: path.resolve(__dirname, 'test') },
        { find: '@workers', replacement: path.resolve(__dirname, 'src/workers') },
        { find: /^~(.*)$/, replacement: '$1' },
      ],
    },

    build: {
      outDir: path.resolve(__dirname, OUTPUT_DIRECTORY),
      // Set manifest to false, as we no longer need to read it.
      manifest: false,
      cssMinify: 'esbuild',
      sourcemap: false,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
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
        targets: [{ src: '*.md', dest: path.resolve(__dirname, OUTPUT_DIRECTORY) }],
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
              types: './types/index.d.ts',
            },
            './worker': {
              import: './fhir-path.worker.js',
            },
          },
        }),
      }),
    ],
  };
});
