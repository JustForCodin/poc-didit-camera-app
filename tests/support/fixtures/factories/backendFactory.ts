/**
 * Backend Factory
 *
 * Creates test data for backend configurations and responses.
 * Supports all backend types: DiditCamera, Gemini, Claude, Mock.
 */

import { faker } from '@faker-js/faker';

export type BackendType = 'diditCamera' | 'gemini' | 'claude' | 'mock';

export interface BackendCredentials {
  diditCamera?: {
    email: string;
    password: string;
  };
  gemini?: {
    apiKey: string;
  };
  claude?: {
    apiKey: string;
  };
}

export interface BackendConfig {
  type: BackendType;
  name: string;
  isConfigured: boolean;
  endpoint: string;
  timeout: number;
}

export interface AnalysisResult {
  result: boolean;
  confidence: number;
  rawResponse: unknown;
  latencyMs: number;
}

/**
 * Creates backend credentials
 */
export function createBackendCredentials(
  overrides: Partial<BackendCredentials> = {}
): BackendCredentials {
  return {
    diditCamera: overrides.diditCamera ?? {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 12 }),
    },
    gemini: overrides.gemini ?? {
      apiKey: `AIza${faker.string.alphanumeric(35)}`,
    },
    claude: overrides.claude ?? {
      apiKey: `sk-ant-${faker.string.alphanumeric(40)}`,
    },
  };
}

/**
 * Creates a backend configuration
 */
export function createBackendConfig(
  type: BackendType,
  overrides: Partial<BackendConfig> = {}
): BackendConfig {
  const configs: Record<BackendType, Omit<BackendConfig, 'type'>> = {
    diditCamera: {
      name: 'DiditCamera',
      isConfigured: true,
      endpoint: 'https://api.diditcamera.com/v1/analyze',
      timeout: 30000,
    },
    gemini: {
      name: 'Google Gemini',
      isConfigured: true,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
      timeout: 30000,
    },
    claude: {
      name: 'Anthropic Claude',
      isConfigured: true,
      endpoint: 'https://api.anthropic.com/v1/messages',
      timeout: 30000,
    },
    mock: {
      name: 'Mock Backend',
      isConfigured: true,
      endpoint: 'mock://localhost',
      timeout: 100,
    },
  };

  return {
    type,
    ...configs[type],
    ...overrides,
  };
}

/**
 * Creates a mock analysis result - TRUE response
 */
export function createTrueResponse(latencyMs?: number): AnalysisResult {
  return {
    result: true,
    confidence: faker.number.float({ min: 85, max: 99, fractionDigits: 2 }),
    rawResponse: {
      detected: true,
      label: 'person',
      confidence: 0.95,
    },
    latencyMs: latencyMs ?? faker.number.int({ min: 100, max: 500 }),
  };
}

/**
 * Creates a mock analysis result - FALSE response
 */
export function createFalseResponse(latencyMs?: number): AnalysisResult {
  return {
    result: false,
    confidence: faker.number.float({ min: 5, max: 30, fractionDigits: 2 }),
    rawResponse: {
      detected: false,
      label: null,
      confidence: 0.15,
    },
    latencyMs: latencyMs ?? faker.number.int({ min: 100, max: 500 }),
  };
}

/**
 * Creates a mock analysis result - Error response
 */
export function createErrorResponse(): AnalysisResult {
  return {
    result: false,
    confidence: 0,
    rawResponse: {
      error: 'Analysis failed',
      code: 'BACKEND_ERROR',
    },
    latencyMs: faker.number.int({ min: 1000, max: 3000 }),
  };
}

/**
 * Creates a sequence of responses for testing auto-stop
 * Returns FALSE responses followed by a TRUE response
 */
export function createAutoStopSequence(falseCount: number = 5): AnalysisResult[] {
  const responses: AnalysisResult[] = [];

  for (let i = 0; i < falseCount; i++) {
    responses.push(createFalseResponse(200 + i * 50));
  }

  responses.push(createTrueResponse(250));

  return responses;
}

/**
 * Creates DiditCamera-specific raw response format
 */
export function createDiditCameraRawResponse(result: boolean): unknown {
  return {
    status: 'success',
    data: {
      detection: {
        found: result,
        confidence: result ? 0.95 : 0.12,
        boundingBox: result ? { x: 100, y: 100, width: 200, height: 300 } : null,
      },
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Creates Gemini-specific raw response format
 */
export function createGeminiRawResponse(result: boolean): unknown {
  return {
    candidates: [
      {
        content: {
          parts: [
            {
              text: result
                ? 'Yes, I can see a person in this image.'
                : 'No, I do not see a person in this image.',
            },
          ],
        },
        finishReason: 'STOP',
        safetyRatings: [],
      },
    ],
  };
}

/**
 * Creates Claude-specific raw response format
 */
export function createClaudeRawResponse(result: boolean): unknown {
  return {
    id: `msg_${faker.string.alphanumeric(24)}`,
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: result
          ? 'Based on my analysis, yes, there is a person visible in this image.'
          : 'Based on my analysis, no, I do not detect a person in this image.',
      },
    ],
    model: 'claude-3-opus-20240229',
    stop_reason: 'end_turn',
  };
}
