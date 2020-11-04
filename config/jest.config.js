const path = require('path');
const root = path.resolve(__dirname, '../');

module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/config/tsconfig.json',
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },

  rootDir: root,
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'd.ts'],
  testMatch: ['**/__tests__/**/*-spec.js?(x)', '**/__tests__/**/*-spec.ts?(x)'],
  testPathIgnorePatterns: ['data'],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '\\.m?js?$': 'esm',
    '.(ts|tsx)': 'ts-jest',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!(@helsenorge)[/\\\\])'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/node_modules/identity-obj-proxy',
  },
};
