/**
 * Mock Backend Helper
 *
 * Configurable mock backend for testing without live API dependencies.
 * Supports deterministic responses, configurable latency, and error simulation.
 */

import {
  AnalysisResult,
  createTrueResponse,
  createFalseResponse,
  createErrorResponse,
} from '../fixtures/factories';

export interface MockBackendConfig {
  /** Default latency in ms (default: 100) */
  latency: number;
  /** Response sequence for sequential calls */
  responseSequence: AnalysisResult[];
  /** Current position in response sequence */
  sequenceIndex: number;
  /** Simulate rate limiting after N requests */
  rateLimitAfter: number | null;
  /** Current request count */
  requestCount: number;
  /** Simulate network timeout */
  simulateTimeout: boolean;
  /** Simulate network error */
  simulateNetworkError: boolean;
}

const defaultConfig: MockBackendConfig = {
  latency: 100,
  responseSequence: [],
  sequenceIndex: 0,
  rateLimitAfter: null,
  requestCount: 0,
  simulateTimeout: false,
  simulateNetworkError: false,
};

let config: MockBackendConfig = { ...defaultConfig };

/**
 * Reset mock backend to default configuration
 */
export function resetMockBackend(): void {
  config = { ...defaultConfig };
}

/**
 * Configure mock backend behavior
 */
export function configureMockBackend(options: Partial<MockBackendConfig>): void {
  config = { ...config, ...options };
}

/**
 * Set a sequence of responses for sequential calls
 * Useful for testing auto-stop behavior
 */
export function setResponseSequence(responses: AnalysisResult[]): void {
  config.responseSequence = responses;
  config.sequenceIndex = 0;
}

/**
 * Set latency for all mock responses
 */
export function setMockLatency(latencyMs: number): void {
  config.latency = latencyMs;
}

/**
 * Enable rate limiting simulation
 */
export function enableRateLimiting(afterRequests: number): void {
  config.rateLimitAfter = afterRequests;
  config.requestCount = 0;
}

/**
 * Simulate network timeout
 */
export function simulateTimeout(enabled: boolean = true): void {
  config.simulateTimeout = enabled;
}

/**
 * Simulate network error
 */
export function simulateNetworkError(enabled: boolean = true): void {
  config.simulateNetworkError = enabled;
}

/**
 * Get mock response based on current configuration
 */
export async function getMockResponse(
  _frame: unknown,
  _prompt: string
): Promise<AnalysisResult> {
  config.requestCount++;

  // Simulate latency
  await new Promise((resolve) => setTimeout(resolve, config.latency));

  // Check for timeout simulation
  if (config.simulateTimeout) {
    throw new Error('TIMEOUT: Mock backend timed out');
  }

  // Check for network error simulation
  if (config.simulateNetworkError) {
    throw new Error('NETWORK_ERROR: Unable to connect to mock backend');
  }

  // Check for rate limiting
  if (config.rateLimitAfter && config.requestCount > config.rateLimitAfter) {
    return {
      result: false,
      confidence: 0,
      rawResponse: { error: 'Rate limit exceeded', code: 429 },
      latencyMs: config.latency,
    };
  }

  // Return from sequence if configured
  if (config.responseSequence.length > 0) {
    const response = config.responseSequence[config.sequenceIndex];
    if (config.sequenceIndex < config.responseSequence.length - 1) {
      config.sequenceIndex++;
    }
    return { ...response, latencyMs: config.latency };
  }

  // Default: return random TRUE/FALSE
  return Math.random() > 0.5
    ? createTrueResponse(config.latency)
    : createFalseResponse(config.latency);
}

/**
 * Create a mock backend instance for testing
 */
export function createMockBackendInstance() {
  return {
    name: 'mock' as const,

    async analyze(frame: unknown, prompt: string): Promise<AnalysisResult> {
      return getMockResponse(frame, prompt);
    },

    isConfigured(): boolean {
      return true;
    },

    // Test utilities
    reset: resetMockBackend,
    configure: configureMockBackend,
    setResponseSequence,
    setLatency: setMockLatency,
    enableRateLimiting,
    simulateTimeout,
    simulateNetworkError,
  };
}

// Export a singleton instance for easy use in tests
export const mockBackend = createMockBackendInstance();
