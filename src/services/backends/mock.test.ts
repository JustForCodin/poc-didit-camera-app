/**
 * Mock Backend Tests
 *
 * Tests for the mock vision analysis backend.
 */

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

    it('should create with default config', () => {
      const backend = createMockBackend();
      const config = backend.getConfig();
      expect(config.latencyMs).toBeUndefined();
      expect(config.fixedResult).toBeUndefined();
      expect(config.fixedConfidence).toBeUndefined();
      expect(config.shouldError).toBeUndefined();
    });

    it('should create with custom config', () => {
      const backend = createMockBackend({
        latencyMs: 50,
        fixedResult: true,
        fixedConfidence: 85,
      });
      const config = backend.getConfig();
      expect(config.latencyMs).toBe(50);
      expect(config.fixedResult).toBe(true);
      expect(config.fixedConfidence).toBe(85);
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
        latencyMs: 10,
      });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result).toBe(true);
      }
    });

    it('should use fixed result false when configured', async () => {
      const backend = createMockBackend({
        fixedResult: false,
        latencyMs: 10,
      });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.result).toBe(false);
      }
    });

    it('should use fixed confidence when configured', async () => {
      const backend = createMockBackend({
        fixedConfidence: 85,
        latencyMs: 10,
      });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confidence).toBe(85);
      }
    });

    it('should generate random confidence between 60-95 when not configured', async () => {
      const backend = createMockBackend({ latencyMs: 10 });

      // Run multiple times to verify range
      for (let i = 0; i < 10; i++) {
        const result = await backend.analyze(mockFrame, 'test');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.confidence).toBeGreaterThanOrEqual(60);
          expect(result.data.confidence).toBeLessThanOrEqual(95);
        }
      }
    });

    it('should simulate error when configured', async () => {
      const backend = createMockBackend({
        shouldError: true,
        errorMessage: 'Test error',
        latencyMs: 10,
      });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Test error');
      }
    });

    it('should use default error message when not provided', async () => {
      const backend = createMockBackend({
        shouldError: true,
        latencyMs: 10,
      });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Mock backend simulated error');
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
        expect(raw.frameInfo).toEqual({
          mimeType: 'image/jpeg',
          width: 640,
          height: 480,
          hasBase64: true,
          hasUri: false,
        });
      }
    });

    it('should include timestamp in rawResponse', async () => {
      const backend = createMockBackend({ latencyMs: 10 });
      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        const raw = result.data.rawResponse as Record<string, unknown>;
        expect(raw.timestamp).toBeDefined();
        expect(typeof raw.timestamp).toBe('string');
      }
    });

    it('should handle frame with URI instead of base64', async () => {
      const backend = createMockBackend({ latencyMs: 10 });
      const frameWithUri: Frame = {
        uri: 'file:///path/to/image.jpg',
        mimeType: 'image/jpeg',
      };
      const result = await backend.analyze(frameWithUri, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        const raw = result.data.rawResponse as Record<string, unknown>;
        const frameInfo = raw.frameInfo as Record<string, unknown>;
        expect(frameInfo.hasBase64).toBe(false);
        expect(frameInfo.hasUri).toBe(true);
      }
    });

    it('should apply configured latency', async () => {
      const configuredLatency = 50;
      const backend = createMockBackend({ latencyMs: configuredLatency });

      const start = Date.now();
      const result = await backend.analyze(mockFrame, 'test');
      const elapsed = Date.now() - start;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.latencyMs).toBe(configuredLatency);
        // Allow some tolerance for timing
        expect(elapsed).toBeGreaterThanOrEqual(configuredLatency - 10);
      }
    });

    it('should apply random latency between 100-500ms when not configured', async () => {
      const backend = createMockBackend();

      const result = await backend.analyze(mockFrame, 'test');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.latencyMs).toBeGreaterThanOrEqual(100);
        expect(result.data.latencyMs).toBeLessThanOrEqual(500);
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

    it('should merge config updates', async () => {
      const backend = createMockBackend({
        latencyMs: 10,
        fixedResult: true,
      });
      backend.setConfig({ fixedConfidence: 75 });

      const config = backend.getConfig();
      expect(config.latencyMs).toBe(10);
      expect(config.fixedResult).toBe(true);
      expect(config.fixedConfidence).toBe(75);
    });

    it('should reset config to defaults', () => {
      const backend = createMockBackend({
        fixedResult: true,
        fixedConfidence: 99,
        latencyMs: 10,
        shouldError: true,
      });
      backend.resetConfig();

      const config = backend.getConfig();
      expect(config.fixedResult).toBeUndefined();
      expect(config.fixedConfidence).toBeUndefined();
      expect(config.latencyMs).toBeUndefined();
      expect(config.shouldError).toBeUndefined();
    });
  });

  describe('createMockBackend factory', () => {
    it('should create instance without config', () => {
      const backend = createMockBackend();
      expect(backend).toBeInstanceOf(MockBackend);
      expect(backend.name).toBe('mock');
    });

    it('should create instance with config', () => {
      const backend = createMockBackend({ fixedResult: true, latencyMs: 10 });
      expect(backend).toBeInstanceOf(MockBackend);
    });
  });
});
