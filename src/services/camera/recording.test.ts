/**
 * Video Recording Service Tests
 *
 * Tests for video recording service functions.
 * Uses mocked expo-camera and expo-file-system.
 */

import {
  VideoRecordingService,
  videoRecordingService,
  startRecording,
  stopRecording,
  isRecording,
  getRecordingState,
  RECORDING_ERROR_MESSAGES,
  getRecordingErrorMessage,
} from './recording';
import type { RecordingState, RecordingOptions, RecordingResult } from './recording';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  CameraView: jest.fn(),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn().mockResolvedValue({
    exists: true,
    size: 1024000,
  }),
}));

describe('recording service', () => {
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    // Reset the singleton service before each test
    videoRecordingService.reset();
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  describe('RECORDING_ERROR_MESSAGES', () => {
    it('should have message for camera_not_ready', () => {
      expect(RECORDING_ERROR_MESSAGES.camera_not_ready).toBe(
        'Camera is not ready for recording.'
      );
    });

    it('should have message for already_recording', () => {
      expect(RECORDING_ERROR_MESSAGES.already_recording).toBe(
        'Recording is already in progress.'
      );
    });

    it('should have message for not_recording', () => {
      expect(RECORDING_ERROR_MESSAGES.not_recording).toBe(
        'No recording in progress to stop.'
      );
    });

    it('should have message for start_failed', () => {
      expect(RECORDING_ERROR_MESSAGES.start_failed).toBe(
        'Failed to start recording.'
      );
    });

    it('should have message for stop_failed', () => {
      expect(RECORDING_ERROR_MESSAGES.stop_failed).toBe(
        'Failed to stop recording.'
      );
    });

    it('should have message for file_not_found', () => {
      expect(RECORDING_ERROR_MESSAGES.file_not_found).toBe(
        'Recorded video file not found.'
      );
    });

    it('should have message for permission_denied', () => {
      expect(RECORDING_ERROR_MESSAGES.permission_denied).toBe(
        'Camera permission required for recording.'
      );
    });

    it('should have default message', () => {
      expect(RECORDING_ERROR_MESSAGES.default).toBe(
        'An unexpected recording error occurred.'
      );
    });
  });

  describe('getRecordingErrorMessage', () => {
    it('should return message for known error code', () => {
      expect(getRecordingErrorMessage('camera_not_ready')).toBe(
        'Camera is not ready for recording.'
      );
    });

    it('should return default message for unknown error code', () => {
      expect(getRecordingErrorMessage('unknown_error')).toBe(
        'An unexpected recording error occurred.'
      );
    });

    it('should return default message for empty string', () => {
      expect(getRecordingErrorMessage('')).toBe(
        'An unexpected recording error occurred.'
      );
    });
  });

  describe('VideoRecordingService class', () => {
    let service: VideoRecordingService;

    beforeEach(() => {
      service = new VideoRecordingService();
    });

    describe('initial state', () => {
      it('should start with idle state', () => {
        expect(service.getState()).toBe('idle');
      });

      it('should not be recording initially', () => {
        expect(service.isRecording()).toBe(false);
      });
    });

    describe('setCameraRef', () => {
      it('should accept a camera ref', () => {
        const mockRef = { current: { recordAsync: jest.fn(), stopRecording: jest.fn() } };
        // Should not throw
        service.setCameraRef(mockRef as any);
        expect(service.getState()).toBe('idle');
      });
    });

    describe('startRecording', () => {
      it('should return error when camera ref is not set', async () => {
        const result = await service.startRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Camera is not ready for recording.');
        }
      });

      it('should return error when camera ref current is null', async () => {
        const mockRef = { current: null };
        service.setCameraRef(mockRef as any);

        const result = await service.startRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Camera is not ready for recording.');
        }
      });

      it('should start recording successfully with valid camera ref', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        const result = await service.startRecording();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.startedAt).toBeDefined();
          expect(typeof result.data.startedAt).toBe('string');
        }
        expect(service.getState()).toBe('recording');
        expect(service.isRecording()).toBe(true);
      });

      it('should use default options when none provided', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();

        expect(mockRecordAsync).toHaveBeenCalledWith({ maxDuration: 300 });
      });

      it('should use custom options when provided', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        await service.startRecording({ maxDuration: 60, maxFileSize: 5000000 });

        expect(mockRecordAsync).toHaveBeenCalledWith({ maxDuration: 60, maxFileSize: 5000000 });
      });

      it('should clamp negative maxDuration to minimum', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        await service.startRecording({ maxDuration: -100 });

        expect(mockRecordAsync).toHaveBeenCalledWith({ maxDuration: 1 });
      });

      it('should clamp excessive maxDuration to maximum', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        await service.startRecording({ maxDuration: 10000 });

        expect(mockRecordAsync).toHaveBeenCalledWith({ maxDuration: 3600 });
      });

      it('should clamp negative maxFileSize to zero', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        await service.startRecording({ maxFileSize: -1000 });

        // maxFileSize 0 means no limit, so it should not be included in options
        expect(mockRecordAsync).toHaveBeenCalledWith({ maxDuration: 300 });
      });

      it('should floor decimal values for options', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        await service.startRecording({ maxDuration: 60.7, maxFileSize: 1000.9 });

        expect(mockRecordAsync).toHaveBeenCalledWith({ maxDuration: 60, maxFileSize: 1000 });
      });

      it('should return error if already recording', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.startRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Recording is already in progress.');
        }
      });

      it('should return error and set state to error when recordAsync throws', async () => {
        const mockRecordAsync = jest.fn().mockImplementation(() => {
          throw new Error('Camera hardware error');
        });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        const result = await service.startRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to start recording.');
        }
        expect(service.getState()).toBe('error');
        expect(mockConsoleError).toHaveBeenCalled();
      });
    });

    describe('stopRecording', () => {
      it('should return error when not recording', async () => {
        const result = await service.stopRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('No recording in progress to stop.');
        }
      });

      it('should stop recording successfully', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.stopRecording();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.uri).toBe('file://video.mp4');
          expect(result.data.durationMs).toBeGreaterThanOrEqual(0);
          expect(result.data.startedAt).toBeDefined();
          expect(result.data.stoppedAt).toBeDefined();
        }
        expect(mockStopRecording).toHaveBeenCalled();
        expect(service.getState()).toBe('idle');
        expect(service.isRecording()).toBe(false);
      });

      it('should return error when camera ref becomes null during recording', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        // Simulate camera ref becoming null (e.g., component unmount)
        mockRef.current = null as any;

        const result = await service.stopRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Camera is not ready for recording.');
        }
      });

      it('should return error and set state to error when stop throws', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn().mockImplementation(() => {
          throw new Error('Hardware failure');
        });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.stopRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to stop recording.');
        }
        expect(service.getState()).toBe('error');
        expect(mockConsoleError).toHaveBeenCalled();
      });

      it('should include fileSize when file exists with size', async () => {
        const FileSystem = require('expo-file-system');
        FileSystem.getInfoAsync.mockResolvedValue({ exists: true, size: 2048000 });

        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.stopRecording();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.fileSize).toBe(2048000);
        }
      });

      it('should handle file info without size property', async () => {
        const FileSystem = require('expo-file-system');
        FileSystem.getInfoAsync.mockResolvedValue({ exists: true });

        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.stopRecording();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.fileSize).toBeUndefined();
        }
      });

      it('should handle file not existing', async () => {
        const FileSystem = require('expo-file-system');
        FileSystem.getInfoAsync.mockResolvedValue({ exists: false });

        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.stopRecording();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.fileSize).toBeUndefined();
        }
      });

      it('should handle getInfoAsync throwing an error', async () => {
        const FileSystem = require('expo-file-system');
        FileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));

        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.stopRecording();

        // Should still succeed, fileSize is optional
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.fileSize).toBeUndefined();
        }
      });

      it('should return error when recordingPromise is null (edge case)', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();

        // Manually manipulate internal state to simulate edge case
        // where recordingPromise is null but state is 'recording'
        (service as any).recordingPromise = null;

        const result = await service.stopRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to stop recording.');
        }
      });

      it('should handle null startTime and use stoppedAt as fallback (edge case)', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();

        // Manually clear startTime to simulate edge case
        (service as any).startTime = null;

        const result = await service.stopRecording();

        expect(result.success).toBe(true);
        if (result.success) {
          // Duration should be 0 since startTime was null
          expect(result.data.durationMs).toBe(0);
          // startedAt should fallback to stoppedAt
          expect(result.data.startedAt).toBe(result.data.stoppedAt);
        }
      });
    });

    describe('cancelRecording', () => {
      it('should do nothing when not recording', async () => {
        const result = await service.cancelRecording();

        expect(result.success).toBe(true);
      });

      it('should cancel and reset state when recording', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.cancelRecording();

        expect(result.success).toBe(true);
        expect(mockStopRecording).toHaveBeenCalled();
        expect(service.getState()).toBe('idle');
        expect(service.isRecording()).toBe(false);
      });

      it('should handle error during cancel gracefully', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn().mockImplementation(() => {
          throw new Error('Cancel failed');
        });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        const result = await service.cancelRecording();

        // Should still succeed (graceful handling)
        expect(result.success).toBe(true);
        expect(service.getState()).toBe('idle');
        expect(mockConsoleError).toHaveBeenCalled();
      });

      it('should cancel gracefully when cameraRef becomes null', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockStopRecording = jest.fn();
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();

        // Simulate cameraRef becoming null (e.g., component unmount)
        mockRef.current = null as any;

        const result = await service.cancelRecording();

        // Should still succeed and reset state
        expect(result.success).toBe(true);
        expect(service.getState()).toBe('idle');
        // stopRecording should NOT be called since cameraRef.current is null
        expect(mockStopRecording).not.toHaveBeenCalled();
      });
    });

    describe('reset', () => {
      it('should reset all state', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };
        service.setCameraRef(mockRef as any);

        await service.startRecording();
        service.reset();

        expect(service.getState()).toBe('idle');
        expect(service.isRecording()).toBe(false);
      });
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton videoRecordingService', () => {
      expect(videoRecordingService).toBeDefined();
      expect(videoRecordingService).toBeInstanceOf(VideoRecordingService);
    });

    it('should return same instance', () => {
      const instance1 = videoRecordingService;
      const instance2 = videoRecordingService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('standalone functions', () => {
    describe('startRecording', () => {
      it('should return error when camera ref is invalid', async () => {
        const mockRef = { current: null };
        const result = await startRecording(mockRef as any);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Camera is not ready for recording.');
        }
      });

      it('should start recording with valid ref', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };

        const result = await startRecording(mockRef as any);

        expect(result.success).toBe(true);
      });

      it('should pass options to service', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };

        await startRecording(mockRef as any, { maxDuration: 120 });

        expect(mockRecordAsync).toHaveBeenCalledWith({ maxDuration: 120 });
      });
    });

    describe('stopRecording', () => {
      it('should return error when not recording', async () => {
        const result = await stopRecording();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('No recording in progress to stop.');
        }
      });
    });

    describe('isRecording', () => {
      it('should return false initially', () => {
        expect(isRecording()).toBe(false);
      });

      it('should return true when recording', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };

        await startRecording(mockRef as any);

        expect(isRecording()).toBe(true);
      });
    });

    describe('getRecordingState', () => {
      it('should return idle initially', () => {
        expect(getRecordingState()).toBe('idle');
      });

      it('should return recording when recording', async () => {
        const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
        const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };

        await startRecording(mockRef as any);

        expect(getRecordingState()).toBe('recording');
      });
    });
  });

  describe('type exports', () => {
    it('RecordingState should be a valid type', () => {
      const state: RecordingState = 'idle';
      expect(['idle', 'starting', 'recording', 'stopping', 'error']).toContain(state);
    });

    it('RecordingOptions should be a valid interface', () => {
      const options: RecordingOptions = {
        maxDuration: 300,
        maxFileSize: 1000000,
      };
      expect(options.maxDuration).toBe(300);
      expect(options.maxFileSize).toBe(1000000);
    });

    it('RecordingResult should be a valid interface', () => {
      const result: RecordingResult = {
        uri: 'file://video.mp4',
        durationMs: 5000,
        fileSize: 1024000,
        startedAt: new Date().toISOString(),
        stoppedAt: new Date().toISOString(),
      };
      expect(result.uri).toBe('file://video.mp4');
      expect(result.durationMs).toBe(5000);
    });
  });

  describe('Result<T> type compliance', () => {
    it('startRecording should return Result type with success', async () => {
      const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
      const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: jest.fn() } };

      const result = await startRecording(mockRef as any);

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result).toHaveProperty('data');
        expect(result.data).toHaveProperty('startedAt');
      }
    });

    it('startRecording should return Result type with error', async () => {
      const mockRef = { current: null };

      const result = await startRecording(mockRef as any);

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });

    it('stopRecording should return Result type with success', async () => {
      const mockRecordAsync = jest.fn().mockResolvedValue({ uri: 'file://video.mp4' });
      const mockStopRecording = jest.fn();
      const mockRef = { current: { recordAsync: mockRecordAsync, stopRecording: mockStopRecording } };

      await startRecording(mockRef as any);
      const result = await stopRecording();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result).toHaveProperty('data');
        expect(result.data).toHaveProperty('uri');
        expect(result.data).toHaveProperty('durationMs');
      }
    });

    it('stopRecording should return Result type with error', async () => {
      const result = await stopRecording();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });
  });
});
