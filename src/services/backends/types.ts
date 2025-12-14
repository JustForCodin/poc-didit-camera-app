/**
 * Backend Types
 *
 * Core interfaces and types for the vision analysis backend abstraction layer.
 * Implements Adapter pattern for normalizing responses from different AI backends.
 *
 * @see docs/architecture.md#Backend-Abstraction-Layer
 */

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

/**
 * User-friendly error messages for backend errors
 */
export const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  network_error: 'Unable to connect to analysis service.',
  timeout: 'Analysis took too long. Please try again.',
  invalid_frame: 'Invalid image data. Please capture a new frame.',
  rate_limited: 'Too many requests. Please wait a moment.',
  not_configured: 'Backend not configured. Please check settings.',
  default: 'Analysis failed. Please try again.',
};

/**
 * Get user-friendly error message for backend error
 * @param errorCode - Error code or message from backend
 * @returns User-friendly error message
 */
export function getBackendErrorMessage(errorCode: string): string {
  return BACKEND_ERROR_MESSAGES[errorCode] ?? BACKEND_ERROR_MESSAGES.default;
}
