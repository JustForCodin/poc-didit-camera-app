/**
 * Example Unit Tests
 *
 * Demonstrates testing patterns for the poc-didit-camera-app project.
 * These tests validate the test infrastructure is working correctly.
 */

import {
  createUser,
  createSession,
  createCompletedSession,
  createTrueResponse,
  createFalseResponse,
  createAutoStopSequence,
} from '../support/fixtures/factories';

import {
  mockBackend,
  mockSuccess,
  mockError,
  expectSuccess,
  expectError,
} from '../support/helpers';

describe('Test Infrastructure', () => {
  describe('User Factory', () => {
    it('should create user with unique data', () => {
      const user1 = createUser();
      const user2 = createUser();

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).not.toBe(user2.email);
      expect(user1.name).toBeTruthy();
      expect(user1.deviceName).toBeTruthy();
      expect(user1.createdAt).toBeTruthy();
    });

    it('should allow overrides', () => {
      const user = createUser({
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      // Other fields still generated
      expect(user.id).toBeTruthy();
    });
  });

  describe('Session Factory', () => {
    it('should create session with defaults', () => {
      const session = createSession();

      expect(session.id).toBeTruthy();
      expect(session.status).toBe('idle');
      expect(session.selectedBackends).toEqual(['mock']);
      expect(session.frameResults).toEqual([]);
      expect(session.autoStopOnTrue).toBe(true);
    });

    it('should create completed session with frames', () => {
      const session = createCompletedSession(5);

      expect(session.status).toBe('completed');
      expect(session.startedAt).toBeTruthy();
      expect(session.endedAt).toBeTruthy();
      expect(session.videoPath).toBeTruthy();
      expect(session.videoUrl).toBeTruthy();
      expect(session.frameResults).toHaveLength(5);

      // Verify frame numbers are sequential
      session.frameResults.forEach((frame, index) => {
        expect(frame.frameNumber).toBe(index + 1);
        expect(frame.sessionId).toBe(session.id);
      });
    });
  });

  describe('Backend Factory', () => {
    it('should create TRUE response', () => {
      const response = createTrueResponse();

      expect(response.result).toBe(true);
      expect(response.confidence).toBeGreaterThanOrEqual(85);
      expect(response.confidence).toBeLessThanOrEqual(99);
      expect(response.latencyMs).toBeGreaterThan(0);
    });

    it('should create FALSE response', () => {
      const response = createFalseResponse();

      expect(response.result).toBe(false);
      expect(response.confidence).toBeGreaterThanOrEqual(5);
      expect(response.confidence).toBeLessThanOrEqual(30);
    });

    it('should create auto-stop sequence', () => {
      const sequence = createAutoStopSequence(3);

      expect(sequence).toHaveLength(4); // 3 FALSE + 1 TRUE
      expect(sequence[0].result).toBe(false);
      expect(sequence[1].result).toBe(false);
      expect(sequence[2].result).toBe(false);
      expect(sequence[3].result).toBe(true);
    });
  });

  describe('Mock Backend', () => {
    beforeEach(() => {
      mockBackend.reset();
    });

    it('should return response from sequence', async () => {
      const sequence = createAutoStopSequence(2);
      mockBackend.setResponseSequence(sequence);

      const response1 = await mockBackend.analyze({}, 'test');
      const response2 = await mockBackend.analyze({}, 'test');
      const response3 = await mockBackend.analyze({}, 'test');

      expect(response1.result).toBe(false);
      expect(response2.result).toBe(false);
      expect(response3.result).toBe(true);
    });

    it('should simulate latency', async () => {
      mockBackend.setLatency(50);

      const start = Date.now();
      await mockBackend.analyze({}, 'test');
      const duration = Date.now() - start;

      // Allow 5ms tolerance for timer precision in CI environments
      expect(duration).toBeGreaterThanOrEqual(45);
    });

    it('should be configurable', () => {
      expect(mockBackend.isConfigured()).toBe(true);
      expect(mockBackend.name).toBe('mock');
    });
  });

  describe('Result Type Helpers', () => {
    it('should create success result', () => {
      const result = mockSuccess({ id: '123', name: 'Test' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('123');
        expect(result.data.name).toBe('Test');
      }
    });

    it('should create error result', () => {
      const result = mockError<{ id: string }>('Something went wrong');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Something went wrong');
      }
    });

    it('should extract data from success result', () => {
      const result = mockSuccess({ value: 42 });
      const data = expectSuccess(result);

      expect(data.value).toBe(42);
    });

    it('should extract error from error result', () => {
      const result = mockError('Failed');
      const error = expectError(result);

      expect(error).toBe('Failed');
    });

    it('should throw when expecting success on error', () => {
      const result = mockError('Oops');

      expect(() => expectSuccess(result)).toThrow('Expected success but got error: Oops');
    });

    it('should throw when expecting error on success', () => {
      const result = mockSuccess({ ok: true });

      expect(() => expectError(result)).toThrow('Expected error but got success');
    });
  });
});

describe('ISO Date Format Validation', () => {
  it('should store dates as ISO strings', () => {
    const session = createSession();

    // Verify ISO format
    expect(session.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(session.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

    // Verify parseable
    expect(new Date(session.createdAt).getTime()).not.toBeNaN();
  });

  it('should store user dates as ISO strings', () => {
    const user = createUser();

    expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(new Date(user.createdAt).getTime()).not.toBeNaN();
  });
});
