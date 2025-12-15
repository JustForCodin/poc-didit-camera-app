/**
 * Dual Capture Service Tests
 *
 * Tests for dual capture service that coordinates video recording and frame capture.
 * Uses mocked VideoRecordingService and FrameCaptureService.
 */

import {
  DualCaptureService,
  dualCaptureService,
  startDualCapture,
  stopDualCapture,
  isDualCaptureActive,
  getDualCaptureState,
  DUAL_CAPTURE_ERROR_MESSAGES,
  getDualCaptureErrorMessage,
} from './dualCapture';
import type { DualCaptureOptions } from './dualCapture';
import { VideoRecordingService, videoRecordingService } from './recording';
import { FrameCaptureService, frameCaptureService } from './capture';

// Mock the service modules
jest.mock('./recording');
jest.mock('./capture');

describe('dualCapture service', () => {
  let mockConsoleError: jest.SpyInstance;
  let mockVideoService: jest.Mocked<VideoRecordingService>;
  let mockCaptureService: jest.Mocked<FrameCaptureService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Setup mock video recording service
    mockVideoService = videoRecordingService as jest.Mocked<VideoRecordingService>;
    mockVideoService.setCameraRef = jest.fn();
    mockVideoService.getState = jest.fn().mockReturnValue('idle');
    mockVideoService.startRecording = jest.fn().mockResolvedValue({
      success: true,
      data: { startedAt: '2025-01-01T00:00:00.000Z' },
    });
    mockVideoService.stopRecording = jest.fn().mockResolvedValue({
      success: true,
      data: {
        uri: 'file:///video.mp4',
        durationMs: 5000,
        fileSize: 1024000,
        startedAt: '2025-01-01T00:00:00.000Z',
        stoppedAt: '2025-01-01T00:00:05.000Z',
      },
    });
    mockVideoService.cancelRecording = jest.fn().mockResolvedValue({ success: true, data: undefined });
    mockVideoService.reset = jest.fn();

    // Setup mock frame capture service
    mockCaptureService = frameCaptureService as jest.Mocked<FrameCaptureService>;
    mockCaptureService.setCameraRef = jest.fn();
    mockCaptureService.getState = jest.fn().mockReturnValue('idle');
    mockCaptureService.getFrameCount = jest.fn().mockReturnValue(5);
    mockCaptureService.setOnFrameCaptured = jest.fn();
    mockCaptureService.startCapture = jest.fn().mockResolvedValue({
      success: true,
      data: { startedAt: '2025-01-01T00:00:00.000Z' },
    });
    mockCaptureService.stopCapture = jest.fn().mockResolvedValue({
      success: true,
      data: [
        { uri: 'file:///frame1.jpg', frameIndex: 0, capturedAt: '2025-01-01T00:00:01.000Z' },
        { uri: 'file:///frame2.jpg', frameIndex: 1, capturedAt: '2025-01-01T00:00:02.000Z' },
        { uri: 'file:///frame3.jpg', frameIndex: 2, capturedAt: '2025-01-01T00:00:03.000Z' },
      ],
    });
    mockCaptureService.cancelCapture = jest.fn().mockResolvedValue({ success: true, data: undefined });
    mockCaptureService.reset = jest.fn();

    // Reset the singleton service
    dualCaptureService.reset();
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  describe('DUAL_CAPTURE_ERROR_MESSAGES', () => {
    it('should have message for camera_not_ready', () => {
      expect(DUAL_CAPTURE_ERROR_MESSAGES.camera_not_ready).toBe(
        'Camera is not ready for dual capture.'
      );
    });

    it('should have message for already_active', () => {
      expect(DUAL_CAPTURE_ERROR_MESSAGES.already_active).toBe(
        'Dual capture is already in progress.'
      );
    });

    it('should have message for not_active', () => {
      expect(DUAL_CAPTURE_ERROR_MESSAGES.not_active).toBe(
        'No dual capture session in progress to stop.'
      );
    });

    it('should have message for recording_failed', () => {
      expect(DUAL_CAPTURE_ERROR_MESSAGES.recording_failed).toBe(
        'Failed to start video recording.'
      );
    });

    it('should have message for capture_failed', () => {
      expect(DUAL_CAPTURE_ERROR_MESSAGES.capture_failed).toBe(
        'Failed to start frame capture.'
      );
    });

    it('should have message for stop_failed', () => {
      expect(DUAL_CAPTURE_ERROR_MESSAGES.stop_failed).toBe(
        'Failed to stop dual capture session.'
      );
    });

    it('should have default message', () => {
      expect(DUAL_CAPTURE_ERROR_MESSAGES.default).toBe(
        'An unexpected dual capture error occurred.'
      );
    });
  });

  describe('getDualCaptureErrorMessage', () => {
    it('should return message for known error code', () => {
      expect(getDualCaptureErrorMessage('camera_not_ready')).toBe(
        'Camera is not ready for dual capture.'
      );
    });

    it('should return default message for unknown error code', () => {
      expect(getDualCaptureErrorMessage('unknown_error')).toBe(
        'An unexpected dual capture error occurred.'
      );
    });

    it('should return default message for empty string', () => {
      expect(getDualCaptureErrorMessage('')).toBe(
        'An unexpected dual capture error occurred.'
      );
    });
  });

  describe('DualCaptureService class', () => {
    let service: DualCaptureService;

    beforeEach(() => {
      service = new DualCaptureService(mockVideoService, mockCaptureService);
    });

    describe('initial state', () => {
      it('should start with idle state', () => {
        expect(service.getState()).toBe('idle');
      });

      it('should not be active initially', () => {
        expect(service.isActive()).toBe(false);
      });

      it('should return frame count from capture service', () => {
        expect(service.getFrameCount()).toBe(5);
        expect(mockCaptureService.getFrameCount).toHaveBeenCalled();
      });
    });

    describe('setCameraRef', () => {
      it('should set camera ref on both services', () => {
        const mockRef = { current: {} } as any;
        service.setCameraRef(mockRef);

        expect(mockVideoService.setCameraRef).toHaveBeenCalledWith(mockRef);
        expect(mockCaptureService.setCameraRef).toHaveBeenCalledWith(mockRef);
      });
    });

    describe('getRecordingState / getCaptureState', () => {
      it('should return recording state from video service', () => {
        mockVideoService.getState.mockReturnValue('recording');
        expect(service.getRecordingState()).toBe('recording');
      });

      it('should return capture state from capture service', () => {
        mockCaptureService.getState.mockReturnValue('capturing');
        expect(service.getCaptureState()).toBe('capturing');
      });
    });

    describe('setOnFrameCaptured', () => {
      it('should set callback on capture service', () => {
        const callback = jest.fn();
        service.setOnFrameCaptured(callback);

        expect(mockCaptureService.setOnFrameCaptured).toHaveBeenCalledWith(callback);
      });
    });

    describe('startDualCapture', () => {
      const mockCameraRef = { current: {} } as any;

      beforeEach(() => {
        service.setCameraRef(mockCameraRef);
      });

      it('should start both recording and capture concurrently', async () => {
        const result = await service.startDualCapture();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.startedAt).toBeDefined();
        }
        expect(mockVideoService.startRecording).toHaveBeenCalled();
        expect(mockCaptureService.startCapture).toHaveBeenCalled();
        expect(service.getState()).toBe('active');
        expect(service.isActive()).toBe(true);
      });

      it('should pass options to both services', async () => {
        const options: DualCaptureOptions = {
          captureOptions: { interval: 1000, maxFrames: 100 },
          recordingOptions: { maxDuration: 300 },
        };

        await service.startDualCapture(options);

        expect(mockVideoService.startRecording).toHaveBeenCalledWith(options.recordingOptions);
        expect(mockCaptureService.startCapture).toHaveBeenCalledWith(options.captureOptions);
      });

      it('should fail if camera ref not set', async () => {
        const newService = new DualCaptureService(mockVideoService, mockCaptureService);
        const result = await newService.startDualCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Camera is not ready for dual capture.');
        }
        expect(newService.getState()).toBe('idle');
      });

      it('should fail if already active', async () => {
        await service.startDualCapture();
        const result = await service.startDualCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Dual capture is already in progress.');
        }
      });

      it('should cancel capture if recording fails', async () => {
        mockVideoService.startRecording.mockResolvedValueOnce({
          success: false,
          error: 'Recording failed',
        });

        const result = await service.startDualCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to start video recording.');
        }
        expect(mockCaptureService.cancelCapture).toHaveBeenCalled();
        expect(service.getState()).toBe('error');
      });

      it('should cancel recording if capture fails', async () => {
        mockCaptureService.startCapture.mockResolvedValueOnce({
          success: false,
          error: 'Capture failed',
        });

        const result = await service.startDualCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to start frame capture.');
        }
        expect(mockVideoService.cancelRecording).toHaveBeenCalled();
        expect(service.getState()).toBe('error');
      });

      it('should cleanup both services on exception', async () => {
        mockVideoService.startRecording.mockRejectedValueOnce(new Error('Unexpected error'));

        const result = await service.startDualCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('An unexpected dual capture error occurred.');
        }
        expect(mockVideoService.cancelRecording).toHaveBeenCalled();
        expect(mockCaptureService.cancelCapture).toHaveBeenCalled();
        expect(mockConsoleError).toHaveBeenCalled();
      });
    });

    describe('stopDualCapture', () => {
      const mockCameraRef = { current: {} } as any;

      beforeEach(async () => {
        service.setCameraRef(mockCameraRef);
        await service.startDualCapture();
      });

      it('should stop both recording and capture concurrently', async () => {
        const result = await service.stopDualCapture();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.videoUri).toBe('file:///video.mp4');
          expect(result.data.frames).toHaveLength(3);
          expect(result.data.durationMs).toBeDefined();
        }
        expect(mockVideoService.stopRecording).toHaveBeenCalled();
        expect(mockCaptureService.stopCapture).toHaveBeenCalled();
        expect(service.getState()).toBe('idle');
        expect(service.isActive()).toBe(false);
      });

      it('should fail if not active', async () => {
        await service.stopDualCapture(); // First stop succeeds
        const result = await service.stopDualCapture(); // Second stop fails

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('No dual capture session in progress to stop.');
        }
      });

      it('should fail if recording stop fails', async () => {
        mockVideoService.stopRecording.mockResolvedValueOnce({
          success: false,
          error: 'Stop failed',
        });

        const result = await service.stopDualCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to stop dual capture session.');
        }
        expect(service.getState()).toBe('error');
      });

      it('should fail if capture stop fails', async () => {
        mockCaptureService.stopCapture.mockResolvedValueOnce({
          success: false,
          error: 'Stop failed',
        });

        const result = await service.stopDualCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to stop dual capture session.');
        }
        expect(service.getState()).toBe('error');
      });

      it('should handle exception during stop', async () => {
        mockVideoService.stopRecording.mockRejectedValueOnce(new Error('Unexpected error'));

        const result = await service.stopDualCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to stop dual capture session.');
        }
        expect(mockConsoleError).toHaveBeenCalled();
      });

      it('should return complete session data', async () => {
        const result = await service.stopDualCapture();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            videoUri: 'file:///video.mp4',
            frames: [
              { uri: 'file:///frame1.jpg', frameIndex: 0, capturedAt: '2025-01-01T00:00:01.000Z' },
              { uri: 'file:///frame2.jpg', frameIndex: 1, capturedAt: '2025-01-01T00:00:02.000Z' },
              { uri: 'file:///frame3.jpg', frameIndex: 2, capturedAt: '2025-01-01T00:00:03.000Z' },
            ],
            durationMs: expect.any(Number),
            startedAt: '2025-01-01T00:00:00.000Z',
            stoppedAt: '2025-01-01T00:00:05.000Z',
            videoFileSize: 1024000,
          });
        }
      });
    });

    describe('cancelDualCapture', () => {
      const mockCameraRef = { current: {} } as any;

      it('should cancel both services when active', async () => {
        service.setCameraRef(mockCameraRef);
        await service.startDualCapture();

        const result = await service.cancelDualCapture();

        expect(result.success).toBe(true);
        expect(mockVideoService.cancelRecording).toHaveBeenCalled();
        expect(mockCaptureService.cancelCapture).toHaveBeenCalled();
        expect(service.getState()).toBe('idle');
      });

      it('should succeed if not active', async () => {
        const result = await service.cancelDualCapture();

        expect(result.success).toBe(true);
        expect(mockVideoService.cancelRecording).not.toHaveBeenCalled();
        expect(mockCaptureService.cancelCapture).not.toHaveBeenCalled();
      });

      it('should handle exception gracefully', async () => {
        service.setCameraRef(mockCameraRef);
        await service.startDualCapture();

        mockVideoService.cancelRecording.mockRejectedValueOnce(new Error('Cancel error'));

        const result = await service.cancelDualCapture();

        expect(result.success).toBe(true); // Still succeeds
        expect(service.getState()).toBe('idle');
        expect(mockConsoleError).toHaveBeenCalled();
      });
    });

    describe('reset', () => {
      it('should reset service state', () => {
        const mockRef = { current: {} } as any;
        service.setCameraRef(mockRef);

        service.reset();

        expect(service.getState()).toBe('idle');
        expect(mockVideoService.reset).toHaveBeenCalled();
        expect(mockCaptureService.reset).toHaveBeenCalled();
      });
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(dualCaptureService).toBeInstanceOf(DualCaptureService);
    });

    it('should use real service singletons', () => {
      // Verify the singleton is using the real mocked services
      expect(dualCaptureService.getFrameCount()).toBe(5);
    });
  });

  describe('standalone functions', () => {
    const mockCameraRef = { current: {} } as any;

    beforeEach(() => {
      dualCaptureService.reset();
    });

    describe('startDualCapture', () => {
      it('should start dual capture using singleton', async () => {
        const result = await startDualCapture(mockCameraRef);

        expect(result.success).toBe(true);
        expect(mockVideoService.setCameraRef).toHaveBeenCalledWith(mockCameraRef);
        expect(mockVideoService.startRecording).toHaveBeenCalled();
        expect(mockCaptureService.startCapture).toHaveBeenCalled();
      });

      it('should pass options to singleton', async () => {
        const options: DualCaptureOptions = {
          captureOptions: { interval: 1000 },
          recordingOptions: { maxDuration: 300 },
        };

        await startDualCapture(mockCameraRef, options);

        expect(mockVideoService.startRecording).toHaveBeenCalledWith(options.recordingOptions);
        expect(mockCaptureService.startCapture).toHaveBeenCalledWith(options.captureOptions);
      });
    });

    describe('stopDualCapture', () => {
      it('should stop dual capture using singleton', async () => {
        await startDualCapture(mockCameraRef);
        const result = await stopDualCapture();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.videoUri).toBeDefined();
          expect(result.data.frames).toHaveLength(3);
        }
      });
    });

    describe('isDualCaptureActive', () => {
      it('should return false when idle', () => {
        expect(isDualCaptureActive()).toBe(false);
      });

      it('should return true when active', async () => {
        await startDualCapture(mockCameraRef);
        expect(isDualCaptureActive()).toBe(true);
      });

      it('should return false after stop', async () => {
        await startDualCapture(mockCameraRef);
        await stopDualCapture();
        expect(isDualCaptureActive()).toBe(false);
      });
    });

    describe('getDualCaptureState', () => {
      it('should return current state', async () => {
        expect(getDualCaptureState()).toBe('idle');

        await startDualCapture(mockCameraRef);
        expect(getDualCaptureState()).toBe('active');

        await stopDualCapture();
        expect(getDualCaptureState()).toBe('idle');
      });
    });
  });

  describe('Result<T> type compliance', () => {
    it('should return Result<{ startedAt: string }> from startDualCapture', async () => {
      const mockRef = { current: {} } as any;
      dualCaptureService.setCameraRef(mockRef);

      const result = await dualCaptureService.startDualCapture();

      expect(result).toHaveProperty('success');
      if (result.success) {
        expect(result.data).toHaveProperty('startedAt');
        expect(typeof result.data.startedAt).toBe('string');
      } else {
        expect(result).toHaveProperty('error');
      }
    });

    it('should return Result<DualCaptureSession> from stopDualCapture', async () => {
      const mockRef = { current: {} } as any;
      dualCaptureService.setCameraRef(mockRef);
      await dualCaptureService.startDualCapture();

      const result = await dualCaptureService.stopDualCapture();

      expect(result).toHaveProperty('success');
      if (result.success) {
        expect(result.data).toHaveProperty('videoUri');
        expect(result.data).toHaveProperty('frames');
        expect(result.data).toHaveProperty('durationMs');
        expect(result.data).toHaveProperty('startedAt');
        expect(result.data).toHaveProperty('stoppedAt');
        expect(Array.isArray(result.data.frames)).toBe(true);
      } else {
        expect(result).toHaveProperty('error');
      }
    });

    it('should return Result<void> from cancelDualCapture', async () => {
      const result = await dualCaptureService.cancelDualCapture();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });
  });
});
