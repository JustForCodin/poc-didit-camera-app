/**
 * Test Utilities
 *
 * Common utilities for testing React Native/Expo applications.
 */

import { Result } from '@/src/types/common';

/**
 * Wait for a specified duration
 * Use sparingly - prefer deterministic waits when possible
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock Result<T> success response
 */
export function mockSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create a mock Result<T> error response
 */
export function mockError<T>(error: string): Result<T> {
  return { success: false, error };
}

/**
 * Assert that a Result is successful and return the data
 * Throws if the result is an error
 */
export function expectSuccess<T>(result: Result<T>): T {
  if (!result.success) {
    throw new Error(`Expected success but got error: ${result.error}`);
  }
  return result.data;
}

/**
 * Assert that a Result is an error and return the error message
 * Throws if the result is successful
 */
export function expectError<T>(result: Result<T>): string {
  if (result.success) {
    throw new Error(`Expected error but got success with data: ${JSON.stringify(result.data)}`);
  }
  return result.error;
}

/**
 * Create a mock function that resolves after a delay
 */
export function createDelayedMock<T>(
  value: T,
  delayMs: number = 100
): jest.Mock<Promise<T>> {
  return jest.fn(() =>
    new Promise((resolve) => setTimeout(() => resolve(value), delayMs))
  );
}

/**
 * Create a mock function that rejects after a delay
 */
export function createFailingMock(
  error: string | Error,
  delayMs: number = 100
): jest.Mock<Promise<never>> {
  const err = typeof error === 'string' ? new Error(error) : error;
  return jest.fn(() =>
    new Promise((_, reject) => setTimeout(() => reject(err), delayMs))
  );
}

/**
 * Flush all pending promises
 * Useful for testing async operations in React
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

/**
 * Run all pending timers and flush promises
 */
export async function runAllTimers(): Promise<void> {
  jest.runAllTimers();
  await flushPromises();
}

/**
 * Advance timers by specified duration and flush promises
 */
export async function advanceTimersBy(ms: number): Promise<void> {
  jest.advanceTimersByTime(ms);
  await flushPromises();
}

/**
 * Create a mock network state
 */
export function createMockNetworkState(isConnected: boolean) {
  return {
    isConnected,
    isInternetReachable: isConnected,
    type: isConnected ? 'wifi' : 'none',
    details: isConnected ? { isConnectionExpensive: false } : null,
  };
}

/**
 * Assert that a function throws an error with a specific message
 */
export async function expectToThrow(
  fn: () => Promise<unknown>,
  expectedMessage?: string | RegExp
): Promise<void> {
  let threw = false;
  let thrownError: Error | undefined;

  try {
    await fn();
  } catch (error) {
    threw = true;
    thrownError = error as Error;
  }

  if (!threw) {
    throw new Error('Expected function to throw but it did not');
  }

  if (expectedMessage && thrownError) {
    if (typeof expectedMessage === 'string') {
      expect(thrownError.message).toContain(expectedMessage);
    } else {
      expect(thrownError.message).toMatch(expectedMessage);
    }
  }
}

/**
 * Type-safe mock for Supabase query builder
 */
export function createSupabaseMock<T>(data: T | null, error: string | null = null) {
  return {
    data,
    error: error ? { message: error, details: '', hint: '', code: 'ERROR' } : null,
  };
}
