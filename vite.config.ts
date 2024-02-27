import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vitePluginRequire from 'vite-plugin-require';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(__dirname, 'src/preview'),
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules'],
      },
    },
  },
  resolve: {
    alias: [
      {
        // this is required for the SCSS modules
        find: /^~(.*)$/,
        replacement: '$1',
      },
    ],
  },
  build: {
    outDir: 'dist',
    manifest: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  plugins: [
    tsconfigPaths({
      projects: [path.resolve(__dirname, 'tsconfig.vite.json')],
    }),
    react(),
    vitePluginRequire({ fileRegex: /(.jsx?|.tsx?|.ts)$/ }),
  ],
});
