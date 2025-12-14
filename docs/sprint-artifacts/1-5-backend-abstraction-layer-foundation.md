# Story 1.5: Backend Abstraction Layer Foundation

Status: done

## Story

As a developer,
I want a VisionBackend interface with a Mock backend implementation,
So that I can develop and test UI without live API dependencies.

## Acceptance Criteria

1. **Given** a developer needs to integrate vision analysis **When** they implement a backend **Then** the `VisionBackend` interface is defined in `src/services/backends/types.ts`
2. **And** the interface includes `name`, `analyze(frame, prompt)`, and `isConfigured()` methods
3. **And** the `AnalysisResult` type includes `result` (boolean), `confidence` (0-100), `rawResponse`, `latencyMs`
4. **Given** a developer needs to test without live APIs **When** they use the mock backend **Then** Mock backend is implemented in `src/services/backends/mock.ts`
5. **And** Mock backend returns configurable responses with simulated latency
6. **And** Backend factory/selector exists in `src/services/backends/index.ts`
7. **And** Mock backend has co-located tests in `mock.test.ts`
8. **And** Result<T> type pattern is used for all async operations (per AR9)

## Tasks / Subtasks

- [x] Task 1: Define core types and interfaces (AC: #1, #2, #3)
  - [x] 1.1: Create `src/services/backends/types.ts` with VisionBackend interface
  - [x] 1.2: Define `BackendType` union type: `'diditCamera' | 'gemini' | 'claude' | 'mock'`
  - [x] 1.3: Define `AnalysisResult` interface with `result`, `confidence`, `rawResponse`, `latencyMs`
  - [x] 1.4: Define `Frame` type for image data (base64 string or URI)
  - [x] 1.5: Define `AnalysisRequest` interface for analyze method parameters
  - [x] 1.6: Export all types for use across the application
- [x] Task 2: Implement Mock backend (AC: #4, #5, #8)
  - [x] 2.1: Create `src/services/backends/mock.ts` implementing VisionBackend interface
  - [x] 2.2: Implement `name` property returning `'mock'`
  - [x] 2.3: Implement `isConfigured()` always returning `true` for mock
  - [x] 2.4: Implement `analyze()` with configurable mock responses
  - [x] 2.5: Add simulated latency (configurable, default 100-500ms random)
  - [x] 2.6: Use Result<T> pattern for analyze() return type
  - [x] 2.7: Support configuration for deterministic test responses
- [x] Task 3: Create backend factory/selector (AC: #6)
  - [x] 3.1: Create `src/services/backends/index.ts` with factory function
  - [x] 3.2: Export `getBackend(type: BackendType)` function
  - [x] 3.3: Export `getAvailableBackends()` function returning configured backends
  - [x] 3.4: Export all types from types.ts for convenience
  - [x] 3.5: Default to mock backend when no other backends configured
- [x] Task 4: Write comprehensive tests (AC: #7, #8)
  - [x] 4.1: Create `src/services/backends/mock.test.ts` with mock backend tests
  - [x] 4.2: Test `isConfigured()` returns true
  - [x] 4.3: Test `analyze()` returns valid AnalysisResult structure
  - [x] 4.4: Test configurable responses (success/failure scenarios)
  - [x] 4.5: Test simulated latency is applied
  - [x] 4.6: Test Result<T> pattern (success and error cases)
  - [x] 4.7: Create `src/services/backends/index.test.ts` for factory tests
  - [x] 4.8: Test `getBackend('mock')` returns mock instance
  - [x] 4.9: Run TypeScript check with no errors
  - [x] 4.10: Ensure all tests pass with no regressions (123 tests, up from 86)

## Dev Notes

### Critical Implementation Details

**VisionBackend Interface Definition:**

```typescript
// src/services/backends/types.ts

import type { Result } from '@/src/types/common';

/**
 * Supported backend types for vision analysis
 */
export type BackendType = 'diditCamera' | 'gemini' | 'claude' | 'mock';

/**
 * Frame data for analysis - can be base64 encoded image or file URI
 */
export interface Frame {
  /** Base64 encoded image data (without data: prefix) */
  base64?: string;
  /** File URI for the image */
  uri?: string;
  /** MIME type of the image (e.g., 'image/jpeg', 'image/png') */
  mimeType: string;
  /** Width of the frame in pixels */
  width?: number;
  /** Height of the frame in pixels */
  height?: number;
}

/**
 * Result of vision analysis from any backend
 */
export interface AnalysisResult {
  /** Normalized boolean result (TRUE/FALSE determination) */
  result: boolean;
  /** Confidence score normalized to 0-100 */
  confidence: number;
  /** Original backend response preserved for debugging */
  rawResponse: unknown;
  /** Response time in milliseconds */
  latencyMs: number;
}

/**
 * Common interface for all vision analysis backends
 * Implements Adapter pattern for backend normalization
 */
export interface VisionBackend {
  /** Backend identifier */
  readonly name: BackendType;

  /**
   * Analyze a frame with the given prompt
   * @param frame - Image frame to analyze
   * @param prompt - Analysis prompt/question
   * @returns Result containing AnalysisResult or error
   */
  analyze(frame: Frame, prompt: string): Promise<Result<AnalysisResult>>;

  /**
   * Check if backend is properly configured
   * @returns true if backend has required credentials/config
   */
  isConfigured(): boolean;
}
```

**Mock Backend Implementation:**

```typescript
// src/services/backends/mock.ts

import type { Result } from '@/src/types/common';
import type { VisionBackend, BackendType, Frame, AnalysisResult } from './types';

/**
 * Configuration for mock backend responses
 */
export interface MockBackendConfig {
  /** Fixed result to return (if not set, random) */
  fixedResult?: boolean;
  /** Fixed confidence to return (if not set, random 60-95) */
  fixedConfidence?: number;
  /** Simulated latency in ms (if not set, random 100-500) */
  latencyMs?: number;
  /** Whether to simulate an error */
  shouldError?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Default configuration for mock backend
 */
const DEFAULT_CONFIG: MockBackendConfig = {
  latencyMs: undefined, // Random 100-500ms
};

/**
 * Mock backend for development and testing
 * Returns configurable responses with simulated latency
 */
export class MockBackend implements VisionBackend {
  readonly name: BackendType = 'mock';
  private config: MockBackendConfig;

  constructor(config: MockBackendConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Mock is always configured (no external dependencies)
   */
  isConfigured(): boolean {
    return true;
  }

  /**
   * Analyze frame with mock response
   * Simulates real backend behavior with configurable latency
   */
  async analyze(frame: Frame, prompt: string): Promise<Result<AnalysisResult>> {
    // Simulate network latency
    const latency = this.config.latencyMs ?? this.randomLatency();
    await this.delay(latency);

    // Check for simulated error
    if (this.config.shouldError) {
      return {
        success: false,
        error: this.config.errorMessage ?? 'Mock backend simulated error',
      };
    }

    // Generate mock response
    const result = this.config.fixedResult ?? Math.random() > 0.5;
    const confidence = this.config.fixedConfidence ?? this.randomConfidence();

    const analysisResult: AnalysisResult = {
      result,
      confidence,
      rawResponse: {
        mock: true,
        prompt,
        frameInfo: {
          mimeType: frame.mimeType,
          width: frame.width,
          height: frame.height,
          hasBase64: !!frame.base64,
          hasUri: !!frame.uri,
        },
      },
      latencyMs: latency,
    };

    return {
      success: true,
      data: analysisResult,
    };
  }

  /**
   * Update mock configuration
   * Useful for changing behavior during tests
   */
  setConfig(config: Partial<MockBackendConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
  }

  private randomLatency(): number {
    return Math.floor(Math.random() * 400) + 100; // 100-500ms
  }

  private randomConfidence(): number {
    return Math.floor(Math.random() * 35) + 60; // 60-95
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create a new mock backend instance
 */
export function createMockBackend(config?: MockBackendConfig): MockBackend {
  return new MockBackend(config);
}
```

**Backend Factory:**

```typescript
// src/services/backends/index.ts

import type { VisionBackend, BackendType } from './types';
import { MockBackend, createMockBackend } from './mock';

// Re-export types
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
 * @param type - Backend type to retrieve
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
        // Not implemented yet - fall back to mock
        console.warn(`Backend '${type}' not implemented, using mock`);
        backend = createMockBackend();
        break;
      default:
        // TypeScript exhaustiveness check
        const _exhaustiveCheck: never = type;
        throw new Error(`Unknown backend type: ${_exhaustiveCheck}`);
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
```

### Testing Strategy

**Mock Backend Tests:**

```typescript
// src/services/backends/mock.test.ts

import { MockBackend, createMockBackend } from './mock';
import type { Frame } from './types';

describe('MockBackend', () => {
  const mockFrame: Frame = {
    base64: 'test-base64-data',
    mimeType: 'image/jpeg',
    width: 640,
    height: 480,
  };

  describe('constructor and properties', () => {
    it('should have name "mock"', () => {
      const backend = createMockBackend();
      expect(backend.name).toBe('mock');
    });

    it('should always be configured', () => {
      const backend = createMockBackend();
      expect(backend.isConfigured()).toBe(true);
    });
  });

  describe('analyze', () => {
    it('should return successful result with valid structure', async () => {
      const backend = createMockBackend({ latencyMs: 10 });
      const result = await backend.analyze(mockFrame, 'test prompt');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.result).toBe('boolean');
        expect(result.data.confidence).toBeGreaterThanOrEqual(0);
        expect(result.data.confidence).toBeLessThanOrEqual(100);
        expect(result.data.latencyMs).toBeGreaterThanOrEqual(0);
        expect(result.data.rawResponse).toBeDefined();
      }
    });

    it('should use fixed result when configured', async () => {
      const backend = createMockBackend({
        fixedResult: true,
        latencyMs: 10
      });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result).toBe(true);
      }
    });

    it('should use fixed confidence when configured', async () => {
      const backend = createMockBackend({
        fixedConfidence: 85,
        latencyMs: 10
      });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confidence).toBe(85);
      }
    });

    it('should simulate error when configured', async () => {
      const backend = createMockBackend({
        shouldError: true,
        errorMessage: 'Test error',
        latencyMs: 10
      });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Test error');
      }
    });

    it('should include frame info in rawResponse', async () => {
      const backend = createMockBackend({ latencyMs: 10 });
      const result = await backend.analyze(mockFrame, 'test prompt');

      expect(result.success).toBe(true);
      if (result.success) {
        const raw = result.data.rawResponse as Record<string, unknown>;
        expect(raw.mock).toBe(true);
        expect(raw.prompt).toBe('test prompt');
      }
    });
  });

  describe('configuration', () => {
    it('should allow updating config', async () => {
      const backend = createMockBackend({ latencyMs: 10 });
      backend.setConfig({ fixedResult: false });

      const result = await backend.analyze(mockFrame, 'test');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result).toBe(false);
      }
    });

    it('should reset config to defaults', async () => {
      const backend = createMockBackend({
        fixedResult: true,
        latencyMs: 10
      });
      backend.resetConfig();

      // After reset, result should be random (not always true)
      // Just verify it doesn't error
      const result = await backend.analyze(mockFrame, 'test');
      expect(result.success).toBe(true);
    });
  });
});
```

### Previous Story Learnings

**From Story 1.4:**
- Result<T> pattern implemented successfully in auth service
- 86 tests passing - maintain or increase test count
- Services organized under `src/services/` with subdirectories
- Co-located tests (`.test.ts` next to source files) work well
- Export barrel files (`index.ts`) for clean imports
- Console.error mocking for suppressing expected test errors

**From Architecture:**
- Adapter pattern for backend abstraction (AR4)
- Result<T> type pattern for all async functions (AR9)
- Co-located tests with source files
- Path aliases `@/` and `~/` for imports

### Architecture Compliance

Per [docs/architecture.md]:
- **Backend Strategy:** Adapter pattern for normalizing responses
- **Result<T> Pattern:** Use for all async service functions (AR9)
- **Type Definitions:** Centralized in types.ts
- **Factory Pattern:** Backend selection via getBackend()

**Directory Structure:**
```
src/
  services/
    backends/
      types.ts           # VisionBackend interface, AnalysisResult, Frame
      mock.ts            # Mock backend implementation
      mock.test.ts       # Mock backend tests
      index.ts           # Backend factory/exports
      index.test.ts      # Factory tests
```

### What This Story Does NOT Include

These are explicitly **deferred to later stories**:
- DiditCamera backend integration (Story 2.x)
- Gemini Vision backend integration (Story 2.x)
- Claude backend integration (Story 2.x)
- Redux slice for backend selection (if needed)
- Backend configuration UI (Story 3.x)

This story focuses ONLY on the interface definition and mock implementation.

### Error Handling Pattern

```typescript
// User-friendly error messages for backend errors
const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  'network_error': 'Unable to connect to analysis service.',
  'timeout': 'Analysis took too long. Please try again.',
  'invalid_frame': 'Invalid image data. Please capture a new frame.',
  'default': 'Analysis failed. Please try again.',
};
```

### References

- [Source: docs/architecture.md#Backend-Abstraction-Layer] - Backend interface design
- [Source: docs/architecture.md#API--Communication-Patterns] - Result<T> pattern
- [Source: docs/epics.md#Story-1.5] - Original story requirements
- [Source: docs/sprint-artifacts/1-4-supabase-client-anonymous-authentication.md] - Previous story patterns

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript check: `npx tsc --noEmit` - passed with no errors
- Test run: `npm test` - 134 tests passed, 0 failed (up from 86 tests, +11 from code review)

### Completion Notes List

1. **Types Created**: `src/services/backends/types.ts` with VisionBackend interface, Frame, AnalysisResult, BackendType
2. **Mock Backend**: `src/services/backends/mock.ts` with configurable responses, simulated latency, Result<T> pattern
3. **Backend Factory**: `src/services/backends/index.ts` with getBackend(), getAvailableBackends(), isBackendAvailable(), clearBackendCache(), registerBackend()
4. **Error Messages**: Added BACKEND_ERROR_MESSAGES constant and getBackendErrorMessage() helper
5. **Testing**: 48 new tests (21 for mock.test.ts, 27 for index.test.ts including error message tests)
6. **Additional Features**: getConfig() method, setConfig() for runtime updates, resetConfig() for defaults

### File List

**Created:**
- `src/services/backends/types.ts` - VisionBackend interface and types
- `src/services/backends/mock.ts` - Mock backend implementation
- `src/services/backends/mock.test.ts` - Mock backend tests (21 tests)
- `src/services/backends/index.ts` - Backend factory/exports
- `src/services/backends/index.test.ts` - Factory tests (27 tests, +11 for error messages)

**Modified:**
- `docs/sprint-artifacts/sprint-status.yaml` - Updated story status to done

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-14 | Story created with comprehensive dev notes from architecture and epics | Claude Opus 4.5 |
| 2025-12-14 | Implementation complete - all tasks done, 123 tests passing | Claude Opus 4.5 |
