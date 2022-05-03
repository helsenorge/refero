module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'import', 'testing-library'],
  rules: {
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/jsx-no-literals': 'error',
    'react/display-name': 'warn',
    'no-console': 'error',
    'no-debugger': 'error',

    'react/prop-types': 0, //Gir feil i funksjonelle komponenter
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-inferrable-types': 0,

    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'type', 'internal', ['parent', 'sibling'], 'index'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'HNResources',
            group: 'external',
            position: 'after',
          },
          {
            pattern: 'HNEntities/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: 'types/**',
            group: 'type',
          },
          {
            pattern: '../types/**',
            group: 'type',
          },
          {
            pattern: '../../types/**',
            group: 'type',
          },
          {
            pattern: '../../../types/**',
            group: 'type',
          },
          {
            pattern: '../../../../types/**',
            group: 'type',
          },
          {
            pattern: '../../../../../types/**',
            group: 'type',
          },
          {
            pattern: '../../../../../../types/**',
            group: 'type',
          },
          {
            pattern: '../../../../../../../types/**',
            group: 'type',
          },
          {
            pattern: '../../../../../../../../types/**',
            group: 'type',
          },
          {
            pattern: '../../../../../../../../../types/**',
            group: 'type',
          },
          {
            pattern: '../../../../../../../../../../types/**',
            group: 'type',
          },
          {
            pattern: '@helsenorge/designsystem-react/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@helsenorge/toolkit/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@helsenorge/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: './*.scss',
            group: 'sibling',
            position: 'after',
          },
          {
            pattern: './*.css',
            group: 'sibling',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching files!
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:testing-library/react'],
    },
  ],
};
