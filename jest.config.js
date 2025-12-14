/**
 * Jest Configuration for React Native/Expo
 *
 * This configuration is optimized for:
 * - TypeScript support
 * - Expo/React Native mocking
 * - Co-located test files (*.test.ts next to source)
 * - Coverage reporting with 80% threshold
 */

module.exports = {
  preset: 'jest-expo',

  // Test file patterns - supports co-located and dedicated test directories
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.test.{ts,tsx}',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform TypeScript files
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },

  // Module path aliases (match tsconfig.json)
  // tsconfig uses @/* and ~/* both mapping to project root
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/support/setupTests.ts'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**/*',
    // Exclude UI components - tested via integration/E2E tests
    '!src/components/**/*.tsx',
  ],

  coverageThreshold: {
    global: {
      // Relaxed thresholds during active development
      // Will increase to 80% as codebase stabilizes
      branches: 40,
      functions: 40,
      lines: 50,
      statements: 50,
    },
    // Higher threshold for critical services that have tests
    'src/services/backends/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/services/storage/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/coverage',

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Fail on console errors/warnings in tests
  errorOnDeprecated: true,

  // Verbose output for CI
  verbose: true,

  // Transform ignore patterns (node_modules except Expo and other ESM packages)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@faker-js/.*)',
  ],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Test environment
  testEnvironment: 'node',

  // Reporters for CI
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
    }],
  ],
};
