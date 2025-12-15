/**
 * Frame Capture Service Tests
 *
 * Tests for frame capture service functions.
 * Uses mocked expo-camera and expo-file-system.
 */

import {
  FrameCaptureService,
  frameCaptureService,
  startCapture,
  stopCapture,
  isCapturing,
  getCaptureState,
  CAPTURE_ERROR_MESSAGES,
  getCaptureErrorMessage,
} from './capture';
import type { CaptureState, CaptureOptions, CapturedFrame } from './capture';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  CameraView: jest.fn(),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn().mockResolvedValue({
    exists: true,
    size: 50000, // ~50KB per frame
  }),
}));

describe('capture service', () => {
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleLog: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockConsoleLog = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});
    // Reset the singleton service before each test
    frameCaptureService.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('CAPTURE_ERROR_MESSAGES', () => {
    it('should have message for camera_not_ready', () => {
      expect(CAPTURE_ERROR_MESSAGES.camera_not_ready).toBe(
        'Camera is not ready for frame capture.'
      );
    });

    it('should have message for already_capturing', () => {
      expect(CAPTURE_ERROR_MESSAGES.already_capturing).toBe(
        'Frame capture is already in progress.'
      );
    });

    it('should have message for not_capturing', () => {
      expect(CAPTURE_ERROR_MESSAGES.not_capturing).toBe(
        'No capture in progress to stop.'
      );
    });

    it('should have message for start_failed', () => {
      expect(CAPTURE_ERROR_MESSAGES.start_failed).toBe(
        'Failed to start frame capture.'
      );
    });

    it('should have message for capture_failed', () => {
      expect(CAPTURE_ERROR_MESSAGES.capture_failed).toBe(
        'Failed to capture frame.'
      );
    });

    it('should have message for stop_failed', () => {
      expect(CAPTURE_ERROR_MESSAGES.stop_failed).toBe(
        'Failed to stop frame capture.'
      );
    });

    it('should have message for interval_invalid', () => {
      expect(CAPTURE_ERROR_MESSAGES.interval_invalid).toBe(
        'Capture interval must be between 500ms and 5000ms.'
      );
    });

    it('should have default message', () => {
      expect(CAPTURE_ERROR_MESSAGES.default).toBe(
        'An unexpected capture error occurred.'
      );
    });
  });

  describe('getCaptureErrorMessage', () => {
    it('should return message for known error code', () => {
      expect(getCaptureErrorMessage('camera_not_ready')).toBe(
        'Camera is not ready for frame capture.'
      );
    });

    it('should return default message for unknown error code', () => {
      expect(getCaptureErrorMessage('unknown_error')).toBe(
        'An unexpected capture error occurred.'
      );
    });

    it('should return default message for empty string', () => {
      expect(getCaptureErrorMessage('')).toBe(
        'An unexpected capture error occurred.'
      );
    });
  });

  describe('FrameCaptureService class', () => {
    let service: FrameCaptureService;

    beforeEach(() => {
      service = new FrameCaptureService();
    });

    describe('initial state', () => {
      it('should start with idle state', () => {
        expect(service.getState()).toBe('idle');
      });

      it('should not be capturing initially', () => {
        expect(service.isCapturing()).toBe(false);
      });

      it('should have zero frame count initially', () => {
        expect(service.getFrameCount()).toBe(0);
      });

      it('should have empty frames array initially', () => {
        expect(service.getFrames()).toEqual([]);
      });
    });

    describe('setCameraRef', () => {
      it('should accept a camera ref', () => {
        const mockRef = { current: { takePictureAsync: jest.fn() } };
        // Should not throw
        service.setCameraRef(mockRef as any);
        expect(service.getState()).toBe('idle');
      });
    });

    describe('getFrameCount', () => {
      it('should return 0 initially', () => {
        expect(service.getFrameCount()).toBe(0);
      });
    });

    describe('getFrames', () => {
      it('should return empty array initially', () => {
        expect(service.getFrames()).toEqual([]);
      });

      it('should return a copy of frames array', () => {
        const frames1 = service.getFrames();
        const frames2 = service.getFrames();
        expect(frames1).not.toBe(frames2); // Different references
        expect(frames1).toEqual(frames2); // Same content
      });
    });

    describe('startCapture', () => {
      it('should return error when camera ref is not set', async () => {
        const result = await service.startCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Camera is not ready for frame capture.');
        }
      });

      it('should return error when camera ref current is null', async () => {
        const mockRef = { current: null };
        service.setCameraRef(mockRef as any);

        const result = await service.startCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Camera is not ready for frame capture.');
        }
      });

      it('should start capture successfully with valid camera ref', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        const result = await service.startCapture();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.startedAt).toBeDefined();
          expect(typeof result.data.startedAt).toBe('string');
        }
        expect(service.getState()).toBe('capturing');
        expect(service.isCapturing()).toBe(true);
      });

      it('should use default interval of 1000ms when none provided', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        // Fast-forward 1000ms - should capture 1 frame
        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledTimes(1);
      });

      it('should use custom interval when provided', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ interval: 2000 });

        // Fast-forward 2000ms - should capture 1 frame
        jest.advanceTimersByTime(2000);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledTimes(1);
      });

      it('should clamp interval to minimum 500ms', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ interval: 100 }); // Below minimum

        // Fast-forward 500ms - should capture 1 frame
        jest.advanceTimersByTime(500);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledTimes(1);
      });

      it('should clamp interval to maximum 5000ms', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ interval: 10000 }); // Above maximum

        // Fast-forward 5000ms - should capture 1 frame
        jest.advanceTimersByTime(5000);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledTimes(1);
      });

      it('should clamp maxFrames to minimum 1', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ maxFrames: 0 });

        // Fast-forward to capture frame
        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        // Should stop after 1 frame (clamped minimum)
        expect(service.getFrameCount()).toBe(1);
      });

      it('should clamp maxFrames to maximum 600', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ maxFrames: 1000 }); // Above maximum

        // Verify internally clamped to 600
        for (let i = 0; i < 601; i++) {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        }

        // Should stop at 600 frames
        expect(service.getFrameCount()).toBe(600);
      });

      it('should clamp quality to minimum 50', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ quality: 10 });

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        // Should use 0.5 quality (50 / 100)
        expect(mockTakePicture).toHaveBeenCalledWith({
          quality: 0.5,
          skipProcessing: true,
          exif: false,
        });
      });

      it('should clamp quality to maximum 100', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ quality: 150 });

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        // Should use 1.0 quality (100 / 100)
        expect(mockTakePicture).toHaveBeenCalledWith({
          quality: 1.0,
          skipProcessing: true,
          exif: false,
        });
      });

      it('should floor decimal interval values', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ interval: 1500.9 });

        // Should use 1500ms (floored)
        jest.advanceTimersByTime(1500);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledTimes(1);
      });

      it('should return error when already capturing', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();
        const result = await service.startCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Frame capture is already in progress.');
        }
      });

      it('should return error when in starting state', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        // Start capture (will be in starting state briefly)
        const promise1 = service.startCapture();
        const promise2 = service.startCapture();

        const result1 = await promise1;
        const result2 = await promise2;

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(false);
      });

      it('should capture frames at specified interval', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ interval: 1000 });

        // Capture 3 frames
        for (let i = 0; i < 3; i++) {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        }

        expect(mockTakePicture).toHaveBeenCalledTimes(3);
        expect(service.getFrameCount()).toBe(3);
      });

      it('should include timestamp in captured frames', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg', width: 1920, height: 1080 });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        const frames = service.getFrames();
        expect(frames[0].timestamp).toBeDefined();
        expect(typeof frames[0].timestamp).toBe('string');
        expect(frames[0].capturedAt).toBeDefined();
      });

      it('should include frameIndex in captured frames', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        // Capture 3 frames
        for (let i = 0; i < 3; i++) {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        }

        const frames = service.getFrames();
        expect(frames[0].frameIndex).toBe(0);
        expect(frames[1].frameIndex).toBe(1);
        expect(frames[2].frameIndex).toBe(2);
      });

      it('should include uri in captured frames', async () => {
        const mockTakePicture = jest.fn()
          .mockResolvedValueOnce({ uri: 'file://frame1.jpg' })
          .mockResolvedValueOnce({ uri: 'file://frame2.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();
        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        const frames = service.getFrames();
        expect(frames[0].uri).toBe('file://frame1.jpg');
        expect(frames[1].uri).toBe('file://frame2.jpg');
      });

      it('should include fileSize when available', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        const frames = service.getFrames();
        expect(frames[0].fileSize).toBe(50000);
      });

      it('should continue capturing when fileSize fetch fails', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        // Mock FileSystem to fail
        const FileSystem = require('expo-file-system');
        FileSystem.getInfoAsync.mockRejectedValueOnce(new Error('File not found'));

        await service.startCapture();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        const frames = service.getFrames();
        expect(frames.length).toBe(1);
        expect(frames[0].fileSize).toBeUndefined();
      });

      it('should use skipProcessing and exif options for performance', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledWith({
          quality: 0.8, // Default 80%
          skipProcessing: true,
          exif: false,
        });
      });

      it('should auto-stop when maxFrames is reached', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ maxFrames: 3 });

        // Capture 4 intervals worth
        for (let i = 0; i < 4; i++) {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        }

        // Should only have 3 frames
        expect(service.getFrameCount()).toBe(3);
        expect(service.isCapturing()).toBe(false);
        expect(service.getState()).toBe('idle');
      });

      it('should log when max frames reached', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture({ maxFrames: 2 });

        // Capture until max
        jest.advanceTimersByTime(2000);
        await Promise.resolve();
        jest.advanceTimersByTime(1000); // Try one more
        await Promise.resolve();

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('Max frames reached: 2')
        );
      });

      it('should continue capturing when individual frame fails', async () => {
        const mockTakePicture = jest.fn()
          .mockResolvedValueOnce({ uri: 'file://frame1.jpg' })
          .mockRejectedValueOnce(new Error('Capture failed'))
          .mockResolvedValueOnce({ uri: 'file://frame3.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        // Capture 3 frames
        for (let i = 0; i < 3; i++) {
          jest.advanceTimersByTime(1000);
          await Promise.resolve();
        }

        // Should have 2 frames (1 failed)
        expect(service.getFrameCount()).toBe(2);
        expect(service.isCapturing()).toBe(true); // Still capturing
      });

      it('should log error when frame capture fails', async () => {
        const mockTakePicture = jest.fn().mockRejectedValue(new Error('Camera error'));
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        expect(mockConsoleError).toHaveBeenCalledWith(
          expect.stringContaining('Frame capture failed:'),
          'Error'
        );
      });

      it('should handle error when start fails', async () => {
        const mockRef = { current: { takePictureAsync: jest.fn() } };
        service.setCameraRef(mockRef as any);

        // Force an error by mocking setInterval to throw
        const originalSetInterval = global.setInterval;
        global.setInterval = jest.fn().mockImplementation(() => {
          throw new Error('Timer error');
        }) as any;

        const result = await service.startCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Failed to start frame capture.');
        }
        expect(service.getState()).toBe('error');

        // Restore
        global.setInterval = originalSetInterval;
      });
    });

    describe('stopCapture', () => {
      it('should return error when not capturing', async () => {
        const result = await service.stopCapture();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('No capture in progress to stop.');
        }
      });

      it('should stop capture successfully', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        // Capture some frames
        jest.advanceTimersByTime(2000);
        await Promise.resolve();

        const result = await service.stopCapture();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBeInstanceOf(Array);
          expect(result.data.length).toBe(2);
        }
        expect(service.isCapturing()).toBe(false);
        expect(service.getState()).toBe('idle');
      });

      it('should return all captured frames', async () => {
        const mockTakePicture = jest.fn()
          .mockResolvedValueOnce({ uri: 'file://frame1.jpg' })
          .mockResolvedValueOnce({ uri: 'file://frame2.jpg' })
          .mockResolvedValueOnce({ uri: 'file://frame3.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        jest.advanceTimersByTime(3000);
        await Promise.resolve();

        const result = await service.stopCapture();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.length).toBe(3);
          expect(result.data[0].uri).toBe('file://frame1.jpg');
          expect(result.data[1].uri).toBe('file://frame2.jpg');
          expect(result.data[2].uri).toBe('file://frame3.jpg');
        }
      });

      it('should clear capture interval', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();
        await service.stopCapture();

        // Advance time - should not capture more frames
        const frameCountBefore = service.getFrameCount();
        jest.advanceTimersByTime(5000);
        await Promise.resolve();

        expect(service.getFrameCount()).toBe(frameCountBefore);
      });

      it('should handle error when stop fails', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        // Force an error by corrupting state
        (service as any).state = 'capturing';
        (service as any).captureInterval = null; // This will cause clearInterval to be called on null

        const result = await service.stopCapture();

        // Should still succeed even with null interval
        expect(result.success).toBe(true);
      });
    });

    describe('cancelCapture', () => {
      it('should succeed when not capturing', async () => {
        const result = await service.cancelCapture();

        expect(result.success).toBe(true);
      });

      it('should cancel capture successfully', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        const result = await service.cancelCapture();

        expect(result.success).toBe(true);
        expect(service.isCapturing()).toBe(false);
        expect(service.getState()).toBe('idle');
      });

      it('should discard captured frames', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        jest.advanceTimersByTime(2000);
        await Promise.resolve();

        await service.cancelCapture();

        expect(service.getFrameCount()).toBe(0);
        expect(service.getFrames()).toEqual([]);
      });

      it('should clear capture interval', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();
        await service.cancelCapture();

        // Advance time - should not capture more frames
        jest.advanceTimersByTime(5000);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledTimes(0);
      });

      it('should handle error gracefully', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        // Force an error
        const originalClearInterval = global.clearInterval;
        global.clearInterval = jest.fn().mockImplementation(() => {
          throw new Error('Clear error');
        });

        const result = await service.cancelCapture();

        expect(result.success).toBe(true);
        expect(service.getState()).toBe('idle');

        // Restore
        global.clearInterval = originalClearInterval;
      });
    });

    describe('reset', () => {
      it('should reset service to initial state', () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        service.reset();

        expect(service.getState()).toBe('idle');
        expect(service.isCapturing()).toBe(false);
        expect(service.getFrameCount()).toBe(0);
        expect(service.getFrames()).toEqual([]);
      });

      it('should clear interval if capturing', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };
        service.setCameraRef(mockRef as any);

        await service.startCapture();

        service.reset();

        // Advance time - should not capture frames
        jest.advanceTimersByTime(5000);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledTimes(0);
      });

      it('should clear camera ref', () => {
        const mockRef = { current: { takePictureAsync: jest.fn() } };
        service.setCameraRef(mockRef as any);

        service.reset();

        // Try to start - should fail (no camera ref)
        service.startCapture().then(result => {
          expect(result.success).toBe(false);
        });
      });
    });
  });

  describe('Singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(frameCaptureService).toBeInstanceOf(FrameCaptureService);
    });

    it('should maintain state across calls', async () => {
      const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
      const mockRef = { current: { takePictureAsync: mockTakePicture } };
      frameCaptureService.setCameraRef(mockRef as any);

      await frameCaptureService.startCapture();

      expect(frameCaptureService.isCapturing()).toBe(true);
    });

    it('should be the same instance', () => {
      const instance1 = frameCaptureService;
      const instance2 = frameCaptureService;

      expect(instance1).toBe(instance2);
    });
  });

  describe('Standalone functions', () => {
    beforeEach(() => {
      frameCaptureService.reset();
    });

    describe('startCapture', () => {
      it('should use singleton instance', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };

        const result = await startCapture(mockRef as any);

        expect(result.success).toBe(true);
        expect(frameCaptureService.isCapturing()).toBe(true);
      });

      it('should accept options', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };

        await startCapture(mockRef as any, { interval: 2000 });

        // Fast-forward 2000ms
        jest.advanceTimersByTime(2000);
        await Promise.resolve();

        expect(mockTakePicture).toHaveBeenCalledTimes(1);
      });
    });

    describe('stopCapture', () => {
      it('should use singleton instance', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };

        await startCapture(mockRef as any);
        jest.advanceTimersByTime(1000);
        await Promise.resolve();

        const result = await stopCapture();

        expect(result.success).toBe(true);
        expect(frameCaptureService.isCapturing()).toBe(false);
      });
    });

    describe('isCapturing', () => {
      it('should use singleton instance', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };

        expect(isCapturing()).toBe(false);

        await startCapture(mockRef as any);

        expect(isCapturing()).toBe(true);
      });
    });

    describe('getCaptureState', () => {
      it('should use singleton instance', async () => {
        const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
        const mockRef = { current: { takePictureAsync: mockTakePicture } };

        expect(getCaptureState()).toBe('idle');

        await startCapture(mockRef as any);

        expect(getCaptureState()).toBe('capturing');
      });
    });
  });

  describe('Type exports', () => {
    it('should export CaptureState type', () => {
      const state: CaptureState = 'idle';
      expect(state).toBe('idle');
    });

    it('should export CaptureOptions type', () => {
      const options: CaptureOptions = {
        interval: 1000,
        maxFrames: 300,
        quality: 80,
      };
      expect(options.interval).toBe(1000);
    });

    it('should export CapturedFrame type', () => {
      const frame: CapturedFrame = {
        uri: 'file://frame.jpg',
        timestamp: new Date().toISOString(),
        frameIndex: 0,
        capturedAt: new Date().toISOString(),
      };
      expect(frame.uri).toBe('file://frame.jpg');
    });
  });

  describe('Result<T> type compliance', () => {
    it('should return Result with success=true on success', async () => {
      const mockTakePicture = jest.fn().mockResolvedValue({ uri: 'file://frame.jpg' });
      const mockRef = { current: { takePictureAsync: mockTakePicture } };
      const service = new FrameCaptureService();
      service.setCameraRef(mockRef as any);

      const result = await service.startCapture();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result).toHaveProperty('data');
        expect(result.data).toHaveProperty('startedAt');
      }
    });

    it('should return Result with success=false on error', async () => {
      const service = new FrameCaptureService();

      const result = await service.startCapture();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });
  });
});
