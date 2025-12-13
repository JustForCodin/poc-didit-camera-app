/**
 * Test Helpers
 *
 * Centralized exports for all test helper utilities.
 */

// Mock backend helper
export {
  mockBackend,
  createMockBackendInstance,
  resetMockBackend,
  configureMockBackend,
  setResponseSequence,
  setMockLatency,
  enableRateLimiting,
  simulateTimeout,
  simulateNetworkError,
  getMockResponse,
  type MockBackendConfig,
} from './mockBackend';

// General test utilities
export {
  wait,
  mockSuccess,
  mockError,
  expectSuccess,
  expectError,
  createDelayedMock,
  createFailingMock,
  flushPromises,
  runAllTimers,
  advanceTimersBy,
  createMockNetworkState,
  expectToThrow,
  createSupabaseMock,
} from './testUtils';
