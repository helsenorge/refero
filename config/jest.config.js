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
  setupTestFrameworkScriptFile: '<rootDir>/config/setupTests.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'd.ts'],
  testMatch: ['**/__tests__/**/*-spec.js?(x)', '**/__tests__/**/*-spec.ts?(x)'],
  testPathIgnorePatterns: ['data'],
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/node_modules/identity-obj-proxy',
  },
};
