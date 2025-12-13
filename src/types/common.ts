/**
 * Common Types
 *
 * Shared TypeScript types used throughout the application.
 * These types are defined in the architecture document.
 */

/**
 * Standard Result type for all async operations.
 * Use this pattern for all service functions to ensure consistent error handling.
 *
 * @example
 * async function getSession(id: string): Promise<Result<Session>> {
 *   const { data, error } = await supabase.from('sessions').select('*').eq('id', id).single();
 *   if (error) return { success: false, error: 'Failed to load session' };
 *   return { success: true, data };
 * }
 *
 * // Usage
 * const result = await getSession(id);
 * if (result.success) {
 *   console.log(result.data); // TypeScript knows this is Session
 * } else {
 *   showError(result.error);  // TypeScript knows this is string
 * }
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Async state for tracking loading/error states.
 * Use in Redux slices for operations that need UI feedback.
 */
export interface AsyncState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Create initial async state
 */
export function createInitialAsyncState(): AsyncState {
  return {
    status: 'idle',
    error: null,
  };
}

/**
 * Helper to check if async state is loading
 */
export function isLoading(state: AsyncState): boolean {
  return state.status === 'loading';
}

/**
 * Helper to check if async state has error
 */
export function hasError(state: AsyncState): boolean {
  return state.status === 'failed' && state.error !== null;
}
