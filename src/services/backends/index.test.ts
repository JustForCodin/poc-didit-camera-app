/**
 * Backend Factory Tests
 *
 * Tests for the backend factory and registry functions.
 */

import {
  getBackend,
  getAvailableBackends,
  isBackendAvailable,
  clearBackendCache,
  registerBackend,
  MockBackend,
  BACKEND_ERROR_MESSAGES,
  getBackendErrorMessage,
} from './index';
import type { VisionBackend, BackendType, Frame, AnalysisResult } from './types';
import type { Result } from '@/src/types/common';

describe('Backend Factory', () => {
  let mockConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    // Clear cache before each test for isolation
    clearBackendCache();
    // Set up spy before each test
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleWarn.mockRestore();
  });

  describe('getBackend', () => {
    it('should return mock backend by default', () => {
      const backend = getBackend();
      expect(backend.name).toBe('mock');
      expect(backend).toBeInstanceOf(MockBackend);
    });

    it('should return mock backend when type is "mock"', () => {
      const backend = getBackend('mock');
      expect(backend.name).toBe('mock');
      expect(backend).toBeInstanceOf(MockBackend);
    });

    it('should return same instance on repeated calls (singleton)', () => {
      const backend1 = getBackend('mock');
      const backend2 = getBackend('mock');
      expect(backend1).toBe(backend2);
    });

    it('should fall back to mock for unimplemented backends', () => {
      const backend = getBackend('gemini');
      expect(backend).toBeInstanceOf(MockBackend);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Backend 'gemini' not implemented, using mock"
      );
    });

    it('should fall back to mock for diditCamera', () => {
      const backend = getBackend('diditCamera');
      expect(backend).toBeInstanceOf(MockBackend);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Backend 'diditCamera' not implemented, using mock"
      );
    });

    it('should fall back to mock for claude', () => {
      const backend = getBackend('claude');
      expect(backend).toBeInstanceOf(MockBackend);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Backend 'claude' not implemented, using mock"
      );
    });

    it('should cache fallback backends separately', () => {
      const mockBackend = getBackend('mock');
      const geminiBackend = getBackend('gemini');

      // Both should work but be different instances
      expect(mockBackend).toBeInstanceOf(MockBackend);
      expect(geminiBackend).toBeInstanceOf(MockBackend);
      // They should be different cached instances
      expect(mockBackend).not.toBe(geminiBackend);
    });
  });

  describe('getAvailableBackends', () => {
    it('should return array with mock backend', () => {
      const backends = getAvailableBackends();
      expect(Array.isArray(backends)).toBe(true);
      expect(backends.length).toBeGreaterThanOrEqual(1);
      expect(backends[0].name).toBe('mock');
    });

    it('should return configured backends only', () => {
      const backends = getAvailableBackends();
      backends.forEach((backend) => {
        expect(backend.isConfigured()).toBe(true);
      });
    });
  });

  describe('isBackendAvailable', () => {
    it('should return true for mock backend', () => {
      expect(isBackendAvailable('mock')).toBe(true);
    });

    it('should check isConfigured on backend', () => {
      // All backends currently fall back to mock which is always configured
      expect(isBackendAvailable('gemini')).toBe(true);
      expect(isBackendAvailable('diditCamera')).toBe(true);
      expect(isBackendAvailable('claude')).toBe(true);
    });
  });

  describe('clearBackendCache', () => {
    it('should clear cached backend instances', () => {
      const backend1 = getBackend('mock');
      clearBackendCache();
      const backend2 = getBackend('mock');

      // After clearing, should get a new instance
      expect(backend1).not.toBe(backend2);
    });
  });

  describe('registerBackend', () => {
    it('should register custom backend instance', () => {
      // Create a custom mock backend with specific config
      const customBackend = new MockBackend({ fixedResult: true });

      registerBackend('mock', customBackend);

      const retrieved = getBackend('mock');
      expect(retrieved).toBe(customBackend);
    });

    it('should allow registering backends for different types', async () => {
      // Create custom backends
      const customMock: VisionBackend = {
        name: 'mock' as BackendType,
        isConfigured: () => true,
        analyze: async (): Promise<Result<AnalysisResult>> => ({
          success: true,
          data: {
            result: true,
            confidence: 100,
            rawResponse: { custom: true },
            latencyMs: 0,
          },
        }),
      };

      registerBackend('gemini', customMock);

      const backend = getBackend('gemini');
      expect(backend).toBe(customMock);

      const result = await backend.analyze(
        { mimeType: 'image/jpeg' } as Frame,
        'test'
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confidence).toBe(100);
      }
    });
  });

  describe('type exports', () => {
    it('should export VisionBackend type', () => {
      const backend: VisionBackend = getBackend('mock');
      expect(backend.name).toBeDefined();
      expect(backend.analyze).toBeDefined();
      expect(backend.isConfigured).toBeDefined();
    });

    it('should export BackendType', () => {
      const types: BackendType[] = ['mock', 'gemini', 'claude', 'diditCamera'];
      types.forEach((type) => {
        const backend = getBackend(type);
        expect(backend).toBeDefined();
      });
    });
  });

  describe('BACKEND_ERROR_MESSAGES', () => {
    it('should have message for network_error', () => {
      expect(BACKEND_ERROR_MESSAGES.network_error).toBe(
        'Unable to connect to analysis service.'
      );
    });

    it('should have message for timeout', () => {
      expect(BACKEND_ERROR_MESSAGES.timeout).toBe(
        'Analysis took too long. Please try again.'
      );
    });

    it('should have message for invalid_frame', () => {
      expect(BACKEND_ERROR_MESSAGES.invalid_frame).toBe(
        'Invalid image data. Please capture a new frame.'
      );
    });

    it('should have message for rate_limited', () => {
      expect(BACKEND_ERROR_MESSAGES.rate_limited).toBe(
        'Too many requests. Please wait a moment.'
      );
    });

    it('should have message for not_configured', () => {
      expect(BACKEND_ERROR_MESSAGES.not_configured).toBe(
        'Backend not configured. Please check settings.'
      );
    });

    it('should have default message', () => {
      expect(BACKEND_ERROR_MESSAGES.default).toBe(
        'Analysis failed. Please try again.'
      );
    });
  });

  describe('getBackendErrorMessage', () => {
    it('should return message for known error code', () => {
      expect(getBackendErrorMessage('network_error')).toBe(
        'Unable to connect to analysis service.'
      );
    });

    it('should return message for timeout error', () => {
      expect(getBackendErrorMessage('timeout')).toBe(
        'Analysis took too long. Please try again.'
      );
    });

    it('should return default message for unknown error code', () => {
      expect(getBackendErrorMessage('unknown_error_xyz')).toBe(
        'Analysis failed. Please try again.'
      );
    });

    it('should return default message for empty string', () => {
      expect(getBackendErrorMessage('')).toBe(
        'Analysis failed. Please try again.'
      );
    });

    it('should handle all defined error codes', () => {
      const errorCodes = [
        'network_error',
        'timeout',
        'invalid_frame',
        'rate_limited',
        'not_configured',
      ];
      errorCodes.forEach((code) => {
        const message = getBackendErrorMessage(code);
        expect(message).toBeDefined();
        expect(message).not.toBe(BACKEND_ERROR_MESSAGES.default);
      });
    });
  });
});
