import config from '@helsenorge/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  config,
  {
    rules: {
      'react-refresh/only-export-components': 'error',
    },
  },
]);
