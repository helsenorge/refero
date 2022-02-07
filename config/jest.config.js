// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const root = path.resolve(__dirname, '../');

module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/config/tsconfig.json',
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
  rootDir: root,
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  moduleFileExtensions: ['d.ts', 'js', 'json', 'jsx', 'ts', 'tsx'],
  testMatch: ['**/__tests__/**/*-spec.js?(x)', '**/__tests__/**/*-spec.ts?(x)'],
  testPathIgnorePatterns: ['data'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!(@helsenorge)[/\\\\])'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/node_modules/identity-obj-proxy',
  },
};
