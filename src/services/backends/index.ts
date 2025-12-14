/**
 * Backend Factory
 *
 * Factory module for creating and managing vision backend instances.
 * Provides centralized access to all backend implementations.
 *
 * @see docs/architecture.md#Backend-Abstraction-Layer
 */

import type { VisionBackend, BackendType } from './types';
import { MockBackend, createMockBackend } from './mock';

// Re-export types for convenience
export * from './types';
export { MockBackend, createMockBackend } from './mock';
export type { MockBackendConfig } from './mock';

/**
 * Backend registry - holds singleton instances
 */
const backends: Map<BackendType, VisionBackend> = new Map();

/**
 * Get a backend instance by type
 * Returns mock backend as default
 *
 * @param type - Backend type to retrieve (defaults to 'mock')
 * @returns Backend instance (creates if not exists)
 */
export function getBackend(type: BackendType = 'mock'): VisionBackend {
  // Check if instance exists
  let backend = backends.get(type);

  if (!backend) {
    // Create new instance based on type
    switch (type) {
      case 'mock':
        backend = createMockBackend();
        break;
      case 'diditCamera':
      case 'gemini':
      case 'claude':
        // Not implemented yet - fall back to mock with warning
        console.warn(`Backend '${type}' not implemented, using mock`);
        backend = createMockBackend();
        break;
      default: {
        // TypeScript exhaustiveness check
        const _exhaustiveCheck: never = type;
        throw new Error(`Unknown backend type: ${_exhaustiveCheck}`);
      }
    }

    backends.set(type, backend);
  }

  return backend;
}

/**
 * Get all available (configured) backends
 *
 * @returns Array of configured backend instances
 */
export function getAvailableBackends(): VisionBackend[] {
  // For now, only mock is available
  // Later stories will add real backends
  return [getBackend('mock')];
}

/**
 * Check if a specific backend is available
 *
 * @param type - Backend type to check
 * @returns true if backend is configured and available
 */
export function isBackendAvailable(type: BackendType): boolean {
  const backend = getBackend(type);
  return backend.isConfigured();
}

/**
 * Clear backend cache (useful for testing)
 */
export function clearBackendCache(): void {
  backends.clear();
}

/**
 * Register a custom backend instance (useful for testing)
 *
 * @param type - Backend type to register
 * @param backend - Backend instance to register
 */
export function registerBackend(
  type: BackendType,
  backend: VisionBackend
): void {
  backends.set(type, backend);
}
