import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import referoConfig from '../../../vite.config.ts';

/**
 * A production build of the page in this folder: the same aliases, styles and worker setup as refero itself,
 * but an app rather than the library, so it runs the way a host application does. Dev mode is not used for
 * measuring: React's development build makes the page several times slower than what users get.
 */
export default defineConfig(configEnv => {
  const refero = referoConfig({ ...configEnv, command: 'build', isPreview: false });
  return {
    root: import.meta.dirname,
    base: './',
    resolve: refero.resolve,
    css: refero.css,
    worker: refero.worker,
    plugins: [react()],
    build: {
      outDir: process.env.BROWSER_BENCH_OUT ?? path.join(import.meta.dirname, 'dist'),
      emptyOutDir: true,
      sourcemap: false,
    },
  };
});
