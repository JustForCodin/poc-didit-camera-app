/**
 * Mock Backend
 *
 * Mock implementation of VisionBackend for development and testing.
 * Returns configurable responses with simulated latency.
 *
 * Usage:
 * - Development without live API dependencies
 * - Unit testing with deterministic responses
 * - UI prototyping with simulated delays
 */

import type { Result } from '@/src/types/common';
import type {
  VisionBackend,
  BackendType,
  Frame,
  AnalysisResult,
} from './types';

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
    this.config = { ...DEFAULT_CONFIG, ...config };
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
        timestamp: new Date().toISOString(),
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

  /**
   * Get current configuration
   */
  getConfig(): MockBackendConfig {
    return { ...this.config };
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
 * @param config - Optional configuration for mock responses
 * @returns New MockBackend instance
 */
export function createMockBackend(config?: MockBackendConfig): MockBackend {
  return new MockBackend(config);
}
