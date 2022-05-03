/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const root = path.resolve(__dirname, '../');

module.exports = {
  verbose: true,
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  rootDir: root,
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/__tests__/**/*-spec.js?(x)', '**/__tests__/**/*-spec.ts?(x)'],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    // '\\.m?js?$': 'esm',
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.css$': '<rootDir>/config/cssTransform.js',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/config/fileTransform.js',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(@helsenorge)[/\\\\])',
    '^.+\\.module\\.(css|sass|scss|scss.d.ts)$',
    '(?<!([/\\\\]npm[/\\\\]packages[/\\\\].+))[/\\\\]lib[/\\\\]',
    '[/\\\\]dist[/\\\\]',
    '[/\\\\]dist_dev[/\\\\]',
    '[/\\\\]data[/\\\\]',
  ],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!(@helsenorge)[/\\\\])'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '\\.(png|svg)$': '<rootDir>/config/empty.js',
  },
};
