const path = require('path');
const root = path.resolve(__dirname, '../');

module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
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
  testMatch: ['**/__tests__/**/*.js?(x)', '**/__tests__/**/*.ts?(x)'],
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/node_modules/identity-obj-proxy',
  },
};
